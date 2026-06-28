"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type FlowPerson = {
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
};

export type RelItem = { id: string; name: string; type: string; label: string; color: string; note: string; dir: string };

function PersonCard({ p }: { p: FlowPerson }) {
  return (
    <div className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-7">
      <div className="flex gap-5">
        {/* 사진 칸 + 그 아래 상세 페이지 링크 */}
        <div className="flex-none">
          {p.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.photo} alt={`${p.name} 초상`} className="h-32 w-26 rounded-2xl object-cover sm:h-36 sm:w-28" style={{ background: "#efe1c3", width: 104 }} />
          ) : (
            <span className="font-display flex h-32 w-26 items-center justify-center rounded-2xl text-5xl text-white sm:h-36 sm:w-28" style={{ background: "var(--grad-dream)", width: 104 }}>{p.glyph}</span>
          )}
          <Link href={`/people/${p.id}`} className="mt-2.5 block rounded-full bg-sky-500 px-3 py-1.5 text-center text-[12.5px] font-bold text-white hover:bg-sky-600" style={{ width: 104 }}>
            상세 페이지 →
          </Link>
        </div>
        <div className="min-w-0">
          <h2 className="font-serif text-2xl font-bold leading-tight text-ink-900">{p.name}</h2>
          <p className="font-serif mt-1 text-[13.5px] text-ink-500">{p.en} · {p.life}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-500 px-2.5 py-0.5 text-[11px] font-bold text-white">{p.org}</span>
            <span className="rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-bold text-ink-700">{p.role}</span>
          </div>
          {p.quote && (
            <figure className="mt-3 border-l-4 pl-3.5" style={{ borderColor: "#bf6b22" }}>
              <blockquote className="font-serif text-[15px] leading-[1.8] text-ink-800">&ldquo;{p.quote.text}&rdquo;</blockquote>
              <figcaption className="mt-1 text-[11px] text-ink-400">— {p.quote.source}</figcaption>
            </figure>
          )}
          <p className="font-serif mt-3 text-[14.5px] leading-[1.9] text-ink-700">{p.summary}</p>
        </div>
      </div>
    </div>
  );
}

function Column({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex w-60 flex-none flex-col rounded-2xl border border-ink-200 bg-white">
      <div className="border-b border-ink-100 px-3.5 py-2.5">
        <div className="text-[12.5px] font-extrabold text-ink-800">{title}</div>
        {sub && <div className="text-[11px] text-ink-400">{sub}</div>}
      </div>
      <div className="max-h-[360px] overflow-y-auto p-1.5">{children}</div>
    </div>
  );
}

export function FlowExplorer({ people, rels }: { people: FlowPerson[]; rels: Record<string, RelItem[]> }) {
  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);
  const [path, setPath] = useState<string[]>([]);
  const [q, setQ] = useState("");

  const starters = useMemo(
    () => people.filter((p) => !q || `${p.name} ${p.en}`.toLowerCase().includes(q.toLowerCase())),
    [people, q],
  );

  const focus = path.length ? byId[path[path.length - 1]] : null;

  // 시작 선택 + 각 단계의 연관 선교사 컬럼
  const pick = (k: number, id: string) => setPath((pp) => [...pp.slice(0, k), id]);

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">The Flow of Mission</p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">선교의 흐름</h1>
      <p className="font-serif mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-600">
        한 선교사를 고르면 그와 이어진 사람들이 옆에 펼쳐집니다. 따라가며 눌러 보세요 —
        누가 누구를 준비시키고, 길러내고, 함께 일했는지, <b className="text-ink-800">복음이 사람에서 사람으로 흘러온 길</b>이 드러납니다.
      </p>

      {/* 컬럼들: 가로 스크롤 */}
      <div className="mt-7 flex gap-3 overflow-x-auto pb-3">
        {/* 시작 컬럼 */}
        <Column title="① 처음 선교사" sub={`${people.length}명 · 입국·활동 연도순`}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="이름 검색" className="mb-1.5 w-full rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12.5px]" />
          {starters.map((p) => (
            <button key={p.id} onClick={() => pick(0, p.id)} className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] hover:bg-ink-50" style={path[0] === p.id ? { background: "#2f2419", color: "#fff8ed" } : { color: "var(--ink-800)" }}>
              <span className="font-bold">{p.name}</span>
              <span className="text-[10.5px]" style={{ opacity: 0.6 }}>{p.year}</span>
            </button>
          ))}
        </Column>

        {/* 각 선택 단계의 연관 선교사 컬럼 */}
        {path.map((id, k) => {
          const list = (rels[id] ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, "ko"));
          const chosen = path[k + 1];
          return (
            <div key={`${id}-${k}`} className="flex flex-none items-center gap-3">
              <span className="text-ink-300">→</span>
              <Column title={`${["②", "③", "④", "⑤", "⑥"][k] ?? "·"} ${byId[id]?.name}의 연관`} sub={`${list.length}명`}>
                {list.length === 0 && <div className="px-2.5 py-3 text-[12px] text-ink-400">이어진 선교사 정보가 없습니다.</div>}
                {list.map((r) => (
                  <button key={r.id + r.type} onClick={() => pick(k + 1, r.id)} className="w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-ink-50" style={chosen === r.id ? { background: "#2f2419" } : undefined}>
                    <span className="flex items-center gap-1.5">
                      <span className="rounded-full px-1.5 py-0.5 text-[9.5px] font-bold text-white" style={{ background: r.color }}>{r.label}</span>
                      <span className="text-[13px] font-bold" style={{ color: chosen === r.id ? "#fff8ed" : "var(--ink-800)" }}>{r.dir} {r.name}</span>
                    </span>
                    {r.note && <span className="mt-0.5 block text-[11px] leading-snug" style={{ color: chosen === r.id ? "rgba(255,248,236,.7)" : "var(--ink-400)" }}>{r.note}</span>}
                  </button>
                ))}
              </Column>
            </div>
          );
        })}
      </div>

      {/* 선택한 선교사 카드 */}
      <div className="mt-6">
        {focus ? <PersonCard p={focus} /> : (
          <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center font-serif text-[15px] text-ink-400">
            위에서 처음 선교사를 선택하면, 여기에 그 사람의 카드가 나타납니다.
          </div>
        )}
      </div>
    </div>
  );
}
