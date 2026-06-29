"use client";

import { useColorMode } from "@/components/color-mode";
import type { GalleryPhoto } from "@/lib/data/gallery";

// 원본 사진 모음 — 전역 컬러 모드가 켜지고 컬러 복원본(srcColor)이 있으면 같은 톤의 컬러로 전환.
export function GallerySection({ photos }: { photos: GalleryPhoto[] }) {
  const { color } = useColorMode();
  if (!photos.length) return null;
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-extrabold text-ink-900">
        원본 사진 모음 <span className="text-[12px] font-semibold text-ink-400">· {photos.length}점</span>
      </h2>
      <p className="mt-1 text-[12px] text-ink-400">공개 자료에서 본인으로 확인된 사진. 컬러는 같은 톤의 AI 복원본입니다(설정 🎨로 전환).</p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((g, i) => {
          const showColor = color && !!g.srcColor;
          return (
            <figure key={i} className="m-0 overflow-hidden rounded-2xl border border-ink-200 bg-white">
              <span className="relative block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={showColor ? (g.srcColor as string) : g.src} alt={g.caption} loading="lazy" className="aspect-[3/4] w-full object-cover" style={{ background: "#efe1c3" }} />
                {showColor && (
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
