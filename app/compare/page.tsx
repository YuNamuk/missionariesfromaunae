import type { Metadata } from "next";
import { PEOPLE } from "@/lib/data";
import { profileFor } from "@/lib/data/profiles";
import { PHOTOS } from "@/lib/data/photos";
import { CompareView, type CmpPerson } from "@/components/compare-view";

export const metadata: Metadata = { title: "두 삶 비교" };

export default function ComparePage() {
  const people: CmpPerson[] = PEOPLE.map((p) => {
    const pr = profileFor(p.id);
    return {
      id: p.id,
      name: p.name,
      en: p.en,
      life: p.life,
      org: p.org,
      role: p.role,
      year: p.year,
      glyph: p.glyph,
      photo: PHOTOS[p.id]?.photo ?? null,
      summary: p.summary,
      quote: pr?.quote ?? null,
      beauty: pr?.beauty ?? null,
      timeline: p.timeline,
    };
  }).sort((a, b) => a.year - b.year);

  return <CompareView people={people} />;
}
