"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Portrait, useColorMode } from "@/components/color-mode";
import type { Locale } from "@/lib/i18n/locale";

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
  country: string;
  /** 표시용(로케일) — 필터는 ko org/role, 표시는 이 필드 사용. */
  nameD?: string;
  orgD?: string;
  roleD?: string;
};

// facet 칩 표시 라벨(필터 키는 한국어 유지, 표시만 로케일).
const DEN_LABEL: Record<string, { en: string; mn: string }> = {
  "장로회": { en: "Presbyterian", mn: "Пресбитериан" },
  "감리회": { en: "Methodist", mn: "Методист" },
  "기타": { en: "Other", mn: "Бусад" },
};
const FIELD_LABEL: Record<string, { en: string; mn: string }> = {
  "의료": { en: "Medical", mn: "Анагаах" },
  "교육": { en: "Education", mn: "Боловсрол" },
  "번역": { en: "Translation", mn: "Орчуулга" },
  "전도·목회": { en: "Evangelism", mn: "Сайн мэдээ" },
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

export function DictionaryRoster({ people, locale = "ko" }: { people: RosterPerson[]; locale?: Locale }) {
  const [den, setDen] = useState<string | null>(null);
  const [field, setField] = useState<string | null>(null);
  const T = (ko: string, en: string, mn: string) => (locale === "mn" ? mn : locale === "en" ? en : ko);
  const denLbl = (k: string) => (locale === "ko" ? k : DEN_LABEL[k]?.[locale] ?? k);
  const fieldLbl = (k: string) => (locale === "ko" ? k : FIELD_LABEL[k]?.[locale] ?? k);
  const { color, setColor } = useColorMode();

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
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-ink-200 pb-3">
        <h2 className="font-display text-2xl font-black tracking-tight text-ink-900">
          {T("전체 인명", "All Names", "Бүх нэрс")} <span className="text-[13px] font-semibold text-ink-400">· {T("입국·활동 연도순", "by year", "оноор")}</span>
        </h2>
        <div className="flex items-center gap-3">
          {/* 원본/컬러 토글 — 전역 초상 컬러 모드 */}
          <div className="flex overflow-hidden rounded-full border border-ink-200">
            {([["원본", false, T("원본", "Original", "Эх хувь")], ["컬러", true, T("컬러", "Color", "Өнгөт")]] as const).map(([key, val, lbl]) => (
              <button key={key} onClick={() => setColor(val)} className="px-3 py-1 text-[12px] font-bold transition-colors" style={color === val ? { background: "#9b3d2d", color: "#fff8ed" } : { background: "transparent", color: "var(--ink-500)" }}>{lbl}</button>
            ))}
          </div>
          <span className="text-[13px] font-bold text-ink-500">
            {list.length === people.length ? T(`${people.length}명 · 대표 ${featuredCount}명`, `${people.length} · ★ ${featuredCount}`, `${people.length} · ★ ${featuredCount}`) : `${list.length}`}
          </span>
        </div>
      </div>

      {/* facet 필터: 교단 · 사역 분야 */}
      <div className="mt-4 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-400">{T("교단", "Denomination", "Урсгал")}</span>
          <Chip on={!den} onClick={() => setDen(null)}>{T("전체", "All", "Бүгд")}</Chip>
          {(["장로회", "감리회", "기타"] as const).map((d) => (
            <Chip key={d} on={den === d} onClick={() => setDen(den === d ? null : d)}>{denLbl(d)}</Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[11px] font-extrabold uppercase tracking-wide text-ink-400">{T("사역", "Ministry", "Үйлчлэл")}</span>
          <Chip on={!field} onClick={() => setField(null)}>{T("전체", "All", "Бүгд")}</Chip>
          {FIELDS.map((f) => (
            <Chip key={f.key} on={field === f.key} onClick={() => setField(field === f.key ? null : f.key)}>{fieldLbl(f.key)}</Chip>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <p className="mt-6 text-[14px] text-ink-500">{T("해당 조건의 인물이 없습니다.", "No one matches these filters.", "Эдгээр шүүлтэд тохирох хүн алга.")}</p>
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.map((p) => {
            const isKorean = p.country.includes("조선") || p.country.includes("한국");
            return (
              <li key={p.id}>
                <Link href={`/people/${p.id}`} className="group block overflow-hidden rounded-2xl border border-ink-200 bg-white transition-shadow hover:shadow-[var(--shadow-sky)]">
                  <div className="relative">
                    {p.photo ? (
                      <Portrait id={p.id} src={p.photo} alt={`${p.name} 초상`} block badge className="aspect-[3/4] w-full object-cover" style={{ background: "var(--ink-100)" }} />
                    ) : (
                      <span className="font-display flex aspect-[3/4] w-full items-center justify-center text-5xl" style={{ background: "var(--grad-dream)", color: "#fff8ec" }}>{p.glyph}</span>
                    )}
                    {p.featured && <span className="absolute right-2 top-2 rounded-full bg-[#bf6b22] px-1.5 py-0.5 text-[10px] font-bold text-white shadow">★</span>}
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif text-[15px] font-extrabold text-ink-900">{p.nameD ?? p.name}</span>
                      <span className="text-[11.5px] font-bold text-ink-400">{p.year}</span>
                    </div>
                    {!isKorean && <div className="truncate text-[11px] text-ink-400">{p.en}</div>}
                    <div className="truncate text-[11.5px] text-ink-500">{p.orgD ?? p.org} · {p.roleD ?? p.role}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
