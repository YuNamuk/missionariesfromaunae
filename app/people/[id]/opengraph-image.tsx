import { ImageResponse } from "next/og";
import { getPerson } from "@/lib/data";
import { PHOTOS } from "@/lib/data/photos";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-dynamic";
export const alt = "Missionaries from Aunae";

// 인물 페이지 공유 카드. ImageResponse 기본 폰트엔 한글이 없어 영문명·연도로 구성한다.
export default async function PersonOg({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = getPerson(id);
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missionaries-khaki.vercel.app";
  const photo = p ? PHOTOS[p.id]?.photo : null;
  const photoUrl = photo ? new URL(photo, SITE).toString() : null;
  const name = p?.en || "Missionaries from Aunae";
  const life = p?.life ?? "";
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "linear-gradient(135deg,#3a2a1c 0%,#2e2218 100%)", color: "#fff8ec", padding: 72, alignItems: "center", gap: 56 }}>
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} width={320} height={410} style={{ objectFit: "cover", borderRadius: 28, border: "4px solid rgba(255,248,236,.25)", flex: "0 0 auto" }} alt="" />
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: 5, color: "#7db7d8" }}>MISSIONARIES TO KOREA · 1882–1935</div>
          <div style={{ fontSize: 76, fontWeight: 900, marginTop: 24, lineHeight: 1.05 }}>{name}</div>
          {life ? <div style={{ fontSize: 36, marginTop: 14, color: "rgba(255,248,236,.85)" }}>{life}</div> : null}
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 34, letterSpacing: 3, color: "#7db7d8" }}>Missionaries from Aunae · Dreamy School</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
