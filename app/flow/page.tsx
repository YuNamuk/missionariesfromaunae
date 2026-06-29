import type { Metadata } from "next";
import { PEOPLE, getRelationships } from "@/lib/data";
import { profileFor } from "@/lib/data/profiles";
import { PHOTOS } from "@/lib/data/photos";
import { FlowExplorer, type FlowPerson, type RelItem } from "@/components/flow-explorer";

export const metadata: Metadata = { title: "선교의 흐름" };

// 방향성 있는(흐름) 관계 — from이 to를 준비/양성/계승/영향
const DIRECTIONAL = new Set(["influence", "prepare", "succeed", "mentor"]);

export default function FlowPage() {
  const people: FlowPerson[] = PEOPLE.map((p) => {
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
    };
  }).sort((a, b) => a.year - b.year);

  // 인접 목록 + 흐름 방향. 방향성 관계(influence/prepare/mentor/succeed)는
  // from→to가 '영향을 준' 방향(forward), 반대편엔 reverse로 표시해 흐름에서 제외.
  // partner/family는 상호적이라 lateral.
  const rels: Record<string, RelItem[]> = {};
  for (const r of getRelationships()) {
    const dir = DIRECTIONAL.has(r.type);
    (rels[r.from.id] ??= []).push({ id: r.to.id, name: r.to.name, type: r.type, label: r.meta.label, color: r.meta.color, note: r.note, dir: dir ? "→" : "·", flow: dir ? "forward" : "lateral" });
    (rels[r.to.id] ??= []).push({ id: r.from.id, name: r.from.name, type: r.type, label: r.meta.label, color: r.meta.color, note: r.note, dir: dir ? "←" : "·", flow: dir ? "reverse" : "lateral" });
  }

  return <FlowExplorer people={people} rels={rels} />;
}
