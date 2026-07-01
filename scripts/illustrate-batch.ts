// 삽화 일괄 생성 — [{id,prompt}] JSON을 읽어 각 장면을 회화체 일러스트로 생성.
// 사진 오인 방지(수채/과슈), 실존 인물 얼굴 날조 방지(인물은 원경·뒷모습). [[research-column-pipeline]]
//   tsx --env-file=.env.local scripts/illustrate-batch.ts <specsJsonPath>
import { readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const DIR = path.join(process.cwd(), "public", "research-img");

const STYLE =
  "Create a SOFT WATERCOLOR-AND-GOUACHE HISTORICAL ILLUSTRATION (clearly a hand-painted artwork, NOT a photograph): " +
  "muted earthy palette, gentle washes, visible paper texture, painterly edges, warm archival tone. " +
  "Period: late-19th / early-20th century (1870s–1930s). Render the place described AUTHENTICALLY and period-accurately. " +
  "When in KOREA (Joseon): hanok with tiled/thatched roofs, low stone walls, wooden harbor boats, pine hills; Korean people in white hanbok, men in a black horsehair 'gat'. " +
  "ALL human figures must be SMALL, DISTANT, or seen from BEHIND — do NOT render a recognizable individual face (illustrative, not a portrait of any real person). " +
  "No text, no captions, no lettering, no modern objects. Quiet, reverent, documentary mood. Wide establishing composition. ";

async function exists(p: string) { try { await readFile(p); return true; } catch { return false; } }

async function one(id: string, scene: string): Promise<string> {
  const out = path.join(DIR, `${id}.jpg`);
  if (await exists(out)) return "skip";
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: STYLE + "SCENE: " + scene }] }], generationConfig: { responseModalities: ["IMAGE"] } }),
  });
  if (!res.ok) { console.log(`✗ ${id}: HTTP ${res.status}`); return "fail"; }
  const data = await res.json();
  const img = (data?.candidates?.[0]?.content?.parts ?? []).find((p: { inlineData?: { data?: string } }) => p?.inlineData?.data);
  if (!img) { console.log(`✗ ${id}: 이미지 없음`); return "fail"; }
  await writeFile(out, Buffer.from(img.inlineData.data, "base64"));
  try { execFileSync("sips", ["-Z", "980", "-s", "format", "jpeg", "-s", "formatOptions", "66", out, "--out", out], { stdio: "ignore" }); } catch {}
  console.log(`✓ ${id}`);
  return "ok";
}

async function main() {
  const specs = JSON.parse(await readFile(process.argv[2], "utf8")) as { id: string; prompt: string }[];
  let ok = 0, skip = 0, fail = 0;
  for (const s of specs) {
    if (!s?.id || !s?.prompt) continue;
    const r = await one(s.id, s.prompt);
    if (r === "ok") ok++; else if (r === "skip") skip++; else fail++;
  }
  console.log(`\n삽화 완료 — 생성 ${ok} · 건너뜀 ${skip} · 실패 ${fail}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
