import type { Metadata } from "next";
import Link from "next/link";
import { STUDENT_VOICES } from "@/lib/data/voices";
import { JOURNEY_COPY, mergeCopy } from "@/lib/data/page-copy";
import { fetchPageContent } from "@/lib/db/editable";
import { getLocale } from "@/lib/i18n/server";
import { fetchPageI18n, fetchVoicesI18n, ov } from "@/lib/i18n/content";

export async function generateMetadata(): Promise<Metadata> {
  const l = await getLocale();
  const t = (ko: string, en: string, mn: string) => (l === "mn" ? mn : l === "en" ? en : ko);
  return {
    title: t("우리의 여정 · 함께 걸어온 길", "Our Journey · The Road We Walked", "Бидний аялал"),
    description: t(
      "한 사람의 삶을 만나고, 아름다운 삶을 묻고, 나의 응답을 적고, 다음 주자로 서기까지 — 이 수업을 함께 걸어온 여정과 학생들의 목소리.",
      "Meeting a life, asking what a beautiful life is, writing our response, and standing as the next runner — the journey of this class and the students' voices.",
      "Нэг амьдралтай уулзаж, сайхан амьдрал гэж юу болохыг асууж, өөрийн хариултаа бичих — энэ ангийн аялал ба сурагчдын дуу хоолой.",
    ),
  };
}

// 로케일 쿠키 + 관리자 카피 편집을 반영하기 위해 요청별 동적 렌더.
export const dynamic = "force-dynamic";

// /journey — 인물들의 여정 옆에 두는, 수업(선생님과 학생들)이 걸어온 여정.
// 두 번째 움직임("복음이 나를 통해")이 실제로 살아나는 자리.

type Tri = (ko: string, en: string, mn: string) => string;

// 유세리 교사의 'Missionaries from Aunae(한국 기독교사의 이해)' 3P 활동 구조에 기초.
function buildSteps(T: Tri) {
  return [
    {
      n: "01",
      title: T("배움 — Play", "Learning — Play", "Суралцах — Play"),
      en: "Understanding the soil",
      body: T(
        "조선 말기의 닫힌 사회와, 그 땅이 복음을 받아들인 배경을 배웁니다. 의료·교육·문서 선교가 어떻게 한 나라를 깨웠는지 살피고, 그 첫 물음을 에세이로 적습니다.",
        "We learn about the closed society of late-Joseon Korea and how that land came to receive the gospel. We trace how medical, educational, and literary mission awakened a nation, and write our first question as an essay.",
        "Хожуу Жусоны хаалттай нийгэм, тэр газар сайн мэдээг хүлээн авсан учрыг судална. Анагаах, боловсрол, хэвлэлийн номлол нэг улсыг хэрхэн сэрээснийг үзэж, анхны асуултаа эссэ болгон бичнэ.",
      ),
      href: "/story",
      cta: T("복음이 들어온 길 보기", "See how the gospel arrived", "Сайн мэдээ хэрхэн ирснийг үзэх"),
    },
    {
      n: "02",
      title: T("만남 — Performance", "Encounter — Performance", "Уулзалт — Performance"),
      en: "Meeting a life",
      body: T(
        "선교사의 입국과 활동을 분석하고, 정동과 양화진을 직접 걷습니다. 그리고 한 사람을 깊이 연구해, 그 삶을 친구에게 이야기하듯 나눕니다.",
        "We analyze the missionaries' arrival and work, and walk Jeongdong and Yanghwajin ourselves. Then we study one person deeply and share that life as if telling a friend.",
        "Номлогчдын ирэлт, үйл ажиллагааг задлан шинжилж, Жондон, Янхважинг өөрсдөө алхана. Дараа нь нэг хүнийг гүнзгий судалж, тэр амьдралыг найздаа ярьж буй мэт хуваалцана.",
      ),
      href: "/",
      cta: T("지도에서 만나기", "Meet them on the map", "Газрын зураг дээр уулзах"),
    },
    {
      n: "03",
      title: T("되살림 — Practice", "Reviving — Practice", "Сэргээх — Practice"),
      en: "Re-telling the story",
      body: T(
        "연구보고서를 쓰고, 그 사람의 목소리로 ‘가상 인터뷰집’을 만듭니다. 백 년 전 한 사람의 삶이 학생의 손끝에서 다시 살아나, 오늘의 언어로 말을 겁니다.",
        "We write research reports and create a 'virtual interview' in that person's voice. A life from a hundred years ago revives at a student's fingertips and speaks in today's language.",
        "Судалгааны тайлан бичиж, тэр хүний дуу хоолойгоор 'төсөөллийн ярилцлага' бүтээнэ. Зуун жилийн өмнөх нэг амьдрал сурагчийн гар дор сэргэж, өнөөгийн хэлээр ярина.",
      ),
      href: "/people",
      cta: T("인물을 연구하러 가기", "Go study a person", "Хүн судлахаар очих"),
    },
    {
      n: "04",
      title: T("다음 주자 — The Next Runner", "The Next Runner", "Дараагийн гүйгч — The Next Runner"),
      en: "My mission",
      body: T(
        "마지막은 ‘사명 로드맵’입니다. 받은 사람이 전하는 사람이 되는 릴레이의 다음 칸은 비어 있습니다. “I am a missionary from Aunae.”",
        "The last step is a 'mission roadmap.' In the relay where the one who receives becomes the one who gives, the next space is empty. “I am a missionary from Aunae.”",
        "Сүүлчийн алхам бол 'эрхэм зорилгын зураглал'. Хүлээн авсан хүн дамжуулагч болдог буухиад дараагийн нүд хоосон байна. “I am a missionary from Aunae.”",
      ),
      href: "/story",
      cta: T("나의 자리 확인하기", "Find my place", "Миний байрыг олох"),
    },
  ];
}

