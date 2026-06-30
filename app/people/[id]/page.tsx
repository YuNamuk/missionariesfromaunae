import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Portrait } from "@/components/color-mode";
import { galleryFor } from "@/lib/data/gallery";
import { GallerySection } from "@/components/gallery-section";
import { SectionTabs } from "@/components/section-tabs";
import { CiteBox } from "@/components/cite-box";
import {
  getPerson,
  getPlace,
  relationshipsFor,
  resourcesFor,
  BURIAL,
} from "@/lib/data";
import { PHOTOS } from "@/lib/data/photos";
import { profileFor } from "@/lib/data/profiles";
import { fetchPersonContent, fetchReview } from "@/lib/db/editable";
import { getLocale } from "@/lib/i18n/server";
import { fetchPersonI18n, fetchAllPersonI18n, fetchPlacesI18n, fetchRelationsI18n, ov } from "@/lib/i18n/content";
import { tl } from "@/lib/i18n/labels";

// 로케일 쿠키 + 관리자 오버레이를 반영하기 위해 요청별 동적 렌더.

// 로케일별 콘텐츠(쿠키)라 빌드 시 정적 생성하지 않고 요청별로 렌더한다.
export const dynamic = "force-dynamic";

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
  return { title: person ? person.name : "인물" };
}

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const person = getPerson(id);
  if (!person) notFound();

  const locale = await getLocale();
  const T = (ko: string, en: string, mn: string) => (locale === "mn" ? mn : locale === "en" ? en : ko);
  const placesL = await fetchPlacesI18n(locale);
  const plName = (p: { id: string; name: string }) => placesL[p.id] ?? p.name;

  const allI18n = await fetchAllPersonI18n(locale);
  const relNotes = await fetchRelationsI18n(locale);
  const place = getPlace(person.place);
  const rels = relationshipsFor(person.id);
  // 같은 종류(관계 유형)끼리 묶고, 관련 인물의 간단한 소개(사역·생애)를 함께 둔다. 라벨·이름·사역·설명 로케일.
  const relGroups = (() => {
    const m = new Map<string, { label: string; color: string; items: { id: string; name: string; dir: string; note: string; role: string; org: string; life: string }[] }>();
    for (const r of rels) {
      const otherRef = r.from.id === person.id ? r.to : r.from;
      const dir = r.from.id === person.id ? "→" : "←";
      const o = getPerson(otherRef.id);
      const note = relNotes[`${r.from.id}|${r.to.id}|${r.type}`] || r.note;
      if (!m.has(r.type)) m.set(r.type, { label: tl(locale, "rel", r.type, r.meta.label), color: r.meta.color, items: [] });
      m.get(r.type)!.items.push({ id: otherRef.id, name: ov(otherRef.name, allI18n[otherRef.id]?.name), dir, note, role: ov(o?.role ?? "", allI18n[otherRef.id]?.role), org: o?.org ?? "", life: o?.life ?? "" });
    }
    return [...m.values()];
  })();
  const sourcesRaw = resourcesFor(person);
  const ph = PHOTOS[person.id];
  const photo = ph?.photo ?? null;
  const photoSource = ph?.source ?? "";
  const review = await fetchReview();
  // 공개는 검수에서 '채택(approved)'된 사진만. 스캔으로 모은 후보(pending)·숨김은 비공개.
  const gallery = galleryFor(person.id).filter((_, i) => review[`g:${person.id}:${i}`] === "approved");
  const defaultExtLinks = [
    ph?.wiki ? { label: T("위키백과", "Wikipedia (KO)", "Wikipedia (KO)"), href: ph.wiki } : null,
    ph?.wikiEn ? { label: "Wikipedia (EN)", href: ph.wikiEn } : null,
    ph?.namu ? { label: T("나무위키", "Namuwiki", "Namuwiki"), href: ph.namu } : null,
  ].filter((x): x is { label: string; href: string } => !!x && !!x.href);
  const profile = profileFor(person.id);
  const burialPlace = BURIAL[person.id] ? getPlace(BURIAL[person.id]) : null;

  // 관리자 카드 편집 오버레이 병합(없으면 코드 기본값) — 한국어 원본 층.
  const ovc = await fetchPersonContent(person.id);
  // 번역 오버레이(영어·몽골어) — 한국어 위에 필드 단위로 덮고, 비면 한국어 폴백.
  const tr = await fetchPersonI18n(person.id, locale);
  const c = {
    summary: ov(ovc?.summary ?? person.summary, tr?.summary),
    story: ov(ovc?.story ?? profile?.story, tr?.story),
    journey: ov(ovc?.journey ?? profile?.journey, tr?.journey),
    ministry: ov(ovc?.ministry ?? profile?.ministry ?? [], tr?.ministry),
    influence: ov(ovc?.influence ?? profile?.influence, tr?.influence),
    beauty: ov(ovc?.beauty ?? profile?.beauty, tr?.beauty),
    quote: ov(ovc?.quote ?? profile?.quote, tr?.quote),
  };
  // 헤더·사실·연표·관계 등 인물 메타도 번역 오버레이로(없으면 원본).
  const L = {
    name: ov(person.name, tr?.name),
    role: ov(person.role, tr?.role),
    org: ov(person.org, tr?.org),
    country: ov(person.country, tr?.country),
    facts: ov(person.facts, tr?.facts as unknown as typeof person.facts),
    timeline: ov(person.timeline, tr?.timeline as unknown as typeof person.timeline),
  };
  // 참고 출처·사료: 번역 오버레이(인덱스 정렬)로 제목·발행처를 덮되 url은 원본 유지.
  const refs = (profile?.refs ?? []).map((r, i) => ({ ...r, title: tr?.refs?.[i]?.title || r.title, publisher: tr?.refs?.[i]?.publisher || r.publisher }));
  const sources = sourcesRaw.map((s, i) => ({ ...s, t: tr?.sources?.[i]?.t || s.t, a: tr?.sources?.[i]?.a || s.a }));
  // 관련 영상: 관리자 오버레이(있으면 우선) ?? 코드 기본. 여러 개 가능.
  const videos = ovc?.videos ?? profile?.videos ?? [];
  // 외부 링크: 관리자 오버레이(있으면 우선) ?? PHOTOS 기본.
  const extLinks = ovc?.links?.length ? ovc.links.filter((l) => l.href) : defaultExtLinks;
  const hasNarrative = !!(c.story?.length || c.journey || c.ministry.length || c.influence || c.beauty);

  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missionaries-khaki.vercel.app";
  const [birth, death] = (person.life.match(/(\d{4})\D+(\d{4})/)?.slice(1) ?? []) as (string | undefined)[];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    alternateName: person.en,
    description: c.summary,
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
      <nav aria-label="위치" className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-ink-400">
        <Link href="/" className="hover:text-sky-600">{T("지도", "Map", "Газрын зураг")}</Link>
        <span aria-hidden className="text-ink-300">›</span>
        <Link href="/dictionary" className="hover:text-sky-600">{T("인명사전", "Directory", "Нэрсийн толь")}</Link>
        <span aria-hidden className="text-ink-300">›</span>
        <span className="text-ink-700">{L.name}</span>
      </nav>

      {/* Header */}
      <div className="mt-5 flex flex-wrap items-start gap-5">
        {photo ? (
          <span className="flex-none">
            <Portrait
              id={person.id}
              src={photo}
              alt={`${person.name} 초상`}
              controls
              badge
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
            {L.name}
          </h1>
          <p className="font-serif mt-1.5 text-[15px] text-ink-500">
            {person.en} · {person.life} · {L.country}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-sky-500 px-3 py-1 text-[12px] font-bold text-white">
              {L.org}
            </span>
            <span className="rounded-full bg-ink-100 px-3 py-1 text-[12px] font-bold text-ink-700">
              {L.role}
            </span>
            {place && (
              <Link
                href={`/map?place=${place.id}`}
                className="rounded-full bg-ink-100 px-3 py-1 text-[12px] font-bold text-ink-700 hover:bg-ink-200"
              >
                ⚓ {plName(place)}
              </Link>
            )}
          </div>
        </div>
      </div>

      <SectionTabs />

      {/* 그 사람의 말로 페이지를 연다 — 1차 자료 인용(있을 때만) */}
      {c.quote && (
        <figure className="mt-8 border-l-4 pl-5 sm:pl-6" style={{ borderColor: "#bf6b22" }}>
          <blockquote className="font-serif text-[22px] leading-[1.8] text-ink-800 sm:text-[27px]">
            &ldquo;{c.quote.text}&rdquo;
          </blockquote>
          <figcaption className="mt-3 text-[12.5px] leading-relaxed text-ink-400">— {c.quote.source}</figcaption>
        </figure>
      )}

      <p id="story" className="font-serif mt-7 scroll-mt-28 text-[18px] leading-[2.05] text-ink-700 sm:text-[19px]">{c.summary}</p>

      {/* 서정적 서술: 이야기(중심) · 치른 값 · 걸어온 사역 · 남긴 열매 */}
      {hasNarrative && (
        <div className="mt-12 space-y-12">
          {/* 잔잔한 스토리텔링 서사가 있으면 그것이 지면의 중심, 없으면 '큰 흐름 속 여정' */}
          {c.story?.length ? (
            <section>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-iris-700">{T("이야기", "Story", "Түүх")}</div>
              <div className="mt-5 space-y-6">
                {c.story.map((para, i) => (
                  <p key={i} className="font-serif text-[17px] leading-[2.1] text-ink-800 sm:text-[18.5px]">{para}</p>
                ))}
              </div>
            </section>
          ) : c.journey ? (
            <section className="relative">
              <span aria-hidden className="font-serif block select-none text-[64px] leading-[0.6] text-rust" style={{ color: "rgba(155,61,45,.16)" }}>
                &ldquo;
              </span>
              <div className="pl-1">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-iris-700">{T("한국 선교의 큰 흐름 속에서", "Within the larger story of mission in Korea", "Солонгос дахь номлолын том урсгал дунд")}</div>
                <p className="font-serif mt-4 text-[21px] leading-[2.0] text-ink-800 sm:text-[23px]">{c.journey}</p>
              </div>
            </section>
          ) : null}

          {c.beauty && (
            <section>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "#9b3d2d" }}>{T("이 삶에서 아름다운 것 · 치른 값", "What is beautiful in this life · the cost paid", "Энэ амьдралын сайхан нь · төлсөн үнэ")}</div>
              <p className="font-serif mt-4 text-[16.5px] leading-[2.0] text-ink-700">{c.beauty}</p>
            </section>
          )}

          {c.ministry.length > 0 && (
            <section>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-ink-400">{T("걸어온 사역", "Ministry", "Үйлчлэлийн зам")}</div>
              <ul className="mt-4 space-y-3.5">
                {c.ministry.map((m, i) => (
                  <li key={i} className="font-serif flex gap-3.5 text-[15.5px] leading-[1.85] text-ink-700">
                    <span className="mt-2.5 h-1.5 w-1.5 flex-none rounded-full" style={{ background: "#bf6b22" }} />
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {c.influence && (
            <section className="rounded-3xl p-7 sm:p-8" style={{ borderLeft: "4px solid var(--aqua-500)", background: "var(--aqua-50)" }}>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-aqua-700">{T("남긴 열매", "The fruit left behind", "Үлдээсэн үр жимс")}</div>
              <p className="font-serif mt-3 text-[16.5px] leading-[2.0] text-ink-800">{c.influence}</p>
            </section>
          )}
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
            {locale === "en" ? (
              <>They could have returned, but made Korea their home. They rest at{" "}
                <Link href={`/?focus=${burialPlace.id}`} className="font-extrabold underline underline-offset-2" style={{ color: "#9b3d2d" }}>{plName(burialPlace)}</Link>.</>
            ) : locale === "mn" ? (
              <>Тэд буцаж болох байсан ч Солонгосыг гэрээ болгосон. Тэд{" "}
                <Link href={`/?focus=${burialPlace.id}`} className="font-extrabold underline underline-offset-2" style={{ color: "#9b3d2d" }}>{plName(burialPlace)}</Link>-д амарч байна.</>
            ) : (
              <>돌아갈 수도 있었지만, 조선을 집으로 삼았습니다.{" "}
                <Link href={`/?focus=${burialPlace.id}`} className="font-extrabold underline underline-offset-2" style={{ color: "#9b3d2d" }}>{plName(burialPlace)}</Link>에 잠들어 있습니다.</>
            )}
          </p>
        </section>
      )}

      {/* Facts */}
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {L.facts.map(([label, value]) => (
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
        <section id="timeline" className="scroll-mt-28">
          <h2 className="font-display text-lg font-extrabold text-ink-900">{T("연표", "Timeline", "Он дараалал")}</h2>
          <ol className="mt-4 space-y-0">
            {L.timeline.map(([yr, text], i) => (
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
          <section id="relations" className="scroll-mt-28">
            <h2 className="font-display text-lg font-extrabold text-ink-900">{T("관계", "Relationships", "Харилцаа")}</h2>
            <div className="mt-4 space-y-5">
              {relGroups.map((group) => (
                <div key={group.label}>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: group.color }}>
                      {group.label}
                    </span>
                    <span className="text-[11px] text-ink-400">{group.items.length}{T("명", "", "")}</span>
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
      {videos.length > 0 && (
        <section id="videos" className="mt-10 scroll-mt-28">
          <h2 className="font-display text-lg font-extrabold text-ink-900">{T("관련 영상", "Related videos", "Холбоотой бичлэг")}</h2>
          <div className="mt-4 space-y-6">
            {videos.map((v) => {
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

      {/* 원본 사진 모음 — 공개 자료(주로 Wikimedia Commons)에서 본인 확인. 컬러 모드 연동 */}
      <GallerySection photos={gallery} />

      {/* 참고 출처 · 외부 링크 (2열) */}
      {(extLinks.length > 0 || photoSource || sources.length > 0 || refs.length > 0) && (
        <div id="sources" className="mt-10 grid scroll-mt-28 grid-cols-1 gap-8 sm:grid-cols-2">
          {(sources.length > 0 || refs.length > 0) && (
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">{T("참고 출처", "References", "Эх сурвалж")}</h2>
              {refs.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {refs.map((r) => (
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
                    <li key={i}>
                      {s.u ? (
                        <a href={s.u} target="_blank" rel="noreferrer" className="block rounded-2xl border border-ink-200 bg-white p-3 transition-colors hover:border-sky-300">
                          <div className="text-[13px] font-bold text-sky-700">{s.t} ↗</div>
                          <div className="text-[12px] text-ink-500">{s.a}</div>
                        </a>
                      ) : (
                        <div className="rounded-2xl border border-ink-200 bg-white p-3">
                          <div className="text-[13px] font-bold text-ink-800">{s.t}</div>
                          <div className="text-[12px] text-ink-500">{s.a}</div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {(extLinks.length > 0 || photoSource) && (
            <div>
              <h2 className="font-display text-lg font-extrabold text-ink-900">{T("외부 링크", "External links", "Гадаад холбоос")}</h2>
              {extLinks.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {extLinks.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="rounded-full border border-ink-200 bg-white px-3.5 py-1.5 text-[12.5px] font-bold text-ink-700 transition-colors hover:border-sky-300 hover:text-sky-700">
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              )}
              {photoSource && <p className="mt-3 text-[11px] leading-relaxed text-ink-400">{T("사진 출처", "Photo", "Зураг")}: {photoSource} (CC/PD)</p>}
            </div>
          )}
        </div>
      )}

      <CiteBox name={person.name} en={person.en} life={person.life} url={`${SITE_URL}/people/${person.id}`} />

      {/* 묻는 자리 — 평가하지 않고 묻는다(학생 응답으로 이어지는 동선) */}
      <section
        className="mt-12 rounded-3xl p-7 text-center sm:p-9"
        style={{ background: "linear-gradient(145deg,#2e2218,#5f3928)", color: "#fff8ec" }}
      >
        <div className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: "#e8a765" }}>
          {T("잠시, 묻는 자리", "A moment to ask", "Түр зогсоод асуух")}
        </div>
        <p className="mx-auto mt-3 max-w-xl font-serif text-[21px] font-bold leading-snug sm:text-[25px]">
          {locale === "en" ? <>In {L.name}&rsquo;s life,<br />what did you find beautiful?</>
            : locale === "mn" ? <>{L.name}-ийн амьдралд,<br />та юуг сайхан гэж мэдэрсэн бэ?</>
            : <>{L.name}의 삶에서,<br />당신은 무엇이 아름답다고 느꼈나요?</>}
        </p>
        <p className="mx-auto mt-4 max-w-xl font-serif text-[14.5px] leading-loose" style={{ color: "rgba(255,248,236,.8)" }}>
          {locale === "en" ? <>There is no right answer.<br />Only carry this question with you —<br />what would I be willing to pay my life&rsquo;s cost for?<br />The baton of the gospel is now in your hands.</>
            : locale === "mn" ? <>Зөв хариулт байхгүй.<br />Зөвхөн энэ асуултыг авч яваарай —<br />би юунд амьдралынхаа үнэ цэнийг зориулмаар байна вэ?<br />Сайн мэдээний бороохой одоо таны гарт байна.</>
            : <>정답은 없습니다.<br />다만 이 질문을 가지고 가세요 —<br />나라면 무엇에 내 삶의 값을 치르고 싶은가.<br />복음이라는 바통은, 이제 당신의 손에 있습니다.</>}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/story" className="rounded-full px-5 py-2.5 text-[14px] font-bold" style={{ background: "rgba(255,248,236,.14)", color: "#fff8ec" }}>
            {T("← 두 움직임 다시 보기", "← Revisit the two movements", "← Хоёр хөдөлгөөнийг дахин үзэх")}
          </Link>
          <Link href="/people" className="rounded-full px-5 py-2.5 text-[14px] font-bold" style={{ background: "linear-gradient(135deg,#9b3d2d,#bf6b22)", color: "#fff8ec" }}>
            {T("또 다른 사람을 만나기 →", "Meet another person →", "Өөр хүнтэй уулзах →")}
          </Link>
        </div>
      </section>
    </div>
  );
}
