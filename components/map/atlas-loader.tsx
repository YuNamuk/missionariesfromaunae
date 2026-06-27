"use client";

import dynamic from "next/dynamic";
import type { AtlasData } from "./types";
import type { Lens } from "./atlas";

// Leaflet touches `window`, so the map must never render on the server.
// 로딩 중에는 실제 지도 레이아웃(상단 컨트롤바 + 우측 패널)을 닮은 스켈레톤을 보여
// 체감 성능을 높인다. 하이드레이션 후 Atlas로 대체된다.
const Atlas = dynamic(() => import("./atlas").then((m) => m.Atlas), {
  ssr: false,
  loading: () => (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden" style={{ background: "#ede4d2" }}>
      <div className="absolute inset-0" style={{ background: "radial-gradient(120% 90% at 30% 20%, #f6efe1 0%, #e7dcc6 60%, #ddd0b6 100%)" }} />
      {/* 상단 컨트롤 바 자리 */}
      <div className="absolute left-0 right-0 top-0 flex items-center gap-2 px-4 py-3">
        <div className="h-9 w-40 animate-pulse rounded-xl" style={{ background: "rgba(47,36,25,.12)" }} />
        <div className="ml-auto h-9 w-44 animate-pulse rounded-xl" style={{ background: "rgba(47,36,25,.12)" }} />
        <div className="h-9 w-9 animate-pulse rounded-xl" style={{ background: "rgba(47,36,25,.12)" }} />
      </div>
      {/* 우측 정보 패널 자리 */}
      <div className="absolute bottom-6 right-6 top-20 hidden w-72 animate-pulse rounded-2xl sm:block" style={{ background: "rgba(255,250,237,.6)", border: "1px solid rgba(47,36,25,.1)" }} />
      {/* 중앙 핀 + 안내 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <div className="h-7 w-7 animate-bounce rounded-full" style={{ background: "#9b3d2d", boxShadow: "0 6px 16px rgba(155,61,45,.35)" }} />
        <span className="text-[13px] font-bold" style={{ color: "#9b3d2d" }}>지도를 준비하는 중…</span>
      </div>
    </div>
  ),
});

export function AtlasLoader({ data, lens }: { data: AtlasData; lens?: Lens }) {
  return <Atlas data={data} lens={lens} />;
}
