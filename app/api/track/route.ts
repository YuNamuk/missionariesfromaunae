import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/db/supabase";

export const runtime = "nodejs";

// 하루 방문자수 카운터 — app_settings의 key: stats.daily 에 {YYYY-MM-DD: count} 누적.
// 방문자 중복은 클라이언트(브라우저)에서 하루 1회만 호출하도록 제한(근사 순방문자).
export async function POST() {
  try {
    const db = getServiceSupabase();
    const { data } = await db.from("app_settings").select("value").eq("key", "stats.daily").single();
    const stats = (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, number>;
    const today = new Date().toISOString().slice(0, 10); // KST 자정 기준은 아니지만 일 단위 근사로 충분
    stats[today] = (stats[today] || 0) + 1;
    // 최근 180일만 보존
    const keys = Object.keys(stats).sort();
    while (keys.length > 180) { const k = keys.shift(); if (k) delete stats[k]; }
    await db.from("app_settings").upsert({ key: "stats.daily", value: stats }, { onConflict: "key" });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
