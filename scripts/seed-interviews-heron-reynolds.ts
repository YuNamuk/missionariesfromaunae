// 헤론·레이놀즈 가상 인터뷰 시드 — YouTube 영상 스크립트를 분석해 기존 형식으로 구성.
// interview.videos(영상) + interview.content.<id>(문답·안내문·히어로) 를 app_settings에 upsert.
// (컬럼이 없는 인물이라 오버레이만으로 /interviews에 등록된다.) 재실행 안전(덮어씀).
//   tsx --env-file=.env.local scripts/seed-interviews-heron-reynolds.ts
import { getServiceSupabase } from "../lib/db/supabase";

const AI = "AI 생성 일러스트(회화체 재구성)";
const NOTE = (nm: string) => `학생들이 ${nm} 선교사의 생애와 사료를 바탕으로 재구성한 가상 인터뷰입니다. 실제 발언 기록이 아닙니다.`;

const HERON = {
  note: NOTE("헤론"),
  author: "드리미학교 ‘Missionaries from Aunae’ · AI 재현 인터뷰",
  hero: { src: "/research-img/heron-hero.jpg", alt: "제중원 마당에서 환자들을 돌보는 장면", caption: "제중원에서 신분을 가리지 않고 환자를 돌본 헤론.", credit: AI, kind: "ai" },
  qa: [
    { q: "선교사님, 먼저 소개를 부탁드립니다.", a: "안녕하십니까. 저는 미국 북장로회 의료 선교사 존 헤론입니다. 1885년 조선에 들어와, 알렌이 떠난 뒤 제중원을 맡아 환자를 돌보았습니다. 1890년 서울에서 이질로 세상을 떠났습니다." },
    { q: "미국에서 의사로 자리 잡을 수도 있었는데, 왜 조선으로 오셨나요?", a: "저는 테네시에서 자라 뉴욕의과대학을 우등으로 마쳤습니다. 미국에서 의사로 편히 자리 잡을 길이 있었지만, 저는 북장로회 선교사로 조선에 가기로 했습니다. 사실 저는 조선에 파송된 첫 공식 의료 선교사였습니다." },
    { q: "언제, 어떻게 조선에 들어오셨습니까?", a: "1885년 6월, 아내와 함께 제물포를 통해 들어왔습니다." },
    { q: "제중원에서는 어떤 사역을 하셨나요?", a: "알렌이 세운 제중원에서 환자를 진료했습니다. 저는 신분의 높고 낮음을 가리지 않고 사람을 돌보려 했습니다. 또 고종의 신임을 얻어 왕실의 시의(侍醫)로도 섬겼습니다." },
    { q: "전염병이 도는 위험 속에서도 환자를 떠나지 않으셨다고요.", a: "그 위험을 피하기보다, 저는 끝까지 환자의 곁을 지키는 길을 택했습니다." },
    { q: "결국 그 일이 선교사님의 마지막이 되었습니다.", a: "네. 저 자신도 환자를 돌보다 이질에 걸렸고, 1890년 여름 서른네 살의 나이로 세상을 떠났습니다." },
    { q: "양화진 외국인선교사묘원의 첫 안장자가 되셨습니다.", a: "제가 떠난 뒤 외국인을 위한 묘지가 필요하다는 논의 끝에, 양화진에 외국인선교사묘원이 세워졌습니다. 그리고 제가 그 첫 번째로 묻힌 사람이 되었습니다." },
    { q: "남기고 싶은 말씀이 있으실까요?", a: "제 삶은 짧았지만, 의술과 믿음으로 조선 사람들을 섬기려 한 그 마음만은 남기고 싶었습니다. ‘하나님의 아들이 나를 사랑하사 나를 위하여 자기 자신을 버리셨다’—그 사랑이 저를 이 땅으로 이끌었습니다." },
  ],
};

