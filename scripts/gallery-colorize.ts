// 갤러리(원본 사진 모음) 이미지를 인물 초상과 '같은 톤'으로 컬러 복원한다.
// 단 단체·현장 사진이 많으므로 '장면 보존' 프롬프트 — 구도·모든 인물을 그대로 두고 색만 입힌다.
// 결과는 public/portraits/gallery/<id>-<n>-color.jpg 로 자체 호스팅하고 gallery.ts에 srcColor를 기록.
//   tsx --env-file=.env.local scripts/gallery-colorize.ts [id]   (id 생략 시 전체)
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { GALLERY, type GalleryPhoto } from "../lib/data/gallery";
import { getServiceSupabase } from "../lib/db/supabase";

// 검수 재작업 사유(app_settings rework)를 읽어, 해당 사진 컬러화 시 프롬프트에 그대로 반영.
let REWORK: Record<string, string> = {};
let REVIEW: Record<string, string> = {};
async function loadRework() {
  try {
    const db = getServiceSupabase();
    const a = await db.from("app_settings").select("value").eq("key", "rework").maybeSingle();
    if (a.data?.value && typeof a.data.value === "object") REWORK = a.data.value as Record<string, string>;
    const b = await db.from("app_settings").select("value").eq("key", "review").maybeSingle();
    if (b.data?.value && typeof b.data.value === "object") REVIEW = b.data.value as Record<string, string>;
  } catch {}
}

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const DIR = path.join(process.cwd(), "public", "portraits", "gallery");

const SCENE_PROMPT =
  "RESTORE and COLORIZE this damaged historical black-and-white or sepia photograph (late 19th / early 20th century Korea). " +
  "Repair the damage: remove scratches, dust, spots, stains, tears, creases, foxing and blotches; reduce heavy grain, noise and blur; recover faded or degraded tonal areas — produce a CLEAN, SHARP, naturally restored photograph as if freshly printed today. " +
  "Add realistic, natural, period-appropriate color to EVERYTHING — every face, all skin, hair, clothing, objects and the whole background — applied UNIFORMLY; no region may stay grey/sepia/uncolored. " +
  "CRITICAL — restore the QUALITY but stay 100% faithful to the real CONTENT and IDENTITY: do NOT add, remove, move, duplicate or invent ANY person, face, object, building, wall, furniture or background element; do NOT crop, reframe, zoom or change the aspect ratio (a clean restored border is fine). " +
  "Preserve every person's exact identity, ethnicity, face, pose, expression and clothing (a Western/Caucasian face stays Western; Korean stays Korean). If someone wears traditional Korean dress (gat hat / hanbok), keep those exact garments — do not modernize them and do not add a hat or dress to anyone who is not already wearing one. " +
  "NEVER add anything to anyone's mouth or hands: no pipe, cigarette, cigar, tobacco, smoke, glasses, or any object not clearly present in the original. Keep mouths, beards and hands as they are. " +
  "Only where the photo is genuinely damaged or missing, reconstruct plausibly and consistently with the surrounding real content. Output the SAME scene and framing — restored, repaired and in full natural color.";

// 개별 사진 보강 힌트(재작업 사유와 함께 프롬프트에 덧붙임). 반복 환각 방지용.
const HINTS: Record<string, string> = {
  "seogyeongjo:0": " CRITICAL FOR THIS IMAGE: the elderly man has NOTHING in his mouth. Do NOT add or draw any pipe, cigarette, cigar, tobacco or smoke near his mouth or long white beard — that area must stay exactly as in the original. Add no objects at all. His robe (durumagi/hanbok) must be WHITE / ivory — NOT blue or indigo; color the garment white. Keep the gat hat black.",
};

type Entry = GalleryPhoto & { srcColor?: string };

