"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { browserSupabase } from "@/lib/db/browser";
import { PEOPLE, getRelationships } from "@/lib/data";
import { HERITAGE } from "@/lib/data/heritage";
import { STUDENT_VOICES } from "@/lib/data/voices";
import { PHOTOS } from "@/lib/data/photos";
import { GALLERY } from "@/lib/data/gallery";
import { STATUS_LABEL, type DevReq } from "@/lib/data/devreq";
import { colorSrc } from "@/lib/data/colorized";
import { isFeatured } from "@/lib/data/meta";
import { profileFor } from "@/lib/data/profiles";
import { STORY_COPY, JOURNEY_COPY } from "@/lib/data/page-copy";
import { TOPICS } from "@/lib/data/topics";
import { ROLE_LABEL, isEmail, parseEmails, type Role } from "@/lib/data/roles";
import { PROPOSAL_STATUS_LABEL, type Proposal } from "@/lib/data/proposals";
import { LOCALES, LOCALE_NAME, type Locale } from "@/lib/i18n/locale";
import { UI_DEFAULT, UI_KEYS } from "@/lib/i18n/ui";
import { LABEL_GROUPS } from "@/lib/i18n/labels";

const C = { ink: "#251c14", muted: "#6b5e4b", line: "rgba(77,56,34,.2)", accent: "#9b3d2d" };

interface PersonRow {
  id: string; name: string; name_en: string | null; life: string | null;
  org: string | null; role: string | null; summary: string | null;
  photo: string | null; wiki: string | null; burial_place_id: string | null;
  active_periods: [number, number][] | null;
}
interface PlaceRow { id: string; name: string }

const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: "#80603b", textTransform: "uppercase", letterSpacing: ".06em", display: "block", marginBottom: 4 };
const input: React.CSSProperties = { width: "100%", border: `1px solid ${C.line}`, borderRadius: 10, padding: "8px 10px", fontSize: 13.5, background: "#fff8ec", color: C.ink, outline: "none" };
const btn: React.CSSProperties = { border: 0, borderRadius: 10, padding: "9px 16px", background: C.accent, color: "#fff8ed", fontWeight: 800, fontSize: 13, cursor: "pointer" };

