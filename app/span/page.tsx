import type { Metadata } from "next";
import { PEOPLE, activePeriods } from "@/lib/data";
import { isFeatured } from "@/lib/data/meta";
import { SpanChart, type SpanPerson } from "@/components/span-chart";
import { getLocale } from "@/lib/i18n/server";
import { fetchAllPersonI18n, ov } from "@/lib/i18n/content";

export const metadata: Metadata = { title: "활동 연표" };
export const dynamic = "force-dynamic"; // 로케일 쿠키 반영

export default async function SpanPage() {
  const locale = await getLocale();
  const i18n = await fetchAllPersonI18n(locale);
  const people: SpanPerson[] = PEOPLE.map((p) => ({
    id: p.id,
    name: p.name,
    nameD: ov(p.name, i18n[p.id]?.name),
    org: p.org, // 색(orgTint)은 한국어 org 키워드로 판정 — 그대로 유지
    year: p.year,
    life: p.life,
    periods: activePeriods(p),
    featured: isFeatured(p.id),
  }));

  return <SpanChart people={people} locale={locale} />;
}
