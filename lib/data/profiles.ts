// 상세 프로필 보강 — 대표(FEATURED) 인물의 ① 구체적 사역 내역, ② 한국 선교의
// 큰 흐름 속에서의 여정(섭리적 서술), ③ 한국인·동료 선교사에게 준 영향.
// 모든 사실 진술은 통설/사료에 근거하며, 해석적 서술은 '큰 흐름' 관점으로 절제해 담았다.

import { STORIES } from "./stories";

export interface PersonProfile {
  /** 구체적 사역 내역(불릿) */
  ministry: string[];
  /** 한국 선교의 큰 흐름 속에서의 여정(섭리적 서술) */
  journey: string;
  /** 한국인과 동료 선교사에게 준 영향 */
  influence: string;
  /** 이 삶에서 아름다운 것 / 치른 값 — 헌신·희생의 결(검증된 내용만, 없으면 생략) */
  beauty?: string;
  /** 1차 자료 인용(편지·일기·묘비명 등). 반드시 출처와 함께. 확실하지 않으면 비움. */
  quote?: { text: string; source: string };
  /** 잔잔한 스토리텔링 서사(문단 배열) — 누가 불렀는지·조선에 닿는 과정·치른 값·
   *  특별한 영웅이 아니라 우리와 같은 한 사람이었음. 사실에 근거. 없으면 생략. */
  story?: string[];
  /** 인물 관련 검증된 영상 링크. 없으면 생략. */
  videos?: { url: string; title: string; source?: string }[];
  /** 검증된 권위 참고 사료 링크(한국민족문화대백과·위키 등). 없으면 생략. */
  refs?: { title: string; url: string; publisher?: string }[];
}

