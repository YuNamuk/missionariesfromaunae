// 콘텐츠 자동 번역 — 한국어 원본을 영어·몽골어로 옮겨 app_settings의
// `i18n.<locale>.<key>`에 적재한다(재개 가능: 이미 있으면 건너뜀, --force로 덮어쓰기).
// 결과는 사이트가 로케일별로 읽고, /admin에서 언어별 수정 가능.
//
//   tsx --env-file=.env.local scripts/translate.ts [--locale en,mn] [--kind people,pages,voices]
//                                                  [--id underwood] [--limit 5] [--force]
//
// 필요한 env: ANTHROPIC_API_KEY (+ SUPABASE_*). 모델: ANALYSIS_MODEL || claude-sonnet-4-6.

import { getServiceSupabase } from "../lib/db/supabase";
import { PEOPLE, PLACES, resourcesFor, type Person } from "../lib/data";
import { profileFor } from "../lib/data/profiles";
import { JOURNEY_COPY } from "../lib/data/page-copy";
import { STUDENT_VOICES } from "../lib/data/voices";
import { TOPICS } from "../lib/data/topics";

type Locale = "en" | "mn";
const LOCALE_NAME: Record<Locale, string> = { en: "English", mn: "Mongolian (Khalkha, Cyrillic script)" };

function parseArgs() {
  const a = process.argv.slice(2);
  const get = (k: string) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : undefined; };
  const locales = (get("--locale") ?? "en,mn").split(",").map((s) => s.trim()).filter(Boolean) as Locale[];
  const kinds = (get("--kind") ?? "pages,places,topics,voices,people").split(",").map((s) => s.trim());
  const id = get("--id");
  const limit = get("--limit") ? Number(get("--limit")) : undefined;
  const force = a.includes("--force");
  return { locales, kinds, id, limit, force };
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
async function koPersonOverlay(): Promise<Record<string, Record<string, unknown>>> {
  const { data } = await db.from("app_settings").select("key,value").like("key", "content.person.%");
  const out: Record<string, Record<string, unknown>> = {};
  for (const r of (data ?? []) as { key: string; value: unknown }[]) {
    if (r.value && typeof r.value === "object") out[r.key.replace("content.person.", "")] = r.value as Record<string, unknown>;
  }
  return out;
}
async function koPageOverlay(page: string): Promise<Record<string, string>> {
  const { data } = await db.from("app_settings").select("value").eq("key", `content.page.${page}`).maybeSingle();
  return (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, string>;
}

const SLEEP = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function translate(locale: Locale, obj: Record<string, unknown>): Promise<Record<string, unknown>> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY 미설정");
  const model = process.env.ANALYSIS_MODEL || "claude-sonnet-4-6";
  const system = `You translate content for a digital archive of early Korean Protestant missionaries (1882–1935).
Translate the given Korean JSON into ${LOCALE_NAME[locale]}.
Rules:
- Keep a calm, literary, devotional-but-restrained tone faithful to the original; do not add, omit, or embellish facts.
- Preserve proper nouns, place names, organization names, and YEARS. Keep numbers (e.g. years) as numbers.
- Translate person/place/role names naturally; for Mongolian, transliterate personal names into Cyrillic.
- Return ONLY a JSON object with the EXACT same keys and the same array shapes as the input.
  For arrays of strings, translate each element. For [label, value] or [year, text] pairs, translate the text fields and keep years as numbers.
- Output JSON only — no markdown fences, no commentary.`;
  // tool-use로 구조적 출력 강제 → API가 유효한 JSON(이스케이프 포함) 보장.
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 8000,
      system,
      tools: [{
        name: "emit_translation",
        description: "Return the translated content as a JSON object with the same keys/shapes as the input.",
        input_schema: { type: "object", additionalProperties: true },
      }],
      tool_choice: { type: "tool", name: "emit_translation" },
      messages: [{ role: "user", content: "Translate this JSON into " + LOCALE_NAME[locale] + ":\n" + JSON.stringify(obj, null, 2) }],
    }),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = await res.json();
  const tool = (data?.content ?? []).find((b: { type: string }) => b.type === "tool_use");
  if (!tool?.input || typeof tool.input !== "object") throw new Error("tool_use 출력 없음: " + JSON.stringify(data?.content ?? "").slice(0, 160));
  return tool.input as Record<string, unknown>;
}

// ── 인물 한국어 번들(정적 + ko 오버레이) ──
function personKo(p: Person, ov: Record<string, unknown> | undefined): Record<string, unknown> {
  const pr = profileFor(p.id);
  const pick = <T,>(k: string, fallback: T): T => (ov && k in ov ? (ov[k] as T) : fallback);
  const b: Record<string, unknown> = {
    name: p.name,
    role: p.role,
    org: p.org,
    country: p.country,
    summary: pick("summary", p.summary),
  };
  const story = pick<string[] | undefined>("story", pr?.story);
  if (story?.length) b.story = story;
  const ministry = pick<string[] | undefined>("ministry", pr?.ministry);
  if (ministry?.length) b.ministry = ministry;
  const journey = pick<string | undefined>("journey", pr?.journey);
  if (journey) b.journey = journey;
  const influence = pick<string | undefined>("influence", pr?.influence);
  if (influence) b.influence = influence;
  const beauty = pick<string | undefined>("beauty", pr?.beauty);
  if (beauty) b.beauty = beauty;
  const quote = pick<{ text: string; source: string } | undefined>("quote", pr?.quote);
  if (quote?.text) b.quote = quote;
  if (p.facts?.length) b.facts = p.facts;
  if (p.timeline?.length) b.timeline = p.timeline;
  // 참고 출처(제목·발행처) + 사료(제목·부제) — 고유명/간행물명은 그대로 두되 한글 설명은 번역.
  const refs = (pr?.refs ?? []).map((r) => ({ title: r.title, ...(r.publisher ? { publisher: r.publisher } : {}) }));
  if (refs.length) b.refs = refs;
  const srcs = resourcesFor(p).map((r) => ({ t: r.t, a: r.a }));
  if (srcs.length) b.sources = srcs;
  return b;
}

