import type { Locale } from "./locale";
import { LABEL_OVERRIDES } from "./overrides";

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

// 장소 분류(CAT) 라벨
const cat: LocMap = {
  en: { port: "Main Port of Entry", origin: "Birthplace of the Gospel", site: "Mission Heritage Site", person: "Missionary" },
  mn: { port: "Гол боомт", origin: "Сайн мэдээний эх газар", site: "Номлолын дурсгалт газар", person: "Номлогч" },
};
// 관계 유형(REL_TYPES) 라벨
const rel: LocMap = {
  en: { influence: "Influence", prepare: "Opened the way", partner: "Partnership", mentor: "Mentor–disciple", family: "Family", succeed: "Succession" },
  mn: { influence: "Нөлөө", prepare: "Зам нээсэн", partner: "Хамтын ажиллагаа", mentor: "Багш–шавь", family: "Гэр бүл", succeed: "Залгамжлал" },
};

// 선교 유적지 유형
const htype: LocMap = {
  en: { "교회": "Church", "학교": "School", "병원": "Hospital", "선교부": "Mission Station", "사택·양관": "Residence", "기념관": "Memorial Hall", "마을·구역": "Village/District" },
  mn: { "교회": "Сүм", "학교": "Сургууль", "병원": "Эмнэлэг", "선교부": "Номлолын төв", "사택·양관": "Орон сууц", "기념관": "Дурсгалын танхим", "마을·구역": "Тосгон/Бүс" },
};

// 선교 유적지 권역(둘러보기 그룹 라벨)
const htregion: LocMap = {
  en: { "서울·경기": "Seoul · Gyeonggi", "인천·강화": "Incheon · Ganghwa", "충청": "Chungcheong", "호남": "Honam", "영남": "Yeongnam", "관북·서북(북한)": "North (Gwanbuk · Seobuk)", "제주": "Jeju" },
  mn: { "서울·경기": "Сөүл · Гёнги", "인천·강화": "Инчон · Канхва", "충청": "Чүнчон", "호남": "Хонам", "영남": "Ённам", "관북·서북(북한)": "Хойд (Гванбук · Сэобук)", "제주": "Жэжү" },
};

const GROUPS: Record<string, LocMap> = { era, region, denom, role, country, cat, rel, htype, htregion };
// 관리자 '번역 관리' 검수용 — 라벨 그룹 공개(키·기본 번역 참조).
export const LABEL_GROUPS = GROUPS;

/** 라벨 번역. ko면 원본(ko), 그 외엔 오버라이드(DB) → 사전 → ko 폴백. */
export function tl(locale: Locale, type: keyof typeof GROUPS | string, key: string, ko: string): string {
  if (locale === "ko") return ko;
  const o = LABEL_OVERRIDES[locale]?.[`${type}.${key}`];
  if (o) return o;
  const g = GROUPS[type];
  return (g && (g as LocMap)[locale as "en" | "mn"]?.[key]) || ko;
}
