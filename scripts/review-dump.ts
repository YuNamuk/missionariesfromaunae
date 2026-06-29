import { getServiceSupabase } from "../lib/db/supabase";
async function main() {
  const db = getServiceSupabase();
  const { data } = await db.from("app_settings").select("value").eq("key", "review").maybeSingle();
  const r = (data?.value || {}) as Record<string,string>;
  const by: Record<string,number> = {};
  for (const v of Object.values(r)) by[v] = (by[v]||0)+1;
  console.log("분포:", JSON.stringify(by));
  for (const [k,v] of Object.entries(r)) console.log(" ", k, "→", v);
}
main();
