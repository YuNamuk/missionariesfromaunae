"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// YouTube IFrame Player API 임베드 + 현재 언어(lang) 자막 강제.
//  · 정식 자막 트랙이 있으면 그 언어를, 없으면 원본을 그 언어로 자동 번역해 표시.
//  · 모바일 전체화면 문제: 유튜브 기본 전체화면(fs)은 네이티브 플레이어로 넘어가 JS 자막 제어가
//    끊긴다 → fs 버튼을 끄고(fs:0), 자체 '확대' 버튼으로 API 플레이어를 유지한 채 화면을 채워
//    자막이 유지되게 한다(Android는 컨테이너 requestFullscreen, iOS 등은 CSS 풀필로 폴백).
// [[research-column-pipeline]]

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void }
}

let apiPromise: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return apiPromise;
}

export function YouTubePlayer({ videoId, lang, title }: { videoId: string; lang: string; title?: string }) {
  const holder = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [cssFs, setCssFs] = useState(false);

  const applyCaptions = useCallback((p: any) => {
    try {
      const mods: string[] = (p.getOptions && p.getOptions()) || [];
      const mod = mods.indexOf("captions") >= 0 ? "captions" : mods.indexOf("cc") >= 0 ? "cc" : "captions";
      const list: any[] = (p.getOption && p.getOption(mod, "tracklist")) || [];
      const real = list.find((t) => String(t?.languageCode || "").toLowerCase().startsWith(lang));
      if (real) {
        p.setOption(mod, "track", real);
      } else {
        p.setOption(mod, "track", list[0] || { languageCode: "en" });
        p.setOption(mod, "translationLanguage", { languageCode: lang });
      }
      p.setOption(mod, "reload", true);
    } catch { /* 자막 없음 등 — 무시 */ }
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    const reapply = (delays: number[]) => delays.forEach((d) => setTimeout(() => { if (!cancelled && playerRef.current) applyCaptions(playerRef.current); }, d));
    const onFs = () => { if (!document.fullscreenElement) setCssFs(false); reapply([300, 900, 1800]); };

    loadApi().then(() => {
      if (cancelled || !holder.current) return;
      const el = document.createElement("div");
      holder.current.appendChild(el);
      playerRef.current = new window.YT.Player(el, {
        width: "100%",
        height: "100%",
        videoId,
        // fs:0 → 유튜브 기본 전체화면 버튼 제거(네이티브 플레이어 전환 방지).
        playerVars: { rel: 0, cc_load_policy: 1, cc_lang_pref: lang, hl: lang, modestbranding: 1, fs: 0, playsinline: 1 },
        events: {
          onReady: (e: any) => { applyCaptions(e.target); reapply([600, 1500]); },
          onApiChange: (e: any) => applyCaptions(e.target),
          onStateChange: (e: any) => { if (e.data === 1) applyCaptions(e.target); },
        },
      });
      document.addEventListener("fullscreenchange", onFs);
      document.addEventListener("webkitfullscreenchange", onFs as EventListener);
    });

    return () => {
      cancelled = true;
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs as EventListener);
      try { playerRef.current?.destroy?.(); } catch { /* noop */ }
      playerRef.current = null;
    };
  }, [videoId, lang, applyCaptions]);

  const toggleExpand = useCallback(() => {
    const w = wrap.current;
    const doc = document as any;
    if (doc.fullscreenElement || doc.webkitFullscreenElement) { (doc.exitFullscreen || doc.webkitExitFullscreen)?.call(doc); return; }
    if (cssFs) { setCssFs(false); return; }
    // Android/데스크톱: 컨테이너를 실제 전체화면으로(그 안의 API 플레이어 유지 → 자막 유지).
    const req = w && ((w as any).requestFullscreen || (w as any).webkitRequestFullscreen);
    if (req) { try { req.call(w); } catch { setCssFs(true); } }
    else setCssFs(true); // iOS 등 미지원 → CSS 풀필
    setTimeout(() => playerRef.current && applyCaptions(playerRef.current), 600);
  }, [cssFs, applyCaptions]);

  const wrapStyle: React.CSSProperties = cssFs
    ? { position: "fixed", inset: 0, zIndex: 9999, background: "#000" }
    : { position: "absolute", inset: 0 };

  return (
    <div ref={wrap} style={wrapStyle} className="h-full w-full">
      <div ref={holder} className="absolute inset-0 h-full w-full" title={title} />
      <button
        onClick={toggleExpand}
        aria-label={cssFs ? "확대 닫기" : "확대"}
        style={{ position: "absolute", right: 10, top: 10, zIndex: 10, width: 34, height: 34, borderRadius: 8, border: "none", background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(2px)" }}
      >
        {cssFs ? "✕" : "⛶"}
      </button>
    </div>
  );
}
