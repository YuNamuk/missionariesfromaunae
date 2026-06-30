import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/db/supabase";
import { authRole } from "@/lib/db/admin-auth";
import { atLeast, isEmail, isRole, type Role } from "@/lib/data/roles";

// 편집 저장 후 ISR 캐시를 즉시 무효화 → 변경이 바로 반영(헤더 속도용 캐시와 양립).
function revalidateSite() {
  revalidatePath("/", "layout");
}

// 허용된 선교사 편집 컬럼만 화이트리스트
const PERSON_COLS = ["name", "name_en", "life", "org", "role", "summary", "photo", "wiki", "burial_place_id", "active_periods"];

// 코어 설정 키(연도 범위·용어) — 전체 관리자만 변경 가능.
const isCoreKey = (k: string) => k === "year_min" || k === "year_max" || k.startsWith("term.");

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const db = getServiceSupabase();
  const { email, role } = await authRole(db, token);
  if (!email || !role) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { kind?: string; person?: Record<string, unknown>; settings?: Record<string, unknown>; admins?: string[]; roles?: Record<string, string> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    // ── 사용자 관리(roles) — 전체 관리자 전용 ──
    if (body.kind === "roles" && body.roles && typeof body.roles === "object") {
      if (role !== "super") return NextResponse.json({ error: "전체 관리자만 사용자를 관리할 수 있습니다." }, { status: 403 });
      const next: Record<string, Role> = {};
      for (const [k, v] of Object.entries(body.roles)) {
        const e = k.trim().toLowerCase();
        if (isEmail(e) && isRole(v)) next[e] = v;
      }
      // 본인과 ADMIN_EMAIL은 항상 전체 관리자로 유지(잠김 방지).
      next[email] = "super";
      const envAdmin = process.env.ADMIN_EMAIL?.toLowerCase();
      if (envAdmin) next[envAdmin] = "super";
      const { error } = await db.from("app_settings").upsert({ key: "roles", value: next }, { onConflict: "key" });
      if (error) throw error;
      return NextResponse.json({ ok: true, roles: next });
    }

    // ── 레거시 관리자 목록(admins) — 전체 관리자 전용 ──
    if (body.kind === "admins" && Array.isArray(body.admins)) {
      if (role !== "super") return NextResponse.json({ error: "전체 관리자만 관리할 수 있습니다." }, { status: 403 });
      const list = [...new Set(body.admins.map((e) => e.trim().toLowerCase()).filter(Boolean))];
      if (!list.includes(email)) list.push(email);
      const { error } = await db.from("app_settings").upsert({ key: "admins", value: list }, { onConflict: "key" });
      if (error) throw error;
      return NextResponse.json({ ok: true, admins: list });
    }

    // ── 콘텐츠 편집(person/settings) ──
    // 1단계: 파워 콘텐츠 관리자 이상만 즉시 반영. 콘텐츠 관리자는 2단계(검수 워크플로) 적용 후 활성화.
    if (body.kind === "person" || body.kind === "settings") {
      if (!atLeast(role, "power")) {
        return NextResponse.json({ error: "콘텐츠 관리자 편집 권한은 검수 워크플로(2단계) 적용 후 활성화됩니다." }, { status: 403 });
      }
      if (body.kind === "person" && body.person?.id) {
        const update: Record<string, unknown> = {};
        for (const c of PERSON_COLS) if (c in body.person) update[c] = body.person[c];
        const { error } = await db.from("people").update(update).eq("id", body.person.id);
        if (error) throw error;
        revalidateSite();
        return NextResponse.json({ ok: true });
      }
      if (body.kind === "settings" && body.settings) {
        // 코어 설정(연도·용어)은 전체 관리자만.
        if (Object.keys(body.settings).some(isCoreKey) && role !== "super") {
          return NextResponse.json({ error: "연도·용어 등 코어 설정은 전체 관리자만 변경할 수 있습니다." }, { status: 403 });
        }
        const rows = Object.entries(body.settings).map(([key, value]) => ({ key, value }));
        const { error } = await db.from("app_settings").upsert(rows, { onConflict: "key" });
        if (error) throw error;
        revalidateSite();
        return NextResponse.json({ ok: true });
      }
    }

    return NextResponse.json({ error: "bad request" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
