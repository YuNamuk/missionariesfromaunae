import "server-only";
import { getSupabase } from "./supabase";
import { RESEARCH_COLUMNS, type ResearchColumn } from "@/lib/data/columns";

// 관리자 편집 오버레이 — app_settings의 key: column.<id> 에 ResearchColumn 전체 JSON 저장.
// 코드 기본 컬럼 위에 DB 값이 있으면 그 컬럼을 통째로 대체(같은 id 우선). [[research-column-pipeline]]

function isColumn(v: unknown): v is ResearchColumn {
  return !!v && typeof v === "object" && typeof (v as ResearchColumn).id === "string" && Array.isArray((v as ResearchColumn).sections);
}

/** DB에 저장된 컬럼 오버레이 맵(id → ResearchColumn). */
export async function fetchDbColumns(): Promise<Record<string, ResearchColumn>> {
  const db = getSupabase();
  if (!db) return {};
  try {
    const { data, error } = await db.from("app_settings").select("key,value").like("key", "column.%");
    if (error || !data) return {};
    const out: Record<string, ResearchColumn> = {};
    for (const row of data as { key: string; value: unknown }[]) {
      const id = row.key.replace("column.", "");
      if (isColumn(row.value)) out[id] = { ...row.value, id };
    }
    return out;
  } catch {
    return {};
  }
}

/** 단일 컬럼(코드 기본 + DB 오버레이 병합). */
export async function fetchColumn(id: string): Promise<ResearchColumn | undefined> {
  const over = await fetchDbColumns();
  return over[id] ?? RESEARCH_COLUMNS.find((c) => c.id === id);
}

/** 목록용 — 코드 기본 + DB 오버레이/신규 병합(같은 id면 DB 우선). */
export async function fetchAllColumns(): Promise<ResearchColumn[]> {
  const over = await fetchDbColumns();
  const merged = RESEARCH_COLUMNS.map((c) => over[c.id] ?? c);
  for (const [id, c] of Object.entries(over)) if (!merged.some((m) => m.id === id)) merged.push(c);
  return merged;
}
