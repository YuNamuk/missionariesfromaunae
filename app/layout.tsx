import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missionaries-khaki.vercel.app";
const DESC =
  "한국 초기 개신교 선교사(1882–1935)를 지도·연표·관계망으로 한눈에 살펴보는 디지털 아카이브. 양화진·선교 묘역·선교 유적지와 인물 이야기.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "조선 선교사 온라인 자료실 · Missionaries from Aunae",
    template: "%s · 조선 선교사 온라인 자료실",
  },
  description: DESC,
  applicationName: "조선 선교사 온라인 자료실",
  keywords: [
    "조선 선교사", "한국 개신교 역사", "초기 선교사", "양화진", "선교 묘역", "선교 유적지",
    "언더우드", "아펜젤러", "평양 대부흥", "한국 선교", "missionaries to Korea", "Korean church history",
  ],
  authors: [{ name: "조선 선교사 온라인 자료실" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "조선 선교사 온라인 자료실",
    title: "조선 선교사 온라인 자료실 · Missionaries from Aunae",
    description: DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "조선 선교사 온라인 자료실",
    description: DESC,
  },
};

export const viewport: Viewport = {
  themeColor: "#2e2218",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
      </head>
      <body>
        <Suspense fallback={<div style={{ height: "4rem", background: "#2e2218" }} />}>
          <SiteHeader />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
}
