// atlas.tsx에서 분리한 순수 헬퍼 — 색상 팔레트·org 색조·Leaflet divIcon 빌더·기하 계산.
// 상태/훅 없이 L·타입·서로에게만 의존하므로 동작이 동일하다(behavior-preserving 추출).
import L from "leaflet";
import type { MapPerson, MapPlace } from "./types";

/* ── warm archival palette (scoped to the immersive map view) ── */
export const C = {
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
export const CAT_COLOR: Record<string, string> = {
  port: "#1f6f8b",
  origin: "#bf6b22",
  site: "#9b3d2d",
  person: "#875da7",
};

// person marker tint by org
export function orgTint(org: string) {
  if (org.includes("북장로회")) return "#1f6f8b";
  if (org.includes("북감리회")) return "#875da7";
  if (org.includes("권서") || org.includes("조선") || org.includes("개종")) return "#bf6b22";
  return "#3f7f4b";
}

export function personLatLng(base: [number, number], i: number, n: number): [number, number] {
  if (n <= 1) return [base[0] + 0.02, base[1] + 0.025];
  // 거점 주변에 너무 넓게 퍼지지 않도록 반경을 좁혀 정돈(인원 많으면 약간만 확장).
  const a = (i / n) * Math.PI * 2 - Math.PI / 2;
  const r = 0.04 + Math.min(n, 8) * 0.004;
  return [base[0] + r * Math.sin(a), base[1] + r * Math.cos(a)];
}

export function labelHtml(text: string, top: number, dark: boolean) {
  const bg = dark ? "rgba(50,35,21,.86)" : "rgba(255,250,237,.92)";
  const color = dark ? "#fff8ed" : "#3f2f21";
  const border = dark ? "none" : "1px solid rgba(73,48,22,.18)";
  return `<div style="position:absolute;top:${top}px;left:50%;transform:translateX(-50%);white-space:nowrap;background:${bg};color:${color};border:${border};border-radius:99px;padding:2px 7px;font-size:10.5px;font-weight:800;letter-spacing:-.01em;box-shadow:0 2px 6px rgba(46,28,14,.2);pointer-events:none;">${text}</div>`;
}

export function placeIcon(p: MapPlace, sel: boolean, dim: boolean) {
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

export function personIcon(p: MapPerson, sel: boolean, opacity: number, related: boolean) {
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
export function arrowIcon(angleDeg: number, color: string, label: string) {
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

/** 묶음(클러스터) 지점 마커 — 낮은 줌·미선택 상태에서 한 활동지 일대에 몰린 인물을
 *  '클릭해 펼치는 지점'으로 보여준다. 숫자(통계 오해 소지)는 두지 않고, 활동지 이름만
 *  라벨로 둔다. 클릭하면 그 일대로 확대되어 개별 마커로 펼쳐진다. */
export function clusterIcon(label: string, color: string) {
  const size = 34;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="position:relative;width:${size}px;height:${size}px;cursor:pointer;">
      <div style="display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:3px solid #fff8ec;box-shadow:0 5px 14px rgba(46,28,14,.4);">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff8ec" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8.5v7M8.5 12h7"/></svg>
      </div>
      ${labelHtml(label, size + 3, true)}
    </div>`,
  });
}

/** Screen bearing (deg, CSS clockwise, 0 = →) from latlng a to b. */
export function bearingDeg(a: [number, number], b: [number, number]) {
  return (Math.atan2(-(b[0] - a[0]), b[1] - a[1]) * 180) / Math.PI;
}

// 두 좌표 사이 거리(km) — 유적 상세의 '인근 거점·묘역' 연결용.
export function distKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371, toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(bLat - aLat), dLng = toR(bLng - aLng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toR(aLat)) * Math.cos(toR(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
