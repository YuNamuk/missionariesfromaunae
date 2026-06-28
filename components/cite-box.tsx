"use client";

import { useState } from "react";

/** 인물 페이지 하단의 '이 페이지 인용하기' 블록.
 *  출처표기 원칙(아카이브로서 인용 가능)을 지면에서 실천한다. 열람일은 브라우저 기준. */
export function CiteBox({ name, en, life, url }: { name: string; en?: string; life?: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const today = new Date();
  const ymd = `${today.getFullYear()}. ${today.getMonth() + 1}. ${today.getDate()}.`;
  const who = [name, en && `(${en}${life ? `, ${life}` : ""})`].filter(Boolean).join(" ");
  const citation = `우리는 아우내에서 온 선교사입니다(Missionaries from Aunae). 「${who}」. ${url} (열람: ${ymd})`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* 클립보드 차단 환경: 무시(텍스트는 그대로 보임) */
    }
  };

  return (
    <section className="mt-10 rounded-2xl border border-ink-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[13px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
          이 페이지 인용하기
        </h2>
        <button
          onClick={copy}
          className="flex-none rounded-full border border-ink-200 px-3 py-1 text-[12px] font-bold text-ink-600 transition-colors hover:border-sky-300 hover:text-sky-700"
        >
          {copied ? "복사됨 ✓" : "복사"}
        </button>
      </div>
      <p className="mt-2 font-serif text-[13.5px] leading-relaxed text-ink-700">{citation}</p>
    </section>
  );
}
