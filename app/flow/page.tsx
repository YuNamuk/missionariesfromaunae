import type { Metadata } from "next";
import { PEOPLE, getRelationships } from "@/lib/data";
import { profileFor } from "@/lib/data/profiles";
import { PHOTOS } from "@/lib/data/photos";
import { FlowExplorer, type FlowPerson, type RelItem } from "@/components/flow-explorer";
import { getLocale } from "@/lib/i18n/server";
import { fetchAllPersonI18n, fetchRelationsI18n, ov } from "@/lib/i18n/content";
import { tl } from "@/lib/i18n/labels";

export const metadata: Metadata = { title: "선교의 흐름" };
export const dynamic = "force-dynamic"; // 로케일 쿠키 반영

// 방향성 있는(흐름) 관계 — from이 to를 준비/양성/계승/영향
const DIRECTIONAL = new Set(["influence", "prepare", "succeed", "mentor"]);

export default async function FlowPage() {
  const locale = await getLocale();
  const i18n = await fetchAllPersonI18n(locale);
  const nm = (id: string, ko: string) => ov(ko, i18n[id]?.name);
  const people: FlowPerson[] = PEOPLE.map((p) => {
    const pr = profileFor(p.id);
    return {
      id: p.id,
      name: nm(p.id, p.name),
      en: p.en,
      life: p.life,
      org: ov(p.org, i18n[p.id]?.org),
      role: ov(p.role, i18n[p.id]?.role),
      year: p.year,
      glyph: p.glyph,
      photo: PHOTOS[p.id]?.photo ?? null,
      summary: ov(p.summary, i18n[p.id]?.summary),
      quote: ov(pr?.quote ?? null, i18n[p.id]?.quote),
    };
  }).sort((a, b) => a.year - b.year);

  // 인접 목록 + 흐름 방향. 방향성 관계(influence/prepare/mentor/succeed)는
  // from→to가 '영향을 준' 방향(forward), 반대편엔 reverse로 표시해 흐름에서 제외.
  // partner/family는 상호적이라 lateral. (관계 상대 이름은 로케일 적용)
  const relNotes = await fetchRelationsI18n(locale);
  const rels: Record<string, RelItem[]> = {};
  for (const r of getRelationships()) {
    const dir = DIRECTIONAL.has(r.type);
    const note = relNotes[`${r.from.id}|${r.to.id}|${r.type}`] || r.note;
    const label = tl(locale, "rel", r.type, r.meta.label);
    (rels[r.from.id] ??= []).push({ id: r.to.id, name: nm(r.to.id, r.to.name), type: r.type, label, color: r.meta.color, note, dir: dir ? "→" : "·", flow: dir ? "forward" : "lateral" });
    (rels[r.to.id] ??= []).push({ id: r.from.id, name: nm(r.from.id, r.from.name), type: r.type, label, color: r.meta.color, note, dir: dir ? "←" : "·", flow: dir ? "reverse" : "lateral" });
  }

  return <FlowExplorer people={people} rels={rels} locale={locale} />;
}
