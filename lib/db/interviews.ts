import "server-only";
import { getSupabase } from "./supabase";
import { fetchAllColumns } from "./columns";
import { getPerson } from "@/lib/data";
import type { ColumnInterview, ColumnImage } from "@/lib/data/columns";

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

export async function fetchInterviews(): Promise<InterviewEntry[]> {
  const [cols, vids] = await Promise.all([fetchAllColumns(), fetchInterviewVideos()]);
  return cols
    .filter((c) => Array.isArray(c.interview) && c.interview.length > 0)
    .map((c) => ({
      id: c.personId,
      personId: c.personId,
      personName: getPerson(c.personId)?.name ?? c.personId,
      columnId: c.id,
      columnTitle: c.title,
      author: c.author,
      note: c.interviewNote,
      hero: c.hero,
      qa: c.interview,
      video: vids[c.personId] ?? {},
    }));
}

export async function fetchInterview(personId: string): Promise<InterviewEntry | undefined> {
  return (await fetchInterviews()).find((e) => e.personId === personId);
}
