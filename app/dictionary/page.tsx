import type { Metadata } from "next";
import Link from "next/link";
import { cemeteryPlaceIds, peopleBuriedAt, getPlace, getPeople } from "@/lib/data";
import { WIKIDATA_VERIFIED } from "@/lib/data/dictionary";
import { BURIED_EXTRA, BURIED_SOURCE, BURIED_TOTAL } from "@/lib/data/cemetery";
import { PHOTOS } from "@/lib/data/photos";
import { isFeatured } from "@/lib/data/meta";

export const metadata: Metadata = { title: "인명사전 · 조선 선교사 자료실" };

function Badge({ verified }: { verified: boolean }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={verified ? { background: "rgba(63,127,75,.15)", color: "#2f6b3b" } : { background: "rgba(191,107,34,.14)", color: "#a0641f" }}
    >
      {verified ? "Wikidata 확인" : "문헌 기반"}
    </span>
  );
}

export default function DictionaryPage() {
  // cemeteries that have either roster burials or dictionary-only entries
  const ids = [...new Set([...cemeteryPlaceIds(), ...Object.keys(BURIED_EXTRA)])];
  const everyone = getPeople(); // 전체 로스터(연도순)
  const featuredCount = everyone.filter((p) => isFeatured(p.id)).length;

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">
        Biographical Dictionary
      </p>
      <h1 className="font-display mt-2 text-3xl font-black tracking-tight text-ink-900 sm:text-4xl">
        인명사전
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-600">
        전체 인명을 먼저 한눈에 모았고, 아래에는 묘역별로 안장된 인물을 정리했습니다.
        대표 선교사는 ★로 표시되며, 핵심 인물은 상세 프로필로, 그 밖의 인물은
        Wikidata 매장지 기록(P119)으로 교차검증해 출처와 함께 실었습니다.
      </p>

      {/* ── 전체 인명 리스트(대표/전체 분리) ── */}
      <section className="mt-12">
        <div className="flex items-end justify-between border-b border-ink-200 pb-3">
          <h2 className="font-display text-2xl font-black tracking-tight text-ink-900">전체 인명 <span className="text-[13px] font-semibold text-ink-400">· 입국·활동 연도순</span></h2>
          <span className="text-[13px] font-bold text-ink-500">{everyone.length}명 · 대표 {featuredCount}명</span>
        </div>
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
          {everyone.map((p) => {
            const photo = PHOTOS[p.id]?.photo;
            const feat = isFeatured(p.id);
            return (
              <li key={p.id} className="border-b border-ink-100">
                <Link href={`/people/${p.id}`} className="flex items-center gap-3 py-3 transition-colors hover:bg-ink-50">
                  {photo ? (
                    <img src={photo} alt="" className="h-10 w-10 flex-none rounded-full object-cover" style={{ background: "var(--ink-100)" }} />
                  ) : (
                    <span className="font-display flex h-10 w-10 flex-none items-center justify-center rounded-full text-lg" style={{ background: "var(--ink-100)", color: "var(--ink-700)" }}>{p.glyph}</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      {feat && <span className="text-[11px] text-[#bf6b22]">★</span>}
                      <span className="text-[15px] font-extrabold text-ink-900">{p.name}</span>
                      <span className="text-[12px] font-bold text-ink-400">{p.year}</span>
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-500">{p.en} · {p.life} · {p.org}</span>
                  </span>
                  <span className="flex-none text-[13px] font-bold text-sky-600">→</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <h2 className="font-display mt-16 text-2xl font-black tracking-tight text-ink-900">묘역별 안장 인물</h2>

      {ids.map((id) => {
        const place = getPlace(id);
        const roster = peopleBuriedAt(id);
        const extra = BURIED_EXTRA[id] ?? [];
        const total = roster.length + extra.length;
        const totalNote = BURIED_TOTAL[id];
        const srcs = BURIED_SOURCE[id] ?? [];
        return (
          <section key={id} className="mt-12">
            <div className="flex items-end justify-between border-b border-ink-200 pb-3">
              <h2 className="font-display text-2xl font-black tracking-tight text-ink-900">
                {place?.name ?? id}
              </h2>
              <span className="text-[13px] font-bold text-ink-500">수록 {total}명</span>
            </div>
            {totalNote && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-500">{totalNote}</p>}
            {srcs.length > 0 && (
              <p className="mt-2 text-[11.5px] text-ink-400">
                명단 출처: {srcs.map((u, i) => (
                  <a key={i} href={u} target="_blank" rel="noreferrer" className="text-sky-600 underline">[{i + 1}]</a>
                ))}
              </p>
            )}

            <ul className="mt-4 divide-y divide-ink-200">
              {roster.map((p) => {
                const photo = PHOTOS[p.id]?.photo;
                return (
                  <li key={p.id}>
                    <Link href={`/people/${p.id}`} className="flex items-center gap-3 py-3 transition-colors hover:bg-ink-50">
                      {photo ? (
                        <img src={photo} alt="" className="h-10 w-10 flex-none rounded-full object-cover" style={{ background: "var(--ink-100)" }} />
                      ) : (
                        <span className="font-display flex h-10 w-10 flex-none items-center justify-center rounded-full text-lg" style={{ background: "var(--ink-100)", color: "var(--ink-700)" }}>{p.glyph}</span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[15px] font-extrabold text-ink-900">{p.name}</span>
                          <Badge verified={WIKIDATA_VERIFIED.has(p.id)} />
                        </span>
                        <span className="block text-[12.5px] text-ink-500">{p.en} · {p.life} · {p.org}</span>
                      </span>
                      <span className="flex-none text-[13px] font-bold text-sky-600">프로필 →</span>
                    </Link>
                  </li>
                );
              })}

              {extra.map((e, i) => (
                <li key={(e.nameEn || e.nameKo) + i} className="flex items-center gap-3 py-3">
                  {e.photo ? (
                    <img src={e.photo} alt="" className="h-10 w-10 flex-none rounded-full object-cover" style={{ background: "var(--ink-100)" }} />
                  ) : (
                    <span className="font-display flex h-10 w-10 flex-none items-center justify-center rounded-full text-[15px]" style={{ background: "var(--ink-100)", color: "var(--ink-500)" }}>✝</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[15px] font-extrabold text-ink-900">{e.nameKo || e.nameEn}</span>
                      {e.uncertain
                        ? <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(120,100,80,.12)", color: "#7a6a52" }}>확인 필요</span>
                        : <Badge verified />}
                    </span>
                    <span className="block text-[12.5px] text-ink-500">{[e.nameKo && e.nameEn, e.life, e.role].filter(Boolean).join(" · ")}</span>
                    {e.note && <span className="block text-[12px] text-ink-400">※ {e.note}</span>}
                  </span>
                  {e.wiki && <a href={e.wiki} target="_blank" rel="noreferrer" className="flex-none text-[12px] font-bold text-ink-500 underline">위키 ↗</a>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-12 rounded-2xl border-l-4 border-[#bf6b22] bg-[rgba(191,107,34,.08)] p-4 text-[13px] leading-relaxed text-[#664221]">
        교차검증: 묘역별 안장 명단은 양화진 외국인선교사묘원 공식 자료·한국민족문화대백과·
        지자체 문화원·기독교 역사 자료 등 <b>실제 출처로 대조</b>해 채웠습니다(각 묘역 상단의
        ‘명단 출처’ 참조). 가묘(假墓)·타지 안장·생몰 불확실 등은 ‘확인 필요’로 표기하고, 실제
        안장이 확인된 인물만 수록했습니다. 본 자료실에 개별 인물카드가 있는 분은 위 ‘프로필’로,
        그 외 안장자는 출처 링크로 확인하실 수 있습니다.
      </p>
    </div>
  );
}
