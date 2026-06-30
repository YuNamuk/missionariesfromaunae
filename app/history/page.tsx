import type { Metadata } from "next";
import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLocale();
  return { title: l === "mn" ? "Номлолын он дараалал" : l === "en" ? "Mission Timeline" : "선교 연혁" };
}

export default async function HistoryPage() {
  return <AtlasLoader data={await buildAtlasData(await getLocale())} lens="history" />;
}
