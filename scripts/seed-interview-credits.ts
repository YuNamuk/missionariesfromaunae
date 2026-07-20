// 가상 인터뷰 제작 크레딧(시나리오·영상제작 + 기수) 일괄 반영.
// 규칙: A열 이름=영상제작(그냥 이름), C열 노트링크 문서명=시나리오. 노트링크가 없으면 그 학생이 둘 다 함.
// 기존 interview.content.<pid>(문답·안내문 등)은 보존하고 크레딧 4필드만 병합. 재실행 안전.
//   tsx --env-file=.env.local scripts/seed-interview-credits.ts
import { getServiceSupabase } from "../lib/db/supabase";

type C = { scenarioBy: string; scenarioCohort: string; videoBy: string; videoCohort: string };
const CREDITS: Record<string, C> = {
  hulbert:     { scenarioBy: "김시원", scenarioCohort: "7", videoBy: "김가현", videoCohort: "7" },
  reynolds:    { scenarioBy: "김한결", scenarioCohort: "7", videoBy: "김한결", videoCohort: "7" },
  mscranton:   { scenarioBy: "박제희", scenarioCohort: "6", videoBy: "김현성", videoCohort: "7" },
  gale:        { scenarioBy: "임선우", scenarioCohort: "8", videoBy: "박지원", videoCohort: "8" },
  heron:       { scenarioBy: "이로은", scenarioCohort: "7", videoBy: "이로은", videoCohort: "7" },
  shepping:    { scenarioBy: "장예진", scenarioCohort: "7", videoBy: "이하윤", videoCohort: "7" },
  williams:    { scenarioBy: "이한결", scenarioCohort: "7", videoBy: "이한결", videoCohort: "7" },
  underwood:   { scenarioBy: "허은휼", scenarioCohort: "7", videoBy: "허은휼", videoCohort: "7" },
  sharp:       { scenarioBy: "황샤론", scenarioCohort: "8", videoBy: "김진욱", videoCohort: "8" },
  rosetta:     { scenarioBy: "전서연", scenarioCohort: "6", videoBy: "이준민", videoCohort: "6" },
  eugenebell:  { scenarioBy: "윤드림", scenarioCohort: "8", videoBy: "윤드림", videoCohort: "8" },
  appenzeller: { scenarioBy: "정선호", scenarioCohort: "8", videoBy: "정선호", videoCohort: "8" },
};

async function main() {
  const db = getServiceSupabase();
  for (const [pid, cr] of Object.entries(CREDITS)) {
    const key = `interview.content.${pid}`;
    const { data } = await db.from("app_settings").select("value").eq("key", key).maybeSingle();
    const cur = (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, unknown>;
    const next = { ...cur, ...cr }; // 문답·안내문·히어로 보존, 크레딧만 병합
    const { error } = await db.from("app_settings").upsert({ key, value: next }, { onConflict: "key" });
    if (error) { console.log(`  ✗ ${pid}: ${error.message}`); continue; }
    const both = cr.scenarioBy === cr.videoBy;
    console.log(`  ✓ ${pid}: 시나리오 ${cr.scenarioBy}(${cr.scenarioCohort}기) / 영상제작 ${cr.videoBy}(${cr.videoCohort}기)${both ? " — 혼자 둘 다" : ""}`);
  }
  console.log(`\n완료 — ${Object.keys(CREDITS).length}편 크레딧 반영`);
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
