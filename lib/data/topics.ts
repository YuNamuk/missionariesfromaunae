// 주제연구(Topic Research). 한 주제에 선교사들을 묶어 등록하면, 사이트의 자산
// (인물·관계·장소·유적·링크·활동기간)을 모아 하나의 통합 리포트로 렌더한다.
// 코드 기본 주제 + (추후) 관리자가 app_settings로 등록한 주제를 합친다.

export interface Topic {
  id: string;
  title: string;
  /** 한두 문단 소개(주제의 의미) */
  intro: string;
  /** 이 주제에 묶인 선교사 id */
  people: string[];
  /** 작성자 표기(선택) */
  by?: string;
  /** 시대/배경 메모(분석 입력) */
  era?: string;
  /** AI 분석 결과(관리자가 생성·저장). 사이트 데이터에 근거. */
  analysis?: string;
}

export const TOPICS: Topic[] = [
  {
    id: "first-road",
    title: "복음의 첫 길을 연 사람들",
    intro:
      "조선의 문이 아직 닫혀 있던 때, 누군가는 길을 먼저 내야 했다. 일본에서 성경을 옮기고 호소한 이수정, 만주에서 한글 성경을 펴낸 로스, 고종에게서 선교의 윤허를 받아낸 매클레이, 그리고 그 틈으로 처음 들어온 알렌·언더우드·아펜젤러까지 — 복음이 이 땅에 닿는 첫 길을 연 사람들의 이야기를 한자리에 모았다.",
    people: ["leesujeong", "ross", "maclay", "allen", "underwood", "appenzeller"],
  },
  {
    id: "pyongyang-revival",
    title: "평양, 부흥과 신학교",
    intro:
      "서북의 도시 평양은 한국 교회의 한 심장이 되었다. 마포삼열과 베어드가 신학교와 학교의 토대를 놓고, 하디의 원산 부흥이 1907년 평양 대부흥으로 이어졌으며, 그 자리에서 길선주·이기풍 같은 한국인 목사가 일어섰다. 평양을 중심으로 복음이 한국인에게로 흘러간 흐름을 모았다.",
    people: ["moffett", "baird", "swallen", "noble", "hardie", "gilseonju", "leegipung"],
  },
  {
    id: "women-education",
    title: "여성의 배움을 일으킨 사람들",
    intro:
      "배움이 여성에게 좀처럼 허락되지 않던 시대, 학교의 문을 연 사람들이 있었다. 이화를 시작한 메리 스크랜튼에서, 공주의 사애리시, 배화의 캠벨, 협성의 채부인, 그리고 한국에서 태어나 이화여전을 이끈 앨리스 아펜젤러까지 — 여성의 자리를 처음 마련한 이들을 한자리에 모았다.",
    people: ["mscranton", "rosetta", "sharp", "campbell", "paine", "chaffin", "aliceappenzeller", "nisbet"],
  },
  {
    id: "one-grain",
    title: "한 알의 밀알 — 일찍 떠난 이들",
    intro:
      "이 땅에 닿자마자, 혹은 얼마 지나지 않아 생을 마친 사람들이 있다. 첫 안장자 헤론, 평양에서 전상자를 돌보다 순직한 윌리엄 홀, 내한 아홉 달 만에 떠난 루비 켄드릭, 소래에서 외롭게 스러진 매켄지 — 길이가 아니라 무게로 남은 삶들을 모았다.",
    people: ["heron", "wjhall", "kendrick", "mckenzie", "junkin", "paine"],
  },
];

export function topicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}
