// AI 복원·컬러화 초상이 존재하는 인물 id 목록(자동 생성 — scripts/colorize.ts).
// 원본 흑백/세피아는 보존하고, 컬러본은 /portraits/<id>-color.jpg 로 함께 호스팅한다.
// 컬러본은 Gemini 이미지 모델의 '복원 추정'이므로 UI에서 'AI 복원'으로 명시한다.
export const COLORIZED: ReadonlySet<string> = new Set([
  "allen", "annie", "appenzeller", "avison", "baird", "davis", "gale", "gilseonju", "hardie", "heron", "hulbert", "junkin", "kimchangsik", "leegipung", "leesujeong", "lillias", "maclay", "mckenzie", "moffett", "mscranton", "reynolds", "rosetta", "ross", "schofield", "seo", "seogyeongjo", "shepping", "switzer", "underwood", "william", "wjhall", 
]);

/** 원본 초상 경로(/portraits/<id>.jpg|png)를 받아, 컬러본이 있으면 그 경로를 돌려준다. */
export function colorSrc(src: string | null | undefined): string | null {
  if (!src) return null;
  const m = src.match(/\/portraits\/([^/.]+)\.(?:jpe?g|png)$/i);
  if (!m || !COLORIZED.has(m[1])) return null;
  return `/portraits/${m[1]}-color.jpg`;
}
