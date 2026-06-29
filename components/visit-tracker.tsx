"use client";

import { useEffect } from "react";

// 하루에 한 번(브라우저당)만 방문을 기록 — /api/track 으로 일일 카운트 증가.
export function VisitTracker() {
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const k = `visit-${today}`;
      if (localStorage.getItem(k)) return;
      localStorage.setItem(k, "1");
      fetch("/api/track", { method: "POST", keepalive: true }).catch(() => {});
    } catch {}
  }, []);
  return null;
}
