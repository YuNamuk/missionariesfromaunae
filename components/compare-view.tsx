"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type CmpPerson = {
  id: string;
  name: string;
  en: string;
  life: string;
  org: string;
  role: string;
  year: number;
  glyph: string;
  photo: string | null;
  summary: string;
  quote: { text: string; source: string } | null;
  beauty: string | null;
  timeline: [string, string][];
};

// 생몰에서 수명(년) 추출 — '몇 해를 살았나'를 비교의 한 단면으로.
function lifespan(life: string): number | null {
  const m = life.match(/(\d{4})\D+(\d{4})/);
  if (!m) return null;
  return Number(m[2]) - Number(m[1]);
}

function Card({ p }: { p: CmpPerson }) {
  const span = lifespan(p.life);
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-7">
      <div className="flex items-start gap-4">
        {p.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.photo} alt={`${p.name} 초상`} className="h-24 w-20 flex-none rounded-2xl object-cover" style={{ background: "#efe1c3" }} />
        ) : (
          <span className="font-display flex h-24 w-20 flex-none items-center justify-center rounded-2xl text-4xl text-white" style={{ background: "var(--grad-dream)" }}>{p.glyph}</span>
        )}
        <div className="min-w-0">
          <h2 className="font-serif text-2xl font-bold leading-tight text-ink-900">{p.name}</h2>
          <p className="font-serif mt-1 text-[13.5px] text-ink-500">{p.en} · {p.life}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-500 px-2.5 py-0.5 text-[11px] font-bold text-white">{p.org}</span>
            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-700">{p.role}</span>
          </div>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-ink-50 p-3">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">입국·활동</dt>
          <dd className="font-display mt-0.5 text-[15px] font-extrabold text-ink-800">{p.year}년</dd>
        </div>
        <div className="rounded-2xl bg-ink-50 p-3">
          <dt className="text-[11px] font-bold uppercase tracking-wide text-ink-400">산 햇수</dt>
          <dd className="font-display mt-0.5 text-[15px] font-extrabold text-ink-800">{span != null ? `${span}년` : "—"}</dd>
        </div>
      </dl>

      {p.quote && (
        <figure className="mt-5 border-l-4 pl-4" style={{ borderColor: "#bf6b22" }}>
          <blockquote className="font-serif text-[16px] leading-[1.85] text-ink-800">&ldquo;{p.quote.text}&rdquo;</blockquote>
          <figcaption className="mt-1.5 text-[11.5px] text-ink-400">— {p.quote.source}</figcaption>
        </figure>
      )}

      <p className="font-serif mt-5 text-[15px] leading-[1.95] text-ink-700">{p.summary}</p>

      {p.beauty && (
        <section className="mt-5">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "#9b3d2d" }}>이 삶에서 아름다운 것 · 치른 값</div>
          <p className="font-serif mt-2 text-[14.5px] leading-[1.9] text-ink-700">{p.beauty}</p>
        </section>
      )}

      {p.timeline.length > 0 && (
        <ol className="mt-5 space-y-1.5">
          {p.timeline.slice(0, 4).map(([yr, t], i) => (
            <li key={i} className="flex gap-3 text-[13px]">
              <span className="font-display w-12 flex-none text-right font-extrabold text-sky-600">{yr}</span>
              <span className="font-serif leading-snug text-ink-600">{t}</span>
            </li>
          ))}
        </ol>
      )}

      <Link href={`/people/${p.id}`} className="mt-5 inline-block text-[13px] font-bold text-sky-600 hover:text-sky-700">{p.name}의 생애 자세히 →</Link>
    </div>
  );
}

export function CompareView({ people }: { people: CmpPerson[] }) {
  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  // 기본: 대조가 큰 두 삶(일찍 떠난 이 vs 오래 섬긴 이)이 있으면 그것으로.
  const youngId = people.find((p) => p.id === "wjhall")?.id ?? people[0]?.id;
  const longId = people.find((p) => p.id === "gale")?.id ?? people[people.length - 1]?.id;
  const [a, setA] = useState<string>(youngId);
  const [b, setB] = useState<string>(longId);
  const pa = byId[a];
  const pb = byId[b];

  const sel = "rounded-xl border border-ink-200 bg-white px-3 py-2 text-[14px] font-bold text-ink-800";

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">Two Lives, Side by Side</p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">두 삶을 나란히</h1>
      <p className="font-serif mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-600">
        몇 달 만에 순직한 이와 반세기를 섬긴 이, 의사와 교사, 떠나온 이와 길러낸 이 —
        두 사람을 나란히 놓고 물어봅니다. <b className="text-ink-800">아름다운 삶은 무엇일까?</b>
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <select value={a} onChange={(e) => setA(e.target.value)} className={sel} aria-label="왼쪽 인물 선택">
          {people.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.year}</option>)}
        </select>
        <span className="text-ink-400">vs</span>
        <select value={b} onChange={(e) => setB(e.target.value)} className={sel} aria-label="오른쪽 인물 선택">
          {people.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.year}</option>)}
        </select>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {pa && <Card p={pa} />}
        {pb && <Card p={pb} />}
      </div>

      <section className="mt-10 rounded-3xl p-7 text-center sm:p-9" style={{ background: "linear-gradient(145deg,#2e2218,#5f3928)", color: "#fff8ec" }}>
        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "#e8a765" }}>잠시, 묻는 자리</div>
        <p className="mx-auto mt-3 max-w-xl font-serif text-[20px] font-bold leading-snug sm:text-[23px]">
          길이가 아니라 무게라면,
          <br />
          당신은 어느 삶을 더 아름답다고 느꼈나요?
        </p>
        <p className="mx-auto mt-4 max-w-xl font-serif text-[14px] leading-loose" style={{ color: "rgba(255,248,236,.8)" }}>
          정답은 없습니다. 다만, 두 사람이 각자 치른 값을 떠올려 보세요.
        </p>
      </section>
    </div>
  );
}