const REYNOLDS = {
  note: NOTE("레이놀즈(이눌서)"),
  author: "드리미학교 ‘Missionaries from Aunae’ · AI 재현 인터뷰",
  hero: { src: "/research-img/reynolds-hero.jpg", alt: "등불 아래 성경을 번역하는 장면", caption: "밤마다 이어진 성경 번역 — 이눌서가 가장 오래 바친 일.", credit: AI, kind: "ai" },
  qa: [
    { q: "선교사님, 소개를 부탁드립니다.", a: "안녕하십니까. 미국에서는 윌리엄 데이비스 레이놀즈라 불렸지만, 저는 이렇게 소개하곤 했습니다—전주 이씨 이눌서입니다. 사람들이 지어 준 그 이름이, 이내 제 본래 이름보다 더 저다워졌습니다." },
    { q: "원래 꿈은 무엇이었고, 어떻게 조선까지 오게 되셨나요?", a: "본래 저는 언어학자가 되고 싶었습니다. 존스홉킨스에서 헬라어와 라틴어를 공부하며 평생 책상 앞에서 살 줄 알았지요. 그런데 아버지의 사업이 무너지며 그 꿈을 내려놓아야 했습니다. 1891년 신학교에서 언더우드 선교사의 강연을 들었습니다. 복음을 한 번도 들어보지 못한 백성이 있다는 이야기가 제 마음을 사로잡았습니다. 이듬해 1892년, 저는 아내와 함께 조선으로 가는 배에 올랐습니다." },
    { q: "가장 힘들었던 일은 무엇이었습니까?", a: "가장 큰 어려움은 언어였습니다. 남의 말을 알아듣지도, 제 뜻을 전하지도 못하는 외로움은 말로 다 하기 어렵습니다. 저는 어디를 가든 수첩을 들고 다니며 새로 들은 낱말을 적었습니다. 처음으로 누군가 한국어로 말을 걸어왔을 때 단어를 더듬지 않고 대답한 순간, 비로소 제가 이곳에 속하기 시작했음을 알았습니다." },
    { q: "동료를 잃는 아픔도 겪으셨지요.", a: "1908년, 저와 함께 처음 조선에 온 친구 전킨이 폐렴으로 갑자기 세상을 떠났습니다. 제가 겪은 가장 힘든 일이었습니다." },
    { q: "조선에서 어떤 사역들을 하셨나요?", a: "전주에서는 교회를 세우고 학교를 시작했습니다. 뒤에는 평양의 신학교에서 장차 목사가 될 이들을 가르쳤습니다." },
    { q: "가장 오래 바친 일은 성경 번역이었다고 들었습니다.", a: "그렇습니다. 예레미야서를 제외한 구약의 거의 모든 책이 제 손을 거쳤습니다. 더디고 힘든 일이었지만, 사람들이 하나님의 말씀을 더 또렷이 이해할 수 있다면 그 한 시간 한 시간이 값졌습니다." },
    { q: "삶을 돌아보실 때 가장 먼저 떠오르는 것은 무엇입니까?", a: "제 삶을 돌아볼 때, 저는 우리가 세운 교회나 연 학교, 옮긴 성경의 페이지를 먼저 떠올리지 않습니다. 하나님께서 사랑하게 하신 ‘사람들’을 먼저 생각합니다." },
    { q: "후대에 남기고 싶은 기도가 있다면요.", a: "두려워하던 젊은이를 붙드시어 사랑할 백성을 주시고, 평생 바칠 일을 주신 분은 하나님이셨습니다. 다음 세대마다 그리스도 안에 있는 소망을 알게 되기를 기도합니다." },
  ],
};

async function main() {
  const db = getServiceSupabase();
  // 영상
  const { data: vrow } = await db.from("app_settings").select("value").eq("key", "interview.videos").maybeSingle();
  const videos = (vrow?.value && typeof vrow.value === "object" ? vrow.value : {}) as Record<string, { youtube?: string }>;
  videos.heron = { youtube: "https://youtu.be/5P1V0_e_FAQ" };
  videos.reynolds = { youtube: "https://youtu.be/EMsUgQKACc4" };
  await db.from("app_settings").upsert({ key: "interview.videos", value: videos }, { onConflict: "key" });
  // 문답
  await db.from("app_settings").upsert({ key: "interview.content.heron", value: HERON }, { onConflict: "key" });
  await db.from("app_settings").upsert({ key: "interview.content.reynolds", value: REYNOLDS }, { onConflict: "key" });
  console.log("시드 완료: interview.videos(+heron,+reynolds), interview.content.heron, interview.content.reynolds");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
