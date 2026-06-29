// 검수에서 '제외(rejected)'된 후보를 gallery.ts에서 완전 삭제하고, 남은 항목을 재인덱싱.
// review 키(g:<id>:<n>)도 새 인덱스로 재매핑(approved/pending 유지, rejected 삭제).
import { GALLERY } from "../lib/data/gallery";
import { getServiceSupabase } from "../lib/db/supabase";
import { writeFile } from "node:fs/promises";
import path from "node:path";
type G = { src: string; caption: string; source: string; sourceUrl?: string; srcColor?: string };
async function main() {
  const db = getServiceSupabase();
  const { data } = await db.from("app_settings").select("value").eq("key", "review").maybeSingle();
  const review = (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, string>;
  const newG: Record<string, G[]> = {};
  const newR: Record<string, string> = {};
  let removed = 0;
  for (const [pid, arr] of Object.entries(GALLERY as Record<string, G[]>)) {
    const kept: { g: G; st?: string }[] = [];
    arr.forEach((g, i) => { const st = review[`g:${pid}:${i}`]; if (st === "rejected") { removed++; return; } kept.push({ g, st }); });
    if (kept.length) { newG[pid] = kept.map((k) => k.g); kept.forEach((k, j) => { if (k.st) newR[`g:${pid}:${j}`] = k.st; }); }
  }
  const body = ("// 인물별 '원본 사진 모음' — 자동 스캔(gallery-scan)+검수. 제외분은 삭제·재인덱싱(gallery-compact).\n" +
    "// srcColor: 채택 후 컬러 복원본(gallery-colorize). 공개는 검수 '채택'분만.\n" +
    "export type GalleryPhoto = { src: string; caption: string; source: string; sourceUrl?: string; srcColor?: string };\n\n" +
    "export const GALLERY: Record<string, GalleryPhoto[]> = " + JSON.stringify(newG, null, 2) + ";\n\n" +
    "export const galleryFor = (id: string): GalleryPhoto[] => GALLERY[id] ?? [];\n");
  await writeFile(path.join(process.cwd(), "lib", "data", "gallery.ts"), body);
  await db.from("app_settings").upsert({ key: "review", value: newR }, { onConflict: "key" });
  console.log(`삭제 ${removed}장 · 남은 인물 ${Object.keys(newG).length}명 · 총 ${Object.values(newG).reduce((a,b)=>a+b.length,0)}장 · review ${Object.keys(newR).length}건`);
}
main();
