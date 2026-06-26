// Person portrait enrichment, sourced from Wikidata (P18) → Wikimedia Commons.
// Each entry carries its provenance so the UI can always cite the source.
// QIDs were hand-verified (the auto-search mis-matched John Ross and 이수정).
// Missionaries without a Commons portrait fall back to an initials avatar.

export interface PersonPhoto {
  qid: string;
  /** Commons thumbnail URL, or null when no portrait exists yet */
  photo: string | null;
  /** Korean Wikipedia article */
  wiki: string;
  source: string;
}

export const PHOTOS: Record<string, PersonPhoto> = {
  allen: { qid: "Q505508", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Horace%20Newton%20Allen.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/호러스_뉴턴_알렌", source: "Wikimedia Commons" },
  underwood: { qid: "Q623878", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Horace%20Grant%20Underwood%20statue%20in%20Yonsei%20Univ%20main%20campus.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/호러스_그랜트_언더우드", source: "Wikimedia Commons" },
  appenzeller: { qid: "Q1145616", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/A%20Modern%20Pioneer%20in%20Korea%20-%20Henry%20Gerhart%20Appenzeller%2C%201901.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/헨리_아펜젤러", source: "Wikimedia Commons" },
  mscranton: { qid: "Q6779508", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Mary%20F.%20Scranton%20(1832-1909).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/메리_스크랜튼", source: "Wikimedia Commons" },
  sherwoodhall: { qid: "Q21058653", photo: null, wiki: "https://ko.wikipedia.org/wiki/셔우드_홀_(1893년)", source: "Wikidata" },
  ross: { qid: "Q703758", photo: null, wiki: "https://ko.wikipedia.org/wiki/존_로스_(선교사)", source: "Wikidata" },
  leesujeong: { qid: "Q16178964", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Lee%20Su-jung.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/이수정_(1842년)", source: "Wikimedia Commons" },
  william: { qid: "Q12609622", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Rev.%EC%9C%8C%EB%A6%AC%EC%97%84%EB%B2%A4%ED%84%B4%EC%8A%A4%ED%81%AC%EB%9E%9C%ED%84%B4%EC%84%A0%EA%B5%90%EC%82%AC%EB%8B%98William%20Benton%20Scranton(1856-1922).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/윌리엄_스크랜턴", source: "Wikimedia Commons" },
  heron: { qid: "Q12617205", photo: null, wiki: "https://ko.wikipedia.org/wiki/존_헤론", source: "Wikidata" },
  seo: { qid: "Q16219973", photo: null, wiki: "https://ko.wikipedia.org/wiki/서상륜", source: "Wikidata" },
  rosetta: { qid: "Q7368694", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Dr.%20Rosetta%20Sherwood%20Hall.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/로제타_셔우드_홀", source: "Wikimedia Commons" },

  // ── expanded roster ──
  moffett: { qid: "Q16168359", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/SAMoffett1889.png?width=240", wiki: "https://ko.wikipedia.org/wiki/새뮤얼_오스틴_모펫", source: "Wikimedia Commons" },
  avison: { qid: "Q16096488", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Oliver%20R.%20Avison.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/올리버_R._에이비슨", source: "Wikimedia Commons" },
  gale: { qid: "Q11270711", photo: null, wiki: "https://ko.wikipedia.org/wiki/제임스_게일", source: "Wikidata" },
  hulbert: { qid: "Q5890091", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Homer%20Bezaleel%20Hulbert.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/호머_헐버트", source: "Wikimedia Commons" },
  lillias: { qid: "Q55721069", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Lillias%20Horton%20Underwood.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/릴리어스_호턴_언더우드", source: "Wikimedia Commons" },
  wjhall: { qid: "Q79619988", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/William%20James%20Hall%20(cropped).jpg?width=240", wiki: "", source: "Wikimedia Commons" },
  reynolds: { qid: "Q8007512", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/William%20Davis%20Reynolds.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/윌리엄_데이비스_레이놀즈", source: "Wikimedia Commons" },
  leegipung: { qid: "Q65281226", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/%EC%9D%B4%EA%B8%B0%ED%92%8D.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/이기풍", source: "Wikimedia Commons" },
  gilseonju: { qid: "Q4991796", photo: null, wiki: "https://ko.wikipedia.org/wiki/길선주", source: "Wikidata" },
  seogyeongjo: { qid: "Q16169416", photo: null, wiki: "https://ko.wikipedia.org/wiki/서경조_(목회자)", source: "Wikidata" },
  junkin: { qid: "Q113134342", photo: null, wiki: "", source: "Wikidata" },
  eugenebell: { qid: "Q94487274", photo: null, wiki: "https://ko.wikipedia.org/wiki/유진_벨", source: "한국어 위키백과" },
  schofield: { qid: "Q5489442", photo: null, wiki: "https://ko.wikipedia.org/wiki/프랭크_스코필드", source: "Wikidata" },
  hhunderwood: { qid: "Q12625227", photo: null, wiki: "https://ko.wikipedia.org/wiki/호러스_호턴_언더우드", source: "Wikidata" },
  linton: { qid: "", photo: null, wiki: "", source: "" },
  // 묘역별 대표 선교사(보강). 단독 위키가 없으면 wiki는 비우고 상세의 나무위키 링크로.
  shepping: { qid: "", photo: null, wiki: "https://ko.wikipedia.org/wiki/서서평", source: "한국어 위키백과" },
  owen: { qid: "", photo: null, wiki: "https://ko.wikipedia.org/wiki/오웬기념각", source: "한국어 위키백과(오웬기념각)" },
  preston: { qid: "", photo: null, wiki: "", source: "" },
  bruen_martha: { qid: "", photo: null, wiki: "", source: "" },
  switzer: { qid: "", photo: null, wiki: "", source: "" },
  davis: { qid: "", photo: null, wiki: "", source: "" },
  rankin: { qid: "", photo: null, wiki: "", source: "" },
};

export function photoFor(id: string): PersonPhoto | undefined {
  return PHOTOS[id];
}
