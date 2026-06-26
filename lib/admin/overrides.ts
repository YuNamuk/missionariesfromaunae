// 관리자 편집 오버라이드 — 1단계에서는 브라우저(localStorage)에 저장하고
// 지도에서 클라이언트 측으로 병합 적용한다. (2단계: Supabase 서버 저장으로 이전)
"use client";

export interface PersonOverride {
  name?: string;
  en?: string;
  life?: string;
  org?: string;
  role?: string;
  summary?: string;
  photo?: string;
  burial?: string; // 묘역 place id (빈 문자열이면 해제)
  active?: string; // "1885-1902; 1949-1949"
}

export interface AtlasOverrides {
  settings: {
    yearMin?: number;
    yearMax?: number;
    terms?: Record<string, string>; // 용어 키 → 표기
  };
  people: Record<string, PersonOverride>;
}

const KEY = "atlas-overrides-v1";

export const EMPTY: AtlasOverrides = { settings: {}, people: {} };

export function loadOverrides(): AtlasOverrides {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const o = JSON.parse(raw);
    return { settings: o.settings ?? {}, people: o.people ?? {} };
  } catch {
    return EMPTY;
  }
}

export function saveOverrides(o: AtlasOverrides) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(o));
    window.dispatchEvent(new Event("atlas-overrides"));
  } catch {
    /* ignore */
  }
}

/** "1885-1902; 1949-1949" → [[1885,1902],[1949,1949]] */
export function parseActive(s: string): [number, number][] {
  return s
    .split(/[;,\n]/)
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const m = seg.match(/(\d{4})\D+(\d{4})/);
      return m ? ([Number(m[1]), Number(m[2])] as [number, number]) : null;
    })
    .filter(Boolean) as [number, number][];
}

/** Default term labels the admin may override. */
export const TERM_DEFAULTS: { key: string; label: string; value: string }[] = [
  { key: "role.evangelism", label: "기호 ✝", value: "전도·목회" },
  { key: "role.medical", label: "기호 ✚", value: "의료" },
  { key: "role.women", label: "기호 ♀", value: "여성사역" },
  { key: "role.korean", label: "기호 한", value: "한국인·한글" },
  { key: "cat.port", label: "카테고리 입국항", value: "주요 입국항" },
  { key: "cat.origin", label: "카테고리 발상지", value: "복음의 발상지" },
  { key: "cat.site", label: "카테고리 유적지", value: "선교 유적지" },
];
