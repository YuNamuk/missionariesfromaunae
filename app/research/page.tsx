import type { Metadata } from "next";
import Link from "next/link";
import { TOPICS } from "@/lib/data/topics";
import { fetchAllTopics } from "@/lib/db/topics";
import { RESEARCH_COLUMNS } from "@/lib/data/columns";
import { getPerson } from "@/lib/data";
import { PHOTOS } from "@/lib/data/photos";
import { getLocale } from "@/lib/i18n/server";
import { fetchAllTopicI18n, ov } from "@/lib/i18n/content";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const l = await getLocale();
  return { title: l === "mn" ? "Сэдэвчилсэн судалгаа" : l === "en" ? "Topic Research" : "주제연구" };
}

export default async function ResearchIndex() {
  const locale = await getLocale();
  const T = (ko: string, en: string, mn: string) => (locale === "mn" ? mn : locale === "en" ? en : ko);
  const ti18n = await fetchAllTopicI18n(locale);
  const topics = await fetchAllTopics(TOPICS);
  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">Topic Research</p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{T("주제연구", "Topic Research", "Сэдэвчилсэн судалгаа")}</h1>
      <p className="font-serif mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-600">
        {T(
          "하나의 주제 아래 선교사들을 묶으면, 사이트에 흩어진 자산 — 인물·관계·장소·유적·링크·활동기간 — 을 모아 하나의 통합 리포트로 보여줍니다. 흐름을 따라 한 주제를 깊이 들여다보세요.",
          "Group missionaries under a theme and the assets scattered across the site — people, relationships, places, heritage, links, activity periods — gather into one integrated report. Follow the thread and look deeply into a single theme.",
          "Нэг сэдвийн доор номлогчдыг бүлэглэхэд сайтаар тархсан мэдээлэл — хүмүүс, харилцаа, газар, дурсгал, холбоос, хугацаа — нэг нэгдсэн тайланд цугларна. Утсыг дагаж нэг сэдвийг гүнзгий судлаарай.",
        )}
      </p>

      {/* 심화 이야기(학생 탐구 기반 컬럼) */}
      {RESEARCH_COLUMNS.length > 0 && (
        <section className="mt-9">
          <h2 className="font-display text-sm font-extrabold uppercase tracking-wide text-ink-400">{T("심화 이야기 · 학생 탐구", "Deep Dive · Student Research", "Гүнзгий · Сурагчийн судалгаа")}</h2>
          <div className="mt-3 grid grid-cols-1 gap-5">
            {RESEARCH_COLUMNS.map((c) => (
              <Link key={c.id} href={`/research/story/${c.id}`} className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-ink-200 bg-white transition-colors hover:border-sky-300 sm:grid-cols-[240px_1fr]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.hero.src} alt="" className="h-40 w-full object-cover sm:h-full" style={{ background: "var(--ink-100)" }} />
                <div className="p-6">
                  <span className="rounded-full bg-[rgba(191,107,34,.14)] px-2.5 py-1 text-[11px] font-bold text-[#a0641f]">{T("심화 컬럼", "Column", "Булан")}</span>
                  <h3 className="font-serif mt-2 text-2xl font-bold text-ink-900">{c.title}</h3>
                  <p className="font-serif mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-600">{c.dek}</p>
                  <p className="mt-3 text-[12.5px] font-bold text-sky-600">{c.author} · {T("읽어보기 →", "read →", "унших →")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-10 font-display text-sm font-extrabold uppercase tracking-wide text-ink-400">{T("주제별 통합 리포트", "Thematic Reports", "Сэдэвчилсэн тайлан")}</h2>
      <div className="mt-3 grid grid-cols-1 gap-5">
        {topics.map((t) => {
          const ppl = t.people.map((id) => getPerson(id)).filter(Boolean);
          return (
            <Link key={t.id} href={`/research/${t.id}`} className="block rounded-3xl border border-ink-200 bg-white p-6 transition-colors hover:border-sky-300">
              <h2 className="font-serif text-2xl font-bold text-ink-900">{ov(t.title, ti18n[t.id]?.title)}</h2>
              <p className="font-serif mt-2 line-clamp-2 text-[14.5px] leading-relaxed text-ink-600">{ov(t.intro, ti18n[t.id]?.intro)}</p>
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
                <span className="text-[12.5px] font-bold text-ink-500">{T(`선교사 ${t.people.length}명 · 통합 리포트 보기 →`, `${t.people.length} missionaries · view report →`, `${t.people.length} номлогч · тайлан үзэх →`)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
