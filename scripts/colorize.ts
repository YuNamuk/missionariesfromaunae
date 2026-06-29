// 흑백 초상 → Gemini 이미지 모델로 자연스러운 컬러·복원본 생성.
// 결과는 public/portraits/<id>-color.jpg 로 저장(원본은 그대로 보존).
//   단일 검증:  tsx --env-file=.env.local scripts/colorize.ts avison
//   전체 일괄:  tsx --env-file=.env.local scripts/colorize.ts --all
import { readFile, writeFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const DIR = path.join(process.cwd(), "public", "portraits");

// 역사 인물 초상 — 손상된 흑백/세피아 인쇄본을 '오늘 찍은 사진처럼' 사실적으로 재구성하되,
// 인물의 정체성(얼굴 구조·나이·표정·머리·복장)은 정확히 보존하도록 강하게 지시.
const PROMPT =
  "This is a damaged historical black-and-white or sepia portrait photograph of a real person from the late 19th / early 20th century, " +
  "scanned from an old magazine or print — it has low resolution, halftone dots, scratches, grain, blur and faded tones. " +
  "Reconstruct it into a HIGH-QUALITY, PHOTOREALISTIC COLOR PORTRAIT that looks as if it were taken TODAY with a professional camera: " +
  "tack-sharp focus, fine realistic skin texture and pores, natural studio lighting with soft shadows, lifelike catchlights in the eyes, " +
  "rich natural color (realistic skin tone, hair and fabric colors), and a clean smooth background. " +
  "Fully remove halftone dots, scratches, dust, grain and blur. " +
  "Keep the original camera ANGLE and pose and overall feel, but CROP TO THE SINGLE SUBJECT ONLY: " +
  "remove any oval/vignette frame, decorative border, the blurry surroundings, any partial faces of neighboring people bleeding in from the edges, " +
  "and any printed captions or text. Replace all of that with a clean, smooth, neutral studio background behind the one subject. " +
  "CRITICAL — it must be unmistakably the SAME person: precisely preserve their identity, facial structure and proportions, apparent age, " +
  "gaze and expression, hairstyle, facial hair, and clothing exactly as in the original. " +
  "Do NOT change who they are, do NOT beautify, slim, youthen or alter their features — only restore and enhance the image quality. " +
  "Do NOT add anything that is not clearly in the original: no pipe, cigarette, glasses, hat, or any object in the mouth or hands; " +
  "do NOT modernize the clothing — keep the exact same garments, and if they wear traditional period dress (e.g. Korean hanbok and gat), keep it accurate to the late 19th / early 20th century. " +
  "Output only the restored photograph, framed as a clean head-and-shoulders studio portrait of the single subject.";

// 흑백 정돈본(-bw): 합성/테두리 원본(사진+글귀, 타원, 주변 인물)을 인물만 크롭해
// '안정적인' 흑백 초상으로 정돈. 색은 입히지 않는다(원본 보기용).
const BW_PROMPT =
  "This is a damaged historical photograph of a real person from the late 19th / early 20th century, " +
  "often a composite scan (a portrait beside a block of text/calligraphy, or an oval frame with neighboring faces, or off-center). " +
  "Produce a clean, restored, HIGH-QUALITY BLACK-AND-WHITE (grayscale) head-and-shoulders portrait of the SINGLE main subject only. " +
  "Crop tightly to that one person, centered and upright; REMOVE any adjacent text/calligraphy panel, oval/vignette frame, neighboring partial faces, and clutter, replacing them with a clean neutral grayscale studio background. " +
  "Repair scratches, halftone dots, grain and blur; keep it sharp and photorealistic. " +
  "Keep it strictly BLACK-AND-WHITE / grayscale — do NOT add any color. " +
  "CRITICAL: preserve the person's exact identity, facial features, proportions, age, expression, hairstyle, facial hair, headwear and clothing — do not alter who they are. " +
  "Output only the restored grayscale portrait.";

// 저품질 원본에서 AI가 정체성(특히 성별)을 오인하지 않도록 인물별 보강 힌트.
const HINTS: Record<string, string> = {
  shepping: " IMPORTANT IDENTITY: the subject is a WOMAN — Elisabeth Shepping (서서평), a female missionary nurse with round eyeglasses and center-parted hair, wearing a dark high-collar dress. She is female; render her as a woman and never as a man.",
  seogyeongjo: " IMPORTANT: this is an elderly Korean man (서경조) in traditional late-Joseon dress — white hanbok and a black horsehair gat. He has NOTHING in his mouth — do not add a pipe or cigarette. Keep the clothing authentically traditional (not modern).",
  gilseonju: " IMPORTANT: Korean pastor 길선주 wears a WHITE traditional Korean hanbok/durumagi (off-white/ivory), NOT blue. Color the garment white.",
};

const ext = (id: string) => [".jpg", ".jpeg", ".png"].map((e) => path.join(DIR, id + e));

async function srcFor(id: string, bwMode = false): Promise<{ file: string; mime: string } | null> {
  // 컬러 생성 시 정돈된 흑백본(-bw)이 있으면 그것을 입력으로 — 이미 크롭·중앙정렬돼 결과가 안정적.
  // (단 -bw 생성 모드에서는 원본에서 만들어야 하므로 제외.)
  if (!bwMode) {
    const bw = path.join(DIR, `${id}-bw.jpg`);
    try { await readFile(bw); return { file: bw, mime: "image/jpeg" }; } catch {}
  }
  for (const f of ext(id)) {
    try {
      await readFile(f);
      return { file: f, mime: f.endsWith(".png") ? "image/png" : "image/jpeg" };
    } catch {}
  }
  return null;
}

async function colorizeOne(id: string, bw = false): Promise<"ok" | "skip" | "fail"> {
  const out = path.join(DIR, `${id}-${bw ? "bw" : "color"}.jpg`);
  try { await readFile(out); return "skip"; } catch {}            // 이미 생성됨 → 건너뜀
  const src = await srcFor(id, bw);
  if (!src) { console.log(`· ${id}: 원본 없음`); return "fail"; }
  const b64 = (await readFile(src.file)).toString("base64");

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: (bw ? BW_PROMPT : PROMPT) + (HINTS[id] ?? "") }, { inline_data: { mime_type: src.mime, data: b64 } }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );
  if (!res.ok) {
    console.log(`✗ ${id}: HTTP ${res.status} — ${(await res.text()).slice(0, 240)}`);
    return "fail";
  }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p: { inlineData?: { data?: string } }) => p?.inlineData?.data);
  if (!img) {
    console.log(`✗ ${id}: 이미지 파트 없음 — ${JSON.stringify(data).slice(0, 240)}`);
    return "fail";
  }
  await writeFile(out, Buffer.from(img.inlineData.data, "base64"));
  // Gemini 출력이 1000px대로 크다 → 표시용으로 한 번에 압축(긴 변 640px·품질 72).
  try { execFileSync("sips", ["-Z", "620", "-s", "formatOptions", "72", out], { stdio: "ignore" }); } catch {}
  const kb = Math.round((await readFile(out)).length / 1024);
  console.log(`✓ ${id} → ${path.basename(out)} (${kb}KB)`);
  return "ok";
}

