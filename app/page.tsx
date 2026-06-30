import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";
import { getLocale } from "@/lib/i18n/server";

// 로케일 쿠키 + 관리자 오버레이를 반영하기 위해 요청별 동적 렌더.
export const dynamic = "force-dynamic";

// The map is the base interface — it lives at the site root.
export default async function HomePage() {
  return <AtlasLoader data={await buildAtlasData(await getLocale())} />;
}
