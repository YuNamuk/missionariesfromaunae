"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Portrait } from "@/components/color-mode";

export type RosterPerson = {
  id: string;
  name: string;
  en: string;
  life: string;
  org: string;
  role: string;
  year: number;
  glyph: string;
  photo: string | null;
  featured: boolean;
};

// 교단 계열(장로회/감리회/기타)로 거칠게 분류 — org 문자열 기준.
function denom(org: string): "장로회" | "감리회" | "기타" {
  if (org.includes("장로")) return "장로회";
  if (org.includes("감리")) return "감리회";
  return "기타";
}

// 사역 분야 — role 문자열에 키워드가 들어 있으면 해당 분야로 본다(복수 가능).
const FIELDS: { key: string; match: (role: string) => boolean }[] = [
  { key: "의료", match: (r) => /의료|간호/.test(r) },
  { key: "교육", match: (r) => /교육|한글|학/.test(r) },
  { key: "번역", match: (r) => /번역|성경/.test(r) },
  { key: "전도·목회", match: (r) => /전도|목회|부흥|반포/.test(r) },
];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1 text-[12.5px] font-bold transition-colors"
      style={
        on
          ? { background: "#2f2419", color: "#fff8ed" }
          : { background: "var(--ink-100)", color: "var(--ink-600)" }
      }
    >
      {children}
    </button>
  );
}

export function DictionaryRoster({ people }: { people: RosterPerson[] }) {
  const [den, setDen] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);

  const featuredCount = people.filter((p) => p.featured).length;
  const list = useMemo(() => {
    return people.filter((p) => {
      if (den && denom(p.org) !== den) return false;
      if (field) {
        const f = FIELDS.find((x) => x.key === field);
        if (f && !f.match(p.role)) return false;
      }
      return true;
    });
  }, [people, den, field]);

  return (
    <section className="mt-12">
      <div className="flex items-end justify-between border-b border-ink-200 pb-3">
        <h2 className="font-display text-2xl font-black tracking-tight text-ink-900">
          전체 인명 <span className="text-[13px] font-semibold text-ink-400">· 입국·활동 연도순</span>
        </h2>
        <span className="text-[13px] font-bold text-ink-500">
          {list.length === people.length ? `${people.length}명 · 대표 ${featuredCount}명` : `${list.length}명`}
        </span>
      </div>

      {/* facet 필터: 교단 · 사역 분야 */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-400">교단</span>
          <Chip on={!den} onClick={() => setDen(null)}>전체</Chip>
          {(["장로회", "감리회", "기타"] as const).map((d) => (
            <Chip key={d} on={den === d} onClick={() => setDen(den === d ? null : d)}>{d}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-400">사역</span>
          <Chip on={!field} onClick={() => setField(null)}>전체</Chip>
          {FIELDS.map((f) => (
            <Chip key={f.key} on={field === f.key} onClick={() => setField(field === f.key ? null : f.key)}>{f.key}</Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-[14px] text-ink-500">해당 조건의 인물이 없습니다.</p>
      ) : (
        <ul className="mt-4 grid gap-x-6 sm:grid-cols-2">
          {list.map((p) => (
            <li key={p.id} className="border-b border-ink-100">
              <Link href={`/people/${p.id}`} className="flex items-center gap-3 py-3 transition-colors hover:bg-ink-50">
                {p.photo ? (
                  <Portrait id={p.id} src={p.photo} alt={`${p.name} 초상`} className="h-10 w-10 flex-none rounded-full object-cover" style={{ width: 40, height: 40, background: "var(--ink-100)" }} />
                ) : (
                  <span className="font-display flex h-10 w-10 flex-none items-center justify-center rounded-full text-lg" style={{ background: "var(--ink-100)", color: "var(--ink-700)" }}>{p.glyph}</span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    {p.featured && <span className="text-[11px] text-[#bf6b22]">★</span>}
                    <span className="text-[15px] font-extrabold text-ink-900">{p.name}</span>
                    <span className="text-[12px] font-bold text-ink-400">{p.year}</span>
                  </span>
                  <span className="block truncate text-[12.5px] text-ink-500">{p.en} · {p.life} · {p.org}</span>
                </span>
                <span className="flex-none text-[13px] font-bold text-sky-600">→</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
