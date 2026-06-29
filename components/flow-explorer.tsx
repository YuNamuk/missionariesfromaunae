"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Portrait } from "@/components/color-mode";

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

export type RelItem = { id: string; name: string; type: string; label: string; color: string; note: string; dir: string; flow: "forward" | "lateral" | "reverse" };

// 흐름 카드: 이미지·내용을 그대로 유지한 채 화면 폭에 맞춰 작아지고(폭 공유),
// 마우스를 올리면 그 카드만 넓어지며 요약 전문이 펼쳐진다. 가로 스크롤 없음.
function FlowCard({ p, n, step }: { p: FlowPerson; n: number; step?: { rel: RelItem; fromName: string } }) {
  return (
    <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl border" style={{ height: 392, maxWidth: 300, borderColor: "rgba(77,56,34,.18)", background: "#fdf6ea", boxShadow: "0 10px 26px rgba(46,28,14,.12)" }}>
      <span className="font-display absolute right-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-extrabold" style={{ background: "rgba(255,248,236,.18)", color: "#fff8ed", border: "1px solid rgba(255,248,236,.25)" }}>{n}</span>
      {/* 다크 헤더: 초상 + 이름 (인물 카드 분위기) */}
      <div className="flex flex-none items-start gap-3 p-3.5" style={{ background: "linear-gradient(145deg,#2e2218,#5f3928)", color: "#fff8eb" }}>
        {p.photo ? (
          <Portrait id={p.id} src={p.photo} alt={`${p.name} 초상`} controls badge className="rounded-2xl object-cover" style={{ width: 66, height: 84, border: "2px solid rgba(255,248,236,.3)", background: "#efe1c3" }} />
        ) : (
          <span className="font-display flex flex-none items-center justify-center rounded-2xl text-3xl" style={{ width: 66, height: 84, background: "rgba(255,248,236,.14)", color: "#fff8eb" }}>{p.glyph}</span>
        )}
        <div className="min-w-0 pt-0.5">
          <span className="inline-block rounded-full px-2 py-0.5 text-[9.5px] font-extrabold" style={{ background: "rgba(255,255,255,.16)" }}>{p.year}년</span>
          <h2 className="font-serif mt-1 text-[18px] font-bold leading-tight" style={{ color: "#fff8eb" }}>{p.name}</h2>
          <p className="font-serif text-[11px]" style={{ color: "rgba(255,248,235,.8)" }}>{p.en}</p>
          <p className="font-serif text-[11px]" style={{ color: "rgba(255,248,235,.62)" }}>{p.life}</p>
        </div>
      </div>
      {/* 크림 바디 */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        {step && (
          <div className="flex-none rounded-2xl border px-2.5 py-2" style={{ borderColor: "rgba(31,111,139,.25)", background: "#eef5f7" }}>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: step.rel.color }}>{step.rel.label}</span>
              <span className="text-[11.5px] font-extrabold text-aqua-700">{step.rel.dir === "→" ? `${step.fromName}에게서` : `${step.fromName}와(과) 함께`}</span>
            </div>
            {step.rel.note && <p className="mt-1 text-[11px] leading-snug text-ink-600">{step.rel.note}</p>}
          </div>
        )}
        {p.quote && (
          <figure className="m-0 flex-none border-l-4 pl-2.5" style={{ borderColor: "#bf6b22" }}>
            <blockquote className="font-serif line-clamp-2 text-[12.5px] leading-snug text-ink-800">&ldquo;{p.quote.text}&rdquo;</blockquote>
          </figure>
        )}
        <p className="font-serif flex-1 overflow-y-auto text-[12.5px] leading-[1.75] text-ink-700">{p.summary}</p>
        <Link href={`/people/${p.id}`} className="flex-none text-[12px] font-bold text-sky-600 hover:text-sky-700">상세 페이지 →</Link>
      </div>
    </div>
  );
}

