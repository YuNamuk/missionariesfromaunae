"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { PLACES, BURIAL, PEOPLE } from "@/lib/data";
import { ERAS, DENOM_LIST, ROLE_LIST, REGIONS } from "@/lib/data/meta";

// Data-derived dropdown sources (static at module load).
const CEMETERIES = [...new Set(Object.values(BURIAL))]
  .map((id) => PLACES.find((p) => p.id === id))
  .filter((p): p is NonNullable<typeof p> => !!p);
const COUNTRIES = [...new Set(PEOPLE.map((p) => p.country).filter(Boolean))];

type Item = { key: string; label: string };

/** A hover dropdown on the dark header that drives the map via URL params. */
function HeaderDrop({
  id,
  label,
  items,
  axis,
  open,
  setOpen,
  active,
  onPick,
}: {
  id: string;
  label: string;
  items: Item[];
  axis?: string;
  open: string | null;
  setOpen: (v: string | null) => void;
  active: string[];
  onPick: (key: string) => void;
}) {
  const isOpen = open === id;
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(id)}
      onMouseLeave={() => setOpen(isOpen ? null : open)}
    >
      <button
        onClick={() => setOpen(isOpen ? null : id)}
        className={clsx(
          "flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors",
          isOpen || active.length ? "bg-white/15 text-white" : "text-white/60 hover:bg-white/10 hover:text-white",
        )}
      >
        {label}
        {active.length > 0 && (
          <span className="rounded-full bg-[#bf6b22] px-1.5 text-[10px] font-extrabold text-white">{active.length}</span>
        )}
        <span className="text-[8px] opacity-70">▾</span>
      </button>
      {isOpen && (
        <div
          className="absolute right-0 top-9 z-50 max-h-[60vh] w-60 overflow-y-auto rounded-xl border p-1.5 shadow-xl"
          style={{ background: "rgba(255,250,237,.99)", borderColor: "rgba(77,56,34,.18)" }}
        >
          {items.map((it) => {
            const on = active.includes(it.key);
            return (
              <button
                key={it.key}
                onClick={() => onPick(it.key)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-[12.5px] transition-colors hover:bg-[#f2e3c8]"
                style={{ color: "#4a3a28", background: on ? "#f2e3c8" : "transparent", fontWeight: on ? 800 : 600 }}
              >
                <span>{it.label}</span>
                {axis && (
                  <span
                    className="flex h-[15px] w-[15px] flex-none items-center justify-center rounded text-[11px] text-white"
                    style={{ border: `1.5px solid ${on ? "#9b3d2d" : "rgba(77,56,34,.25)"}`, background: on ? "#9b3d2d" : "transparent" }}
                  >
                    {on ? "✓" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const PAGES = [
  { href: "/", label: "지도" },
  { href: "/people", label: "인물" },
  { href: "/network", label: "관계망" },
  { href: "/dictionary", label: "인명사전" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState<string | null>(null);

  const csv = (k: string) => { const v = sp.get(k); return v ? v.split(",").filter(Boolean) : []; };
  // Build "/?..." from the current params, toggling one facet value.
  const toggle = (key: string, val: string, extra?: Record<string, string>) => {
    const params = new URLSearchParams(Array.from(sp.entries()));
    const cur = (params.get(key) ?? "").split(",").filter(Boolean);
    const next = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
    if (next.length) params.set(key, next.join(",")); else params.delete(key);
    if (extra) for (const [k, v] of Object.entries(extra)) params.set(k, v);
    router.push(`/?${params.toString()}`);
    setOpen(null);
  };
  const goFocus = (id: string) => {
    const params = new URLSearchParams(Array.from(sp.entries()));
    params.set("focus", id);
    router.push(`/?${params.toString()}`);
    setOpen(null);
  };

  return (
    <header
      className="sticky top-0 z-[1000] flex h-16 items-center justify-between gap-4 px-5 sm:px-7"
      style={{
        background: "linear-gradient(180deg,#3a2a1c 0%,#2e2218 100%)",
        borderBottom: "1px solid rgba(255,248,236,0.08)",
        boxShadow: "0 4px 20px rgba(38,25,10,0.35)",
      }}
    >
      <Link href="/" className="flex min-w-0 flex-none items-center gap-3">
        <span
          className="font-display flex h-9 w-9 flex-none items-center justify-center rounded-[11px] text-[22px] font-black leading-none text-white"
          style={{ background: "var(--grad-dream)", boxShadow: "var(--shadow-sky)" }}
        >
          Ð
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="font-display block truncate text-[15px] font-extrabold tracking-tight text-white">조선 선교사 온라인 자료실</span>
          <span className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-sky-300 lg:block">Missionaries from Aunae · 1882–1960</span>
        </span>
      </Link>

      <nav className="flex items-center gap-0.5">
        <HeaderDrop id="era" label="선교 연혁" axis="era" items={ERAS.map((e) => ({ key: e.key, label: e.label }))} open={open} setOpen={setOpen} active={csv("era")} onPick={(k) => { const e = ERAS.find((x) => x.key === k); toggle("era", k, e ? { y: String(Math.round((e.from + e.to) / 2)) } : undefined); }} />
        <HeaderDrop id="cem" label="선교 묘역" items={CEMETERIES.map((c) => ({ key: c.id, label: c.name }))} open={open} setOpen={setOpen} active={[]} onPick={goFocus} />
        <HeaderDrop id="denom" label="교단" axis="denom" items={DENOM_LIST} open={open} setOpen={setOpen} active={csv("denom")} onPick={(k) => toggle("denom", k)} />
        <HeaderDrop id="country" label="나라" axis="country" items={COUNTRIES.map((c) => ({ key: c, label: c }))} open={open} setOpen={setOpen} active={csv("country")} onPick={(k) => toggle("country", k)} />
        <HeaderDrop id="role" label="사역 분야" axis="role" items={ROLE_LIST} open={open} setOpen={setOpen} active={csv("role")} onPick={(k) => toggle("role", k)} />
        <HeaderDrop id="region" label="지역" axis="region" items={REGIONS} open={open} setOpen={setOpen} active={csv("region")} onPick={(k) => toggle("region", k)} />

        <span className="mx-1.5 h-5 w-px bg-white/15" />

        {PAGES.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors",
                active ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/8 hover:text-white",
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
