// 인명사전 — 묘역별 안장 인물의 넓은 디렉터리.
// 핵심 로스터(별도 프로필) + Wikidata 매장지(P119)로 교차검증해 발견한 비(非)로스터 인물.

/** 로스터 인물 중 Wikidata P119(양화진 매장)로 교차검증된 id */
export const WIKIDATA_VERIFIED = new Set([
  "hulbert", "mscranton", "rosetta", "underwood", "sherwoodhall", "lillias", "wjhall",
]);

export interface DictExtra {
  name: string;
  en: string;
  life: string;
  tag: string;
  qid: string;
  note: string;
}

/** 묘역별, 로스터에 없지만 Wikidata P119로 확인된 안장 인물 */
export const DICT_EXTRA: Record<string, DictExtra[]> = {
  yanghwajin: [
    { name: "조세핀 캠벨", en: "Josephine E. P. Campbell", life: "1853–1920", tag: "선교 · 교육", qid: "Q12616863", note: "남감리회 여선교사, 배화학당 설립" },
    { name: "애니 베어드", en: "Annie L. A. Baird", life: "1864–1916", tag: "교육 · 찬송", qid: "Q101136682", note: "베어드의 부인, 교육·찬송가 사역" },
    { name: "매리언 바텀리 홀", en: "Marian Bottomley Hall", life: "1896–1991", tag: "의료", qid: "Q133465038", note: "셔우드 홀의 부인, 의료 선교" },
    { name: "앨버트 테일러", en: "Albert W. Taylor", life: "1875–1948", tag: "언론 · 기업", qid: "Q19359958", note: "3·1 독립선언을 세계에 타전한 기업인·언론인" },
    { name: "클래런스 그레이트하우스", en: "Clarence R. Greathouse", life: "1846–1899", tag: "외교 · 고문", qid: "Q5126720", note: "대한제국 법률·외교 고문" },
    { name: "그래프턴 민츠", en: "Grafton K. Mintz", life: "1925–1983", tag: "언론", qid: "Q5592546", note: "코리아타임스 편집인" },
    { name: "H. 벤크래프트 졸리", en: "H. Bencraft Joly", life: "1857–1898", tag: "외교 · 번역", qid: "Q104521438", note: "영국 영사, 『홍루몽』 영역" },
    { name: "헨리 뮐렌슈테트", en: "Henry J. Mühlensteth", life: "1855–1915", tag: "기술", qid: "Q110382459", note: "덴마크 출신 전신 기술자" },
  ],
};

export const wikidataUrl = (qid: string) => `https://www.wikidata.org/wiki/${qid}`;
