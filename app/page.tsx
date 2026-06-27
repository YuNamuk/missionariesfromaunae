import { buildAtlasData } from "@/components/map/atlas-data";
import { AtlasLoader } from "@/components/map/atlas-loader";

// ISR: 페이지 RSC를 캐시해 헤더 내비(인물 클릭)마다 Supabase를 다시 읽지 않는다.
// /admin 저장 시 on-demand revalidate(revalidatePath("/"))로 편집을 즉시 반영하므로
// 관리자 편집도 그대로 동작한다.
export const revalidate = 300;

// The map is the base interface — it lives at the site root.
export default async function HomePage() {
  return <AtlasLoader data={await buildAtlasData()} />;
}
