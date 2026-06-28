import {
  PLACES,
  PEOPLE,
  CAT,
  GEO,
  REL_TYPES,
  BURIAL,
  activePeriods,
  resourcesFor,
  getRelationships,
  YEAR_MIN,
  YEAR_MAX,
} from "@/lib/data";
import type { AtlasData, MapPlace, MapPerson, MapEdge, RelLegend, MapEvent } from "./types";
import { PHOTOS } from "@/lib/data/photos";
import { isFeaturedWith } from "@/lib/data/meta";
import { EVENTS } from "@/lib/data/events";
import { fetchOverlay } from "@/lib/db/content";

const DIRECTIONAL = new Set(["influence", "prepare", "succeed"]);

/** Build the atlas payload; overlays admin edits from Supabase when available. */
export async function buildAtlasData(): Promise<AtlasData> {
  const placeName = (id: string) => PLACES.find((p) => p.id === id)?.name ?? id;
  const overlay = await fetchOverlay();

  const places: MapPlace[] = PLACES.map((p) => {
    const ll = GEO[p.id];
    return {
      id: p.id,
      name: p.name,
      cat: p.cat,
      catLabel: CAT[p.cat].label,
      color: CAT[p.cat].color,
      glyph: CAT[p.cat].glyph,
      lat: ll?.[0] ?? 0,
      lng: ll?.[1] ?? 0,
      year: p.year,
      summary: p.summary,
      sub: p.sub,
    };
  }).filter((p) => p.lat !== 0);

  const people: MapPerson[] = PEOPLE.map((p) => {
    const ll = GEO[p.place];
    const burialId = BURIAL[p.id];
    const o = overlay?.people[p.id];
    return {
      id: p.id,
      name: o?.name ?? p.name,
      en: o?.name_en ?? p.en,
      glyph: p.glyph,
      place: p.place,
      placeName: placeName(p.place),
      lat: ll?.[0] ?? 0,
      lng: ll?.[1] ?? 0,
      year: p.year,
      country: p.country,
      org: o?.org ?? p.org,
      role: o?.role ?? p.role,
      life: o?.life ?? p.life,
      summary: o?.summary ?? p.summary,
      interview: p.interview,
      photo: o && "photo" in o ? o.photo ?? null : PHOTOS[p.id]?.photo ?? null,
      wiki: (o?.wiki ?? PHOTOS[p.id]?.wiki) ?? "",
      namu: PHOTOS[p.id]?.namu ?? "",
      wikiEn: PHOTOS[p.id]?.wikiEn ?? "",
      photoSource: PHOTOS[p.id]?.source ?? "",
      burial: o && "burial_place_id" in o ? (o.burial_place_id ? placeName(o.burial_place_id) : "") : burialId ? placeName(burialId) : "",
      active: o?.active_periods?.length ? o.active_periods : activePeriods(p),
      facts: p.facts,
      timeline: p.timeline,
      video: p.video,
      photos: p.photos,
      sources: resourcesFor(p).map((r) => ({ t: r.t, a: r.a })),
      featured: isFeaturedWith(overlay?.featured, p.id),
    };
  }).filter((p) => p.lat !== 0);

  const edges: MapEdge[] = getRelationships().map((r) => ({
    from: r.from.id,
    to: r.to.id,
    type: r.type,
    label: r.meta.label,
    color: r.meta.color,
    dash: r.meta.dash,
    note: r.note,
    directional: DIRECTIONAL.has(r.type),
  }));

  const relTypes: RelLegend[] = Object.entries(REL_TYPES).map(([key, v]) => ({
    key,
    label: v.label,
    color: v.color,
    dash: v.dash,
  }));

  const events: MapEvent[] = EVENTS.map((e) => {
    const ll = GEO[e.place];
    return {
      year: e.year,
      title: e.title,
      desc: e.desc,
      placeId: e.place,
      placeName: placeName(e.place),
      lat: ll?.[0] ?? 0,
      lng: ll?.[1] ?? 0,
      people: e.people.map((id) => ({ id, name: PEOPLE.find((p) => p.id === id)?.name ?? id })),
    };
  });

  return {
    places,
    people,
    edges,
    relTypes,
    events,
    terms: overlay?.terms ?? {},
    yearMin: overlay?.yearMin ?? YEAR_MIN,
    yearMax: overlay?.yearMax ?? YEAR_MAX,
  };
}
