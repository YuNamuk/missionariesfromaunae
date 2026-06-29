// 검수 재작업 요청 큐 — 관리자가 검수 탭에서 '♻ 재작업'으로 사유를 적으면 app_settings의
// key: rework({ "g:<id>:<n>": "사유" })에 쌓인다. Claude Code(자동 루프)가 이 목록을 보고
// 해당 갤러리 사진을 다시 컬러화한 뒤 done으로 비운다.
//   목록: tsx --env-file=.env.local scripts/rework.ts list
//   완료: tsx --env-file=.env.local scripts/rework.ts done "g:<id>:<n>"
import { getServiceSupabase } from "../lib/db/supabase";

async function read(): Promise<Record<string, string>> {
  const db = getServiceSupabase();
  const { data } = await db.from("app_settings").select("value").eq("key", "rework").maybeSingle();
  const v = data?.value;
  return v && typeof v === "object" ? (v as Record<string, string>) : {};
}

async function main() {
  const [cmd, key] = process.argv.slice(2);
  const map = await read();
  if (cmd === "list" || !cmd) {
    const keys = Object.keys(map);
    console.log(`재작업 요청 ${keys.length}건\n`);
    for (const k of keys) console.log(`  ${k}  →  ${map[k]}`);
    if (keys.length) console.log(`\n처리: 해당 <id>의 갤러리 사진(<n>) 재생성 후  rework.ts done "<key>"`);
    return;
  }
  if (cmd === "done") {
    if (!key) { console.error('사용법: done "g:<id>:<n>"'); process.exit(1); }
    delete map[key];
    const db = getServiceSupabase();
    await db.from("app_settings").upsert({ key: "rework", value: map }, { onConflict: "key" });
    console.log("완료 처리:", key);
    return;
  }
  console.error("알 수 없는 명령:", cmd); process.exit(1);
}

main();
