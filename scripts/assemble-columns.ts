// 워크플로 집필 결과(scratchpad/col-<personId>.json)를 모아 lib/data/columns.generated.json 생성.
// 내용은 에이전트가 각 파일에 ResearchColumn JSON으로 써 둔다. 여기선 검증·정렬·병합만.
//   tsx scripts/assemble-columns.ts <scratchpadDir>
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dir = process.argv[2];
if (!dir) { console.error("사용법: assemble-columns.ts <scratchpadDir>"); process.exit(1); }

const ORDER = ["underwood", "hulbert", "mscranton", "appenzeller", "shepping", "rosetta", "gale", "sharp"];
const files = readdirSync(dir).filter((f) => /^col-.+\.json$/.test(f));
const cols: Record<string, unknown> = {};
for (const f of files) {
  try {
    const c = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
    if (c && typeof c === "object" && typeof c.id === "string" && Array.isArray(c.sections) && c.sections.length) {
      cols[c.personId || c.id] = c;
      console.log(`  ✓ ${f} — ${c.personId} · 섹션 ${c.sections.length} · 인터뷰 ${(c.interview || []).length}`);
    } else {
      console.log(`  ✗ ${f} — 구조 불량, 건너뜀`);
    }
  } catch (e) { console.log(`  ✗ ${f} — 파싱 실패: ${(e as Error).message}`); }
}
const sorted = ORDER.filter((k) => cols[k]).map((k) => cols[k]).concat(Object.entries(cols).filter(([k]) => !ORDER.includes(k)).map(([, v]) => v));
const out = path.join(process.cwd(), "lib", "data", "columns.generated.json");
writeFileSync(out, JSON.stringify(sorted, null, 2));
console.log(`\n총 ${sorted.length}편 → ${out}`);
