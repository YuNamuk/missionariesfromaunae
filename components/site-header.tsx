"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { PEOPLE, PLACES, BURIAL } from "@/lib/data";
import { ERAS, DENOM_LIST, ROLE_LIST, REGIONS, denomOf, regionOf, roleTagsOf } from "@/lib/data/meta";
import { HERITAGE } from "@/lib/data/heritage";

// ── 정적 디렉터리 데이터(카테고리별 인물). 헤더는 '필터'가 아니라 '표기·탐색'. ──
const SORTED = [...PEOPLE].sort((a, b) => a.year - b.year);
type Group = { key: string; label: string; people: { id: string; name: string; year: number }[] };
const slim = (p: (typeof PEOPLE)[number]) => ({ id: p.id, name: p.name, year: p.year });
function build(list: { key: string; label: string }[], keyOf: (p: (typeof PEOPLE)[number]) => string | string[]): Group[] {
  return list
    .map(({ key, label }) => ({ key, label, people: SORTED.filter((p) => { const k = keyOf(p); return Array.isArray(k) ? k.includes(key) : k === key; }).map(slim) }))
    .filter((g) => g.people.length > 0);
}
const DENOM_GROUPS = build(DENOM_LIST, (p) => denomOf(p.org));
const ROLE_GROUPS = build(ROLE_LIST, (p) => roleTagsOf(p.role));
const REGION_GROUPS = build(REGIONS, (p) => regionOf(p.place));
const COUNTRY_GROUPS: Group[] = [...new Set(PEOPLE.map((p) => p.country).filter(Boolean))]
  .map((c) => ({ key: c, label: c, people: SORTED.filter((p) => p.country === c).map(slim) }));
const CEMETERIES = [...new Set(Object.values(BURIAL))]
  .map((id) => PLACES.find((p) => p.id === id))
  .filter((p): p is NonNullable<typeof p> => !!p);
// 선교 유적지: 권역별 디렉터리
const HERITAGE_REGION_ORDER = ["서울·경기", "인천·강화", "충청", "호남", "영남", "관북·서북(북한)", "제주"];
const HERITAGE_GROUPS: Group[] = HERITAGE_REGION_ORDER
  .map((r) => ({ key: r, label: r, people: HERITAGE.filter((h) => h.region === r).map((h) => ({ id: h.id, name: h.name, year: h.year ?? 0 })) }))
  .filter((g) => g.people.length > 0);

const PANEL = "rgba(255,250,237,.99)";
const LINE = "rgba(77,56,34,.18)";