export const PROFILES: Record<string, PersonProfile> = {
  jones: {
    ministry: [
      "1888년 21세에 미감리회 최연소 선교사로 입국 — 처음에는 배재학당에서 가르침",
      "1892년 제물포(인천) 내리교회 담임으로 부임, 영화학교를 세워 제물포 지역 근대교육을 엶",
      "인천·강화·부평·남양 등지를 순회하며 1903년까지 수십 개 교회를 개척하고 수천 명에게 세례를 베풂",
      "1900년 제물포에서 한국어 신학지 『신학월보』를 창간 — 한국인을 위한 신학 문서선교의 출발",
      "영문지 『코리안 리포지터리』·『코리아 리뷰』를 편집하며 한국의 역사·종교·언어를 학문적으로 연구해 세계에 알림",
    ],
    journey:
      "복음이 아직 낯설던 항구 도시 제물포에서, 젊은 선교사는 교회와 학교와 잡지를 함께 일구었다. 그는 한국을 ‘가르칠 대상’이 아니라 ‘배워야 할 나라’로 대했고, 그 땅의 말과 종교를 학문으로 끌어안은 첫 세대였다.",
    influence:
      "그가 세운 내리교회와 영화학교는 인천 기독교와 근대교육의 뿌리가 되었고, 『신학월보』는 한국인 스스로 신학을 읽고 쓰는 길을 열었다. 그의 교회에서 자란 교인 다수가 1902년 첫 하와이 이민 길에 올라, 한국 교회는 일찍부터 바다 건너로 이어졌다.",
    beauty:
      "가장 어린 나이로 들어와 가장 부지런히 한국을 배운 사람. 그는 한국을 연구해 세계에 변호했고, 끝내 병을 얻어 고국으로 돌아간 뒤에도 한국을 마음에서 내려놓지 않았다.",
  },
  anniebaird: {
    ministry: [
      "1891년 남편 윌리엄 베어드와 함께 입국 — 부산·대구를 거쳐 1897년 평양에 정착",
      "한국 여성들을 집으로 맞아들여 가르치고, 평양에서 첫 여성 사경회(성경 공부반)를 인도함",
      "한국어를 깊이 익혀 남편의 번역과 저술을 도왔고, 여러 찬송가를 한국어로 옮김",
      "『해 뜨는 동방(Daybreak in Korea, 1909)』·『한국어 학습자를 위한 50가지 도움(1911)』·『선교 생활의 안쪽 풍경(1913)』을 써 선교 현장을 안팎에 알림",
    ],
    journey:
      "남편의 이름 뒤에 가려지기 쉬운 자리에서, 그는 자기 몫의 일을 조용히 감당했다. 여성들이 글을 읽고 성경을 배우도록 길을 냈고, 한국어로 찬송을 옮겨 예배의 말을 한국 사람의 입에 얹었다.",
    influence:
      "그가 연 평양의 여성 사경회는 이후 여성 신앙교육과 부흥의 밑거름이 되었고, 그의 글은 한국 선교의 현실을 세계 독자에게 전한 드문 창이었다. 숭실의 설립기를 함께 견딘 동역자이기도 했다.",
    beauty:
      "이름난 직책 없이도, 한 가정의 안주인이자 교사이자 번역자로 평양의 삶을 살아냈다. 1916년 그곳에서 생을 마쳤다.",
  },
  corfe: {
    ministry: [
      "1889년 웨스트민스터 사원에서 초대 조선교구장 주교로 서품 — 영국 성공회의 한국 선교 시작",
      "1890년 동료들과 함께 제물포에 상륙, 강화도를 첫 선교지로 삼아 사역을 폄",
      "서울에 성미카엘교회를 세우고, 서울 두 곳·제물포 한 곳에 병원을 열어 의료선교의 기초를 놓음",
      "영국 해군 군종 출신으로, 요란한 전도보다 의료·교육·기도로 다가가는 절제된 선교를 지향",
    ],
    journey:
      "장로회·감리회가 먼저 들어와 있던 땅에, 성공회는 늦게 그러나 다른 결로 닿았다. 코프는 서두르지 않았다. 강화의 작은 마을에서 병을 고치고 글을 가르치며, 천천히 신뢰를 쌓는 길을 택했다.",
    influence:
      "그가 놓은 강화·서울의 토대 위에 한국 성공회가 자랐고, 의료와 교육을 앞세운 그의 방식은 뒤이은 터너·트롤로프 주교에게로 이어졌다. 한국 교회사에서 자주 가려지지만, 성공회라는 또 하나의 큰 줄기가 이 사람에게서 시작되었다.",
    beauty:
      "해군 군종의 절제와 겸손으로, 자기 이름을 내세우지 않고 한 교파의 첫 길을 묵묵히 닦았다. 1904년 주교직을 내려놓고 조용히 귀국했다.",
  },
  trollope: {
    ministry: [
      "1890년 성공회 선교단의 일원으로 내한, 약 10년간 강화·서울에서 사역",
      "1911년 제3대 조선교구장 주교로 다시 부임 — 세상을 떠날 때까지 한국 성공회를 이끎",
      "왕립아시아학회(RAS) 한국지부 회장을 13년간 맡아 한국의 역사·서지·문화를 깊이 연구",
      "서울 정동에 로마네스크 양식의 주교좌성당(성공회 서울대성당)을 1924년 착공해 세움",
    ],
    journey:
      "트롤로프는 한국을 ‘선교지’이자 ‘연구해야 할 문명’으로 함께 바라본 드문 사람이었다. 그는 한국의 옛 책과 역사를 모으고 읽었고, 그 존중의 마음을 돌과 벽돌로 옮겨 한 채의 성당을 세웠다.",
    influence:
      "그가 세운 서울대성당은 오늘까지 도심 한복판에 남아 한국 성공회의 상징이 되었고, 그의 한국학 연구는 서양이 한국을 학문으로 이해하는 통로가 되었다. 선교와 학문, 신앙과 문화를 함께 끌어안은 자취다.",
    beauty:
      "유럽에서 교회 회의를 마치고 한국으로 돌아오던 길, 입항하던 배가 다른 배와 충돌했고 그 충격으로 그는 1930년 세상을 떠났다. 마지막 순간까지 그의 얼굴은 한국을 향하고 있었다.",
  },
  allen: {
    ministry: [
      "1884년 미국 북장로회 의료선교사로 입국, 주한 미국공사관부 의사 신분으로 활동",
      "갑신정변 때 자상을 입은 민영익을 치료해 고종과 왕실의 깊은 신임을 얻음",
      "1885년 광혜원(곧 제중원) 설립 — 한국 최초의 서양식 국립병원",
      "제중원을 통해 의료와 함께 선교의 합법적 통로를 열어 후속 선교사 입국의 길을 닦음",
      "이후 주미 조선공사관 참찬관·주한 미국공사로 외교 일선에서 활동",
    ],
    journey:
      "선교의 문이 굳게 닫혀 있던 조선에서, 하나님은 ‘의술’을 빗장을 여는 열쇠로 쓰셨다. 알렌의 치료 한 번이 왕실의 마음을 열었고, 그 틈으로 언더우드·아펜젤러를 비롯한 복음의 일꾼들이 들어올 길이 났다.",
    influence:
      "그가 연 제중원은 에비슨의 세브란스로 이어져 한국 근대 의학의 뿌리가 되었고, ‘의료를 통한 신뢰 구축’은 이후 모든 선교부의 본보기가 되었다. 다만 후기에 외교·이권에 깊이 관여하며 선교사의 길과는 갈라지기도 했다.",
  },
  underwood: {
    ministry: [
      "1885년 부활절 제물포 입국(아펜젤러와 동행), 제중원에서 물리·화학을 강의",
      "1887년 새문안교회 설립 — 한국인 14인과 함께 세운 최초의 조직 장로교회",
      "1886년 고아원(경신학교 전신) 설립, 1915년 연희전문학교(현 연세대) 창립",
      "성서번역위원회를 이끌어 한글 신약 번역, 찬송가·전도문서·문법서 편찬",
      "YMCA·기독교서회 등 초교파 연합기관의 기초를 놓고 전국을 순회 전도",
    ],
    journey:
      "로스의 한글 성경이 압록강을 먼저 건너온 그 땅에, 언더우드는 ‘교회·학교·성경’이라는 세 기둥을 함께 세우도록 부름받았다. 그가 놓은 틀은 한 세대 만에 한국 교회가 스스로 서는 토대가 되었다.",
    influence:
      "새문안교회와 연희전문은 한국인 지도자를 길러내는 못자리가 되었고, 서상륜·송순용 등 한국인 동역자와 함께 일하며 ‘한국인의 손으로 서는 교회’를 지향했다. 감리회 아펜젤러와의 교파를 넘은 우정과 협력은 초기 선교 연합의 상징이 되었다.",
  },
  appenzeller: {
    ministry: [
      "1885년 제물포 입국, 배재학당 설립 — 교훈 ‘욕위대자 당위인역(크게 되려는 자는 남을 섬기라)’",
      "1887년 정동제일교회 설립 — 한국 초기 감리교회의 중심",
      "독립신문·서재필 등과 교류하며 근대 계몽운동을 지원",
      "성서번역 사업에 참여, 1902년 번역자 회의로 가던 중 해상사고로 순직",
    ],
    journey:
      "언더우드와 한 배로 들어온 아펜젤러는 ‘교육’을 통해 복음의 씨앗을 뿌렸다. 그의 순직은 한 알의 밀알처럼, 배재의 학생들과 한국 교회 속에서 더 많은 열매로 되살아났다.",
    influence:
      "배재학당에서 이승만·주시경 등 근대 한국을 이끈 인물들이 배출되었고, ‘섬김의 지도자’라는 교훈은 한국 기독교 교육의 정신이 되었다. 자녀 앨리스·헨리도 대를 이어 한국에서 헌신했다.",
  },
  mscranton: {
    ministry: [
      "1885년 아들 윌리엄 스크랜튼과 함께 입국(당시 50대의 나이)",
      "1886년 단 한 명의 학생으로 이화학당을 시작 — 한국 여성 근대교육의 효시",
      "여성을 위한 진료·전도 사업으로 상동·동대문 지역 여성 사역을 확대",
    ],
    journey:
      "‘한 사람의 조선 소녀라도’라는 마음은, 여성에게 배움의 문이 닫혀 있던 시대에 하나님이 여신 새 길이었다. 한 명에서 시작된 이화는 수많은 여성 지도자를 길러내는 강이 되었다.",
    influence:
      "이화학당은 한국 최초의 여성 교육기관으로 김활란을 비롯한 여성 지도자를 배출했고, ‘여성도 하나님의 형상’이라는 복음의 빛이 조선 여성의 지위를 바꾸는 출발점이 되었다.",
  },
  ross: {
    ministry: [
      "1872년부터 만주(영구·심양)에서 스코틀랜드 연합장로회 선교사로 활동",
      "이응찬·서상륜·백홍준 등 한국인 청년들과 함께 성경을 한글로 번역",
      "1882년 누가·요한복음, 1887년 신약 전체 『예수셩교젼서』를 출간",
      "번역 성경을 권서인(매서인)을 통해 국내에 보급",
    ],
    journey:
      "선교사가 입국하기도 전에, 하나님은 ‘말씀’을 먼저 이 땅에 보내셨다. 압록강을 건넌 한글 성경은 서상륜의 고향 소래에 한국인 스스로 세운 첫 교회를 낳았다.",
    influence:
      "번역에 참여한 서상륜·백홍준은 국내 최초의 한국인 전도자가 되었고, ‘성경이 먼저 들어오고 토착 교회가 자생한’ 한국 선교의 독특한 출발을 만들었다. 언더우드·게일의 번역 사업도 그 위에서 이어졌다.",
  },
  moffett: {
    ministry: [
      "1890년 입국, 평양을 거점으로 북장로회 서북 선교를 개척",
      "1901년 평양 장로회신학교 설립 — 한국인 목회자 양성의 산실",
      "1907년 한국 최초 목사 7인 안수, 사경회·네비우스 자립 선교를 적용",
      "숭실학당 등 교육사역을 지원하며 50년 가까이 한국에서 헌신",
    ],
    journey:
      "서울이 외교의 문이었다면 평양은 부흥의 불씨가 타오른 곳이었다. 마포삼열은 그곳에 ‘신학교’를 세워, 선교사가 아니라 한국인 자신이 한국을 복음화하도록 길을 놓았다.",
    influence:
      "그가 세운 평양신학교에서 한국 장로교 목회자 대다수가 배출되었고, 1907년 대부흥과 자립·자전·자치의 토착 교회 원리가 그의 사역 위에서 꽃피었다. 길선주 등 한국인 지도자가 그의 동역자로 일어섰다.",
  },
  avison: {
    ministry: [
      "1893년 입국, 제중원을 인계받아 운영",
      "1904년 세브란스병원, 1908년 세브란스의학교 설립 — 한국 첫 면허 의사 7인 배출",
      "의학 교과서를 한글로 번역하며 한국인 의료인 양성에 집중",
      "연희·세브란스 교장을 겸하여 의학·고등교육의 통합 발전을 이끎",
    ],
    journey:
      "알렌이 연 제중원의 문을, 에비슨은 ‘한국인 의사를 길러내는 학교’로 완성했다. 베푸는 의료에서 한국인이 스스로 치료하는 의료로 — 복음은 자립의 길을 따라 깊어졌다.",
    influence:
      "세브란스에서 배출된 한국인 의사들은 근대 의학과 독립운동의 인재가 되었고(예: 박서양), 의료·교육·신앙을 하나로 묶은 그의 모델은 한국 기독교 사회봉사의 본이 되었다.",
  },
  gale: {
    ministry: [
      "1888년 입국, 부산·원산을 거쳐 서울에서 활동",
      "1897년 『한영자전』 편찬, 성서번역위원회 참여",
      "『천로역정』 한글 번역, 한국 고전을 영역해 한국 문화를 세계에 소개",
      "연동교회 목회와 더불어 한국어·역사 연구에 헌신",
    ],
    journey:
      "복음을 전하려면 그 민족의 말과 마음을 알아야 했다. 게일은 한국어의 깊이를 파고들어 ‘하나님의 말씀을 한국인의 언어로’ 옮기는 다리가 되었다.",
    influence:
      "그의 한영사전과 번역은 이후 모든 선교사의 한국어 학습 토대가 되었고, 한국 문학을 서구에 처음 알린 가교가 되었다. 한글의 가치를 학문적으로 높인 점에서 한국 문화사에도 자취를 남겼다.",
  },
  hulbert: {
    ministry: [
      "1886년 육영공원 교사로 입국",
      "1889년 한글 교과서 『사민필지』 저술 — 한글로 쓴 최초의 세계지리 교과서",
      "한글의 우수성을 국내외에 알리고 한국학을 연구",
      "1907년 헤이그 특사 지원 등 독립운동을 도와 일제에 의해 추방됨",
    ],
    journey:
      "헐버트는 복음과 함께 ‘한글’의 가치를 일깨운 사람이었다. 한국인이 자기 글로 배우고 깨우치게 한 그의 사역은, 민족의 자존과 신앙이 함께 자라는 토양을 만들었다.",
    influence:
      "“한국인보다 한국을 더 사랑한” 그는 한글 보급과 독립운동으로 한국인의 마음에 깊이 새겨졌고, “웨스트민스터보다 한국 땅에 묻히기 원한다”는 유언대로 양화진에 안장되었다.",
  },
  rosetta: {
    ministry: [
      "1890년 여의사로 입국, 보구녀관(여성병원)에서 진료",
      "남편 윌리엄 제임스 홀과 딸을 한국에서 잃고도 남아 사역",
      "1900년 평양에 한국 최초 맹인학교 설립, 한글 점자를 고안",
      "여성 의학교육(경성여자의학강습소)을 추진해 한국 여성 의사 양성의 길을 엶",
    ],
    journey:
      "남편과 딸을 이 땅에 묻은 슬픔조차, 하나님은 가장 약한 자—여성과 장애인—를 향한 사랑으로 바꾸셨다. 그녀의 눈물은 맹인학교의 점자와 여성 병원의 등불이 되었다.",
    influence:
      "한국 최초의 맹인·농아 교육과 여성 의학교육의 길을 열었고, 아들 셔우드 홀(크리스마스 실)과 더불어 3대에 걸친 홀 가문의 헌신을 한국에 남겼다. 그녀가 기른 박에스더는 한국 최초의 여의사가 되었다.",
  },
  wjhall: {
    ministry: [
      "1891년 입국, 평양에서 의료 선교를 개척",
      "빈민·환자를 돌보며 평양 선교의 기초를 놓음",
      "1894년 청일전쟁 중 부상병·환자를 돌보다 발진티푸스로 순직(34세)",
    ],
    journey:
      "평양의 복음은 한 의사의 이른 죽음 위에 세워졌다. 짧았던 그의 사역은 한 알의 밀알이 되어, 아내 로제타와 아들 셔우드의 평생 헌신으로 이어졌다.",
    influence:
      "그의 순직은 평양 기독교 공동체에 깊은 인상을 남겼고, 홀 가문이 대를 이어 한국 의료선교에 헌신하는 출발점이 되었다. 그를 기린 기홀병원은 평양 의료의 중심이 되었다.",
  },
  eugenebell: {
    ministry: [
      "1895년 남장로회 선교사로 입국, 목포에서 선교를 시작",
      "1904년 광주로 거점을 확장 — 호남(광주·전남) 선교의 개척자",
      "교회·학교·병원을 함께 세우는 양림동 선교기지를 구축",
      "사위 린튼(인돈) 등으로 이어지는 호남 선교 가문의 출발점",
    ],
    journey:
      "서울·평양에서 시작된 복음이 남쪽 호남으로 흘러갈 때, 하나님은 배유지를 그 물길의 첫 통로로 쓰셨다. 그가 광주 양림동에 세운 선교기지는 호남 기독교의 어머니 품이 되었다.",
    influence:
      "그가 개척한 광주·목포 선교부에서 수많은 교회와 학교(수피아·숭일)가 자라났고, 후손과 동역자(오웬·서서평·린튼)로 이어진 헌신은 오늘날 유진벨재단의 대북 인도지원으로도 흐른다.",
  },
  junkin: {
    ministry: [
      "1892년 남장로회 ‘7인 선발대’의 한 사람으로 입국",
      "군산을 중심으로 호남 선교를 개척, 1896년 군산 교회·학교 설립",
      "전주에서도 사역하며 호남 교회의 기초를 놓음, 1908년 과로로 별세",
    ],
    journey:
      "호남의 들녘에 복음의 첫 고랑을 낸 사람이 전위렴이었다. 그의 이른 죽음과 자녀들의 무덤(전주 선교사묘역)은, 이 땅에 묻힌 씨앗이 되어 호남 교회의 추수로 되살아났다.",
    influence:
      "그가 세운 군산·전주 선교부는 호남 기독교의 거점이 되었고, 영명학교 등에서 한국인 지도자가 길러졌다. 7인 선발대의 헌신은 남장로회 호남 선교 전체의 출발점이었다.",
  },
  gilseonju: {
    ministry: [
      "평양 장대현교회를 이끈 한국인 목회자",
      "1907년 한국 장로교 최초 목사 7인 중 한 사람으로 안수",
      "1907년 평양 대부흥운동을 주도 — 공개적 회개와 새벽기도의 불씨",
      "1919년 3·1운동 민족대표 33인의 한 사람",
    ],
    journey:
      "선교사들이 뿌린 씨앗이 한국인 자신의 손에서 불길로 타오른 자리에 길선주가 있었다. 그의 회개와 기도는 외래 종교였던 복음을 ‘한국인의 신앙’으로 바꾼 분수령이 되었다.",
    influence:
      "그가 시작한 새벽기도와 통성기도는 한국 교회의 영적 전통이 되었고, 1907년 대부흥은 한국 교회의 자립과 성장의 원천이 되었다. 민족대표로서 그는 신앙과 민족애를 하나로 보여주었다.",
  },
  leegipung: {
    ministry: [
      "1907년 한국 최초 목사 7인 중 한 사람으로 안수",
      "1908년 제주에 파송 — 한국 교회의 첫 ‘국내 타지역 선교사’",
      "척박한 제주에서 박해를 견디며 교회를 세우고 복음을 전함",
    ],
    journey:
      "복음을 ‘받은’ 한국 교회가 곧바로 복음을 ‘보내는’ 교회가 되었음을, 이기풍의 제주 파송이 증언한다. 받은 은혜가 곧 흘려보내는 사랑이 되는 — 선교의 순환이 그에게서 시작되었다.",
    influence:
      "그의 제주 선교는 한국 교회 자발적 선교운동의 상징이 되었고, 변방까지 복음이 닿게 한 모범이 되었다. 박해 속에서도 교회를 일군 그의 헌신은 제주 기독교의 뿌리가 되었다.",
  },
  schofield: {
    ministry: [
      "1916년 세브란스 의학전문학교 세균학·위생학 교수로 입국",
      "1919년 3·1운동의 실상(제암리 학살 등)을 사진·기록으로 해외에 증언 — ‘34번째 민족대표’",
      "일제의 압박으로 추방된 뒤에도 한국 독립과 인권을 변호",
      "광복 후 1958년 영구 귀환, 신생 대한민국의 부패·불의를 비판하며 청년 교육에 헌신",
    ],
    journey:
      "하나님은 한 외국인 학자의 양심을 통해, 침묵당한 조선의 절규를 세계에 들려주셨다. 그의 카메라와 펜은 불의의 어둠 속에서 진실을 비춘 빛이었다.",
    influence:
      "그의 증언은 3·1운동을 국제사회에 알린 결정적 통로가 되었고, 광복 후에도 한국 사회의 양심으로 남았다. 외국인 최초로 국립서울현충원에 안장되어, 한국인이 가장 사랑하는 벽안의 독립유공자가 되었다.",
  },
  baird: {
    ministry: [
      "1891년 입국, 부산·대구를 거쳐 평양에 정착",
      "1897년 숭실학당 설립, 1906년 숭실대학으로 발전 — 한국 최초의 근대 대학",
      "기독교 인재 양성과 한국어 교육에 헌신",
    ],
    journey:
      "평양에 신학교(마포삼열)와 대학(베어드)이 나란히 세워진 것은 우연이 아니었다. 복음은 영혼만이 아니라 지성까지 깨우며, 한국 근대 고등교육의 문을 열었다.",
    influence:
      "숭실은 신앙과 학문을 겸비한 민족 지도자를 길러냈고, 신사참배를 거부하며 자진 폐교(1938)할 만큼 신앙의 지조를 지켰다. 그가 놓은 기독교 대학교육의 모범은 한국 교육사에 깊은 자취를 남겼다.",
  },
  shepping: {
    ministry: [
      "1912년 독일 태생 미국 간호선교사로 광주에 입국",
      "여성·고아·한센병 환자·과부를 돌보며 가장 낮은 자들 곁에서 사역",
      "1923년 조선간호부회(현 대한간호협회) 창립, 간호 전문교육을 시작",
      "이일학교(여성교육)를 세우며 ‘성공이 아니라 섬김’의 삶을 살아냄",
    ],
    journey:
      "가장 약한 자를 품는 것이 복음의 심장임을, 서서평은 자기 삶으로 증명했다. 버려진 여성과 한센인을 딸로 삼은 그녀의 사랑은, 광주 땅에 그리스도의 긍휼을 새겼다.",
    influence:
      "한국 간호계의 기틀을 놓았고, 여러 양딸과 수많은 고아를 거둔 그녀의 삶은 ‘한국의 어머니’로 불린다. 별세 후 광주 최초의 시민장으로 치러졌고, “성공이 아니라 섬김”이라는 유산은 오늘도 회자된다.",
  },
  owen: {
    ministry: [
      "1898년 의사이자 목사로 목포에서 의료 선교를 시작",
      "1904년 광주로 사역을 확장, 진료와 복음 전도를 병행",
      "1909년 순회전도 중 과로·폐렴으로 순직, 광주 양림동 묘역에 처음 안장됨",
    ],
    journey:
      "광주 선교의 첫 무덤이 오기원이었다. 의술과 말씀을 함께 들고 농촌을 누빈 그의 헌신은, 한 알의 밀알이 되어 양림동을 호남 복음의 못자리로 만들었다.",
    influence:
      "그를 기려 세운 오웬기념각은 광주 선교기지의 상징이 되었고, 그의 순직은 동료 선교사들(유진 벨·서서평)의 헌신을 더욱 굳게 했다. 양림동 묘역의 첫 안장자로서 호남 선교사들의 ‘디딤돌’이 되었다.",
  },
  hardie: {
    ministry: [
      "1890년 의료선교사로 입국, 부산·원산에서 사역",
      "1903년 원산에서 자신의 영적 무능과 교만을 공개적으로 회개 — 한국 부흥운동의 도화선",
      "그 회개가 1907년 평양 대부흥으로 확산",
      "남감리회 선교와 성결·부흥 사역에 헌신",
    ],
    journey:
      "부흥은 선교사 자신의 회개에서 시작되었다. 하디가 한국인 앞에서 무릎 꿇은 그 낮아짐을, 하나님은 한국 교회 전체를 깨우는 불씨로 삼으셨다.",
    influence:
      "그의 원산 회개는 1907년 평양 대부흥의 영적 출발점이 되었고, 공개적 회개와 성령 체험의 부흥 전통을 한국 교회에 심었다. 선교사와 한국인이 함께 회개한 그 자리에서, 한국 교회는 토착적 영성을 얻었다.",
  },
  sherwoodhall: {
    ministry: [
      "서울 출생 선교사 2세, 1926년 의료선교사로 귀환",
      "1928년 해주 구세요양원(결핵 요양원) 설립",
      "1932년 한국 최초 크리스마스 씰 발행 — 결핵 퇴치 기금 마련",
      "회고록 『조선회상(With Stethoscope in Asia: Korea)』 저술",
    ],
    journey:
      "부모(윌리엄·로제타 홀)가 평양에 묻은 헌신의 씨앗은, 조선에서 태어난 아들을 통해 결핵과 싸우는 사랑으로 다시 피어났다. 홀 가문 3대의 헌신이 그에게서 맺은 열매였다.",
    influence:
      "그가 시작한 크리스마스 씰은 오늘날까지 한국 결핵 퇴치 운동의 상징으로 이어지고, 해주 요양원은 한국 결핵 의료의 선구가 되었다.",
  },
  leesujeong: {
    ministry: [
      "1882년 수신사 일행으로 일본행, 1883년 도쿄에서 세례",
      "현토(懸吐) 마가복음 번역",
      "미국 선교부에 조선 선교를 호소하는 편지 발송",
    ],
    journey:
      "복음이 조선에 들어오기 전, 하나님은 한 조선 지식인의 회심을 통해 길을 예비하셨다. 그가 번역한 성경과 호소의 편지가 언더우드·아펜젤러를 조선으로 불러들였다.",
    influence:
      "언더우드·아펜젤러는 그가 번역한 마가복음을 손에 들고 제물포에 내렸다. 한국인 자신이 선교사를 ‘청한’ 이 독특한 출발은, 한국 교회가 처음부터 토착적 주체성을 지녔음을 보여준다.",
  },
  william: {
    ministry: [
      "1885년 어머니 메리와 함께 입국, 정동에 시(施)병원 개원",
      "1888년 상동으로 병원 이전, 도시 빈민·민중 선교",
      "상동교회를 중심으로 가난한 이들 곁의 사역",
    ],
    journey:
      "어머니가 여성 교육의 문을 열 때, 아들은 가장 가난한 도시 민중에게로 내려갔다. 복음이 위로뿐 아니라 낮은 곳을 향함을 그의 시병원이 증언했다.",
    influence:
      "상동교회와 시병원은 도시 빈민 선교와 민족운동의 거점(상동청년회)이 되었고, 그의 민중 지향 사역은 한국 교회의 사회적 책임 전통에 자취를 남겼다.",
  },
  heron: {
    ministry: [
      "1885년 입국, 제중원 합류",
      "1887년 제중원 2대 원장 취임",
      "헌신적 진료 끝에 1890년 이질로 순직",
    ],
    journey:
      "양화진 외국인 묘원의 첫 무덤이 헤론이었다. 그의 이른 죽음은, 이후 이 땅에 묻힐 수많은 선교사들의 헌신을 여는 첫 디딤돌이 되었다.",
    influence:
      "양화진 묘원의 시작점으로서 그의 순직은 선교 공동체에 깊은 울림을 주었고, 제중원의 의료 사역이 에비슨에게로 이어지는 다리가 되었다.",
  },
  seo: {
    ministry: [
      "1879년 만주에서 로스를 만나 입교",
      "1882년 로스역 성경 번역에 동참(권서)",
      "1884년 황해 소래에 한국인 손으로 첫 교회 설립",
    ],
    journey:
      "선교사보다 먼저, 한국인 권서가 성경을 품고 압록강을 건넜다. 서상륜을 통해 복음은 ‘한국인이 한국인에게’ 전하는 자생적 길로 이 땅에 뿌리내렸다.",
    influence:
      "그가 세운 소래교회는 한국인 자생 교회의 효시가 되었고, 언더우드가 세례를 베풀 첫 신자들을 예비했다. ‘먼저 믿은 한국인이 교회를 세운’ 그의 발자취는 한국 교회 주체성의 상징이다.",
  },
  bunker: {
    ministry: [
      "1886년 육영공원 교사로 입국",
      "배재학당 운영 참여, 영어·근대 교육",
      "여의사 애니 엘러스와 결혼해 동역",
    ],
    journey:
      "왕립 영어학교(육영공원)의 교사로 들어온 벙커는, 근대 교육을 통해 복음의 길을 닦았다. 나라가 인재를 찾던 때에, 그 인재를 신앙으로 길렀다.",
    influence:
      "그가 가르친 배재·육영공원의 학생들은 근대 한국의 지도자로 자랐고, 아내 애니와 함께한 교육·의료 사역은 부부 선교의 본이 되었다.",
  },
  annie: {
    ministry: [
      "1886년 여의사로 입국",
      "1887년 명성황후의 시의(侍醫)로 활동",
      "정신여학교의 기틀을 놓음",
    ],
    journey:
      "궁궐 깊은 곳 왕비의 곁까지, 하나님은 한 여의사를 보내 여성의 손길로 신뢰를 쌓게 하셨다. 의료가 닫힌 문을 여는 또 하나의 열쇠였다.",
    influence:
      "명성황후의 시의로서 왕실과 선교의 신뢰를 이었고, 정신여학교는 한국 여성 교육의 한 축이 되었다. 남편 벙커와 함께 교육·의료에 평생 헌신했다.",
  },
  lillias: {
    ministry: [
      "1888년 여의사로 입국, 명성황후 진료",
      "1889년 언더우드와 결혼, 전국 순회전도 동행",
      "회고록 등 기록으로 초기 선교를 증언",
    ],
    journey:
      "언더우드의 사역 곁에는 의술과 글로 함께 길을 낸 동역자가 있었다. 부부가 한 마음으로 산골과 궁궐을 누빈 그 발걸음에 복음이 실렸다.",
    influence:
      "그녀의 진료는 왕실과의 신뢰를, 회고록은 초기 선교의 생생한 기록을 남겼다. 부부 선교사의 동역 모델을 보여준 인물이다.",
  },
  reynolds: {
    ministry: [
      "1892년 입국, 호남 선교",
      "1902년 성서번역위원회 참여",
      "구약 번역을 주도해 한글 성경 완성에 기여",
    ],
    journey:
      "호남의 들에서 복음을 전하던 손이, 동시에 구약을 한글로 옮기는 펜을 들었다. 말씀이 온전히 한국어로 새겨지는 일에 그의 30년이 바쳐졌다.",
    influence:
      "그의 구약 번역은 1911년 한글 성경 완간의 핵심 기여였고, 평양신학교에서 후학을 길렀다. 호남 선교와 성경 번역을 잇는 다리였다.",
  },
  seogyeongjo: {
    ministry: [
      "1884년 형 서상륜과 소래교회 설립",
      "황해·서북 지역 전도",
      "1907년 첫 한국인 목사 7인 중 한 사람으로 안수",
    ],
    journey:
      "형이 뿌린 소래의 씨앗을 동생이 목회로 키웠다. 한국인 손으로 세운 교회가 한국인 목사를 길러내는 자생의 순환이 서씨 형제에게서 이루어졌다.",
    influence:
      "첫 한국인 목사 7인의 한 사람으로서 한국 장로교 자립의 상징이 되었고, 소래교회는 한국 교회의 모교회로 기억된다.",
  },
  kimchangsik: {
    ministry: [
      "감리회 권서·전도인으로 출발",
      "1901년 한국 감리교 첫 목사로 안수",
      "평양·서북 지역 전도에 헌신",
    ],
    journey:
      "짐꾼·권서로 복음을 나르던 한 한국인이, 한국 감리교의 첫 목사가 되었다. 낮은 자리에서 부름받아 한국인 목회의 문을 연 그의 삶은 복음의 역설을 증언한다.",
    influence:
      "‘한국 감리교의 사도 바울’로 불리며 서북 지역 교회 성장을 이끌었고, 한국인 목회자 시대의 첫 장을 열었다.",
  },
  hhunderwood: {
    ministry: [
      "1912년부터 연희전문 교육 참여",
      "1934년 연희전문 교장",
      "광복 후 미군정·신생 대한민국 교육 재건 자문",
    ],
    journey:
      "아버지 언더우드가 세운 연희를, 조선에서 태어난 아들이 이어 지켰다. 2대에 걸친 헌신이 한국 고등교육의 연속성을 지탱했다.",
    influence:
      "연희전문을 일제강점기 내내 지키고 광복 후 재건을 도왔으며, 한국학 연구에도 기여했다. 언더우드 가문 4대 한국 헌신의 한 고리다.",
  },
  linton: {
    ministry: [
      "1912년 호남(군산·전주·대전) 선교 시작",
      "교육 사역 — 훗날 대전 대학(한남대) 설립으로 이어짐",
      "1940년 신사참배 거부로 추방, 1946년 복귀해 교육 재건",
    ],
    journey:
      "유진 벨의 사위로 호남 선교 가문을 이은 인돈은, 신앙의 지조를 위해 추방을 감수했다. 떠났다 다시 돌아온 그 발걸음에 한국을 향한 변치 않는 사랑이 있었다.",
    influence:
      "신사참배 거부로 신앙 양심의 본을 보였고, 광복 후 대전에 대학(한남대)을 세워 호남·충청 기독교 교육의 토대를 놓았다. 린튼 가문 4대 한국 헌신으로 이어졌다.",
  },
  bruen_martha: {
    ministry: [
      "1899년 대구에서 여성 교육 시작",
      "1907년 신명여학교 설립",
      "대구 여성 근대교육의 선구",
    ],
    journey:
      "영남의 보수적 토양에서 여성에게 배움의 문을 연 것은 한 선교사 부인의 헌신이었다. 대구 동산에 묻힌 그녀의 삶이 영남 여성 교육의 뿌리가 되었다.",
    influence:
      "신명여학교는 대구·경북 여성 교육의 요람이 되었고, 동산 은혜의 정원에 안장되어 영남 선교의 역사를 증언한다.",
  },
  switzer: {
    ministry: [
      "1911년 대구에서 여성 교육",
      "1922년 대구여자성경학교 설립",
      "여성 성경교육·전도",
    ],
    journey:
      "가르치는 손길로 영남 여성들에게 말씀을 심은 그녀는, 대구 동산에 일찍이 안장된 선교사로 전해진다. 그 무덤이 영남 선교의 디딤돌이 되었다.",
    influence:
      "대구여자성경학교는 여성 전도인·교사를 길러냈고, 동산 묘역의 역사와 함께 영남 여성 신앙교육의 자취를 남겼다.",
  },
  davis: {
    ministry: [
      "1892년 남장로회 첫 내한 선교사",
      "전주·호남 사역",
      "1903년 별세, 전주 선교사묘역 안장(7인 선발대 중 첫 별세)",
    ],
    journey:
      "남장로회 호남 선교의 첫 발을 디딘 이가 한 여성이었다. 가장 먼저 이 땅에 묻힌 그녀의 헌신이, 호남 복음의 첫 이랑을 갈았다.",
    influence:
      "7인 선발대의 일원이자 첫 별세자로서 호남 선교의 출발을 상징하며, 전주 선교사묘역의 역사를 연 인물이다.",
  },
  rankin: {
    ministry: [
      "1907년 전주에서 교육 선교",
      "1908년 기전여학교 교장",
      "1911년 별세, 전주 선교사묘역 안장",
    ],
    journey:
      "전주의 소녀들에게 배움과 신앙을 심다 짧은 생을 마친 그녀는, 호남 땅에 묻혀 여성 교육의 씨앗이 되었다.",
    influence:
      "기전여학교는 전주 여성 교육의 중심이 되었고, 그녀의 헌신은 호남 여성 신앙교육의 초석으로 기억된다.",
  },
  preston: {
    ministry: [
      "1903년 목포·전남에서 사역",
      "1913년 순천선교부 설립",
      "순천 매산학교·알렉산더병원 등 교육·의료 거점 구축",
    ],
    journey:
      "유진 벨과 함께 호남 복음을 전남 동부로 넓힌 이가 변요한이었다. 순천 매산등에 세운 교회·학교·병원이 전남 동부 기독교의 못자리가 되었다.",
    influence:
      "순천선교부는 전남 동부 선교의 거점이 되었고, 매산학교는 지역 인재를 길러냈다. 그가 일군 순천 선교유적은 오늘날 세계유산 등재가 추진되는 근대 선교기지의 핵심이다.",
  },
};

