"use client";

import { useState } from "react";
import type { GalleryPhoto } from "@/lib/data/gallery";

// 원본 사진 모음 — 기본은 '원본'(흑백/세피아)로 보여 사료의 느낌을 살리고,
// 제목 옆 [원본|컬러] 토글로 '컬러'를 눌렀을 때만 같은 톤의 AI 복원 컬러본으로 전환한다.
export function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  const [showColor, setShowColor] = useState(false); // 기본 흑백(원본)
  if (!photos.length) return null;
  const hasColor = photos.some((g) => g.srcColor);
  return (
    <section id="gallery" className="mt-10 scroll-mt-28">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-lg font-extrabold text-ink-900">
          원본 사진 모음 <span className="text-[12px] font-semibold text-ink-400">· {photos.length}점</span>
        </h2>
        {hasColor && (
          <div className="flex overflow-hidden rounded-full border border-ink-200">
            {([["원본", false], ["컬러", true]] as const).map(([lbl, val]) => (
              <button
                key={lbl}
                onClick={() => setShowColor(val)}
                className="px-3 py-1 text-[12px] font-bold transition-colors"
                style={showColor === val ? { background: "#9b3d2d", color: "#fff8ed" } : { background: "transparent", color: "var(--ink-500)" }}
              >
                {lbl}
              </button>
            ))}
          </div>
        )}
      </div>
      <p className="mt-1 text-[12px] text-ink-400">공개 자료에서 본인으로 확인된 사진입니다. 기본은 원본(흑백)이며, ‘컬러’를 누르면 같은 톤의 AI 복원본으로 봅니다.</p>
      {/* 원본 비율을 살린 메이슨리(벽돌형) 갤러리 — 세로/가로 사진이 자연스럽게 어우러진다. */}
      <div className="mt-4 columns-2 gap-4 md:columns-3">
        {photos.map((g, i) => {
          const colored = showColor && !!g.srcColor;
          return (
            <figure key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-ink-200 bg-white">
              <span className="relative block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={colored ? (g.srcColor as string) : g.src} alt={g.caption} loading="lazy" className="block h-auto w-full" style={{ background: "#efe1c3" }} />
                {colored && (
                  <span className="absolute left-1.5 top-1.5 rounded-full px-1.5 py-0.5 text-[8.5px] font-extrabold" style={{ background: "rgba(40,26,14,.78)", color: "#ffe7c2" }}>AI 복원</span>
                )}
              </span>
              <figcaption className="p-2.5">
                <p className="text-[12px] leading-snug text-ink-700">{g.caption}</p>
                {g.sourceUrl ? (
                  <a href={g.sourceUrl} target="_blank" rel="noreferrer" className="mt-1 block text-[11px] font-bold text-sky-600 hover:text-sky-700">{g.source} ↗</a>
                ) : (
                  <span className="mt-1 block text-[11px] text-ink-400">{g.source}</span>
                )}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
