import type { Metadata } from "next";
import Link from "next/link";
import { TOPICS } from "@/lib/data/topics";
import { getPerson } from "@/lib/data";
import { PHOTOS } from "@/lib/data/photos";

export const metadata: Metadata = { title: "주제연구" };

export default function ResearchIndex() {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">Topic Research</p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">주제연구</h1>
      <p className="font-serif mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-600">
        하나의 주제 아래 선교사들을 묶으면, 사이트에 흩어진 자산 — 인물·관계·장소·유적·링크·활동기간 —
        을 모아 <b className="text-ink-800">하나의 통합 리포트</b>로 보여줍니다. 흐름을 따라 한 주제를 깊이 들여다보세요.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-5">
        {TOPICS.map((t) => {
          const ppl = t.people.map((id) => getPerson(id)).filter(Boolean);
          return (
            <Link key={t.id} href={`/research/${t.id}`} className="block rounded-3xl border border-ink-200 bg-white p-6 transition-colors hover:border-sky-300">
              <h2 className="font-serif text-2xl font-bold text-ink-900">{t.title}</h2>
              <p className="font-serif mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-600">{t.intro}</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {ppl.slice(0, 6).map((p) => p && (
                    PHOTOS[p.id]?.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={p.id} src={PHOTOS[p.id]!.photo!} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" style={{ background: "#efe1c3" }} />
                    ) : (
                      <span key={p.id} className="font-display flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[13px] text-white" style={{ background: "var(--grad-dream)" }}>{p.glyph}</span>
                    )
                  ))}
                </div>
                <span className="text-[12.5px] font-bold text-ink-500">선교사 {t.people.length}명 · 통합 리포트 보기 →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
