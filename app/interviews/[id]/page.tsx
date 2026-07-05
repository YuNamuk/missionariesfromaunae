import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchInterview, fetchInterviewVideos, youtubeEmbed } from "@/lib/db/interviews";
import { PHOTOS } from "@/lib/data/photos";
import { InterviewVideoEditor } from "@/components/interview-video-editor";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = await fetchInterview(id);
  return e ? { title: `${e.personName} — 가상 인터뷰` } : { title: "가상 인터뷰" };
}

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await fetchInterview(id);
  if (!e) notFound();
  const videos = await fetchInterviewVideos();
  const embed = youtubeEmbed(e.video.youtube);
  const portrait = PHOTOS[e.personId]?.photo ?? e.hero.src;

  return (
    <div className="pb-24">
      {/* ── 영화관: 상단 영상 ── */}
      <div className="w-full" style={{ background: "#140d07" }}>
        <div className="mx-auto max-w-5xl px-4 pt-8">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl" style={{ background: "#000", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
            {embed ? (
              <iframe src={embed} title={`${e.personName} 가상 인터뷰`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 h-full w-full" />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={e.hero.src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
                  <span className="text-4xl">🎬</span>
                  <span className="text-[15px] font-bold text-white/90">AI 재현 인터뷰 영상 준비 중</span>
                  <span className="text-[12px] text-white/55">관리자가 유튜브 영상을 등록하면 이곳에 재생됩니다.</span>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait} alt="" className="h-12 w-12 flex-none rounded-full object-cover" style={{ background: "#efe1c3" }} />
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl font-bold text-[#fff8ec]">{e.personName} <span className="text-[15px] font-semibold text-white/60">· 가상 인터뷰</span></h1>
              <p className="truncate text-[12.5px] text-white/55">{e.author}</p>
            </div>
            <Link href={`/research/story/${e.columnId}`} className="flex-none rounded-full border border-white/25 px-3 py-1.5 text-[12.5px] font-bold text-white/90 hover:bg-white/10">심화 이야기 →</Link>
          </div>
        </div>
      </div>

      {/* ── 인터뷰 문답 ── */}
      <article className="mx-auto max-w-3xl px-5 pt-10 sm:px-7">
        <p className="rounded-lg bg-[rgba(191,107,34,.08)] px-4 py-3 text-[12.5px] font-semibold leading-relaxed text-[#a0641f]">※ {e.note}</p>
        <dl className="mt-8 space-y-7">
          {e.qa.map((qa, i) => (
            <div key={i} className="border-b border-ink-100 pb-6 last:border-0">
              <dt className="flex gap-2 text-[16px] font-extrabold text-ink-900"><span className="text-[#9b3d2d]">Q{i + 1}.</span><span>{qa.q}</span></dt>
              <dd className="mt-2.5 text-[16px] leading-[1.9] text-ink-700">{qa.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/interviews" className="rounded-full border border-ink-200 px-4 py-2 text-[13px] font-bold text-ink-700 hover:bg-ink-50">← 가상 인터뷰 목록</Link>
          <Link href={`/people/${e.personId}`} className="rounded-full bg-[#2f2419] px-4 py-2 text-[13px] font-bold text-[#fff8ed]">인물 상세 →</Link>
        </div>
      </article>

      {/* 관리자: AI 재현 영상(YouTube) 등록 */}
      <InterviewVideoEditor personId={e.personId} videos={videos} />
    </div>
  );
}
