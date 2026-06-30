import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/db/supabase";
import { authRole } from "@/lib/db/admin-auth";

// 로그인한 사용자의 콘텐츠 권한(역할)을 서버에서 권위 있게 알려준다. /admin UI 게이팅용.
export async function GET(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  let role = null;
  let email = null;
  try {
    const { email: e, role: r } = await authRole(getServiceSupabase(), token);
    email = e;
    role = r;
  } catch {
    /* DB 미설정 등 — role=null로 응답 */
  }
  return NextResponse.json({ email, role });
}
