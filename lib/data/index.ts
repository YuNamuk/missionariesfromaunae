// Data-access layer. Today it reads from the typed seed module; when the
// Supabase tables are populated this is the single place to swap in DB queries
// (keep the same return shapes and the rest of the app is untouched).

import {
  PEOPLE as SEED_PEOPLE,
  PLACES as SEED_PLACES,
  REL as SEED_REL,
  RES,
  REL_TYPES,
  CAT,
  GEO as SEED_GEO,
} from "./seed";
import { EXTRA_PEOPLE, EXTRA_PLACES, EXTRA_REL, EXTRA_GEO, BURIAL, ACTIVE } from "./extra";
import type { Person, Place, RelTuple, RelType, RelTypeKey } from "./types";

/** More legible role symbols: ✚ 의료 · ♀ 여성사역 · 한 한국인·한글 · ✝ 전도·목회 */
const GLYPH_REMAP: Record<string, string> = { "⚕": "✚", "❀": "♀", "✦": "한" };
export const roleGlyph = (g: string) => GLYPH_REMAP[g] ?? g;

/** Seed (auto-extracted) + curated roster expansion, merged. */
export const PEOPLE: Person[] = [...SEED_PEOPLE, ...EXTRA_PEOPLE].map((p) => ({
  ...p,
  glyph: roleGlyph(p.glyph),
}));
export const PLACES: Place[] = [...SEED_PLACES, ...EXTRA_PLACES];
export const REL: RelTuple[] = [...SEED_REL, ...EXTRA_REL];
export const GEO = { ...SEED_GEO, ...EXTRA_GEO };
export { RES, REL_TYPES, CAT, BURIAL, ACTIVE };
export type * from "./types";

/** 조선 사역 구간. 데이터 없으면 [입국연도, 별세연도]로 폴백. */
export function activePeriods(p: Person): [number, number][] {
  if (ACTIVE[p.id]) return ACTIVE[p.id];
  const m = p.life.match(/(\d{4})\D+(\d{4})/);
  return [[p.year, m ? Number(m[2]) : 9999]];
}

/** People buried at a given cemetery place (양화진 외국인선교사묘원 등). */
export function peopleBuriedAt(placeId: string): Person[] {
  return PEOPLE.filter((p) => BURIAL[p.id] === placeId).sort((a, b) => a.year - b.year);
}
/** Cemetery place ids that have at least one recorded burial. */
export function cemeteryPlaceIds(): string[] {
  return [...new Set(Object.values(BURIAL))];
}

export const YEAR_MIN = 1882;
export const YEAR_MAX = 1960;

export function getPeople(): Person[] {
  return [...PEOPLE].sort((a, b) => a.year - b.year);
}

export function getPerson(id: string): Person | undefined {
  return PEOPLE.find((p) => p.id === id);
}

export function getPlaces(): Place[] {
  return PLACES;
}

export function getPlace(id: string): Place | undefined {
  return PLACES.find((p) => p.id === id);
}

/** People anchored to a place (optionally only those arrived by `year`). */
export function peopleAtPlace(placeId: string, year = YEAR_MAX): Person[] {
  return PEOPLE.filter((p) => p.place === placeId && p.year <= year);
}

/** Latitude/longitude for a person, derived from their anchor place. */
export function personLatLng(person: Person) {
  return GEO[person.place];
}

export interface ResolvedRel {
  from: Person;
  to: Person;
  type: RelTypeKey;
  meta: RelType;
  note: string;
}

/** Relationship edges resolved to person objects (skips unknown ids). */
export function getRelationships(): ResolvedRel[] {
  return REL.flatMap(([a, b, type, note]: RelTuple) => {
    const from = getPerson(a);
    const to = getPerson(b);
    if (!from || !to) return [];
    return [{ from, to, type, meta: REL_TYPES[type], note }];
  });
}

/** Relationships touching a given person (either direction). */
export function relationshipsFor(personId: string): ResolvedRel[] {
  return getRelationships().filter(
    (r) => r.from.id === personId || r.to.id === personId,
  );
}

/** Resources (sources) referenced by a person, via their `docs` indices. */
export function resourcesFor(person: Person) {
  return person.docs.map((i) => RES[i]).filter(Boolean);
}

/** A flat chronological list of every dated event across all people. */
export interface TimelineRow {
  year: number;
  yearLabel: string;
  text: string;
  personId: string;
  personName: string;
  glyph: string;
}
export function getGlobalTimeline(): TimelineRow[] {
  const rows: TimelineRow[] = [];
  for (const p of PEOPLE) {
    for (const [yr, text] of p.timeline) {
      const year = parseInt(yr, 10);
      if (Number.isNaN(year)) continue;
      rows.push({
        year,
        yearLabel: yr,
        text,
        personId: p.id,
        personName: p.name,
        glyph: p.glyph,
      });
    }
  }
  return rows.sort((a, b) => a.year - b.year);
}

/** Headline counts for the at-a-glance dashboard. */
export function getStats() {
  const countries = new Set(PEOPLE.map((p) => p.country));
  const orgs = new Set(PEOPLE.map((p) => p.org));
  return {
    people: PEOPLE.length,
    places: PLACES.length,
    relationships: REL.length,
    resources: RES.length,
    countries: countries.size,
    orgs: orgs.size,
    spanFrom: YEAR_MIN,
    spanTo: YEAR_MAX,
  };
}
