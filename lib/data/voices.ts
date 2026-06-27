// 학생들의 목소리 — 수업에서 학생들이 적은 응답(아름다운 삶·나의 BC/AD·사명) 중
// 검토를 거쳐 게재한 짧은 글. 지어내지 않으며, 본인 동의·검토 후에만 채운다.
// 비어 있으면 /journey 페이지는 품위 있는 빈 상태를 보여준다.

export interface StudentVoice {
  /** 학생이 적은 짧은 응답(다듬되 결을 살림) */
  text: string;
  /** 표기 이름/별칭(원치 않으면 생략 → '익명의 한 학생') */
  author?: string;
  /** 어떤 질문에 대한 응답인지(예: "아름다운 삶", "나의 BC/AD", "사명 로드맵") */
  prompt?: string;
  /** 연도/학기 등 맥락(선택) */
  context?: string;
}

export const STUDENT_VOICES: StudentVoice[] = [
  // 예) { text: "...", author: "○○", prompt: "아름다운 삶", context: "2025" },
];
