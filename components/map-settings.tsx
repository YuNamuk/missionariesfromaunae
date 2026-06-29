"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ColorToggle } from "@/components/color-mode";

// 지도 표시 설정(줌 강도·마커 크기·이름표)을 전역으로 끌어올려, 상단 헤더의 ⚙ 버튼에서
// 조작하고 지도(atlas)는 이를 구독한다. 값은 localStorage에 보존.
type MapSettings = {
  fit: string; setFit: (v: string) => void;
  markerScale: number; setMarkerScale: (v: number) => void;
  showLabels: boolean; setShowLabels: (v: boolean) => void;
};
const Ctx = createContext<MapSettings>({
  fit: "tight", setFit: () => {},
  markerScale: 1, setMarkerScale: () => {},
  showLabels: true, setShowLabels: () => {},
});

export function MapSettingsProvider({ children }: { children: React.ReactNode }) {
  const [fit, setFitState] = useState("tight");
  const [markerScale, setMarkerScaleState] = useState(1);
  const [showLabels, setShowLabelsState] = useState(true);
  useEffect(() => {
    try {
      const f = localStorage.getItem("atlas-fit"); if (f) setFitState(f);
      const s = localStorage.getItem("atlas-scale"); if (s) setMarkerScaleState(Number(s));
      const l = localStorage.getItem("atlas-labels"); if (l != null) setShowLabelsState(l === "1");
    } catch {}
  }, []);
  const setFit = useCallback((v: string) => { setFitState(v); try { localStorage.setItem("atlas-fit", v); } catch {} }, []);
  const setMarkerScale = useCallback((v: number) => { setMarkerScaleState(v); try { localStorage.setItem("atlas-scale", String(v)); } catch {} }, []);
  const setShowLabels = useCallback((v: boolean) => { setShowLabelsState(v); try { localStorage.setItem("atlas-labels", v ? "1" : "0"); } catch {} }, []);
  return <Ctx.Provider value={{ fit, setFit, markerScale, setMarkerScale, showLabels, setShowLabels }}>{children}</Ctx.Provider>;
}

export const useMapSettings = () => useContext(Ctx);

/** 헤더 우측 ⚙ — 지도 표시 설정 드롭다운. 지도 페이지에서만 노출한다. */
export function MapSettingsButton() {
  const { fit, setFit, markerScale, setMarkerScale, showLabels, setShowLabels } = useMapSettings();
  const pathname = usePathname();
  const onMap = pathname === "/"; // 지도 페이지에서만 줌·마커·뷰초기화 등 지도 전용 항목 노출
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const line = "rgba(77,56,34,.18)";
  const seg = (label: string, on: boolean, onClick: () => void) => (
    <button key={label} onClick={onClick} style={{ flex: 1, border: `1px solid ${on ? "#9b3d2d" : line}`, borderRadius: 10, padding: "7px 4px", background: on ? "#9b3d2d" : "rgba(255,255,255,.6)", color: on ? "#fff8ed" : "#5f4d39", cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>{label}</button>
  );
  const hdr: React.CSSProperties = { fontSize: 11, fontWeight: 900, letterSpacing: ".1em", color: "#80603b", textTransform: "uppercase", marginBottom: 8 };

  return (
    <div ref={ref} className="relative flex-none">
      <button onClick={() => setOpen((v) => !v)} title="지도 설정" aria-label="지도 설정"
        className={open ? "bg-white/15 text-white" : "text-white/55 hover:bg-white/8 hover:text-white"}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 999, cursor: "pointer", border: "none" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
      </button>
      {open && (
        <div style={{ position: "absolute", top: 42, right: 0, width: 214, background: "rgba(255,250,237,.99)", border: `1px solid ${line}`, borderRadius: 14, boxShadow: "0 14px 32px rgba(46,28,14,.28)", padding: 12, zIndex: 1100 }}>
          {onMap && (
            <>
              <div style={{ ...hdr, marginBottom: 8 }}>줌 강도</div>
              <div style={{ display: "flex", gap: 6 }}>
                {([["loose", "느슨"], ["normal", "보통"], ["tight", "타이트"]] as const).map(([k, label]) => seg(label, fit === k, () => setFit(k)))}
              </div>
              <div style={{ ...hdr, margin: "12px 0 8px" }}>마커 크기</div>
              <div style={{ display: "flex", gap: 6 }}>
                {([["작게", 0.85], ["보통", 1], ["크게", 1.2]] as const).map(([label, s]) => seg(label, markerScale === s, () => setMarkerScale(s)))}
              </div>
              <button onClick={() => setShowLabels(!showLabels)} style={{ marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${line}`, borderRadius: 10, padding: "9px 11px", background: showLabels ? "#2f2419" : "rgba(255,255,255,.6)", color: showLabels ? "#fff8ed" : "#5f4d39", cursor: "pointer", fontSize: 12.5, fontWeight: 800 }}>
                <span>마커 이름표</span><span>{showLabels ? "● 표시" : "○ 숨김"}</span>
              </button>
            </>
          )}
          <div style={{ marginTop: onMap ? 8 : 0 }}>
            <div style={{ ...hdr, marginBottom: 8 }}>초상</div>
            <ColorToggle />
          </div>
          <div style={{ borderTop: `1px solid ${line}`, margin: "12px 0 0", paddingTop: 12, display: "grid", gap: 8 }}>
            {onMap && (
              <button onClick={() => { window.dispatchEvent(new Event("atlas:reset")); setOpen(false); }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${line}`, borderRadius: 10, padding: "9px 11px", background: "rgba(255,255,255,.6)", color: "#5f4d39", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}>
                <span>뷰 초기화</span><span aria-hidden style={{ opacity: 0.55 }}>⤾</span>
              </button>
            )}
            <a href="/admin" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textDecoration: "none", border: `1px solid ${line}`, borderRadius: 10, padding: "9px 11px", background: "rgba(255,255,255,.6)", color: "#5f4d39", fontSize: 12.5, fontWeight: 800 }}>
              <span>관리자 페이지</span><span aria-hidden style={{ opacity: 0.55 }}>↗</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
