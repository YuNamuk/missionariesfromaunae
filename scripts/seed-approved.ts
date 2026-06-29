// 현재 갤러리(검증 완료된 7명)를 review='approved'로 시드 — 게이팅(공개=채택분) 전환 시 유지.
import { getServiceSupabase } from "../lib/db/supabase";
import { GALLERY } from "../lib/data/gallery";
async function main() {
  const db = getServiceSupabase();
  const { data } = await db.from("app_settings").select("value").eq("key", "review").maybeSingle();
  const review = (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, string>;
  let n = 0;
  for (const [id, arr] of Object.entries(GALLERY)) arr.forEach((_, i) => { const k = `g:${id}:${i}`; if (!review[k]) { review[k] = "approved"; n++; } });
  await db.from("app_settings").upsert({ key: "review", value: review }, { onConflict: "key" });
  console.log(`채택 시드: +${n}건 (총 ${Object.keys(review).length}건)`);
}
main();
