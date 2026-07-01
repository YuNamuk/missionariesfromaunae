// 콘텐츠 관리자(학생)의 수정 제안. app_settings 'proposals' = Proposal[].
// 콘텐츠 관리자가 저장하면 즉시 반영 대신 pending 제안으로 쌓이고,
// 파워/전체 관리자가 검수 탭에서 승인(applyChange로 실제 반영)·반려한다. [[rbac-roles]]

export type ProposalStatus = "pending" | "approved" | "rejected";

export interface Proposal {
  id: string;
  /** 적용 시 save 경로가 소비하는 원본 편집 본문 */
  kind: "person" | "settings";
  person?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  /** 사람이 읽을 요약(무엇을 바꾸는 제안인지) */
  label: string;
  /** 제안자 이메일 */
  author: string;
  status: ProposalStatus;
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  /** 반려 사유 또는 제안자 메모 */
  note?: string;
}

export const PROPOSAL_STATUS_LABEL: Record<ProposalStatus, string> = {
  pending: "검토 대기",
  approved: "승인됨",
  rejected: "반려됨",
};

/** 콘텐츠 관리자가 제안할 수 있는 app_settings 키인지(콘텐츠·번역·주제·대표만 허용). */
export function isProposableSettingKey(k: string): boolean {
  return k.startsWith("content.") || k.startsWith("i18n.") || k.startsWith("topic.") || k.startsWith("column.") || k === "meta.featured";
}
