// 묘역별 '안장 선교사 전체 명단'. 본 자료실에 개별 수록된 대표 인물(BURIAL로
// 연결된 roster People) 외에, 묘역에 안장된 나머지 인물을 명단으로 보여주기 위한
// 데이터. 지도 마커가 아니라 묘역 상세의 '안장자 명단'으로만 표시한다. 출처 필수.
// 데이터는 리서치 에이전트가 호남신학대·지자체·기독교역사 자료로 교차검증해 채운다.
//
// ※ BURIED_EXTRA 에는 본 자료실 roster 에 이미 개별 수록된 인물(extra.ts 의
//   BURIED_OF 매핑 대상)은 중복 계산을 피하기 위해 넣지 않는다.
//   - gwangju_yangnim: owen / eugenebell / shepping 은 roster 수록(여기서 제외)
//   - daegu_eunhye:    bruen_martha / switzer 는 roster 수록(여기서 제외)
//   - jeonju_seonkyosa: davis / rankin / junkin 은 roster 수록(여기서 제외)

export interface BuriedPerson {
  /** 한국명(있으면) */ nameKo: string;
  /** 영문명 */ nameEn?: string;
  /** 생몰, "1868–1925" */ life?: string;
  /** 한 줄 역할/직책 */ role?: string;
  /** 안장·신원 불확실 */ uncertain?: boolean;
  note?: string;
}

