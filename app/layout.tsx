import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { ColorModeProvider } from "@/components/color-mode";
import { MapSettingsProvider } from "@/components/map-settings";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://missionaries-khaki.vercel.app";
const DESC =
  "한국 초기 개신교 선교사(1882–1935)를 지도·연표·관계망으로 한눈에 살펴보는 디지털 아카이브. 양화진·선교 묘역·선교 유적지와 인물 이야기.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Missionaries from Aunae · Dreamy School",
    template: "%s · Missionaries from Aunae",
  },
  description: DESC,
  applicationName: "Missionaries from Aunae",
  keywords: [
    "조선 선교사", "한국 개신교 역사", "초기 선교사", "양화진", "선교 묘역", "선교 유적지",
    "언더우드", "아펜젤러", "평양 대부흥", "한국 선교", "아우내", "missionaries to Korea", "Missionaries from Aunae", "Korean church history",
  ],
  authors: [{ name: "Missionaries from Aunae" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Missionaries from Aunae",
    title: "Missionaries from Aunae · Dreamy School",
    description: DESC,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Missionaries from Aunae · Dreamy School",
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
        {/* 웹폰트: 본문·UI = Pretendard, 서정 지면 = 고운돋움, 라틴 디스플레이 = Nunito */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,600&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700;1,6..12,400&family=Gowun+Dodum&display=swap" />
      </head>
      <body>
        <ColorModeProvider>
          <MapSettingsProvider>
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:font-bold focus:text-white">본문으로 건너뛰기</a>
            <Suspense fallback={<div style={{ height: "4rem", background: "#2e2218" }} />}>
              <SiteHeader />
            </Suspense>
            <main id="main-content">{children}</main>
          </MapSettingsProvider>
        </ColorModeProvider>
      </body>
    </html>
  );
}
