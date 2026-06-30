import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "@/lib/db/supabase";
import { authRole } from "@/lib/db/admin-auth";
import { atLeast, isEmail, isRole, type Role } from "@/lib/data/roles";
import { isProposableSettingKey, type Proposal } from "@/lib/data/proposals";

// 편집 저장 후 ISR 캐시를 즉시 무효화 → 변경이 바로 반영(헤더 속도용 캐시와 양립).
function revalidateSite() {
  revalidatePath("/", "layout");
}

// 허용된 선교사 편집 컬럼만 화이트리스트
const PERSON_COLS = ["name", "name_en", "life", "org", "role", "summary", "photo", "wiki", "burial_place_id", "active_periods"];

// 코어 설정 키(연도 범위·용어) — 전체 관리자만 변경 가능.
const isCoreKey = (k: string) => k === "year_min" || k === "year_max" || k.startsWith("term.");

type EditBody = { kind?: string; person?: Record<string, unknown>; settings?: Record<string, unknown> };

/** 실제 쓰기(선교사 컬럼 / app_settings). 직접 저장(파워+)·제안 승인 양쪽에서 재사용. */
async function applyChange(db: SupabaseClient, body: EditBody): Promise<void> {
  if (body.kind === "person" && body.person?.id) {
    const update: Record<string, unknown> = {};
    for (const c of PERSON_COLS) if (c in body.person) update[c] = body.person[c];
    const { error } = await db.from("people").update(update).eq("id", body.person.id);
    if (error) throw error;
  } else if (body.kind === "settings" && body.settings) {
    const rows = Object.entries(body.settings).map(([key, value]) => ({ key, value }));
    const { error } = await db.from("app_settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
  }
  revalidateSite();
}

async function readProposals(db: SupabaseClient): Promise<Proposal[]> {
  const { data } = await db.from("app_settings").select("value").eq("key", "proposals").maybeSingle();
  return Array.isArray(data?.value) ? (data!.value as Proposal[]) : [];
}
async function writeProposals(db: SupabaseClient, list: Proposal[]) {
  const { error } = await db.from("app_settings").upsert({ key: "proposals", value: list }, { onConflict: "key" });
  if (error) throw error;
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const db = getServiceSupabase();
  const { email, role } = await authRole(db, token);
  if (!email || !role) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: EditBody & { admins?: string[]; roles?: Record<string, string>; id?: string; note?: string; label?: string };
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

    // ── 제안 승인/반려/삭제 — 파워 이상 ──
    if (body.kind === "proposal-approve" || body.kind === "proposal-reject" || body.kind === "proposal-delete") {
      if (!atLeast(role, "power")) return NextResponse.json({ error: "검수 권한이 없습니다." }, { status: 403 });
      const list = await readProposals(db);
      const p = list.find((x) => x.id === body.id);
      if (!p) return NextResponse.json({ error: "제안을 찾을 수 없습니다." }, { status: 404 });
      if (body.kind === "proposal-delete") {
        await writeProposals(db, list.filter((x) => x.id !== body.id));
        return NextResponse.json({ ok: true });
      }
      if (body.kind === "proposal-approve") {
        await applyChange(db, { kind: p.kind, person: p.person, settings: p.settings });
        p.status = "approved";
      } else {
        p.status = "rejected";
        if (typeof body.note === "string") p.note = body.note;
      }
      p.reviewedBy = email;
      p.reviewedAt = new Date().toISOString();
      await writeProposals(db, list);
      return NextResponse.json({ ok: true });
    }

    // ── 콘텐츠 편집(person/settings) ──
    if (body.kind === "person" || body.kind === "settings") {
      const isSettings = body.kind === "settings";
      // 콘텐츠 관리자: 허용 범위만 '제안'으로 적재(즉시 반영 아님).
      if (role === "content") {
        if (isSettings) {
          const keys = Object.keys(body.settings ?? {});
          if (keys.length === 0 || !keys.every(isProposableSettingKey)) {
            return NextResponse.json({ error: "이 항목은 제안할 수 없습니다(콘텐츠·번역·주제만 가능)." }, { status: 403 });
          }
        } else if (!body.person?.id) {
          return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
        }
        const list = await readProposals(db);
        const proposal: Proposal = {
          id: Date.now().toString(36) + Math.round(Math.random() * 1e6).toString(36),
          kind: body.kind,
          ...(body.person ? { person: body.person } : {}),
          ...(body.settings ? { settings: body.settings } : {}),
          label: body.label || (isSettings ? Object.keys(body.settings ?? {}).join(", ") : `${(body.person?.name as string) || body.person?.id} — 선교사 정보`),
          author: email,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        await writeProposals(db, [proposal, ...list]);
        return NextResponse.json({ ok: true, queued: true });
      }
      // 파워/전체 관리자: 즉시 반영.
      if (!atLeast(role, "power")) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
      if (isSettings && Object.keys(body.settings ?? {}).some(isCoreKey) && role !== "super") {
        return NextResponse.json({ error: "연도·용어 등 코어 설정은 전체 관리자만 변경할 수 있습니다." }, { status: 403 });
      }
      await applyChange(db, body);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "bad request" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
