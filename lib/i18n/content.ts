import "server-only";
import { getSupabase } from "@/lib/db/supabase";
import type { Locale } from "./locale";

// 번역 오버레이 — 한국어가 원본(정적 데이터+관리자 ko 오버레이)이고, 영어·몽골어는
// app_settings의 `i18n.<locale>.<key>`에 저장된 번역을 그 위에 덮는다(필드 단위, 없으면 ko 폴백).
//   i18n.<locale>.person.<id>  → 인물 번역(요약·서사·연표·관계 등)
//   i18n.<locale>.page.<page>  → 페이지 카피(키-값)
//   i18n.<locale>.voices       → 학생 목소리 번역(인덱스 정렬)
// scripts/translate.ts 가 자동 생성하고, /admin 에서 언어별로 수정한다.

export interface PersonI18n {
  name?: string;
  role?: string;
  org?: string;
  country?: string;
  summary?: string;
  story?: string[];
  ministry?: string[];
  journey?: string;
  influence?: string;
  beauty?: string;
  quote?: { text: string; source: string };
  facts?: [string, string][];
  timeline?: [number, string][];
  refs?: { title: string; publisher?: string }[];
  sources?: { t: string; a: string }[];
}

export interface VoiceI18n {
  text?: string;
  prompt?: string;
  context?: string;
}

async function readSetting<T>(key: string): Promise<T | null> {
  const db = getSupabase();
  if (!db) return null;
  try {
    const { data, error } = await db.from("app_settings").select("value").eq("key", key).maybeSingle();
    if (error || !data) return null;
    return (data.value ?? null) as T | null;
  } catch {
    return null;
  }
}

/** 인물 번역 오버레이(해당 로케일). ko면 null(정적 원본 사용). */
export async function fetchPersonI18n(id: string, locale: Locale): Promise<PersonI18n | null> {
  if (locale === "ko") return null;
  return readSetting<PersonI18n>(`i18n.${locale}.person.${id}`);
}

/** 모든 인물 번역 오버레이(목록·사전 등 정적 생성 시 N+1 방지). */
export async function fetchAllPersonI18n(locale: Locale): Promise<Record<string, PersonI18n>> {
  if (locale === "ko") return {};
  const db = getSupabase();
  if (!db) return {};
  try {
    const prefix = `i18n.${locale}.person.`;
    const { data, error } = await db.from("app_settings").select("key,value").like("key", `${prefix}%`);
    if (error || !data) return {};
    const out: Record<string, PersonI18n> = {};
    for (const row of data as { key: string; value: unknown }[]) {
      if (row.value && typeof row.value === "object") out[row.key.replace(prefix, "")] = row.value as PersonI18n;
    }
    return out;
  } catch {
    return {};
  }
}

/** 페이지 카피 번역 오버레이. ko면 null. */
export async function fetchPageI18n(page: string, locale: Locale): Promise<Record<string, string> | null> {
  if (locale === "ko") return null;
  return readSetting<Record<string, string>>(`i18n.${locale}.page.${page}`);
}

/** 학생 목소리 번역(인덱스 정렬). ko면 null. */
export async function fetchVoicesI18n(locale: Locale): Promise<VoiceI18n[] | null> {
  if (locale === "ko") return null;
  return readSetting<VoiceI18n[]>(`i18n.${locale}.voices`);
}

/** 장소명 번역 {id: name}. ko면 빈 객체. */
export async function fetchPlacesI18n(locale: Locale): Promise<Record<string, string>> {
  if (locale === "ko") return {};
  return (await readSetting<Record<string, string>>(`i18n.${locale}.places`)) ?? {};
}

export interface PlaceDetailI18n {
  summary?: string;
  sub?: { name: string; note: string }[];
  total?: string;
  extra?: { role?: string; note?: string }[];
}
/** 장소 상세 번역(요약·기관·묘역 안내문·추가 안장자). ko면 빈 객체. */
export async function fetchPlaceDetailI18n(locale: Locale): Promise<Record<string, PlaceDetailI18n>> {
  if (locale === "ko") return {};
  const db = getSupabase();
  if (!db) return {};
  try {
    const prefix = `i18n.${locale}.placedetail.`;
    const { data, error } = await db.from("app_settings").select("key,value").like("key", `${prefix}%`);
    if (error || !data) return {};
    const out: Record<string, PlaceDetailI18n> = {};
    for (const row of data as { key: string; value: unknown }[]) {
      if (row.value && typeof row.value === "object") out[row.key.replace(prefix, "")] = row.value as PlaceDetailI18n;
    }
    return out;
  } catch {
    return {};
  }
}

/** 관계 설명 번역 {`from|to|type`: note}. ko면 빈 객체. */
export async function fetchRelationsI18n(locale: Locale): Promise<Record<string, string>> {
  if (locale === "ko") return {};
  return (await readSetting<Record<string, string>>(`i18n.${locale}.relations`)) ?? {};
}

export interface HeritageI18n { name?: string; city?: string; region?: string; summary?: string; unesco?: string }
/** 선교 유적지 번역 {id: {...}}. ko면 빈 객체. */
export async function fetchAllHeritageI18n(locale: Locale): Promise<Record<string, HeritageI18n>> {
  if (locale === "ko") return {};
  const db = getSupabase();
  if (!db) return {};
  try {
    const prefix = `i18n.${locale}.heritage.`;
    const { data, error } = await db.from("app_settings").select("key,value").like("key", `${prefix}%`);
    if (error || !data) return {};
    const out: Record<string, HeritageI18n> = {};
    for (const row of data as { key: string; value: unknown }[]) {
      if (row.value && typeof row.value === "object") out[row.key.replace(prefix, "")] = row.value as HeritageI18n;
    }
    return out;
  } catch {
    return {};
  }
}

export interface TopicI18n { title?: string; intro?: string; analysis?: string; era?: string }
/** 모든 주제 번역 오버레이. ko면 빈 객체. */
export async function fetchAllTopicI18n(locale: Locale): Promise<Record<string, TopicI18n>> {
  if (locale === "ko") return {};
  const db = getSupabase();
  if (!db) return {};
  try {
    const prefix = `i18n.${locale}.topic.`;
    const { data, error } = await db.from("app_settings").select("key,value").like("key", `${prefix}%`);
    if (error || !data) return {};
    const out: Record<string, TopicI18n> = {};
    for (const row of data as { key: string; value: unknown }[]) {
      if (row.value && typeof row.value === "object") out[row.key.replace(prefix, "")] = row.value as TopicI18n;
    }
    return out;
  } catch {
    return {};
  }
}

/** ko 값 위에 번역 값을 덮어 고른다. 번역이 비었으면 ko. */
export function ov<T>(ko: T, tr: T | null | undefined): T {
  if (tr == null) return ko;
  if (typeof tr === "string" && tr.trim() === "") return ko;
  if (Array.isArray(tr) && tr.length === 0) return ko;
  return tr;
}
