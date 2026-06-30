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
import { fetchAllPersonI18n, fetchPlacesI18n, fetchPlaceDetailI18n, ov } from "@/lib/i18n/content";
import { tl } from "@/lib/i18n/labels";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locale";

const DIRECTIONAL = new Set(["influence", "prepare", "succeed"]);

/** Build the atlas payload; overlays admin edits + locale translations from Supabase. */
export async function buildAtlasData(locale: Locale = DEFAULT_LOCALE): Promise<AtlasData> {
  const overlay = await fetchOverlay();
  const i18n = await fetchAllPersonI18n(locale);
  const placesL = await fetchPlacesI18n(locale);
  const pd = await fetchPlaceDetailI18n(locale);
  const placeName = (id: string) => placesL[id] ?? PLACES.find((p) => p.id === id)?.name ?? id;

  const places: MapPlace[] = PLACES.map((p) => {
    const ll = GEO[p.id];
    const d = pd[p.id];
    return {
      id: p.id,
      name: placesL[p.id] ?? p.name,
      cat: p.cat,
      catLabel: tl(locale, "cat", p.cat, CAT[p.cat].label),
      color: CAT[p.cat].color,
      glyph: CAT[p.cat].glyph,
      lat: ll?.[0] ?? 0,
      lng: ll?.[1] ?? 0,
      year: p.year,
      summary: ov(p.summary, d?.summary),
      sub: p.sub?.map((s, i) => ({ name: d?.sub?.[i]?.name || s.name, note: d?.sub?.[i]?.note || s.note })) ?? p.sub,
    };
  }).filter((p) => p.lat !== 0);

  const people: MapPerson[] = PEOPLE.map((p) => {
    const ll = GEO[p.place];
    const burialId = BURIAL[p.id];
    const o = overlay?.people[p.id];
    const t = i18n[p.id];
    return {
      id: p.id,
      name: ov(o?.name ?? p.name, t?.name),
      en: o?.name_en ?? p.en,
      glyph: p.glyph,
      place: p.place,
      placeName: placeName(p.place),
      lat: ll?.[0] ?? 0,
      lng: ll?.[1] ?? 0,
      year: p.year,
      country: p.country,
      org: ov(o?.org ?? p.org, t?.org),
      role: ov(o?.role ?? p.role, t?.role),
      life: o?.life ?? p.life,
      summary: ov(o?.summary ?? p.summary, t?.summary),
      interview: p.interview,
      photo: o && "photo" in o ? o.photo ?? null : PHOTOS[p.id]?.photo ?? null,
      wiki: (o?.wiki ?? PHOTOS[p.id]?.wiki) ?? "",
      namu: PHOTOS[p.id]?.namu ?? "",
      wikiEn: PHOTOS[p.id]?.wikiEn ?? "",
      photoSource: PHOTOS[p.id]?.source ?? "",
      burial: o && "burial_place_id" in o ? (o.burial_place_id ? placeName(o.burial_place_id) : "") : burialId ? placeName(burialId) : "",
      active: o?.active_periods?.length ? o.active_periods : activePeriods(p),
      facts: ov(p.facts, t?.facts as unknown as typeof p.facts),
      timeline: ov(p.timeline, t?.timeline as unknown as typeof p.timeline),
      video: p.video,
      photos: p.photos,
      sources: resourcesFor(p).map((r, i) => ({ t: t?.sources?.[i]?.t || r.t, a: t?.sources?.[i]?.a || r.a })),
      featured: isFeaturedWith(overlay?.featured, p.id),
    };
  }).filter((p) => p.lat !== 0);

  const nameOf = (id: string) => ov(PEOPLE.find((p) => p.id === id)?.name ?? id, i18n[id]?.name);
  const edges: MapEdge[] = getRelationships().map((r) => ({
    from: r.from.id,
    to: r.to.id,
    type: r.type,
    label: tl(locale, "rel", r.type, r.meta.label),
    color: r.meta.color,
    dash: r.meta.dash,
    note: r.note,
    directional: DIRECTIONAL.has(r.type),
  }));

  const relTypes: RelLegend[] = Object.entries(REL_TYPES).map(([key, v]) => ({
    key,
    label: tl(locale, "rel", key, v.label),
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
      people: e.people.map((id) => ({ id, name: nameOf(id) })),
    };
  });

  // 묘역 안내문·추가 안장자 직함/설명 번역(클라이언트가 BURIED_TOTAL/BURIED_EXTRA 위에 덮음).
  const placeDetail: Record<string, { total?: string; extra?: { role?: string; note?: string }[] }> = {};
  for (const [id, d] of Object.entries(pd)) {
    if (d.total || d.extra) placeDetail[id] = { ...(d.total ? { total: d.total } : {}), ...(d.extra ? { extra: d.extra } : {}) };
  }

  return {
    places,
    people,
    edges,
    relTypes,
    events,
    terms: overlay?.terms ?? {},
    yearMin: overlay?.yearMin ?? YEAR_MIN,
    yearMax: overlay?.yearMax ?? YEAR_MAX,
    placeDetail,
  };
}
