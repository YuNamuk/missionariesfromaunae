import type { Metadata } from "next";
import Link from "next/link";
import { fetchInterviews, youtubeEmbed } from "@/lib/db/interviews";
import { PHOTOS } from "@/lib/data/photos";
import { getLocale } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const l = await getLocale();
  return { title: l === "mn" ? "Виртуал ярилцлага" : l === "en" ? "Virtual Interviews" : "가상 인터뷰" };
}

export default async function InterviewsIndex() {
  const locale = await getLocale();
  const T = (ko: string, en: string, mn: string) => (locale === "mn" ? mn : locale === "en" ? en : ko);
  const list = await fetchInterviews();

  return (
    <div className="mx-auto max-w-4xl px-5 pb-24 pt-12 sm:px-7">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.18em] text-sky-600">Virtual Interviews</p>
      <h1 className="font-serif mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">{T("가상 인터뷰", "Virtual Interviews", "Виртуал ярилцлага")}</h1>
      <p className="font-serif mt-3 max-w-2xl text-[16px] leading-relaxed text-ink-600">
        {T(
          "선교사들의 편지와 사료를 바탕으로 학생들이 재구성한 ‘가상 인터뷰’입니다. 상단의 AI 재현 영상을 보고, 아래에서 더 깊은 문답을 만나보세요. 실제 발언 기록이 아닙니다.",
          "‘Virtual interviews’ students reconstructed from missionaries’ letters and historical sources. Watch the AI-reconstructed film above, then read the fuller dialogue below. These are not records of actual statements.",
          "Номлогчдын захидал, түүхэн эх сурвалжид тулгуурлан сурагчид сэргээн зохиосон ‘виртуал ярилцлага’. Дээрх AI сэргээлтийн бичлэгийг үзээд, доор гүнзгий асуулт хариултыг уншаарай. Бодит мэдэгдлийн бичлэг биш.",
        )}
      </p>

      {list.length === 0 ? (
        <p className="mt-10 text-[14px] text-ink-500">{T("아직 등록된 인터뷰가 없습니다.", "No interviews yet.", "Одоогоор ярилцлага алга.")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {list.map((e) => {
            const portrait = PHOTOS[e.personId]?.photo ?? e.hero.src;
            const hasVideo = !!youtubeEmbed(e.video.youtube);
            return (
              <Link key={e.id} href={`/interviews/${e.personId}`} className="group overflow-hidden rounded-3xl border border-ink-200 bg-white transition-colors hover:border-sky-300">
                <div className="relative aspect-[16/9] w-full overflow-hidden" style={{ background: "#20160e" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={e.hero.src} alt="" className="h-full w-full object-cover opacity-80 transition-transform group-hover:scale-105" />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/55 text-2xl text-white backdrop-blur">▶</span>
                  </span>
                  <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: hasVideo ? "rgba(155,61,45,.9)" : "rgba(40,26,14,.7)", color: "#fff8ec" }}>
                    {hasVideo ? T("영상 있음", "Video", "Бичлэгтэй") : T("영상 준비 중", "Video soon", "Бичлэг удахгүй")}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={portrait} alt="" className="h-11 w-11 flex-none rounded-full object-cover" style={{ background: "#efe1c3" }} />
                  <span className="min-w-0">
                    <span className="font-serif block text-[17px] font-bold text-ink-900">{e.personName}</span>
                    <span className="block text-[12.5px] font-bold text-sky-600">{T("가상 인터뷰 보기 →", "watch interview →", "ярилцлага үзэх →")}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
