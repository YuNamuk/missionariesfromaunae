import type { Metadata } from "next";
import { PEOPLE, activePeriods } from "@/lib/data";
import { isFeatured } from "@/lib/data/meta";
import { SpanChart, type SpanPerson } from "@/components/span-chart";

export const metadata: Metadata = { title: "활동 연표" };

export default function SpanPage() {
  const people: SpanPerson[] = PEOPLE.map((p) => ({
    id: p.id,
    name: p.name,
    org: p.org,
    year: p.year,
    life: p.life,
    periods: activePeriods(p),
    featured: isFeatured(p.id),
  }));

  return <SpanChart people={people} />;
}
