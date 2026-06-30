// AI 복원·컬러화 초상이 존재하는 인물 id 목록(자동 생성 — scripts/colorize.ts).
// 원본 흑백/세피아는 보존하고, 컬러본은 /portraits/<id>-color.jpg 로 함께 호스팅한다.
// 컬러본은 Gemini 이미지 모델의 '복원 추정'이므로 UI에서 'AI 복원'으로 명시한다.
export const COLORIZED: ReadonlySet<string> = new Set([
  "allen", "annie", "anniebaird", "appenzeller", "avison", "baird", "davis", "fenwick", "gale", "gilseonju", "hardie", "heron", "hulbert", "jones", "junkin", "kimchangsik", "leegipung", "leesujeong", "lillias", "maclay", "mckenzie", "moffett", "mscranton", "reynolds", "rosetta", "ross", "schofield", "seo", "seogyeongjo", "shepping", "switzer", "trollope", "underwood", "william", "wjhall",
]);

/** 원본 초상 경로를 받아 컬러본 경로를 돌려준다(없으면 null).
 *  - 로컬 /portraits/<id>.jpg: COLORIZED 매니페스트에 있을 때만.
 *  - Supabase Storage(portraits 버킷) 업로드: 컬러본(-color)이 항상 함께 생성되므로 변환해 반환. */
export function colorSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  if (src.includes("/storage/v1/object/public/portraits/") && !/-color\.[a-z]+(\?.*)?$/i.test(src)) {
    return src.replace(/\.(jpe?g|png)(\?.*)?$/i, "-color.jpg");
  }
  const m = src.match(/\/portraits\/([^/.]+)\.(?:jpe?g|png)$/i);
  if (!m || !COLORIZED.has(m[1])) return null;
  return `/portraits/${m[1]}-color.jpg`;
}

// 합성(사진+글귀)·타원·치우침 원본을 인물만 크롭한 '정돈된 흑백본(-bw)'이 있는 인물.
// 원본(흑백) 보기에서 이 정돈본을 대신 보여줘 가로 비율·테두리 문제를 없앤다.
export const BW_FIXED: ReadonlySet<string> = new Set(["leesujeong", "davis", "junkin"]);

/** 원본 경로를 받아, 정돈 흑백본(-bw)이 있으면 그 경로를, 없으면 null. */
export function bwSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  const m = src.match(/\/portraits\/([^/.]+)\.(?:jpe?g|png)$/i);
  if (!m || !BW_FIXED.has(m[1])) return null;
  return `/portraits/${m[1]}-bw.jpg`;
}
