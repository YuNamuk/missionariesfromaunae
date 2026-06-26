import type { Metadata } from "next";
import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "선교묘역 · 조선 선교사 자료실" };

export default async function CemeteryPage() {
  return <AtlasLoader data={await buildAtlasData()} lens="cemetery" />;
}
