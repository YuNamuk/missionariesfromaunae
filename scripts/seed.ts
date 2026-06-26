/**
 * Seed Supabase from the typed source dataset.
 *
 *   1. Apply db/schema.sql in the Supabase SQL editor.
 *   2. Put SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   3. npm run db:seed   (loads .env.local via Node's --env-file)
 *
 * Idempotent: upserts by primary key, safe to re-run.
 */
import { PEOPLE, PLACES, REL, RES, GEO, BURIAL, activePeriods, YEAR_MIN, YEAR_MAX } from "../lib/data";
import { PHOTOS } from "../lib/data/photos";
import { getServiceSupabase } from "../lib/db/supabase";

async function main() {
  const db = getServiceSupabase();
  console.log("Seeding…");

  // A single "원자료(dataset)" provenance row — every seeded fact cites it.
  const { data: src, error: srcErr } = await db
    .from("sources")
    .insert({
      source_url: "internal://조선 선교사 자료실.dc.html",
      site_name: "조선 선교사 온라인 자료실",
      title: "원본 큐레이션 데이터셋",
      license: "internal-curated",
    })
    .select("id")
    .single();
  if (srcErr) throw srcErr;
  const sourceId = src.id as number;

  // places
  const placesRows = PLACES.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.cat,
    lat: GEO[p.id]?.[0] ?? null,
    lng: GEO[p.id]?.[1] ?? null,
    year: p.year,
    cluster: p.cluster,
    summary: p.summary,
    facts: p.facts,
    source_id: sourceId,
  }));
  await up(db, "places", placesRows);

  // place subsites
  const subs = PLACES.flatMap((p) =>
    (p.sub ?? []).map((s) => ({ place_id: p.id, name: s.name, note: s.note })),
  );
  if (subs.length) {
    await db.from("place_subsites").delete().neq("id", -1);
    await ins(db, "place_subsites", subs);
  }

  // people
  const peopleRows = PEOPLE.map((p) => ({
    id: p.id,
    name: p.name,
    name_en: p.en,
    glyph: p.glyph,
    arrival_year: p.year,
    place_id: PLACES.some((pl) => pl.id === p.place) ? p.place : null,
    country: p.country,
    org: p.org,
    role: p.role,
    life: p.life,
    summary: p.summary,
    facts: p.facts,
    media: { video: p.video, interview: p.interview, photos: p.photos },
    photo: PHOTOS[p.id]?.photo ?? null,
    wiki: PHOTOS[p.id]?.wiki ?? null,
    burial_place_id: BURIAL[p.id] ?? null,
    active_periods: activePeriods(p),
    source_id: sourceId,
  }));
  await up(db, "people", peopleRows);

  // timeline
  const events = PEOPLE.flatMap((p) =>
    p.timeline.map(([yr, description]) => ({
      person_id: p.id,
      year: Number.parseInt(yr, 10) || null,
      year_label: yr,
      description,
      source_id: sourceId,
    })),
  );
  await db.from("timeline_events").delete().neq("id", -1);
  await ins(db, "timeline_events", events);

  // relationships
  const rels = REL.map(([from_person, to_person, type, note]) => ({
    from_person,
    to_person,
    type,
    note,
    source_id: sourceId,
  }));
  await up(db, "relationships", rels, "from_person,to_person,type");

  // resources + person links
  const resources = RES.map((r, i) => ({ ref: i, title: r.t, author: r.a, accent: r.c }));
  await up(db, "resources", resources, "ref");
  const { data: resRows } = await db.from("resources").select("id, ref");
  const refToId = new Map((resRows ?? []).map((r) => [r.ref as number, r.id as number]));
  const links = PEOPLE.flatMap((p) =>
    p.docs
      .map((ref) => refToId.get(ref))
      .filter((id): id is number => id != null)
      .map((resource_id) => ({ person_id: p.id, resource_id })),
  );
  await db.from("person_resources").delete().neq("person_id", "");
  await ins(db, "person_resources", links);

  // app settings (연도 범위 · 용어 표기) — 관리자가 수정
  const settings = [
    { key: "year_min", value: YEAR_MIN },
    { key: "year_max", value: YEAR_MAX },
    { key: "term.role.evangelism", value: "전도·목회" },
    { key: "term.role.medical", value: "의료" },
    { key: "term.role.women", value: "여성사역" },
    { key: "term.role.korean", value: "한국인·한글" },
  ];
  await up(db, "app_settings", settings, "key");

  console.log(
    `✓ seeded: ${peopleRows.length} people, ${placesRows.length} places, ${rels.length} relations, ${events.length} events, ${resources.length} resources, ${settings.length} settings`,
  );
}

async function up(db: ReturnType<typeof getServiceSupabase>, table: string, rows: object[], onConflict = "id") {
  if (!rows.length) return;
  const { error } = await db.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
}
async function ins(db: ReturnType<typeof getServiceSupabase>, table: string, rows: object[]) {
  if (!rows.length) return;
  const { error } = await db.from(table).insert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
