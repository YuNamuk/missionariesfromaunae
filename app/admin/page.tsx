"use client";

import { useEffect, useState, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { browserSupabase } from "@/lib/db/browser";

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

  const [tab, setTab] = useState<"people" | "settings" | "admins">("people");
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [newAdmin, setNewAdmin] = useState("");
  const [people, setPeople] = useState<PersonRow[]>([]);
  const [places, setPlaces] = useState<PlaceRow[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [sel, setSel] = useState<string>("");
  const [draft, setDraft] = useState<PersonRow | null>(null);
  const [activeText, setActiveText] = useState("");
  const [saving, setSaving] = useState(false);

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
    setAdminEmails(Array.isArray(s.admins) ? (s.admins as string[]) : []);
  }, [sb]);

  useEffect(() => { if (session) loadData(); }, [session, loadData]);

  useEffect(() => {
    const p = people.find((x) => x.id === sel) ?? null;
    setDraft(p ? { ...p } : null);
    setActiveText(p?.active_periods?.map((a) => `${a[0]}-${a[1]}`).join("; ") ?? "");
  }, [sel, people]);

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

  async function saveAdmins(next: string[]) {
    setSaving(true); setMsg("");
    const err = await post({ kind: "admins", admins: next });
    setSaving(false);
    if (err) { setMsg("저장 실패: " + err); return; }
    setMsg("✓ 관리자 목록 저장됨");
    loadData();
  }

  async function post(body: unknown) {
    const token = (await sb.auth.getSession()).data.session?.access_token;
    const r = await fetch("/api/admin/save", { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
    return r.ok ? null : (await r.json()).error ?? "오류";
  }

  async function savePerson() {
    if (!draft) return;
    setSaving(true); setMsg("");
    const active = activeText.split(/[;,\n]/).map((s) => s.trim()).filter(Boolean)
      .map((s) => { const m = s.match(/(\d{4})\D+(\d{4})/); return m ? [Number(m[1]), Number(m[2])] : null; })
      .filter(Boolean);
    const err = await post({ kind: "person", person: { id: draft.id, name: draft.name, name_en: draft.name_en, life: draft.life, org: draft.org, role: draft.role, summary: draft.summary, photo: draft.photo || null, wiki: draft.wiki || null, burial_place_id: draft.burial_place_id || null, active_periods: active } });
    setSaving(false);
    setMsg(err ? "저장 실패: " + err : "✓ 저장됨 (지도 새로고침 시 반영)");
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

  if (!ready) return <div style={{ padding: 40, fontFamily: "var(--font-body)" }}>로딩…</div>;

  if (!session) {
    return (
      <div style={{ minHeight: "calc(100vh - 4rem)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-body)", color: C.ink }}>
        <form onSubmit={login} style={{ width: 320, background: "#fffdf7", border: `1px solid ${C.line}`, borderRadius: 18, padding: 24, boxShadow: "0 18px 50px rgba(38,25,10,.12)" }}>
          <h1 className="font-display" style={{ fontWeight: 900, fontSize: 22, margin: "0 0 4px" }}>관리자 로그인</h1>
          <p style={{ margin: "0 0 16px", fontSize: 12.5, color: C.muted }}>조선 선교사 자료실 운영</p>
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

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 20px 80px", fontFamily: "var(--font-body)", color: C.ink }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 className="font-display" style={{ fontWeight: 900, fontSize: 26, margin: 0 }}>관리자</h1>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: C.muted }}>{session.user.email}</p>
        </div>
        <button onClick={() => sb.auth.signOut()} style={{ ...btn, background: "#2f2419" }}>로그아웃</button>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["people", "settings", "admins"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ border: `1px solid ${tab === t ? "#2f2419" : C.line}`, borderRadius: 11, padding: "8px 16px", background: tab === t ? "#2f2419" : "transparent", color: tab === t ? "#fff8ed" : C.muted, fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
            {t === "people" ? "선교사 정보" : t === "settings" ? "연도·용어 설정" : "관리자 계정"}
          </button>
        ))}
      </div>

      {msg && <p style={{ marginBottom: 14, fontSize: 13, fontWeight: 700, color: msg.startsWith("✓") ? "#2f6b3b" : C.accent }}>{msg}</p>}

      {tab === "people" && (
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
          <select size={18} value={sel} onChange={(e) => setSel(e.target.value)} style={{ width: "100%", border: `1px solid ${C.line}`, borderRadius: 12, padding: 6, fontSize: 13, background: "#fff8ec", color: C.ink, height: 460 }}>
            {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {draft ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={label}>이름</label><input style={input} value={draft.name ?? ""} onChange={(e) => upd("name", e.target.value)} /></div>
                <div><label style={label}>영문명</label><input style={input} value={draft.name_en ?? ""} onChange={(e) => upd("name_en", e.target.value)} /></div>
                <div><label style={label}>생몰 (예: 1858–1902)</label><input style={input} value={draft.life ?? ""} onChange={(e) => upd("life", e.target.value)} /></div>
                <div><label style={label}>소속</label><input style={input} value={draft.org ?? ""} onChange={(e) => upd("org", e.target.value)} /></div>
                <div><label style={label}>사역</label><input style={input} value={draft.role ?? ""} onChange={(e) => upd("role", e.target.value)} /></div>
                <div>
                  <label style={label}>안장 묘역</label>
                  <select style={input} value={draft.burial_place_id ?? ""} onChange={(e) => upd("burial_place_id", e.target.value)}>
                    <option value="">(없음)</option>
                    {places.map((pl) => <option key={pl.id} value={pl.id}>{pl.name}</option>)}
                  </select>
                </div>
              </div>
              <div><label style={label}>요약</label><textarea style={{ ...input, minHeight: 90, resize: "vertical" }} value={draft.summary ?? ""} onChange={(e) => upd("summary", e.target.value)} /></div>
              <div><label style={label}>사진 URL</label><input style={input} value={draft.photo ?? ""} onChange={(e) => upd("photo", e.target.value)} /></div>
              <div><label style={label}>위키 링크</label><input style={input} value={draft.wiki ?? ""} onChange={(e) => upd("wiki", e.target.value)} /></div>
              <div><label style={label}>조선 사역 구간 (예: 1885-1902; 1949-1949)</label><input style={input} value={activeText} onChange={(e) => setActiveText(e.target.value)} /></div>
              <button onClick={savePerson} disabled={saving} style={{ ...btn, justifySelf: "start", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "저장"}</button>
            </div>
          ) : <p style={{ color: C.muted, fontSize: 13 }}>왼쪽에서 선교사를 선택하세요.</p>}
        </div>
      )}

      {tab === "settings" && (
        <div style={{ display: "grid", gap: 18, maxWidth: 520 }}>
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

      {tab === "admins" && (
        <div style={{ maxWidth: 480, display: "grid", gap: 14 }}>
          <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>여기에 등록된 이메일(구글/이메일 로그인)만 관리자로 접근·편집할 수 있습니다.</p>
          <div style={{ display: "grid", gap: 8 }}>
            {adminEmails.map((e) => {
              const self = e.toLowerCase() === session.user.email?.toLowerCase();
              return (
                <div key={e} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: `1px solid ${C.line}`, borderRadius: 11, padding: "9px 12px", background: "#fff8ec" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700 }}>{e}{self && <span style={{ color: C.muted, fontWeight: 600 }}> (나)</span>}</span>
                  {!self && <button onClick={() => saveAdmins(adminEmails.filter((x) => x !== e))} style={{ border: 0, background: "transparent", color: C.accent, fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>삭제</button>}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input style={{ ...input, flex: 1 }} type="email" placeholder="추가할 관리자 이메일" value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} />
            <button disabled={saving || !newAdmin} onClick={() => { saveAdmins([...adminEmails, newAdmin]); setNewAdmin(""); }} style={{ ...btn, opacity: saving || !newAdmin ? 0.6 : 1 }}>추가</button>
          </div>
          <p style={{ fontSize: 11.5, color: C.muted, margin: 0 }}>※ 추가된 사람은 본인 구글 계정으로 <code>/admin</code>에 로그인하면 됩니다. (해당 이메일이 구글 계정이어야 함)</p>
        </div>
      )}
    </div>
  );
}
