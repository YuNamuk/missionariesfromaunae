export interface MapPlace {
  id: string;
  name: string;
  cat: "port" | "origin" | "site" | "person";
  catLabel: string;
  color: string;
  glyph: string;
  lat: number;
  lng: number;
  year: number;
  summary: string;
  sub?: { name: string; note: string }[];
}

export interface MapPerson {
  id: string;
  name: string;
  en: string;
  glyph: string;
  place: string;
  placeName: string;
  lat: number;
  lng: number;
  year: number;
  country: string;
  org: string;
  role: string;
  life: string;
  summary: string;
  interview: string;
  photo: string | null;
  wiki: string;
  /** 검증된 나무위키 URL (없으면 "") */ namu: string;
  /** 검증된 영문 위키백과 URL (없으면 "") */ wikiEn: string;
  photoSource: string;
  burial: string;
  active: [number, number][];
  facts: [string, string][];
  timeline: [string, string][];
  video: string;
  photos: string[];
  sources: { t: string; a: string }[];
  /** 대표 선교사 여부(관리자 오버라이드 반영) */ featured: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
  type: string;
  label: string;
  color: string;
  dash: string | null;
  note: string;
  directional: boolean;
}

export interface RelLegend {
  key: string;
  label: string;
  color: string;
  dash: string | null;
}

export interface MapEvent {
  year: number;
  title: string;
  desc: string;
  placeId: string;
  placeName: string;
  lat: number;
  lng: number;
  people: { id: string; name: string }[];
}

export interface AtlasData {
  places: MapPlace[];
  people: MapPerson[];
  edges: MapEdge[];
  relTypes: RelLegend[];
  events: MapEvent[];
  terms: Record<string, string>;
  yearMin: number;
  yearMax: number;
  /** 묘역 안내문·추가 안장자(BURIED_*) 번역 오버레이(로케일). 클라이언트가 원본 위에 덮음. */
  placeDetail?: Record<string, { total?: string; extra?: { role?: string; note?: string }[] }>;
  /** 선교 유적지(HERITAGE) 번역 오버레이(로케일). */
  heritage?: Record<string, { name?: string; city?: string; region?: string; summary?: string; unesco?: string }>;
}
