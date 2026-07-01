"use client";

import { useEffect, useState } from "react";
import { browserSupabase } from "@/lib/db/browser";
import type { ResearchColumn, ColumnSection, ColumnImage, ImgKind } from "@/lib/data/columns";

// 심화 컬럼 인페이지 편집기. 로그인한 관리자(콘텐츠 관리자 포함)에게 '편집' 버튼을 띄우고,
// 구조화된 폼으로 제목·도입·섹션(문단/삽화)·인터뷰·출처를 수정해 저장한다.
//  · 파워/전체 관리자 → 즉시 반영, 콘텐츠 관리자 → 제안(교사 승인 후 반영). [[rbac-roles]]
//  · 저장 키: app_settings `column.<id>` (전체 ResearchColumn JSON). [[research-column-pipeline]]

const paras = (s: string): string[] => s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const joinParas = (a: string[]): string => a.join("\n\n");

const KINDS: ImgKind[] = ["ai", "archive", "portrait"];
const KIND_LABEL: Record<ImgKind, string> = { ai: "AI 일러스트", archive: "기록 사진", portrait: "실제 초상" };

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(77,56,34,.25)", fontSize: 14, background: "#fff" };
const labelStyle: React.CSSProperties = { fontSize: 11, fontWeight: 800, color: "#8a7a63", textTransform: "uppercase", letterSpacing: ".04em", display: "block", marginBottom: 4 };
const btn: React.CSSProperties = { border: "1px solid rgba(77,56,34,.2)", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 800, background: "#fff8ec", color: "#5f4d39", cursor: "pointer" };

