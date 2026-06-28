// Faceting metadata for map filters & the "대표만 보기" view. Derived from the
// roster so the rest of the app can group/filter people without hand-tagging
// every record. Pure functions + small lookup tables; no side effects.
import type { Person } from "./types";

/** 대표 선교사 — 평소 지도에 기본 노출되는 핵심 인물. 나머지는 "전체 보기"에서. */
export const FEATURED = new Set<string>([
  "underwood", "appenzeller", "allen", "mscranton", "moffett", "avison",
  "hulbert", "gale", "hardie", "rosetta", "wjhall", "eugenebell",
  "junkin", "gilseonju", "schofield", "ross", "baird", "leegipung",
  "shepping", "owen", "sharp", "williams",
  "kendrick", "moore", "campbell", "hmoffett", "soda", "aliceappenzeller", "mckenzie", "maclay",
  "nisbet", "noble", "swallen", "fenwick", "paine", "chaffin", "morris",
]);
export const isFeatured = (id: string) => FEATURED.has(id);
/** 관리자 오버라이드(app_settings meta.featured)를 코드 FEATURED 위에 덮어 판정. */
export const isFeaturedWith = (override: Record<string, boolean> | undefined, id: string): boolean =>
  override && id in override ? override[id] : FEATURED.has(id);

/** 사역지(place id) → 권역. 지도 필터의 '지역' 축. */
const PLACE_REGION: Record<string, string> = {
  jeongdong: "seoul", yanghwajin: "seoul", jemulpo: "seoul", hyeonchung: "seoul",
  pyongyang: "seobuk", haeju: "seobuk", sorae: "seobuk",
  wonsan: "gwanbuk",
  jeonju: "honam", gwangju: "honam", suncheon: "honam",
  jeju: "jeju",
  busan: "yeongnam", daegu: "yeongnam",
  manju: "abroad", ilbon: "abroad",
};
export const REGIONS: { key: string; label: string }[] = [
  { key: "seoul", label: "서울·인천·경기" },
  { key: "seobuk", label: "평안·황해 (서북)" },
  { key: "gwanbuk", label: "함경·원산 (관북)" },
  { key: "honam", label: "호남 (전라)" },
  { key: "yeongnam", label: "영남 (경상)" },
  { key: "jeju", label: "제주" },
  { key: "abroad", label: "국외 (만주·일본)" },
];
export const regionOf = (placeId: string) => PLACE_REGION[placeId] ?? "seoul";

/** 시대 구간. 인물의 조선 사역 구간이 겹치면 그 시대에 속한다. */
export const ERAS: { key: string; label: string; from: number; to: number }[] = [
  { key: "open", label: "개항기 (1882–1894)", from: 1882, to: 1894 },
  { key: "root", label: "선교 정착기 (1895–1910)", from: 1895, to: 1910 },
  { key: "colonial", label: "일제강점기 (1910–1945)", from: 1910, to: 1945 },
  { key: "liberation", label: "해방·전쟁기 (1945–1960)", from: 1945, to: 1960 },
];
/** active 구간(예: [[1886,1907],[1949,1949]])과 겹치는 시대 키들. */
export function erasOf(active: [number, number][]): string[] {
  return ERAS.filter((e) => active.some(([s, t]) => s <= e.to && e.from <= t)).map((e) => e.key);
}

/** 소속 문자열 → 교단 그룹. 지도 필터의 '교단' 축. */
const DENOMS: { key: string; label: string; test: (o: string) => boolean }[] = [
  { key: "np", label: "미국 북장로회", test: (o) => o.includes("북장로") },
  { key: "sp", label: "미국 남장로회", test: (o) => o.includes("남장로") },
  { key: "nm", label: "미국 북감리회", test: (o) => o.includes("북감리") },
  { key: "sm", label: "미국 남감리회", test: (o) => o.includes("남감리") },
  { key: "union", label: "연합·기타 장로회", test: (o) => o.includes("연합장로") || o.includes("세브란스") },
  { key: "methodist", label: "감리회 (기타)", test: (o) => o.includes("감리") },
  { key: "korean", label: "한국인", test: (o) => o.includes("한국인") || o.includes("개종자") || o.includes("권서") },
];
export const DENOM_LIST = DENOMS.map(({ key, label }) => ({ key, label }));
export function denomOf(org: string): string {
  return DENOMS.find((d) => d.test(org))?.key ?? "etc";
}

/** 역할 문자열(예: "교육 · 전도 · 번역") → 역할 태그들. 한 인물이 여러 태그. */
const ROLE_TAGS: { key: string; label: string; kw: string[] }[] = [
  { key: "medical", label: "의료", kw: ["의료", "병원", "결핵"] },
  { key: "education", label: "교육", kw: ["교육", "학교"] },
  { key: "evangel", label: "전도·목회", kw: ["전도", "목회", "복음"] },
  { key: "translate", label: "번역·한글", kw: ["번역", "한글", "성경", "성서", "반포"] },
  { key: "women", label: "여성사역", kw: ["여성"] },
  { key: "revival", label: "부흥", kw: ["부흥"] },
  { key: "indep", label: "독립·외교", kw: ["독립", "외교"] },
];
export const ROLE_LIST = ROLE_TAGS.map(({ key, label }) => ({ key, label }));
export function roleTagsOf(role: string): string[] {
  const tags = ROLE_TAGS.filter((t) => t.kw.some((k) => role.includes(k))).map((t) => t.key);
  return tags.length ? tags : ["evangel"];
}

/** 인물들이 가장 많이 활동하던 시점(연도) — 첫 진입 기본 연도. */
export function peakYear(actives: [number, number][][], min: number, max: number): number {
  let best = min, bestCount = -1;
  for (let y = min; y <= max; y++) {
    let c = 0;
    for (const intervals of actives) if (intervals.some(([s, e]) => s <= y && y <= e)) c++;
    if (c > bestCount) { bestCount = c; best = y; }
  }
  return best;
}
