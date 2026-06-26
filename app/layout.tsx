import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "조선 선교사 온라인 자료실 · Missionaries from Aunae",
  description:
    "한국 초기 개신교 선교사(1882–1935)를 지도·연표·관계망으로 한눈에 살펴보는 디지털 아카이브.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <Suspense fallback={<div style={{ height: "4rem", background: "#2e2218" }} />}>
          <SiteHeader />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
}
