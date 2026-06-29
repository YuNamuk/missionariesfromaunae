import "server-only";
import { getSupabase } from "./supabase";

// 관리자 카드별 편집 — 스키마 변경 없이 app_settings(JSONB)에 오버레이로 저장.
//   key: content.person.<id>  → PersonContentOverride
//   key: content.page.<page>  → 페이지 카피(키-값)
// 값이 없으면 코드의 기본(TS 데이터)이 그대로 쓰인다.

export interface PersonContentOverride {
  summary?: string;
  ministry?: string[];
  journey?: string;
  influence?: string;
  beauty?: string;
  quote?: { text: string; source: string };
  story?: string[];
  videos?: { url: string; title: string; source?: string }[];
}

async function readSetting(key: string): Promise<unknown | null> {
  const db = getSupabase();
  if (!db) return null;
  try {
    const { data, error } = await db.from("app_settings").select("value").eq("key", key).maybeSingle();
    if (error || !data) return null;
    return data.value ?? null;
  } catch {
    return null;
  }
}

/** 모든 인물 콘텐츠 오버레이를 한 번에(정적 생성 시 N+1 방지). */
export async function fetchAllPersonContent(): Promise<Record<string, PersonContentOverride>> {
  const db = getSupabase();
  if (!db) return {};
  try {
    const { data, error } = await db.from("app_settings").select("key,value").like("key", "content.person.%");
    if (error || !data) return {};
    const out: Record<string, PersonContentOverride> = {};
    for (const row of data as { key: string; value: unknown }[]) {
      const id = row.key.replace("content.person.", "");
      if (row.value && typeof row.value === "object") out[id] = row.value as PersonContentOverride;
    }
    return out;
  } catch {
    return {};
  }
}

export async function fetchPersonContent(id: string): Promise<PersonContentOverride | null> {
  return (await readSetting(`content.person.${id}`)) as PersonContentOverride | null;
}

/** 형성 페이지(/story, /journey 등) 카피 오버레이. */
export async function fetchPageContent(page: string): Promise<Record<string, string> | null> {
  return (await readSetting(`content.page.${page}`)) as Record<string, string> | null;
}

// 검수/승인 큐 — 수집·컬러화 항목의 사람 검수 상태. key 예: "g:<id>:<n>"(갤러리 사진).
// 값 "approved" | "rejected"(없으면 대기). 거부 항목은 공개 사이트에서 숨긴다.
export type ReviewMap = Record<string, "approved" | "rejected">;
export async function fetchReview(): Promise<ReviewMap> {
  const v = await readSetting("review");
  return (v && typeof v === "object" ? v : {}) as ReviewMap;
}
