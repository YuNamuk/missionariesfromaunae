// 가상 인터뷰(문답·안내문) 번역 → app_settings `i18n.<locale>.interview.<personId>`.
// 인터뷰는 심화 컬럼의 interview를 출처로 삼는다. 재개 가능(있으면 skip, --force로 덮기).
//   tsx --env-file=.env.local scripts/translate-interviews.ts [--locale en,mn] [--id underwood] [--force]
// 필요한 env: ANTHROPIC_API_KEY (+ SUPABASE_*). 모델: ANALYSIS_MODEL || claude-sonnet-4-6.
import { getServiceSupabase } from "../lib/db/supabase";
import { RESEARCH_COLUMNS } from "../lib/data/columns";

type Locale = "en" | "mn";
const LOCALE_NAME: Record<Locale, string> = { en: "English", mn: "Mongolian (Khalkha, Cyrillic script)" };

function parseArgs() {
  const a = process.argv.slice(2);
  const get = (k: string) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const locales = (get("--locale") ?? "en,mn").split(",").map((s) => s.trim()).filter(Boolean) as Locale[];
  return { locales, id: get("--id"), force: a.includes("--force") };
}

const db = getServiceSupabase();
async function exists(key: string): Promise<boolean> {
  const { data } = await db.from("app_settings").select("key").eq("key", key).maybeSingle();
  return !!data;
}
async function put(key: string, value: unknown) {
  const { error } = await db.from("app_settings").upsert({ key, value }, { onConflict: "key" });
  if (error) throw error;
}
const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function translate(locale: Locale, obj: Record<string, unknown>): Promise<Record<string, unknown>> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY 미설정");
  const model = process.env.ANALYSIS_MODEL || "claude-sonnet-4-6";
  const system = `You translate a "virtual interview" for a digital archive of early Korean Protestant missionaries (1882–1935).
Translate the given Korean JSON into ${LOCALE_NAME[locale]}.
Rules:
- Keep a calm, sincere, first-person interview voice faithful to the original; do not add, omit, or embellish facts.
- Preserve proper nouns, place names, organization names, and YEARS.
- These are student-reconstructed imaginative answers — keep that reflective tone.
- Return ONLY a JSON object with the EXACT same keys and array shapes as the input. For "qa", translate each item's "q" and "a".
- Output JSON only — no markdown, no commentary.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model, max_tokens: 8000, system,
      tools: [{ name: "emit_translation", description: "Return the translated content as a JSON object with the same keys/shapes as the input.", input_schema: { type: "object", additionalProperties: true } }],
      tool_choice: { type: "tool", name: "emit_translation" },
      messages: [{ role: "user", content: "Translate this JSON into " + LOCALE_NAME[locale] + ":\n" + JSON.stringify(obj, null, 2) }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = await res.json();
  const tool = (data?.content ?? []).find((b: { type: string }) => b.type === "tool_use");
  if (!tool?.input || typeof tool.input !== "object") throw new Error("tool_use 출력 없음");
  return tool.input as Record<string, unknown>;
}

async function run() {
  const { locales, id, force } = parseArgs();
  // 출처: 심화 컬럼의 interview + 관리자/시드 오버레이(interview.content.*). 오버레이가 우선.
  type Item = { personId: string; note: string; qa: { q: string; a: string }[] };
  const items: Item[] = RESEARCH_COLUMNS
    .filter((c) => Array.isArray(c.interview) && c.interview.length > 0)
    .map((c) => ({ personId: c.personId, note: c.interviewNote, qa: c.interview.map((x) => ({ q: x.q, a: x.a })) }));
  const { data: ovr } = await db.from("app_settings").select("key,value").like("key", "interview.content.%");
  for (const r of (ovr ?? []) as { key: string; value: unknown }[]) {
    const pid = r.key.replace("interview.content.", "");
    const v = r.value as { note?: string; qa?: { q: string; a: string }[] } | null;
    if (!v || typeof v !== "object" || !Array.isArray(v.qa) || !v.qa.length) continue;
    const entry: Item = { personId: pid, note: v.note ?? "", qa: v.qa.map((x) => ({ q: x.q, a: x.a })) };
    const i = items.findIndex((x) => x.personId === pid);
    if (i >= 0) items[i] = entry; else items.push(entry);
  }
  const targets = items.filter((x) => !id || x.personId === id);
  console.log(`인터뷰 번역 — locales=${locales.join(",")} 대상=${targets.length}편${force ? " (force)" : ""}`);
  let done = 0, skipped = 0; const fails: string[] = [];
  for (const locale of locales) {
    for (const it of targets) {
      const key = `i18n.${locale}.interview.${it.personId}`;
      if (!force && (await exists(key))) { skipped++; continue; }
      try { await put(key, await translate(locale, { note: it.note, qa: it.qa })); done++; console.log(`  ✓ ${key} (${it.qa.length}문답)`); }
      catch (e) { fails.push(`${key}: ${(e as Error).message}`); console.log(`  ✗ ${key} — ${(e as Error).message}`); }
      await SLEEP(400);
    }
  }
  console.log(`\n완료 — 생성 ${done} · 건너뜀 ${skipped} · 실패 ${fails.length}`);
  fails.forEach((f) => console.log("  - " + f));
  process.exit(0);
}
run().catch((e) => { console.error(e); process.exit(1); });