/** cemeteryPlaceId → 안장자 명단(대표 roster 외 추가 인물 포함 전체). */
export const BURIED_EXTRA: Record<string, BuriedPerson[]> = {
  // ── 광주 양림동 선교사묘원(호남신학대 캠퍼스) ──
  // 출처(서구문화원)는 묘비 21기를 판독해 명단화. 일부 묘비는 OCR/표기 손상으로 신원 미확정.
  // roster 개별 수록(오웬·유진 벨·서서평) 제외한 나머지를 여기 수록.
  gwangju_yangnim: [
    { nameKo: "마가렛 벨", nameEn: "Margaret W. Bell", life: "1873–1919", role: "선교사 가족(유진 벨의 첫 부인)" },
    { nameKo: "엄언라", nameEn: "Ella Iberia Graham", life: "1889–1930", role: "여성 순회 선교사·수피아여학교 초대 교장", uncertain: true, note: "출생연도 1889/1869 자료 간 차이" },
    { nameKo: "부란도(브랜드)", nameEn: "Louis Christian Brand", life: "1894–1938", role: "의료 선교사·광주기독병원 3대 원장" },
    { nameKo: "구례인 가족", nameEn: "Paul Sackett Crane", life: "1889–1919", role: "선교사 가족(John C. Crane 동생)" },
    { nameKo: "구례인 가족", nameEn: "Elizabeth Letitia Crane", life: "1917–1918", role: "선교사 자녀(유아)" },
    { nameKo: "구례인 가족", nameEn: "John Curtis Crane Jr.", life: "1921–1921", role: "선교사 자녀(생후 6개월)" },
    { nameKo: "닷슨", nameEn: "Howard Knox Dodson", life: "1884–1924", role: "선교사(목포·광주)", uncertain: true, note: "묘비 OCR 손상('Homd Koox Dodson')" },
    { nameKo: "코딩턴 가족", nameEn: "Philip Codington", life: "1960–1967", role: "의료선교사 고허번(H.A. Codington)의 아들(7세)", note: "부친 고허번 본인은 미안장(가묘/도로명만 존재)" },
    { nameKo: "여계남(리비)", nameEn: "Jessie S. Levie", life: "1896–1931", role: "선교사(간호/교육)" },
    { nameKo: "채프먼", nameEn: "Gertrude P. Chapman", life: "1869–1928", role: "여성 선교사" },
    { nameKo: "니스벳(유애나)", nameEn: "Anabel Major Nisbet", life: "1869–1920", role: "여성 선교사·정명여학교 교장(유서백 부인)" },
    { nameKo: "고라복 자녀", nameEn: "Roberta Cecile Coit", life: "1911–1913", role: "선교사 자녀(고라복 R.T. Coit의 딸)" },
    { nameKo: "고라복 자녀", nameEn: "Thomas Hall Woods Coit", life: "1909–1913", role: "선교사 자녀(위와 남매, 1913.4 사망)" },
    { nameKo: "", nameEn: "Kathryn Newman", life: "1887–1926", role: "여성 선교사(추정)", uncertain: true, note: "묘비 OCR 심하게 손상, 신원 미확정" },
    { nameKo: "", nameEn: "Thelma Thumm", life: "1902–1931", role: "선교사/가족(미상)", uncertain: true, note: "신원 추가 확인 필요" },
    { nameKo: "", nameEn: "Lillian Andrus Southall", life: "–1938", role: "선교사 가족", uncertain: true, note: "신원 미확정(크레인 家 Lillian과 혼동 가능)" },
    { nameKo: "", nameEn: "Elisabeth D. Nisbet", life: "1922–1923", role: "선교사 자녀(니스벳 家 유아, 추정)", uncertain: true, note: "묘비 'Nicbet' 판독" },
    { nameKo: "롯스 부인", nameEn: "Mrs. Ross", life: "–1927", role: "선교사 가족", uncertain: true, note: "원문 자체 불명확('로제세 의사 장모 롯스부인 묘')" },
  ],

  // ── 대구 동산 은혜의 정원(계명대 동산병원/청라언덕) ──
  // 출처: 대구역사문화대전·Colonial Korea·Korea Times 교차. 16인 안장, 현재 묘석 13기.
  // roster 개별 수록(마르타 부르엔·마르타 스위쳐) 제외한 나머지를 여기 수록.
  daegu_eunhye: [
    { nameKo: "넬리 딕 아담스", nameEn: "Nellie Dick Adams", life: "1866–1909", role: "안의와(J.E. Adams) 선교사 부인·대구 첫 순교자로 불림" },
    { nameKo: "체이스 사우텔", nameEn: "Chase Cranford Sawtell", life: "1881–1909", role: "의료/장로회 선교사(장티푸스로 28세 사망)", note: "영문 표기 Sawtell/Soutel 혼재" },
    { nameKo: "마그다 콜러", nameEn: "Magda Elizabeth Köhler", life: "1887–1913", role: "구세군 선교사(스웨덴계)", uncertain: true, note: "2000년 서울 양화진으로 이장 — 현재 유해 없음" },
    { nameKo: "안나 부르엔", nameEn: "Anna Bruen Klerekoper", life: "1905–2004", role: "부르엔 가 딸(2007년 美서 모친 곁 이장)" },
    { nameKo: "해리엇 부르엔", nameEn: "Harriette Bruen Davis", life: "1910–2004", role: "부르엔 가 딸(2007년 美서 모친 곁 이장)" },
    { nameKo: "헨더슨 버디", nameEn: "Buddy Henderson", life: "1920–1921", role: "헨더슨 선교사 가족 유아" },
    { nameKo: "루스 번스턴", nameEn: "Ruth Bernsten", life: "1918–1919", role: "선교사 가족 유아(가장 작은 묘비)", note: "영문 표기 Bernsten/Bunston 혼재" },
    { nameKo: "헬렌 윈", nameEn: "Helen McGee Winn", life: "1913–1913", role: "선교사 부부 딸(출생 열흘 만에 사망)" },
    { nameKo: "바바라 챔니스", nameEn: "Barbara F. Chamness", life: "1927–1927", role: "챔니스 선교사 부부 딸(유아)" },
    { nameKo: "조엘 헨더슨", nameEn: "Joel Robert Henderson", life: "1964–1964", role: "남침례교 선교사 W.G. Henderson의 아들(사산/직후 사망)" },
    { nameKo: "존 도슨", nameEn: "John Hamilton Dawson", life: "1926–2007", role: "의료 선교사·동산병원 일반외과(유언으로 대구 안장)" },
    { nameKo: "존 시블리", nameEn: "John Rawson Sibley", life: "1926–2012", role: "의료 선교사·동산병원 외과/애락원", note: "영문 표기 Sibley/Sibly 혼재" },
    { nameKo: "하워드 모펫(마포화열)", nameEn: "Howard Fergus Moffett", life: "1917–2013", role: "동산병원장 45년·계명대 이사장(마포삼열의 아들)" },
    { nameKo: "마가렛 모펫", nameEn: "Margaret Delle Moffett", life: "1915–2010", role: "하워드 모펫 부인·선교 동역자" },
  ],

  // ── 전주 선교사묘역(예수병원/다가산) ──
  // 출처: 당당뉴스·주간기독신문·순례 자료 교차. "선교사 17명과 가족" 통설이나 전체 명단은
  // 공개본 부재. 전킨·잉골드 본인은 미안장(자녀만 안장). roster 수록(데이비스·랭킨·전킨) 제외.
  jeonju_seonkyosa: [
    { nameKo: "로라 피츠", nameEn: "Laura May Pitts", life: "1879–1911", role: "예수병원 간호사(부임 6개월 만에 사망)" },
    { nameKo: "프랭크 켈러", nameEn: "Frank G. Keller", role: "예수병원 병원장·소아과 의사", note: "생몰년 미확인" },
    { nameKo: "박영훈", nameEn: "Park Young-hun", role: "한국인 의사(세브란스 졸업), 예수병원 근무 중 사망", note: "한국인이나 묘역에 안장·생몰년 미확인" },
    { nameKo: "조지 전킨", nameEn: "George Junkin", life: "1893–1894", role: "전킨 선교사 장남(유아)" },
    { nameKo: "시드니 전킨", nameEn: "Sidney Junkin", life: "1899–1899", role: "전킨 선교사 차남(유아)" },
    { nameKo: "프랜시스 전킨", nameEn: "Francis Junkin", life: "1903–1903", role: "전킨 선교사 삼남(유아)" },
    { nameKo: "", nameEn: "Ingold infant", role: "마티 잉골드(예수병원 설립자)의 사산된 딸", note: "어머니 잉골드 본인은 美 플로리다서 별세, 미안장" },
    { nameKo: "구바울 자녀", nameEn: "Crane infant", life: "1963–1966", role: "폴 크레인(전 예수병원장)의 어린 자녀", uncertain: true, note: "출처 간 성별(아들/딸) 불일치" },
    { nameKo: "헨리 티몬스", nameEn: "Henry Timmons", role: "티몬스 전 병원장의 자녀(생후 22개월)", note: "생몰년 미확인" },
    { nameKo: "인돈 자녀", nameEn: "Linton child", role: "윌리엄 린튼(인돈)의 자녀", uncertain: true, note: "이름·생몰년 미확인" },
    { nameKo: "클락 자녀", nameEn: "Clark infant", role: "윌리엄 클락 선교사의 두 살배기 아들", uncertain: true, note: "단일 출처(당당뉴스)" },
    { nameKo: "해진(고아)", nameEn: "\"Haejin\"", role: "존 폴타 목사가 돌본 고아", uncertain: true, note: "단일 출처, 안장 여부 불명확" },
  ],

  // ── 양화진 외국인선교사묘원(서울 마포) ──
  // roster 개별 수록(헤론·언더우드·원한경·헐버트·홀가·M.스크랜튼·벙커·애니엘러스·
  //  에비슨·레이놀즈) 제외한 주요 안장 인물. 출처: 양화진 공식·위키·기독교역사.
  yanghwajin: [
    { nameKo: "베델", nameEn: "Ernest T. Bethell", life: "1872–1909", role: "대한매일신보 창간, 항일 언론인" },
    { nameKo: "무어(모삼열)", nameEn: "Samuel F. Moore", life: "1860–1906", role: "백정 신분해방 운동·곤당골(승동)교회" },
    { nameKo: "조세핀 캠벨", nameEn: "Josephine E. P. Campbell", life: "1853–1920", role: "남감리회 여선교사·배화학당 설립" },
    { nameKo: "더글러스 에비슨", nameEn: "Douglas B. Avison", life: "1893–1952", role: "에비슨의 아들·세브란스 소아과 교수·병원장" },
    { nameKo: "앨버트 테일러", nameEn: "Albert W. Taylor", life: "1875–1948", role: "AP 통신원·3·1운동/제암리 보도(딜쿠샤)" },
    { nameKo: "앨리스 아펜젤러", nameEn: "Alice R. Appenzeller", life: "1885–1950", role: "아펜젤러의 딸·이화여전 초대 교장" },
    { nameKo: "헨리 닷지 아펜젤러", nameEn: "Henry D. Appenzeller", life: "1889–1953", role: "아펜젤러의 아들·배재학당 교장" },
    { nameKo: "프란츠 에케르트", nameEn: "Franz Eckert", life: "1852–1916", role: "대한제국 애국가 작곡·서양식 군악대 창설" },
    { nameKo: "샤를 르장드르", nameEn: "Charles W. Legendre", life: "1830–1899", role: "대한제국 궁내부·내장원 고문" },
    { nameKo: "에밀 마르텔", nameEn: "Émile Martel", life: "1874–1949", role: "관립법어학교 설립·프랑스어 교육", uncertain: true, note: "생몰년 자료 간 차이" },
    { nameKo: "빈튼", nameEn: "Cadwallader C. Vinton", life: "1856–1936", role: "북장로회 의료선교사·제중원 의사", uncertain: true, note: "부인·두 아들 안장 확실, 본인은 추가 확인 필요" },
    { nameKo: "곽안련(클라크)", nameEn: "Charles A. Clark", life: "1878–1961", role: "북장로회 선교사·평양신학교 교수·한국교회사 저술", uncertain: true, note: "안장 경위 추가 확인 권장" },
    { nameKo: "조마가(트롤로프)", nameEn: "Mark N. Trollope", life: "1862–1930", role: "성공회 제3대 조선교구장 주교", uncertain: true, note: "성 세례자요한성당 안장설이 유력, 안장지 표기 충돌" },
  ],

  // ── 국립서울현충원(외국인 안장자) ──
  // roster 수록(스코필드) 제외. 6·25 참전 화교 등.
  hyeonchung: [
    { nameKo: "위서방", nameEn: "Wei Xufang", life: "1923–1989", role: "6·25 참전 화교·국군 1사단 수색대" },
    { nameKo: "강혜림", nameEn: "Jiang Huilin", life: "1925–1951", role: "6·25 참전 화교·관악산 전투 전사", note: "1964년 국립묘지 안장, 2012년 외국인묘역 이전" },
  ],
};

