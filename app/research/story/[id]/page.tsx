import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { columnById, type ImgKind } from "@/lib/data/columns";
import { getPerson } from "@/lib/data";
import { PHOTOS } from "@/lib/data/photos";
import { Portrait } from "@/components/color-mode";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const c = columnById(id);
  return c ? { title: `${c.title} — 심화 연구`, description: c.dek } : { title: "심화 연구" };
}

const KIND_BADGE: Record<ImgKind, { label: string; bg: string; fg: string }> = {
  portrait: { label: "실제 초상", bg: "rgba(63,127,75,.15)", fg: "#2f6b3b" },
  archive: { label: "기록 사진", bg: "rgba(31,111,139,.14)", fg: "#1f6f8b" },
  ai: { label: "AI 일러스트", bg: "rgba(191,107,34,.16)", fg: "#a0641f" },
};

function Figure({ src, alt, caption, credit, kind }: { src: string; alt: string; caption: string; credit: string; kind: ImgKind }) {
  const b = KIND_BADGE[kind];
  return (
    <figure className="my-8">
      <div className="relative overflow-hidden rounded-2xl border border-ink-200" style={{ background: "var(--ink-100)" }}>
        <img src={src} alt={alt} loading="lazy" decoding="async" className="w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow" style={{ background: b.bg, color: b.fg, backdropFilter: "blur(4px)" }}>
          {b.label}
        </span>
      </div>
      <figcaption className="mt-2 text-[13px] leading-relaxed text-ink-500">
        {caption} <span className="text-ink-400">· {credit}</span>
      </figcaption>
    </figure>
  );
}

export default async function ResearchColumnPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const col = columnById(id);
  if (!col) notFound();
  const person = getPerson(col.personId);
  const photo = PHOTOS[col.personId]?.photo ?? null;

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">심화 연구 · 학생 탐구</p>
      <h1 className="font-serif mt-2 text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-[40px]">{col.title}</h1>
      <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-ink-600">{col.dek}</p>
      <p className="mt-3 text-[13px] font-semibold text-ink-500">✍️ {col.author}</p>

      {/* 히어로 */}
      <Figure {...col.hero} />

      {/* 캐릭터 시트 */}
      <section className="my-10 grid grid-cols-1 gap-5 rounded-2xl border border-ink-200 bg-white p-5 sm:grid-cols-[180px_1fr]" style={{ boxShadow: "var(--shadow-sky)" }}>
        <div>
          {photo ? (
            <Portrait id={col.personId} src={photo} alt={`${person?.name ?? ""} 초상`} controls badge block className="aspect-[3/4] w-full rounded-xl object-cover" style={{ background: "var(--ink-100)" }} />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-xl text-5xl" style={{ background: "var(--grad-dream)", color: "#fff8ec" }}>✝</div>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="font-display text-2xl font-black tracking-tight text-ink-900">{person?.name ?? col.personId}</h2>
            {person?.en && <span className="text-[14px] font-semibold text-ink-400">{person.en}</span>}
          </div>
          <p className="mt-1 text-[13.5px] font-bold text-[#a0641f]">{col.sheet.tagline}</p>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {col.sheet.facts.map(([k, v]) => (
              <div key={k} className="flex gap-2 text-[13.5px]">
                <dt className="w-14 flex-none font-bold text-ink-500">{k}</dt>
                <dd className="min-w-0 text-ink-800">{v}</dd>
              </div>
            ))}
          </dl>
          {col.sheet.family && <p className="mt-3 border-t border-ink-100 pt-3 text-[13px] leading-relaxed text-ink-600">👨‍👩‍👧 {col.sheet.family}</p>}
          {person && (
            <Link href={`/people/${col.personId}`} className="mt-3 inline-block text-[13px] font-bold text-sky-600">인물 상세 페이지 →</Link>
          )}
        </div>
      </section>

      {/* 도입 */}
      <div className="space-y-4">
        {col.lead.map((p, i) => (
          <p key={i} className="text-[16.5px] leading-[1.9] text-ink-800 first:text-[18px] first:font-medium first:text-ink-900">{p}</p>
        ))}
      </div>

      {/* 본문 섹션 */}
      {col.sections.map((s, i) => (
        <section key={i} className="mt-10">
          <h3 className="font-display text-[22px] font-black tracking-tight text-ink-900">{s.heading}</h3>
          {s.image && <Figure {...s.image} />}
          <div className="mt-3 space-y-4">
            {s.paragraphs.map((p, j) => (
              <p key={j} className="text-[16.5px] leading-[1.9] text-ink-800">{p}</p>
            ))}
          </div>
        </section>
      ))}

      {/* 가상 인터뷰 */}
      <section className="mt-14 rounded-2xl border-l-4 border-[#bf6b22] bg-[rgba(191,107,34,.06)] p-5 sm:p-6">
        <h3 className="font-display text-[22px] font-black tracking-tight text-ink-900">가상 인터뷰</h3>
        <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-[#a0641f]">※ {col.interviewNote}</p>
        <dl className="mt-4 space-y-5">
          {col.interview.map((qa, i) => (
            <div key={i}>
              <dt className="text-[15.5px] font-extrabold text-ink-900">Q. {qa.q}</dt>
              <dd className="mt-1.5 text-[15.5px] leading-[1.85] text-ink-700">{qa.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 출처 */}
      <section className="mt-10 rounded-xl border border-ink-200 bg-white p-4">
        <h4 className="text-[12px] font-extrabold uppercase tracking-wide text-ink-500">자료 · 출처</h4>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] leading-relaxed text-ink-600">
          {col.sources.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        <p className="mt-3 text-[12px] leading-relaxed text-ink-400">
          사실 골격은 학생 심층 연구를 통설·사료와 대조해 정정했습니다(입국 1895년, 목포 첫 예배 1898년, 광주 개척 1904년 등). 삽화는 회화체 AI 일러스트로 실제 사진과 구분해 표기했습니다.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/research" className="rounded-full border border-ink-200 px-4 py-2 text-[13px] font-bold text-ink-700 hover:bg-ink-50">← 주제연구로</Link>
        {person && <Link href={`/people/${col.personId}`} className="rounded-full bg-[#2f2419] px-4 py-2 text-[13px] font-bold text-[#fff8ed]">인물 상세 →</Link>}
      </div>
    </article>
  );
}
