"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, LOCALE_NAME, LOCALE_SHORT, isLocale, type Locale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/ui";

// 전역 언어 상태. localStorage가 아니라 쿠키에 저장해 서버 컴포넌트도 같은 값을 읽는다.
// 토글 시 쿠키를 쓰고 router.refresh()로 서버 렌더 본문을 새 언어로 다시 받아온다.
type Ctx = { locale: Locale; setLocale: (v: Locale) => void; toggle: () => void };
const LocaleCtx = createContext<Ctx>({ locale: DEFAULT_LOCALE, setLocale: () => {}, toggle: () => {} });

function readCookieRaw(): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`))?.[1];
}
function readCookie(): Locale {
  const v = readCookieRaw();
  return isLocale(v) ? v : DEFAULT_LOCALE;
}
/** 브라우저 언어로 첫 로케일 추정(쿠키 없을 때). 몽골어·영어면 그 언어, 아니면 한국어. */
function detectLocale(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const langs = [navigator.language, ...(navigator.languages ?? [])].map((l) => (l || "").toLowerCase());
  if (langs.some((l) => l.startsWith("mn"))) return "mn";
  if (langs.some((l) => l.startsWith("en"))) return "en";
  return "ko";
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // 쿠키가 있으면 그 값, 없으면 브라우저 언어로 첫 추정.
    const saved = readCookieRaw();
    if (isLocale(saved)) {
      setLocaleState(saved);
      document.documentElement.lang = saved;
      return;
    }
    const guess = detectLocale();
    setLocaleState(guess);
    document.documentElement.lang = guess;
    // 추정이 한국어가 아니면 쿠키 저장 + 서버 본문도 그 언어로 다시 렌더.
    if (guess !== DEFAULT_LOCALE) {
      try { document.cookie = `${LOCALE_COOKIE}=${guess}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`; } catch { /* ignore */ }
      router.refresh();
    }
  }, [router]);

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

/** 헤더의 언어 선택 — 드롭다운 리스트(언어 추가 대비). */
export function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t(locale, "lang.aria")}
        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-extrabold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <span aria-hidden className="text-[11px]">🌐</span>
        {LOCALE_SHORT[locale]}
        <span className="text-[8px] opacity-70">▾</span>
      </button>
      {open && (
        <div role="listbox" className="absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border py-1 shadow-xl" style={{ background: "rgba(255,250,237,.99)", borderColor: "rgba(77,56,34,.18)" }}>
          {LOCALES.map((l) => {
            const on = l === locale;
            return (
              <button
                key={l}
                role="option"
                aria-selected={on}
                onClick={() => { setLocale(l); setOpen(false); }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px] font-bold transition-colors hover:bg-[#f2e3c8]"
                style={{ color: on ? "#9b3d2d" : "#3e2c1d", background: on ? "rgba(155,61,45,.07)" : "transparent" }}
              >
                <span>{LOCALE_NAME[l]}</span>
                <span className="text-[10.5px] opacity-60">{LOCALE_SHORT[l]}{on ? " ✓" : ""}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