/** 카테고리별 인물 디렉터리 드롭다운 — 클릭하면 그 인물로 지도 이동(필터 아님). */
function DirectoryDrop({ id, label, groups, open, setOpen, onPickPerson }: {
  id: string; label: string; groups: Group[]; open: string | null; setOpen: (v: string | null) => void; onPickPerson: (pid: string) => void;
}) {
  const isOpen = open === id;
  return (
    <div className="relative" onMouseEnter={() => setOpen(id)} onMouseLeave={() => setOpen(isOpen ? null : open)}>
      <button onClick={() => setOpen(isOpen ? null : id)}
        className={clsx("flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors", isOpen ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white")}>
        {label}<span className="text-[8px] opacity-70">▾</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 w-64 pt-2">
          <div className="max-h-[68vh] overflow-y-auto rounded-xl border p-1.5 shadow-xl" style={{ background: PANEL, borderColor: LINE }}>
            {groups.map((g) => (
              <div key={g.key} className="mb-1.5">
                <div className="px-2 pb-0.5 pt-1 text-[10.5px] font-extrabold uppercase tracking-wider" style={{ color: "#80603b" }}>
                  {g.label} <span className="opacity-60">{g.people.length}</span>
                </div>
                {g.people.map((p) => (
                  <button key={p.id} onClick={() => onPickPerson(p.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[12.5px] font-semibold transition-colors hover:bg-[#f2e3c8]"
                    style={{ color: "#3e2c1d" }}>
                    <span className="truncate">{p.name}</span>
                    {p.year > 0 && <span className="text-[10.5px] opacity-50">{p.year}</span>}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** 단순 내비게이션 드롭다운(시기·묘역) — 항목 클릭 시 지도 이동. */
function NavDrop({ id, label, items, open, setOpen, onPick }: {
  id: string; label: string; items: { key: string; label: string; sub?: string }[]; open: string | null; setOpen: (v: string | null) => void; onPick: (key: string) => void;
}) {
  const isOpen = open === id;
  return (
    <div className="relative" onMouseEnter={() => setOpen(id)} onMouseLeave={() => setOpen(isOpen ? null : open)}>
      <button onClick={() => setOpen(isOpen ? null : id)}
        className={clsx("flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors", isOpen ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white")}>
        {label}<span className="text-[8px] opacity-70">▾</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 w-60 pt-2">
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border p-1.5 shadow-xl" style={{ background: PANEL, borderColor: LINE }}>
            {items.map((it) => (
              <button key={it.key} onClick={() => onPick(it.key)}
                className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-[12.5px] font-semibold transition-colors hover:bg-[#f2e3c8]" style={{ color: "#3e2c1d" }}>
                <span>{it.label}</span>{it.sub && <span className="text-[10.5px] opacity-55">{it.sub}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const PAGES = [
  { href: "/story", label: "들어가며" },
  { href: "/journey", label: "우리의 여정" },
  { href: "/", label: "지도" },
  { href: "/people", label: "인물" },
  { href: "/network", label: "관계망" },
  { href: "/dictionary", label: "인명사전" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);

  const goPerson = (pid: string) => { router.push(`/?person=${pid}`); setOpen(null); };
  const goFocus = (placeId: string) => { router.push(`/?focus=${placeId}`); setOpen(null); };
  const goYear = (y: number) => { router.push(`/?y=${y}`); setOpen(null); };
  const goHeritage = (hid: string) => { router.push(`/?heritage=${hid}`); setOpen(null); };

  return (
    <header
      className="sticky top-0 z-[1000] flex h-16 items-center justify-between gap-4 px-5 sm:px-7"
      style={{ background: "linear-gradient(180deg,#3a2a1c 0%,#2e2218 100%)", borderBottom: "1px solid rgba(255,248,236,0.08)", boxShadow: "0 4px 20px rgba(38,25,10,0.35)" }}
    >
      <Link href="/story" className="flex min-w-0 flex-none items-center gap-3">
        <span className="font-display flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-[22px] font-black leading-none text-white" style={{ background: "var(--grad-dream)", boxShadow: "var(--shadow-sky)" }}>Ð</span>
        <span className="hidden min-w-0 sm:block">
          <span className="font-display block truncate text-[15px] font-extrabold tracking-tight text-white">조선 선교사 온라인 자료실</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300 lg:block">Missionaries from Aunae · 1882–1960</span>
        </span>
      </Link>

      <nav className="flex items-center gap-0.5">
        <NavDrop id="era" label="선교 연혁" open={open} setOpen={setOpen}
          items={ERAS.map((e) => ({ key: e.key, label: e.label, sub: `${Math.round((e.from + e.to) / 2)}년` }))}
          onPick={(k) => { const e = ERAS.find((x) => x.key === k); if (e) goYear(Math.round((e.from + e.to) / 2)); }} />
        <NavDrop id="cem" label="선교 묘역" open={open} setOpen={setOpen}
          items={CEMETERIES.map((c) => ({ key: c.id, label: c.name }))} onPick={goFocus} />
        <DirectoryDrop id="denom" label="교단" groups={DENOM_GROUPS} open={open} setOpen={setOpen} onPickPerson={goPerson} />
        <DirectoryDrop id="country" label="나라" groups={COUNTRY_GROUPS} open={open} setOpen={setOpen} onPickPerson={goPerson} />
        <DirectoryDrop id="role" label="사역 분야" groups={ROLE_GROUPS} open={open} setOpen={setOpen} onPickPerson={goPerson} />
        <DirectoryDrop id="region" label="지역" groups={REGION_GROUPS} open={open} setOpen={setOpen} onPickPerson={goPerson} />
        <DirectoryDrop id="heritage" label="선교 유적지" groups={HERITAGE_GROUPS} open={open} setOpen={setOpen} onPickPerson={goHeritage} />

        <span className="mx-1.5 h-5 w-px bg-white/15" />

        {PAGES.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={clsx("rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors", active ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/8 hover:text-white")}>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
