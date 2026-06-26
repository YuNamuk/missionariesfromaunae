// 선교 연혁 — 한국 초기 개신교 선교의 이정표 사건. 지도 위에서 장소·인물과 연결된다.
export interface MissionEvent {
  year: number;
  title: string;
  desc: string;
  place: string; // place id
  people: string[]; // person ids
}

export const EVENTS: MissionEvent[] = [
  { year: 1882, title: "한글 성경 번역", place: "manju", people: ["ross", "seo"],
    desc: "존 로스가 한국인들의 도움으로 성경을 한글로 옮겨, 선교사보다 먼저 ‘말씀’이 압록강을 건넜다." },
  { year: 1884, title: "알렌 입국 · 제중원", place: "jeongdong", people: ["allen"],
    desc: "첫 개신교 선교사 알렌이 입국해 왕실의 신임을 얻고, 이듬해 최초의 서양식 병원 제중원을 세웠다." },
  { year: 1885, title: "언더우드·아펜젤러 입국", place: "jemulpo", people: ["underwood", "appenzeller"],
    desc: "부활절, 언더우드와 아펜젤러가 같은 배로 제물포에 도착하며 본격적인 선교가 시작됐다." },
  { year: 1885, title: "배재학당 설립", place: "jeongdong", people: ["appenzeller"],
    desc: "아펜젤러가 배재학당을 세워 근대 교육의 문을 열었다. 교훈은 ‘크게 되려는 자는 남을 섬기라’." },
  { year: 1886, title: "이화학당 설립", place: "jeongdong", people: ["mscranton"],
    desc: "메리 스크랜튼이 단 한 명의 학생에서 이화학당을 시작, 조선 여성 교육의 길을 열었다." },
  { year: 1887, title: "새문안·정동제일교회", place: "jeongdong", people: ["underwood", "appenzeller"],
    desc: "언더우드의 새문안교회와 아펜젤러의 정동제일교회가 세워지며 조직 교회가 출발했다." },
  { year: 1890, title: "헤론 순직 · 양화진", place: "yanghwajin", people: ["heron"],
    desc: "제중원 원장 헤론이 환자를 돌보다 순직, 양화진 외국인선교사묘원의 첫 안장자가 되었다." },
  { year: 1897, title: "숭실학당 설립", place: "pyongyang", people: ["baird"],
    desc: "베어드가 평양에 숭실학당을 세워 북부 지역 근대 고등교육의 토대를 놓았다." },
  { year: 1903, title: "원산 부흥", place: "wonsan", people: ["hardie"],
    desc: "하디의 회개 운동으로 원산에서 영적 각성이 시작되어, 1907년 대부흥의 도화선이 되었다." },
  { year: 1904, title: "세브란스병원", place: "jeongdong", people: ["avison"],
    desc: "에비슨이 세브란스병원과 의학교를 세워 한국 근대 의학 교육을 열었다." },
  { year: 1907, title: "평양 대부흥", place: "pyongyang", people: ["gilseonju", "moffett"],
    desc: "장대현교회를 중심으로 평양 대부흥이 일어나고, 첫 한국인 목사 7인이 배출되었다." },
  { year: 1915, title: "연희전문학교", place: "jeongdong", people: ["underwood"],
    desc: "언더우드가 연희전문학교를 세워 고등교육을 확장했다(훗날 연세대의 뿌리)." },
  { year: 1919, title: "3·1운동과 선교사", place: "jeongdong", people: ["schofield", "gilseonju"],
    desc: "스코필드 등 선교사들이 3·1운동의 실상을 세계에 알리고 한국의 독립을 도왔다." },
];
