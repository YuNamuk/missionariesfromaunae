import { getServiceSupabase } from "../lib/db/supabase";
// 캡션 기반 명백 오답 제외(동명이인·무관·비초상). 본인 가능성 있는 건 pending 유지(사람 최종 채택).
const REJECT: Record<string, number[]> = {
  allen: [4],
  appenzeller: [1, 5],
  sherwoodhall: [0, 1],
  reynolds: [0, 2, 3, 4, 5, 6, 7, 8, 9],
  schofield: [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  hhunderwood: [0, 1, 2, 3, 4, 5, 6, 7],
  linton: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  maclay: [3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  noble: [0, 1, 2, 3, 4, 5, 6, 7],
  fenwick: [0],
};
async function main() {
  const db = getServiceSupabase();
  const { data } = await db.from("app_settings").select("value").eq("key", "review").maybeSingle();
  const review = (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, string>;
  let n = 0;
  for (const [pid, idxs] of Object.entries(REJECT)) for (const i of idxs) { review[`g:${pid}:${i}`] = "rejected"; n++; }
  await db.from("app_settings").upsert({ key: "review", value: review }, { onConflict: "key" });
  console.log(`제외 처리: ${n}건`);
}
main();