async function run() {
  const { locales, kinds, id, limit, force } = parseArgs();
  console.log(`번역 시작 — locales=${locales.join(",")} kinds=${kinds.join(",")}${id ? ` id=${id}` : ""}${force ? " (force)" : ""}`);
  let done = 0;
  let skipped = 0;
  const failures: string[] = [];

  for (const locale of locales) {
    // 페이지 카피(journey)
    if (kinds.includes("pages")) {
      const key = `i18n.${locale}.page.journey`;
      if (!force && (await exists(key))) { skipped++; }
      else {
        try {
          const koCopy = { ...JOURNEY_COPY, ...(await koPageOverlay("journey")) };
          const tr = await translate(locale, koCopy);
          await put(key, tr);
          done++; console.log(`  ✓ ${key}`);
        } catch (e) { failures.push(`${key}: ${(e as Error).message}`); console.log(`  ✗ ${key} — ${(e as Error).message}`); }
        await SLEEP(400);
      }
    }
    // 주제연구(제목·소개·분석) — 코드 TOPICS + DB topic.*
    if (kinds.includes("topics")) {
      const { data: dbRows } = await db.from("app_settings").select("key,value").like("key", "topic.%");
      const merged: Record<string, { title?: string; intro?: string; analysis?: string; era?: string }> = {};
      for (const t of TOPICS) merged[t.id] = { title: t.title, intro: t.intro, analysis: t.analysis, era: t.era };
      for (const r of (dbRows ?? []) as { key: string; value: unknown }[]) {
        const tid = r.key.replace("topic.", "");
        const v = r.value as { title?: string; intro?: string; analysis?: string; era?: string; people?: unknown[] };
        if (v && typeof v === "object" && Array.isArray(v.people) && v.people.length) merged[tid] = { title: v.title, intro: v.intro, analysis: v.analysis, era: v.era };
      }
      for (const [tid, t] of Object.entries(merged)) {
        if (id && tid !== id) continue;
        const key = `i18n.${locale}.topic.${tid}`;
        if (!force && (await exists(key))) { skipped++; continue; }
        const src: Record<string, unknown> = {};
        if (t.title) src.title = t.title;
        if (t.intro) src.intro = t.intro;
        if (t.analysis) src.analysis = t.analysis;
        if (t.era) src.era = t.era;
        if (Object.keys(src).length === 0) { skipped++; continue; }
        try { await put(key, await translate(locale, src)); done++; console.log(`  ✓ ${key}`); }
        catch (e) { failures.push(`${key}: ${(e as Error).message}`); console.log(`  ✗ ${key} — ${(e as Error).message}`); }
        await SLEEP(400);
      }
    }
    // 장소명
    if (kinds.includes("places")) {
      const key = `i18n.${locale}.places`;
      if (!force && (await exists(key))) { skipped++; }
      else {
        try {
          const koPlaces: Record<string, string> = {};
          for (const pl of PLACES) koPlaces[pl.id] = pl.name;
          const tr = await translate(locale, { places: koPlaces });
          await put(key, (tr as { places: unknown }).places ?? tr);
          done++; console.log(`  ✓ ${key}`);
        } catch (e) { failures.push(`${key}: ${(e as Error).message}`); console.log(`  ✗ ${key} — ${(e as Error).message}`); }
        await SLEEP(400);
      }
    }
    // 학생 목소리
    if (kinds.includes("voices")) {
      const key = `i18n.${locale}.voices`;
      if (!force && (await exists(key))) { skipped++; }
      else {
        try {
          const koVoices = STUDENT_VOICES.map((v) => ({ text: v.text, prompt: v.prompt ?? "", context: v.context ?? "" }));
          const tr = await translate(locale, { voices: koVoices });
          await put(key, (tr as { voices: unknown }).voices ?? tr);
          done++; console.log(`  ✓ ${key}`);
        } catch (e) { failures.push(`${key}: ${(e as Error).message}`); console.log(`  ✗ ${key} — ${(e as Error).message}`); }
        await SLEEP(400);
      }
    }
    // 인물
    if (kinds.includes("people")) {
      const ovAll = await koPersonOverlay();
      let list = id ? PEOPLE.filter((p) => p.id === id) : PEOPLE;
      if (limit) list = list.slice(0, limit);
      for (const p of list) {
        const key = `i18n.${locale}.person.${p.id}`;
        if (!force && (await exists(key))) { skipped++; continue; }
        try {
          const tr = await translate(locale, personKo(p, ovAll[p.id]));
          if (locale === "en" && p.en) tr.name = p.en; // 영어 이름은 검증된 표기 사용
          await put(key, tr);
          done++; console.log(`  ✓ ${key} (${p.name})`);
        } catch (e) { failures.push(`${key}: ${(e as Error).message}`); console.log(`  ✗ ${key} — ${(e as Error).message}`); }
        await SLEEP(400);
      }
    }
  }

  console.log(`\n완료 — 생성 ${done} · 건너뜀 ${skipped} · 실패 ${failures.length}`);
  if (failures.length) { console.log("실패 목록:"); failures.forEach((f) => console.log("  - " + f)); }
}

run().catch((e) => { console.error(e); process.exit(1); });
