import type { Metadata } from "next";
import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLocale();
  return { title: l === "mn" ? "Оршуулгын газар" : l === "en" ? "Mission Cemeteries" : "선교묘역" };
}

export default async function CemeteryPage() {
  return <AtlasLoader data={await buildAtlasData(await getLocale())} lens="cemetery" />;
}
