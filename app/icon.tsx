import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";

// 브랜드 마크 'Ð' — 헤더 로고와 동일한 정체성.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg,#1F6F8B,#3F7F4B)",
          color: "#fff8ec",
          fontSize: 44,
          fontWeight: 900,
          borderRadius: 14,
        }}
      >
        Ð
      </div>
    ),
    { ...size },
  );
}
