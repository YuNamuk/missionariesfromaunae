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
  BURIAL,
} from "@/lib/data";
import { PHOTOS } from "@/lib/data/photos";
import { profileFor } from "@/lib/data/profiles";

export function generateStaticParams() {
  return PEOPLE.map((p) => ({ id: p.id }));
}

// YouTube 영상 ID 추출(watch?v= / youtu.be / embed). 페이지 내 임베드 재생용.
function ytId(url: string): string | null {
  const m =
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/embed\/([\w-]{11})/);
  return m ? m[1] : null;
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
  // 같은 종류(관계 유형)끼리 묶고, 관련 인물의 간단한 소개(사역·생애)를 함께 둔다.
  const relGroups = (() => {
    const m = new Map<string, { color: string; items: { id: string; name: string; dir: string; note: string; role: string; org: string; life: string }[] }>();
    for (const r of rels) {
      const otherRef = r.from.id === person.id ? r.to : r.from;
      const dir = r.from.id === person.id ? "→" : "←";
      const o = getPerson(otherRef.id);
      if (!m.has(r.meta.label)) m.set(r.meta.label, { color: r.meta.color, items: [] });
      m.get(r.meta.label)!.items.push({ id: otherRef.id, name: otherRef.name, dir, note: r.note, role: o?.role ?? "", org: o?.org ?? "", life: o?.life ?? "" });
    }
    return [...m.entries()];
  })();
  const sources = resourcesFor(person);
  const ph = PHOTOS[person.id];
  const photo = ph?.photo ?? null;
  const photoSource = ph?.source ?? "";
  const extLinks = [
    ph?.wiki ? { label: "위키백과", href: ph.wiki } : null,
    ph?.wikiEn ? { label: "Wikipedia (EN)", href: ph.wikiEn } : null,
    ph?.namu ? { label: "나무위키", href: ph.namu } : null,
  ].filter((x): x is { label: string; href: string } => !!x && !!x.href);
  const profile = profileFor(person.id);
  const burialPlace = BURIAL[person.id] ? getPlace(BURIAL[person.id]) : null;

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missionaries-khaki.vercel.app";
  const [birth, death] = (person.life.match(/(\d{4})\D+(\d{4})/)?.slice(1) ?? []) as (string | undefined)[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    alternateName: person.en,
    description: person.summary,
    nationality: person.country,
    affiliation: person.org,
    ...(birth ? { birthDate: birth } : {}),
    ...(death ? { deathDate: death } : {}),
    ...(photo ? { image: new URL(photo, SITE_URL).toString() } : {}),
    url: `${SITE_URL}/people/${person.id}`,
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 sm:px-7">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link
        href="/people"
        className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-500 hover:text-sky-600"
      >
        <ArrowLeft size={15} /> 인물 목록
      </Link>

      {/* Header */}
      <div className="mt-5 flex flex-wrap items-start gap-5">
        {photo ? (
          <span className="flex-none">
            <img
              src={photo}
              alt={person.name}
              className="h-36 w-28 rounded-2xl object-cover sm:h-44 sm:w-36"
              style={{ boxShadow: "var(--shadow-sky)", background: "#efe1c3" }}
            />
            {photoSource && (
              <span className="mt-1.5 block max-w-36 text-[9px] leading-tight text-ink-400">
                {photoSource}
              </span>
            )}
          </span>
        ) : (
          <span
            className="font-display flex h-36 w-28 flex-none items-center justify-center rounded-2xl text-6xl text-white sm:h-44 sm:w-36"
            style={{ background: "var(--grad-dream)", boxShadow: "var(--shadow-sky)" }}
          >
            {person.glyph}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink-900 sm:text-[40px]">
            {person.name}
          </h1>
          <p className="font-serif mt-1.5 text-[15px] text-ink-500">
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

      {/* 그 사람의 말로 페이지를 연다 — 검증된 1차 자료 인용(있을 때만) */}
      {profile?.quote && (
        <figure className="mt-8 border-l-4 pl-5 sm:pl-6" style={{ borderColor: "#bf6b22" }}>
          <blockquote className="font-serif text-[22px] leading-[1.8] text-ink-800 sm:text-[27px]">
            &ldquo;{profile.quote.text}&rdquo;
          </blockquote>
          <figcaption className="mt-3 text-[12.5px] leading-relaxed text-ink-400">— {profile.quote.source}</figcaption>
        </figure>
      )}

      <p className="font-serif mt-7 text-[18px] leading-[2.05] text-ink-700 sm:text-[19px]">{person.summary}</p>

      {/* 서정적 서술: 큰 흐름 속 여정(중심) · 걸어온 사역 · 남긴 열매 */}
      {profile && (
        <div className="mt-12 space-y-12">
          {/* 잔잔한 스토리텔링 서사가 있으면 그것이 지면의 중심, 없으면 '큰 흐름 속 여정' */}
          {profile.story ? (
            <section>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-iris-700">이야기</div>
              <div className="mt-5 space-y-6">
                {profile.story.map((para, i) => (
                  <p key={i} className="font-serif text-[17px] leading-[2.1] text-ink-800 sm:text-[18.5px]">{para}</p>
                ))}
              </div>
            </section>
          ) : (
            <section className="relative">
              <span aria-hidden className="font-serif block select-none text-[64px] leading-[0.6] text-rust" style={{ color: "rgba(155,61,45,.16)" }}>
                &ldquo;
              </span>
              <div className="pl-1">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-iris-700">한국 선교의 큰 흐름 속에서</div>
                <p className="font-serif mt-4 text-[21px] leading-[2.0] text-ink-800 sm:text-[23px]">{profile.journey}</p>
              </div>
            </section>
          )}

          {profile.beauty && (
            <section>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "#9b3d2d" }}>이 삶에서 아름다운 것 · 치른 값</div>
              <p className="font-serif mt-4 text-[16.5px] leading-[2.0] text-ink-700">{profile.beauty}</p>
            </section>
          )}

          {profile.ministry.length > 0 && (
            <section>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-400">걸어온 사역</div>
              <ul className="mt-4 space-y-3.5">
                {profile.ministry.map((m, i) => (
                  <li key={i} className="font-serif flex gap-3.5 text-[15.5px] leading-[1.85] text-ink-700">
                    <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full" style={{ background: "#bf6b22" }} />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-3xl p-7 sm:p-8" style={{ borderLeft: "4px solid var(--aqua-500)", background: "var(--aqua-50)" }}>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-aqua-700">남긴 열매</div>
            <p className="font-serif mt-3 text-[16.5px] leading-[2.0] text-ink-800">{profile.influence}</p>
          </section>
        </div>
      )}

      {/* Korea is home — 안장지가 있으면(이 땅에 묻힌 사실 기반) */}
      {burialPlace && (
        <section
          className="mt-6 rounded-3xl border p-6"
          style={{ borderColor: "rgba(155,61,45,.25)", background: "rgba(155,61,45,.06)" }}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-rust-600" style={{ color: "#9b3d2d" }}>
            Korea is home
          </div>
          <p className="font-serif mt-2 text-[16px] leading-[1.95] text-ink-800">
            돌아갈 수도 있었지만, 이 땅을 집으로 삼았습니다.{" "}
            <Link href={`/?focus=${burialPlace.id}`} className="font-extrabold underline underline-offset-2" style={{ color: "#9b3d2d" }}>
              {burialPlace.name}
            </Link>
            에 잠들어 있습니다.
          </p>
        </section>
      )}

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

      {/* 연표 · 관계 — 좌우 두 열 */}
      <div className="mt-9 grid grid-cols-1 gap-8 lg:grid-cols-2">
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
                  <p className="font-serif text-[14.5px] leading-[1.85] text-ink-700">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {relGroups.length > 0 && (
          <section>
            <h2 className="font-display text-lg font-extrabold text-ink-900">관계</h2>
            <div className="mt-4 space-y-5">
              {relGroups.map(([label, group]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: group.color }}>
                      {label}
                    </span>
                    <span className="text-[11px] text-ink-400">{group.items.length}명</span>
                  </div>
                  <ul className="space-y-2">
                    {group.items.map((it, i) => (
                      <li key={it.id + i}>
                        <Link
                          href={`/people/${it.id}`}
                          className="block rounded-xl border border-ink-200 bg-white px-3 py-2 transition-colors hover:border-sky-300"
                        >
                          <span className="flex items-baseline gap-1.5">
                            <span className="text-[13px] font-bold text-ink-800">{it.dir} {it.name}</span>
                            {it.role && <span className="truncate text-[11px] text-ink-400">· {it.role}</span>}
                          </span>
                          {it.note && <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-500">{it.note}</span>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 관련 영상 — 페이지 안에서 재생(유튜브 로고 누르면 유튜브로 이동) */}
      {profile?.videos && profile.videos.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-extrabold text-ink-900">관련 영상</h2>
          <div className="mt-4 space-y-6">
            {profile.videos.map((v) => {
              const id = ytId(v.url);
              return (
                <figure key={v.url} className="m-0">
                  {id ? (
                    <div className="relative w-full overflow-hidden rounded-2xl border border-ink-200" style={{ aspectRatio: "16 / 9" }}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${id}`}
                        title={v.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  ) : (
                    <a href={v.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-ink-200 bg-white p-4 font-bold text-sky-700 hover:border-sky-300">▶ {v.title}</a>
                  )}
                  <figcaption className="mt-2 text-[12.5px] text-ink-500">{v.title}{v.source ? ` · ${v.source}` : ""}</figcaption>
                </figure>
              );
            })}
          </div>
        </section>
      )}

      {/* 바깥 링크 · 참고 출처 · 자료 — 아래 새 배치(3열) */}
      {(extLinks.length > 0 || photoSource || sources.length > 0 || (profile?.refs && profile.refs.length > 0) || person.interview || person.photos.length > 0) && (
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(sources.length > 0 || (profile?.refs && profile.refs.length > 0)) && (
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">참고 출처</h2>
              {profile?.refs && profile.refs.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {profile.refs.map((r) => (
                    <li key={r.url}>
                      <a href={r.url} target="_blank" rel="noreferrer" className="block rounded-2xl border border-ink-200 bg-white p-3 transition-colors hover:border-sky-300">
                        <div className="text-[13px] font-bold text-sky-700">{r.title} ↗</div>
                        {r.publisher && <div className="text-[12px] text-ink-500">{r.publisher}</div>}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              {sources.length > 0 && (
                <ul className="mt-2 space-y-2">
                  {sources.map((s, i) => (
                    <li key={i} className="rounded-2xl border border-ink-200 bg-white p-3">
                      <div className="text-[13px] font-bold text-ink-800">{s.t}</div>
                      <div className="text-[12px] text-ink-500">{s.a}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {(person.interview || person.photos.length > 0 || person.video) && (
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">자료</h2>
              <div className="mt-3 space-y-2 text-[13px]">
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
                {person.video && (
                  <div className="rounded-2xl border border-ink-200 bg-white p-3">
                    <span className="font-bold text-iris-600">영상 </span>
                    <span className="text-ink-700">{person.video}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {(extLinks.length > 0 || photoSource) && (
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">외부 링크</h2>
              {extLinks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {extLinks.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-ink-700 transition-colors hover:border-sky-300 hover:text-sky-700">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              {photoSource && <p className="mt-3 text-[11px] leading-relaxed text-ink-400">사진 출처: {photoSource} (CC/PD)</p>}
            </div>
          )}
        </div>
      )}

      {/* 묻는 자리 — 평가하지 않고 묻는다(학생 응답으로 이어지는 동선) */}
      <section
        className="mt-12 rounded-3xl p-7 text-center sm:p-9"
        style={{ background: "linear-gradient(145deg,#2e2218,#5f3928)", color: "#fff8ec" }}
      >
        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "#e8a765" }}>
          잠시, 묻는 자리
        </div>
        <p className="mx-auto mt-3 max-w-xl font-serif text-[21px] font-bold leading-snug sm:text-[25px]">
          {person.name}의 삶에서,
          <br />
          당신은 무엇이 아름답다고 느꼈나요?
        </p>
        <p className="mx-auto mt-4 max-w-xl font-serif text-[14.5px] leading-loose" style={{ color: "rgba(255,248,236,.8)" }}>
          정답은 없습니다.
          <br />
          다만 이 질문을 가지고 가세요 —
          <br />
          나라면 무엇에 내 삶의 값을 치르고 싶은가.
          <br />
          복음이라는 바통은, 이제 당신의 손에 있습니다.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/story" className="rounded-full px-5 py-2.5 text-[14px] font-bold" style={{ background: "rgba(255,248,236,.14)", color: "#fff8ec" }}>
            ← 두 움직임 다시 보기
          </Link>
          <Link href="/people" className="rounded-full px-5 py-2.5 text-[14px] font-bold" style={{ background: "linear-gradient(135deg,#9b3d2d,#bf6b22)", color: "#fff8ec" }}>
            또 다른 사람을 만나기 →
          </Link>
        </div>
      </section>
    </div>
  );
}