// 검증된 1차 자료 인용(편지·일기·묘비명). 리서치로 출처 확인된 것만.
// ※언더우드의 "주여 지금은 아무것도…" 기도문은 1984년 정연희 소설의 창작(위작)으로
//   확인되어 본인의 말로 절대 싣지 않는다.
const QUOTES: Record<string, { text: string; source: string }> = {
  hulbert: {
    text: "나는 웨스트민스터 사원보다 한국 땅에 묻히기를 원하노라.",
    source: "“I would rather be buried in Korea than in Westminster Abbey.” — 1949년 귀환 소감 · 양화진 묘비",
  },
  appenzeller: {
    text: "오늘 무덤의 빗장을 부수신 그분께서, 이 한국 백성에게 빛과 자유를 가져다주시기를.",
    source: "1885년 부활절 제물포 도착일의 기도 · W. E. Griffis, A Modern Pioneer in Korea(1912)",
  },
  kendrick: {
    text: "나에게 천 개의 생명이 있다면, 그 모두를 한국에 바치리라.",
    source: "“If I had a thousand lives to give, Korea should have them all.” — 양화진 묘비명(1908)",
  },
  mscranton: {
    text: "우리 학교는 무엇보다도, 조선 소녀를 더 나은 조선 소녀로 길러내는 학교입니다.",
    source: "이화학당 연례보고(미감리회 여선교부, 1895–96) · ※널리 퍼진 ‘한 사람의 조선 소녀라도’는 출처 불명 의역",
  },
  shepping: {
    text: "성공이 아니라 섬김.",
    source: "“Not success, but service.” — 서서평의 좌우명(전승) · 백춘성 『천국에서 만납시다』(1980)",
  },
  moffett: {
    text: "이 사람들에게 참된 행복이 전혀 없다는 것 — 이들이 복음을 절실히 필요로 한다는 첫인상을, 시간이 갈수록 지울 수 없었다.",
    source: "1890년 내한 직후 북장로교 해외선교부에 보낸 첫 보고",
  },
  avison: {
    text: "나는 이 서양 의학을 한국말로 가르쳐야 한다고 결정했다.",
    source: "에비슨 회고록(Memoirs of Life in Korea)",
  },
  gale: {
    text: "정치적으로 한국은 보잘것없으나, 선교의 영역에서는 일류 강국이다.",
    source: "James S. Gale, Korea in Transition(1909) 서문",
  },
  rosetta: {
    text: "한국의 맹인과 농아의 처지는 참으로 가련하다.",
    source: "평양 맹·농아 교육에 관하여 · The Silent Worker(1910)",
  },
  heron: {
    text: "하나님의 아들이 나를 사랑하사, 나를 위하여 자기 자신을 버리셨느니라.",
    source: "양화진 묘비명(갈라디아서 2:20) · 양화진 외국인선교사묘원 최초 안장자",
  },
  bunker: {
    text: "날이 새고 그림자가 사라질 때까지.",
    source: "“Until the day break, and the shadows flee away.”(아가 2:17) · 양화진 묘비명",
  },
  gilseonju: {
    text: "나는 아간과 같은 죄인이올시다.",
    source: "1907년 평양 장대현교회 사경회 공개 회개 · W. N. Blair, The Korean Pentecost · 박용규 『평양대부흥운동사』",
  },
  kimchangsik: {
    text: "하나님이 내 죄를 용서하셨거늘 내 어찌 그분을 저주하며, 외국인이 내게 정당한 삯을 주었거늘 내 어찌 그를 버리겠소?",
    source: "1894년 평양 박해 중 신앙 고백(‘조선의 바울’) · H. G. Appenzeller, Korea Mission of the M.E. Church, pp.28–29의 영문 기록을 옮김",
  },
  underwood: {
    text: "우리는 그분의 교회가 무(無)에서 십만이 넘는 신자의 무리로 자라나는 것을 보았습니다.",
    source: "“We have seen His Church grow from nothing to a body of believers over one hundred thousand strong.” — Horace G. Underwood, The Call of Korea(1908) 서문",
  },
  schofield: {
    text: "나는 ‘캐나다인’이라기보다 ‘조선인’이라고 생각됩니다.",
    source: "1931년 성탄절 공개 서한 · 한국독립운동정보시스템 독립운동인명사전(i815.or.kr)",
  },
  allen: {
    text: "슬픈 점은, 그들이 가장 어려울 때 우리가 그들을 저버렸다는 것이다.",
    source: "“…we deserted them in their time of need.” — Horace N. Allen, Things Korean(1908) 서문, 을사늑약(1905) 후 미국의 조선 외면을 두고",
  },
};

