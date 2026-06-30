// 콘텐츠 관리 권한 모델(RBAC). 4단계:
//   super   전체 관리자        — 사이트 코어 설정 + 사용자(콘텐츠 관리자) 등록
//   power   파워 콘텐츠 관리자  — 검수 없이 즉시 콘텐츠 수정 + 제안 승인/반려
//   content 콘텐츠 관리자(학생) — 수정·추가·삭제는 '제안'으로 적재(교사 승인 필요)
//   (없음)  일반 비로그인 유저  — 열람만
//
// 순수 함수/상수만 둔다(서버·클라 양쪽에서 import). 서버 검증은 호출부에서
// env ADMIN_EMAIL을 넘겨 resolveRole로 판정한다. 클라는 /api/admin/me로 받는다.

export type Role = "super" | "power" | "content";

export const ROLE_LABEL: Record<Role, string> = {
  super: "전체 관리자",
  power: "파워 콘텐츠 관리자",
  content: "콘텐츠 관리자",
};

/** 권한 비교용 등급(클수록 강함). */
export const ROLE_RANK: Record<Role, number> = { content: 1, power: 2, super: 3 };

export const isRole = (v: unknown): v is Role => v === "super" || v === "power" || v === "content";

/** role이 need 이상인가. */
export const atLeast = (role: Role | null, need: Role): boolean =>
  !!role && ROLE_RANK[role] >= ROLE_RANK[need];

/**
 * 이메일의 역할을 판정한다. roles 맵이 1순위, 그다음 레거시 admins 배열·envAdmin은
 * 전체 관리자(super)로 하위호환. ADMIN_EMAIL(envAdmin)은 항상 super라 잠김 방지.
 */
export function resolveRole(
  email: string | null | undefined,
  roles: Record<string, string> | undefined,
  admins: string[] | undefined,
  envAdmin?: string | null,
): Role | null {
  if (!email) return null;
  const e = email.toLowerCase();
  if (envAdmin && e === envAdmin.toLowerCase()) return "super";
  const r = roles?.[e];
  if (isRole(r)) return r;
  if (admins?.some((a) => a.toLowerCase() === e)) return "super";
  return null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (s: string) => EMAIL_RE.test(s.trim());

/** 붙여넣은 텍스트에서 이메일 주소들을 추출(공백·쉼표·세미콜론·줄바꿈 구분, 중복 제거·소문자화). */
export function parseEmails(text: string): string[] {
  return [...new Set(
    text
      .split(/[\s,;]+/)
      .map((s) => s.trim().toLowerCase())
      .filter((s) => s && isEmail(s)),
  )];
}
