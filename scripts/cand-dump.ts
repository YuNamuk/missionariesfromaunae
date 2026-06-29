import { getServiceSupabase } from "../lib/db/supabase";
import { GALLERY } from "../lib/data/gallery";
import { PEOPLE } from "../lib/data";
async function main() {
  const db = getServiceSupabase();
  const { data } = await db.from("app_settings").select("value").eq("key","review").maybeSingle();
  const review = (data?.value || {}) as Record<string,string>;
  for (const [pid, arr] of Object.entries(GALLERY)) {
    const pending = arr.map((g,i)=>({i,g})).filter(({i})=> !review[`g:${pid}:${i}`]);
    if (!pending.length) continue;
    const p = (PEOPLE as any[]).find(x=>x.id===pid);
    console.log(`\n### ${pid} (${p?.en}) — ${p?.role} · ${p?.life} — 미검토 ${pending.length}`);
    for (const {i,g} of pending) console.log(`  ${i} | ${g.caption.slice(0,80)}`);
  }
}
main();