/** cemeteryPlaceId → 안장자 명단의 출처 URL. */
export const BURIED_SOURCE: Record<string, string[]> = {
  gwangju_yangnim: [
    "http://www.gjsgcc.or.kr/ko/29/view?SEQ=946", // 광주 서구문화원: 묘비 21기 판독 명단(1차 출처)
    "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=5a6293ae-075a-44fd-a4bf-a3a7f7807f24", // 대한민국 구석구석
    "https://gwangju.grandculture.net/gwangju/bukgu/toc/GC60005039", // 디지털광주문화대전
    "http://www.kch.or.kr/sub01/sub0104_1.html", // 광주기독병원 선교사 연혁(한국명 대조)
  ],
  daegu_eunhye: [
    "https://daegu.grandculture.net/daegu/toc/GC40008143", // 대구역사문화대전: 은혜의 정원
    "https://colonialkorea.com/2015/03/28/daegu-part1/", // Colonial Korea: 16인 명단·생몰
    "https://koreatimes.co.kr/www/opinion/2022/06/355_269792.html", // Korea Times
    "https://www.imaeil.com/page/view/2012102207463637703", // 매일신문
  ],
  jeonju_seonkyosa: [
    "https://www.dangdangnews.com/news/articleView.html?idxno=26420", // 당당뉴스(가장 상세)
    "https://www.kidok.com/news/articleView.html?idxno=501488", // 주간기독신문
    "https://k-pilgrimageroad.org/전주지부-순례-코스/", // K-순례길 전주지부
    "https://brunch.co.kr/@37142dd4d64f415/135", // 마티 잉골드(미안장 근거)
  ],
  yanghwajin: [
    "https://yanghwajin.net/", // 양화진 외국인선교사묘원 공식(1차)
    "https://ko.wikipedia.org/wiki/양화진외국인선교사묘원",
    "https://encykorea.aks.ac.kr/Article/E0075892",
    "https://www.kich.org/news/articleView.html?idxno=10300",
  ],
  hyeonchung: [
    "https://www.snmb.mil.kr/snmb/228/subview.do", // 국립서울현충원
    "https://ko.wikipedia.org/wiki/국립서울현충원",
  ],
};

