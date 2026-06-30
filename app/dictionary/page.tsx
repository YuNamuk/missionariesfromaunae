import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cemeteryPlaceIds, peopleBuriedAt, getPlace, getPeople } from "@/lib/data";
import { WIKIDATA_VERIFIED } from "@/lib/data/dictionary";
import { BURIED_EXTRA, BURIED_SOURCE, BURIED_TOTAL } from "@/lib/data/cemetery";
import { PHOTOS } from "@/lib/data/photos";
import { isFeaturedWith } from "@/lib/data/meta";
import { fetchOverlay } from "@/lib/db/content";
import { DictionaryRoster, type RosterPerson } from "@/components/dictionary-roster";
import { getLocale } from "@/lib/i18n/server";
import { fetchAllPersonI18n, fetchPlacesI18n, fetchPlaceDetailI18n, ov } from "@/lib/i18n/content";

export const dynamic = "force-dynamic"; // 로케일 쿠키 + 오버레이 반영
export async function generateMetadata(): Promise<Metadata> {
  const l = await getLocale();
  return { title: l === "mn" ? "Намтрын толь" : l === "en" ? "Biographical Dictionary" : "인명사전" };
}

export default async function DictionaryPage() {
  const locale = await getLocale();
  const T = (ko: string, en: string, mn: string) => (locale === "mn" ? mn : locale === "en" ? en : ko);
  const i18n = await fetchAllPersonI18n(locale);
  const placesL = await fetchPlacesI18n(locale);
  const pdetail = await fetchPlaceDetailI18n(locale);
  const plName = (id: string, ko: string) => placesL[id] ?? ko;

  const Badge = ({ verified }: { verified: boolean }) => (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={verified ? { background: "rgba(63,127,75,.15)", color: "#2f6b3b" } : { background: "rgba(191,107,34,.14)", color: "#a0641f" }}
    >
      {verified ? T("Wikidata 확인", "Wikidata-verified", "Wikidata-аар баталгаажсан") : T("문헌 기반", "From literature", "Эх сурвалжид тулгуурласан")}
    </span>
  );

  // cemeteries that have either roster burials or dictionary-only entries
  const ids = [...new Set([...cemeteryPlaceIds(), ...Object.keys(BURIED_EXTRA)])];
  const overlay = await fetchOverlay();
  const roster: RosterPerson[] = getPeople().map((p) => ({
    id: p.id,
    name: p.name,
    en: p.en,
    life: p.life,
    org: p.org,
    role: p.role,
    year: p.year,
    glyph: p.glyph,
    photo: PHOTOS[p.id]?.photo ?? null,
    featured: isFeaturedWith(overlay?.featured, p.id),
    country: p.country,
    // 표시용(로케일) — 필터는 ko org/role로 하므로 별도 표시 필드.
    nameD: ov(p.name, i18n[p.id]?.name),
    orgD: ov(p.org, i18n[p.id]?.org),
    roleD: ov(p.role, i18n[p.id]?.role),
  }));

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">
        Biographical Dictionary
      </p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
        {T("인명사전", "Biographical Dictionary", "Намтрын толь")}
      </h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-600">
        {T(
          "전체 인명을 먼저 한눈에 모았고, 아래에는 묘역별로 안장된 인물을 정리했습니다. 대표 선교사는 ★로 표시됩니다. 핵심 인물은 상세 프로필로, 그 밖의 안장자는 양화진 공식 명단·한국민족문화대백과·지자체 문화원 등 실제 출처와 Wikidata 매장지 기록으로 교차검증해 출처와 함께 실었습니다.",
          "First, all names at a glance; below, those buried at each cemetery. Featured missionaries are marked ★. Key figures have full profiles; other burials are cross-verified against real sources — Yanghwajin's official rolls, the Encyclopedia of Korean Culture, local cultural centers — and Wikidata burial records, listed with their sources.",
          "Эхлээд бүх нэрсийг нэг дороос, доор нь оршуулгын газар бүрд оршуулагдсан хүмүүсийг эмхэтгэв. Төлөөлөх номлогчдыг ★ тэмдэгээр тэмдэглэв. Гол хүмүүс дэлгэрэнгүй намтартай; бусад оршуулагсдыг бодит эх сурвалж — Янхважины албан ёсны жагсаалт, Солонгосын соёлын нэвтэрхий толь, орон нутгийн соёлын төв — болон Wikidata-гийн бүртгэлтэй тулган баталгаажуулж, эх сурвалжийн хамт оруулсан.",
        )}
      </p>

      {/* ── 전체 인명 리스트(교단·사역 facet 필터) ── */}
      <DictionaryRoster people={roster} locale={locale} />

      <h2 className="font-display mt-16 text-2xl font-black tracking-tight text-ink-900">{T("묘역별 안장 인물", "Burials by Cemetery", "Оршуулгын газраар")}</h2>

      {ids.map((id) => {
        const place = getPlace(id);
        const roster = peopleBuriedAt(id);
        const extra = BURIED_EXTRA[id] ?? [];
        const total = roster.length + extra.length;
        const pdx = pdetail[id];
        const totalNote = pdx?.total ?? BURIED_TOTAL[id];
        const srcs = BURIED_SOURCE[id] ?? [];
        return (
          <section key={id} className="mt-12">
            <div className="flex items-end justify-between border-b border-ink-200 pb-3">
              <h2 className="font-display text-2xl font-black tracking-tight text-ink-900">
                {plName(id, place?.name ?? id)}
              </h2>
              <span className="text-[13px] font-bold text-ink-500">{total}{T("명 수록", " listed", " бүртгэгдсэн")}</span>
            </div>
            {totalNote && <p className="mt-3 text-[12.5px] leading-relaxed text-ink-500">{totalNote}</p>}
            {srcs.length > 0 && (
              <p className="mt-2 text-[11.5px] text-ink-400">
                {T("명단 출처", "Roster sources", "Жагсаалтын эх сурвалж")}: {srcs.map((u, i) => (
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
                        <Image src={photo} alt={`${p.name} 초상`} width={40} height={40} className="h-10 w-10 flex-none rounded-full object-cover" style={{ background: "var(--ink-100)" }} />
                      ) : (
                        <span className="font-display flex h-10 w-10 flex-none items-center justify-center rounded-full text-lg" style={{ background: "var(--ink-100)", color: "var(--ink-700)" }}>{p.glyph}</span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="text-[15px] font-extrabold text-ink-900">{ov(p.name, i18n[p.id]?.name)}</span>
                          <Badge verified={WIKIDATA_VERIFIED.has(p.id)} />
                        </span>
                        <span className="block text-[12.5px] text-ink-500">{p.en} · {p.life} · {ov(p.org, i18n[p.id]?.org)}</span>
                      </span>
                      <span className="flex-none text-[13px] font-bold text-sky-600">{T("프로필 →", "Profile →", "Намтар →")}</span>
                    </Link>
                  </li>
                );
              })}

              {extra.map((e, i) => (
                <li key={(e.nameEn || e.nameKo) + i} className="flex items-center gap-3 py-3">
                  {e.photo ? (
                    <img src={e.photo} alt={`${e.nameKo || e.nameEn} 초상`} loading="lazy" decoding="async" className="h-10 w-10 flex-none rounded-full object-cover" style={{ background: "var(--ink-100)" }} />
                  ) : (
                    <span className="font-display flex h-10 w-10 flex-none items-center justify-center rounded-full text-[15px]" style={{ background: "var(--ink-100)", color: "var(--ink-500)" }}>✝</span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[15px] font-extrabold text-ink-900">{(locale === "ko" ? (e.nameKo || e.nameEn) : (e.nameEn || e.nameKo))}</span>
                      {e.uncertain
                        ? <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(120,100,80,.12)", color: "#7a6a52" }}>{T("확인 필요", "Needs check", "Шалгах шаардлагатай")}</span>
                        : <Badge verified />}
                    </span>
                    <span className="block text-[12.5px] text-ink-500">{[locale === "ko" ? (e.nameKo && e.nameEn) : "", e.life, (pdx?.extra?.[i]?.role || e.role)].filter(Boolean).join(" · ")}</span>
                    {(pdx?.extra?.[i]?.note || e.note) && <span className="block text-[12px] text-ink-400">※ {pdx?.extra?.[i]?.note || e.note}</span>}
                  </span>
                  {e.wiki && <a href={e.wiki} target="_blank" rel="noreferrer" className="flex-none text-[12px] font-bold text-ink-500 underline">{T("위키", "Wiki", "Вики")} ↗</a>}
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <p className="mt-12 rounded-2xl border-l-4 border-[#bf6b22] bg-[rgba(191,107,34,.08)] p-4 text-[13px] leading-relaxed text-[#664221]">
        {T(
          "교차검증: 묘역별 안장 명단은 양화진 외국인선교사묘원 공식 자료·한국민족문화대백과·지자체 문화원·기독교 역사 자료 등 실제 출처로 대조해 채웠습니다(각 묘역 상단의 ‘명단 출처’ 참조). 가묘(假墓)·타지 안장·생몰 불확실 등은 ‘확인 필요’로 표기하고, 실제 안장이 확인된 인물만 수록했습니다. 여기에 개별 인물카드가 있는 분은 위 ‘프로필’로, 그 외 안장자는 출처 링크로 확인하실 수 있습니다.",
          "Cross-verification: the burial rosters were filled by checking against real sources — Yanghwajin Foreign Missionary Cemetery's official records, the Encyclopedia of Korean Culture, local cultural centers, and Christian-history materials (see 'Roster sources' atop each cemetery). Cenotaphs, burials elsewhere, and uncertain dates are marked 'Needs check'; only confirmed burials are listed. Those with an individual card can be opened via 'Profile'; others can be verified through the source links.",
          "Тулган баталгаажуулалт: оршуулгын жагсаалтыг бодит эх сурвалжтай тулгаж бөглөсөн — Янхважины Гадаадын номлогчдын оршуулгын газрын албан ёсны баримт, Солонгосын соёлын нэвтэрхий толь, орон нутгийн соёлын төв, Христийн түүхийн материал (оршуулга бүрийн дээрх 'Жагсаалтын эх сурвалж'-ийг үзнэ үү). Хуурамч булш, өөр газар оршуулсан, он сар тодорхойгүй зэргийг 'Шалгах шаардлагатай' гэж тэмдэглэж, зөвхөн батлагдсан оршуулгыг оруулсан. Хувийн картадтай хүмүүсийг 'Намтар'-аар, бусдыг эх сурвалжийн холбоосоор шалгаж болно.",
        )}
      </p>
    </div>
  );
}
