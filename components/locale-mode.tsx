"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, LOCALE_SHORT, isLocale, type Locale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/ui";

// 전역 언어 상태. localStorage가 아니라 쿠키에 저장해 서버 컴포넌트도 같은 값을 읽는다.
// 토글 시 쿠키를 쓰고 router.refresh()로 서버 렌더 본문을 새 언어로 다시 받아온다.
type Ctx = { locale: Locale; setLocale: (v: Locale) => void; toggle: () => void };
const LocaleCtx = createContext<Ctx>({ locale: DEFAULT_LOCALE, setLocale: () => {}, toggle: () => {} });

function readCookie(): Locale {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const v = m?.[1];
  return isLocale(v) ? v : DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const v = readCookie();
    setLocaleState(v);
    document.documentElement.lang = v;
  }, []);

  const apply = useCallback((v: Locale) => {
    setLocaleState(v);
    try {
      document.cookie = `${LOCALE_COOKIE}=${v}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
      document.documentElement.lang = v;
    } catch { /* ignore */ }
    // 서버 컴포넌트(본문 서사)를 새 언어로 다시 렌더.
    router.refresh();
  }, [router]);

  const setLocale = useCallback((v: Locale) => apply(v), [apply]);
  // 다음 언어로 순환(ko→en→mn→ko).
  const toggle = useCallback(() => {
    const i = LOCALES.indexOf(locale);
    apply(LOCALES[(i + 1) % LOCALES.length]);
  }, [apply, locale]);

  return <LocaleCtx.Provider value={{ locale, setLocale, toggle }}>{children}</LocaleCtx.Provider>;
}

export const useLocale = () => useContext(LocaleCtx);

/** 헤더의 언어 선택 — 한 · EN · МН 분절 컨트롤. */
export function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  return (
    <div role="group" aria-label={t(locale, "lang.aria")} className="flex items-center gap-0.5 rounded-full bg-white/8 p-0.5">
      {LOCALES.map((l) => {
        const on = l === locale;
        return (
          <button
            key={l}
            onClick={() => setLocale(l)}
            aria-pressed={on}
            className={`rounded-full px-2 py-1 text-[11px] font-extrabold transition-colors ${on ? "bg-white/20 text-white" : "text-white/55 hover:text-white"}`}
          >
            {LOCALE_SHORT[l]}
          </button>
        );
      })}
    </div>
  );
}