/** cemeteryPlaceId → 총 안장 규모 설명(예: "선교사·가족 등 약 26명 안장"). */
export const BURIED_TOTAL: Record<string, string> = {
  gwangju_yangnim:
    "남장로회 선교사·가족 약 22~23명 안장(현존 묘비 판독 21기). 현장의 약 44기 검은 화강석은 상당수가 양화진·전주 묘를 재현한 가묘(假墓). 우월순(R.M. Wilson)·탈메이지·녹스·프링글·고허번 본인 등은 실제 안장이 확인되지 않음(가묘 추정).",
  daegu_eunhye:
    "북장로회 등 선교사·가족 16명 안장(현존 묘석 13기; 일부 합장, 콜러는 2000년 양화진 이장). 안의와(J.E. Adams)·우드브리지 존슨 본인은 미안장(부인 넬리 딕 아담스만 안장).",
  jeonju_seonkyosa:
    "남장로회 선교사·가족 약 17명 안장(전체 명단 공개본 부재). 전킨(전위렴)·잉골드 본인은 미안장이며 자녀만 안장. 미상 유아묘 다수.",
  yanghwajin:
    "15개국 약 417명이 안장된 한국 개신교 선교 역사의 대표 묘역(1890년 헤론 안장으로 시작). 아래는 본 자료실 수록 인물 외 주요 안장자 일부입니다. 베어드·게일은 양화진엔 기념비/가묘만 있고 본인은 평양/영국 안장.",
  hyeonchung:
    "국군·국가유공자 중심의 국립묘지. 외국인 안장자는 스코필드(외국인 첫 독립유공자) 외에 6·25 참전 화교 등이 외국인묘역에 안장.",
};
