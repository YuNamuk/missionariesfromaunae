import type { Metadata } from "next";
import Link from "next/link";
import { STUDENT_VOICES } from "@/lib/data/voices";

export const metadata: Metadata = {
  title: "우리의 여정 · 함께 걸어온 길",
  description:
    "한 사람의 삶을 만나고, 아름다운 삶을 묻고, 나의 응답을 적고, 다음 주자로 서기까지 — 이 수업을 함께 걸어온 여정과 학생들의 목소리.",
};

// /journey — 인물들의 여정 옆에 두는, 수업(선생님과 학생들)이 걸어온 여정.
// 두 번째 움직임("복음이 나를 통해")이 실제로 살아나는 자리.

// 유세리 교사의 'Missionaries from Aunae(한국 기독교사의 이해)' 3P 활동 구조에 기초.
const STEPS = [
  {
    n: "01",
    title: "배움 — Play",
    en: "Understanding the soil",
    body: "조선 말기의 닫힌 사회와, 그 땅이 복음을 받아들인 배경을 배웁니다. 의료·교육·문서 선교가 어떻게 한 나라를 깨웠는지 살피고, 그 첫 물음을 에세이로 적습니다.",
    href: "/story",
    cta: "복음이 들어온 길 보기",
  },
  {
    n: "02",
    title: "만남 — Performance",
    en: "Meeting a life",
    body: "선교사의 입국과 활동을 분석하고, 정동과 양화진을 직접 걷습니다. 그리고 한 사람을 깊이 연구해, 그 삶을 친구에게 이야기하듯 나눕니다.",
    href: "/",
    cta: "지도에서 만나기",
  },
  {
    n: "03",
    title: "되살림 — Practice",
    en: "Re-telling the story",
    body: "연구보고서를 쓰고, 그 사람의 목소리로 ‘가상 인터뷰집’을 만듭니다. 백 년 전 한 사람의 삶이 학생의 손끝에서 다시 살아나, 오늘의 언어로 말을 겁니다.",
    href: "/people",
    cta: "인물을 연구하러 가기",
  },
  {
    n: "04",
    title: "다음 주자 — The Next Runner",
    en: "My mission",
    body: "마지막은 ‘사명 로드맵’입니다. 받은 사람이 전하는 사람이 되는 릴레이의 다음 칸은 비어 있습니다. “I am a missionary from Aunae.”",
    href: "/story",
    cta: "나의 자리 확인하기",
  },
];

