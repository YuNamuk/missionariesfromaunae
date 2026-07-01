// 주제연구 '심화 컬럼'용 장면 삽화 생성(텍스트→이미지, Gemini).
// 사진이 아니라 '회화 일러스트'임이 분명하도록 수채/과슈 스타일로 그리고,
// 실존 인물의 얼굴을 날조하지 않도록 인물은 원경·뒷모습·실루엣으로만 둔다. [[person-add-pipeline]]
//   tsx --env-file=.env.local scripts/illustrate.ts <outName> "<scene prompt>"
import { writeFile, readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const DIR = path.join(process.cwd(), "public", "research-img");

// 공통 스타일 — 명백히 '삽화'로 보이도록(사진 오인 방지), 시대·지역 고증 유지.
const STYLE =
  "Create a SOFT WATERCOLOR-AND-GOUACHE HISTORICAL ILLUSTRATION (clearly a hand-painted artwork, NOT a photograph): " +
  "muted earthy palette, gentle washes, visible paper texture, painterly edges, warm archival tone. " +
  "Setting: late-19th / early-20th century KOREA (Joseon, 1890s–1920s), Jeolla/Honam region. " +
  "Architecture must be AUTHENTIC: Korean hanok with tiled or thatched roofs, low stone walls, harbor with wooden boats, pine-covered hills. " +
  "Any Korean people wear white hanbok and (men) a black horsehair 'gat'. Any Western missionary figure must be SMALL, DISTANT, or seen from BEHIND — do NOT render a recognizable individual face (this is illustrative, not a portrait of a real person). " +
  "No text, no captions, no lettering, no modern objects (cars, power lines, plastic). Quiet, reverent, documentary mood. Wide establishing composition. ";

async function main() {
  const [outName, scene] = process.argv.slice(2);
  if (!outName || !scene) { console.error('사용법: illustrate.ts <outName> "<scene>"'); process.exit(1); }
  if (!KEY) { console.error("GEMINI_API_KEY 미설정"); process.exit(1); }
  const out = path.join(DIR, `${outName}.jpg`);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: STYLE + "SCENE: " + scene }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );
  if (!res.ok) { console.error(`HTTP ${res.status}: ${(await res.text()).slice(0, 240)}`); process.exit(1); }
  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const img = parts.find((p: { inlineData?: { data?: string } }) => p?.inlineData?.data);
  if (!img) { console.error("이미지 파트 없음: " + JSON.stringify(data).slice(0, 240)); process.exit(1); }
  await writeFile(out, Buffer.from(img.inlineData.data, "base64"));
  try { execFileSync("sips", ["-Z", "1000", "-s", "formatOptions", "72", out], { stdio: "ignore" }); } catch {}
  const kb = Math.round((await readFile(out)).length / 1024);
  console.log(`✓ ${outName} → ${path.basename(out)} (${kb}KB)`);
}
main().catch((e) => { console.error(e); process.exit(1); });
