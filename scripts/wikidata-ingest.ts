// Wikidata에서 '내한 선교사' 후보를 발굴해 검수 큐(app_settings.wd_candidates)에 적재.
// 자동 반영 아님 — 사람이 검수해 사이트에 추가(날조 금지·출처 표기). [[person-add-pipeline]]
//   tsx --env-file=.env.local scripts/wikidata-ingest.ts
import { getServiceSupabase } from "../lib/db/supabase";
import { PEOPLE } from "../lib/data";
import { BURIED_EXTRA } from "../lib/data/cemetery";

const UA = "missionaries-aunae/1.0 (Dreamy School research; contact admin)";
const ENDPOINT = "https://query.wikidata.org/sparql";

// 양화진 외국인선교사묘원(Q8048577) 안장자 — 위키데이터에서 가장 정확한 '내한 선교사' 신호.
// (직업 태깅·역사적 국가코드가 부실해 occupation/place 기반 질의는 회수율이 낮아 제외.)
const QUERIES: Record<string, string> = {
  yanghwajin: `SELECT DISTINCT ?p ?pLabel ?ko ?birth ?death (SAMPLE(?i) AS ?img) (SAMPLE(?en) AS ?enw) (SAMPLE(?kw) AS ?kow) WHERE {
    ?p wdt:P119 wd:Q8048577 .
    OPTIONAL { ?p wdt:P569 ?birth. } OPTIONAL { ?p wdt:P570 ?death. } OPTIONAL { ?p wdt:P18 ?i. }
    OPTIONAL { ?p rdfs:label ?ko FILTER(lang(?ko)="ko") }
    OPTIONAL { ?en schema:about ?p; schema:isPartOf <https://en.wikipedia.org/> }
    OPTIONAL { ?kw schema:about ?p; schema:isPartOf <https://ko.wikipedia.org/> }
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  } GROUP BY ?p ?pLabel ?ko ?birth ?death LIMIT 200`,
};

type Cand = { qid: string; en: string; ko: string; birth: string; death: string; img: string; enwiki: string; kowiki: string; via: string };

async function runQuery(via: string, q: string): Promise<Cand[]> {
  const res = await fetch(`${ENDPOINT}?format=json&query=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA, Accept: "application/sparql-results+json" } });
  if (!res.ok) { console.log(`  ✗ ${via} ${res.status}`); return []; }
  const data = await res.json();
  return (data.results?.bindings ?? []).map((r: Record<string, { value: string }>) => ({
    qid: (r.p?.value ?? "").replace("http://www.wikidata.org/entity/", ""),
    en: r.pLabel?.value ?? "", ko: r.ko?.value ?? "",
    birth: (r.birth?.value ?? "").slice(0, 4), death: (r.death?.value ?? "").slice(0, 4),
    img: r.img?.value ?? "", enwiki: r.enw?.value ?? "", kowiki: r.kow?.value ?? "", via,
  })).filter((c: Cand) => c.qid && c.en);
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9가-힣]/g, "");

async function main() {
  // 기존 인물(영문·한글명)으로 중복 판정 집합
  const have = new Set<string>();
  for (const p of PEOPLE) { have.add(norm(p.en)); have.add(norm(p.name)); }
  for (const arr of Object.values(BURIED_EXTRA)) for (const b of arr) { if (b.nameEn) have.add(norm(b.nameEn)); if (b.nameKo) have.add(norm(b.nameKo)); }

  const seen = new Map<string, Cand>();
  for (const [via, q] of Object.entries(QUERIES)) {
    const rows = await runQuery(via, q);
    console.log(`  ${via}: ${rows.length}`);
    for (const c of rows) if (!seen.has(c.qid)) seen.set(c.qid, c);
  }
  const all = [...seen.values()];
  const fresh = all.filter((c) => !have.has(norm(c.en)) && !(c.ko && have.has(norm(c.ko))));
  fresh.sort((a, b) => (a.death || "9999").localeCompare(b.death || "9999"));

  const db = getServiceSupabase();
  await db.from("app_settings").upsert({ key: "wd_candidates", value: fresh }, { onConflict: "key" });
  console.log(`\n발굴 ${all.length} · 기존 제외 신규 ${fresh.length} → app_settings.wd_candidates 적재`);
  for (const c of fresh.slice(0, 40)) console.log(`  + ${c.en}${c.ko ? ` (${c.ko})` : ""} ${c.birth}-${c.death} [${c.qid}] via ${c.via}`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
