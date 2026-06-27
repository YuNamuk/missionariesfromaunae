import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServiceSupabase } from "@/lib/db/supabase";

// 편집 저장 후 ISR 캐시를 즉시 무효화 → 변경이 바로 반영(헤더 속도용 캐시와 양립).
function revalidateSite() {
  revalidatePath("/", "layout");
}

// 허용된 선교사 편집 컬럼만 화이트리스트
const PERSON_COLS = ["name", "name_en", "life", "org", "role", "summary", "photo", "wiki", "burial_place_id", "active_periods"];

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 });

  const db = getServiceSupabase();
  // 토큰으로 사용자 검증 → admins 허용목록에 있는 이메일만
  const { data: userData, error: userErr } = await db.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  const { data: adminRow } = await db.from("app_settings").select("value").eq("key", "admins").single();
  const admins = (adminRow?.value as string[] | undefined)?.map((e) => e.toLowerCase()) ?? [process.env.ADMIN_EMAIL?.toLowerCase()];
  if (userErr || !email || !admins.includes(email)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { kind?: string; person?: Record<string, unknown>; settings?: Record<string, unknown>; admins?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  try {
    if (body.kind === "person" && body.person?.id) {
      const update: Record<string, unknown> = {};
      for (const c of PERSON_COLS) if (c in body.person) update[c] = body.person[c];
      const { error } = await db.from("people").update(update).eq("id", body.person.id);
      if (error) throw error;
      revalidateSite();
      return NextResponse.json({ ok: true });
    }
    if (body.kind === "settings" && body.settings) {
      const rows = Object.entries(body.settings).map(([key, value]) => ({ key, value }));
      const { error } = await db.from("app_settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      revalidateSite();
      return NextResponse.json({ ok: true });
    }
    if (body.kind === "admins" && Array.isArray(body.admins)) {
      // 중복 제거 + 빈값 제거, 자기 자신은 항상 유지
      const list = [...new Set(body.admins.map((e) => e.trim().toLowerCase()).filter(Boolean))];
      if (!list.includes(email)) list.push(email);
      const { error } = await db.from("app_settings").upsert({ key: "admins", value: list }, { onConflict: "key" });
      if (error) throw error;
      return NextResponse.json({ ok: true, admins: list });
    }
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
