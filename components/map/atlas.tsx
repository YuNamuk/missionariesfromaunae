"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, X, ArrowRight, Settings, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";
import type { AtlasData, MapPerson, MapPlace } from "./types";
import { isFeatured, regionOf, REGIONS, ERAS, erasOf, denomOf, DENOM_LIST, roleTagsOf, ROLE_LIST, peakYear } from "@/lib/data/meta";

/* ── warm archival palette (scoped to this immersive view) ── */
const C = {
  ink: "#251c14",
  muted: "#6b5e4b",
  faint: "#8a7a63",
  paper: "#f6efe1",
  paper2: "#efe1c3",
  panel: "rgba(255,251,242,.82)",
  line: "rgba(77,56,34,.18)",
  sea: "#0b1b2b",
};
// category accents (warm)
const CAT_COLOR: Record<string, string> = {
  port: "#1f6f8b",
  origin: "#bf6b22",
  site: "#9b3d2d",
  person: "#875da7",
};
// person marker tint by org
function orgTint(org: string) {
  if (org.includes("북장로회")) return "#1f6f8b";
  if (org.includes("북감리회")) return "#875da7";
  if (org.includes("권서") || org.includes("조선") || org.includes("개종")) return "#bf6b22";
  return "#3f7f4b";
}

function personLatLng(base: [number, number], i: number, n: number): [number, number] {
  if (n <= 1) return [base[0] + 0.05, base[1] + 0.06];
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  const r = 0.17;
  return [base[0] + r * Math.sin(a), base[1] + r * Math.cos(a)];
}

function labelHtml(text: string, top: number, dark: boolean) {
  const bg = dark ? "rgba(50,35,21,.86)" : "rgba(255,250,237,.92)";
  const color = dark ? "#fff8ed" : "#3f2f21";
  const border = dark ? "none" : "1px solid rgba(73,48,22,.18)";
  return `<div style="position:absolute;top:${top}px;left:50%;transform:translateX(-50%);white-space:nowrap;background:${bg};color:${color};border:${border};border-radius:99px;padding:2px 7px;font-size:10.5px;font-weight:800;letter-spacing:-.01em;box-shadow:0 2px 6px rgba(46,28,14,.2);pointer-events:none;">${text}</div>`;
}
function placeIcon(p: MapPlace, sel: boolean, dim: boolean) {
  const color = CAT_COLOR[p.cat] ?? p.color;
  const size = sel ? 38 : 30;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px;opacity:${dim ? 0.4 : 1};transition:opacity .2s;">
      <div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};color:#fff8ec;font-size:${size * 0.46}px;font-weight:800;border:3px solid #fff8ec;box-shadow:0 5px 14px rgba(46,28,14,.4);${sel ? "outline:3px solid rgba(155,61,45,.4);outline-offset:2px;" : ""}">${p.glyph}</div>
      ${labelHtml(p.name, size + 3, true)}
    </div>`,
  });
}
function personIcon(p: MapPerson, sel: boolean, opacity: number, related: boolean) {
  const color = orgTint(p.org);
  const size = sel ? 44 : related ? 36 : 30;
  const ring = sel ? "3px solid #9b3d2d" : related ? "2px solid #bf6b22" : `2px solid #fff8ec`;
  const inner = p.photo
    ? `background:#efe1c3 center/cover url('${p.photo}');`
    : `background:${color};display:flex;align-items:center;justify-content:center;color:#fff8ec;font-size:${size * 0.42}px;font-weight:800;`;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px;opacity:${opacity};transition:opacity .2s;">
      <div style="${inner}width:${size}px;height:${size}px;border-radius:50%;border:${ring};box-shadow:0 4px 11px rgba(46,28,14,.45);">${p.photo ? "" : p.glyph}</div>
      ${labelHtml(p.name, size + 3, false)}
    </div>`,
  });
}

/** Rounded directional arrow + label, placed at an edge midpoint to show who
 *  influenced whom. Angle is the screen bearing from source → target. */
function arrowIcon(angleDeg: number, color: string, label: string) {
  return L.divIcon({
    className: "",
    iconSize: [0, 0],
    html: `<div style="transform:translate(-50%,-50%);display:flex;align-items:center;gap:5px;white-space:nowrap;">
      <div style="transform:rotate(${angleDeg}deg);width:21px;height:21px;display:flex;align-items:center;justify-content:center;background:${color};border-radius:8px;box-shadow:0 2px 7px rgba(46,28,14,.45);">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff8ec" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M8 5l8 7-8 7"/></svg>
      </div>
      ${label ? `<span style="background:rgba(40,26,14,.92);color:#fff8ec;font-size:10px;font-weight:800;padding:2px 8px;border-radius:99px;">${label}</span>` : ""}
    </div>`,
  });
}
/** Screen bearing (deg, CSS clockwise, 0 = →) from latlng a to b. */
function bearingDeg(a: [number, number], b: [number, number]) {
  return (Math.atan2(-(b[0] - a[0]), b[1] - a[1]) * 180) / Math.PI;
}

// ── 시대별 정세(역사 국경) 오버레이 ──────────────────────────────
// 출처: historical-basemaps (github.com/aourednik/historical-basemaps, ODbL).
const GEO_YEARS = [1880, 1900, 1914, 1920, 1938, 1945, 1960];
const geoCache = new Map<number, unknown>();
function nearestGeoYear(y: number) {
  return GEO_YEARS.reduce((b, c) => (Math.abs(c - y) < Math.abs(b - y) ? c : b), GEO_YEARS[0]);
}
function koreaEra(y: number) {
  if (y < 1897) return "조선";
  if (y < 1910) return "대한제국";
  if (y < 1945) return "일제강점기 (조선)";
  return "대한민국";
}
// 동아시아 bbox 안에 좌표가 하나라도 있으면 표시 대상
function inEastAsia(geom: { coordinates?: unknown } | null): boolean {
  let hit = false;
  const scan = (a: unknown): void => {
    if (hit || !Array.isArray(a)) return;
    if (typeof a[0] === "number") {
      const lng = a[0] as number, lat = a[1] as number;
      if (lng >= 95 && lng <= 150 && lat >= 18 && lat <= 55) hit = true;
      return;
    }
    for (const x of a) { if (hit) return; scan(x); }
  };
  if (geom?.coordinates) scan(geom.coordinates);
  return hit;
}
function geoTint(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return `hsl(${h},45%,55%)`;
}
/** Fetches the nearest-year world boundaries and paints East Asia faintly. */
function HistoricalOverlay({ year, on }: { year: number; on: boolean }) {
  const map = useMap();
  const layerRef = useRef<L.GeoJSON | null>(null);
  useEffect(() => {
    const clear = () => { if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; } };
    if (!on) { clear(); return; }
    let cancelled = false;
    const fy = nearestGeoYear(year);
    (async () => {
      try {
        let gj = geoCache.get(fy) as { features?: { geometry: { coordinates?: unknown }; properties?: Record<string, string> }[] } | undefined;
        if (!gj) {
          const res = await fetch(`https://raw.githubusercontent.com/aourednik/historical-basemaps/master/geojson/world_${fy}.geojson`);
          gj = await res.json();
          geoCache.set(fy, gj);
        }
        if (cancelled || !gj?.features) return;
        clear();
        const nameOf = (p?: Record<string, string>) => p?.NAME ?? p?.name ?? p?.SUBJECTO ?? "";
        const layer = L.geoJSON({ type: "FeatureCollection", features: gj.features.filter((f) => inEastAsia(f.geometry)) } as never, {
          style: (f) => ({ color: "rgba(74,52,30,.6)", weight: 1, fillColor: geoTint(nameOf((f as { properties?: Record<string, string> }).properties)), fillOpacity: 0.12 }),
          onEachFeature: (f, l) => { const nm = nameOf((f as { properties?: Record<string, string> }).properties); if (nm) l.bindTooltip(nm, { sticky: true, className: "reltip" }); },
        });
        layer.addTo(map);
        if (layerRef.current) map.removeLayer(layerRef.current);
        layerRef.current = layer;
      } catch { /* 네트워크 실패 시 조용히 무시 */ }
    })();
    return () => { cancelled = true; };
  }, [on, year, map]);
  useEffect(() => () => { if (layerRef.current) map.removeLayer(layerRef.current); }, [map]);
  return null;
}

/** Re-measures the map after the side panels collapse/expand. */
function InvalidateOnResize({ deps }: { deps: unknown[] }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 320);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return null;
}

const ZOOM_PRESET: Record<string, { maxZoom: number; pad: number }> = {
  loose: { maxZoom: 7.5, pad: 90 },
  normal: { maxZoom: 9, pad: 58 },
  tight: { maxZoom: 11, pad: 34 },
};

