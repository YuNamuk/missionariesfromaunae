// 인물별 Wikimedia Commons 카테고리에서 PD/CC 사진을 모아 lib/data/gallery.ts 를 생성한다.
// 카테고리 소속 파일 = 그 인물로 분류된 검증본이라 오귀속 위험이 낮다(그래도 결과는 사람이 검수).
//   tsx scripts/gallery-fetch.ts
import { writeFile } from "node:fs/promises";
import path from "node:path";

// id → Commons 카테고리명(정확한 표기). 없는 카테고리는 0장으로 건너뜀.
const CONFIG: Record<string, string> = {
  underwood: "Horace Grant Underwood",
  appenzeller: "Henry Gerhard Appenzeller",
  allen: "Horace Newton Allen",
  avison: "Oliver R. Avison",
  hulbert: "Homer Hulbert",
  moffett: "Samuel Austin Moffett",
  gale: "James Scarth Gale",
  rosetta: "Rosetta Sherwood Hall",
  heron: "John W. Heron",
  wjhall: "William James Hall",
  ross: "John Ross (missionary)",
  hardie: "Robert A. Hardie",
};

const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const titleCaption = (t: string) => t.replace(/^File:/, "").replace(/\.(jpe?g|png|gif)$/i, "").replace(/[_-]+/g, " ").trim();

type Entry = { src: string; caption: string; source: string; sourceUrl?: string };

async function fetchCategory(cat: string): Promise<Entry[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=${encodeURIComponent("Category:" + cat)}&gcmtype=file&gcmlimit=40&prop=imageinfo&iiprop=url%7Cmime%7Cextmetadata&iiurlwidth=640&format=json`;
  const res = await fetch(url, { headers: { "user-agent": "missionaries-archive/1.0 (educational; contact via site)" } });
  if (!res.ok) { console.log(`  ✗ HTTP ${res.status}`); return []; }
  const data = await res.json();
  const pages = (data?.query?.pages ?? {}) as Record<string, { title: string; imageinfo?: { url: string; thumburl?: string; mime?: string; descriptionurl?: string; extmetadata?: Record<string, { value: string }> }[] }>;
  const out: Entry[] = [];
  for (const p of Object.values(pages)) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime ?? "")) continue; // 사진만(PDF·SVG 제외)
    const em = ii.extmetadata ?? {};
    const lic = strip(em.LicenseShortName?.value ?? "");
    const isFree = /public domain|^cc|^pd|no restrictions/i.test(lic) || /PD/i.test(strip(em.UsageTerms?.value ?? ""));
    if (!isFree) continue; // PD/CC만
    const descRaw = strip(em.ImageDescription?.value ?? "");
    const caption = descRaw && descRaw.length <= 110 ? descRaw : titleCaption(p.title);
    out.push({
      src: ii.thumburl || ii.url,
      caption,
      source: `Wikimedia Commons · ${lic || "PD"}`,
      sourceUrl: ii.descriptionurl,
    });
  }
  return out;
}

async function main() {
  const GALLERY: Record<string, Entry[]> = {};
  for (const [id, cat] of Object.entries(CONFIG)) {
    process.stdout.write(`${id} (${cat}) ... `);
    try {
      const entries = await fetchCategory(cat);
      if (entries.length) { GALLERY[id] = entries; console.log(`${entries.length}장`); }
      else console.log("0장(건너뜀)");
    } catch (e) { console.log("오류:", String(e).slice(0, 80)); }
    await new Promise((s) => setTimeout(s, 400));
  }
  const body =
    `// 인물별 '원본 사진 모음' — scripts/gallery-fetch.ts 로 Wikimedia Commons 카테고리에서 수집(PD/CC).\n` +
    `// 카테고리 소속 = 본인 확인. 표시 후 사람이 검수하여 오귀속·중복을 정리한다.\n` +
    `export type GalleryPhoto = { src: string; caption: string; source: string; sourceUrl?: string };\n\n` +
    `export const GALLERY: Record<string, GalleryPhoto[]> = ${JSON.stringify(GALLERY, null, 2)};\n\n` +
    `export const galleryFor = (id: string): GalleryPhoto[] => GALLERY[id] ?? [];\n`;
  await writeFile(path.join(process.cwd(), "lib", "data", "gallery.ts"), body);
  console.log(`\n생성 완료 — 인물 ${Object.keys(GALLERY).length}명, 총 ${Object.values(GALLERY).reduce((a, b) => a + b.length, 0)}장`);
}

main();
