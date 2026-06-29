// 개발 요청 큐 — 관리자가 프롬프트로 기능 개선을 요청하면 app_settings의 key: devreq(배열)에 쌓이고,
// VSCode의 Claude Code(자동 점검 루프 포함)가 scripts/devreq.ts 로 폴링해 처리·응답한다.
export type DevReqStatus = "pending" | "in_progress" | "done" | "question";

export type DevReq = {
  id: string;
  title: string;
  prompt: string;
  status: DevReqStatus;
  response?: string; // 개발자(Claude Code) 응답·메모·질문
  createdAt: string;
  updatedAt?: string;
};

export const STATUS_LABEL: Record<DevReqStatus, string> = {
  pending: "대기",
  in_progress: "진행 중",
  done: "완료",
  question: "질문",
};