/** Flies the camera to fit the current selection + its relationship network. */
function FitToSelection({ targets, focusKey, fit, skipFirst }: { targets: [number, number][]; focusKey: string; fit: string; skipFirst: boolean }) {
  const map = useMap();
  const first = useRef(skipFirst);
  useEffect(() => {
    if (first.current) { first.current = false; return; } // 초기엔 넓은 지도 유지
    if (targets.length === 0) return;
    const { maxZoom, pad } = ZOOM_PRESET[fit] ?? ZOOM_PRESET.tight;
    if (targets.length === 1) {
      map.flyTo(targets[0], maxZoom, { duration: 0.5, easeLinearity: 0.25 });
      return;
    }
    map.flyToBounds(L.latLngBounds(targets), { paddingTopLeft: [pad + 20, pad], paddingBottomRight: [pad + 20, pad + 50], maxZoom, duration: 0.5, easeLinearity: 0.25 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, fit]);
  return null;
}

/** Continuous, cursor-anchored wheel zoom — replaces Leaflet's stepped wheel
 *  handler with a per-frame interpolation so zooming feels smooth (Google-Maps
 *  style) instead of jumping a whole level at a time. */
function SmoothWheelZoom({ speed = 1 }: { speed?: number }) {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    let goal: { zoom: number; latlng: L.LatLng } | null = null;
    let active = false;
    let raf = 0;
    const frame = () => {
      if (!goal) { active = false; return; }
      const cur = map.getZoom();
      const diff = goal.zoom - cur;
      if (Math.abs(diff) < 0.02) {
        map.setZoomAround(goal.latlng, goal.zoom, { animate: false });
        goal = null; active = false; return;
      }
      map.setZoomAround(goal.latlng, cur + diff * 0.32, { animate: false });
      raf = requestAnimationFrame(frame);
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // normalize line/page wheel modes to pixels so mice and trackpads agree
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientHeight : 1;
      const px = e.deltaY * unit;
      const pt = map.mouseEventToContainerPoint(e);
      const latlng = map.containerPointToLatLng(pt);
      const base = goal ? goal.zoom : map.getZoom();
      const zoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), base - px * 0.0024 * speed));
      goal = { zoom, latlng };
      if (!active) { active = true; map.stop(); raf = requestAnimationFrame(frame); }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => { el.removeEventListener("wheel", onWheel); cancelAnimationFrame(raf); };
  }, [map, speed]);
  return null;
}

