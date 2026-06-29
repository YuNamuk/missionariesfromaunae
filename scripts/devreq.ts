// 개발 요청 큐 폴링·처리 — VSCode의 Claude Code(자동 점검 루프)가 사용.
//   목록:        tsx --env-file=.env.local scripts/devreq.ts list
//   상태 변경:   tsx --env-file=.env.local scripts/devreq.ts set <id> <pending|in_progress|done|question> [응답...]
import { getServiceSupabase } from "../lib/db/supabase";
import { STATUS_LABEL, type DevReq, type DevReqStatus } from "../lib/data/devreq";

async function read(): Promise<DevReq[]> {
  const db = getServiceSupabase();
  const { data } = await db.from("app_settings").select("value").eq("key", "devreq").maybeSingle();
  const v = data?.value;
  return Array.isArray(v) ? (v as DevReq[]) : [];
}

async function write(list: DevReq[]) {
  const db = getServiceSupabase();
  await db.from("app_settings").upsert({ key: "devreq", value: list }, { onConflict: "key" });
}

async function main() {
  const [cmd, id, status, ...rest] = process.argv.slice(2);
  const list = await read();
  if (cmd === "list" || !cmd) {
    const pending = list.filter((r) => r.status === "pending" || r.status === "in_progress");
    console.log(`개발 요청 ${list.length}건 (처리 대상 ${pending.length}건)\n`);
    for (const r of list) {
      console.log(`[${r.id}] (${STATUS_LABEL[r.status] ?? r.status}) ${r.title}`);
      console.log(`   요청: ${r.prompt}`);
      if (r.response) console.log(`   응답: ${r.response}`);
      console.log("");
    }
    return;
  }
  if (cmd === "set") {
    if (!id || !status) { console.error("사용법: set <id> <status> [응답...]"); process.exit(1); }
    const i = list.findIndex((r) => r.id === id);
    if (i < 0) { console.error("해당 id 없음:", id); process.exit(1); }
    list[i] = { ...list[i], status: status as DevReqStatus, ...(rest.length ? { response: rest.join(" ") } : {}), updatedAt: new Date().toISOString() };
    await write(list);
    console.log("갱신:", id, "→", status);
    return;
  }
  console.error("알 수 없는 명령:", cmd);
  process.exit(1);
}

main();
