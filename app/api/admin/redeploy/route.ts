import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/db/supabase";
import { authRole } from "@/lib/db/admin-auth";

// 전체 관리자(super)가 '사이트에 적용' 버튼을 누르면 Vercel Deploy Hook을 호출해 재배포.
// 재배포 시 prebuild(i18n:export)가 DB의 UI/라벨/이름 번역을 정적 파일로 다시 병합한다.
// 필요한 env: VERCEL_DEPLOY_HOOK_URL (Vercel 프로젝트 Settings→Git→Deploy Hooks에서 생성).
export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  let role = null;
  try {
    role = (await authRole(getServiceSupabase(), token)).role;
  } catch {
    return NextResponse.json({ error: "auth 실패" }, { status: 500 });
  }
  if (role !== "super") return NextResponse.json({ error: "전체 관리자만 재배포할 수 있습니다." }, { status: 403 });

  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return NextResponse.json({ error: "VERCEL_DEPLOY_HOOK_URL 미설정 — Vercel에서 Deploy Hook을 만들고 환경변수에 추가하세요." }, { status: 503 });
  }
  try {
    const r = await fetch(hook, { method: "POST" });
    if (!r.ok) return NextResponse.json({ error: `Deploy Hook 호출 실패(${r.status})` }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "네트워크 오류: " + String(e).slice(0, 120) }, { status: 502 });
  }
}
