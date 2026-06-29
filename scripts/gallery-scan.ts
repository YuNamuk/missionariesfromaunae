// 전체 선교사 자동 스캔 — 인물명으로 Commons 파일을 폭넓게 검색해 '후보'로 적재한다.
// 후보는 공개되지 않고(검수에서 '채택'해야 공개), 채택분만 나중에 컬러화한다.
// 텍스트 검색이라 동명이의·비초상이 섞일 수 있으므로 사람이 검수 탭에서 골라낸다.
//   tsx scripts/gallery-scan.ts            (전체)
//   tsx scripts/gallery-scan.ts 12         (앞 12명만 — 검증용)
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { GALLERY } from "../lib/data/gallery";
import { PEOPLE } from "../lib/data";

const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const titleCap = (t: string) => t.replace(/^File:/, "").replace(/\.(jpe?g|png)$/i, "").replace(/[_-]+/g, " ").trim();
// 비초상(건물·문서·기념물·친족·우표 등) 추정 제외.
const SKIP = /grab|grave|묘|tomb|동상|bronze|statue|기념|memorial|granddaughter|grandson|손녀|손자|advocate|herald\b|congress|building|\bhall\b|university|campus|\bmap\b|지도|seal|christmas|tuberculosis|결핵|sanatorium|cover|\bpage\b|letter|document|stamp|우표|\bbook\b|병원|hospital|학교|school|교회|church|residence|dormitory|stadium|station|bridge/i;

type Entry = { src: string; caption: string; source: string; sourceUrl?: string; srcColor?: string };

async function searchFiles(name: string): Promise<Entry[]> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name)}&gsrnamespace=6&gsrlimit=14&prop=imageinfo&iiprop=url%7Cmime%7Cextmetadata&iiurlwidth=640&format=json`;
  const res = await fetch(url, { headers: { "user-agent": "missionaries-archive/1.0 (educational)" } });
  if (!res.ok) return [];
  const data = await res.json();
  const pages = (data?.query?.pages ?? {}) as Record<string, { title: string; imageinfo?: { url: string; thumburl?: string; mime?: string; descriptionurl?: string; extmetadata?: Record<string, { value: string }> }[] }>;
  const out: Entry[] = [];
  for (const p of Object.values(pages)) {
    const ii = p.imageinfo?.[0];
    if (!ii || !/^image\/(jpeg|png)$/.test(ii.mime ?? "")) continue;
    const em = ii.extmetadata ?? {};
    const lic = strip(em.LicenseShortName?.value ?? "");
    const free = /public domain|^cc|^pd|no restrictions/i.test(lic) || /PD/i.test(strip(em.UsageTerms?.value ?? ""));
    if (!free) continue;
    const desc = strip(em.ImageDescription?.value ?? "");
    const caption = desc && desc.length <= 110 ? desc : titleCap(p.title);
    if (SKIP.test(caption) || SKIP.test(p.title)) continue;
    out.push({ src: ii.thumburl || ii.url, caption, source: `Wikimedia Commons · ${lic || "PD"}`, sourceUrl: ii.descriptionurl });
  }
  return out;
}

async function main() {
  const limit = Number(process.argv[2]) || PEOPLE.length;
  const out: Record<string, Entry[]> = { ...(GALLERY as Record<string, Entry[]>) };
  let added = 0;
  for (const p of (PEOPLE as { id: string; name: string; en: string; country: string }[]).slice(0, limit)) {
    const existing = out[p.id] ?? [];
    const seen = new Set(existing.map((e) => e.src));
    const queries = p.country === "조선" ? [p.name] : [p.en, p.name];
    const found: Entry[] = [];
    for (const q of queries) {
      try { found.push(...await searchFiles(q)); } catch {}
      await new Promise((s) => setTimeout(s, 700));
    }
    // 쿼리 간 중복 + 기존 중복 제거
    const fresh: Entry[] = [];
    for (const e of found) { if (!seen.has(e.src) && !fresh.some((x) => x.src === e.src)) fresh.push(e); }
    if (fresh.length) { out[p.id] = [...existing, ...fresh]; added += fresh.length; }
    console.log(`${p.id} (${p.en}) … +${fresh.length} (누적 ${out[p.id]?.length ?? 0})`);
  }
  const body = ("// 인물별 '원본 사진 모음' — Commons 자동 스캔(scripts/gallery-scan.ts) + 카테고리 수집. 후보는 검수 '채택' 전까지 비공개.\n" +
    "// srcColor: 채택 후 같은 톤 컬러 복원본(scripts/gallery-colorize.ts).\n" +
    "export type GalleryPhoto = { src: string; caption: string; source: string; sourceUrl?: string; srcColor?: string };\n\n" +
    "export const GALLERY: Record<string, GalleryPhoto[]> = " + JSON.stringify(out, null, 2) + ";\n\n" +
    "export const galleryFor = (id: string): GalleryPhoto[] => GALLERY[id] ?? [];\n");
  await writeFile(path.join(process.cwd(), "lib", "data", "gallery.ts"), body);
  const ppl = Object.values(out).filter((a) => a.length).length;
  console.log(`\n스캔 완료 — 신규 후보 ${added}장, 갤러리 보유 인물 ${ppl}명, 총 ${Object.values(out).reduce((a, b) => a + b.length, 0)}장`);
}

main();