// 인물별 검증된 권위 참고 사료 링크(한국민족문화대백과·위키 등). 리서치로 인물 일치 확인된 것만.
const REFS: Record<string, { title: string; url: string; publisher?: string }[]> = {
  "jones": [
    {
      "title": "George Heber Jones — Wikipedia",
      "url": "https://en.wikipedia.org/wiki/George_Heber_Jones",
      "publisher": "English Wikipedia"
    },
    {
      "title": "교산교회 — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0076692",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "The Korea mission of the Methodist Episcopal Church (1910) — 원저 G. H. Jones",
      "url": "https://archive.org/details/koreamissionofme00jone",
      "publisher": "Internet Archive"
    }
  ],
  "anniebaird": [
    {
      "title": "Annie Laurie Adams Baird — Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Annie_Laurie_Adams_Baird",
      "publisher": "English Wikipedia"
    },
    {
      "title": "Daybreak in Korea (1909) — 원저 Annie L. A. Baird",
      "url": "https://archive.org/details/daybreakinkoreat00bair",
      "publisher": "Internet Archive"
    },
    {
      "title": "Annie Laurie Adams Baird Papers — Presbyterian Historical Society",
      "url": "https://www.history.pcusa.org/collections/research-tools/guides-archival-collections/rg-172",
      "publisher": "Presbyterian Church (U.S.A.)"
    }
  ],
  "corfe": [
    {
      "title": "Charles John Corfe — Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Charles_John_Corfe",
      "publisher": "English Wikipedia"
    },
    {
      "title": "찰스 존 코프 — 나무위키",
      "url": "https://namu.wiki/w/찰스 존 코프",
      "publisher": "나무위키"
    },
    {
      "title": "대한성공회의 역사",
      "url": "https://www.skh.or.kr/3",
      "publisher": "대한성공회"
    }
  ],
  "trollope": [
    {
      "title": "Mark Trollope — Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Mark_Trollope",
      "publisher": "English Wikipedia"
    },
    {
      "title": "Mark Napier Trollope — National Portrait Gallery",
      "url": "https://www.npg.org.uk/collections/search/person/mp135715/mark-napier-trollope",
      "publisher": "National Portrait Gallery"
    },
    {
      "title": "The Church in Corea (1915) — 원저 M. N. Trollope",
      "url": "https://open.bu.edu/handle/2144/1075",
      "publisher": "Boston University"
    }
  ],
  "allen": [
    {
      "title": "호러스 뉴턴 알렌 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/호러스_뉴턴_알렌",
      "publisher": "한국어 위키백과"
    },
    {
      "title": "호러스 알렌 — 디지털미추홀구문화대전",
      "url": "https://michuhol.grandculture.net/michuhol/toc/GC04700680",
      "publisher": "한국향토문화전자대전"
    }
  ],
  "underwood": [
    {
      "title": "호러스 그랜트 언더우드 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/호러스_그랜트_언더우드",
      "publisher": "한국어 위키백과"
    }
  ],
  "appenzeller": [
    {
      "title": "헨리 아펜젤러 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/헨리_아펜젤러",
      "publisher": "한국어 위키백과"
    }
  ],
  "mscranton": [
    {
      "title": "메리 스크랜튼 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/메리_스크랜튼",
      "publisher": "한국어 위키백과"
    },
    {
      "title": "이화학당 — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0046618",
      "publisher": "한국학중앙연구원"
    }
  ],
  "sherwoodhall": [
    {
      "title": "셔우드 홀 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/셔우드_홀_(1893년)",
      "publisher": "한국어 위키백과"
    }
  ],
  "ross": [
    {
      "title": "존 로스 (선교사) — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/존_로스_(선교사)",
      "publisher": "한국어 위키백과"
    },
    {
      "title": "예수성교전서(존 로스 번역) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0037972",
      "publisher": "한국학중앙연구원"
    }
  ],
  "leesujeong": [
    {
      "title": "이수정(李樹廷) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0044856",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "이수정 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/이수정_(1842년)",
      "publisher": "한국어 위키백과"
    }
  ],
  "william": [
    {
      "title": "윌리엄 스크랜턴 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/윌리엄_스크랜턴",
      "publisher": "한국어 위키백과"
    }
  ],
  "heron": [
    {
      "title": "존 헤론 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/존_헤론",
      "publisher": "한국어 위키백과"
    }
  ],
  "seo": [
    {
      "title": "서상륜(徐相崙) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0027845",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "서상륜 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/서상륜",
      "publisher": "한국어 위키백과"
    }
  ],
  "rosetta": [
    {
      "title": "로제타 셔우드 홀 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/로제타_셔우드_홀",
      "publisher": "한국어 위키백과"
    }
  ],
  "moffett": [
    {
      "title": "새뮤얼 오스틴 모펫 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/새뮤얼_오스틴_모펫",
      "publisher": "한국어 위키백과"
    }
  ],
  "baird": [
    {
      "title": "윌리엄 M. 베어드 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/윌리엄_M._베어드",
      "publisher": "한국어 위키백과"
    }
  ],
  "avison": [
    {
      "title": "올리버 R. 에이비슨 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/올리버_R._에이비슨",
      "publisher": "한국어 위키백과"
    }
  ],
  "gale": [
    {
      "title": "제임스 게일 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/제임스_게일",
      "publisher": "한국어 위키백과"
    }
  ],
  "hulbert": [
    {
      "title": "호머 헐버트 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/호머_헐버트",
      "publisher": "한국어 위키백과"
    },
    {
      "title": "사민필지(헐버트 저술) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0025620",
      "publisher": "한국학중앙연구원"
    }
  ],
  "bunker": [
    {
      "title": "내한선교사 Bunker, Dalziel A. — 한국기독교사연구소",
      "url": "https://www.kich.org/bbs/view.html?idxno=2855",
      "publisher": "한국기독교사연구소"
    }
  ],
  "annie": [
    {
      "title": "명성황후 주치의 애니 엘러스 선교사",
      "url": "https://www.bonhd.net/news/articleView.html?idxno=12026",
      "publisher": "본헤럴드"
    }
  ],
  "lillias": [
    {
      "title": "릴리어스 호턴 언더우드 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/릴리어스_호턴_언더우드",
      "publisher": "한국어 위키백과"
    }
  ],
  "wjhall": [
    {
      "title": "William James Hall — Wikipedia",
      "url": "https://en.wikipedia.org/wiki/William_James_Hall",
      "publisher": "Wikipedia"
    }
  ],
  "hardie": [
    {
      "title": "로버트 A. 하디 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/로버트_A._하디",
      "publisher": "한국어 위키백과"
    },
    {
      "title": "내한선교사 Hardie, Robert A. — 한국기독교사연구소",
      "url": "https://www.kich.org/news/articleView.html?idxno=10366",
      "publisher": "한국기독교사연구소"
    }
  ],
  "eugenebell": [
    {
      "title": "배유지(Eugene Bell) — 디지털광주문화대전",
      "url": "https://www.grandculture.net/gwangju/toc/GC60001996",
      "publisher": "한국학중앙연구원"
    }
  ],
  "junkin": [
    {
      "title": "‘호남 선교의 초석’ 윌리엄 전킨 선교사의 생애",
      "url": "https://www.christiantoday.co.kr/news/341057",
      "publisher": "크리스천투데이"
    }
  ],
  "reynolds": [
    {
      "title": "윌리엄 데이비스 레이놀즈 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/윌리엄_데이비스_레이놀즈",
      "publisher": "한국어 위키백과"
    },
    {
      "title": "내한선교사 Reynolds, William Davis — 한국기독교사연구소",
      "url": "https://www.kich.org/news/articleView.html?idxno=10547",
      "publisher": "한국기독교사연구소"
    }
  ],
  "gilseonju": [
    {
      "title": "길선주(吉善宙) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0008542",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "길선주 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/길선주",
      "publisher": "한국어 위키백과"
    }
  ],
  "leegipung": [
    {
      "title": "이기풍(李基豊) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0043886",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "이기풍 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/이기풍",
      "publisher": "한국어 위키백과"
    }
  ],
  "seogyeongjo": [
    {
      "title": "서경조 (목회자) — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/서경조_(목회자)",
      "publisher": "한국어 위키백과"
    }
  ],
  "kimchangsik": [
    {
      "title": "김창식(金昌植) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0010708",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "김창식 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/김창식_(1857년)",
      "publisher": "한국어 위키백과"
    }
  ],
  "schofield": [
    {
      "title": "프랭크 스코필드 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/프랭크_스코필드",
      "publisher": "한국어 위키백과"
    }
  ],
  "hhunderwood": [
    {
      "title": "호러스 호턴 언더우드 — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/호러스_호턴_언더우드",
      "publisher": "한국어 위키백과"
    }
  ],
  "linton": [
    {
      "title": "윌리엄 린튼(인돈) — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/윌리엄_린튼",
      "publisher": "한국어 위키백과"
    }
  ],
  "owen": [
    {
      "title": "오기원(클레멘트 오웬) — 광주 인문스토리플랫폼",
      "url": "https://dh.aks.ac.kr/~gwangju/wiki/index.php/오기원",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "오웬기념각 — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0067276",
      "publisher": "한국학중앙연구원"
    }
  ],
  "shepping": [
    {
      "title": "서서평(엘리자베스 셰핑) — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/서서평",
      "publisher": "한국어 위키백과"
    }
  ],
  "bruen_martha": [
    {
      "title": "마사 스콧 브루언(부마태) — 대구역사문화대전",
      "url": "https://www.grandculture.net/daegu/toc/GC40008142",
      "publisher": "한국학중앙연구원"
    }
  ],
  "switzer": [
    {
      "title": "선교사 스윗즈 주택(Martha Switzer) — 한국민족문화대백과사전",
      "url": "https://encykorea.aks.ac.kr/Article/E0028623",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "내한선교사 Switzer, Martha(성마리태) — 한국기독교사연구소",
      "url": "http://www.kich.org/bbs/view.html?idxno=2806",
      "publisher": "한국기독교사연구소"
    }
  ],
  "davis": [
    {
      "title": "리니 데이비스 — 남장로교의 한국선교",
      "url": "https://kmhistory.com/pioneers-2/davis/",
      "publisher": "남장로교의 한국선교"
    }
  ],
  "rankin": [
    {
      "title": "넬리 랭킨(나은희) 선교사",
      "url": "https://www.kidok.com/news/articleView.html?idxno=60778",
      "publisher": "주간기독신문"
    }
  ],
  "preston": [
    {
      "title": "변요한(John F. Preston) — 디지털순천문화대전",
      "url": "http://suncheon.grandculture.net/suncheon/toc/GC07600673",
      "publisher": "한국학중앙연구원"
    }
  ],
  "sharp": [
    {
      "title": "앨리스 샤프(사애리시) — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/앨리스_샤프"
    },
    {
      "title": "영명학교(사부수·사애리시 설립) — 한국민족문화대백과",
      "url": "https://encykorea.aks.ac.kr/Article/E0037372",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "선교사열전: 사애리시 — 유관순을 길러낸 스승",
      "url": "https://www.kosinnews.com/news/articleView.html?idxno=25214",
      "publisher": "고신뉴스"
    }
  ],
  "williams": [
    {
      "title": "프랭크 윌리엄스(우리암) — 위키백과",
      "url": "https://ko.wikipedia.org/wiki/프랭크_윌리엄스_(선교사)"
    },
    {
      "title": "영명학교(우리암 교장) — 한국민족문화대백과",
      "url": "https://encykorea.aks.ac.kr/Article/E0037372",
      "publisher": "한국학중앙연구원"
    },
    {
      "title": "선교사 우리암",
      "url": "https://www.gongju.go.kr/kr/sub06_10_02_04.do?partCode=08",
      "publisher": "공주시"
    }
  ],
  "kendrick": [
    { "title": "루비 캔드릭 — 위키백과", "url": "https://ko.wikipedia.org/wiki/루비_캔드릭" }
  ],
  "moore": [
    { "title": "승동교회 — 위키백과", "url": "https://ko.wikipedia.org/wiki/승동교회" },
    { "title": "백정을 일으킨 선교사 무어", "url": "https://www.kich.org/news/articleView.html?idxno=10389", "publisher": "한국기독교사연구소" }
  ],
  "campbell": [
    { "title": "조세핀 캠벨 — 위키백과", "url": "https://ko.wikipedia.org/wiki/조세핀_캠벨" },
    { "title": "종교교회 — 한국민족문화대백과", "url": "https://encykorea.aks.ac.kr/Article/E0076585", "publisher": "한국학중앙연구원" }
  ],
  "hmoffett": [
    { "title": "하워드 모펫(마포화열) — 대구역사문화대전", "url": "https://www.grandculture.net/daegu/toc/GC40008141", "publisher": "한국학중앙연구원" }
  ],
  "soda": [
    { "title": "소다 가이치 — 위키백과", "url": "https://ko.wikipedia.org/wiki/소다_가이치" }
  ],
  "aliceappenzeller": [
    { "title": "Alice Rebecca Appenzeller — Wikipedia", "url": "https://en.wikipedia.org/wiki/Alice_Rebecca_Appenzeller" }
  ],
  "mckenzie": [
    { "title": "William McKenzie (missionary) — Wikipedia", "url": "https://en.wikipedia.org/wiki/William_McKenzie_(missionary)" },
    { "title": "소래교회와 매켄지", "url": "https://www.kich.org/news/articleView.html?idxno=10388", "publisher": "한국기독교사연구소" }
  ],
  "maclay": [
    { "title": "매클레이의 선교 윤허 — 우리역사넷", "url": "https://contents.history.go.kr/mobile/nh/view.do?levelId=nh_046_0030_0040_0010_0020", "publisher": "국사편찬위원회" },
    { "title": "Robert Samuel Maclay — Wikipedia", "url": "https://en.wikipedia.org/wiki/Robert_Samuel_Maclay" }
  ],
  "nisbet": [
    { "title": "내한 선교사 — 유서백·유애나(Nisbet)", "url": "https://kmhistory.com/missionaries/missionaries/", "publisher": "내한선교사" }
  ],
  "noble": [
    { "title": "William Noble (missionary) — Wikipedia", "url": "https://en.wikipedia.org/wiki/William_Noble_(missionary)" }
  ],
  "swallen": [
    { "title": "William Leander Swallen — Find a Grave", "url": "https://www.findagrave.com/memorial/36766014/william-leander-swallen", "publisher": "Find a Grave" }
  ],
  "fenwick": [
    { "title": "펜윅(편위익) — 한국민족문화대백과", "url": "https://encykorea.aks.ac.kr/Article/E0076637", "publisher": "한국학중앙연구원" }
  ],
  "paine": [
    { "title": "이화학당 역대 당장 — 배의례", "url": "https://www.ewha.ac.kr/ewha/intro/dean.do", "publisher": "이화여자대학교" }
  ],
  "chaffin": [
    { "title": "협성여자신학교 초대 교장 채부인", "url": "http://www.kich.org/news/articleView.html?idxno=10654", "publisher": "한국기독교사연구소" }
  ],
  "morris": [
    { "title": "Demons, destruction, fear: Wonju a century ago", "url": "https://www.koreatimes.co.kr/opinion/20190824/demons-destruction-fear-wonju-a-century-ago-under-the-japanese", "publisher": "The Korea Times" }
  ]
};

