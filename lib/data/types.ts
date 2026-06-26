// Domain types for the missionary archive. These mirror the original dataset
// shape and are the contract for both the seed module and the DB layer.

/** [latitude, longitude] */
export type LatLng = [number, number];
export type GeoMap = Record<string, LatLng>;

/** A labelled (key, value) fact row shown in detail panels. */
export type Fact = [label: string, value: string];
/** A [year, description] timeline entry. */
export type TimelineEntry = [year: string, description: string];

export type RelTypeKey =
  | "influence"
  | "prepare"
  | "partner"
  | "mentor"
  | "family"
  | "succeed";

export interface RelType {
  label: string;
  color: string;
  dash: string | null;
}
export type RelTypeMap = Record<RelTypeKey, RelType>;

/** [a, b, type, note] — directional a → b for directional types. */
export type RelTuple = [a: string, b: string, type: RelTypeKey, note: string];

export interface Resource {
  /** title */ t: string;
  /** author / attribution */ a: string;
  /** accent color */ c: string;
}

export interface Person {
  id: string;
  name: string;
  /** english name */ en: string;
  /** display glyph */ glyph: string;
  /** year of arrival / key year */ year: number;
  /** place id this person anchors to */ place: string;
  country: string;
  org: string;
  role: string;
  /** life span, e.g. "1858–1932" */ life: string;
  summary: string;
  facts: Fact[];
  timeline: TimelineEntry[];
  /** indices into the RES resource list */ docs: number[];
  video: string;
  photos: string[];
  interview: string;
}

export type PlaceCategory = "port" | "origin" | "site" | "person";

export interface PlaceSub {
  name: string;
  note: string;
}

export interface Place {
  id: string;
  name: string;
  cat: PlaceCategory;
  /** legacy SVG x coord (kept for reference) */ x: number;
  /** legacy SVG y coord (kept for reference) */ y: number;
  year: number;
  cluster: boolean;
  summary: string;
  facts: Fact[];
  sub?: PlaceSub[];
}

export interface Category {
  label: string;
  color: string;
  glyph: string;
}
export type CatMap = Record<PlaceCategory, Category>;
