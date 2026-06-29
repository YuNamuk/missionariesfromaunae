// Supabase Storage 'portraits' 버킷 프로비저닝(공개 읽기). 1회 실행.
import { getServiceSupabase } from "../lib/db/supabase";
async function main() {
  const db = getServiceSupabase();
  const { data, error } = await db.storage.createBucket("portraits", { public: true, fileSizeLimit: 10485760, allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"] });
  console.log(error ? `결과: ${error.message}` : `버킷 생성: ${JSON.stringify(data)}`);
  const { data: list } = await db.storage.listBuckets();
  console.log("버킷 목록:", (list ?? []).map((b) => `${b.name}(${b.public ? "public" : "private"})`).join(", ") || "(없음)");
}
main();
