"use client";

import dynamic from "next/dynamic";
import type { AtlasData } from "./types";
import type { Lens } from "./atlas";

// Leaflet touches `window`, so the map must never render on the server.
const Atlas = dynamic(() => import("./atlas").then((m) => m.Atlas), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center" style={{ background: "#f6efe1", color: "#9b3d2d" }}>
      지도를 불러오는 중…
    </div>
  ),
});

export function AtlasLoader({ data, lens }: { data: AtlasData; lens?: Lens }) {
  return <Atlas data={data} lens={lens} />;
}
