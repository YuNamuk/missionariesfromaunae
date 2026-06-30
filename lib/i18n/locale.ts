// 사이트 언어(로케일). 쿠키 기반 화면 내 토글 — 기본 한국어, 영어 보조.
// 콘텐츠(서사)는 서버에서 렌더링되므로 서버가 로케일을 알아야 한다. 로케일을 읽는
// 페이지만 동적 렌더로 전환되고(예: /story), 나머지 정적 캐시는 유지된다.

export type Locale = "ko" | "en" | "mn";
export const LOCALES: Locale[] = ["ko", "en", "mn"];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "locale";

export const isLocale = (v: unknown): v is Locale => v === "ko" || v === "en" || v === "mn";

/** 언어 자기 이름(토글 표시용). */
export const LOCALE_NAME: Record<Locale, string> = { ko: "한국어", en: "English", mn: "Монгол" };
/** 헤더 토글용 짧은 라벨. */
export const LOCALE_SHORT: Record<Locale, string> = { ko: "한", en: "EN", mn: "МН" };

/** 로케일별 값에서 현재 로케일 값을 고른다. 비면 한국어(기본)로 자연 폴백. */
export function pick<T>(locale: Locale, values: Partial<Record<Locale, T>> & { ko: T }): T {
  const v = values[locale];
  return v != null && v !== ("" as unknown as T) ? v : values.ko;
}
