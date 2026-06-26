import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";

export const dynamic = "force-dynamic";

// The map is the base interface — it lives at the site root.
export default async function HomePage() {
  return <AtlasLoader data={await buildAtlasData()} />;
}
