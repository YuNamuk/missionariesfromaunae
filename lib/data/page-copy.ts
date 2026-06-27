// 형성 페이지(/story·/journey)의 '단순 텍스트 블록' 기본값.
// 인물 링크·강조가 박힌 서사 문단은 페이지 코드에 그대로 두고, 여기 정의된 블록만
// 관리자가 app_settings(content.page.<page>)로 덮어쓸 수 있다. \n 은 줄바꿈으로 렌더.

export const STORY_COPY: Record<string, string> = {
  heroKicker: "Missionaries from Aunae",
  heroQuestion: "아름다운 삶은\n무엇일까?",
  heroLead:
    "여기 성공이 아니라 섬김을 택한 이들이 있습니다. 먼 땅을 집으로 삼고, 기꺼이 한 알의 밀알이 되기를 선택한 사람들. 그들의 삶을 따라 걷다 보면 한 가지 질문이 남습니다 — 나는 어떤 삶을 아름답다고 부를 것인가.",
  m1Title: "복음이, 선교사를 통해 나에게",
  costTitle: "성공이 아니라, 섬김",
  homeTitle: "조선을 집으로 삼은 사람들",
  m2Title: "복음이, 나를 통해 세계로",
  nextRunner: "I am the next runner.\nI am a missionary from Aunae.",
  closeTitle: "이제, 한 사람을 만나 보세요",
  closeLead:
    "정답을 드리지 않겠습니다. 다만 묻습니다 — 당신은 어떤 삶을 아름답다고 부르겠습니까? 한 사람의 생애를 따라가 보고, 당신의 응답을 마음에 적어 보세요.",
};

export const JOURNEY_COPY: Record<string, string> = {
  heroTitle: "함께 걸어온 길",
  heroLead:
    "인물들의 여정 옆에, 우리의 여정을 둡니다. 한 사람의 삶을 만나고, 아름다운 삶을 묻고, 나의 응답을 적고, 다음 주자로 서기까지 — 이 수업이 걸어온 길입니다.",
  lineageTitle: "복음의 계보",
  lineageLead:
    "우리는 한국 선교사만 본 것이 아니라, 복음이 흘러온 긴 강을 거슬러 올랐습니다. 초대교회의 순교자들에서 시작해, 중세를 지나, 이 땅의 선교사들에게로 — 그리고 그 강이 지금 우리에게 닿았습니다. 같은 한 줄기의 복음입니다.",
  bookTitle: "학생들이 쓴 책",
  bookLead:
    "이 수업의 끝에서, 학생들은 직접 한 권의 책을 써 엮었습니다 — 『하나님이 우리를 이처럼 사랑하사』. 이 사이트의 두 움직임은 바로 이 책에서 왔습니다.",
  tripTitle: "탐방의 기록",
  tripLead:
    "책으로만이 아니라, 학생들은 정동과 양화진을 직접 걸었습니다. 그들의 발자취를 따라 걸으며 남긴 답사 기록의 한 조각들입니다.",
  voicesTitle: "학생들의 목소리",
};

/** 페이지 카피 기본값 위에 오버레이(관리자 편집)를 덮어 반환. */
export function mergeCopy(base: Record<string, string>, override: Record<string, string> | null | undefined): Record<string, string> {
  if (!override) return base;
  const out = { ...base };
  for (const k of Object.keys(base)) {
    const v = override[k];
    if (typeof v === "string" && v.trim()) out[k] = v;
  }
  return out;
}
