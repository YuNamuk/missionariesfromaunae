import type { Locale } from "./locale";
import { UI_OVERRIDES } from "./overrides";

// UI 골격 문자열(메뉴·버튼·둘러보기 패널 제목 등). 데이터에서 파생되는 인물·시대
// 목록 등은 아직 한국어로 둔다(점진 확장). 누락 키는 한국어로 폴백.
type Dict = Record<string, string>;

const KO: Dict = {
  // 헤더 내비
  "nav.story": "들어가며",
  "nav.journey": "우리의 여정",
  "nav.map": "지도",
  "nav.dictionary": "인명사전",
  "nav.flow": "선교의 흐름",
  "nav.span": "활동 연표",
  "nav.research": "주제연구",
  "nav.interviews": "가상 인터뷰",
  "nav.browse": "둘러보기",
  // 둘러보기 패널 카드 제목
  "browse.eras": "선교 연혁",
  "browse.cemeteries": "선교 묘역",
  "browse.heritage": "선교 유적지",
  "browse.denom": "교단",
  "browse.country": "나라",
  "browse.role": "사역 분야",
  "browse.region": "지역",
  // 언어 토글(다음 언어 라벨)
  "lang.switchTo": "EN",
  "lang.aria": "언어 전환",
};

const EN: Dict = {
  "nav.story": "Begin Here",
  "nav.journey": "Our Journey",
  "nav.map": "Map",
  "nav.dictionary": "Directory",
  "nav.flow": "Flow of Mission",
  "nav.span": "Activity Timeline",
  "nav.research": "Research",
  "nav.interviews": "Interviews",
  "nav.browse": "Browse",
  "browse.eras": "Eras",
  "browse.cemeteries": "Cemeteries",
  "browse.heritage": "Heritage Sites",
  "browse.denom": "Denominations",
  "browse.country": "Countries",
  "browse.role": "Ministry",
  "browse.region": "Regions",
  "lang.switchTo": "한국어",
  "lang.aria": "Switch language",
};

// 몽골어(Cyrillic) — UI 골격. 1차 초안(원어민 검수 권장).
const MN: Dict = {
  "nav.story": "Эхлэл",
  "nav.journey": "Бидний аялал",
  "nav.map": "Газрын зураг",
  "nav.dictionary": "Нэрсийн толь",
  "nav.flow": "Номлолын урсгал",
  "nav.span": "Он дараалал",
  "nav.research": "Судалгаа",
  "nav.interviews": "Ярилцлага",
  "nav.browse": "Үзэх",
  "browse.eras": "Түүхэн үеүүд",
  "browse.cemeteries": "Оршуулгын газар",
  "browse.heritage": "Дурсгалт газрууд",
  "browse.denom": "Урсгалууд",
  "browse.country": "Улсууд",
  "browse.role": "Үйлчлэл",
  "browse.region": "Бүс нутаг",
  "lang.aria": "Хэл солих",
};

const DICTS: Record<Locale, Dict> = { ko: KO, en: EN, mn: MN };

// 관리자 '번역 관리'에서 검수/편집할 수 있도록 기본 사전을 공개(키 목록·원문 참조용).
export const UI_DEFAULT: Record<Locale, Dict> = { ko: KO, en: EN, mn: MN };
export const UI_KEYS = Object.keys(KO);

/** UI 문자열 조회. 오버라이드(DB 검수본) → 사전 → 한국어 폴백. */
export function t(locale: Locale, key: string): string {
  const o = UI_OVERRIDES[locale]?.[key];
  if (o) return o;
  return DICTS[locale][key] ?? KO[key] ?? key;
}
