import "server-only";
import { getSupabase } from "./supabase";
import { fetchAllColumns } from "./columns";
import { getPerson } from "@/lib/data";
import type { ColumnInterview, ColumnImage } from "@/lib/data/columns";
import type { Locale } from "@/lib/i18n/locale";
import { fetchAllPersonI18n, fetchInterviewI18n, ov } from "@/lib/i18n/content";

// 가상 인터뷰 — 심화 컬럼의 interview 데이터를 단일 출처로 재사용하고(컬럼 에디터로 수정),
// AI 재현 영상(YouTube)만 app_settings `interview.videos`(personId→{youtube,poster})로 덮는다.
// [[research-column-pipeline]]

export interface InterviewVideo { youtube?: string; poster?: string }
export interface InterviewEntry {
  id: string;            // = personId
  personId: string;
  personName: string;
  columnId: string;
  columnTitle: string;
  author: string;
  note: string;
  hero: ColumnImage;
  qa: ColumnInterview[];
  video: InterviewVideo;
}

/** YouTube URL 또는 11자 ID → 임베드 URL(없으면 null). */
export function youtubeEmbed(v?: string): string | null {
  if (!v) return null;
  const s = v.trim();
  const m = s.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/) || s.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
}

export async function fetchInterviewVideos(): Promise<Record<string, InterviewVideo>> {
  const db = getSupabase();
  if (!db) return {};
  try {
    const { data } = await db.from("app_settings").select("value").eq("key", "interview.videos").maybeSingle();
    return (data?.value && typeof data.value === "object" ? data.value : {}) as Record<string, InterviewVideo>;
  } catch { return {}; }
}

export async function fetchInterviews(locale: Locale = "ko"): Promise<InterviewEntry[]> {
  const [cols, vids, names] = await Promise.all([fetchAllColumns(), fetchInterviewVideos(), fetchAllPersonI18n(locale)]);
  return cols
    .filter((c) => Array.isArray(c.interview) && c.interview.length > 0)
    .map((c) => ({
      id: c.personId,
      personId: c.personId,
      personName: ov(getPerson(c.personId)?.name ?? c.personId, names[c.personId]?.name),
      columnId: c.id,
      columnTitle: c.title,
      author: c.author,
      note: c.interviewNote,
      hero: c.hero,
      qa: c.interview,
      video: vids[c.personId] ?? {},
    }));
}

/** 단일 인터뷰 — 문답·안내문까지 로케일 번역 오버레이 적용. */
export async function fetchInterview(personId: string, locale: Locale = "ko"): Promise<InterviewEntry | undefined> {
  const base = (await fetchInterviews(locale)).find((e) => e.personId === personId);
  if (!base) return undefined;
  const tr = await fetchInterviewI18n(personId, locale);
  if (!tr) return base;
  return {
    ...base,
    note: tr.note || base.note,
    // 번역 문답이 원본과 같은 개수면 문항별로 덮고, 아니면 원본 유지(정렬 어긋남 방지).
    qa: tr.qa && tr.qa.length === base.qa.length ? base.qa.map((x, i) => ({ q: tr.qa![i]?.q || x.q, a: tr.qa![i]?.a || x.a })) : base.qa,
  };
}