export default function AdminPage() {
  const sb = browserSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  const [tab, setTab] = useState<"people" | "featured" | "research" | "pages" | "settings" | "users" | "stats" | "review" | "devreq" | "i18n">("people");
  // 번역 검수 탭: 언어·카테고리·편집 드래프트
  const [trLang, setTrLang] = useState<"en" | "mn">("en");
  const [trCat, setTrCat] = useState<"person" | "heritage" | "relations" | "voices" | "ui" | "label" | "pages" | "topics">("person");
  const [trEdits, setTrEdits] = useState<Record<string, string>>({});
  const [trQ, setTrQ] = useState("");
  // 로그인한 사용자의 콘텐츠 권한(서버 /api/admin/me에서 받음). null이면 권한 없음.
  const [myRole, setMyRole] = useState<Role | null | undefined>(undefined);
  // 사용자(콘텐츠 관리자) 역할 맵 — app_settings 'roles'(+레거시 admins 병합).
  const [roleMap, setRoleMap] = useState<Record<string, Role>>({});
  const [bulkText, setBulkText] = useState("");
  const [bulkRole, setBulkRole] = useState<Role>("content");
  const [oneEmail, setOneEmail] = useState("");
  const [oneRole, setOneRole] = useState<Role>("content");
  // 대표(featured) 토글 — 코드 FEATURED 위에 덮어쓸 오버라이드(app_settings 'meta.featured').
  const [feat, setFeat] = useState<Record<string, boolean>>({});
  const [featQ, setFeatQ] = useState("");
  // 주제연구 등록 — app_settings 'topic.<id>'.
  const [tdraft, setTdraft] = useState<{ id: string; title: string; intro: string; people: string[]; era: string; analysis: string }>({ id: "", title: "", intro: "", people: [], era: "", analysis: "" });
  const [tq, setTq] = useState("");
  const [tcat, setTcat] = useState<string | null>(null); // 주제연구 인물 선택 분류 필터
  const [review, setReview] = useState<Record<string, "approved" | "rejected">>({}); // 검수 상태(g:<id>:<n>)
  const [rework, setRework] = useState<Record<string, string>>({}); // 재작업 요청(key→사유)
  const [devreqs, setDevreqs] = useState<DevReq[]>([]); // 개발 요청 큐
  const [drTitle, setDrTitle] = useState("");
  const [drPrompt, setDrPrompt] = useState("");
  const [tPrompt, setTPrompt] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [pc, setPc] = useState<{ story: Record<string, string>; journey: Record<string, string> }>({ story: {}, journey: {} });
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [sel, setSel] = useState<string>("");
  const [draft, setDraft] = useState<PersonRow | null>(null);
  const [activeText, setActiveText] = useState("");
  const [saving, setSaving] = useState(false);
  // 상세 페이지 카드 글(스토리텔링 등) 편집 — content.person.<id> 오버레이로 저장.
  const [cd, setCd] = useState<Record<string, string>>({});
  // 카드 글 편집 언어 — ko는 content.person.<id>(원본), en/mn은 i18n.<lang>.person.<id>(번역).
  const [contentLang, setContentLang] = useState<Locale>("ko");
  const [cdVideos, setCdVideos] = useState<{ url: string; title: string; source?: string }[]>([]); // 관련 영상(유튜브) 링크들
  const [cdLinks, setCdLinks] = useState<{ label: string; href: string }[]>([]); // 외부 링크
  const [roleAdd, setRoleAdd] = useState(""); // 사역 수동 추가 입력
  const [uploading, setUploading] = useState(false);
  const [uploadColorize, setUploadColorize] = useState(true);
  const [peopleQ, setPeopleQ] = useState(""); // 선교사 선택 검색
  // 소속·사역 자동완성 후보(기존 데이터 + 통상값)
  const ORG_LIST = [...new Set(PEOPLE.map((p) => p.org).filter(Boolean))].sort();
  const ROLE_SUGGEST = ["의료", "간호", "교육", "여성 교육", "번역", "성경 반포", "전도", "목회", "부흥", "외교", "문서·출판", "고아·구제", "신학 교육"];

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [sb]);

  const loadData = useCallback(async () => {
    const [p, pl, st] = await Promise.all([
      sb.from("people").select("id,name,name_en,life,org,role,summary,photo,wiki,burial_place_id,active_periods").order("arrival_year"),
      sb.from("places").select("id,name"),
      sb.from("app_settings").select("key,value"),
    ]);
    setPeople((p.data as PersonRow[]) ?? []);
    setPlaces((pl.data as PlaceRow[]) ?? []);
    const s: Record<string, unknown> = {};
    for (const r of (st.data ?? []) as { key: string; value: unknown }[]) s[r.key] = r.value;
    setSettings(s);
    const legacyAdmins = Array.isArray(s.admins) ? (s.admins as string[]) : [];
    // 역할 맵: 레거시 admins(→전체) 위에 roles 맵을 덮는다.
    const rm: Record<string, Role> = {};
    for (const e of legacyAdmins) rm[e.toLowerCase()] = "super";
    if (s.roles && typeof s.roles === "object") {
      for (const [e, v] of Object.entries(s.roles as Record<string, unknown>)) {
        if (v === "super" || v === "power" || v === "content") rm[e.toLowerCase()] = v;
      }
    }
    setRoleMap(rm);
    setReview((s.review && typeof s.review === "object" ? s.review : {}) as Record<string, "approved" | "rejected">);
    setDevreqs(Array.isArray(s.devreq) ? (s.devreq as DevReq[]) : []);
    setRework((s.rework && typeof s.rework === "object" ? s.rework : {}) as Record<string, string>);
  }, [sb]);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  // 로그인 후 서버에서 권위 있는 내 역할을 받는다(UI 게이팅용 — 실제 권한은 서버가 강제).
  useEffect(() => {
    if (!session) { setMyRole(undefined); return; }
    (async () => {
      try {
        const token = (await sb.auth.getSession()).data.session?.access_token;
        const r = await fetch("/api/admin/me", { headers: { authorization: `Bearer ${token}` } });
        const j = await r.json();
        setMyRole((j.role ?? null) as Role | null);
      } catch { setMyRole(null); }
    })();
  }, [session, sb]);

  useEffect(() => {
    const p = people.find((x) => x.id === sel) ?? null;
    setDraft(p ? { ...p } : null);
    setActiveText(p?.active_periods?.map((a) => `${a[0]}-${a[1]}`).join("; ") ?? "");
    // 카드 글: 편집 언어에 맞는 오버레이로 초기화.
    //  - ko : content.person.<id>(원본) ?? 코드 기본값
    //  - en/mn : i18n.<lang>.person.<id>(번역). 한국어 폴백 없이 번역값/빈값만 보여줌.
    if (sel) {
      const isKo = contentLang === "ko";
      const base = isKo ? profileFor(sel) : undefined;
      const tsPerson = isKo ? PEOPLE.find((x) => x.id === sel) : undefined;
      const key = isKo ? `content.person.${sel}` : `i18n.${contentLang}.person.${sel}`;
      const ovStored = (settings[key] ?? {}) as {
        summary?: string; story?: string[]; journey?: string; ministry?: string[]; influence?: string; beauty?: string; quote?: { text: string; source: string }; videos?: { url: string; title: string; source?: string }[]; links?: { label: string; href: string }[];
      };
      // 영상·링크는 언어 공통(원본 ko 오버레이에서만 편집).
      const koOv = (settings[`content.person.${sel}`] ?? {}) as { videos?: { url: string; title: string; source?: string }[]; links?: { label: string; href: string }[] };
      setCdVideos(koOv.videos ?? base?.videos ?? []);
      const ph = PHOTOS[sel];
      const defLinks = [
        ph?.wiki ? { label: "위키백과", href: ph.wiki } : null,
        ph?.wikiEn ? { label: "Wikipedia (EN)", href: ph.wikiEn } : null,
        ph?.namu ? { label: "나무위키", href: ph.namu } : null,
      ].filter(Boolean) as { label: string; href: string }[];
      setCdLinks(koOv.links ?? defLinks);
      setCd({
        summary: ovStored.summary ?? tsPerson?.summary ?? "",
        story: (ovStored.story ?? base?.story ?? []).join("\n\n"),
        journey: ovStored.journey ?? base?.journey ?? "",
        ministry: (ovStored.ministry ?? base?.ministry ?? []).join("\n"),
        influence: ovStored.influence ?? base?.influence ?? "",
        beauty: ovStored.beauty ?? base?.beauty ?? "",
        quoteText: ovStored.quote?.text ?? base?.quote?.text ?? "",
        quoteSource: ovStored.quote?.source ?? base?.quote?.source ?? "",
      });
    } else { setCd({}); setCdVideos([]); setCdLinks([]); }
  }, [sel, people, settings, contentLang]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    if (error) setMsg("로그인 실패: " + error.message);
  }

  async function loginGoogle() {
    setMsg("");
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/admin" },
    });
    if (error) setMsg("구글 로그인 실패: " + error.message);
  }

  // 역할 맵 저장(전체 관리자 전용). 본인은 서버에서 항상 전체로 유지된다.
  async function saveRoles(next: Record<string, Role>) {
    setSaving(true); setMsg("");
    setRoleMap(next);
    const err = await post({ kind: "roles", roles: next });
    setSaving(false);
    if (err) { setMsg("저장 실패: " + err); return; }
    setMsg("✓ 사용자 권한 저장됨");
    loadData();
  }

  async function post(body: unknown) {
    const token = (await sb.auth.getSession()).data.session?.access_token;
    const r = await fetch("/api/admin/save", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    return r.ok ? null : (await r.json()).error ?? "오류";
  }

  // 사이트 재배포(전체 관리자) — 메뉴·라벨·이름 번역을 빌드시 DB에서 다시 병합해 반영.
  async function redeploy() {
    if (!window.confirm("메뉴·라벨·이름 번역을 사이트에 적용하기 위해 재배포합니다. 보통 1~2분 뒤 반영됩니다. 진행할까요?")) return;
    setSaving(true); setMsg("");
    const token = (await sb.auth.getSession()).data.session?.access_token;
    const r = await fetch("/api/admin/redeploy", { method: "POST", headers: { authorization: `Bearer ${token}` } });
    setSaving(false);
    setMsg(r.ok ? "✓ 재배포 시작됨 — 1~2분 뒤 메뉴·라벨·이름 번역이 반영됩니다." : "재배포 실패: " + ((await r.json()).error ?? "오류"));
  }

  async function savePerson() {
    if (!draft) return;
    setSaving(true); setMsg("");
    const active = activeText.split(/[;,\n]/).map((s) => s.trim()).filter(Boolean)
      .map((s) => { const m = s.match(/(\d{4})\D+(\d{4})/); return m ? [Number(m[1]), Number(m[2])] : null; })
      .filter(Boolean);
    const err = await post({ kind: "person", person: { id: draft.id, name: draft.name, name_en: draft.name_en, life: draft.life, org: draft.org, role: draft.role, summary: draft.summary, photo: draft.photo || null, wiki: draft.wiki || null, burial_place_id: draft.burial_place_id || null, active_periods: active } });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : myRole === "content" ? "✓ 제안 등록됨 — 교사 승인 후 반영됩니다" : "✓ 저장됨 (지도 새로고침 시 반영)");
    if (!err) loadData();
  }

  // 페이지 카피 드래프트 = 기본값 + 저장된 오버레이.
  useEffect(() => {
    setPc({
      story: { ...STORY_COPY, ...((settings["content.page.story"] ?? {}) as Record<string, string>) },
      journey: { ...JOURNEY_COPY, ...((settings["content.page.journey"] ?? {}) as Record<string, string>) },
    });
  }, [settings]);

  async function savePage(page: "story" | "journey") {
    setSaving(true); setMsg("");
    const err = await post({ kind: "settings", settings: { [`content.page.${page}`]: pc[page] } });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : "✓ 페이지 글 저장됨 (잠시 뒤 반영)");
    if (!err) loadData();
  }

  async function saveContent() {
    if (!sel) return;
    setSaving(true); setMsg("");
    const value: Record<string, unknown> = {};
    const t = (s?: string) => (s ?? "").trim();
    if (t(cd.summary)) value.summary = t(cd.summary);
    const story = (cd.story ?? "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
    if (story.length) value.story = story;
    if (t(cd.journey)) value.journey = t(cd.journey);
    const ministry = (cd.ministry ?? "").split(/\n/).map((s) => s.trim()).filter(Boolean);
    if (ministry.length) value.ministry = ministry;
    if (t(cd.influence)) value.influence = t(cd.influence);
    if (t(cd.beauty)) value.beauty = t(cd.beauty);
    if (t(cd.quoteText)) value.quote = { text: t(cd.quoteText), source: t(cd.quoteSource) };
    const isKo = contentLang === "ko";
    if (isKo) {
      // 영상·링크는 언어 공통 — 한국어(원본) 오버레이에만 저장.
      const vids = cdVideos.map((v) => ({ url: v.url.trim(), title: v.title.trim(), ...(v.source?.trim() ? { source: v.source.trim() } : {}) })).filter((v) => v.url);
      if (vids.length) value.videos = vids;
      const lks = cdLinks.map((l) => ({ label: l.label.trim(), href: l.href.trim() })).filter((l) => l.href);
      if (lks.length) value.links = lks;
    }
    const key = isKo ? `content.person.${sel}` : `i18n.${contentLang}.person.${sel}`;
    const err = await post({ kind: "settings", settings: { [key]: value } });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : myRole === "content" ? "✓ 제안 등록됨 — 교사 승인 후 반영됩니다" : `✓ ${isKo ? "카드 글" : LOCALE_NAME[contentLang] + " 번역"} 저장됨 (상세 페이지에 곧 반영)`);
    if (!err) loadData();
  }

  async function saveSettings() {
    setSaving(true); setMsg("");
    const err = await post({ kind: "settings", settings });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : "✓ 설정 저장됨");
  }

  const set = (k: string, v: unknown) => setSettings((s) => ({ ...s, [k]: v }));
  const upd = (k: keyof PersonRow, v: string) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  // 사진 업로드(+선택적 AI 컬러) → Supabase Storage. 성공 시 photo를 버킷 URL로 설정(저장은 '기본 정보 저장'으로).
  const uploadPhoto = async (file: File) => {
    if (!sel) return;
    setUploading(true); setMsg("");
    try {
      const token = (await sb.auth.getSession()).data.session?.access_token;
      const fd = new FormData();
      fd.append("file", file); fd.append("id", sel); fd.append("colorize", uploadColorize ? "1" : "0");
      const r = await fetch("/api/admin/upload-photo", { method: "POST", headers: { authorization: `Bearer ${token}` }, body: fd });
      const j = await r.json();
      if (!r.ok) setMsg("✗ " + (j.error || "업로드 실패"));
      else { upd("photo", j.url); setMsg("✓ 업로드 완료" + (j.colorUrl ? " · 컬러 변환됨" : uploadColorize ? " · (컬러 변환 실패, 원본만)" : "") + " — '기본 정보 저장'을 눌러 반영"); }
    } catch (e) { setMsg("✗ " + String(e).slice(0, 80)); }
    setUploading(false);
  };
  const cdu = (k: string, v: string) => setCd((s) => ({ ...s, [k]: v }));
  // 사역(role)을 ' · ' 구분 칩으로 다룬다.
  const roleChips = (draft?.role ?? "").split("·").map((s) => s.trim()).filter(Boolean);
  const addRole = (c: string) => { const t = c.trim(); if (t && !roleChips.includes(t)) upd("role", [...roleChips, t].join(" · ")); };
  const removeRole = (c: string) => upd("role", roleChips.filter((x) => x !== c).join(" · "));

  // 대표(featured) 토글: settings 로드 시 동기화, 토글은 코드 FEATURED 위에 덮어씀.
  useEffect(() => {
    const f = settings["meta.featured"];
    if (f && typeof f === "object") setFeat(f as Record<string, boolean>);
  }, [settings]);
  const featOn = (id: string) => (id in feat ? feat[id] : isFeatured(id));
  const toggleFeat = (id: string) => setFeat((s) => ({ ...s, [id]: !(id in s ? s[id] : isFeatured(id)) }));
  async function saveFeatured() {
    setSaving(true); setMsg("");
    const err = await post({ kind: "settings", settings: { "meta.featured": feat } });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : "✓ 대표 설정 저장됨 (지도·인명사전에 곧 반영)");
    if (!err) loadData();
  }

  // 주제연구 등록(app_settings 'topic.<id>')
  const dbTopics = Object.entries(settings)
    .filter(([k, v]) => k.startsWith("topic.") && v && typeof v === "object" && Array.isArray((v as { people?: unknown }).people) && (v as { people: unknown[] }).people.length > 0)
    .map(([k, v]) => ({ id: k.replace("topic.", ""), ...(v as { title: string; intro: string; people: string[]; era?: string; analysis?: string }) }));
  const loadTopic = (t: { id: string; title: string; intro: string; people: string[]; era?: string; analysis?: string }) => { setTdraft({ id: t.id, title: t.title || "", intro: t.intro || "", people: t.people || [], era: t.era || "", analysis: t.analysis || "" }); setTPrompt(""); };
  const toggleTopicPerson = (pid: string) => setTdraft((d) => ({ ...d, people: d.people.includes(pid) ? d.people.filter((x) => x !== pid) : [...d.people, pid] }));
  async function saveTopic() {
    const id = tdraft.id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
    if (!id || !tdraft.title.trim() || tdraft.people.length === 0) { setMsg("저장 실패: id·제목·선교사(1명+)는 필수입니다"); return; }
    setSaving(true); setMsg("");
    const err = await post({ kind: "settings", settings: { [`topic.${id}`]: { title: tdraft.title.trim(), intro: tdraft.intro.trim(), people: tdraft.people, era: tdraft.era.trim(), analysis: tdraft.analysis } } });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : `✓ 주제 '${tdraft.title}' 저장됨 (/research에 곧 반영)`);
    if (!err) loadData();
  }
  async function analyzeTopic() {
    if (tdraft.people.length === 0) { setMsg("분석 실패: 선교사를 1명 이상 선택하세요"); return; }
    setAnalyzing(true); setMsg("");
    try {
      const token = (await sb.auth.getSession()).data.session?.access_token;
      const r = await fetch("/api/research/analyze", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify({ people: tdraft.people, era: tdraft.era, prompt: tPrompt }) });
      const j = await r.json();
      if (!r.ok) { setMsg("분석 실패: " + (j.error ?? "오류")); }
      else { setTdraft((d) => ({ ...d, analysis: j.analysis })); setMsg("✓ 분석 생성됨 — 검토 후 '주제 저장'을 누르면 리포트에 실립니다"); }
    } catch (e) { setMsg("분석 실패: " + String(e).slice(0, 120)); }
    setAnalyzing(false);
  }
  async function deleteTopic(id: string) {
    setSaving(true); setMsg("");
    const err = await post({ kind: "settings", settings: { [`topic.${id}`]: { title: "", intro: "", people: [] } } });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : "✓ 주제 삭제됨");
    if (!err) { setTdraft({ id: "", title: "", intro: "", people: [], era: "", analysis: "" }); loadData(); }
  }

  if (!ready) return <div style={{ padding: 40, fontFamily: "var(--font-body)" }}>로딩…</div>;

  if (!session) {
    return (
      <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", color: C.ink }}>
        <form onSubmit={login} style={{ width: 320, background: "#fffdf7", border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, boxShadow: "0 18px 50px rgba(38,25,10,.12)" }}>
          <h1 className="font-display" style={{ fontWeight: 900, fontSize: 22, margin: "0 0 4px" }}>관리자 로그인</h1>
          <p style={{ margin: "0 0 16px", fontSize: 12.5, color: C.muted }}>Missionaries from Aunae 운영</p>
          <button type="button" onClick={loginGoogle} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px", background: "#fff", color: "#3c4043", fontWeight: 800, fontSize: 13, cursor: "pointer", marginBottom: 14 }}>
            <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-3.9H24v7.1h11.8c-.2 1.9-1.5 4.7-4.3 6.6l6.6 5.1C42 41.1 45 33.3 45 24z"/><path fill="#34A853" d="M24 46c5.8 0 10.6-1.9 14.1-5.2l-6.6-5.1c-1.8 1.2-4.2 2.1-7.5 2.1-5.7 0-10.6-3.9-12.3-9.1l-6.8 5.3C8.3 41 15.6 46 24 46z"/><path fill="#FBBC05" d="M11.7 28.7c-.5-1.3-.7-2.7-.7-4.7s.3-3.4.7-4.7l-6.8-5.3C3.6 16.9 3 20.3 3 24s.6 7.1 1.9 10l6.8-5.3z"/><path fill="#EA4335" d="M24 10.7c3.2 0 5.4 1.4 6.6 2.5l5.8-5.7C32.6 4.1 28.8 2 24 2 15.6 2 8.3 7 4.9 14l6.8 5.3C13.4 14.6 18.3 10.7 24 10.7z"/></svg>
            Google로 로그인
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 0 14px", color: C.muted, fontSize: 11 }}>
            <div style={{ flex: 1, height: 1, background: C.line }} /> 또는 이메일 <div style={{ flex: 1, height: 1, background: C.line }} />
          </div>
          <label style={label}>이메일</label>
          <input style={{ ...input, marginBottom: 10 }} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label style={label}>비밀번호</label>
          <input style={{ ...input, marginBottom: 16 }} type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          <button type="submit" style={{ ...btn, width: "100%" }}>로그인</button>
          {msg && <p style={{ marginTop: 12, fontSize: 12.5, color: C.accent }}>{msg}</p>}
        </form>
      </div>
    );
  }

  // 로그인했지만 서버 역할 확인 중.
  if (myRole === undefined) return <div style={{ padding: 40, fontFamily: "var(--font-body)" }}>권한 확인 중…</div>;

  // 로그인했지만 등록된 권한이 없음.
  if (myRole === null) {
    return (
      <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", color: C.ink }}>
        <div style={{ width: 360, textAlign: "center", background: "#fffdf7", border: `1px solid ${C.line}`, borderRadius: 18, padding: 28 }}>
          <h1 className="font-display" style={{ fontWeight: 900, fontSize: 20, margin: "0 0 8px" }}>접근 권한이 없습니다</h1>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 6px" }}>{session.user.email}</p>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: "0 0 18px" }}>이 계정은 아직 콘텐츠 관리자로 등록되지 않았습니다. 전체 관리자에게 등록을 요청하세요.</p>
          <button onClick={() => sb.auth.signOut()} style={{ ...btn, width: "100%", background: "#2f2419" }}>로그아웃</button>
        </div>
      </div>
    );
  }

  // 역할별 노출 탭. 콘텐츠 편집은 파워 이상, 코어 설정·사용자 관리는 전체 관리자만.
  const TAB_LABEL: Record<string, string> = { people: "선교사 정보", featured: "대표 표기", research: "주제연구", pages: "페이지 글", i18n: "번역 관리", settings: "연도·용어 설정", users: "사용자 관리", stats: "방문 통계", review: "검수", devreq: "개발 요청" };
  const TABS_BY_ROLE: Record<Role, string[]> = {
    super: ["people", "featured", "research", "pages", "i18n", "settings", "users", "stats", "review", "devreq"],
    power: ["people", "featured", "research", "pages", "i18n", "stats", "review", "devreq"],
    content: ["people", "i18n", "stats"],
  };
  const visibleTabs = TABS_BY_ROLE[myRole];
  const activeTab = visibleTabs.includes(tab) ? tab : visibleTabs[0];
  // 좌측 네비 — 기능을 그룹으로 묶어 직관적으로.
  const TAB_ICON: Record<string, string> = { people: "👤", featured: "★", research: "📚", pages: "📄", i18n: "🌐", settings: "⚙", users: "👥", stats: "📊", review: "✅", devreq: "🛠" };
  const TAB_DESC: Record<string, string> = { people: "인물 정보·카드 글·사진", featured: "지도·사전 대표(★) 표기", research: "주제별 통합 리포트", pages: "들어가며·여정 페이지 글", i18n: "콘텐츠·메뉴 번역 검수", settings: "연도 범위·역할 용어", users: "콘텐츠 관리자 권한", stats: "방문자 통계", review: "수정 제안·사진 검수", devreq: "기능 개선 요청" };
  const NAV_GROUPS: { title: string; tabs: string[] }[] = [
    { title: "콘텐츠", tabs: ["people", "featured", "research", "pages"] },
    { title: "번역", tabs: ["i18n"] },
    { title: "검수", tabs: ["review"] },
    { title: "운영", tabs: ["users", "settings", "stats", "devreq"] },
  ];

  return (
    <div style={{ width: "100%", padding: "24px 28px 80px", fontFamily: "var(--font-body)", color: C.ink }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h1 className="font-display" style={{ fontWeight: 900, fontSize: 24, margin: 0 }}>관리자</h1>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: "#1f6f8b", background: "rgba(31,111,139,.1)", borderRadius: 99, padding: "3px 10px" }}>{ROLE_LABEL[myRole]}</span>
          <span style={{ fontSize: 12, color: C.muted }}>{session.user.email}</span>
        </div>
        <button onClick={() => sb.auth.signOut()} style={{ ...btn, background: "#2f2419", padding: "7px 14px", fontSize: 12.5 }}>로그아웃</button>
      </div>

      <div className="admin-shell" style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 22, alignItems: "start" }}>
        <style>{`@media(max-width:760px){.admin-shell{grid-template-columns:1fr!important;}.admin-nav{position:static!important;display:flex!important;flex-wrap:wrap!important;gap:6px!important;}.admin-nav .nav-group{margin:0!important;}.admin-nav .nav-group-title{display:none!important;}}`}</style>
        {/* 좌측 그룹 네비 */}
        <aside className="admin-nav" style={{ position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          {NAV_GROUPS.map((g) => {
            const ts = g.tabs.filter((t) => visibleTabs.includes(t));
            if (!ts.length) return null;
            return (
              <div key={g.title} className="nav-group">
                <div className="nav-group-title" style={{ fontSize: 10, fontWeight: 900, letterSpacing: ".1em", textTransform: "uppercase", color: "#a07d4e", padding: "0 6px 6px" }}>{g.title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {ts.map((t) => {
                    const on = activeTab === t;
                    return (
                      <button key={t} onClick={() => setTab(t as typeof tab)} title={TAB_DESC[t]} style={{ display: "flex", alignItems: "center", gap: 9, textAlign: "left", border: 0, borderRadius: 10, padding: "9px 11px", background: on ? "#2f2419" : "transparent", color: on ? "#fff8ed" : "#5f4d39", fontWeight: 800, fontSize: 13, cursor: "pointer", width: "100%" }}>
                        <span style={{ fontSize: 14, width: 18, textAlign: "center", flex: "0 0 auto" }}>{TAB_ICON[t]}</span>
                        <span style={{ flex: 1, minWidth: 0 }}>{TAB_LABEL[t]}</span>
                        {t === "review" && (() => { const n = (Array.isArray(settings.proposals) ? settings.proposals : []).filter((p: { status?: string }) => p?.status === "pending").length; return n > 0 ? <span style={{ background: "#9b3d2d", color: "#fff8ed", borderRadius: 99, fontSize: 10, fontWeight: 800, padding: "0 6px" }}>{n}</span> : null; })()}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        {/* 우측 콘텐츠 */}
        <div style={{ minWidth: 0 }}>
          <div style={{ marginBottom: 16 }}>
            <h2 className="font-display" style={{ fontWeight: 900, fontSize: 19, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><span>{TAB_ICON[activeTab]}</span>{TAB_LABEL[activeTab]}</h2>
            <p style={{ margin: "3px 0 0", fontSize: 12.5, color: C.muted }}>{TAB_DESC[activeTab]}</p>
          </div>

      {msg && <p style={{ marginBottom: 14, fontSize: 13, fontWeight: 700, color: msg.startsWith("✓") ? "#2f6b3b" : C.accent }}>{msg}</p>}

      {myRole === "content" && (
        <div style={{ border: `1px solid rgba(31,111,139,.3)`, borderRadius: 14, padding: "12px 16px", background: "rgba(31,111,139,.06)", fontSize: 13, lineHeight: 1.65, color: C.ink, marginBottom: 14 }}>
          <b>콘텐츠 관리자</b> — 선교사 정보·번역을 수정하면 <b>교사(파워/전체 관리자) 승인 대기 제안</b>으로 등록됩니다. 승인되면 사이트에 반영돼요.
        </div>
      )}

      {activeTab === "people" && (
        <div style={{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
            <input style={input} value={peopleQ} onChange={(e) => setPeopleQ(e.target.value)} placeholder="이름·영문·사역 검색" />
            <div style={{ overflowY: "auto", maxHeight: 520, display: "flex", flexDirection: "column", gap: 3, border: `1px solid ${C.line}`, borderRadius: 12, padding: 6, background: "#fff8ec" }}>
              {people.filter((p) => { const q = peopleQ.trim().toLowerCase(); return !q || `${p.name} ${p.name_en ?? ""} ${p.role ?? ""} ${p.org ?? ""}`.toLowerCase().includes(q); }).map((p) => {
                const photo = PHOTOS[p.id]?.photo ?? p.photo;
                const on = sel === p.id;
                return (
                  <button key={p.id} onClick={() => setSel(p.id)} style={{ display: "flex", gap: 8, alignItems: "center", textAlign: "left", padding: 6, borderRadius: 9, border: 0, background: on ? "#2f2419" : "transparent", color: on ? "#fff8ed" : C.ink, cursor: "pointer", width: "100%" }}>
                    {photo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={photo} alt="" loading="lazy" style={{ width: 36, height: 44, objectFit: "cover", borderRadius: 6, flex: "0 0 auto", background: "#efe1c3" }} />
                      : <span style={{ width: 36, height: 44, flex: "0 0 auto", borderRadius: 6, background: "#7a4a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8ec", fontSize: 16 }}>{p.name?.[0] ?? "·"}</span>}
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontSize: 13, fontWeight: 800 }}>{p.name} <span style={{ fontWeight: 500, opacity: 0.6, fontSize: 11 }}>{p.life}</span></span>
                      <span style={{ display: "block", fontSize: 10.5, opacity: on ? 0.8 : 0.6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{[p.org, p.role].filter(Boolean).join(" · ")}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {draft ? (
            <div style={{ display: "grid", gap: 12 }}>
              {/* 사진 — 가장 상단(현재 사진 + 컬러본 미리보기 + 업로드) */}
              <div>
                <label style={label}>사진</label>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                  {[["원본", draft.photo], ["컬러", colorSrc(draft.photo)]].map(([lbl, src]) => src ? (
                    <figure key={lbl as string} style={{ margin: 0 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src as string} alt={lbl as string} style={{ width: 92, height: 118, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.line}`, background: "#efe1c3", display: "block" }} />
                      <figcaption style={{ fontSize: 10.5, color: C.muted, textAlign: "center", marginTop: 3 }}>{lbl as string}</figcaption>
                    </figure>
                  ) : (lbl === "컬러" ? <figcaption key="nc" style={{ fontSize: 10.5, color: C.muted, alignSelf: "flex-end" }}>컬러본 없음</figcaption> : null))}
                  <input style={{ ...input, flex: 1 }} value={draft.photo ?? ""} onChange={(e) => upd("photo", e.target.value)} placeholder="/portraits/<id>.jpg 또는 URL" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                  <label style={{ ...btn, display: "inline-flex", alignItems: "center", gap: 6, cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1, background: "#1f6f8b" }}>
                    {uploading ? "업로드 중…" : "사진 업로드"}
                    <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.currentTarget.value = ""; }} />
                  </label>
                  <label style={{ fontSize: 12.5, fontWeight: 700, color: C.muted, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    <input type="checkbox" checked={uploadColorize} onChange={(e) => setUploadColorize(e.target.checked)} /> AI 컬러 변환 함께
                  </label>
                </div>
                <p style={{ margin: "5px 0 0", fontSize: 11, color: C.muted }}>※ 업로드 시 Supabase Storage에 저장되고, 체크 시 AI 컬러본도 함께 생성됩니다. 미리보기 확인 후 ‘기본 정보 저장’으로 반영.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={label}>이름</label><input style={input} value={draft.name ?? ""} onChange={(e) => upd("name", e.target.value)} /></div>
                <div><label style={label}>영문명</label><input style={input} value={draft.name_en ?? ""} onChange={(e) => upd("name_en", e.target.value)} /></div>
                <div><label style={label}>생몰 (예: 1858–1902)</label><input style={input} value={draft.life ?? ""} onChange={(e) => upd("life", e.target.value)} /></div>
                <div>
                  <label style={label}>소속 (선택 또는 직접 입력)</label>
                  <input style={input} list="org-list" value={draft.org ?? ""} onChange={(e) => upd("org", e.target.value)} placeholder="예: 북장로회" />
                  <datalist id="org-list">{ORG_LIST.map((o) => <option key={o} value={o} />)}</datalist>
                </div>
                <div>
                  <label style={label}>안장 묘역</label>
                  <select style={input} value={draft.burial_place_id ?? ""} onChange={(e) => upd("burial_place_id", e.target.value)}>
                    <option value="">(없음)</option>
                    {places.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                  </select>
                </div>
              </div>
              {/* 사역 — 여러 개 칩(추천 클릭 추가 + 수동 입력) */}
              <div>
                <label style={label}>사역 (여러 개 · 클릭 추가/수동 입력)</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "2px 0 6px" }}>
                  {roleChips.length === 0 && <span style={{ fontSize: 12, color: C.muted }}>아직 없음</span>}
                  {roleChips.map((c) => (
                    <button key={c} onClick={() => removeRole(c)} style={{ background: "#2f2419", color: "#fff8ed", border: 0, borderRadius: 99, padding: "3px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{c} ✕</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                  {ROLE_SUGGEST.filter((s) => !roleChips.includes(s)).map((s) => (
                    <button key={s} onClick={() => addRole(s)} style={{ border: `1px dashed ${C.line}`, borderRadius: 99, padding: "3px 9px", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 11.5, fontWeight: 700 }}>+ {s}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input style={{ ...input, flex: 1 }} value={roleAdd} onChange={(e) => setRoleAdd(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { addRole(roleAdd); setRoleAdd(""); } }} placeholder="직접 입력 후 Enter 또는 추가" />
                  <button onClick={() => { addRole(roleAdd); setRoleAdd(""); }} style={{ ...btn }}>추가</button>
                </div>
              </div>
              <div><label style={label}>요약</label><textarea style={{ ...input, minHeight: 90, resize: "vertical" }} value={draft.summary ?? ""} onChange={(e) => upd("summary", e.target.value)} /></div>
              <div><label style={label}>조선 사역 구간 (예: 1885-1902; 1949-1949)</label><input style={input} value={activeText} onChange={(e) => setActiveText(e.target.value)} /></div>
              <button onClick={savePerson} disabled={saving} style={{ ...btn, justifySelf: "start", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "기본 정보 저장 (지도)"}</button>

              {/* 상세 페이지 카드 글 편집 — content.person.<id> 오버레이 */}
              <div style={{ marginTop: 10, paddingTop: 16, borderTop: `1px solid ${C.line}` }}>
                <h3 className="font-display" style={{ fontWeight: 900, fontSize: 16, margin: "0 0 8px" }}>상세 페이지 카드 글</h3>
                {/* 편집 언어 선택 — ko는 원본, en/mn은 번역(자동 생성본을 여기서 다듬음) */}
                <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                  {LOCALES.map((l) => (
                    <button key={l} onClick={() => setContentLang(l)} style={{ border: `1px solid ${contentLang === l ? "#1f6f8b" : C.line}`, borderRadius: 99, padding: "4px 12px", background: contentLang === l ? "#1f6f8b" : "transparent", color: contentLang === l ? "#fff8ed" : C.muted, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
                      {LOCALE_NAME[l]}{l === "ko" ? " (원본)" : ""}
                    </button>
                  ))}
                </div>
                <p style={{ margin: "0 0 14px", fontSize: 11.5, color: C.muted }}>
                  {contentLang === "ko"
                    ? <>인물 상세(/people/{sel}) 페이지의 카드. 비우면 기본값으로 되돌아갑니다. 저장 후 잠시 뒤 반영.</>
                    : <><b>{LOCALE_NAME[contentLang]} 번역</b> 편집 — 자동 번역본을 다듬는 자리입니다. 비우면 한국어로 표시됩니다. (영상·링크는 ‘원본’ 탭에서만 편집)</>}
                </p>
                <div style={{ display: "grid", gap: 12 }}>
                  <div><label style={label}>상세 요약</label><textarea style={{ ...input, minHeight: 70, resize: "vertical" }} value={cd.summary ?? ""} onChange={(e) => cdu("summary", e.target.value)} /></div>
                  <div><label style={label}>이야기 (서사) — 문단은 빈 줄로 구분</label><textarea style={{ ...input, minHeight: 200, resize: "vertical", lineHeight: 1.6 }} value={cd.story ?? ""} onChange={(e) => cdu("story", e.target.value)} /></div>
                  <div><label style={label}>큰 흐름 속 여정 (이야기가 비면 표시)</label><textarea style={{ ...input, minHeight: 70, resize: "vertical" }} value={cd.journey ?? ""} onChange={(e) => cdu("journey", e.target.value)} /></div>
                  <div><label style={label}>걸어온 사역 — 한 줄에 하나</label><textarea style={{ ...input, minHeight: 90, resize: "vertical" }} value={cd.ministry ?? ""} onChange={(e) => cdu("ministry", e.target.value)} /></div>
                  <div><label style={label}>남긴 열매</label><textarea style={{ ...input, minHeight: 70, resize: "vertical" }} value={cd.influence ?? ""} onChange={(e) => cdu("influence", e.target.value)} /></div>
                  <div><label style={label}>이 삶에서 아름다운 것 · 치른 값 (선택)</label><textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={cd.beauty ?? ""} onChange={(e) => cdu("beauty", e.target.value)} /></div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div><label style={label}>1차 자료 인용</label><textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={cd.quoteText ?? ""} onChange={(e) => cdu("quoteText", e.target.value)} /></div>
                    <div><label style={label}>인용 출처</label><textarea style={{ ...input, minHeight: 60, resize: "vertical" }} value={cd.quoteSource ?? ""} onChange={(e) => cdu("quoteSource", e.target.value)} /></div>
                  </div>
                  {/* 영상·링크는 언어 공통 — 원본(한국어) 편집에서만 노출 */}
                  {contentLang === "ko" && (<>
                  {/* 관련 영상(유튜브) — 여러 개 추가·수정·삭제 */}
                  <div>
                    <label style={label}>관련 영상 (유튜브 등) · {cdVideos.length}개</label>
                    <div style={{ display: "grid", gap: 8 }}>
                      {cdVideos.map((v, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr auto", gap: 6, alignItems: "center" }}>
                          <input style={input} value={v.url} onChange={(e) => setCdVideos((arr) => arr.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} placeholder="https://youtu.be/… (영상 URL)" />
                          <input style={input} value={v.title} onChange={(e) => setCdVideos((arr) => arr.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="제목/설명" />
                          <button onClick={() => setCdVideos((arr) => arr.filter((_, j) => j !== i))} style={{ border: `1px solid ${C.line}`, borderRadius: 99, padding: "6px 12px", background: "transparent", color: C.accent, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>삭제</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setCdVideos((arr) => [...arr, { url: "", title: "" }])} style={{ marginTop: 8, border: `1px dashed ${C.line}`, borderRadius: 10, padding: "7px 14px", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12.5, fontWeight: 800 }}>+ 링크 추가</button>
                  </div>
                  {/* 외부 링크 — 수정·추가·삭제 */}
                  <div>
                    <label style={label}>외부 링크 · {cdLinks.length}개 (위키·나무위키 등)</label>
                    <div style={{ display: "grid", gap: 8 }}>
                      {cdLinks.map((l, i) => (
                        <div key={i} style={{ display: "grid", gridTemplateColumns: "0.7fr 1.5fr auto", gap: 6, alignItems: "center" }}>
                          <input style={input} value={l.label} onChange={(e) => setCdLinks((arr) => arr.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="표기 (예: 위키백과)" />
                          <input style={input} value={l.href} onChange={(e) => setCdLinks((arr) => arr.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} placeholder="https://…" />
                          <button onClick={() => setCdLinks((arr) => arr.filter((_, j) => j !== i))} style={{ border: `1px solid ${C.line}`, borderRadius: 99, padding: "6px 12px", background: "transparent", color: C.accent, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>삭제</button>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => setCdLinks((arr) => [...arr, { label: "", href: "" }])} style={{ marginTop: 8, border: `1px dashed ${C.line}`, borderRadius: 10, padding: "7px 14px", background: "transparent", color: C.muted, cursor: "pointer", fontSize: 12.5, fontWeight: 800 }}>+ 링크 추가</button>
                  </div>
                  </>)}
                  <button onClick={saveContent} disabled={saving} style={{ ...btn, justifySelf: "start", background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : (contentLang === "ko" ? "카드 글·링크 저장 (상세 페이지)" : `${LOCALE_NAME[contentLang]} 번역 저장`)}</button>
                </div>
              </div>
            </div>
          ) : <p style={{ color: C.muted, fontSize: 13 }}>왼쪽에서 선교사를 선택하세요.</p>}
        </div>
      )}

      {activeTab === "featured" && (() => {
        const list = PEOPLE.filter((p) => !featQ || `${p.name} ${p.en}`.toLowerCase().includes(featQ.toLowerCase())).slice().sort((a, b) => a.year - b.year);
        const count = PEOPLE.filter((p) => featOn(p.id)).length;
        return (
          <div>
            <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.6, color: C.muted }}>
              지도·목록에서 <b>대표(★)</b>로 보일 선교사와, <b>검색을 통해서만</b> 조회되는 선교사를 정합니다. 토글한 뒤 아래 저장을 누르세요. (지도 ‘대표만’ 기본 보기·인명사전 ★ 표기에 반영)
            </p>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <input placeholder="이름·영문 검색" value={featQ} onChange={(e) => setFeatQ(e.target.value)} style={{ ...input, flex: 1 }} />
              <span style={{ fontSize: 12.5, fontWeight: 800, color: C.muted, whiteSpace: "nowrap" }}>대표 {count} / 전체 {PEOPLE.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(118px,1fr))", gap: 10, maxHeight: 540, overflowY: "auto", padding: 2 }}>
              {list.map((p) => {
                const on = featOn(p.id);
                const photo = PHOTOS[p.id]?.photo;
                return (
                  <button key={p.id} onClick={() => toggleFeat(p.id)} title={`${p.name} · ${p.en}`} style={{ position: "relative", border: `2px solid ${on ? "#bf6b22" : C.line}`, borderRadius: 12, overflow: "hidden", background: "#fff8ec", cursor: "pointer", padding: 0, textAlign: "left", opacity: on ? 1 : 0.66 }}>
                    {photo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={photo} alt="" loading="lazy" style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block", background: "#efe1c3" }} />
                      : <span style={{ display: "flex", aspectRatio: "3 / 4", alignItems: "center", justifyContent: "center", background: "#7a4a2e", color: "#fff8ec", fontSize: 30 }}>{p.glyph}</span>}
                    {on && <span style={{ position: "absolute", right: 5, top: 5, background: "#bf6b22", color: "#fff8ed", borderRadius: 99, padding: "0 7px", fontSize: 12, fontWeight: 900, boxShadow: "0 1px 4px rgba(0,0,0,.3)" }}>★</span>}
                    <span style={{ display: "block", padding: "5px 7px" }}>
                      <span style={{ display: "block", fontSize: 12, fontWeight: 800, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                      <span style={{ display: "block", fontSize: 10, color: on ? "#bf6b22" : C.muted, fontWeight: 700 }}>{p.year} · {on ? "★ 대표" : "검색전용"}</span>
                    </span>
                  </button>
                );
              })}
              {list.length === 0 && <div style={{ padding: 14, fontSize: 13, color: C.muted, gridColumn: "1 / -1" }}>검색 결과 없음</div>}
            </div>
            <button onClick={saveFeatured} disabled={saving} style={{ ...btn, marginTop: 14 }}>{saving ? "저장 중…" : "대표 설정 저장"}</button>
          </div>
        );
      })()}

      {activeTab === "research" && (
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.6, color: C.muted }}>
            주제에 선교사를 묶어 등록하면 <b>/research</b>에 통합 리포트(인물·관계·장소·유적·링크·활동기간)가 생깁니다. 코드 기본 예시 주제 위에 누적되며, 같은 id면 등록 주제가 우선합니다.
          </p>
          {dbTopics.length > 0 && (
            <div style={{ marginBottom: 16, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
              {dbTopics.map((t) => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: `1px solid ${C.line}` }}>
                  <button onClick={() => loadTopic(t)} style={{ background: "none", border: 0, cursor: "pointer", color: C.ink, fontSize: 13, fontWeight: 700, textAlign: "left" }}>{t.title} <span style={{ color: C.muted, fontWeight: 500 }}>· {t.people.length}명 · {t.id}</span></button>
                  <button onClick={() => deleteTopic(t.id)} style={{ background: "none", border: `1px solid ${C.line}`, borderRadius: 99, padding: "2px 10px", cursor: "pointer", color: C.accent, fontSize: 11.5, fontWeight: 700 }}>삭제</button>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div><label style={label}>주제 id (영문·하이픈)</label><input style={input} value={tdraft.id} onChange={(e) => setTdraft((d) => ({ ...d, id: e.target.value }))} placeholder="예: women-education" /></div>
            <div><label style={label}>제목</label><input style={input} value={tdraft.title} onChange={(e) => setTdraft((d) => ({ ...d, title: e.target.value }))} placeholder="주제 제목" /></div>
          </div>
          <label style={label}>소개</label>
          <textarea style={{ ...input, minHeight: 80, marginBottom: 10 }} value={tdraft.intro} onChange={(e) => setTdraft((d) => ({ ...d, intro: e.target.value }))} placeholder="이 주제의 의미를 한두 문단으로…" />
          <label style={label}>선교사 선택 · {tdraft.people.length}명</label>
          {tdraft.people.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0" }}>
              {tdraft.people.map((pid) => { const pp = PEOPLE.find((x) => x.id === pid); return (
                <button key={pid} onClick={() => toggleTopicPerson(pid)} style={{ background: "#2f2419", color: "#fff8ed", border: 0, borderRadius: 99, padding: "3px 10px", cursor: "pointer", fontSize: 12, fontWeight: 700 }}>{pp?.name ?? pid} ✕</button>
              ); })}
            </div>
          )}
          <input style={{ ...input, marginBottom: 8 }} value={tq} onChange={(e) => setTq(e.target.value)} placeholder="이름·영문 검색" />
          {/* 분류 토글: 역할(role) 키워드 기반 — 의료·교육·번역·목회/전도 */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {([["전체", null], ["의료", "의료"], ["교육", "교육"], ["번역", "번역"], ["목회·전도", "목회"]] as const).map(([lbl, key]) => {
              const on = tcat === key;
              return <button key={lbl} onClick={() => setTcat(key)} style={{ border: `1px solid ${on ? "#9b3d2d" : C.line}`, borderRadius: 99, padding: "4px 12px", background: on ? "#9b3d2d" : "transparent", color: on ? "#fff8ed" : C.muted, cursor: "pointer", fontSize: 12, fontWeight: 800 }}>{lbl}</button>;
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8, maxHeight: 360, overflowY: "auto", padding: 2 }}>
            {PEOPLE.filter((p) => {
              if (tq && !`${p.name} ${p.en}`.toLowerCase().includes(tq.toLowerCase())) return false;
              if (tcat) {
                const r = p.role;
                const ok = tcat === "의료" ? /의료|간호/.test(r) : tcat === "교육" ? /교육|한글|학/.test(r) : tcat === "번역" ? /번역|성경/.test(r) : /전도|목회|부흥|반포/.test(r);
                if (!ok) return false;
              }
              return true;
            }).map((p) => {
              const on = tdraft.people.includes(p.id);
              const photo = PHOTOS[p.id]?.photo;
              return (
                <button key={p.id} onClick={() => toggleTopicPerson(p.id)} title={p.summary} style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "left", padding: 8, borderRadius: 12, border: `1.5px solid ${on ? "#9b3d2d" : C.line}`, background: on ? "rgba(155,61,45,.08)" : "#fff8ec", cursor: "pointer", position: "relative" }}>
                  {on && <span style={{ position: "absolute", right: 6, top: 6, width: 18, height: 18, borderRadius: 99, background: "#9b3d2d", color: "#fff8ed", fontSize: 11, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>}
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {photo
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={photo} alt="" style={{ width: 38, height: 46, flex: "0 0 auto", borderRadius: 7, objectFit: "cover", background: "#efe1c3" }} />
                      : <span style={{ width: 38, height: 46, flex: "0 0 auto", borderRadius: 7, background: "var(--grad-dream,#7a4a2e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8ec", fontSize: 18 }}>{p.glyph}</span>}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 800, color: C.ink }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{p.year} · {p.role}</div>
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: 10.5, lineHeight: 1.45, color: "#6b5e4b", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.summary}</p>
                </button>
              );
            })}
          </div>
          {/* AI 분석 */}
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: ".08em", color: "#80603b", marginBottom: 8 }}>AI 분석 (선택 선교사·시대 기반)</div>
            <label style={label}>시대/배경 메모 (분석 입력, 선택)</label>
            <input style={{ ...input, marginBottom: 8 }} value={tdraft.era} onChange={(e) => setTdraft((d) => ({ ...d, era: e.target.value }))} placeholder="예: 1885–1910 개항기, 갑신정변 이후 선교 개방" />
            <label style={label}>분석 프롬프트</label>
            <textarea style={{ ...input, minHeight: 60, marginBottom: 8 }} value={tPrompt} onChange={(e) => setTPrompt(e.target.value)} placeholder="예: 이 인물들의 상관관계와 평양 대부흥에 미친 영향을 분석해줘" />
            <button onClick={analyzeTopic} disabled={analyzing} style={{ ...btn, background: "#1f6f8b" }}>{analyzing ? "분석 중… (최대 1분)" : "🤖 AI 분석 생성"}</button>
            {tdraft.analysis && (
              <div style={{ marginTop: 10 }}>
                <label style={label}>분석 결과 (수정 가능 — 주제 저장 시 리포트에 실림)</label>
                <textarea style={{ ...input, minHeight: 220, fontFamily: "var(--font-serif)", lineHeight: 1.7, fontSize: 13 }} value={tdraft.analysis} onChange={(e) => setTdraft((d) => ({ ...d, analysis: e.target.value }))} />
              </div>
            )}
            <p style={{ margin: "8px 0 0", fontSize: 11.5, lineHeight: 1.5, color: C.muted }}>※ 분석은 선택한 선교사의 사이트 검증 데이터(요약·연표·관계·인용)를 근거로 생성됩니다. 작동하려면 Vercel 환경변수 <b>ANTHROPIC_API_KEY</b>가 필요합니다.</p>
          </div>
          <button onClick={saveTopic} disabled={saving} style={{ ...btn, marginTop: 14 }}>{saving ? "저장 중…" : "주제 저장"}</button>
        </div>
      )}

      {activeTab === "pages" && (
        <div style={{ display: "grid", gap: 28 }}>
          {([
            { page: "story" as const, title: "들어가며 (/story)", labels: { heroKicker: "상단 영문", heroQuestion: "히어로 질문 (줄바꿈 가능)", heroLead: "질문 소개", m1Title: "움직임 1 제목", costTitle: "‘값을 치른’ 제목", homeTitle: "‘Korea is home’ 제목", m2Title: "움직임 2 제목", nextRunner: "다음 주자 문구 (줄바꿈 가능)", closeTitle: "마무리 제목", closeLead: "마무리 글" } },
            { page: "journey" as const, title: "우리의 여정 (/journey)", labels: { heroTitle: "히어로 제목", heroLead: "히어로 소개", lineageTitle: "복음의 계보 제목", lineageLead: "복음의 계보 소개", bookTitle: "학생들이 쓴 책 제목", bookLead: "학생들이 쓴 책 소개", tripTitle: "탐방의 기록 제목", tripLead: "탐방의 기록 소개", voicesTitle: "학생들의 목소리 제목" } },
          ]).map(({ page, title, labels }) => (
            <div key={page}>
              <h3 className="font-display" style={{ fontWeight: 900, fontSize: 17, margin: "0 0 12px" }}>{title}</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {Object.entries(labels).map(([k, lab]) => (
                  <div key={k}>
                    <label style={label}>{lab}</label>
                    <textarea style={{ ...input, minHeight: k.endsWith("Lead") || k === "heroLead" || k === "closeLead" ? 70 : 44, resize: "vertical" }}
                      value={pc[page][k] ?? ""} onChange={(e) => setPc((s) => ({ ...s, [page]: { ...s[page], [k]: e.target.value } }))} />
                  </div>
                ))}
                <button onClick={() => savePage(page)} disabled={saving} style={{ ...btn, justifySelf: "start", background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : `${title.split(" ")[0]} 글 저장`}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "i18n" && (() => {
        const langs: ("en" | "mn")[] = ["en", "mn"];
        const cats = [["person", "선교사"], ["heritage", "유적지"], ["relations", "관계 설명"], ["voices", "학생 목소리"], ["topics", "주제연구"], ["pages", "페이지 글"], ["ui", "메뉴·버튼"], ["label", "분류 라벨"]] as const;
        const isUiCat = trCat === "ui" || trCat === "label"; // 코드 사전 — 저장 후 export-ui+배포 필요
        const ev = (fid: string, fallback: string) => (fid in trEdits ? trEdits[fid] : fallback);
        const setEv = (fid: string, v: string) => setTrEdits((s) => ({ ...s, [fid]: v }));
        const switchTo = (next: Partial<{ lang: "en" | "mn"; cat: typeof trCat }>) => { setTrEdits({}); if (next.lang) setTrLang(next.lang); if (next.cat) setTrCat(next.cat); };
        const saveTr = async (key: string, value: unknown) => {
          setSaving(true); setMsg("");
          const err = await post({ kind: "settings", settings: { [key]: value } });
          setSaving(false);
          setMsg(err ? "저장 실패: " + err : myRole === "content" ? "✓ 번역 제안 등록됨 — 교사 승인 후 반영" : "✓ 번역 저장됨 (잠시 뒤 사이트 반영)");
          if (!err) loadData();
        };
        const q = trQ.trim().toLowerCase();
        const koCell = (s: string) => <div style={{ fontSize: 12.5, lineHeight: 1.6, color: C.muted, background: "rgba(0,0,0,.03)", border: `1px solid ${C.line}`, borderRadius: 8, padding: "7px 9px", whiteSpace: "pre-wrap" }}>{s || <span style={{ opacity: 0.5 }}>—</span>}</div>;
        const ta = (fid: string, fallback: string, minH = 56) => <textarea value={ev(fid, fallback)} onChange={(e) => setEv(fid, e.target.value)} style={{ ...input, minHeight: minH, resize: "vertical", lineHeight: 1.6 }} placeholder={`${LOCALE_NAME[trLang]} 번역`} />;
        const row2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, alignItems: "start" };

        return (
          <div style={{ display: "grid", gap: 14 }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: C.muted }}>
              자동 번역본을 한국어 원문과 대조해 다듬는 자리입니다. 왼쪽이 <b>한국어 원문</b>, 오른쪽이 <b>{LOCALE_NAME[trLang]} 번역</b>(수정 가능). 비우면 사이트에서 한국어로 표시됩니다. 몽골어는 방문 선생님 등 원어민 검수를 권장합니다.
            </p>
            {myRole === "super" && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(31,111,139,.07)", border: `1px solid ${C.line}`, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: C.muted, flex: 1, minWidth: 200 }}>콘텐츠 번역은 저장 즉시 반영됩니다. <b>메뉴·라벨·이름</b> 번역은 아래 버튼으로 사이트에 적용하세요.</span>
                <button onClick={redeploy} disabled={saving} style={{ ...btn, background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>사이트에 적용(재배포)</button>
              </div>
            )}
            {/* 언어 + 카테고리 */}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {langs.map((l) => (
                  <button key={l} onClick={() => switchTo({ lang: l })} style={{ border: `1px solid ${trLang === l ? "#1f6f8b" : C.line}`, borderRadius: 99, padding: "5px 14px", background: trLang === l ? "#1f6f8b" : "transparent", color: trLang === l ? "#fff8ed" : C.muted, fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>{LOCALE_NAME[l]}</button>
                ))}
              </div>
              <span style={{ width: 1, height: 20, background: C.line }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {cats.map(([k, lbl]) => (
                  <button key={k} onClick={() => switchTo({ cat: k })} style={{ border: `1px solid ${trCat === k ? "#9b3d2d" : C.line}`, borderRadius: 99, padding: "5px 12px", background: trCat === k ? "#9b3d2d" : "transparent", color: trCat === k ? "#fff8ed" : C.muted, fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>{lbl}</button>
                ))}
              </div>
            </div>
            <input style={input} value={trQ} onChange={(e) => setTrQ(e.target.value)} placeholder="검색(원문/이름)" />

            {/* ── 선교사 (이름·요약·이야기) ── */}
            {trCat === "person" && (
              <div style={{ display: "grid", gap: 14 }}>
                {PEOPLE.filter((p) => !q || `${p.name} ${p.en} ${p.summary}`.toLowerCase().includes(q)).map((p) => {
                  const base = (settings[`i18n.${trLang}.person.${p.id}`] ?? {}) as { name?: string; summary?: string; story?: string[] };
                  const koStory = (profileFor(p.id)?.story ?? []).join("\n\n");
                  const save = () => {
                    const v: Record<string, unknown> = { ...base };
                    const nm = ev(`p:${p.id}:name`, base.name ?? "").trim(); if (nm) v.name = nm; else delete v.name;
                    const sm = ev(`p:${p.id}:summary`, base.summary ?? "").trim(); if (sm) v.summary = sm; else delete v.summary;
                    const st = ev(`p:${p.id}:story`, (base.story ?? []).join("\n\n")).split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean); if (st.length) v.story = st; else delete v.story;
                    saveTr(`i18n.${trLang}.person.${p.id}`, v);
                  };
                  return (
                    <div key={p.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, background: "#fff8ec" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 900, fontSize: 14 }}>{p.name} <span style={{ fontWeight: 500, color: C.muted, fontSize: 12 }}>{p.en}</span></span>
                        <button onClick={save} disabled={saving} style={{ ...btn, padding: "5px 12px", fontSize: 12, background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>저장</button>
                      </div>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div><label style={label}>이름</label><div style={row2}>{koCell(p.name)}{ta(`p:${p.id}:name`, base.name ?? "", 38)}</div></div>
                        <div><label style={label}>요약</label><div style={row2}>{koCell(p.summary)}{ta(`p:${p.id}:summary`, base.summary ?? "", 70)}</div></div>
                        {koStory && <div><label style={label}>이야기 (문단 빈 줄 구분)</label><div style={row2}>{koCell(koStory)}{ta(`p:${p.id}:story`, (base.story ?? []).join("\n\n"), 140)}</div></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── 유적지 (이름·소개) ── */}
            {trCat === "heritage" && (
              <div style={{ display: "grid", gap: 14 }}>
                {HERITAGE.filter((h) => !q || `${h.name} ${h.city} ${h.summary}`.toLowerCase().includes(q)).map((h) => {
                  const base = (settings[`i18n.${trLang}.heritage.${h.id}`] ?? {}) as { name?: string; city?: string; region?: string; summary?: string; unesco?: string };
                  const save = () => {
                    const v: Record<string, unknown> = { ...base };
                    const nm = ev(`h:${h.id}:name`, base.name ?? "").trim(); if (nm) v.name = nm;
                    const ct = ev(`h:${h.id}:city`, base.city ?? "").trim(); if (ct) v.city = ct;
                    const sm = ev(`h:${h.id}:summary`, base.summary ?? "").trim(); if (sm) v.summary = sm; else delete v.summary;
                    saveTr(`i18n.${trLang}.heritage.${h.id}`, v);
                  };
                  return (
                    <div key={h.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, background: "#fff8ec" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontWeight: 900, fontSize: 14 }}>{h.name} <span style={{ fontWeight: 500, color: C.muted, fontSize: 12 }}>{h.city} · {h.type}</span></span>
                        <button onClick={save} disabled={saving} style={{ ...btn, padding: "5px 12px", fontSize: 12, background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>저장</button>
                      </div>
                      <div style={{ display: "grid", gap: 8 }}>
                        <div><label style={label}>이름</label><div style={row2}>{koCell(h.name)}{ta(`h:${h.id}:name`, base.name ?? "", 38)}</div></div>
                        <div><label style={label}>도시</label><div style={row2}>{koCell(h.city)}{ta(`h:${h.id}:city`, base.city ?? "", 38)}</div></div>
                        {h.summary && <div><label style={label}>소개</label><div style={row2}>{koCell(h.summary)}{ta(`h:${h.id}:summary`, base.summary ?? "", 80)}</div></div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── 관계 설명 (단일 맵, 일괄 저장) ── */}
            {trCat === "relations" && (() => {
              const baseMap = (settings[`i18n.${trLang}.relations`] ?? {}) as Record<string, string>;
              const edges = getRelationships().filter((r) => r.note && (!q || `${r.from.name} ${r.to.name} ${r.note}`.toLowerCase().includes(q)));
              const saveAll = () => {
                const v: Record<string, string> = { ...baseMap };
                for (const r of getRelationships()) { if (!r.note) continue; const k = `${r.from.id}|${r.to.id}|${r.type}`; const fid = `r:${k}`; if (fid in trEdits) { const t = trEdits[fid].trim(); if (t) v[k] = t; } }
                saveTr(`i18n.${trLang}.relations`, v);
              };
              return (
                <div style={{ display: "grid", gap: 10 }}>
                  <button onClick={saveAll} disabled={saving} style={{ ...btn, justifySelf: "start", background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "관계 설명 일괄 저장"}</button>
                  {edges.map((r) => { const k = `${r.from.id}|${r.to.id}|${r.type}`; return (
                    <div key={k} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, background: "#fff8ec" }}>
                      <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{r.from.name} <span style={{ color: r.meta.color }}>→[{r.meta.label}]</span> {r.to.name}</div>
                      <div style={row2}>{koCell(r.note)}{ta(`r:${k}`, baseMap[k] ?? "", 44)}</div>
                    </div>
                  ); })}
                </div>
              );
            })()}

            {/* ── 학생 목소리 (단일 배열, 일괄 저장) ── */}
            {trCat === "voices" && (() => {
              const baseArr = (settings[`i18n.${trLang}.voices`] ?? []) as { text?: string; prompt?: string; context?: string }[];
              const saveAll = () => {
                const v = STUDENT_VOICES.map((vo, i) => {
                  const b = baseArr[i] ?? {};
                  return {
                    text: (ev(`v:${i}:text`, b.text ?? "").trim()) || undefined,
                    prompt: (ev(`v:${i}:prompt`, b.prompt ?? vo.prompt ?? "").trim()) || undefined,
                    context: b.context ?? vo.context ?? "",
                  };
                });
                saveTr(`i18n.${trLang}.voices`, v);
              };
              return (
                <div style={{ display: "grid", gap: 10 }}>
                  <button onClick={saveAll} disabled={saving} style={{ ...btn, justifySelf: "start", background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "학생 목소리 일괄 저장"}</button>
                  {STUDENT_VOICES.filter((vo) => !q || `${vo.text} ${vo.author ?? ""}`.toLowerCase().includes(q)).map((vo) => {
                    const i = STUDENT_VOICES.indexOf(vo); const b = baseArr[i] ?? {};
                    return (
                      <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, background: "#fff8ec" }}>
                        <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{vo.author ?? "익명"} <span style={{ color: C.muted, fontWeight: 500 }}>· {vo.prompt}</span></div>
                        <div style={row2}>{koCell(vo.text)}{ta(`v:${i}:text`, b.text ?? "", 90)}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── 주제연구 (제목·소개·분석) ── */}
            {trCat === "topics" && (() => {
              const codeTopics = TOPICS.map((t) => ({ id: t.id, title: t.title, intro: t.intro, analysis: t.analysis ?? "" }));
              const dbTopics = Object.entries(settings).filter(([k, v]) => k.startsWith("topic.") && v && typeof v === "object" && Array.isArray((v as { people?: unknown }).people) && (v as { people: unknown[] }).people.length).map(([k, v]) => ({ id: k.replace("topic.", ""), ...(v as { title: string; intro: string; analysis?: string }) }));
              const all = [...new Map([...codeTopics, ...dbTopics].map((t) => [t.id, t])).values()];
              return (
                <div style={{ display: "grid", gap: 14 }}>
                  {all.filter((t) => !q || `${t.title} ${t.intro}`.toLowerCase().includes(q)).map((t) => {
                    const base = (settings[`i18n.${trLang}.topic.${t.id}`] ?? {}) as { title?: string; intro?: string; analysis?: string };
                    const save = () => {
                      const v: Record<string, unknown> = { ...base };
                      const ti = ev(`t:${t.id}:title`, base.title ?? "").trim(); if (ti) v.title = ti;
                      const intro = ev(`t:${t.id}:intro`, base.intro ?? "").trim(); if (intro) v.intro = intro;
                      const an = ev(`t:${t.id}:analysis`, base.analysis ?? "").trim(); if (an) v.analysis = an; else delete v.analysis;
                      saveTr(`i18n.${trLang}.topic.${t.id}`, v);
                    };
                    return (
                      <div key={t.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, background: "#fff8ec" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontWeight: 900, fontSize: 14 }}>{t.title}</span>
                          <button onClick={save} disabled={saving} style={{ ...btn, padding: "5px 12px", fontSize: 12, background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>저장</button>
                        </div>
                        <div style={{ display: "grid", gap: 8 }}>
                          <div><label style={label}>제목</label><div style={row2}>{koCell(t.title)}{ta(`t:${t.id}:title`, base.title ?? "", 38)}</div></div>
                          <div><label style={label}>소개</label><div style={row2}>{koCell(t.intro)}{ta(`t:${t.id}:intro`, base.intro ?? "", 70)}</div></div>
                          {t.analysis && <div><label style={label}>AI 분석</label><div style={row2}>{koCell(t.analysis)}{ta(`t:${t.id}:analysis`, base.analysis ?? "", 160)}</div></div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── 페이지 글(들어가며·여정) ── */}
            {trCat === "pages" && (() => {
              const pages = [["story", "들어가며", STORY_COPY], ["journey", "우리의 여정", JOURNEY_COPY]] as const;
              return (
                <div style={{ display: "grid", gap: 16 }}>
                  {pages.map(([pg, title, copy]) => {
                    const koMap = { ...copy, ...((settings[`content.page.${pg}`] ?? {}) as Record<string, string>) };
                    const base = (settings[`i18n.${trLang}.page.${pg}`] ?? {}) as Record<string, string>;
                    const save = () => {
                      const v: Record<string, string> = { ...base };
                      for (const k of Object.keys(koMap)) { const t = ev(`pg:${pg}:${k}`, base[k] ?? "").trim(); if (t) v[k] = t; }
                      saveTr(`i18n.${trLang}.page.${pg}`, v);
                    };
                    return (
                      <div key={pg} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12, background: "#fff8ec" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontWeight: 900, fontSize: 14 }}>{title} (/{pg})</span>
                          <button onClick={save} disabled={saving} style={{ ...btn, padding: "5px 12px", fontSize: 12, background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>저장</button>
                        </div>
                        <div style={{ display: "grid", gap: 8 }}>
                          {Object.keys(koMap).filter((k) => !q || koMap[k].toLowerCase().includes(q)).map((k) => (
                            <div key={k}><label style={label}>{k}</label><div style={row2}>{koCell(koMap[k])}{ta(`pg:${pg}:${k}`, base[k] ?? "", 50)}</div></div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── 메뉴·버튼(UI 사전) ── 저장 후 export-ui+배포 필요 ── */}
            {trCat === "ui" && (() => {
              const base = (settings[`i18n.${trLang}.ui`] ?? {}) as Record<string, string>;
              const saveAll = () => {
                const v: Record<string, string> = { ...base };
                for (const k of UI_KEYS) { const fid = `ui:${k}`; if (fid in trEdits) { const t = trEdits[fid].trim(); if (t) v[k] = t; } }
                saveTr(`i18n.${trLang}.ui`, v);
              };
              return (
                <div style={{ display: "grid", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#9b3d2d" }}>※ 메뉴·라벨은 코드 사전이라 저장 후 <code>export-ui</code> + 재배포해야 사이트에 반영됩니다(개발자 단계).</p>
                  <button onClick={saveAll} disabled={saving} style={{ ...btn, justifySelf: "start", background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "메뉴·버튼 일괄 저장"}</button>
                  {UI_KEYS.filter((k) => !q || `${k} ${UI_DEFAULT.ko[k]}`.toLowerCase().includes(q)).map((k) => (
                    <div key={k} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, background: "#fff8ec" }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, marginBottom: 5 }}>{k}</div>
                      <div style={row2}>{koCell(UI_DEFAULT.ko[k])}{ta(`ui:${k}`, base[k] ?? UI_DEFAULT[trLang][k] ?? "", 38)}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* ── 분류 라벨(시대·교단·지역·유형 등) ── 저장 후 export-ui+배포 필요 ── */}
            {trCat === "label" && (() => {
              const base = (settings[`i18n.${trLang}.label`] ?? {}) as Record<string, string>;
              const TYPE_LABEL: Record<string, string> = { era: "시대", region: "지역", denom: "교단", role: "사역", country: "나라", cat: "장소 분류", rel: "관계", htype: "유적 유형", htregion: "유적 권역" };
              const entries: { type: string; key: string; en: string }[] = [];
              for (const [type, m] of Object.entries(LABEL_GROUPS)) for (const key of Object.keys((m as { en: Record<string, string> }).en)) entries.push({ type, key, en: (m as { en: Record<string, string> }).en[key] });
              const saveAll = () => {
                const v: Record<string, string> = { ...base };
                for (const e of entries) { const fid = `lb:${e.type}.${e.key}`; if (fid in trEdits) { const t = trEdits[fid].trim(); if (t) v[`${e.type}.${e.key}`] = t; } }
                saveTr(`i18n.${trLang}.label`, v);
              };
              return (
                <div style={{ display: "grid", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#9b3d2d" }}>※ 저장 후 <code>export-ui</code> + 재배포 반영. 왼쪽은 영어 기본값(참조), 오른쪽이 {LOCALE_NAME[trLang]} 번역.</p>
                  <button onClick={saveAll} disabled={saving} style={{ ...btn, justifySelf: "start", background: "#1f6f8b", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "라벨 일괄 저장"}</button>
                  {entries.filter((e) => !q || `${e.type} ${e.key} ${e.en}`.toLowerCase().includes(q)).map((e) => {
                    const lm = LABEL_GROUPS[e.type] as { en: Record<string, string>; mn: Record<string, string> };
                    return (
                      <div key={`${e.type}.${e.key}`} style={{ border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, background: "#fff8ec" }}>
                        <div style={{ fontSize: 10.5, fontWeight: 700, color: C.muted, marginBottom: 5 }}>{TYPE_LABEL[e.type] ?? e.type} · {e.key}</div>
                        <div style={row2}>{koCell(e.en)}{ta(`lb:${e.type}.${e.key}`, base[`${e.type}.${e.key}`] ?? (lm[trLang]?.[e.key] ?? ""), 38)}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        );
      })()}

      {activeTab === "settings" && (
        <div style={{ display: "grid", gap: 18 }}>
          <div>
            <h3 className="font-display" style={{ fontWeight: 900, fontSize: 16, margin: "0 0 10px" }}>연도 표기 범위</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={label}>시작 연도</label><input style={input} type="number" value={String(settings.year_min ?? "")} onChange={(e) => set("year_min", Number(e.target.value))} /></div>
              <div><label style={label}>끝 연도</label><input style={input} type="number" value={String(settings.year_max ?? "")} onChange={(e) => set("year_max", Number(e.target.value))} /></div>
            </div>
          </div>
          <div>
            <h3 className="font-display" style={{ fontWeight: 900, fontSize: 16, margin: "0 0 10px" }}>용어 표기 (역할 기호)</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {[["term.role.evangelism", "✝ 전도·목회"], ["term.role.medical", "✚ 의료"], ["term.role.women", "♀ 여성사역"], ["term.role.korean", "한 한국인·한글"]].map(([k, lab]) => (
                <div key={k}><label style={label}>{lab}</label><input style={input} value={String(settings[k] ?? "")} onChange={(e) => set(k, e.target.value)} /></div>
              ))}
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} style={{ ...btn, justifySelf: "start", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "설정 저장"}</button>
        </div>
      )}

      {activeTab === "users" && (() => {
        const myEmail = session.user.email?.toLowerCase() ?? "";
        const ROLES: Role[] = ["super", "power", "content"];
        const ROLE_COLOR: Record<Role, string> = { super: "#9b3d2d", power: "#1f6f8b", content: "#3f7f4b" };
        // 본인이 env ADMIN_EMAIL로 super인데 roles/admins에 아직 없을 수 있어 항상 표시.
        const displayMap: Record<string, Role> = { ...roleMap };
        if (myEmail && !(myEmail in displayMap)) displayMap[myEmail] = "super";
        const RANK: Record<Role, number> = { super: 0, power: 1, content: 2 };
        const entries = Object.entries(displayMap).sort((a, b) => (RANK[a[1]] - RANK[b[1]]) || a[0].localeCompare(b[0]));
        const setOne = (e: string, r: Role) => saveRoles({ ...roleMap, [e.toLowerCase()]: r });
        const removeOne = (e: string) => { const n = { ...roleMap }; delete n[e.toLowerCase()]; saveRoles(n); };
        const addOne = () => { const e = oneEmail.trim().toLowerCase(); if (!isEmail(e)) { setMsg("저장 실패: 올바른 이메일이 아닙니다"); return; } saveRoles({ ...roleMap, [e]: oneRole }); setOneEmail(""); };
        const bulkAdd = () => {
          const emails = parseEmails(bulkText);
          if (emails.length === 0) { setMsg("등록할 이메일을 찾지 못했습니다"); return; }
          const next = { ...roleMap };
          let added = 0;
          for (const e of emails) { if (!(e in next)) added++; next[e] = bulkRole; }
          saveRoles(next);
          setBulkText("");
          setMsg(`✓ ${emails.length}명 처리 (${added}명 신규) — ${ROLE_LABEL[bulkRole]}`);
        };
        const counts = { super: 0, power: 0, content: 0 } as Record<Role, number>;
        for (const r of Object.values(roleMap)) counts[r]++;
        const roleSelect = (val: Role, onChange: (r: Role) => void, disabled = false) => (
          <select value={val} disabled={disabled} onChange={(ev) => onChange(ev.target.value as Role)} style={{ ...input, width: "auto", padding: "6px 8px", fontSize: 12.5, opacity: disabled ? 0.6 : 1 }}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
          </select>
        );
        return (
          <div style={{ display: "grid", gap: 18 }}>
            <div>
              <p style={{ fontSize: 13, color: C.muted, margin: "0 0 6px", lineHeight: 1.6 }}>
                등록된 사용자만 <code>/admin</code>에 접근합니다. 역할: <b style={{ color: ROLE_COLOR.super }}>전체 관리자</b>(코어 설정·사용자 관리) · <b style={{ color: ROLE_COLOR.power }}>파워 콘텐츠 관리자</b>(즉시 수정·검수 승인) · <b style={{ color: ROLE_COLOR.content }}>콘텐츠 관리자</b>(수정은 교사 승인 — 곧 활성화).
              </p>
              <p style={{ fontSize: 12, fontWeight: 800, color: "#9b3d2d", margin: 0 }}>전체 {counts.super} · 파워 {counts.power} · 콘텐츠 {counts.content}</p>
            </div>

            {/* 이메일 일괄 등록 */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, background: "#fff8ec" }}>
              <h3 className="font-display" style={{ fontWeight: 900, fontSize: 15, margin: "0 0 4px" }}>이메일 일괄 등록</h3>
              <p style={{ fontSize: 11.5, color: C.muted, margin: "0 0 10px", lineHeight: 1.5 }}>학생 이메일 주소를 한꺼번에 붙여넣으세요. 줄바꿈·쉼표·세미콜론·공백 모두 구분자로 인식하고 중복은 자동 제거됩니다.</p>
              <textarea style={{ ...input, minHeight: 96, resize: "vertical", fontFamily: "var(--font-mono, monospace)", fontSize: 12.5 }} value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"student1@dreamyedu.net, student2@dreamyedu.net\nstudent3@dreamyedu.net …"} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: C.muted }}>역할</label>
                {roleSelect(bulkRole, setBulkRole)}
                <span style={{ fontSize: 12, color: C.muted }}>인식된 이메일 {parseEmails(bulkText).length}개</span>
                <button onClick={bulkAdd} disabled={saving} style={{ ...btn, marginLeft: "auto", opacity: saving ? 0.6 : 1 }}>{saving ? "등록 중…" : "일괄 등록"}</button>
              </div>
            </div>

            {/* 한 명 추가 */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input style={{ ...input, flex: 1, minWidth: 200 }} type="email" placeholder="한 명 추가 — 이메일" value={oneEmail} onChange={(e) => setOneEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") addOne(); }} />
              {roleSelect(oneRole, setOneRole)}
              <button disabled={saving || !oneEmail} onClick={addOne} style={{ ...btn, opacity: saving || !oneEmail ? 0.6 : 1 }}>추가</button>
            </div>

            {/* 사용자 목록 */}
            <div style={{ display: "grid", gap: 8 }}>
              {entries.length === 0 && <p style={{ fontSize: 13, color: C.muted }}>등록된 사용자가 없습니다.</p>}
              {entries.map(([e, r]) => {
                const self = e === myEmail;
                return (
                  <div key={e} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${C.line}`, borderRadius: 11, padding: "8px 12px", background: "#fff8ec" }}>
                    <span style={{ width: 8, height: 8, borderRadius: 99, background: ROLE_COLOR[r], flex: "0 0 auto" }} />
                    <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e}{self && <span style={{ color: C.muted, fontWeight: 600 }}> (나)</span>}</span>
                    {self ? <span style={{ fontSize: 12.5, fontWeight: 800, color: ROLE_COLOR[r] }}>{ROLE_LABEL[r]}</span> : roleSelect(r, (nr) => setOne(e, nr), saving)}
                    {!self && <button onClick={() => removeOne(e)} style={{ border: 0, background: "transparent", color: C.accent, fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>삭제</button>}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11.5, color: C.muted, margin: 0 }}>※ 등록된 사람은 본인 구글 계정(또는 이메일)으로 <code>/admin</code>에 로그인합니다. 본인 권한은 잠김 방지를 위해 항상 전체 관리자로 유지됩니다.</p>
          </div>
        );
      })()}

      {activeTab === "stats" && (() => {
        const daily = (settings["stats.daily"] && typeof settings["stats.daily"] === "object" ? settings["stats.daily"] : {}) as Record<string, number>;
        const today = new Date().toISOString().slice(0, 10);
        const dates = Object.keys(daily).sort().reverse();
        const total = dates.reduce((s, d) => s + (daily[d] || 0), 0);
        const last7 = dates.slice(0, 7).reduce((s, d) => s + (daily[d] || 0), 0);
        const max = Math.max(1, ...dates.map((d) => daily[d] || 0));
        const card = (label: string, val: number | string) => (
          <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px", background: "#fff8ec", minWidth: 116 }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: C.muted }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#2f2419" }}>{val}</div>
          </div>
        );
        return (
          <div style={{ display: "grid", gap: 16 }}>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>방문자 수는 브라우저당 하루 1회 집계되는 근사 순방문자입니다.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {card("오늘", daily[today] || 0)}
              {card("최근 7일", last7)}
              {card("누적", total)}
              {card("기록 일수", dates.length)}
            </div>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, background: "#fff8ec" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, marginBottom: 10 }}>최근 30일</div>
              <div style={{ display: "grid", gap: 5 }}>
                {dates.slice(0, 30).map((d) => (
                  <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                    <span style={{ width: 80, flex: "0 0 auto", color: d === today ? "#9b3d2d" : C.muted, fontWeight: d === today ? 800 : 600 }}>{d}</span>
                    <span style={{ height: 12, borderRadius: 99, background: d === today ? "#9b3d2d" : "#c9a86a", width: `${Math.max(4, ((daily[d] || 0) / max) * 100)}%` }} />
                    <span style={{ fontWeight: 800, color: "#2f2419" }}>{daily[d] || 0}</span>
                  </div>
                ))}
                {dates.length === 0 && <span style={{ fontSize: 12.5, color: C.muted }}>아직 집계된 방문이 없습니다(배포 후 방문부터 기록됩니다).</span>}
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === "review" && (() => {
        const setKey = async (key: string, val: "approved" | "rejected" | null) => {
          const next = { ...review };
          if (val === null) delete next[key]; else next[key] = val;
          setReview(next);
          await post({ kind: "settings", settings: { review: next } });
        };
        const allItems = Object.entries(GALLERY).flatMap(([pid, arr]) =>
          arr.map((g, i) => ({ pid, i, g, key: `g:${pid}:${i}`, status: review[`g:${pid}:${i}`] })),
        );
        const pending = allItems.filter((x) => !x.status).length;
        const rejected = allItems.filter((x) => x.status === "rejected").length;
        const approved = allItems.filter((x) => x.status === "approved").length;
        const reworkCnt = allItems.filter((x) => rework[x.key]).length;
        // 확인(✓)된 항목은 검수 목록에서 제외 — 아직 볼 게 남은 것만 보인다.
        const items = allItems.filter((x) => x.status !== "approved");
        const requestRework = async (key: string) => {
          const note = window.prompt("재작업 사유 (예: 색이 일부만 입혀짐 / 얼굴만 컬러 / 화질 저하 / 인물 오인)", rework[key] ?? "");
          if (note === null) return;
          const next = { ...rework };
          if (note.trim()) next[key] = note.trim(); else delete next[key];
          setRework(next);
          await post({ kind: "settings", settings: { rework: next } });
        };
        const segBtn = (on: boolean, color: string, label: string, onClick: () => void) => (
          <button onClick={onClick} style={{ border: `1px solid ${on ? color : C.line}`, borderRadius: 8, padding: "3px 9px", background: on ? color : "transparent", color: on ? "#fff8ed" : C.muted, cursor: "pointer", fontSize: 11, fontWeight: 800 }}>{label}</button>
        );
        // ── 콘텐츠 관리자(학생) 제안 검토 ──
        const proposals = (Array.isArray(settings.proposals) ? settings.proposals : []) as Proposal[];
        const pendingProps = proposals.filter((p) => p.status === "pending");
        const actProp = async (id: string, kind: "proposal-approve" | "proposal-reject" | "proposal-delete", note?: string) => {
          setSaving(true); setMsg("");
          const err = await post({ kind, id, ...(note ? { note } : {}) });
          setSaving(false);
          setMsg(err ? "처리 실패: " + err : kind === "proposal-approve" ? "✓ 승인·반영됨" : kind === "proposal-reject" ? "✓ 반려됨" : "✓ 삭제됨");
          if (!err) loadData();
        };
        return (
          <div>
            {/* 제안 검토(콘텐츠 관리자 수정) */}
            <section style={{ marginBottom: 22 }}>
              <h3 className="font-display" style={{ fontWeight: 900, fontSize: 16, margin: "0 0 4px" }}>수정 제안 검토 <span style={{ fontSize: 12.5, color: pendingProps.length ? "#9b3d2d" : C.muted }}>· 대기 {pendingProps.length}</span></h3>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: C.muted }}>콘텐츠 관리자(학생)가 올린 수정 제안입니다. 승인하면 사이트에 즉시 반영됩니다.</p>
              {proposals.length === 0 && <p style={{ fontSize: 12.5, color: C.muted }}>아직 제안이 없습니다.</p>}
              <div style={{ display: "grid", gap: 8 }}>
                {proposals.slice(0, 40).map((p) => {
                  const sc = p.status === "pending" ? "#bf6b22" : p.status === "approved" ? "#3f7f4b" : "#c2453a";
                  return (
                    <div key={p.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "10px 12px", background: "#fff8ec" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ background: sc, color: "#fff8ed", borderRadius: 99, padding: "2px 9px", fontSize: 10.5, fontWeight: 800 }}>{PROPOSAL_STATUS_LABEL[p.status]}</span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{p.label}</span>
                        <span style={{ fontSize: 11, color: C.muted }}>· {p.author}</span>
                        {p.status === "pending" && (
                          <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                            <button onClick={() => actProp(p.id, "proposal-approve")} disabled={saving} style={{ border: 0, borderRadius: 8, padding: "4px 12px", background: "#3f7f4b", color: "#fff8ed", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>승인</button>
                            <button onClick={() => { const n = window.prompt("반려 사유(선택)"); if (n !== null) actProp(p.id, "proposal-reject", n.trim() || undefined); }} disabled={saving} style={{ border: `1px solid ${C.line}`, borderRadius: 8, padding: "4px 12px", background: "transparent", color: C.accent, fontWeight: 800, fontSize: 12, cursor: "pointer" }}>반려</button>
                          </span>
                        )}
                        {p.status !== "pending" && <button onClick={() => actProp(p.id, "proposal-delete")} style={{ marginLeft: "auto", border: 0, background: "transparent", color: C.muted, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>삭제</button>}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 11.5, color: C.muted, whiteSpace: "pre-wrap", maxHeight: 90, overflow: "auto", borderTop: `1px solid ${C.line}`, paddingTop: 6 }}>
                        {p.kind === "person" ? Object.entries(p.person ?? {}).filter(([k]) => k !== "id").map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`).join("\n").slice(0, 600) : Object.entries(p.settings ?? {}).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join("\n").slice(0, 600)}
                      </div>
                      {p.note && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#9b3d2d" }}>사유: {p.note}</p>}
                    </div>
                  );
                })}
              </div>
            </section>

            <p style={{ margin: "0 0 6px", fontSize: 13, lineHeight: 1.6, color: C.muted }}>
              Commons 자동 스캔으로 모은 <b>후보</b>입니다(동명이인·비초상 섞일 수 있음). 본인 사진이 맞으면 <b>✓ 채택</b>, 아니면 <b>제외</b>하세요. <b>채택한 사진만 공개</b>되고, 채택 후 자동으로 컬러 복원됩니다. (이미 채택된 항목은 목록에서 빠짐)
            </p>
            <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, color: "#9b3d2d" }}>전체 {allItems.length}장 · 채택 {approved}(공개) · 미검토 {pending} · 제외 {rejected} · 재작업 {reworkCnt}</p>
            {(() => {
              // 인물별로 묶고, 섹션 맨 앞에 기준 초상을 둔다.
              const groups: { pid: string; rows: typeof items }[] = [];
              for (const it of items) { let gr = groups.find((x) => x.pid === it.pid); if (!gr) { gr = { pid: it.pid, rows: [] }; groups.push(gr); } gr.rows.push(it); }
              if (groups.length === 0) return <p style={{ fontSize: 13, color: C.muted }}>{allItems.length === 0 ? "아직 수집된 후보가 없습니다." : "검수할 후보가 없습니다 — 모두 처리됨. ✓"}</p>;
              return groups.map(({ pid, rows }) => {
                const person = PEOPLE.find((p) => p.id === pid);
                const ref = PHOTOS[pid]?.photo;
                return (
                  <section key={pid} style={{ marginBottom: 26, paddingTop: 14, borderTop: `2px solid ${C.line}` }}>
                    {/* 인물 헤더 — 기준 초상(현재 등록) */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                      {ref
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={ref} alt="" style={{ width: 62, height: 78, objectFit: "cover", borderRadius: 8, border: "2px solid #3f7f4b", background: "#efe1c3", flex: "0 0 auto" }} />
                        : <span style={{ width: 62, height: 78, flex: "0 0 auto", borderRadius: 8, background: "#7a4a2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff8ec", fontSize: 24 }}>{person?.glyph ?? "·"}</span>}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15.5, fontWeight: 900, color: C.ink }}>{person?.name ?? pid} <span style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>{person?.en}</span></div>
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>← 기준 초상(현재 등록) · 후보 {rows.length}장 — 같은 인물이 맞는지 비교해 <b>채택 / 제외</b></div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 10 }}>
                      {rows.map(({ i, g, key, status }) => (
                        <div key={key} style={{ border: `1.5px solid ${status === "rejected" ? "#c2453a" : status === "approved" ? "#3f7f4b" : C.line}`, borderRadius: 12, overflow: "hidden", background: "#fff8ec", opacity: status === "rejected" ? 0.6 : 1 }}>
                          {/* 원본(흑백) ↔ 컬러 대조 */}
                          <div style={{ display: "flex", gap: 2, background: "#efe1c3" }}>
                            <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={g.src} alt="원본" loading="lazy" style={{ width: "100%", height: "auto", maxHeight: 380, objectFit: "contain", display: "block" }} />
                              <span style={{ position: "absolute", left: 4, top: 4, background: "rgba(40,26,14,.7)", color: "#fff8ec", fontSize: 9, fontWeight: 800, borderRadius: 6, padding: "1px 6px" }}>원본</span>
                            </div>
                            {g.srcColor && (
                              <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={g.srcColor} alt="컬러" loading="lazy" style={{ width: "100%", height: "auto", maxHeight: 380, objectFit: "contain", display: "block" }} />
                                <span style={{ position: "absolute", left: 4, top: 4, background: "#9b3d2d", color: "#fff8ec", fontSize: 9, fontWeight: 800, borderRadius: 6, padding: "1px 6px" }}>컬러</span>
                              </div>
                            )}
                          </div>
                          <div style={{ padding: "7px 9px" }}>
                            <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.4, maxHeight: 28, overflow: "hidden" }}>#{i + 1} · {g.caption}</div>
                            <div style={{ display: "flex", gap: 5, marginTop: 7, flexWrap: "wrap" }}>
                              {segBtn(status === "approved", "#3f7f4b", "✓ 채택", () => setKey(key, status === "approved" ? null : "approved"))}
                              {segBtn(status === "rejected", "#c2453a", "제외", () => setKey(key, status === "rejected" ? null : "rejected"))}
                              {segBtn(!!rework[key], "#bf6b22", "♻ 재작업", () => requestRework(key))}
                              <a href={g.sourceUrl} target="_blank" rel="noreferrer" style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 700, color: "#1f6f8b", textDecoration: "none", alignSelf: "center" }}>출처↗</a>
                            </div>
                            {rework[key] && <p style={{ margin: "6px 0 0", fontSize: 10.5, lineHeight: 1.4, color: "#bf6b22", fontWeight: 700 }}>♻ 재작업 요청: {rework[key]}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              });
            })()}
          </div>
        );
      })()}

      {activeTab === "devreq" && (() => {
        const STATUS_COLOR: Record<string, string> = { pending: "#bf6b22", in_progress: "#1f6f8b", done: "#3f7f4b", question: "#9b3d2d" };
        const submit = async () => {
          if (!drTitle.trim() && !drPrompt.trim()) return;
          const next: DevReq[] = [
            { id: Date.now().toString(36), title: drTitle.trim() || "(제목 없음)", prompt: drPrompt.trim(), status: "pending", createdAt: new Date().toISOString() },
            ...devreqs,
          ];
          setDevreqs(next); setDrTitle(""); setDrPrompt("");
          await post({ kind: "settings", settings: { devreq: next } });
        };
        const removeReq = async (id: string) => {
          const next = devreqs.filter((r) => r.id !== id);
          setDevreqs(next);
          await post({ kind: "settings", settings: { devreq: next } });
        };
        return (
          <div>
            <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.6, color: C.muted }}>
              기능 개선·수정을 프롬프트로 요청하면 큐에 쌓이고, <b>VSCode의 Claude Code(약 30분 주기 자동 점검)</b>가 폴링해 구현·응답합니다. 지금은 개발 단계라 완료 시 바로 반영됩니다(프리뷰/승인 게이팅은 추후).
            </p>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 14, padding: 14, background: "#fff8ec", marginBottom: 18 }}>
              <label style={label}>요청 제목</label>
              <input style={{ ...input, marginBottom: 8 }} value={drTitle} onChange={(e) => setDrTitle(e.target.value)} placeholder="예: 흐름 페이지에 인물 검색 필터 추가" />
              <label style={label}>요청 내용 (프롬프트)</label>
              <textarea style={{ ...input, minHeight: 90, marginBottom: 10 }} value={drPrompt} onChange={(e) => setDrPrompt(e.target.value)} placeholder="원하는 기능·수정을 구체적으로 적어주세요." />
              <button onClick={submit} disabled={saving} style={{ ...btn, opacity: saving ? 0.6 : 1 }}>요청 등록</button>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {devreqs.map((r) => (
                <div key={r.id} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px", background: "#fff8ec" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ background: STATUS_COLOR[r.status] ?? C.muted, color: "#fff8ed", borderRadius: 99, padding: "2px 9px", fontSize: 10.5, fontWeight: 800 }}>{STATUS_LABEL[r.status] ?? r.status}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: C.ink }}>{r.title}</span>
                    <button onClick={() => removeReq(r.id)} style={{ marginLeft: "auto", border: 0, background: "transparent", color: C.accent, cursor: "pointer", fontSize: 11.5, fontWeight: 800 }}>삭제</button>
                  </div>
                  {r.prompt && <p style={{ margin: "6px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "#594935", whiteSpace: "pre-wrap" }}>{r.prompt}</p>}
                  {r.response && (
                    <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.line}` }}>
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: "#1f6f8b" }}>개발자 응답</span>
                      <p style={{ margin: "3px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "#3e2c1d", whiteSpace: "pre-wrap" }}>{r.response}</p>
                    </div>
                  )}
                </div>
              ))}
              {devreqs.length === 0 && <p style={{ fontSize: 13, color: C.muted }}>등록된 개발 요청이 없습니다.</p>}
            </div>
          </div>
        );
      })()}
        </div>
      </div>
    </div>
  );
}
