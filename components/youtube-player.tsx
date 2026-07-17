"use client";

import { useEffect, useRef } from "react";

// YouTube IFrame Player API로 영상을 임베드하고, 현재 언어(lang)의 자막을 강제로 켠다.
// 정식 자막이 없고 '자동 번역'만 있는 영상은 URL 파라미터(cc_lang_pref)로는 강제되지 않으므로,
// 자막 모듈 로드 후 setOption(...,'translationLanguage',...)로 번역 언어를 직접 지정한다. [[research-column-pipeline]]

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

  useEffect(() => {
    let player: any;
    let cancelled = false;

    // 자막 모듈에 현재 언어를 지정.
    //  · 그 언어의 '정식 자막 트랙'이 있으면(예: 언더우드 ko/en/mn) 그 트랙을 선택.
    //  · 없으면(자동 자막만 있는 영상) 원본 트랙을 그 언어로 '자동 번역'해서 표시.
    const applyCaptions = (p: any) => {
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
    };

    // 여러 시점에 자막을 재적용(트랙 목록이 늦게 로드되거나, 전체화면 전환 시 초기화되는 경우 대비).
    const reapply = (delays: number[]) => delays.forEach((d) => setTimeout(() => { if (!cancelled && player) applyCaptions(player); }, d));
    // 모바일 전체화면 진입/이탈 시 유튜브가 자막 모듈을 리셋 → 전환 후 다시 켠다.
    const onFs = () => reapply([300, 900, 1800]);

    loadApi().then(() => {
      if (cancelled || !holder.current) return;
      const el = document.createElement("div");
      holder.current.appendChild(el);
      player = new window.YT.Player(el, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: { rel: 0, cc_load_policy: 1, cc_lang_pref: lang, hl: lang, modestbranding: 1 },
        events: {
          onReady: (e: any) => { applyCaptions(e.target); reapply([600, 1500]); },
          // 자막 모듈은 재생 직전/직후·전체화면 전환 시 로드되므로 그 시점에 다시 강제.
          onApiChange: (e: any) => applyCaptions(e.target),
          onStateChange: (e: any) => { if (e.data === 1) applyCaptions(e.target); }, // playing
        },
      });
      document.addEventListener("fullscreenchange", onFs);
      document.addEventListener("webkitfullscreenchange", onFs as EventListener);
    });

    return () => {
      cancelled = true;
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs as EventListener);
      try { player?.destroy?.(); } catch { /* noop */ }
    };
  }, [videoId, lang]);

  return <div ref={holder} title={title} className="absolute inset-0 h-full w-full" />;
}