/** Faint chips placed where each off-screen connection line crosses the edge. */
function OffscreenIndicators({ targets, origin, onPick }: { targets: { id: string; name: string; place: string; lat: number; lng: number }[]; origin: [number, number] | null; onPick: (id: string) => void }) {
  const map = useMap();
  const [chips, setChips] = useState<{ id: string; name: string; place: string; x: number; y: number }[]>([]);
  useEffect(() => {
    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
    const update = () => {
      const size = map.getSize();
      const m = 18;
      const o = origin ? map.latLngToContainerPoint(origin) : { x: size.x / 2, y: size.y / 2 };
      const out: { id: string; name: string; place: string; x: number; y: number }[] = [];
      for (const t of targets) {
        const p = map.latLngToContainerPoint([t.lat, t.lng]);
        if (p.x >= 0 && p.x <= size.x && p.y >= 0 && p.y <= size.y) continue;
        // intersection of the line origin→target with the inset viewport rect
        const dx = p.x - o.x, dy = p.y - o.y;
        let tmin = 1;
        const cands: number[] = [];
        if (dx > 0) cands.push((size.x - m - o.x) / dx);
        if (dx < 0) cands.push((m - o.x) / dx);
        if (dy > 0) cands.push((size.y - m - o.y) / dy);
        if (dy < 0) cands.push((m - o.y) / dy);
        for (const c of cands) {
          if (c <= 0 || c > 1) continue;
          const ix = o.x + c * dx, iy = o.y + c * dy;
          if (ix >= m - 1 && ix <= size.x - m + 1 && iy >= m - 1 && iy <= size.y - m + 1) tmin = Math.min(tmin, c);
        }
        out.push({ id: t.id, name: t.name, place: t.place, x: clamp(o.x + tmin * dx, m, size.x - m), y: clamp(o.y + tmin * dy, m, size.y - m) });
      }
      setChips(out);
    };
    update();
    map.on("move zoom resize zoomend moveend", update);
    return () => { map.off("move zoom resize zoomend moveend", update); };
  }, [map, targets, origin]);
  if (!chips.length) return null;
  return createPortal(
    <>
      {chips.map((c) => (
        <button key={c.id} onClick={() => onPick(c.id)} title={`${c.place}의 ${c.name}`}
          style={{ position: "absolute", left: c.x, top: c.y, transform: "translate(-50%,-50%)", zIndex: 450, display: "flex", flexDirection: "column", alignItems: "center", gap: 1, padding: "3px 7px", borderRadius: 99, background: "rgba(50,35,21,.55)", color: "rgba(255,248,236,.78)", border: "1px solid rgba(255,248,236,.18)", cursor: "pointer", fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap", lineHeight: 1.25 }}>
          <span>↟ {c.name}</span>
          <span style={{ opacity: 0.7, fontSize: 8.5 }}>{c.place}</span>
        </button>
      ))}
    </>,
    map.getContainer(),
  );
}

/** Warm zoom / reset controls rendered inside the map. */
function MapControls() {
  const map = useMap();
  const btn: React.CSSProperties = { width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(73,48,22,.2)", background: "rgba(255,250,237,.92)", color: "#493728", cursor: "pointer", fontSize: 18, fontWeight: 900, lineHeight: 1 };
  return createPortal(
    <div style={{ position: "absolute", right: 16, bottom: 16, zIndex: 500, display: "flex", flexDirection: "column", borderRadius: 12, overflow: "hidden", boxShadow: "0 6px 18px rgba(46,28,14,.3)" }}>
      <button title="확대" onClick={() => map.zoomIn()} style={{ ...btn, borderBottom: 0 }}>＋</button>
      <button title="축소" onClick={() => map.zoomOut()} style={{ ...btn, borderBottom: 0 }}>−</button>
      <button title="처음 위치" onClick={() => map.flyTo([38.4, 127.5], 6, { duration: 0.5 })} style={{ ...btn, fontSize: 14 }}>⤾</button>
    </div>,
    map.getContainer(),
  );
}

/** Compact hover/click dropdown used for the data-bank filter menu bar. */
function MenuBtn({ id, label, count, openMenu, setOpenMenu, wide, children }: { id: string; label: string; count?: number; openMenu: string | null; setOpenMenu: (v: string | null) => void; wide?: boolean; children: React.ReactNode }) {
  const open = openMenu === id;
  return (
    <div style={{ position: "relative" }} onMouseEnter={() => setOpenMenu(id)} onMouseLeave={() => setOpenMenu(open ? null : openMenu)}>
      <button onClick={() => setOpenMenu(open ? null : id)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 10, border: `1px solid ${open ? "#9b3d2d" : C.line}`, background: open ? "#9b3d2d" : count ? "#f2e3c8" : "rgba(255,255,255,.6)", color: open ? "#fff8ed" : "#5f4d39", cursor: "pointer", fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>
        {label}
        {count ? <span style={{ background: open ? "rgba(255,255,255,.3)" : "#9b3d2d", color: "#fff8ed", borderRadius: 99, padding: "0 6px", fontSize: 10.5, fontWeight: 800 }}>{count}</span> : null}
        <span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
      </button>
      {open && (
        // top:100% + 위쪽 패딩으로 버튼↔패널 사이 틈을 메워(호버 브리지) 끊김 없이 유지
        <div style={{ position: "absolute", top: "100%", left: 0, paddingTop: 6, width: wide ? 300 : 196, zIndex: 900 }}>
          <div style={{ maxHeight: 360, overflowY: "auto", background: "rgba(255,250,237,.99)", border: `1px solid ${C.line}`, borderRadius: 13, boxShadow: "0 14px 32px rgba(46,28,14,.24)", padding: 7 }}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

/** A single checkable filter row inside a MenuBtn dropdown. */
function FacetRow({ label, sub, on, onClick }: { label: string; sub?: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, width: "100%", textAlign: "left", border: 0, background: on ? "#f2e3c8" : "transparent", borderRadius: 8, padding: "8px 9px", cursor: "pointer", color: "#4a3a28", fontSize: 12.5, fontWeight: on ? 800 : 600 }}>
      <span>{label}{sub ? <span style={{ color: C.muted, fontWeight: 500 }}> · {sub}</span> : null}</span>
      <span style={{ flex: "0 0 auto", width: 15, height: 15, borderRadius: 4, border: `1.5px solid ${on ? "#9b3d2d" : C.line}`, background: on ? "#9b3d2d" : "transparent", color: "#fff8ed", fontSize: 11, lineHeight: "13px", textAlign: "center" }}>{on ? "✓" : ""}</span>
    </button>
  );
}

type Selected = { kind: "place" | "person" | "event"; id: string } | null;
export type Lens = "people" | "era" | "cemetery" | "network" | "history";

// 인물들이 가장 활발하던 시점 — 첫 진입 기본 연도(캐시 없을 때)
function defaultYear(data: AtlasData) {
  return peakYear(data.people.map((p) => p.active), data.yearMin, data.yearMax);
}

export function Atlas({ data, lens = "people" }: { data: AtlasData; lens?: Lens }) {
  const peak = useMemo(() => defaultYear(data), [data]);
  const [year, setYear] = useState(lens === "era" ? peak : data.yearMax);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Selected>(() => {
    if (lens === "history") return { kind: "event", id: "0" };
    if (lens === "cemetery") {
      const names = new Set(data.people.map((p) => p.burial).filter(Boolean));
      const first = data.places.find((pl) => names.has(pl.name));
      return first ? { kind: "place", id: first.id } : null;
    }
    // 홈(people)은 자동 선택 없이 '조선 선교의 흐름' 내러티브로 진입.
    return null;
  });
  // 상세 카드 뒤로가기: 선택 이력 스택. 새 선택은 push, 뒤로가기는 pop.
  const [history, setHistory] = useState<Selected[]>([]);
  const selKey = (s: Selected) => (s ? `${s.kind}:${s.id}` : "");
  const prevSelRef = useRef<Selected>(null);
  const goingBackRef = useRef(false);
  const firstSelRun = useRef(true);
  useEffect(() => {
    if (firstSelRun.current) { firstSelRun.current = false; prevSelRef.current = selected; return; }
    if (selKey(prevSelRef.current) !== selKey(selected)) {
      if (goingBackRef.current) goingBackRef.current = false;
      else setHistory((h) => [...h, prevSelRef.current]);
    }
    prevSelRef.current = selected;
  }, [selected]);
  const goBack = () => setHistory((h) => {
    if (!h.length) return h;
    goingBackRef.current = true;
    setSelected(h[h.length - 1]);
    return h.slice(0, -1);
  });
  const [showSettings, setShowSettings] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [fit, setFit] = useState<string>("tight");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("atlas-fit") : null;
    if (saved) setFit(saved);
  }, []);
  const changeFit = (v: string) => {
    setFit(v);
    try { window.localStorage.setItem("atlas-fit", v); } catch {}
  };

  // 대표만 보기(기본 노출 축소) · 필터(교단·지역·시대·역할) · 관계망 집중
  const [featuredOnly, setFeaturedOnly] = useState(lens === "people" || lens === "era");
  const [filters, setFilters] = useState<{ denom: string[]; region: string[]; era: string[]; role: string[]; country: string[] }>({ denom: [], region: [], era: [], role: [], country: [] });
  const [netFocus, setNetFocus] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [listAll, setListAll] = useState(false); // 리스트바: 대표만/전체
  const [pickerOpen, setPickerOpen] = useState(false); // 인물 드롭다운: 마우스 영역 안이면 유지
  const [showGeo, setShowGeo] = useState(false); // 시대별 정세(역사 국경) 오버레이
  const toggleFacet = (axis: keyof typeof filters, key: string) =>
    setFilters((f) => ({ ...f, [axis]: f[axis].includes(key) ? f[axis].filter((k) => k !== key) : [...f[axis], key] }));
  const setFacet = (axis: keyof typeof filters, keys: string[]) => setFilters((f) => ({ ...f, [axis]: keys }));
  const clearFilters = () => setFilters({ denom: [], region: [], era: [], role: [], country: [] });
  const facetCount = filters.denom.length + filters.region.length + filters.era.length + filters.role.length + filters.country.length;
  // 파송 나라 목록(데이터에서 도출)
  const COUNTRIES = useMemo(() => [...new Set(data.people.map((p) => p.country).filter(Boolean))], [data.people]);

  // false = 전체 보기; true = 특정 연도 시점 스냅샷(생존·활동 중인 인물만)
  const [snapshot, setSnapshot] = useState(lens === "era");

  // ── 연도/스냅샷은 localStorage 캐시, 필터/대표만은 URL 파라미터로(헤더 메뉴 연동) ──
  const restored = useRef(false);
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = window.localStorage.getItem("atlas-view");
      if (raw) {
        const v = JSON.parse(raw);
        if (typeof v.year === "number") setYear(v.year);
        if (typeof v.snapshot === "boolean") setSnapshot(v.snapshot);
      } else if (lens !== "era") {
        setYear(peak); // 캐시 없는 첫 진입 → 선교사들이 가장 많던 시점
        setSnapshot(true);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!restored.current) return;
    try { window.localStorage.setItem("atlas-view", JSON.stringify({ year, snapshot })); } catch {}
  }, [year, snapshot]);

  // 헤더 메뉴 = 내비게이션(인물·묘역·연도)만 URL로 전달. 필터는 아래 패널의
  // 클라이언트 상태가 전담(즉시 반응) → 필터를 URL과 동기화하지 않아 빠르다.
  const sp = useSearchParams();
  const navSig = `${sp.get("person") ?? ""}|${sp.get("focus") ?? ""}|${sp.get("y") ?? ""}`;
  useEffect(() => {
    const person = sp.get("person");
    const focus = sp.get("focus");
    const y = sp.get("y");
    if (person) setSelected({ kind: "person", id: person });
    else if (focus) setSelected({ kind: "place", id: focus });
    if (y) { setYear(Number(y)); setSnapshot(true); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navSig]);
  const setYearSnapshot = (y: number) => { setYear(y); setSnapshot(true); };
  // 조선 사역 구간(다중 구간 포함) 안에 들어와야 그 시점에 표시
  const yearOK = (p: MapPerson) => !snapshot || p.active.some(([s, e]) => s <= year && year <= e);

  const q = query.trim().toLowerCase();
  const matchPerson = (p: MapPerson) =>
    !q || [p.name, p.en, p.org, p.role, p.summary, p.placeName].join(" ").toLowerCase().includes(q);
  const matchPlace = (p: MapPlace) =>
    !q || [p.name, p.catLabel, p.summary].join(" ").toLowerCase().includes(q);
  // 교단·지역·시대·역할 필터(각 축은 OR, 축 간에는 AND). 빈 축은 통과.
  const facetMatch = (p: MapPerson) =>
    (!filters.denom.length || filters.denom.includes(denomOf(p.org))) &&
    (!filters.region.length || filters.region.includes(regionOf(p.place))) &&
    (!filters.era.length || erasOf(p.active).some((e) => filters.era.includes(e))) &&
    (!filters.role.length || roleTagsOf(p.role).some((r) => filters.role.includes(r))) &&
    (!filters.country.length || filters.country.includes(p.country));
  // 랜딩(홈 첫 진입·미선택·미검색·미필터): 거점(항구·묘역)이 주인공, 인물은 흐리게.
  const landing = lens === "people" && !selected && q === "" && facetCount === 0;

  const visiblePeople = useMemo(
    () => data.people.filter((p) => yearOK(p) && matchPerson(p) && facetMatch(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.people, year, snapshot, q, filters],
  );
  const visiblePlaces = useMemo(() => data.places.filter(matchPlace), [data.places, q]);

  // cemeteries = places recorded as someone's burial site
  const cemeteries = useMemo(() => {
    const names = new Set(data.people.map((p) => p.burial).filter(Boolean));
    return data.places.filter((pl) => names.has(pl.name));
  }, [data]);
  const buriedAt = (placeName: string) => data.people.filter((p) => p.burial === placeName);

  const selPerson =
    selected?.kind === "person" ? data.people.find((p) => p.id === selected.id) ?? null : null;
  const selPlace =
    selected?.kind === "place" ? data.places.find((p) => p.id === selected.id) ?? null : null;
  const selEvent =
    selected?.kind === "event" ? data.events[Number(selected.id)] ?? null : null;
  const eventHi = useMemo(() => new Set(selEvent ? selEvent.people.map((x) => x.id) : []), [selEvent]);

  // 선택 인물 기준 1차/2차 관계망 (관계망 opacity·집중 모드용)
  const firstDeg = useMemo(() => {
    const s = new Set<string>();
    if (selPerson) for (const e of data.edges) {
      if (e.from === selPerson.id) s.add(e.to);
      else if (e.to === selPerson.id) s.add(e.from);
    }
    return s;
  }, [selPerson, data.edges]);
  const secondDeg = useMemo(() => {
    const s = new Set<string>();
    if (selPerson) for (const e of data.edges) {
      if (firstDeg.has(e.from) && e.to !== selPerson.id && !firstDeg.has(e.to)) s.add(e.to);
      if (firstDeg.has(e.to) && e.from !== selPerson.id && !firstDeg.has(e.from)) s.add(e.from);
    }
    return s;
  }, [selPerson, firstDeg, data.edges]);

  // what the map actually renders, by lens
  const mapPlaces = lens === "cemetery" ? cemeteries : visiblePlaces;
  const mapPeople = useMemo(() => {
    if (lens !== "cemetery") {
      const filtering = q !== "" || facetCount > 0;
      // 대표만 보기: 검색·필터 중이 아니면 대표 인물만. 단 선택 인물과 1·2차 관계망은 맥락상 포함.
      let out = visiblePeople.filter((p) => !featuredOnly || filtering || isFeatured(p.id));
      if (selPerson) {
        const have = new Set(out.map((p) => p.id));
        for (const p of visiblePeople)
          if (!have.has(p.id) && (p.id === selPerson.id || firstDeg.has(p.id) || secondDeg.has(p.id))) out.push(p);
      }
      // 관계망 집중: 선택 인물 + 1·2차만 남김
      if (netFocus && selPerson) out = out.filter((p) => p.id === selPerson.id || firstDeg.has(p.id) || secondDeg.has(p.id));
      return out;
    }
    // 선택한 묘역(장소) 또는 선택한 인물이 안장된 묘역 기준으로 안장자 표시
    const cemName =
      selPlace && cemeteries.some((c) => c.id === selPlace.id)
        ? selPlace.name
        : selPerson?.burial || null;
    const base = cemName ? data.people.filter((p) => p.burial === cemName) : [];
    if (!selPerson) return base;
    // 인물 선택 시 본인과 관계망 인물도 포함해 아이콘·연결선이 보이도록
    const ids = new Set(base.map((p) => p.id));
    const out = [...base];
    if (!ids.has(selPerson.id)) { out.push(selPerson); ids.add(selPerson.id); }
    for (const e of data.edges) {
      const otherId = e.from === selPerson.id ? e.to : e.to === selPerson.id ? e.from : null;
      if (otherId && !ids.has(otherId)) {
        const op = data.people.find((p) => p.id === otherId);
        if (op) { out.push(op); ids.add(otherId); }
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lens, visiblePeople, selPlace, selPerson, cemeteries, data.people, data.edges, featuredOnly, netFocus, q, facetCount, firstDeg, secondDeg]);

  const personPos = useMemo(() => {
    const groups = new Map<string, MapPerson[]>();
    for (const p of mapPeople) {
      if (!groups.has(p.place)) groups.set(p.place, []);
      groups.get(p.place)!.push(p);
    }
    const pos = new Map<string, [number, number]>();
    for (const [, arr] of groups)
      arr.forEach((p, i) => pos.set(p.id, personLatLng([p.lat, p.lng], i, arr.length)));
    return pos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapPeople]);

  // relationships touching the selected person
  const relations = useMemo(() => {
    if (!selPerson) return [];
    return data.edges
      .filter((e) => e.from === selPerson.id || e.to === selPerson.id)
      .map((e) => {
        const outgoing = e.from === selPerson.id;
        const otherId = outgoing ? e.to : e.from;
        const other = data.people.find((p) => p.id === otherId);
        return other ? { ...e, other, outgoing } : null;
      })
      .filter(Boolean) as (typeof data.edges[number] & {
      other: MapPerson;
      outgoing: boolean;
    })[];
  }, [selPerson, data.edges, data.people]);

  const relatedIds = useMemo(() => new Set(relations.map((r) => r.other.id)), [relations]);

  // edges to draw (only between visible people)
  const visIds = useMemo(() => new Set(mapPeople.map((p) => p.id)), [mapPeople]);
  const drawEdges = relations.filter((r) => visIds.has(r.other.id));
  // network lens: every relationship among visible people, drawn faintly
  const networkEdges = useMemo(
    () => (lens === "network" ? data.edges.filter((e) => visIds.has(e.from) && visIds.has(e.to)) : []),
    [lens, data.edges, visIds],
  );

  const coordOf = (id: string): [number, number] | null => {
    const ll = personPos.get(id);
    if (ll) return ll;
    const p = data.people.find((x) => x.id === id);
    return p ? [p.lat, p.lng] : null;
  };

  // camera focus: keep the activity area in frame; far (overseas) links stay
  // as off-screen markers rather than dragging the zoom way out.
  const FAR_TH = 3.4; // ~degrees; 만주·일본 fall outside this from 서울권
  const dist = (a: [number, number], b: [number, number]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

  // connected people (with positions) for the selected person
  const connected = useMemo(() => {
    if (!selPerson) return [];
    const s = coordOf(selPerson.id);
    return relations
      .filter((r) => visIds.has(r.other.id))
      .map((r) => {
        const ll = coordOf(r.other.id);
        return ll && s ? { id: r.other.id, name: r.other.name, place: r.other.placeName, lat: ll[0], lng: ll[1], far: dist(ll, s) >= FAR_TH } : null;
      })
      .filter(Boolean) as { id: string; name: string; place: string; lat: number; lng: number; far: boolean }[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKeyBase()]);
  const farConnected = connected.filter((c) => c.far);

  const focusKey = `${selected?.kind ?? ""}:${selected?.id ?? ""}:${lens}`;
  function focusKeyBase() { return `${selected?.kind ?? ""}:${selected?.id ?? ""}:${lens}`; }
  const focusTargets = useMemo<[number, number][]>(() => {
    const pts: ([number, number] | null)[] = [];
    if (selPerson) {
      const s = coordOf(selPerson.id);
      pts.push(s);
      connected.forEach((c) => { if (!c.far) pts.push([c.lat, c.lng]); });
    } else if (selPlace) {
      pts.push([selPlace.lat, selPlace.lng]);
      const peeps = lens === "cemetery" ? buriedAt(selPlace.name) : data.people.filter((p) => p.place === selPlace.id);
      peeps.forEach((p) => pts.push(coordOf(p.id) ?? [p.lat, p.lng]));
    } else if (selEvent) {
      pts.push([selEvent.lat, selEvent.lng]);
      selEvent.people.forEach((x) => pts.push(coordOf(x.id)));
    }
    return pts.filter((x): x is [number, number] => !!x);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey]);

  const pill = (bg: string, color = "#fff8ec"): React.CSSProperties => ({
    background: bg, color, padding: "4px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 800,
  });

  // 상세 패널 위 리스트바: 대표만(기본) / 전체, 연도순. 선택 칩은 자동 스크롤.
  const peopleList = useMemo(
    () => [...data.people].filter((p) => listAll || isFeatured(p.id)).sort((a, b) => a.year - b.year),
    [data.people, listAll],
  );
  // 검색 중이면 전체에서 검색, 아니면 대표/전체 토글 목록
  const pickList = useMemo(
    () => (q ? [...data.people].filter((p) => matchPerson(p)) : peopleList).slice().sort((a, b) => a.year - b.year),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q, peopleList, data.people],
  );
  const chipRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (pickerOpen) chipRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selected, listAll, pickerOpen]);
  const renderPerson = (p: MapPerson, on: boolean) => (
    <button key={p.id} ref={on ? chipRef : undefined} onClick={() => setSelected({ kind: "person", id: p.id })} title={`${p.name} · ${p.org}`}
      style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", textAlign: "left", padding: "5px 9px 5px 5px", borderRadius: 11, border: `1px solid ${on ? "#9b3d2d" : "transparent"}`, background: on ? "#9b3d2d" : "transparent", color: on ? "#fff8ed" : "#4a3a28", cursor: "pointer" }}>
      {p.photo
        ? <img src={p.photo} alt="" style={{ flex: "0 0 auto", width: 30, height: 30, borderRadius: 99, objectFit: "cover" }} />
        : <span style={{ flex: "0 0 auto", width: 30, height: 30, borderRadius: 99, background: orgTint(p.org), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8ec", fontSize: 14 }}>{p.glyph}</span>}
      <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.25, minWidth: 0 }}>
        <span style={{ fontSize: 13, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
        <span style={{ fontSize: 10.5, fontWeight: 600, opacity: on ? 0.85 : 0.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.org} · {p.year}</span>
      </span>
    </button>
  );

  // 좌측 리스트 칸은 연혁·묘역·관계망에서만 필요(평소엔 지도 넓게)
  const showLeft = lens === "history" || lens === "cemetery" || lens === "network";
  const hdr: React.CSSProperties = { fontSize: 11, fontWeight: 900, letterSpacing: ".1em", color: "#80603b", textTransform: "uppercase", marginBottom: 8 };

  return (
    <div
      className="atlas-warm"
      style={{
        height: "calc(100vh - 4rem)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 14,
        color: C.ink,
        fontFamily: "var(--font-body)",
        background: `radial-gradient(circle at 0 0, rgba(155,61,45,.10), transparent 30rem), linear-gradient(135deg,#f4ead6,#e6d4b4 55%,#f7efd9)`,
      }}
    >
      <style>{`
        .atlas-warm .leaflet-tile-pane{filter:sepia(.26) saturate(.9);}
        .atlas-warm .leaflet-fade-anim .leaflet-tile{will-change:opacity;}
        .atlas-warm .leaflet-zoom-anim .leaflet-zoom-animated{will-change:transform;}
        .atlas-warm .leaflet-container{background:${C.sea};font-family:var(--font-body);}
        .atlas-warm .leaflet-control-attribution{background:rgba(40,26,14,.5)!important;color:rgba(255,248,236,.5)!important;font-size:9px!important;}
        .atlas-warm ::-webkit-scrollbar{width:9px;height:9px;}
        .atlas-warm ::-webkit-scrollbar-thumb{background:rgba(77,56,34,.22);border-radius:99px;}
        .atlas-warm input[type=range]{-webkit-appearance:none;height:9px;border-radius:99px;background:rgba(77,56,34,.2);outline:none;cursor:pointer;}
        .atlas-warm input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#9b3d2d;border:4px solid #fff8ec;cursor:pointer;box-shadow:0 2px 7px rgba(46,28,14,.45);}
        .atlas-warm input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#9b3d2d;border:4px solid #fff8ec;cursor:pointer;}
        .atlas-warm .reltip{background:rgba(40,26,14,.9)!important;color:#fff8ec!important;border:none!important;font-weight:800!important;font-size:10px!important;padding:2px 8px!important;border-radius:99px!important;}
        .atlas-warm .reltip::before{display:none!important;}
        @media(max-width:1100px){.atlas-warm{height:auto!important;}.atlas-grid{grid-template-columns:1fr!important;}.atlas-grid>*{grid-column:auto!important;}}
      `}</style>

      {/* ── FULL-WIDTH BAR: 연도(길게) · 검색 · 설정 ── */}
      <div style={{ flex: "0 0 auto", position: "relative", zIndex: 700, display: "flex", alignItems: "center", gap: 12, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, boxShadow: "0 6px 18px rgba(46,28,14,.1)", backdropFilter: "blur(8px)", padding: "9px 16px" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 14, color: snapshot ? "#9b3d2d" : C.muted, whiteSpace: "nowrap", minWidth: 46, textAlign: "center" }}>{snapshot ? `${year}년` : "전체"}</span>
        <div style={{ flex: 1, position: "relative", padding: "0 11px" }}>
          <input type="range" min={data.yearMin} max={data.yearMax} value={year} onChange={(e) => setYearSnapshot(Number(e.target.value))} style={{ width: "100%", display: "block" }} />
          <div style={{ position: "relative", height: 13 }}>
            {[1885, 1895, 1905, 1915, 1925, 1935, 1948, 1960].filter((y) => y >= data.yearMin && y <= data.yearMax).map((y) => {
              const left = ((y - data.yearMin) / (data.yearMax - data.yearMin)) * 100;
              const on = snapshot && Math.abs(year - y) < 4;
              return <button key={y} onClick={() => setYearSnapshot(y)} title={`${y}년 시점`} style={{ position: "absolute", left: `${left}%`, transform: "translateX(-50%)", border: 0, background: "transparent", padding: 0, cursor: "pointer", fontSize: 10, fontWeight: 800, color: on ? "#9b3d2d" : C.faint }}>{y}</button>;
            })}
          </div>
        </div>
        {snapshot && <button onClick={() => setSnapshot(false)} style={{ border: `1px solid ${C.line}`, borderRadius: 99, padding: "4px 10px", background: "rgba(255,255,255,.7)", color: "#6b5e4b", cursor: "pointer", fontSize: 11, fontWeight: 800, whiteSpace: "nowrap" }}>전체</button>}

        {/* 대표만 / 전체 인물 토글 */}
        <button onClick={() => setFeaturedOnly((v) => !v)} title="지도에 대표 선교사만 / 전체" style={{ flex: "0 0 auto", padding: "7px 11px", borderRadius: 10, border: `1px solid ${C.line}`, background: featuredOnly ? "#2f2419" : "rgba(255,255,255,.6)", color: featuredOnly ? "#fff8ed" : "#5f4d39", cursor: "pointer", fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>{featuredOnly ? "★ 대표만" : "전체"}</button>

        {/* 통합 필터(체크박스): 시대·교단·나라·사역·지역 + 관계망 집중 + 묘역 이동 */}
        <MenuBtn id="filter" label="필터" count={facetCount} openMenu={openMenu} setOpenMenu={setOpenMenu} wide>
          {([
            ["시대", "era", ERAS.map((e) => ({ key: e.key, label: e.label }))],
            ["파송 교단", "denom", DENOM_LIST],
            ["파송 나라", "country", COUNTRIES.map((c) => ({ key: c, label: c }))],
            ["사역 분야", "role", ROLE_LIST],
            ["지역", "region", REGIONS],
          ] as const).map(([title, axis, items]) => {
            const ax = axis as "era" | "denom" | "country" | "role" | "region";
            const allKeys = items.map((it) => it.key);
            const allOn = allKeys.length > 0 && allKeys.every((k) => filters[ax].includes(k));
            return (
            <div key={axis} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "6px 6px 2px" }}>
                <span style={hdr}>{title}</span>
                <button onClick={() => setFacet(ax, allOn ? [] : allKeys)} style={{ border: 0, background: "transparent", color: allOn ? "#9b3d2d" : "#80603b", cursor: "pointer", fontSize: 10.5, fontWeight: 800 }}>{allOn ? "전체 해제" : "전체 선택"}</button>
              </div>
              {items.map((it) => (
                <FacetRow key={it.key} label={it.label} on={filters[axis as "era" | "denom" | "country" | "role" | "region"].includes(it.key)}
                  onClick={() => { toggleFacet(ax, it.key); if (axis === "era") { const e = ERAS.find((x) => x.key === it.key); if (e) { setYear(Math.round((e.from + e.to) / 2)); setSnapshot(true); } } }} />
              ))}
            </div>
          );})}
          {cemeteries.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <div style={{ ...hdr, margin: "6px 6px 2px" }}>선교 묘역 이동</div>
              {cemeteries.map((c) => (
                <FacetRow key={c.id} label={c.name} on={selPlace?.id === c.id} onClick={() => { setSelected({ kind: "place", id: c.id }); setOpenMenu(null); }} />
              ))}
            </div>
          )}
          <div style={{ borderTop: `1px solid ${C.line}`, marginTop: 4, paddingTop: 6, display: "flex", gap: 6 }}>
            <button onClick={() => setNetFocus((v) => !v)} style={{ flex: 1, padding: "8px 6px", borderRadius: 9, border: `1px solid ${netFocus ? "#9b3d2d" : C.line}`, background: netFocus ? "#9b3d2d" : "rgba(255,255,255,.6)", color: netFocus ? "#fff8ed" : "#5f4d39", cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>관계망 집중</button>
            {facetCount > 0 && <button onClick={clearFilters} style={{ flex: "0 0 auto", padding: "8px 10px", borderRadius: 9, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.6)", color: "#9b3d2d", cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>해제</button>}
          </div>
        </MenuBtn>

        {/* 검색 + 인물 목록 드롭다운(검색창 옆) — 열리면 바깥 클릭 전까지 유지 */}
        <div onMouseEnter={() => setPickerOpen(true)} onMouseLeave={() => setPickerOpen(false)} style={{ position: "relative", flex: "0 0 auto", display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ position: "relative", width: 184 }}>
            <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setPickerOpen(true)} placeholder="선교사·소속·장소 검색…" style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 11, padding: "8px 10px 8px 32px", fontSize: 13, background: "#fff8ec", color: C.ink, outline: "none" }} />
          </div>
          <button onClick={() => setPickerOpen((v) => !v)} title="선교사 목록" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px 6px 6px", borderRadius: 10, border: `1px solid ${pickerOpen ? "#9b3d2d" : C.line}`, background: "rgba(255,255,255,.6)", color: "#5f4d39", cursor: "pointer", fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap" }}>
            {selPerson?.photo
              ? <img src={selPerson.photo} alt="" style={{ width: 22, height: 22, borderRadius: 99, objectFit: "cover" }} />
              : <span style={{ width: 22, height: 22, borderRadius: 99, background: selPerson ? orgTint(selPerson.org) : C.line, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8ec", fontSize: 11 }}>{selPerson?.glyph ?? "≡"}</span>}
            {selPerson ? selPerson.name : "선교사 목록"}<span style={{ fontSize: 9, opacity: 0.7 }}>▾</span>
          </button>
          {pickerOpen && (
            // top을 버튼 바로 아래(틈 없이)로 두고, 위쪽 패딩으로 호버 브리지를 만들어 끊김 방지
            <div style={{ position: "absolute", top: "100%", right: 0, paddingTop: 8, width: 290, zIndex: 900 }}>
              <div style={{ background: "rgba(255,250,237,.99)", border: `1px solid ${C.line}`, borderRadius: 13, boxShadow: "0 14px 32px rgba(46,28,14,.24)", padding: 7 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 6px 6px" }}>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".08em", color: "#80603b" }}>{q ? `검색 ${pickList.length}` : `선교사 ${pickList.length}명`}</span>
                  {!q && <button onClick={() => setListAll((v) => !v)} title="대표만 / 전체" style={{ padding: "3px 9px", borderRadius: 99, border: `1px solid ${C.line}`, background: listAll ? "rgba(255,255,255,.7)" : "#2f2419", color: listAll ? "#5f4d39" : "#fff8ed", cursor: "pointer", fontSize: 10.5, fontWeight: 800 }}>{listAll ? "전체" : "★ 대표"}</button>}
                </div>
                <div style={{ maxHeight: 320, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                  {pickList.length === 0 && <span style={{ padding: "10px 8px", color: C.muted, fontSize: 12.5 }}>검색 결과가 없습니다</span>}
                  {pickList.map((p) => renderPerson(p, selPerson?.id === p.id))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ position: "relative", flex: "0 0 auto" }}>
          <button onClick={() => setShowSettings((s) => !s)} title="설정" style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, border: `1px solid ${C.line}`, background: showSettings ? "#2f2419" : "rgba(255,255,255,.6)", color: showSettings ? "#fff8ed" : "#6b5e4b", cursor: "pointer" }}><Settings size={17} /></button>
          {showSettings && (
            <div style={{ position: "absolute", top: 42, right: 0, width: 210, background: "rgba(255,250,237,.99)", border: `1px solid ${C.line}`, borderRadius: 14, boxShadow: "0 10px 28px rgba(46,28,14,.22)", padding: 12, zIndex: 600 }}>
              <div style={{ ...hdr, marginBottom: 8 }}>줌 강도</div>
              <div style={{ display: "flex", gap: 6 }}>
                {([["loose", "느슨"], ["normal", "보통"], ["tight", "타이트"]] as const).map(([k, label]) => {
                  const on = fit === k;
                  return <button key={k} onClick={() => changeFit(k)} style={{ flex: 1, border: `1px solid ${on ? "#9b3d2d" : C.line}`, borderRadius: 10, padding: "7px 4px", background: on ? "#9b3d2d" : "rgba(255,255,255,.6)", color: on ? "#fff8ed" : "#5f4d39", cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>{label}</button>;
                })}
              </div>
              <div style={{ borderTop: `1px solid ${C.line}`, margin: "12px 0 0", paddingTop: 12 }}>
                <a href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 11px", background: "rgba(255,255,255,.6)", color: "#5f4d39", fontSize: 12.5, fontWeight: 800 }}>
                  <span>관리자 페이지</span><span aria-hidden style={{ opacity: 0.55 }}>↗</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── GRID: left · map · right ── */}
      <div className="atlas-grid" style={{ flex: 1, minHeight: 0, minWidth: 0, display: "grid", gridTemplateColumns: `${showLeft && leftOpen ? "minmax(248px,300px)" : "0px"} minmax(0,1fr) ${rightOpen ? "minmax(320px,384px)" : "0px"}`, gap: 14, transition: "grid-template-columns .28s ease" }}>

      {/* ── LEFT: lens-specific list (연혁·묘역·관계망에서만) ── */}
      <aside style={{ gridColumn: 1, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 24, padding: 16, display: showLeft && leftOpen ? "flex" : "none", flexDirection: "column", gap: 14, minHeight: 0, position: "relative", backdropFilter: "blur(12px)", boxShadow: "0 18px 50px rgba(38,25,10,.12)" }}>
        <button onClick={() => setLeftOpen(false)} title="접기" style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.6)", color: "#6b5e4b", cursor: "pointer", zIndex: 5 }}>
          <PanelLeftClose size={16} />
        </button>

        {lens === "history" && (
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 2 }}>
            <div style={hdr}>선교 연혁</div>
            <div style={{ position: "relative", paddingLeft: 14 }}>
              <div style={{ position: "absolute", left: 4, top: 6, bottom: 8, width: 2, background: "linear-gradient(#77624b,#1f6f8b,#bf6b22)", opacity: 0.35 }} />
              {data.events.map((ev, i) => {
                const on = selEvent === ev;
                return (
                  <button key={i} onClick={() => setSelected({ kind: "event", id: String(i) })} style={{ position: "relative", display: "block", width: "100%", textAlign: "left", border: 0, background: on ? "rgba(155,61,45,.08)" : "transparent", borderRadius: 12, padding: "9px 10px 9px 14px", cursor: "pointer" }}>
                    <span style={{ position: "absolute", left: -12, top: 14, width: 10, height: 10, borderRadius: 99, background: on ? "#9b3d2d" : "#bf6b22", boxShadow: "0 0 0 4px rgba(255,251,242,.85)" }} />
                    <span style={{ display: "block", fontFamily: "var(--font-display)", fontSize: 13.5, fontWeight: 900, color: on ? "#9b3d2d" : "#3f3022" }}>{ev.year} · {ev.title}</span>
                    <span style={{ display: "block", marginTop: 2, fontSize: 11.5, color: C.muted }}>{ev.placeName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {lens === "network" && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".1em", color: "#80603b", textTransform: "uppercase", marginBottom: 8 }}>관계 유형</div>
            <ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
              {data.relTypes.map((l) => (
                <li key={l.key} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke={l.color} strokeWidth="3" strokeDasharray={l.dash ?? undefined} /></svg>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: "#5f4d39" }}>{l.label}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {lens === "cemetery" && (
          <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 2 }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".1em", color: "#80603b", textTransform: "uppercase", marginBottom: 8 }}>선교묘역</div>
            <div style={{ display: "grid", gap: 8 }}>
              {cemeteries.map((c) => {
                const on = selPlace?.id === c.id;
                const n = buriedAt(c.name).length;
                return (
                  <button key={c.id} onClick={() => setSelected({ kind: "place", id: c.id })} style={{ border: `1px solid ${on ? "#9b3d2d" : C.line}`, borderRadius: 14, padding: "12px 13px", background: on ? "#2f2419" : "rgba(255,255,255,.55)", color: on ? "#fff8ed" : "#3f3022", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ display: "block", fontSize: 14, fontWeight: 900 }}>🪦 {c.name}</span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 11.5, color: on ? "rgba(255,248,236,.7)" : C.muted }}>안장 인물 {n}명</span>
                  </button>
                );
              })}
              {!cemeteries.length && <p style={{ fontSize: 12.5, color: C.muted }}>기록된 묘역이 없습니다.</p>}
            </div>
          </div>
        )}

      </aside>

      {/* ── CENTER: map ── */}
      <section style={{ gridColumn: 2, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 24, overflow: "hidden", minHeight: 420, position: "relative", boxShadow: "0 18px 50px rgba(38,25,10,.12)" }}>
        <div style={{ position: "absolute", inset: 14, borderRadius: 18, overflow: "hidden", border: `1px solid ${C.line}` }}>
          <MapContainer center={[38.4, 127.5]} zoom={6} minZoom={4} maxZoom={14} zoomControl={false} scrollWheelZoom={false} zoomSnap={0} zoomDelta={0.6} zoomAnimationThreshold={4} style={{ height: "100%", width: "100%" }}>
            <SmoothWheelZoom />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" subdomains="abcd" attribution="&copy; OpenStreetMap &copy; CARTO" />
            <HistoricalOverlay year={year} on={showGeo} />
            <InvalidateOnResize deps={[leftOpen, rightOpen]} />
            <MapControls />
            <FitToSelection targets={focusTargets} focusKey={focusKey} fit={fit} skipFirst />
            <OffscreenIndicators targets={farConnected} origin={selPerson ? coordOf(selPerson.id) : null} onPick={(id) => setSelected({ kind: "person", id })} />

            {networkEdges.map((e, i) => {
              const a = coordOf(e.from);
              const b = coordOf(e.to);
              if (!a || !b) return null;
              const lit = selPerson && (e.from === selPerson.id || e.to === selPerson.id);
              return (
                <Polyline key={"n" + i} positions={[a, b]} pathOptions={{ color: e.color, weight: lit ? 3 : 1.5, opacity: lit ? 0.9 : 0.3, dashArray: e.dash ?? undefined }} />
              );
            })}

            {drawEdges.map((e, i) => {
              const a = coordOf(selPerson!.id);
              const b = coordOf(e.other.id);
              if (!a || !b) return null;
              return (
                <Polyline key={i} positions={[a, b]} pathOptions={{ color: e.color, weight: 3, opacity: 0.9, dashArray: e.dash ?? undefined }}>
                  <Tooltip className="reltip" direction="center">{e.outgoing ? `${selPerson!.name} → ${e.other.name}` : `${e.other.name} → ${selPerson!.name}`} · {e.note}</Tooltip>
                </Polyline>
              );
            })}

            {/* 관계 방향·내용: 부드러운 화살표 + 라벨을 연결선 중앙에 */}
            {drawEdges.map((e, i) => {
              const a = coordOf(selPerson!.id);
              const b = coordOf(e.other.id);
              if (!a || !b) return null;
              const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
              // 방향이 있는 관계(영향·준비·계승)는 from→to로, 그 외엔 본인→상대 기준 라벨만
              const fromLL = e.directional ? (e.outgoing ? a : b) : a;
              const toLL = e.directional ? (e.outgoing ? b : a) : b;
              return (
                <Marker key={"a" + i} position={mid} interactive={false} icon={arrowIcon(bearingDeg(fromLL, toLL), e.color, e.label)} zIndexOffset={1100} />
              );
            })}

            {mapPlaces.map((p) => {
              const sel = (selected?.kind === "place" && selected.id === p.id) || (!!selEvent && selEvent.placeId === p.id);
              const dim = (!!selPerson && selPerson.place !== p.id) || (!!selEvent && selEvent.placeId !== p.id);
              // 장소는 인물보다 항상 아래에 깔리도록 음수 오프셋(선택된 장소만 살짝 위)
              return (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={placeIcon(p, sel, landing ? false : dim)} zIndexOffset={landing ? 200 : sel ? -120 : -600} eventHandlers={{ click: () => setSelected({ kind: "place", id: p.id }) }} />
              );
            })}

            {mapPeople.map((p) => {
              const ll = personPos.get(p.id);
              if (!ll) return null;
              const sel = selected?.kind === "person" && selected.id === p.id;
              const first = relatedIds.has(p.id) || eventHi.has(p.id);
              const second = secondDeg.has(p.id);
              const dimActive = !!selPerson || !!selEvent;
              // 선택 시: 본인·1차 선명 / 2차 흐리게 / 그 외 더 흐리게
              const opacity = landing ? 0.28 : !dimActive || sel || first ? 1 : second ? 0.55 : 0.22;
              return (
                <Marker key={p.id} position={ll} icon={personIcon(p, sel, opacity, first)} zIndexOffset={sel ? 1000 : first ? 300 : second ? 150 : 0} eventHandlers={{ click: () => setSelected({ kind: "person", id: p.id }) }} />
              );
            })}
          </MapContainer>
        </div>

        {/* 시대별 정세(역사 국경) 토글 + 시대 배너 */}
        <div style={{ position: "absolute", left: 24, top: 24, zIndex: 500, display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => setShowGeo((v) => !v)} title="시대별 정세(역사 국경) 표시" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: showGeo ? "#9b3d2d" : "rgba(40,26,14,.78)", color: "#fff8ec", cursor: "pointer", fontSize: 12.5, fontWeight: 800 }}>
            🗺 정세 {showGeo ? "ON" : "OFF"}
          </button>
          {showGeo && (
            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, background: "rgba(40,26,14,.82)", color: "#fff8ec", padding: "6px 11px", borderRadius: 10, fontSize: 12.5, fontWeight: 800 }}>
              <span>{snapshot ? `${year}년` : `${nearestGeoYear(year)}년경`} · {koreaEra(year)}</span>
              <span style={{ fontSize: 9.5, fontWeight: 600, opacity: 0.7 }}>경계: historical-basemaps (ODbL)</span>
            </span>
          )}
        </div>

        <div style={{ position: "absolute", left: 26, bottom: 26, right: 26, display: "flex", justifyContent: "space-between", alignItems: "flex-end", pointerEvents: "none", gap: 12 }}>
          <span style={{ fontSize: 11.5, color: "#fff8ec", background: "rgba(40,26,14,.7)", padding: "5px 10px", borderRadius: 999, fontWeight: 700 }}>
            {lens === "cemetery" ? "묘역을 클릭하면 그곳에 안장된 선교사가 나타납니다" : lens === "network" ? "인물 간 관계가 지도 위에 모두 드러납니다" : lens === "era" ? "연도 슬라이더로 시대의 흐름을 따라가 보세요" : "인물을 클릭하면 연관된 선교사가 함께 밝아집니다"}
          </span>
        </div>

        {showLeft && !leftOpen && (
          <button onClick={() => setLeftOpen(true)} title="목록 펼치기" style={{ position: "absolute", top: 24, left: 24, display: "flex", alignItems: "center", gap: 6, padding: "8px 11px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: "rgba(40,26,14,.78)", color: "#fff8ec", cursor: "pointer", fontSize: 12.5, fontWeight: 800, zIndex: 500 }}>
            <PanelLeftOpen size={16} /> {lens === "history" ? "연혁" : lens === "cemetery" ? "묘역" : "목록"}
          </button>
        )}
        {!rightOpen && (
          <button onClick={() => setRightOpen(true)} title="상세 펼치기" style={{ position: "absolute", top: 24, right: 24, display: "flex", alignItems: "center", gap: 6, padding: "8px 11px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: "rgba(40,26,14,.78)", color: "#fff8ec", cursor: "pointer", fontSize: 12.5, fontWeight: 800, zIndex: 500 }}>
            상세 <PanelRightOpen size={16} />
          </button>
        )}
      </section>

      {/* ── RIGHT: detail + relationships ── */}
      <article style={{ gridColumn: 3, minWidth: 0, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 24, overflow: "hidden", display: rightOpen ? "flex" : "none", flexDirection: "column", minHeight: 0, position: "relative", boxShadow: "0 18px 50px rgba(38,25,10,.12)" }}>
        {history.length > 0 && (selPerson || selPlace || selEvent) && (
          <button onClick={goBack} title="이전 선택으로" style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "8px 44px 8px 14px", borderBottom: `1px solid ${C.line}`, background: "rgba(255,255,255,.6)", color: "#5f4d39", cursor: "pointer", fontSize: 12.5, fontWeight: 800, textAlign: "left", position: "relative", zIndex: 11 }}>
            <ArrowRight size={14} style={{ transform: "rotate(180deg)" }} /> 뒤로
          </button>
        )}
        <button onClick={() => setRightOpen(false)} title="상세 접기" style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 9, border: "1px solid rgba(255,255,255,.25)", background: "rgba(40,26,14,.45)", color: "#fff8ec", cursor: "pointer", zIndex: 10 }}>
          <PanelRightClose size={16} />
        </button>

        {selEvent && (
          <>
            <div style={{ background: "linear-gradient(145deg,#2e2218,#5f3928)", color: "#fff8eb", padding: "22px 22px 20px" }}>
              <span style={pill("rgba(191,107,34,.85)")}>{selEvent.year}년 · 선교 연혁</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 25, margin: "12px 0 4px", letterSpacing: "-.03em" }}>{selEvent.title}</h2>
              <button onClick={() => setSelected({ kind: "place", id: selEvent.placeId })} style={{ ...pill("rgba(255,255,255,.14)"), border: 0, cursor: "pointer", marginTop: 4 }}>⚓ {selEvent.placeName}</button>
            </div>
            <div style={{ padding: "18px 20px 24px", overflowY: "auto" }}>
              <section style={{ padding: 15, background: "#fff9ee", border: `1px solid ${C.line}`, borderRadius: 18, marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: "#594935" }}>{selEvent.desc}</p>
              </section>
              {selEvent.people.length > 0 && (
                <section>
                  <h3 style={{ fontSize: 13.5, fontWeight: 900, margin: "0 0 10px", color: "#3e2c1d" }}>관련 인물</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {selEvent.people.map((x) => {
                      const pp = data.people.find((p) => p.id === x.id);
                      return (
                        <button key={x.id} onClick={() => setSelected({ kind: "person", id: x.id })} style={{ ...pill("rgba(135,93,167,.12)", "#5a3f72"), border: `1px solid ${C.line}`, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          {pp?.photo ? <img src={pp.photo} alt="" style={{ width: 18, height: 18, borderRadius: 99, objectFit: "cover" }} /> : <span>{pp?.glyph ?? "·"}</span>} {x.name}
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
              <p style={{ marginTop: 14, fontSize: 11.5, color: C.faint }}>연혁 목록에서 다른 사건을 선택하면 지도가 그 장소로 이동합니다.</p>
            </div>
          </>
        )}

        {selPlace && (
          <>
            <div style={{ background: "linear-gradient(145deg,#2e2218,#5f3928)", color: "#fff8eb", padding: "22px 22px 20px" }}>
              <span style={pill(`${CAT_COLOR[selPlace.cat]}`)}>{selPlace.catLabel}</span>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 26, margin: "14px 0 4px", letterSpacing: "-.03em" }}>{selPlace.name}</h2>
              <p style={{ margin: 0, fontSize: 13, color: "rgba(255,248,235,.82)", lineHeight: 1.5 }}>{selPlace.year}년 · 지도 위 거점</p>
            </div>
            <div style={{ padding: "18px 20px 24px", overflowY: "auto" }}>
              <section style={{ padding: 15, background: "#fff9ee", border: `1px solid ${C.line}`, borderRadius: 18, marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "#594935" }}>{selPlace.summary}</p>
              </section>
              {selPlace.sub && (
                <section>
                  <h3 style={{ fontSize: 13.5, fontWeight: 900, margin: "0 0 10px", color: "#3e2c1d" }}>이곳의 기관</h3>
                  <ul style={{ display: "grid", gap: 7, margin: 0, padding: 0, listStyle: "none" }}>
                    {selPlace.sub.map((s, i) => (
                      <li key={i} style={{ padding: "10px 12px", borderRadius: 13, background: "rgba(255,255,255,.5)", border: `1px solid ${C.line}` }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: "#3e2c1d" }}>{s.name}</span>
                        <span style={{ display: "block", fontSize: 12, color: C.muted }}>{s.note}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {(() => {
                // 묘역 여부는 lens 가 아니라 '안장 데이터'로 판단 → 헤더 드롭다운으로 와도 안장자 표시
                const buried = buriedAt(selPlace.name);
                const isCem = buried.length > 0;
                const list = isCem ? buried : data.people.filter((p) => p.place === selPlace.id);
                return (
                  <section style={{ marginTop: 14 }}>
                    <h3 style={{ fontSize: 13.5, fontWeight: 900, margin: "0 0 10px", color: "#3e2c1d" }}>
                      {isCem ? `이곳에 안장된 선교사 ${buried.length}명` : "이곳의 인물"}
                    </h3>
                    {list.length === 0 ? (
                      <p style={{ margin: 0, fontSize: 12.5, color: C.muted }}>기록된 인물이 없습니다.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {list.map((p) => (
                          <button key={p.id} onClick={() => setSelected({ kind: "person", id: p.id })}
                            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left", padding: "6px 8px", borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.55)", cursor: "pointer" }}>
                            {p.photo
                              ? <img src={p.photo} alt="" style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: 99, objectFit: "cover" }} />
                              : <span style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: 99, background: orgTint(p.org), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8ec", fontSize: 15 }}>{p.glyph}</span>}
                            <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, minWidth: 0 }}>
                              <span style={{ fontSize: 13.5, fontWeight: 800, color: "#3e2c1d" }}>{p.name}</span>
                              <span style={{ fontSize: 11, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[p.org, p.life].filter(Boolean).join(" · ")}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                );
              })()}
            </div>
          </>
        )}

        {selPerson && (
          <>
            <div style={{ background: "linear-gradient(145deg,#2e2218,#5f3928)", color: "#fff8eb", padding: "22px 22px 20px", position: "relative" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                {selPerson.photo ? (
                  <img src={selPerson.photo} alt={selPerson.name} style={{ width: 60, height: 60, flex: "0 0 auto", borderRadius: 16, objectFit: "cover", background: "#efe1c3", border: "2px solid rgba(255,248,236,.3)" }} />
                ) : (
                  <span style={{ fontFamily: "var(--font-display)", display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, flex: "0 0 auto", borderRadius: 16, background: orgTint(selPerson.org), fontSize: 30 }}>{selPerson.glyph}</span>
                )}
                <div style={{ minWidth: 0 }}>
                  <span style={pill("rgba(255,255,255,.14)")}>{selPerson.year}년 입국·활동</span>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 25, margin: "10px 0 2px", letterSpacing: "-.03em" }}>{selPerson.name}</h2>
                  <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,248,235,.78)" }}>{selPerson.en} · {selPerson.life}</p>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px 20px 24px", overflowY: "auto" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                <span style={pill("rgba(31,111,139,.12)", "#1f6f8b")}>{selPerson.org}</span>
                <span style={pill("rgba(105,76,43,.1)", "#604a33")}>{selPerson.role}</span>
                <span style={pill("rgba(105,76,43,.1)", "#604a33")}>{selPerson.country}</span>
                <button onClick={() => setSelected({ kind: "place", id: selPerson.place })} style={{ ...pill("rgba(155,61,45,.1)", "#9b3d2d"), border: 0, cursor: "pointer" }}>⚓ {selPerson.placeName}</button>
                {selPerson.burial && (
                  <span style={pill("rgba(74,58,40,.12)", "#4a3a28")}>🪦 안장 · {selPerson.burial}</span>
                )}
              </div>

              <section style={{ padding: 15, background: "#fff9ee", border: `1px solid ${C.line}`, borderRadius: 18, marginBottom: 14 }}>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: "#594935" }}>{selPerson.summary}</p>
              </section>

              {selPerson.facts.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 14 }}>
                  {selPerson.facts.map(([label, value], i) => (
                    <div key={i} style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.5)", padding: "8px 10px" }}>
                      <div style={{ fontSize: 10, fontWeight: 800, color: C.faint, textTransform: "uppercase" }}>{label}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: "#3e2c1d", marginTop: 1 }}>{value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* relationships — the interconnection words */}
              {relations.length > 0 && (
                <section style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 900, margin: "0 0 10px", color: "#3e2c1d" }}>연관 관계</h3>
                  <ul style={{ display: "grid", gap: 8, margin: 0, padding: 0, listStyle: "none" }}>
                    {relations.map((r, i) => (
                      <li key={i}>
                        <button onClick={() => setSelected({ kind: "person", id: r.other.id })} style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "10px 12px", borderRadius: 14, background: "#fff9ee", border: `1px solid ${C.line}`, cursor: "pointer", textAlign: "left" }}>
                          <span style={pill(r.color)}>{r.label}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 800, color: "#3e2c1d" }}>
                            {r.outgoing ? <ArrowRight size={13} /> : <ArrowRight size={13} style={{ transform: "rotate(180deg)" }} />}
                            {r.other.name}
                          </span>
                        </button>
                        <p style={{ margin: "4px 0 0", paddingLeft: 4, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{r.note}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {selPerson.timeline.length > 0 && (
                <section style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 900, margin: "0 0 10px", color: "#3e2c1d" }}>연표</h3>
                  <div style={{ position: "relative", paddingLeft: 14 }}>
                    <div style={{ position: "absolute", left: 4, top: 4, bottom: 4, width: 2, background: "rgba(155,61,45,.25)" }} />
                    {selPerson.timeline.map(([yr, text], i) => (
                      <div key={i} style={{ position: "relative", padding: "5px 0 9px 12px" }}>
                        <span style={{ position: "absolute", left: -12, top: 8, width: 8, height: 8, borderRadius: 99, background: "#9b3d2d", boxShadow: "0 0 0 3px rgba(255,251,242,.85)" }} />
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 12.5, color: "#9b3d2d" }}>{yr}</span>
                        <p style={{ margin: "1px 0 0", fontSize: 12.5, color: "#594935", lineHeight: 1.5 }}>{text}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {selPerson.interview && (
                <section style={{ borderLeft: "3px solid #bf6b22", background: "rgba(191,107,34,.08)", padding: "12px 13px", borderRadius: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#a0641f", letterSpacing: ".04em" }}>인터뷰</span>
                  <p style={{ margin: "5px 0 0", fontSize: 13.5, color: "#664221", lineHeight: 1.6, fontWeight: 600 }}>“{selPerson.interview}”</p>
                </section>
              )}

              {(selPerson.video || selPerson.photos.length > 0) && (
                <section style={{ marginBottom: 14 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 900, margin: "0 0 8px", color: "#3e2c1d" }}>자료</h3>
                  <div style={{ display: "grid", gap: 6, fontSize: 12.5 }}>
                    {selPerson.video && (
                      <div style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.5)", padding: "9px 11px" }}>
                        <span style={{ fontWeight: 800, color: "#684a80" }}>영상 </span><span style={{ color: "#594935" }}>{selPerson.video}</span>
                      </div>
                    )}
                    {selPerson.photos.map((ph, i) => (
                      <div key={i} style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.5)", padding: "9px 11px" }}>
                        <span style={{ fontWeight: 800, color: "#1f6f8b" }}>사진 </span><span style={{ color: "#594935" }}>{ph}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section style={{ marginBottom: 14 }}>
                <h3 style={{ fontSize: 13.5, fontWeight: 900, margin: "0 0 8px", color: "#3e2c1d" }}>참고 출처</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: selPerson.sources.length > 0 ? 8 : 0 }}>
                  {/* 검증된 링크만 표기 (잘못 매칭되는 자동 링크는 데이터에서 빈값 처리) */}
                  {selPerson.wiki && (
                    <a href={selPerson.wiki} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 11px", borderRadius: 99, border: `1px solid ${C.line}`, background: "#fff8ec", color: "#84321f", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>위키백과 ↗</a>
                  )}
                  {selPerson.wikiEn && (
                    <a href={selPerson.wikiEn} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 11px", borderRadius: 99, border: `1px solid ${C.line}`, background: "#fff8ec", color: "#5f4d39", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>Wikipedia ↗</a>
                  )}
                  {selPerson.namu && (
                    <a href={selPerson.namu} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 11px", borderRadius: 99, border: `1px solid ${C.line}`, background: "#fff8ec", color: "#3a7d44", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>나무위키 ↗</a>
                  )}
                  {!selPerson.wiki && !selPerson.wikiEn && !selPerson.namu && (
                    <span style={{ fontSize: 11.5, color: C.muted }}>검증된 외부 링크 없음</span>
                  )}
                </div>
                {selPerson.sources.length > 0 && (
                  <ul style={{ display: "grid", gap: 6, margin: 0, padding: 0, listStyle: "none" }}>
                    {selPerson.sources.map((s, i) => (
                      <li key={i} style={{ borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.5)", padding: "8px 11px" }}>
                        <span style={{ fontSize: 12.5, fontWeight: 800, color: "#3e2c1d" }}>{s.t}</span>
                        <span style={{ display: "block", fontSize: 11.5, color: C.muted }}>{s.a}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
                <Link href={`/people/${selPerson.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 999, background: "#2f2419", color: "#fff8ed", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>
                  상세 프로필 <ArrowRight size={14} />
                </Link>
              </div>
              {selPerson.photo && (
                <p style={{ margin: "10px 0 0", fontSize: 10.5, color: C.faint }}>사진 출처: {selPerson.photoSource} (CC/PD)</p>
              )}
            </div>
          </>
        )}

        {!selPerson && !selPlace && !selEvent && (
          <div style={{ padding: "24px 22px 28px", overflowY: "auto", height: "100%" }}>
            <span style={pill("rgba(191,107,34,.9)")}>조선 선교의 흐름</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: 23, margin: "12px 0 8px", letterSpacing: "-.03em", color: "#3e2c1d" }}>복음이 들어온 길</h2>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.75, color: "#5f4d39" }}>
              1882년 만주·일본에서 옮겨진 성경이 먼저 이 땅에 닿았고, 1884–85년 <b>제물포</b>를 통해 의료·교육 선교사들이 들어왔습니다. 서울·평양·호남·대구로 퍼져 간 선교의 거점과, 이 땅에 묻힌 이들의 <b>묘역</b>을 따라가 보세요.
            </p>

            <h3 style={{ ...hdr, margin: "20px 0 8px" }}>입국·거점 항구</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.places.filter((p) => p.cat === "port").map((p) => (
                <button key={p.id} onClick={() => setSelected({ kind: "place", id: p.id })} style={{ ...pill("#0d3b66"), border: 0, cursor: "pointer" }}>⚓ {p.name}</button>
              ))}
            </div>

            {cemeteries.length > 0 && (<>
              <h3 style={{ ...hdr, margin: "20px 0 8px" }}>선교 묘역</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {cemeteries.map((c) => (
                  <button key={c.id} onClick={() => setSelected({ kind: "place", id: c.id })} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px", background: "rgba(255,255,255,.55)", cursor: "pointer", color: "#3e2c1d", fontSize: 12.5, fontWeight: 800 }}>
                    <span>♰ {c.name}</span><span style={{ color: C.muted, fontWeight: 600 }}>{buriedAt(c.name).length}명</span>
                  </button>
                ))}
              </div>
            </>)}

            <h3 style={{ ...hdr, margin: "20px 0 8px" }}>시대의 흐름</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {ERAS.map((e) => (
                <button key={e.key} onClick={() => setYearSnapshot(Math.round((e.from + e.to) / 2))} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px", background: "rgba(255,255,255,.55)", cursor: "pointer", color: "#3e2c1d", fontSize: 12.5, fontWeight: 800 }}>
                  <span>{e.label}</span><span style={{ color: "#9b3d2d" }}>→</span>
                </button>
              ))}
            </div>

            <p style={{ margin: "20px 0 0", fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>위 검색창·「필터」로 인물을 찾거나, 지도에서 거점을 눌러 흐름을 따라가세요. 상단 메뉴(교단·나라·사역·지역)에서 인물을 바로 고를 수도 있습니다.</p>
          </div>
        )}
      </article>
      </div>
    </div>
  );
}