function ImageFields({ img, onChange, onRemove }: { img?: ColumnImage; onChange: (v: ColumnImage | undefined) => void; onRemove: () => void }) {
  if (!img) return <button style={btn} onClick={() => onChange({ src: "", alt: "", caption: "", credit: "AI 생성 일러스트(회화체 재구성)", kind: "ai" })}>+ 삽화 추가</button>;
  const up = (k: keyof ColumnImage, v: string) => onChange({ ...img, [k]: v });
  return (
    <div style={{ border: "1px dashed rgba(77,56,34,.3)", borderRadius: 8, padding: 10, marginTop: 8, display: "grid", gap: 6 }}>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input style={{ ...inputStyle, flex: 1 }} placeholder="이미지 경로 /research-img/..." value={img.src} onChange={(e) => up("src", e.target.value)} />
        <select style={{ ...inputStyle, width: 120 }} value={img.kind} onChange={(e) => up("kind", e.target.value)}>
          {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
        </select>
        <button style={btn} onClick={onRemove}>삭제</button>
      </div>
      <input style={inputStyle} placeholder="캡션" value={img.caption} onChange={(e) => up("caption", e.target.value)} />
      <input style={inputStyle} placeholder="출처 표기" value={img.credit} onChange={(e) => up("credit", e.target.value)} />
      {img.src && <img src={img.src} alt="" style={{ maxHeight: 120, borderRadius: 6, objectFit: "cover" }} />}
    </div>
  );
}

export function ColumnEditor({ id, initial }: { id: string; initial: ResearchColumn }) {
  const sb = browserSupabase();
  const [role, setRole] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [c, setC] = useState<ResearchColumn>(initial);

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

  const setSection = (i: number, patch: Partial<ColumnSection>) => setC({ ...c, sections: c.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const moveSection = (i: number, d: -1 | 1) => {
    const arr = [...c.sections]; const t = i + d;
    if (t < 0 || t >= arr.length) return;
    [arr[i], arr[t]] = [arr[t], arr[i]]; setC({ ...c, sections: arr });
  };
  const addSection = () => setC({ ...c, sections: [...c.sections, { heading: "새 섹션", paragraphs: [""] }] });
  const removeSection = (i: number) => setC({ ...c, sections: c.sections.filter((_, j) => j !== i) });

  const setQA = (i: number, patch: Partial<{ q: string; a: string }>) => setC({ ...c, interview: c.interview.map((x, j) => (j === i ? { ...x, ...patch } : x)) });

  async function save() {
    setSaving(true); setMsg("");
    try {
      const token = (await sb.auth.getSession()).data.session?.access_token;
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ kind: "settings", settings: { [`column.${id}`]: { ...c, id } }, label: `${c.title} — 심화 컬럼` }),
      });
      const j = await res.json();
      if (!res.ok) { setMsg("저장 실패: " + (j.error || res.status)); return; }
      if (j.queued) { setMsg("✓ 제안 등록됨 — 교사(파워/전체 관리자) 승인 후 반영됩니다."); return; }
      setMsg("✓ 저장됨 — 새로고침합니다…");
      setTimeout(() => location.reload(), 900);
    } catch (e) { setMsg("저장 실패: " + (e as Error).message); }
    finally { setSaving(false); }
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} style={{ position: "fixed", right: 20, bottom: 20, zIndex: 900, borderRadius: 99, padding: "12px 18px", border: "none", background: "#2f2419", color: "#fff8ed", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: "0 6px 20px rgba(46,28,14,.4)" }}>
          ✎ 이 글 편집 {role === "content" ? "(제안)" : ""}
        </button>
      )}
      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(30,20,10,.5)", display: "flex", justifyContent: "flex-end" }} onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "min(760px,100%)", height: "100%", overflowY: "auto", background: "#fbf5ea", padding: 20, boxShadow: "-8px 0 30px rgba(0,0,0,.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, background: "#fbf5ea", paddingBottom: 12, borderBottom: "1px solid rgba(77,56,34,.15)", zIndex: 1 }}>
              <h2 style={{ fontSize: 18, fontWeight: 900, color: "#3a2a18", margin: 0, flex: 1 }}>심화 컬럼 편집</h2>
              {role === "content" && <span style={{ fontSize: 11.5, fontWeight: 800, color: "#a0641f" }}>콘텐츠 관리자 — 저장 시 제안</span>}
              <button style={btn} onClick={() => setOpen(false)}>닫기</button>
              <button style={{ ...btn, background: "#2f2419", color: "#fff8ed", border: "none", opacity: saving ? 0.6 : 1 }} disabled={saving} onClick={save}>{saving ? "저장 중…" : "저장"}</button>
            </div>
            {msg && <p style={{ fontSize: 13, fontWeight: 700, color: msg.startsWith("✓") ? "#2f6b3b" : "#9b3d2d", margin: "10px 0" }}>{msg}</p>}

            <div style={{ display: "grid", gap: 14, marginTop: 14 }}>
              <div><label style={labelStyle}>제목</label><input style={inputStyle} value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} /></div>
              <div><label style={labelStyle}>부제(dek)</label><textarea style={{ ...inputStyle, minHeight: 56 }} value={c.dek} onChange={(e) => setC({ ...c, dek: e.target.value })} /></div>
              <div><label style={labelStyle}>작성자 크레딧</label><input style={inputStyle} value={c.author} onChange={(e) => setC({ ...c, author: e.target.value })} /></div>
              <div><label style={labelStyle}>도입(문단 사이 빈 줄)</label><textarea style={{ ...inputStyle, minHeight: 90 }} value={joinParas(c.lead)} onChange={(e) => setC({ ...c, lead: paras(e.target.value) })} /></div>

              <div style={{ borderTop: "1px solid rgba(77,56,34,.15)", paddingTop: 12 }}>
                <label style={labelStyle}>캐릭터 시트</label>
                <input style={{ ...inputStyle, marginBottom: 6 }} placeholder="태그라인" value={c.sheet.tagline} onChange={(e) => setC({ ...c, sheet: { ...c.sheet, tagline: e.target.value } })} />
                <textarea style={{ ...inputStyle, minHeight: 90, marginBottom: 6 }} placeholder="정보 (한 줄에 '항목 | 값')" value={c.sheet.facts.map(([k, v]) => `${k} | ${v}`).join("\n")} onChange={(e) => setC({ ...c, sheet: { ...c.sheet, facts: e.target.value.split("\n").map((l) => l.split("|").map((s) => s.trim())).filter((p) => p[0]).map((p) => [p[0], p[1] || ""] as [string, string]) } })} />
                <textarea style={{ ...inputStyle, minHeight: 56 }} placeholder="가족 등 부가 설명" value={c.sheet.family || ""} onChange={(e) => setC({ ...c, sheet: { ...c.sheet, family: e.target.value } })} />
              </div>

              <div style={{ borderTop: "1px solid rgba(77,56,34,.15)", paddingTop: 12 }}>
                <label style={labelStyle}>대표 이미지(hero)</label>
                <ImageFields img={c.hero} onChange={(v) => v && setC({ ...c, hero: v })} onRemove={() => { /* hero는 유지 */ }} />
              </div>

              <div style={{ borderTop: "1px solid rgba(77,56,34,.15)", paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <label style={{ ...labelStyle, margin: 0, flex: 1 }}>본문 섹션 ({c.sections.length})</label>
                  <button style={btn} onClick={addSection}>+ 섹션 추가</button>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {c.sections.map((s, i) => (
                    <div key={i} style={{ border: "1px solid rgba(77,56,34,.2)", borderRadius: 10, padding: 12, background: "#fff" }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        <input style={{ ...inputStyle, flex: 1, fontWeight: 800 }} value={s.heading} onChange={(e) => setSection(i, { heading: e.target.value })} />
                        <button style={btn} onClick={() => moveSection(i, -1)}>↑</button>
                        <button style={btn} onClick={() => moveSection(i, 1)}>↓</button>
                        <button style={{ ...btn, color: "#9b3d2d" }} onClick={() => removeSection(i)}>✕</button>
                      </div>
                      <textarea style={{ ...inputStyle, minHeight: 120 }} value={joinParas(s.paragraphs)} onChange={(e) => setSection(i, { paragraphs: paras(e.target.value) })} />
                      <ImageFields img={s.image} onChange={(v) => setSection(i, { image: v })} onRemove={() => setSection(i, { image: undefined })} />
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(77,56,34,.15)", paddingTop: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <label style={{ ...labelStyle, margin: 0, flex: 1 }}>가상 인터뷰 ({c.interview.length})</label>
                  <button style={btn} onClick={() => setC({ ...c, interview: [...c.interview, { q: "", a: "" }] })}>+ 문답 추가</button>
                </div>
                <input style={{ ...inputStyle, marginBottom: 8 }} placeholder="인터뷰 안내 문구" value={c.interviewNote} onChange={(e) => setC({ ...c, interviewNote: e.target.value })} />
                <div style={{ display: "grid", gap: 8 }}>
                  {c.interview.map((qa, i) => (
                    <div key={i} style={{ border: "1px solid rgba(77,56,34,.2)", borderRadius: 10, padding: 10, background: "#fff" }}>
                      <input style={{ ...inputStyle, fontWeight: 700, marginBottom: 4 }} placeholder="질문" value={qa.q} onChange={(e) => setQA(i, { q: e.target.value })} />
                      <textarea style={{ ...inputStyle, minHeight: 70 }} placeholder="답변" value={qa.a} onChange={(e) => setQA(i, { a: e.target.value })} />
                      <button style={{ ...btn, color: "#9b3d2d", marginTop: 4 }} onClick={() => setC({ ...c, interview: c.interview.filter((_, j) => j !== i) })}>문답 삭제</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(77,56,34,.15)", paddingTop: 12 }}>
                <label style={labelStyle}>출처 (한 줄에 하나)</label>
                <textarea style={{ ...inputStyle, minHeight: 90 }} value={c.sources.join("\n")} onChange={(e) => setC({ ...c, sources: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
