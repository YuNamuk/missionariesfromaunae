import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const alt = "조선 선교사 온라인 자료실 · Missionaries to Korea";

// ImageResponse 기본 폰트에는 한글 글리프가 없어, 공유 카드는 영문 브랜드로 구성한다.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg,#3a2a1c 0%,#2e2218 100%)",
          color: "#fff8ec",
          padding: 84,
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "linear-gradient(135deg,#1F6F8B,#3F7F4B)",
              fontSize: 56,
              fontWeight: 900,
            }}
          >
            Ð
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6, color: "#7db7d8" }}>
            MISSIONARIES TO KOREA · 1882–1935
          </div>
        </div>
        <div style={{ fontSize: 82, fontWeight: 900, marginTop: 30, lineHeight: 1.08 }}>
          Missionaries from Aunae
        </div>
        <div style={{ fontSize: 33, marginTop: 26, color: "rgba(255,248,236,.85)" }}>
          An online archive of Korea&#39;s early Protestant missionaries —
        </div>
        <div style={{ fontSize: 33, color: "rgba(255,248,236,.85)" }}>
          mapped by place, time, and relationship.
        </div>
      </div>
    ),
    { ...size },
  );
}
