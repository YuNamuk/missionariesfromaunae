import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./locale";

// 서버 컴포넌트에서 현재 로케일을 읽는다. cookies()를 호출하므로 이 함수를 쓰는
// 페이지는 동적 렌더로 전환된다(의도적 — 그 페이지만 영향).
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const v = store.get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
}