function Column({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="flex w-44 flex-none flex-col rounded-2xl border border-ink-200 bg-white">
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
  // 각 단계: 인물 id + 직전 인물에게서 따라온 관계(rel). 처음 선택은 rel=null.
  const [path, setPath] = useState<{ id: string; rel: RelItem | null }[]>([]);
  const [q, setQ] = useState("");

  const starters = useMemo(
    () => people.filter((p) => !q || `${p.name} ${p.en}`.toLowerCase().includes(q.toLowerCase())),
    [people, q],
  );

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
            <button key={p.id} onClick={() => setPath([{ id: p.id, rel: null }])} className="flex w-full items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-left text-[13px] hover:bg-ink-50" style={path[0]?.id === p.id ? { background: "#2f2419", color: "#fff8ed" } : { color: "var(--ink-800)" }}>
              <span className="font-bold">{p.name}</span>
              <span className="text-[10.5px]" style={{ opacity: 0.6 }}>{p.year}</span>
            </button>
          ))}
        </Column>

        {/* 각 선택 단계의 연관 선교사 컬럼 */}
        {path.map((node, k) => {
          const id = node.id;
          // 흐름은 '영향을 준' 방향으로만 진행 — 역방향(나에게 영향 준 사람)과
          // 이미 지나온 인물(현재 노드 포함 이전 단계)을 빼서 계속 돌고 도는 것을 막는다.
          // 단, 이미 고른 다음 인물(path[k+1])은 보여야 하므로 0..k까지만 제외.
          const upstream = path.slice(0, k + 1).map((nd) => nd.id);
          const list = (rels[id] ?? [])
            .filter((r) => r.flow !== "reverse" && !upstream.includes(r.id))
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, "ko"));
          // 이어질 연관이 없으면 컬럼을 만들지 않는다(끊긴 느낌 방지 — 흐름은 그냥 마무리).
          if (list.length === 0) return null;
          const chosenId = path[k + 1]?.id;
          return (
            <div key={`${id}-${k}`} className="flex flex-none items-center gap-3">
              <span className="text-ink-300">→</span>
              <Column title={`${["②", "③", "④", "⑤", "⑥"][k] ?? "·"} ${byId[id]?.name}의 연관`} sub={`${list.length}명`}>
                {list.map((r) => (
                  <button key={r.id + r.type} onClick={() => setPath((pp) => [...pp.slice(0, k + 1), { id: r.id, rel: r }])} className="w-full rounded-lg px-2.5 py-1.5 text-left hover:bg-ink-50" style={chosenId === r.id ? { background: "#2f2419" } : undefined}>
                    <span className="flex items-center gap-1.5">
                      <span className="rounded-full px-1.5 py-0.5 text-[9.5px] font-bold text-white" style={{ background: r.color }}>{r.label}</span>
                      <span className="text-[13px] font-bold" style={{ color: chosenId === r.id ? "#fff8ed" : "var(--ink-800)" }}>{r.dir} {r.name}</span>
                    </span>
                    {r.note && <span className="mt-0.5 block text-[11px] leading-snug" style={{ color: chosenId === r.id ? "rgba(255,248,236,.7)" : "var(--ink-400)" }}>{r.note}</span>}
                  </button>
                ))}
              </Column>
            </div>
          );
        })}
      </div>

      {/* 클릭한 흐름의 인물 카드들 — 아래에 차례로 쌓아 한눈에 */}
      <div className="mt-6">
        {path.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center font-serif text-[15px] text-ink-400">
            위에서 처음 선교사를 선택하면, 따라간 인물들의 카드가 여기에 차례로 쌓입니다.
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between">
              <div className="font-display text-[13px] font-extrabold text-ink-500">선택한 흐름 · {path.length}명</div>
              <button onClick={() => setPath([])} className="rounded-full border border-ink-200 px-3 py-1 text-[12px] font-bold text-ink-500 hover:border-sky-300 hover:text-sky-700">처음부터</button>
            </div>
            <div className="flex w-full gap-2">
              {path.map((node, i) => byId[node.id] && <FlowCard key={node.id + i} p={byId[node.id]} n={i + 1} step={i > 0 && node.rel ? { rel: node.rel, fromName: byId[path[i - 1].id]?.name ?? "" } : undefined} />)}
            </div>
            <p className="mt-2 text-[12px] text-ink-400">카드는 화면 폭에 맞춰 접히고, 마우스를 올리면 그 카드가 펼쳐집니다.</p>
          </>
        )}
      </div>
    </div>
  );
}
