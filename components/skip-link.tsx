"use client";

import { useLocale } from "@/components/locale-mode";

/** 본문 바로가기(접근성) — 로케일별. */
export function SkipLink() {
  const { locale } = useLocale();
  const label = locale === "mn" ? "Үндсэн агуулга руу" : locale === "en" ? "Skip to main content" : "본문으로 건너뛰기";
  return (
    <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:font-bold focus:text-white">
      {label}
    </a>
  );
}
