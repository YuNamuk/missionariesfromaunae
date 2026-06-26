// Person portrait enrichment, sourced from Wikidata (P18) → Wikimedia Commons.
// Each entry carries its provenance so the UI can always cite the source.
// QIDs were hand-verified (the auto-search mis-matched John Ross and 이수정).
// Missionaries without a Commons portrait fall back to an initials avatar.

export interface PersonPhoto {
  qid: string;
  /** Commons thumbnail URL, or null when no portrait exists yet */
  photo: string | null;
  /** Korean Wikipedia article (verified to be this missionary) */
  wiki: string;
  /** Verified 나무위키 article URL ("" if none / mismatched) */
  namu?: string;
  /** Verified English Wikipedia URL ("" if none / mismatched) */
  wikiEn?: string;
  source: string;
}

// 링크·사진은 리서치 에이전트가 실제 문서를 열어 "그 선교사 본인"이 맞는지
// 검증한 결과만 채웠다. 동명이인(서경조 나무위키·변요한·이수정 영문 등)은 제외.
const C = "Wikimedia Commons";
export const PHOTOS: Record<string, PersonPhoto> = {
  allen: { qid: "Q505508", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Horace_Newton_Allen.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/호러스_뉴턴_알렌", wikiEn: "https://en.wikipedia.org/wiki/Horace_Newton_Allen", namu: "https://namu.wiki/w/호러스 뉴턴 알렌", source: C },
  underwood: { qid: "Q623878", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Horace_Grant_Underwood.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/호러스_그랜트_언더우드", wikiEn: "https://en.wikipedia.org/wiki/Horace_Grant_Underwood", namu: "https://namu.wiki/w/호러스 그랜트 언더우드", source: C },
  appenzeller: { qid: "Q1145616", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/A_Modern_Pioneer_in_Korea_-_Henry_Gerhart_Appenzeller,_1901.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/헨리_아펜젤러", wikiEn: "https://en.wikipedia.org/wiki/Henry_Appenzeller", namu: "https://namu.wiki/w/헨리 아펜젤러", source: C },
  mscranton: { qid: "Q6779508", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Mary_F._Scranton_(1832-1909).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/메리_스크랜튼", wikiEn: "https://en.wikipedia.org/wiki/Mary_F._Scranton", namu: "https://namu.wiki/w/메리 스크랜튼", source: C },
  sherwoodhall: { qid: "Q21058653", photo: null, wiki: "https://ko.wikipedia.org/wiki/셔우드_홀_(1893년)", namu: "https://namu.wiki/w/셔우드 홀", source: "한국어 위키백과" },
  ross: { qid: "Q703758", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/John_Ross_(missionary).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/존_로스_(선교사)", wikiEn: "https://en.wikipedia.org/wiki/John_Ross_(missionary)", namu: "https://namu.wiki/w/존 로스(선교사)", source: C },
  leesujeong: { qid: "Q16178964", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Lee_Su-jung.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/이수정_(1842년)", namu: "https://namu.wiki/w/이수정(1842)", source: C },
  william: { qid: "Q12609622", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Rev.%EC%9C%8C%EB%A6%AC%EC%97%84%EB%B2%A4%ED%84%B4%EC%8A%A4%ED%81%AC%EB%9E%9C%ED%84%B4%EC%84%A0%EA%B5%90%EC%82%AC%EB%8B%98William_Benton_Scranton(1856-1922).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/윌리엄_스크랜턴", wikiEn: "https://en.wikipedia.org/wiki/William_B._Scranton", namu: "https://namu.wiki/w/윌리엄 스크랜튼", source: C },
  heron: { qid: "Q12617205", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/JohnWHeronOrig_(cropped).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/존_헤론", wikiEn: "https://en.wikipedia.org/wiki/John_W._Heron", namu: "https://namu.wiki/w/존 헤론", source: C },
  seo: { qid: "Q16219973", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/서상륜(AMJ).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/서상륜", wikiEn: "https://en.wikipedia.org/wiki/Seo_Sang-ryun", source: C },
  rosetta: { qid: "Q7368694", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Dr._Rosetta_Sherwood_Hall.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/로제타_셔우드_홀", wikiEn: "https://en.wikipedia.org/wiki/Rosetta_Sherwood_Hall", namu: "https://namu.wiki/w/로제타 셔우드 홀", source: C },

  // ── expanded roster ──
  moffett: { qid: "Q16168359", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/SAMoffett1889.png?width=240", wiki: "https://ko.wikipedia.org/wiki/새뮤얼_오스틴_모펫", wikiEn: "https://en.wikipedia.org/wiki/Samuel_Austin_Moffett", namu: "https://namu.wiki/w/사무엘 오스틴 모펫", source: C },
  baird: { qid: "", photo: null, wiki: "https://ko.wikipedia.org/wiki/윌리엄_M._베어드", wikiEn: "https://en.wikipedia.org/wiki/William_M._Baird", namu: "https://namu.wiki/w/윌리엄 마튼 베어드", source: "한국어 위키백과" },
  avison: { qid: "Q16096488", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Oliver_R._Avison.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/올리버_R._에이비슨", wikiEn: "https://en.wikipedia.org/wiki/Oliver_R._Avison", namu: "https://namu.wiki/w/올리버 R. 에이비슨", source: C },
  gale: { qid: "Q11270711", photo: null, wiki: "https://ko.wikipedia.org/wiki/제임스_게일", wikiEn: "https://en.wikipedia.org/wiki/James_Scarth_Gale", namu: "https://namu.wiki/w/제임스 게일", source: "한국어 위키백과" },
  hulbert: { qid: "Q5890091", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Homer_Bezaleel_Hulbert.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/호머_헐버트", wikiEn: "https://en.wikipedia.org/wiki/Homer_Hulbert", namu: "https://namu.wiki/w/호머 헐버트", source: C },
  bunker: { qid: "", photo: null, wiki: "", source: "" },
  annie: { qid: "", photo: null, wiki: "", source: "" },
  lillias: { qid: "Q55721069", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/Lillias_Horton_Underwood.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/릴리어스_호턴_언더우드", wikiEn: "https://en.wikipedia.org/wiki/Lillias_Horton_Underwood", source: C },
  wjhall: { qid: "Q79619988", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/William_James_Hall_(cropped).jpg?width=240", wiki: "", wikiEn: "https://en.wikipedia.org/wiki/William_James_Hall", source: C },
  hardie: { qid: "", photo: "https://upload.wikimedia.org/wikipedia/en/d/df/R._A._Hardie.jpg", wiki: "https://ko.wikipedia.org/wiki/로버트_A._하디", wikiEn: "https://en.wikipedia.org/wiki/Robert_A._Hardie", source: "영문 위키백과(공정이용)" },
  eugenebell: { qid: "", photo: null, wiki: "", source: "" },
  junkin: { qid: "", photo: null, wiki: "", source: "" },
  reynolds: { qid: "Q8007512", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/William_Davis_Reynolds.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/윌리엄_데이비스_레이놀즈", wikiEn: "https://en.wikipedia.org/wiki/William_D._Reynolds", namu: "https://namu.wiki/w/윌리엄 데이비스 레이놀즈", source: C },
  leegipung: { qid: "Q65281226", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/이기풍.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/이기풍", source: C },
  gilseonju: { qid: "Q4991796", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/길선주.jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/길선주", namu: "https://namu.wiki/w/길선주", source: C },
  seogyeongjo: { qid: "Q16169416", photo: "https://commons.wikimedia.org/wiki/Special:FilePath/서경조(徐景祚).jpg?width=240", wiki: "https://ko.wikipedia.org/wiki/서경조_(목회자)", source: C },
  kimchangsik: { qid: "", photo: null, wiki: "https://ko.wikipedia.org/wiki/김창식_(1857년)", source: "한국어 위키백과" },
  schofield: { qid: "Q5489442", photo: null, wiki: "https://ko.wikipedia.org/wiki/프랭크_스코필드", wikiEn: "https://en.wikipedia.org/wiki/Frank_Schofield", namu: "https://namu.wiki/w/프랭크_스코필드", source: "한국어 위키백과" },
  hhunderwood: { qid: "Q12625227", photo: null, wiki: "https://ko.wikipedia.org/wiki/호러스_호턴_언더우드", source: "한국어 위키백과" },
  linton: { qid: "", photo: null, wiki: "https://ko.wikipedia.org/wiki/윌리엄_린튼", namu: "https://namu.wiki/w/윌리엄_린튼", source: "한국어 위키백과" },
  // 묘역별 대표 선교사(보강).
  shepping: { qid: "", photo: null, wiki: "https://ko.wikipedia.org/wiki/서서평", wikiEn: "https://en.wikipedia.org/wiki/Elisabeth_Shepping", namu: "https://namu.wiki/w/서서평", source: "한국어 위키백과" },
  owen: { qid: "", photo: null, wiki: "", source: "" },
  preston: { qid: "", photo: null, wiki: "", source: "" },
  bruen_martha: { qid: "", photo: null, wiki: "", source: "" },
  switzer: { qid: "", photo: null, wiki: "", source: "" },
  davis: { qid: "", photo: null, wiki: "", source: "" },
  rankin: { qid: "", photo: null, wiki: "", source: "" },
};

export function photoFor(id: string): PersonPhoto | undefined {
  return PHOTOS[id];
}