async function colorizeEntry(id: string, e: Entry, n: number): Promise<boolean> {
  const out = path.join(DIR, `${id}-${n}-color.jpg`);
  const rel = `/portraits/gallery/${id}-${n}-color.jpg`;
  try { await readFile(out); e.srcColor = rel; return false; } catch {} // 이미 있음
  // 원본 풀해상도 우선(썸네일은 정보 유실). Commons 썸네일 URL → 원본 URL로 환원,
  // 너무 크면(>9MB) 1600px → 마지막에 저장된 썸네일 순으로 폴백.
  const orig = e.src.includes("/commons/thumb/")
    ? e.src.replace("/commons/thumb/", "/commons/").replace(/\/\d+px-[^/]+$/, "")
    : e.src;
  const big = e.src.replace(/\/(\d+)px-/, "/2000px-");
  const candidates = [...new Set([orig, big, e.src])];
  let buf: Buffer | null = null, mime = "image/jpeg";
  for (let c = 0; c < candidates.length; c++) {
    const u = candidates[c];
    try {
      const r = await fetch(u, { headers: { "user-agent": "missionaries-archive/1.0 (educational)" } });
      if (!r.ok) continue;
      const b = Buffer.from(await r.arrayBuffer());
      if (b.length > 9_000_000 && c < candidates.length - 1) continue; // 너무 크면 다음(작은) 후보
      buf = b; mime = r.headers.get("content-type")?.split(";")[0] || (u.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
      break;
    } catch {}
  }
  if (!buf) { console.log(`  ✗ ${id}#${n}: 원본 다운로드 실패`); return false; }

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: SCENE_PROMPT + (HINTS[`${id}:${n}`] ?? "") + (REWORK[`g:${id}:${n}`] ? ` ADDITIONAL FIX REQUESTED BY REVIEWER (address this specifically): ${REWORK[`g:${id}:${n}`]}` : "") }, { inline_data: { mime_type: mime, data: buf.toString("base64") } }] }],
      generationConfig: { responseModalities: ["IMAGE"] },
    }),
  });
  if (!res.ok) { console.log(`  ✗ ${id}#${n}: HTTP ${res.status} ${(await res.text()).slice(0, 160)}`); return false; }
  const data = await res.json();
  const part = (data?.candidates?.[0]?.content?.parts ?? []).find((p: { inlineData?: { data?: string } }) => p?.inlineData?.data);
  if (!part) { console.log(`  ✗ ${id}#${n}: 이미지 없음 ${JSON.stringify(data).slice(0, 160)}`); return false; }
  await writeFile(out, Buffer.from(part.inlineData.data, "base64"));
  try { execFileSync("sips", ["-Z", "720", "-s", "formatOptions", "62", out], { stdio: "ignore" }); } catch {}
  const kb = Math.round((await readFile(out)).length / 1024);
  e.srcColor = rel;
  console.log(`  ✓ ${id}#${n} → ${path.basename(out)} (${kb}KB)`);
  return true;
}

async function main() {
  if (!KEY) { console.error("GEMINI_API_KEY 미설정"); process.exit(1); }
  await mkdir(DIR, { recursive: true });
  await loadRework();
  // --approved: 검수에서 '채택'됐고 아직 컬러본이 없는 후보만 컬러화(자동 루프용).
  const approvedMode = process.argv.includes("--approved");
  const only = process.argv.slice(2).find((a) => !a.startsWith("--"));
  const ids = only ? [only] : Object.keys(GALLERY);
  let done = 0;
  for (const id of ids) {
    const list = (GALLERY[id] ?? []) as Entry[];
    if (!list.length) continue;
    if (!approvedMode) console.log(`${id} (${list.length}장)`);
    for (let i = 0; i < list.length; i++) {
      if (approvedMode && (REVIEW[`g:${id}:${i}`] !== "approved" || list[i].srcColor)) continue;
      const r = await colorizeEntry(id, list[i], i);
      if (r) done++;
      await new Promise((s) => setTimeout(s, 1200));
    }
  }
  if (approvedMode) console.log(`채택 후보 컬러화 — 신규 ${done}장`);
  if (done === 0) { console.log("변경 없음 — gallery.ts 미수정"); return; } // 잡음 diff 방지
  // gallery.ts 재작성(srcColor 포함)
  const body =
    `// 인물별 '원본 사진 모음' — Wikimedia Commons 카테고리에서 수집(PD/CC). 카테고리 소속 = 본인 확인.\n` +
    `// srcColor: 같은 톤으로 장면 보존 컬러 복원본(scripts/gallery-colorize.ts, 자체 호스팅).\n` +
    `export type GalleryPhoto = { src: string; caption: string; source: string; sourceUrl?: string; srcColor?: string };\n\n` +
    `export const GALLERY: Record<string, GalleryPhoto[]> = ${JSON.stringify(GALLERY, null, 2)};\n\n` +
    `export const galleryFor = (id: string): GalleryPhoto[] => GALLERY[id] ?? [];\n`;
  await writeFile(path.join(process.cwd(), "lib", "data", "gallery.ts"), body);
  console.log("gallery.ts 갱신 완료");
}

main();
