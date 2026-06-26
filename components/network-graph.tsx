"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export interface GraphNode {
  id: string;
  name: string;
  glyph: string;
  org: string;
  year: number;
  photo: string | null;
}
export interface GraphEdge {
  from: string;
  to: string;
  type: string;
  label: string;
  color: string;
  dash: string | null;
  note: string;
  directional: boolean;
}
export interface RelLegend {
  key: string;
  label: string;
  color: string;
  dash: string | null;
}

const W = 760;
const H = 620;
const CX = W / 2;
const CY = H / 2;
const R = 232;

export function NetworkGraph({
  nodes,
  edges,
  legend,
}: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  legend: RelLegend[];
}) {
  const [active, setActive] = useState<string | null>(null);

  // deterministic circular layout, ordered by arrival year so the timeline
  // reads roughly clockwise.
  const pos = useMemo(() => {
    const ordered = [...nodes].sort((a, b) => a.year - b.year);
    const map = new Map<string, { x: number; y: number }>();
    ordered.forEach((n, i) => {
      const a = (i / ordered.length) * Math.PI * 2 - Math.PI / 2;
      map.set(n.id, { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) });
    });
    return map;
  }, [nodes]);

  const isDim = (id: string) =>
    active !== null &&
    active !== id &&
    !edges.some(
      (e) =>
        (e.from === active && e.to === id) ||
        (e.to === active && e.from === id),
    );

  const edgeDim = (e: GraphEdge) =>
    active !== null && e.from !== active && e.to !== active;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_240px]">
      <div
        className="overflow-hidden rounded-3xl border border-ink-200"
        style={{ background: "linear-gradient(180deg,#2e2218,#1c140d)", boxShadow: "var(--shadow-md)" }}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          <defs>
            {legend.map((l) => (
              <marker
                key={l.key}
                id={`arrow-${l.key}`}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" fill={l.color} />
              </marker>
            ))}
          </defs>

          {/* edges */}
          {edges.map((e, i) => {
            const a = pos.get(e.from);
            const b = pos.get(e.to);
            if (!a || !b) return null;
            const dim = edgeDim(e);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={e.color}
                strokeWidth={dim ? 1 : 2}
                strokeDasharray={e.dash ?? undefined}
                strokeOpacity={dim ? 0.12 : 0.7}
                markerEnd={e.directional ? `url(#arrow-${e.type})` : undefined}
              />
            );
          })}

          <defs>
            {nodes.filter((n) => n.photo).map((n) => (
              <clipPath key={n.id} id={`clip-${n.id}`}>
                <circle r={active === n.id ? 26 : 22} cx={0} cy={0} />
              </clipPath>
            ))}
          </defs>

          {/* nodes */}
          {nodes.map((n) => {
            const p = pos.get(n.id)!;
            const dim = isDim(n.id);
            const r = active === n.id ? 26 : 22;
            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                style={{ cursor: "pointer", opacity: dim ? 0.25 : 1, transition: "opacity .2s" }}
                onMouseEnter={() => setActive(n.id)}
                onMouseLeave={() => setActive(null)}
              >
                <Link href={`/people/${n.id}`}>
                  <circle r={r + 2} fill="#3a2a1c" />
                  {n.photo ? (
                    <image
                      href={n.photo}
                      x={-r}
                      y={-r}
                      width={r * 2}
                      height={r * 2}
                      clipPath={`url(#clip-${n.id})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  ) : (
                    <text textAnchor="middle" dy="7" fontSize="20" fill="#fff8ec">
                      {n.glyph}
                    </text>
                  )}
                  <circle r={r} fill="none" stroke={active === n.id ? "#bf6b22" : "rgba(255,248,236,0.35)"} strokeWidth={active === n.id ? 3 : 1.5} />
                  <text
                    textAnchor="middle"
                    dy={r + 18}
                    fontSize="12"
                    fontWeight="800"
                    fill="#fff8ec"
                    style={{ fontFamily: "var(--font-display)", pointerEvents: "none" }}
                  >
                    {n.name}
                  </text>
                </Link>
              </g>
            );
          })}
        </svg>
      </div>

      {/* legend */}
      <aside className="space-y-4">
        <div className="rounded-2xl border border-ink-200 bg-white p-4">
          <div className="font-display text-[14px] font-extrabold text-ink-900">
            관계 유형
          </div>
          <ul className="mt-3 space-y-2.5">
            {legend.map((l) => (
              <li key={l.key} className="flex items-center gap-2.5">
                <svg width="34" height="10">
                  <line
                    x1="0"
                    y1="5"
                    x2="34"
                    y2="5"
                    stroke={l.color}
                    strokeWidth="3"
                    strokeDasharray={l.dash ?? undefined}
                  />
                </svg>
                <span className="text-[13px] font-bold text-ink-700">{l.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="px-1 text-[12px] leading-relaxed text-ink-500">
          노드에 마우스를 올리면 해당 인물과 직접 연결된 관계만 강조됩니다. 이름을
          클릭하면 인물 상세로 이동합니다.
        </p>
      </aside>
    </div>
  );
}
