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
async function loadRework() {
  try {
    const { data } = await getServiceSupabase().from("app_settings").select("value").eq("key", "rework").maybeSingle();
    if (data?.value && typeof data.value === "object") REWORK = data.value as Record<string, string>;
  } catch {}
}

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const DIR = path.join(process.cwd(), "public", "portraits", "gallery");

const SCENE_PROMPT =
  "Restore and naturally colorize this historical black-and-white or sepia photograph from the late 19th / early 20th century. " +
  "CRITICAL: preserve the ENTIRE original composition and framing, and EVERY person/subject in it, exactly as they are — " +
  "do NOT crop, do NOT remove or add any person or object, do NOT change anyone's identity, face, pose, clothing, expression, or the background/setting. " +
  "Only repair scratches, dust, grain and blur, gently improve clarity, and add realistic, period-appropriate natural color (skin tones, fabrics, surroundings). " +
  "The OUTPUT MUST BE IN FULL NATURAL COLOR — never leave it black-and-white, grayscale or sepia. Apply color UNIFORMLY and COMPLETELY across the ENTIRE image — every face, all skin, hair, clothing, objects and the whole background — NOT only the face or part of the image; no region may stay grey/sepia/uncolored. If the photo sits inside a printed page with a caption, crop out the surrounding paper and caption text so only the photograph itself remains. " +
  "CONTEXT: these people lived in late-Joseon Korea (1880s–1930s). If anyone wears traditional Korean dress, render it AUTHENTICALLY: a round wide-brimmed black hat is a Korean 'gat' (갓, a translucent horsehair hat) — NOT a modern Western hat, bowler, fedora or derby; robes are white/ivory hanbok or durumagi — NOT a modern suit or dress shirt. Preserve the exact traditional garments and headwear; never modernize them. " +
  "CRUCIAL: many subjects are WESTERN/foreign missionaries who are merely wearing Korean dress — keep their ACTUAL ethnicity and exact facial features unchanged (a Western/Caucasian face stays Western; do NOT make them look Korean). Only the clothing is Korean, not the person. " +
  "Keep it photorealistic and historically faithful, not stylized. Output the full restored image at the same framing and aspect ratio.";

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
      contents: [{ parts: [{ text: SCENE_PROMPT + (REWORK[`g:${id}:${n}`] ? ` ADDITIONAL FIX REQUESTED BY REVIEWER (address this specifically): ${REWORK[`g:${id}:${n}`]}` : "") }, { inline_data: { mime_type: mime, data: buf.toString("base64") } }] }],
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
  const only = process.argv[2];
  const ids = only ? [only] : Object.keys(GALLERY);
  for (const id of ids) {
    const list = (GALLERY[id] ?? []) as Entry[];
    if (!list.length) continue;
    console.log(`${id} (${list.length}장)`);
    for (let i = 0; i < list.length; i++) {
      await colorizeEntry(id, list[i], i);
      await new Promise((s) => setTimeout(s, 1200));
    }
  }
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
