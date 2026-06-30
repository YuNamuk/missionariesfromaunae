import type { Locale } from "./locale";

// 데이터 파생 라벨(시대·지역·교단·사역·나라)의 영어·몽골어. 키는 meta.ts와 동일.
// 둘러보기 패널·인명사전 facet 등에서 쓰며, 한국어는 meta.ts 원본을 그대로 폴백한다.
// 몽골어는 1차 초안(원어민 검수 권장).
type Map = Record<string, string>;
type LocMap = { en: Map; mn: Map };

const era: LocMap = {
  en: { open: "Opening Period (1882–1894)", root: "Mission Takes Root (1895–1910)", colonial: "Japanese Colonial Period (1910–1945)", liberation: "Liberation & War (1945–1960)" },
  mn: { open: "Нээлтийн үе (1882–1894)", root: "Номлол суурьшсан үе (1895–1910)", colonial: "Японы колоничлолын үе (1910–1945)", liberation: "Чөлөөлөлт ба дайны үе (1945–1960)" },
};
const region: LocMap = {
  en: { seoul: "Seoul · Incheon · Gyeonggi", seobuk: "Pyongan · Hwanghae (Northwest)", gwanbuk: "Hamgyong · Wonsan (Northeast)", honam: "Honam (Jeolla)", yeongnam: "Yeongnam (Gyeongsang)", jeju: "Jeju", abroad: "Abroad (Manchuria · Japan)" },
  mn: { seoul: "Сөүл · Инчон · Гёнги", seobuk: "Пёнан · Хванхэ (Баруун хойд)", gwanbuk: "Хамгён · Вонсан (Зүүн хойд)", honam: "Хонам (Жолла)", yeongnam: "Ённам (Гёнсан)", jeju: "Жэжү", abroad: "Гадаад (Манжуур · Япон)" },
};
const denom: LocMap = {
  en: { np: "US Northern Presbyterian", sp: "US Southern Presbyterian", nm: "US Northern Methodist", sm: "US Southern Methodist", union: "Union & Other Presbyterian", methodist: "Methodist (Other)", korean: "Korean" },
  mn: { np: "АНУ-ын Хойд Пресбитериан", sp: "АНУ-ын Өмнөд Пресбитериан", nm: "АНУ-ын Хойд Методист", sm: "АНУ-ын Өмнөд Методист", union: "Нэгдсэн ба бусад Пресбитериан", methodist: "Методист (бусад)", korean: "Солонгос хүн" },
};
const role: LocMap = {
  en: { medical: "Medical", education: "Education", evangel: "Evangelism · Ministry", translate: "Translation · Hangul", women: "Women's Ministry", revival: "Revival", indep: "Independence · Diplomacy" },
  mn: { medical: "Анагаах", education: "Боловсрол", evangel: "Сайн мэдээ · Үйлчлэл", translate: "Орчуулга · Хангыл", women: "Эмэгтэйчүүдийн үйлчлэл", revival: "Сэргэлт", indep: "Тусгаар тогтнол · Дипломат" },
};
// 나라 — 키는 한국어 나라명(데이터 값) 그대로.
const country: LocMap = {
  en: { "미국": "United States", "영국": "United Kingdom", "캐나다": "Canada", "호주": "Australia", "한국": "Korea", "조선": "Korea", "뉴질랜드": "New Zealand", "일본": "Japan", "독일": "Germany", "스웨덴": "Sweden" },
  mn: { "미국": "АНУ", "영국": "Их Британи", "캐나다": "Канад", "호주": "Австрали", "한국": "Солонгос", "조선": "Солонгос", "뉴질랜드": "Шинэ Зеланд", "일본": "Япон", "독일": "Герман", "스웨덴": "Швед" },
};

const GROUPS: Record<string, LocMap> = { era, region, denom, role, country };

/** 라벨 번역. ko면 원본(ko)을 그대로, 그 외엔 사전값(없으면 ko 폴백). */
export function tl(locale: Locale, type: keyof typeof GROUPS | string, key: string, ko: string): string {
  if (locale === "ko") return ko;
  const g = GROUPS[type];
  return (g && (g as LocMap)[locale as "en" | "mn"]?.[key]) || ko;
}
