import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  PEOPLE,
  getPerson,
  getPlace,
  relationshipsFor,
  resourcesFor,
} from "@/lib/data";

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const person = getPerson(id);
  return { title: person ? `${person.name} · 조선 선교사 자료실` : "인물" };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = getPerson(id);
  if (!person) notFound();

  const place = getPlace(person.place);
  const rels = relationshipsFor(person.id);
  const sources = resourcesFor(person);

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-7">
      <Link
        href="/people"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-500 hover:text-sky-600"
      >
        <ArrowLeft size={15} /> 인물 목록
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-wrap items-start gap-5">
        <span
          className="font-display flex h-20 w-20 flex-none items-center justify-center rounded-3xl text-5xl text-white"
          style={{ background: "var(--grad-dream)", boxShadow: "var(--shadow-sky)" }}
        >
          {person.glyph}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
            {person.name}
          </h1>
          <p className="mt-1 text-[15px] font-semibold text-ink-500">
            {person.en} · {person.life} · {person.country}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-500 px-3 py-1 text-[12px] font-bold text-white">
              {person.org}
            </span>
            <span className="rounded-full bg-ink-100 px-3 py-1 text-[12px] font-bold text-ink-700">
              {person.role}
            </span>
            {place && (
              <Link
                href={`/map?place=${place.id}`}
                className="rounded-full bg-ink-100 px-3 py-1 text-[12px] font-bold text-ink-700 hover:bg-ink-200"
              >
                ⚓ {place.name}
              </Link>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-[16px] leading-relaxed text-ink-700">{person.summary}</p>

      {/* Facts */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {person.facts.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-ink-200 bg-white p-4">
            <div className="text-[11px] font-bold uppercase tracking-wide text-ink-400">
              {label}
            </div>
            <div className="mt-1 text-[14px] font-bold text-ink-800">{value}</div>
          </div>
        ))}
      </div>

      <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Timeline */}
        <section>
          <h2 className="font-display text-lg font-extrabold text-ink-900">연표</h2>
          <ol className="mt-4 space-y-0">
            {person.timeline.map(([yr, text], i) => (
              <li key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span className="font-display mt-0.5 w-12 flex-none text-right text-[14px] font-extrabold text-sky-600">
                    {yr}
                  </span>
                </div>
                <div className="relative flex-1 pb-5">
                  <span className="absolute -left-[13px] top-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-sky-100" />
                  <span className="absolute -left-[7px] top-3 h-full w-px bg-ink-200 last:hidden" />
                  <p className="text-[14px] leading-relaxed text-ink-700">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Side: relationships + media + sources */}
        <aside className="space-y-7">
          {rels.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">관계</h2>
              <ul className="mt-3 space-y-2">
                {rels.map((r, i) => {
                  const other = r.from.id === person.id ? r.to : r.from;
                  const dir = r.from.id === person.id ? "→" : "←";
                  return (
                    <li key={i}>
                      <Link
                        href={`/people/${other.id}`}
                        className="flex items-center gap-2.5 rounded-2xl border border-ink-200 bg-white p-3 transition-colors hover:border-sky-300"
                      >
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                          style={{ background: r.meta.color }}
                        >
                          {r.meta.label}
                        </span>
                        <span className="text-[13px] font-bold text-ink-800">
                          {dir} {other.name}
                        </span>
                      </Link>
                      <p className="mt-1 pl-1 text-[12px] text-ink-500">{r.note}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div>
            <h2 className="font-display text-lg font-extrabold text-ink-900">자료</h2>
            <div className="mt-3 space-y-2 text-[13px]">
              {person.video && (
                <div className="rounded-2xl border border-ink-200 bg-white p-3">
                  <span className="font-bold text-iris-600">영상 </span>
                  <span className="text-ink-700">{person.video}</span>
                </div>
              )}
              {person.interview && (
                <div className="rounded-2xl border border-ink-200 bg-white p-3">
                  <span className="font-bold text-aqua-700">인터뷰 </span>
                  <span className="text-ink-700">“{person.interview}”</span>
                </div>
              )}
              {person.photos.map((ph, i) => (
                <div key={i} className="rounded-2xl border border-ink-200 bg-white p-3">
                  <span className="font-bold text-sky-600">사진 </span>
                  <span className="text-ink-700">{ph}</span>
                </div>
              ))}
            </div>
          </div>

          {sources.length > 0 && (
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">
                참고 출처
              </h2>
              <ul className="mt-3 space-y-2">
                {sources.map((s, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-ink-200 bg-white p-3"
                  >
                    <div className="text-[13px] font-bold text-ink-800">{s.t}</div>
                    <div className="text-[12px] text-ink-500">{s.a}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
