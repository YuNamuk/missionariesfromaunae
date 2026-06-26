import "server-only";
import { getSupabase } from "./supabase";

export interface PersonDbOverride {
  name?: string;
  name_en?: string;
  life?: string;
  org?: string;
  role?: string;
  summary?: string;
  photo?: string | null;
  wiki?: string | null;
  burial_place_id?: string | null;
  active_periods?: [number, number][];
}

export interface ContentOverlay {
  yearMin?: number;
  yearMax?: number;
  terms: Record<string, string>;
  people: Record<string, PersonDbOverride>;
}

/**
 * Reads admin-editable content from Supabase (public read). Returns null when
 * the DB isn't configured or unreachable, so the app falls back to static data.
 */
export async function fetchOverlay(): Promise<ContentOverlay | null> {
  const db = getSupabase();
  if (!db) return null;
  try {
    const [settingsRes, peopleRes] = await Promise.all([
      db.from("app_settings").select("key,value"),
      db.from("people").select("id,name,name_en,life,org,role,summary,photo,wiki,burial_place_id,active_periods"),
    ]);
    if (settingsRes.error || peopleRes.error) return null;

    const overlay: ContentOverlay = { terms: {}, people: {} };
    for (const row of settingsRes.data ?? []) {
      const v = (row as { key: string; value: unknown }).value;
      if (row.key === "year_min") overlay.yearMin = Number(v);
      else if (row.key === "year_max") overlay.yearMax = Number(v);
      else if (row.key.startsWith("term.")) overlay.terms[row.key.slice(5)] = String(v);
    }
    for (const p of peopleRes.data ?? []) {
      overlay.people[(p as { id: string }).id] = p as PersonDbOverride;
    }
    return overlay;
  } catch {
    return null;
  }
}