// 인물별 검증된 영상 링크(리서치로 인물 일치·접속 확인된 것만).
const VIDEOS: Record<string, { url: string; title: string; source?: string }[]> = {
  underwood: [{ url: "https://www.youtube.com/watch?v=qVVDf219WyA", title: "이 땅을 사랑한 예수의 증인들 — 한국 최초의 교회를 설립한 호러스 언더우드", source: "CBS" }],
  appenzeller: [{ url: "https://www.youtube.com/watch?v=hbkKtwitffg", title: "죽기까지 선교하고 순교한 선교사, 아펜젤러 이야기", source: "걸어서 성지속으로" }],
  mscranton: [
    { url: "https://www.youtube.com/watch?v=8jzGAKv6wcg", title: "이 땅을 사랑한 예수의 증인들 — 조선 여성을 일깨운 메리 스크랜턴", source: "CBS" },
    { url: "https://www.youtube.com/watch?v=gcIOOAHckSc", title: "다큐 ‘女선교사 조선을 비추다’ — 메리 스크랜턴과 로제타 홀", source: "CGNTV" },
  ],
  william: [{ url: "https://www.youtube.com/watch?v=FbfaSdPpnyA", title: "예수의 마음으로 조선을 사랑한 윌리엄 스크랜튼 선교사 — 위대한 발걸음 12화", source: "위대한 발걸음" }],
  heron: [{ url: "https://www.youtube.com/watch?v=zx08-phSy-A", title: "이 땅을 사랑한 예수의 증인들 — 죽음을 뛰어넘은 사랑 존 헤론", source: "CBS" }],
  avison: [{ url: "https://www.youtube.com/watch?v=QKg1zUgoR0c", title: "조선을 사랑한 선교사 05 — 올리버 에비슨", source: "조선을 사랑한 선교사" }],
  gale: [{ url: "https://www.youtube.com/watch?v=aVLnH6VPEuk", title: "예수의 흔적 2부 — 40년 조선인으로 살다 간 착한 목자 제임스 게일", source: "CBS" }],
  hulbert: [{ url: "https://www.youtube.com/watch?v=1VXu_ZElm78", title: "한국인보다 더 한국을 사랑했던 선교사 헐버트 (다큐ON)", source: "KBS" }],
  rosetta: [{ url: "https://www.youtube.com/watch?v=kcbWWBNKg80", title: "예수의 흔적 3부 — 조선 여성들에게 빛이 된 선교사 로제타 홀", source: "CBS" }],
  wjhall: [{ url: "https://www.youtube.com/watch?v=AoLi4TQ8rrk", title: "조선을 사랑한 선교사 07 — 윌리엄 제임스 홀", source: "조선을 사랑한 선교사" }],
  sherwoodhall: [{ url: "https://www.youtube.com/watch?v=j9mfS08qB-Q", title: "크리스마스 씰로 결핵 퇴치에 헌신한 셔우드 홀 선교사", source: "CTS뉴스" }],
  moffett: [{ url: "https://www.youtube.com/watch?v=0T0fKuyU6vk", title: "조선을 사랑한 선교사 12 — 사무엘 모펫(마포삼열)", source: "조선을 사랑한 선교사" }],
  shepping: [{ url: "https://www.youtube.com/watch?v=-TbZpzs0uS4", title: "서서평 선교사의 생애 — 조선인들의 어머니", source: "선교사 이야기" }],
  schofield: [
    { url: "https://www.youtube.com/watch?v=wTIrxxDDPcg", title: "EBS 걸작 다큐멘터리 — 민족대표 34인 석호필", source: "EBS" },
    { url: "https://www.youtube.com/watch?v=wMgTZcoKKPA", title: "역사채널e — 34번째 민족대표, 석호필", source: "EBS 역사채널e" },
  ],
  gilseonju: [{ url: "https://www.youtube.com/watch?v=0oEvP6Fglq0", title: "길선주 목사의 생애 — 한국 초대교회를 빛낸 인물", source: "신앙의 위인전" }],
  leegipung: [{ url: "https://www.youtube.com/watch?v=3wSDeO9ATMA", title: "이기풍 목사의 생애 1부 — 한국교회 최초 목사, 제주 선교사", source: "믿음의 위인들" }],
  seo: [{ url: "https://www.youtube.com/watch?v=FlLyUV_GCOg", title: "서상륜 (1) — 한국 최초의 기독교인 (1907 믿음의 사람들)", source: "CGNTV" }],
  leesujeong: [{ url: "https://www.youtube.com/watch?v=0lRHRLdKskk", title: "한국 기독교 선교의 개척자 이수정 — CBS 특집다큐", source: "CBS" }],
  hardie: [{ url: "https://www.youtube.com/watch?v=VC7AZrxOSl4", title: "한국교회 부흥운동의 아버지, 로버트 하디", source: "YouTube" }],
  ross: [{ url: "https://www.youtube.com/watch?v=fMrx2zGn2ps", title: "존 로스 (1) — 스코틀랜드에서 온 선교사 (1907 믿음의 사람들)", source: "CGNTV" }],
  linton: [{ url: "https://www.youtube.com/watch?v=ybxCDWfH-5Y", title: "2022년 3월 이달의 독립운동가 — 윌리엄 린튼(한남대 초대총장)", source: "국가보훈처" }],
  kendrick: [{ url: "https://www.youtube.com/watch?v=cJNqMWoCQl8", title: "루비 켄드릭의 생애 — 조선에 심장을 묻은 선교사", source: "믿음의 위인들" }],
  sharp: [
    { url: "https://www.youtube.com/watch?v=2jKZaUwki50", title: "목원대, ‘유관순 열사 스승’ 사애리시 선교사 기념관", source: "대전MBC" },
    { url: "https://www.youtube.com/watch?v=D6mDItlLOrk", title: "유관순 열사 첫 스승 사애리시 선교사 기념관 개관", source: "TJB 대전·세종·충남뉴스" },
    { url: "https://www.youtube.com/watch?v=j0Pf4xJSoMA", title: "유관순 열사에 기독교를 전한 사애리시 선교사", source: "굿처치뉴스" },
  ],
  williams: [{ url: "https://www.youtube.com/watch?v=atLLJOyiOew", title: "2022년 8월의 역사인물, ‘선교사 우리암’", source: "공주시" }],
};

export function profileFor(id: string): PersonProfile | undefined {
  const p = PROFILES[id];
  // PROFILES 상세가 없어도 QUOTES/STORIES/VIDEOS/REFS 중 하나라도 있으면 병합해 반환
  // (신규 추가 인물이 서사·영상·링크만 가진 경우 — 필수 필드는 빈 기본값).
  if (!p && !(QUOTES[id] || STORIES[id] || VIDEOS[id] || REFS[id])) return undefined;
  const merged: PersonProfile = p ? { ...p } : { ministry: [], journey: "", influence: "" };
  if (QUOTES[id]) merged.quote = QUOTES[id];
  if (STORIES[id]) merged.story = STORIES[id];
  if (VIDEOS[id]) merged.videos = VIDEOS[id];
  if (REFS[id]) merged.refs = REFS[id];
  return merged;
}