export default async function JourneyPage() {
  const locale = await getLocale();
  const T: Tri = (ko, en, mn) => (locale === "mn" ? mn : locale === "en" ? en : ko);
  const base = mergeCopy(JOURNEY_COPY, await fetchPageContent("journey"));
  // 번역 오버레이를 코피 위에 덮는다(필드 단위, 없으면 한국어 폴백).
  const ji = await fetchPageI18n("journey", locale);
  const j: Record<string, string> = { ...base };
  if (ji) for (const k of Object.keys(base)) j[k] = ov(base[k], ji[k]);
  const STEPS = buildSteps(T);
  // 학생 목소리 번역(인덱스 정렬, 없으면 한국어).
  const voicesTr = await fetchVoicesI18n(locale);
  const voices = STUDENT_VOICES.map((v, i) => ({
    text: ov(v.text, voicesTr?.[i]?.text),
    prompt: ov(v.prompt ?? "", voicesTr?.[i]?.prompt),
    author: v.author,
    context: ov(v.context ?? "", voicesTr?.[i]?.context),
  }));
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
            {j.heroTitle}
          </h1>
          <p className="font-serif" style={{ maxWidth: 560, margin: "24px auto 0", fontSize: "clamp(16px,2.2vw,19px)", lineHeight: 1.95, color: "#5f4d39" }}>
            {j.heroLead}
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
          <h2 className="font-serif" style={{ fontSize: "clamp(26px,4.4vw,40px)", fontWeight: 700, margin: "12px 0 8px", color: "#fff8ec" }}>{j.lineageTitle}</h2>
          <p className="font-serif" style={{ fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.9, color: "rgba(255,248,236,.82)", maxWidth: 600, margin: "0 auto 36px" }}>
            {j.lineageLead}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, maxWidth: 460, margin: "0 auto", textAlign: "left" }}>
            {[
              { era: T("초대교회", "The Early Church", "Эртний чуулган"), note: T("기꺼이 밀알이 된 순교자들 (Jesus Freaks)", "Martyrs who willingly became grains of wheat (Jesus Freaks)", "Үр тариа болохыг сайн дураараа сонгосон амь үрэгчид (Jesus Freaks)") },
              { era: T("중세 교회", "The Medieval Church", "Дундад зууны чуулган"), note: T("어둠 속에서도 꺼지지 않은 등불", "A lamp that did not go out even in the dark", "Харанхуйд ч унтраагүй дэнлүү") },
              { era: T("조선의 선교사", "The Missionaries to Korea", "Солонгос дахь номлогчид"), note: T("성경이 먼저 들어온 땅, 양화진에 묻힌 사람들", "A land where the Bible came first; those buried at Yanghwajin", "Библи түрүүлж ирсэн нутаг, Янхважинд оршуулагдсан хүмүүс") },
              { era: T("그리고 나", "And me", "Тэгээд би"), note: T("바통을 받은 다음 주자", "The next runner who received the baton", "Бороохойг хүлээн авсан дараагийн гүйгч"), last: true },
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

      {/* 학생들이 쓴 책 — 실제 산출물(『하나님이 우리를 이처럼 사랑하사』) */}
      <section style={{ padding: "clamp(56px,9vh,96px) 24px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#1f6f8b" }}>The Book They Wrote</span>
            <h2 className="font-serif" style={{ fontSize: "clamp(26px,4.4vw,40px)", fontWeight: 700, margin: "12px 0 10px", color: "#2e2218" }}>{j.bookTitle}</h2>
            <p className="font-serif" style={{ fontSize: "clamp(16px,2.3vw,19px)", lineHeight: 1.85, color: "#5f4d39", maxWidth: 600, margin: "0 auto" }}>
              {j.bookLead}
            </p>
          </div>

          <div style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))" }}>
            {[
              {
                part: "Part 1",
                title: T("복음이 선교사를 통해 나에게", "The gospel, through missionaries, to me", "Сайн мэдээ — номлогчдоор дамжин надад"),
                ch: [
                  T("1. 흔들리는 조선", "1. A shaken Joseon", "1. Доргиж буй Жусон"),
                  T("2. 선교사보다 먼저 들어온 복음", "2. The gospel that arrived before the missionaries", "2. Номлогчдоос өмнө ирсэн сайн мэдээ"),
                  T("3. 선교사와 함께 걷는 복음의 길", "3. Walking the gospel road with the missionaries", "3. Номлогчидтай хамт алхах сайн мэдээний зам"),
                  T("4. 하나님이 조선을 이처럼 사랑하사 — 서울 선교유적지 탐방", "4. For God so loved Joseon — visiting Seoul's mission sites", "4. Бурхан Жусоныг ийнхүү хайрласан — Сөүлийн номлолын дурсгалт газруудаар"),
                  T("5. 책으로 만나는 그 날들의 이야기", "5. The story of those days, met through a book", "5. Номоор дамжин танилцах тэр өдрүүдийн түүх"),
                ],
              },
              {
                part: "Part 2",
                title: T("복음이 나를 통해 세계로", "The gospel, through me, to the world", "Сайн мэдээ — надаар дамжин дэлхийд"),
                ch: ["6. Who Am I?", "7. I Am the Next Runner"],
              },
            ].map((p) => (
              <div key={p.part} style={{ padding: "clamp(22px,3vw,28px)", borderRadius: 20, background: "rgba(255,255,255,.62)", border: "1px solid rgba(120,90,50,.16)" }}>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: "#bf6b22" }}>{p.part}</div>
                <h3 className="font-serif" style={{ fontSize: 20, fontWeight: 700, margin: "6px 0 14px", color: "#2e2218" }}>{p.title}</h3>
                <ul className="font-serif" style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 9 }}>
                  {p.ch.map((c) => (
                    <li key={c} style={{ fontSize: 14.5, lineHeight: 1.6, color: "#5f4d39", paddingLeft: 12, borderLeft: "2px solid rgba(191,107,34,.4)" }}>{c}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <blockquote className="font-serif" style={{ margin: "32px auto 0", maxWidth: 600, textAlign: "center", fontSize: "clamp(16px,2.3vw,19px)", lineHeight: 1.9, color: "#5f3a1f", fontStyle: "italic" }}>
            {T(
              "“그들의 발자취를 따라 · 복음의 보금자리 · 그들의 일생 동안 풍긴 향을 맡는 여정 · Korea is his home · 와서 우리를 도우라”",
              "“Following their footsteps · The nest of the gospel · A journey to breathe the fragrance their lives gave off · Korea is his home · Come over and help us”",
              "“Тэдний мөрийг дагаж · Сайн мэдээний үүр · Тэдний амьдралаас тархсан үнэрийг мэдрэх аялал · Korea is his home · Ирж бидэнд тусал”",
            )}
            <span style={{ display: "block", marginTop: 10, fontSize: 13, fontStyle: "normal", fontWeight: 700, color: "#8a7860" }}>{T("— 학생들이 붙인 탐방기의 소제목들 (드리미학교)", "— Subtitles the students gave their field notes (Dreamy School)", "— Сурагчдын аяллын тэмдэглэлд өгсөн дэд гарчгууд (Dreamy School)")}</span>
          </blockquote>
        </div>
      </section>

      {/* 탐방의 기록 — 그들의 발자취를 따라(2023·2026 서울 선교유적지 탐방) */}
      <section style={{ padding: "clamp(56px,9vh,96px) 24px", background: "linear-gradient(180deg,#f6efe1,#efe4cd)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#bf6b22" }}>On the Ground</span>
            <h2 className="font-serif" style={{ fontSize: "clamp(26px,4.4vw,40px)", fontWeight: 700, margin: "12px 0 8px", color: "#2e2218" }}>{j.tripTitle}</h2>
            <p className="font-serif" style={{ fontSize: "clamp(15px,2vw,17px)", lineHeight: 1.85, color: "#5f4d39", maxWidth: 560, margin: "0 auto" }}>
              {j.tripLead}
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { place: T("배재학당", "Paichai Hakdang", "Пэжэ Хакдан"), body: T(
                "정문 앞에는 500살이 넘은 향나무가 서 있었다. 임진왜란 때 일본 장군이 말을 묶었다는 쇠못이, 그새 폭풍 성장한 나무의 높은 곳에 아직 박혀 있었다. 시간이 흘러도 흔적은 남는다.",
                "Before the front gate stood a juniper more than 500 years old. An iron nail, said to have tethered a Japanese general's horse during the Imjin War, was still lodged high up in the tree that had since grown enormously. Time passes, but traces remain.",
                "Гол хаалганы өмнө 500 гаруй настай арц мод зогсож байв. Имжины дайны үед Японы жанжин мориа уясан гэх төмөр хадаас, тэр хооронд асар их өссөн модны өндөрт хадаастай хэвээр байлаа. Цаг хугацаа өнгөрөвч мөр үлддэг.",
              ) },
              { place: T("이화학당", "Ewha Hakdang", "Ихва Хакдан"), body: T(
                "낮에는 길조차 마음껏 걷지 못하던 조선의 여성들. 그들을 안타까워한 메리 스크랜튼이, 1886년 단 한 사람의 소녀로 이화학당을 시작했다.",
                "Joseon women could not even walk the streets freely by day. Mary Scranton, grieved for them, began Ewha Hakdang in 1886 with a single girl.",
                "Жусоны эмэгтэйчүүд өдрөөр гудамжаар ч чөлөөтэй явж чаддаггүй байв. Тэдэнд харамссан Мэри Скрантон 1886 онд ганц охиноор Ихва Хакданг эхлүүлсэн.",
              ) },
              { place: T("양화진", "Yanghwajin", "Янхважин"), body: T(
                "양화진의 깨지고 상한 비석들. 한국전쟁 때의 총탄 자국이, 이 무덤들이 견뎌 온 세월을 말없이 증언하고 있었다.",
                "The broken and weathered gravestones of Yanghwajin. Bullet marks from the Korean War bore silent witness to the years these graves have endured.",
                "Янхважины хагарч элэгдсэн булшны чулуунууд. Солонгосын дайны сумны мөр энэ булшнуудын туулсан он жилүүдийг чимээгүй гэрчилж байв.",
              ) },
            ].map((r) => (
              <figure key={r.place} style={{ margin: 0, padding: "clamp(20px,3vw,28px)", borderRadius: 18, background: "rgba(255,255,255,.66)", borderLeft: "4px solid #bf6b22" }}>
                <figcaption style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", color: "#9b3d2d", marginBottom: 8 }}>📍 {r.place}</figcaption>
                <p className="font-serif" style={{ margin: 0, fontSize: "clamp(15px,2.1vw,17px)", lineHeight: 1.9, color: "#46362a" }}>{r.body}</p>
              </figure>
            ))}
          </div>
          <p className="font-serif" style={{ textAlign: "center", marginTop: 20, fontSize: 12.5, color: "#8a7860" }}>{T("— 학생 탐방기에서 (드리미학교 서울 선교유적지 탐방)", "— From student field notes (Dreamy School, Seoul mission-site visit)", "— Сурагчдын аяллын тэмдэглэлээс (Dreamy School, Сөүлийн номлолын дурсгалт газрын аялал)")}</p>
        </div>
      </section>

      {/* 학생들의 목소리 */}
      <section style={{ padding: "clamp(56px,9vh,96px) 24px clamp(72px,12vh,120px)", background: "linear-gradient(180deg,#efe4cd,#f6efe1)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#9b3d2d" }}>Voices</span>
            <h2 className="font-serif" style={{ fontSize: "clamp(26px,4.4vw,40px)", fontWeight: 700, margin: "12px 0 0", color: "#2e2218" }}>{j.voicesTitle}</h2>
          </div>

          {voices.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {voices.map((v, i) => (
                <figure key={i} style={{ margin: 0, padding: "clamp(22px,3vw,30px)", borderRadius: 20, background: "rgba(255,255,255,.7)", borderLeft: "4px solid #bf6b22" }}>
                  {v.prompt && <figcaption style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#bf6b22", marginBottom: 10 }}>{v.prompt}</figcaption>}
                  <blockquote className="font-serif" style={{ margin: 0, fontSize: "clamp(17px,2.5vw,21px)", lineHeight: 1.8, color: "#46362a", fontStyle: "italic" }}>
                    “{v.text}”
                  </blockquote>
                  <div style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: "#8a7860" }}>
                    — {v.author ?? T("익명의 한 학생", "A student", "Нэгэн сурагч")}{v.context ? ` · ${v.context}` : ""}
                  </div>
                </figure>
              ))}
            </div>
          ) : null}

          <div style={{ textAlign: "center", marginTop: 44 }}>
            <Link href="/story" style={{ display: "inline-flex", padding: "13px 24px", borderRadius: 999, fontSize: 15, fontWeight: 800, textDecoration: "none", background: "linear-gradient(135deg,#9b3d2d,#bf6b22)", color: "#fff8ec" }}>
              {T("← 들어가며로 돌아가기", "← Back to Begin Here", "← Эхлэл рүү буцах")}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
