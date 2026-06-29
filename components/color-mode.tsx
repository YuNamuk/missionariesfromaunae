"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { COLORIZED, colorSrc } from "@/lib/data/colorized";

// 사이트 전역 '컬러 복원본 보기' 선호 — localStorage에 저장하고, 한 번 켜면
// 지도·흐름·상세 등 모든 초상이 함께 컬러로 바뀐다(설정·카드 어디서 켜든 동기화).
const KEY = "portrait-color";
type Ctx = { color: boolean; setColor: (v: boolean) => void; toggle: () => void };
const ColorCtx = createContext<Ctx>({ color: false, setColor: () => {}, toggle: () => {} });

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [color, setColorState] = useState(false);
  useEffect(() => {
    try { setColorState(window.localStorage.getItem(KEY) === "1"); } catch {}
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setColorState(e.newValue === "1"); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const persist = (v: boolean) => { try { window.localStorage.setItem(KEY, v ? "1" : "0"); } catch {} };
  const setColor = useCallback((v: boolean) => { setColorState(v); persist(v); }, []);
  const toggle = useCallback(() => setColorState((p) => { persist(!p); return !p; }), []);
  return <ColorCtx.Provider value={{ color, setColor, toggle }}>{children}</ColorCtx.Provider>;
}

export const useColorMode = () => useContext(ColorCtx);

/** 컬러본이 존재하는 인물(id 또는 원본 경로 기준)인지. */
export function hasColorFor(idOrSrc?: string | null): boolean {
  if (!idOrSrc) return false;
  if (COLORIZED.has(idOrSrc)) return true;
  return !!colorSrc(idOrSrc);
}

/** 전역 컬러 모드에 반응하는 초상 이미지. 컬러본이 있으면 토글에 따라 원본↔컬러 전환.
 *  badge=true면 컬러일 때 'AI 복원' 표기, toggle=true면 우상단에 컬러/원본 버튼을 띄운다. */
export function Portrait({
  id, src, alt, className, style, rounded = 12, toggle = false, badge = false,
}: {
  id?: string; src: string; alt: string; className?: string; style?: React.CSSProperties;
  rounded?: number; toggle?: boolean; badge?: boolean;
}) {
  const { color, toggle: flip } = useColorMode();
  const cSrc = colorSrc(src) ?? (id && COLORIZED.has(id) ? `/portraits/${id}-color.jpg` : null);
  const showColor = color && !!cSrc;
  return (
    <span style={{ position: "relative", display: "inline-block", lineHeight: 0, flex: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={showColor ? (cSrc as string) : src} alt={alt} className={className} style={style} />
      {badge && showColor && (
        <span style={{ position: "absolute", left: 4, bottom: 4, padding: "1px 6px", borderRadius: 99, background: "rgba(40,26,14,.78)", color: "#ffe7c2", fontSize: 8.5, fontWeight: 800, letterSpacing: ".02em", pointerEvents: "none" }}>AI 복원</span>
      )}
      {toggle && cSrc && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); flip(); }}
          title={showColor ? "원본(흑백)으로" : "AI 복원·컬러로"}
          style={{ position: "absolute", right: 4, top: 4, display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 99, border: "1px solid rgba(255,248,236,.55)", background: showColor ? "#9b3d2d" : "rgba(40,26,14,.72)", color: "#fff8ec", fontSize: 9.5, fontWeight: 800, cursor: "pointer", boxShadow: "0 2px 6px rgba(46,28,14,.4)" }}
        >
          {showColor ? "원본" : "🎨 컬러"}
        </button>
      )}
    </span>
  );
}

/** 설정 등에서 쓰는 전역 컬러 토글 버튼(가로 폭 100%). */
export function ColorToggle({ style }: { style?: React.CSSProperties }) {
  const { color, toggle } = useColorMode();
  return (
    <button onClick={toggle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid rgba(77,56,34,.18)", borderRadius: 10, padding: "9px 11px", background: color ? "#9b3d2d" : "rgba(255,255,255,.6)", color: color ? "#fff8ed" : "#5f4d39", fontSize: 12.5, fontWeight: 800, cursor: "pointer", ...style }}>
      <span>🎨 초상 컬러 복원</span><span>{color ? "● 켜짐" : "○ 꺼짐"}</span>
    </button>
  );
}
