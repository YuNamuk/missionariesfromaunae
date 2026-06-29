"use client";

import { useState } from "react";
import Link from "next/link";
import { orgTint } from "@/components/map/atlas-icons";

export type SpanPerson = {
  id: string;
  name: string;
  org: string;
  year: number;
  life: string;
  periods: [number, number][];
  featured: boolean;
};

const MIN = 1882;
const MAX = 1965;
const SPAN = MAX - MIN;
const pct = (y: number) => ((Math.max(MIN, Math.min(MAX, y)) - MIN) / SPAN) * 100;
const DECADES = [1890, 1900, 1910, 1920, 1930, 1940, 1950, 1960];

export function SpanChart({ people }: { people: SpanPerson[] }) {
  const [featuredOnly, setFeaturedOnly] = useState(true);
  const list = people.filter((p) => !featuredOnly || p.featured).sort((a, b) => a.year - b.year);
  const LABEL = 116; // 좌측 이름 칸 px

  return (
    <div className="mx-auto max-w-5xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">Years in Korea</p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">활동 연표</h1>
      <p className="font-serif mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-600">
        내한 선교사들이 <b className="text-ink-800">언제부터 언제까지</b> 이 땅에 있었는지를 한눈에 봅니다.
        막대 하나가 한 사람의 한국 활동기간입니다 — 몇 달에 그친 이도, 반세기를 머문 이도 있습니다.
      </p>

      <div className="mt-5 flex items-center gap-2">
        <button onClick={() => setFeaturedOnly((v) => !v)} className="rounded-full border border-ink-200 px-3.5 py-1.5 text-[12.5px] font-bold" style={featuredOnly ? { background: "#2f2419", color: "#fff8ed" } : { color: "var(--ink-600)" }}>
          {featuredOnly ? "★ 대표만" : "전체"}
        </button>
        <span className="text-[12.5px] text-ink-400">{list.length}명 · 입국 연도순</span>
      </div>

      {/* 연도 축 */}
      <div className="mt-5 flex">
        <div style={{ width: LABEL }} className="flex-none" />
        <div className="relative h-5 flex-1">
          {DECADES.map((d) => (
            <span key={d} className="absolute -translate-x-1/2 text-[11px] font-bold text-ink-400" style={{ left: `${pct(d)}%` }}>{d}</span>
          ))}
        </div>
      </div>

      {/* 막대들 */}
      <div className="mt-1 border-t border-ink-100">
        {list.map((p) => (
          <div key={p.id} className="flex items-center border-b border-ink-100" style={{ height: 26 }}>
            <Link href={`/people/${p.id}`} style={{ width: LABEL }} className="flex-none truncate pr-2 text-[12.5px] font-bold text-ink-700 hover:text-sky-600">{p.name}</Link>
            <div className="relative h-full flex-1">
              {/* 10년 격자 */}
              {DECADES.map((d) => (
                <span key={d} className="absolute top-0 h-full w-px bg-ink-100" style={{ left: `${pct(d)}%` }} />
              ))}
              {p.periods.map(([s, e], i) => {
                const left = pct(s);
                const w = Math.max(0.8, pct(e) - left);
                return (
                  <Link
                    key={i}
                    href={`/people/${p.id}`}
                    title={`${p.name} · ${s}–${e === 9999 ? "?" : e} (${e === 9999 ? "?" : e - s}년)`}
                    className="absolute top-1/2 -translate-y-1/2 rounded-full"
                    style={{ left: `${left}%`, width: `${w}%`, height: 11, background: orgTint(p.org), opacity: 0.92 }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[12px] leading-relaxed text-ink-400">
        막대 색은 소속 교단 계열을 따릅니다. 종료 연도는 한국 활동의 끝(귀국·추방·별세) 기준이며, 일부는 사망 연도로 근사했습니다.
        막대를 누르면 그 선교사의 상세로 이동합니다.
      </p>
    </div>
  );
}