async function main() {
  if (!KEY) { console.error("GEMINI_API_KEY 미설정 (.env.local)"); process.exit(1); }
  // --bw: 흑백 정돈본(-bw) 생성 모드. 나머지 인자는 동일(<id> | --all).
  const bw = process.argv.includes("--bw");
  const rest = process.argv.slice(2).filter((a) => a !== "--bw");
  const arg = rest[0];
  let ids: string[];
  if (arg === "--all") {
    const files = await readdir(DIR);
    ids = [...new Set(files.filter((f) => /\.(jpe?g|png)$/i.test(f) && !/-(color|bw)\./i.test(f)).map((f) => f.replace(/\.(jpe?g|png)$/i, "")))];
  } else if (arg) {
    ids = rest;
  } else {
    console.error("사용법: colorize.ts [--bw] <id...> | [--bw] --all"); process.exit(1);
  }
  console.log(`모델 ${MODEL} · ${bw ? "흑백 정돈본(-bw)" : "컬러본(-color)"} · 대상 ${ids.length}장\n`);
  let ok = 0, skip = 0, fail = 0;
  for (const id of ids) {
    const r = await colorizeOne(id, bw);
    r === "ok" ? ok++ : r === "skip" ? skip++ : fail++;
    if (arg === "--all") await new Promise((s) => setTimeout(s, 1200)); // 레이트리밋 여유
  }
  console.log(`\n완료 — 생성 ${ok} · 건너뜀 ${skip} · 실패 ${fail}`);
}

main();
