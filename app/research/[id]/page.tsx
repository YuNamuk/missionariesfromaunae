import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TOPICS, topicById, type Topic } from "@/lib/data/topics";
import { fetchDbTopics } from "@/lib/db/topics";
import { getPerson, getPlace, getRelationships, activePeriods, type Person } from "@/lib/data";
import { profileFor } from "@/lib/data/profiles";
import { PHOTOS } from "@/lib/data/photos";
import { Portrait } from "@/components/color-mode";
import { HERITAGE } from "@/lib/data/heritage";

export const revalidate = 300;

export function generateStaticParams() {
  return TOPICS.map((t) => ({ id: t.id }));
}

async function resolveTopic(id: string): Promise<Topic | undefined> {
  const db = await fetchDbTopics();
  return db.find((t) => t.id === id) ?? topicById(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const t = await resolveTopic(id);
  return { title: t ? t.title : "주제연구" };
}

const MIN = 1882, MAX = 1965, SP = MAX - MIN;
const pct = (y: number) => ((Math.max(MIN, Math.min(MAX, y)) - MIN) / SP) * 100;
function orgTint(org: string) {
  if (org.includes("북장로회")) return "#1f6f8b";
  if (org.includes("북감리회")) return "#875da7";
  if (org.includes("권서") || org.includes("조선") || org.includes("개종")) return "#bf6b22";
  return "#3f7f4b";
}

export default async function ResearchReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await resolveTopic(id);
  if (!topic) notFound();

  const people = topic.people.map((pid) => getPerson(pid)).filter(Boolean) as Person[];
  const ids = new Set(people.map((p) => p.id));
  const names = new Set(people.map((p) => p.name));

  // 이 주제 인물들 '사이'의 관계만
  const edges = getRelationships().filter((r) => ids.has(r.from.id) && ids.has(r.to.id));

  // 장소(중복 제거) + 관련 유적
  const placeIds = [...new Set(people.map((p) => p.place))];
  const places = placeIds.map((p) => getPlace(p)).filter(Boolean);
  const heritage = HERITAGE.filter((h) => h.people.some((nm) => names.has(nm)));

  // 통합 링크(중복 제거)
  const linkMap = new Map<string, { title: string; url: string; publisher?: string }>();
  for (const p of people) {
    const ph = PHOTOS[p.id];
    if (ph?.wiki) linkMap.set(ph.wiki, { title: `${p.name} — 위키백과`, url: ph.wiki });
    if (ph?.wikiEn) linkMap.set(ph.wikiEn, { title: `${p.name} — Wikipedia`, url: ph.wikiEn });
    for (const r of profileFor(p.id)?.refs ?? []) if (!linkMap.has(r.url)) linkMap.set(r.url, r);
  }
  const links = [...linkMap.values()];

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-7">
      <Link href="/research" className="text-[13px] font-bold text-ink-400 hover:text-sky-600">← 주제연구</Link>
      <p className="mt-4 text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">Topic Research · 통합 리포트</p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-[40px]">{topic.title}</h1>
      <p className="font-serif mt-4 text-[17px] leading-[2.0] text-ink-700">{topic.intro}</p>
      <p className="mt-3 text-[12.5px] font-bold text-ink-400">선교사 {people.length}명{topic.era ? ` · ${topic.era}` : ""}{topic.by ? ` · ${topic.by}` : ""}</p>

      {topic.analysis && (
        <section className="mt-8 rounded-3xl border p-6 sm:p-7" style={{ borderColor: "rgba(31,111,139,.3)", background: "var(--aqua-50)" }}>
          <div className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-aqua-700">AI 분석 · 상관관계·시대 배경·역할·영향</div>
          <div className="font-serif mt-3 whitespace-pre-wrap text-[15px] leading-[1.95] text-ink-800">{topic.analysis}</div>
          <p className="mt-3 text-[11px] text-ink-400">선택 선교사의 사이트 검증 데이터(요약·연표·관계·인용)를 근거로 생성·검토된 분석입니다.</p>
        </section>
      )}

      {/* 활동기간 */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-extrabold text-ink-900">활동기간</h2>
        <div className="mt-3 rounded-2xl border border-ink-200 bg-white p-4">
          {[...people].sort((a, b) => a.year - b.year).map((p) => {
            const per = activePeriods(p);
            return (
              <div key={p.id} className="flex items-center" style={{ height: 24 }}>
                <Link href={`/people/${p.id}`} className="flex-none truncate pr-2 text-[12px] font-bold text-ink-700 hover:text-sky-600" style={{ width: 92 }}>{p.name}</Link>
                <div className="relative h-full flex-1">
                  {[1900, 1920, 1940, 1960].map((d) => <span key={d} className="absolute top-0 h-full w-px bg-ink-100" style={{ left: `${pct(d)}%` }} />)}
                  {per.map(([s, e], i) => (
                    <span key={i} className="absolute top-1/2 -translate-y-1/2 rounded-full" style={{ left: `${pct(s)}%`, width: `${Math.max(0.8, pct(e) - pct(s))}%`, height: 10, background: orgTint(p.org) }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 선교사 카드 */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-extrabold text-ink-900">이 주제의 선교사</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {people.map((p) => {
            const pr = profileFor(p.id);
            const photo = PHOTOS[p.id]?.photo;
            return (
              <Link key={p.id} href={`/people/${p.id}`} className="block rounded-2xl border border-ink-200 bg-white p-4 transition-colors hover:border-sky-300">
                <div className="flex gap-3">
                  {photo ? (
                    <Portrait id={p.id} src={photo} alt={`${p.name} 초상`} controls badge className="flex-none rounded-xl object-cover" style={{ background: "#efe1c3", width: 52, height: 64 }} />
                  ) : (
                    <span className="font-display flex flex-none items-center justify-center rounded-xl text-2xl text-white" style={{ background: "var(--grad-dream)", width: 52, height: 64 }}>{p.glyph}</span>
                  )}
                  <div className="min-w-0">
                    <div className="font-serif text-[16px] font-bold text-ink-900">{p.name} <span className="text-[12px] font-normal text-ink-400">{p.life}</span></div>
                    <div className="text-[11.5px] font-bold text-sky-700">{p.org} · {p.role}</div>
                    <p className="font-serif mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-ink-600">{pr?.quote ? `“${pr.quote.text}”` : p.summary}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 관계의 흐름 */}
      {edges.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-extrabold text-ink-900">관계의 흐름</h2>
          <ul className="mt-3 space-y-2">
            {edges.map((r, i) => (
              <li key={i} className="flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 py-2 text-[13px]">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: r.meta.color }}>{r.meta.label}</span>
                <span className="font-bold text-ink-800">{r.from.name} → {r.to.name}</span>
                {r.note && <span className="truncate text-[12px] text-ink-400">· {r.note}</span>}
              </li>
            ))}
          </ul>
          <Link href="/flow" className="mt-3 inline-block text-[13px] font-bold text-sky-600 hover:text-sky-700">선교의 흐름에서 따라가기 →</Link>
        </section>
      )}

      {/* 장소·유적 */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-extrabold text-ink-900">장소 · 유적</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {places.map((pl) => pl && (
            <Link key={pl.id} href={`/?focus=${pl.id}`} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink-700 hover:border-sky-300 hover:text-sky-700">⚓ {pl.name}</Link>
          ))}
        </div>
        {heritage.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {heritage.slice(0, 6).map((h) => (
              <Link key={h.id} href={`/?heritage=${h.id}`} className="block overflow-hidden rounded-2xl border border-ink-200 bg-white transition-colors hover:border-sky-300">
                {h.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={h.photo} alt={h.name} className="h-24 w-full object-cover" />
                )}
                <div className="p-2.5">
                  <div className="text-[12.5px] font-bold text-ink-800">{h.name}</div>
                  <div className="text-[11px] text-ink-400">{h.city} · {h.type}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 통합 링크 */}
      {links.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-extrabold text-ink-900">함께 보기 · 출처</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {links.map((l) => (
              <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="rounded-xl border border-ink-200 bg-white px-3 py-2 text-[12.5px] transition-colors hover:border-sky-300">
                <span className="font-bold text-sky-700">{l.title} ↗</span>
                {l.publisher && <span className="text-ink-400"> · {l.publisher}</span>}
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
