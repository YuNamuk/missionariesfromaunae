import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveRole, type Role } from "@/lib/data/roles";

/**
 * Bearer 토큰을 service 클라이언트로 검증하고, app_settings(roles/admins) + env
 * ADMIN_EMAIL로 호출자의 콘텐츠 권한을 판정한다. 모든 관리자 API의 신뢰 경계.
 */
export async function authRole(
  db: SupabaseClient,
  token: string | undefined,
): Promise<{ email: string | null; role: Role | null; name: string | null }> {
  if (!token) return { email: null, role: null, name: null };
  const { data, error } = await db.auth.getUser(token);
  const email = data?.user?.email?.toLowerCase() ?? null;
  if (error || !email) return { email: null, role: null, name: null };
  // Google OAuth 로그인 시 프로필 이름이 user_metadata에 담긴다(full_name → name).
  const meta = (data?.user?.user_metadata ?? {}) as Record<string, unknown>;
  const nm = meta.full_name ?? meta.name;
  const name = typeof nm === "string" && nm.trim() ? nm.trim() : null;

  const { data: rows } = await db
    .from("app_settings")
    .select("key,value")
    .in("key", ["roles", "admins"]);
  let roles: Record<string, string> | undefined;
  let admins: string[] | undefined;
  for (const r of (rows ?? []) as { key: string; value: unknown }[]) {
    if (r.key === "roles" && r.value && typeof r.value === "object") roles = r.value as Record<string, string>;
    if (r.key === "admins" && Array.isArray(r.value)) admins = r.value as string[];
  }
  return { email, role: resolveRole(email, roles, admins, process.env.ADMIN_EMAIL), name };
}
