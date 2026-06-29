import "server-only";
import { getSupabase } from "./supabase";
import type { Topic } from "@/lib/data/topics";

// 관리자가 등록한 주제연구 — app_settings의 key: topic.<id> 에 {title,intro,people,by} 저장.
export async function fetchDbTopics(): Promise<Topic[]> {
  const db = getSupabase();
  if (!db) return [];
  try {
    const { data, error } = await db.from("app_settings").select("key,value").like("key", "topic.%");
    if (error || !data) return [];
    const out: Topic[] = [];
    for (const row of data as { key: string; value: unknown }[]) {
      const id = row.key.replace("topic.", "");
      const v = row.value as { title?: string; intro?: string; people?: unknown; by?: string; era?: string; analysis?: string } | null;
      // people가 빈 배열이면 삭제된 것으로 보고 건너뛴다.
      if (v && typeof v === "object" && Array.isArray(v.people) && v.people.length > 0) {
        out.push({
          id,
          title: String(v.title || id),
          intro: String(v.intro || ""),
          people: (v.people as unknown[]).map(String),
          by: v.by ? String(v.by) : undefined,
          era: v.era ? String(v.era) : undefined,
          analysis: v.analysis ? String(v.analysis) : undefined,
        });
      }
    }
    return out;
  } catch {
    return [];
  }
}

/** 코드 기본 주제 + DB 등록 주제 병합(같은 id면 DB가 우선). */
export async function fetchAllTopics(codeTopics: Topic[]): Promise<Topic[]> {
  const db = await fetchDbTopics();
  const dbIds = new Set(db.map((t) => t.id));
  return [...codeTopics.filter((t) => !dbIds.has(t.id)), ...db];
}
