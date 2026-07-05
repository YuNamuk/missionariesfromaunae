"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "@/lib/db/browser";
import type { InterviewVideo } from "@/lib/db/interviews";

// 가상 인터뷰 AI 재현 영상(YouTube) 등록 — 로그인 관리자에게만.
//  · 파워/전체 관리자 → 즉시 반영, 콘텐츠 관리자 → 제안(교사 승인). [[rbac-roles]]
//  · app_settings `interview.videos`(personId→{youtube}) 전체 맵을 병합 저장.
export function InterviewVideoEditor({ personId, videos }: { personId: string; videos: Record<string, InterviewVideo> }) {
  const sb = browserSupabase();
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState(videos[personId]?.youtube ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const token = (await sb.auth.getSession()).data.session?.access_token;
        if (!token) return;
        const r = await fetch("/api/admin/me", { headers: { authorization: `Bearer ${token}` } });
        const j = await r.json();
        if (j.role) setRole(j.role);
      } catch { /* 비로그인 */ }
    })();
  }, [sb]);

  if (!role) return null;

  async function save(clear = false) {
    setSaving(true); setMsg("");
    try {
      const next: Record<string, InterviewVideo> = { ...videos };
      const v = url.trim();
      if (clear || !v) delete next[personId];
      else next[personId] = { ...next[personId], youtube: v };
      const token = (await sb.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ kind: "settings", settings: { "interview.videos": next }, label: `가상 인터뷰 영상 — ${personId}` }),
      });
      const j = await res.json();
      if (!res.ok) { setMsg("저장 실패: " + (j.error || res.status)); return; }
      if (j.queued) { setMsg("✓ 제안 등록됨 — 승인 후 반영됩니다."); return; }
      setMsg("✓ 저장됨 — 새로고침합니다…");
      setTimeout(() => location.reload(), 900);
    } catch (e) { setMsg("저장 실패: " + (e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} style={{ position: "fixed", right: 20, bottom: 20, zIndex: 900, borderRadius: 99, padding: "12px 18px", border: "none", background: "#9b3d2d", color: "#fff8ed", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(46,28,14,.4)" }}>
          🎬 영상 등록 {role === "content" ? "(제안)" : ""}
        </button>
      )}
      {open && (
        <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1000, width: "min(420px, calc(100vw - 40px))", background: "#fbf5ea", borderRadius: 14, padding: 16, boxShadow: "0 12px 40px rgba(0,0,0,.3)", border: "1px solid rgba(77,56,34,.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <b style={{ fontSize: 14, color: "#3a2a18", flex: 1 }}>AI 재현 인터뷰 영상(YouTube)</b>
            {role === "content" && <span style={{ fontSize: 11, fontWeight: 800, color: "#a0641f" }}>제안</span>}
            <button onClick={() => setOpen(false)} style={{ border: "1px solid rgba(77,56,34,.2)", borderRadius: 8, padding: "4px 9px", fontSize: 12, fontWeight: 800, background: "#fff8ec", color: "#5f4d39", cursor: "pointer" }}>닫기</button>
          </div>
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="YouTube 주소 또는 영상 ID 붙여넣기" style={{ width: "100%", padding: "9px 11px", borderRadius: 8, border: "1px solid rgba(77,56,34,.25)", fontSize: 13.5, background: "#fff" }} />
          <p style={{ fontSize: 11, color: "#8a7a63", margin: "6px 0 10px" }}>예: https://youtu.be/XXXXXXXXXXX · https://www.youtube.com/watch?v=XXXXXXXXXXX</p>
          {msg && <p style={{ fontSize: 12.5, fontWeight: 700, color: msg.startsWith("✓") ? "#2f6b3b" : "#9b3d2d", margin: "0 0 8px" }}>{msg}</p>}
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={saving} onClick={() => save(false)} style={{ flex: 1, border: "none", borderRadius: 8, padding: "9px 0", fontSize: 13.5, fontWeight: 800, background: "#2f2419", color: "#fff8ed", cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "저장 중…" : "저장"}</button>
            {videos[personId]?.youtube && <button disabled={saving} onClick={() => save(true)} style={{ border: "1px solid rgba(77,56,34,.2)", borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 800, background: "#fff8ec", color: "#9b3d2d", cursor: "pointer" }}>제거</button>}
          </div>
        </div>
      )}
    </>
  );
}
