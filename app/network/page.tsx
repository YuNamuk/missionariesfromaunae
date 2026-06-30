import type { Metadata } from "next";
import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "관계망" };

export default async function NetworkPage() {
  return <AtlasLoader data={await buildAtlasData(await getLocale())} lens="network" />;
}