export default function JourneyPage() {
  return (
    <main className="lyric" style={{ background: "#f6efe1", color: "#3a2b1d" }}>
      {/* Hero */}
      <section
        style={{
          padding: "clamp(72px,14vh,140px) 24px clamp(48px,8vh,80px)",
          textAlign: "center",
          background: "radial-gradient(circle at 50% 20%, rgba(31,111,139,.12), transparent 60%)",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#1f6f8b" }}>
            Our Journey
          </span>
          <h1 className="font-serif" style={{ fontSize: "clamp(34px,6vw,60px)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, margin: "20px 0 0", color: "#2e2218" }}>
            함께 걸어온 길
          </h1>
          <p className="font-serif" style={{ maxWidth: 560, margin: "24px auto 0", fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 1.95, color: "#5f4d39" }}>
            인물들의 여정 옆에, 우리의 여정을 둡니다. 한 사람의 삶을 만나고, 아름다운
            삶을 묻고, 나의 응답을 적고, 다음 주자로 서기까지 — 이 수업이 걸어온 길입니다.
          </p>
        </div>
      </section>

      {/* 여정의 단계 */}
      <section style={{ padding: "8px 24px 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex",
                gap: "clamp(16px,3vw,30px)",
                alignItems: "flex-start",
                padding: "clamp(22px,3vw,32px)",
                borderRadius: 22,
                background: "rgba(255,255,255,.62)",
                border: "1px solid rgba(120,90,50,.16)",
              }}
            >
              <span className="font-serif" style={{ fontSize: "clamp(34px,6vw,56px)", fontWeight: 700, lineHeight: 1, color: "rgba(155,61,45,.32)", flex: "0 0 auto" }}>
                {s.n}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bf6b22" }}>{s.en}</div>
                <h2 className="font-serif" style={{ fontSize: "clamp(22px,3.4vw,30px)", fontWeight: 700, margin: "6px 0 10px", color: "#2e2218" }}>{s.title}</h2>
                <p className="font-serif" style={{ fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.9, color: "#5f4d39", margin: 0 }}>{s.body}</p>
                <Link href={s.href} style={{ display: "inline-block", marginTop: 14, fontSize: 14, fontWeight: 800, color: "#9b3d2d", textDecoration: "underline", textUnderlineOffset: 3 }}>
                  {s.cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 복음의 계보 — 수업이 따라 걸은 길(실제 커리큘럼 흐름) */}
      <section style={{ padding: "clamp(48px,8vh,84px) 24px", background: "linear-gradient(180deg,#2e2218,#3a2a1c)", color: "#fff8ec" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#e8a765" }}>Lineage of the Gospel</span>
          <h2 className="font-serif" style={{ fontSize: "clamp(26px,4.4vw,40px)", fontWeight: 700, margin: "12px 0 8px", color: "#fff8ec" }}>복음의 계보</h2>
          <p className="font-serif" style={{ fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.9, color: "rgba(255,248,236,.82)", maxWidth: 600, margin: "0 auto 36px" }}>
            우리는 한국 선교사만 본 것이 아니라, 복음이 흘러온 긴 강을 거슬러 올랐습니다.
            초대교회의 순교자들에서 시작해, 중세를 지나, 이 땅의 선교사들에게로 — 그리고
            그 강이 지금 우리에게 닿았습니다. 같은 한 줄기의 복음입니다.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
            {[
              { era: "초대교회", note: "기꺼이 밀알이 된 순교자들 (Jesus Freaks)" },
              { era: "중세 교회", note: "어둠 속에서도 꺼지지 않은 등불" },
              { era: "조선의 선교사", note: "성경이 먼저 들어온 땅, 양화진에 묻힌 사람들" },
              { era: "그리고 나", note: "바통을 받은 다음 주자", last: true },
            ].map((s) => (
              <div key={s.era} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "0 0 auto" }}>
                  <span style={{ width: 14, height: 14, borderRadius: 99, background: s.last ? "#e8a765" : "rgba(255,248,236,.55)", border: s.last ? "2px solid #e8a765" : "none", boxShadow: "0 0 0 4px rgba(46,28,14,.5)" }} />
                  {!s.last && <span style={{ width: 2, height: 44, background: "rgba(255,248,236,.25)" }} />}
                </div>
                <div style={{ paddingBottom: s.last ? 0 : 18 }}>
                  <div className="font-serif" style={{ fontSize: 18, fontWeight: 700, color: s.last ? "#e8a765" : "#fff8ec" }}>{s.era}</div>
                  <div className="font-serif" style={{ fontSize: 14, color: "rgba(255,248,236,.7)", marginTop: 2 }}>{s.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 학생들의 목소리 */}
      <section style={{ padding: "clamp(56px,9vh,96px) 24px clamp(72px,12vh,120px)", background: "linear-gradient(180deg,#efe4cd,#f6efe1)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9b3d2d" }}>Voices</span>
            <h2 className="font-serif" style={{ fontSize: "clamp(26px,4.4vw,40px)", fontWeight: 700, margin: "12px 0 0", color: "#2e2218" }}>학생들의 목소리</h2>
          </div>

          {STUDENT_VOICES.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {STUDENT_VOICES.map((v, i) => (
                <figure key={i} style={{ margin: 0, padding: "clamp(22px,3vw,30px)", borderRadius: 20, background: "rgba(255,255,255,.7)", borderLeft: "4px solid #bf6b22" }}>
                  {v.prompt && <figcaption style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#bf6b22", marginBottom: 10 }}>{v.prompt}</figcaption>}
                  <blockquote className="font-serif" style={{ margin: 0, fontSize: "clamp(17px,2.5vw,21px)", lineHeight: 1.8, color: "#46362a", fontStyle: "italic" }}>
                    “{v.text}”
                  </blockquote>
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: "#8a7860" }}>
                    — {v.author ?? "익명의 한 학생"}{v.context ? ` · ${v.context}` : ""}
                  </div>
                </figure>
              ))}
            </div>
          ) : (
            <div className="font-serif" style={{ textAlign: "center", padding: "clamp(36px,6vw,56px) 24px", borderRadius: 22, border: "1px dashed rgba(120,90,50,.3)", background: "rgba(255,255,255,.4)", color: "#6b5a44" }}>
              <p style={{ fontSize: "clamp(16px,2.3vw,19px)", lineHeight: 1.9, margin: 0, maxWidth: 520, marginInline: "auto" }}>
                이곳은 학생들의 응답이 모이는 자리입니다.
                <br />
                어설퍼도 정직한 한 줄들이, 검토와 동의를 거쳐 조심스럽게 이 자리에 담길 것입니다.
              </p>
              <p style={{ fontSize: 13.5, color: "#9a8060", marginTop: 16 }}>곧 채워집니다.</p>
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link href="/story" style={{ display: "inline-flex", padding: "13px 24px", borderRadius: 999, fontSize: 15, fontWeight: 800, textDecoration: "none", background: "linear-gradient(135deg,#9b3d2d,#bf6b22)", color: "#fff8ec" }}>
              ← 들어가며로 돌아가기
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
