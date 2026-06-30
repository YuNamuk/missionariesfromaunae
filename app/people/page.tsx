import type { Metadata } from "next";
import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLocale();
  return { title: l === "mn" ? "Хүмүүс" : l === "en" ? "People" : "인물" };
}

export default async function PeoplePage() {
  return <AtlasLoader data={await buildAtlasData(await getLocale())} lens="people" />;
}
