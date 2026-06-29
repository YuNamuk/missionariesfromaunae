"use client";

import { useEffect, useState } from "react";

// 상세 페이지 상단의 '접근 탭' — 스크롤은 그대로 두고, 탭을 누르면 해당 섹션으로 부드럽게 이동.
// 페이지에 실제로 존재하는 섹션(id)만 탭으로 노출하고, 스크롤 위치에 따라 현재 탭을 강조한다.
const ALL = [
  { id: "story", label: "이야기" },
  { id: "timeline", label: "연표" },
  { id: "relations", label: "관계" },
  { id: "videos", label: "영상" },
  { id: "gallery", label: "원본 사진" },
  { id: "sources", label: "출처" },
];

export function SectionTabs() {
  const [tabs, setTabs] = useState<{ id: string; label: string }[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const present = ALL.filter((t) => document.getElementById(t.id));
    setTabs(present);
    if (present.length < 2) return;
    setActive(present[0].id);
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-22% 0px -68% 0px", threshold: 0 },
    );
    present.forEach((t) => { const el = document.getElementById(t.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  if (tabs.length < 2) return null;

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 116; // 헤더(64)+탭바 여유
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <nav
      className="sticky top-16 z-30 -mx-5 mb-2 mt-6 flex gap-1.5 overflow-x-auto border-b border-ink-200 px-5 py-2.5 sm:-mx-7 sm:px-7"
      style={{ background: "rgba(247,239,225,.92)", backdropFilter: "blur(8px)" }}
      aria-label="섹션 바로가기"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => go(t.id)}
          className="flex-none rounded-full px-3.5 py-1.5 text-[12.5px] font-bold transition-colors"
          style={active === t.id ? { background: "#2f2419", color: "#fff8ed" } : { background: "transparent", color: "var(--ink-500)" }}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
