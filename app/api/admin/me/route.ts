import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/db/supabase";
import { authRole } from "@/lib/db/admin-auth";

// 로그인한 사용자의 콘텐츠 권한(역할)을 서버에서 권위 있게 알려준다. /admin UI 게이팅용.
// 겸사겸사 Google 로그인 프로필 이름(full_name)을 app_settings.role_names(이메일→이름)에
// 기록해 둔다 — 일반 gmail 학생은 Directory API로 조회가 안 되므로, '첫 로그인 때 수집'이
// 이름을 얻는 유일한 경로다. (등록 시엔 이메일만, 로그인하면 이름이 자동으로 채워짐)
export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  let role = null;
  let email = null;
  let name = null;
  try {
    const db = getServiceSupabase();
    const a = await authRole(db, token);
    email = a.email;
    role = a.role;
    name = a.name;
    // 이름을 아는 로그인 사용자면 명단 표시용 이름 맵을 갱신(값이 바뀔 때만 write).
    if (email && name) {
      const { data } = await db.from("app_settings").select("value").eq("key", "role_names").maybeSingle();
      const map = (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, string>;
      if (map[email] !== name) {
        await db.from("app_settings").upsert({ key: "role_names", value: { ...map, [email]: name } }, { onConflict: "key" });
      }
    }
  } catch {
    /* DB 미설정 등 — role=null로 응답 */
  }
  return NextResponse.json({ email, role, name });
}
