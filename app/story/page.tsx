import type { Metadata } from "next";
import Link from "next/link";
import { STORY_COPY, STORY_COPY_EN, STORY_COPY_MN, mergeCopy } from "@/lib/data/page-copy";
import { fetchPageContent } from "@/lib/db/editable";
import { getLocale } from "@/lib/i18n/server";
import { pick } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "아름다운 삶은 무엇일까 · 들어가며",
  description:
    "성공이 아니라 섬김으로 산 사람들. 복음이 선교사를 통해 우리에게 왔고, 이제 우리를 통해 세계로 간다. 한 사람의 삶을 만나고, 다음 주자로 서는 자리.",
};

// 로케일 쿠키를 읽으므로 이 페이지는 요청별 동적 렌더(관리자 카피 편집도 즉시 반영).

// /story — 사이트의 정문(formation). 검색·지도가 아니라 질문이 먼저 온다.
// 지도·인물·관계망은 이 질문을 떠받치는 근거 층이며, 여기서 그 층으로 들어간다.

const C = {
  ink: "#3a2b1d",
  cream: "#f6efe1",
  rust: "#9b3d2d",
  gold: "#bf6b22",
  faint: "#8a7860",
};

function Section({ children, dark, style }: { children: React.ReactNode; dark?: boolean; style?: React.CSSProperties }) {
  return (
    <section
      style={{
        padding: "clamp(64px, 12vh, 120px) 24px",
        background: dark ? "linear-gradient(180deg,#2e2218,#3a2a1c)" : "transparent",
        color: dark ? "#fff8ec" : C.ink,
        ...style,
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto" }}>{children}</div>
    </section>
  );
}

const kicker: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 900,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
};

export default async function StoryPage() {
  const locale = await getLocale();
  const en = locale === "en";
  const mn = locale === "mn";
  // 로케일별 기본 카피 위에 관리자 오버레이를 덮는다.
  const base = mn ? STORY_COPY_MN : en ? STORY_COPY_EN : STORY_COPY;
  const s = mergeCopy(base, await fetchPageContent("story"));
  // 짧은 라벨용 — 로케일에 맞는 문자열(없으면 한국어 폴백).
  const T = (ko: string, enT: string, mnT: string) => pick(locale, { ko, en: enT, mn: mnT });
  return (
    <main style={{ background: C.cream, color: C.ink, fontFamily: "var(--font-serif)" }}>
      {/* ── 히어로: 질문이 먼저 ── */}
      <section
        style={{
          minHeight: "calc(100vh - 4rem)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "48px 24px",
          background: "radial-gradient(circle at 50% 18%, rgba(191,107,34,.16), transparent 60%), linear-gradient(180deg,#f7f0e2,#efe4cd)",
        }}
      >
        <span style={{ ...kicker, color: C.gold }}>{s.heroKicker}</span>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 900,
            fontSize: "clamp(38px, 7vw, 76px)",
            letterSpacing: "-0.03em",
            lineHeight: 1.12,
            margin: "22px 0 0",
            color: "#2e2218",
            whiteSpace: "pre-line",
          }}
        >
          {s.heroQuestion}
        </h1>
        <p style={{ maxWidth: 560, margin: "28px 0 0", fontSize: "clamp(15px,2.2vw,18px)", lineHeight: 1.8, color: "#5f4d39" }}>
          {s.heroLead}
        </p>
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a href="#movement-1" style={btn(true)}>{T("이야기로 들어가기", "Enter the story", "Түүхрүү орох")}</a>
          <Link href="/" style={btn(false)}>{T("지도로 바로 가기", "Go straight to the map", "Шууд газрын зураг руу")}</Link>
        </div>
      </section>

      {/* ── 움직임 1: 복음이 선교사를 통해 나에게 ── */}
      <Section style={{ paddingTop: 96 }}>
        <span id="movement-1" style={{ ...kicker, color: C.rust }}>{T("첫 번째 움직임", "First Movement", "Нэгдүгээр хөдөлгөөн")}</span>
        <h2 style={h2()}>{s.m1Title}</h2>
        {mn ? (
          <>
            <p style={p()}>
              19-р зууны Солонгос чанга хаалттай байв. Гэвч нэг ч номлогч энэ нутагт хөл тавихаас
              өмнө <b>Библи түрүүлж ирсэн.</b> Манжуурт Жон Росс болон хэдэн залуу солонгос хүн
              Судрыг солонгос хэлээр хөрвүүлж, Японд Ли Сү-жон Маркийн сайн мэдээг орчуулж,
              номлогч илгээхийг гуйсан захидлыг Америк руу илгээв. Үг нь түүнийг тээх хүмүүсээс
              түрүүлж Ялу мөрөн болон тэнгисийг гатлав.
            </p>
            <p style={p()}>
              Эмч <Link href="/people/allen" style={a()}>Хорас Аллен</Link> 1884 оны Капсины
              төрийн эргэлтийн илднээс шархадсан Мин Ён-икийг аварснаар хааны ордны хаалга нээгдэж,
              дараа жил нь Солонгосын анхны барууны эмнэлэг Жежунвон байгуулагдав. Нэгэн Улаан өндгөний
              өглөө Жемүлпод нэг хөлөг онгоцноос буусан <Link href="/people/underwood" style={a()}>Андервуд</Link>,
              <Link href="/people/appenzeller" style={a()}> Аппензеллер</Link>, нэг охиноос эхэлж Ихва
              сургуулийг байгуулсан <Link href="/people/mscranton" style={a()}> Мэри Скрантон</Link>… анагаах
              ухаан, боловсрол, өөрийгөө зориулал тэр нээлттэй хаалгаар орж ирэв.
            </p>
            <blockquote style={quote()}>
              &ldquo;Агуу болохыг хүссэн хүн бусдад үйлчлэгч болох ёстой.&rdquo;
              <span style={{ display: "block", marginTop: 8, fontSize: 13, fontWeight: 700, color: C.faint }}>
                — Пэжэ сургуулийн уриа (欲爲大者 當爲人役)
              </span>
            </blockquote>
            <p style={p()}>
              Үүнийг зүгээр санамсаргүй хэрэг гэж нэрлэхэд бэрх. Хаалттай үе, түрүүлж ирсэн Үг,
              нэг хүний эдгээлтээр нээгдсэн зам — баримтын учир шалтгааныг дагахад тэдгээрийн дээр
              ямар нэгэн <b>тэнгэрийн зохицуулалтын</b> ор мөр тусдаг. Гэвч энэ сайт тэр үзлийг
              баримт дээр <b>тулгадаггүй.</b> Он, эх сурвалжийг хамт тавьж, мэдэхгүй зүйлээ хоосон
              орхино. Шийдвэр нь таных.
            </p>
          </>
        ) : en ? (
          <>
            <p style={p()}>
              Nineteenth-century Korea was shut tight. And yet, before a single missionary set foot
              on this soil, <b>the Bible arrived first.</b> In Manchuria, John Ross and a few young
              Korean men rendered the scriptures into Korean; in Japan, Yi Su-jeong translated the
              Gospel of Mark and sent a letter to America pleading for missionaries. The Word crossed
              the Yalu River and the straits ahead of the people who would carry it.
            </p>
            <p style={p()}>
              When the physician <Link href="/people/allen" style={a()}>Horace Allen</Link> saved
              Min Yeong-ik — struck down by the blades of the 1884 Gapsin Coup — the doors of the
              royal court swung open, and the next year Korea&rsquo;s first Western hospital,
              Jejungwon, was founded. <Link href="/people/underwood" style={a()}>Underwood</Link> and
              <Link href="/people/appenzeller" style={a()}> Appenzeller</Link>, who stepped off the
              same ship at Jemulpo one Easter morning; <Link href="/people/mscranton" style={a()}>Mary
              Scranton</Link>, who began with a single girl and built Ewha — medicine, education, and
              devotion came in through that open door.
            </p>
            <blockquote style={quote()}>
              &ldquo;Whoever would be great must become a servant of others.&rdquo;
              <span style={{ display: "block", marginTop: 8, fontSize: 13, fontWeight: 700, color: C.faint }}>
                — Motto of Paichai Hakdang (欲爲大者 當爲人役)
              </span>
            </blockquote>
            <p style={p()}>
              It is hard to call this mere coincidence. A closed age, a Word that came first, a road
              opened by the healing of one man — follow the chain of facts and a certain <b>grain of
              providence</b> seems to show through. Yet this site does not <b>impose</b> that reading
              on the facts. We set dates and sources side by side, and leave blank what we do not
              know. The judgment is yours.
            </p>
          </>
        ) : (
          <>
            <p style={p()}>
              19세기의 조선은 굳게 닫혀 있었습니다. 그런데 선교사가 이 땅을 밟기도 전에,
              <b> 성경이 먼저 들어왔습니다.</b> 만주에서는 존 로스와 한국인 청년들이 성경을
              한글로 옮겼고, 일본에서는 이수정이 마가복음을 번역해 선교를 호소하는 편지를
              미국으로 보냈습니다. 말씀이 사람보다 앞서 압록강과 현해탄을 건넌 것입니다.
            </p>
            <p style={p()}>
              1884년 갑신정변의 칼날에 쓰러진 민영익을 의사 <Link href="/people/allen" style={a()}>호러스 알렌</Link>이
              살려내면서 왕실의 문이 열렸고, 이듬해 한국 최초의 서양식 병원 제중원이 섰습니다.
              부활절 아침 같은 배로 제물포에 내린 <Link href="/people/underwood" style={a()}>언더우드</Link>와
              <Link href="/people/appenzeller" style={a()}> 아펜젤러</Link>, 한 명의 소녀에서 시작해 이화를 세운
              <Link href="/people/mscranton" style={a()}> 메리 스크랜튼</Link>… 의료와 교육과 헌신이
              그 열린 문으로 들어왔습니다.
            </p>
            <blockquote style={quote()}>
              “크게 되고자 하는 자는 마땅히 남을 섬기라.”
              <span style={{ display: "block", marginTop: 8, fontSize: 13, fontWeight: 700, color: C.faint }}>
                — 배재학당 교훈 (욕위대자 당위인역)
              </span>
            </blockquote>
            <p style={p()}>
              이것을 우연이라 부르기는 어렵습니다. 닫힌 시대, 먼저 온 말씀, 한 사람의 치료가
              연 길 — 사실의 인과를 따라가다 보면 그 위에 어떤 <b>섭리의 결</b>이 비칩니다.
              다만 이 사이트는 그 시선을 사실 위에 <b>강요하지 않습니다.</b> 연도와 출처를
              함께 두고, 모르는 것은 비워 둡니다. 판단은 당신의 몫입니다.
            </p>
          </>
        )}
      </Section>

      {/* ── 값을 치른 사람들 ── */}
      <Section dark>
        <span style={{ ...kicker, color: "#e8a765" }}>{T("값을 치른 사람들", "Those Who Paid the Cost", "Үнэ төлсөн хүмүүс")}</span>
        <h2 style={h2(true)}>{s.costTitle}</h2>
        {mn ? (
          <>
            <p style={p(true)}>
              Тэд баатрууд биш байв. Айж, өвдөж, хайртай хүмүүсээ түрүүлж оршуулсан энгийн хүмүүс
              байлаа. Гэвч үнэ төлсөн. <Link href="/people/heron" style={a(true)}>Жон Херон</Link> өвчтөнөө
              асарч байгаад ирснээсээ хойш ердөө таван жилийн дараа нас барав;
              <Link href="/people/appenzeller" style={a(true)}> Аппензеллер</Link> Библи орчуулгын хуралд
              явах замдаа живж буй хөлөг онгоцноос өөр хүнийг аврах гэж далайд автав.
              <Link href="/people/rosetta" style={a(true)}> Розетта Холл</Link> нөхөр, охин хоёроо энэ
              нутагт оршуулсан ч хамгийн сул дорой хүмүүсийн дэргэд үлдэв.
            </p>
            <p style={p(true)}>
              Хэн нэгэн тэднийг <b>нэг үр тариа болохыг сайн дураараа сонгосон хүмүүс</b> гэж нэрлэсэн —
              газарт унаж үхсэн нэг үр тариа их жимс ургуулдаг шиг. Тийм амьдралаас тархсан зүйлийг
              эртний хүмүүс <b>&ldquo;Христийн анхилуун үнэр&rdquo;</b> гэж нэрлэжээ.
            </p>
          </>
        ) : en ? (
          <>
            <p style={p(true)}>
              They were not heroes. They were ordinary people who feared, fell ill, and buried those
              they loved. But they paid the cost. <Link href="/people/heron" style={a(true)}>John
              Heron</Link> died caring for his patients just five years after arriving;
              <Link href="/people/appenzeller" style={a(true)}> Appenzeller</Link> drowned trying to
              save another from a sinking ship on his way to a Bible-translation meeting.
              <Link href="/people/rosetta" style={a(true)}> Rosetta Hall</Link> buried her husband and
              her daughter in this soil, and still stayed beside the weakest.
            </p>
            <p style={p(true)}>
              Someone once called them <b>those who chose to become a single grain of wheat</b> — for
              a grain that falls to the earth and dies bears much fruit. What rose from such lives,
              people of old named <b>&ldquo;the fragrance of Christ.&rdquo;</b>
            </p>
          </>
        ) : (
          <>
            <p style={p(true)}>
              그들은 영웅이 아니었습니다. 두려워하고, 앓고, 사랑하는 이를 먼저 묻은 평범한
              사람들이었습니다. 그러나 값을 치렀습니다. <Link href="/people/heron" style={a(true)}>존 헤론</Link>은
              환자를 돌보다 입국 5년 만에 순직했고, <Link href="/people/appenzeller" style={a(true)}>아펜젤러</Link>는
              성경 번역 회의로 가던 배 위에서 다른 이를 구하려다 바다에 잠겼습니다.
              <Link href="/people/rosetta" style={a(true)}> 로제타 홀</Link>은 남편과 딸을 이 땅에 묻고도
              가장 약한 이들 곁에 남았습니다.
            </p>
            <p style={p(true)}>
              누군가는 이들을 일컬어 <b>기꺼이 한 알의 밀알이 되기를 선택한 이들</b>이라 불렀습니다.
              땅에 떨어져 죽은 한 알의 밀이 많은 열매를 맺듯이. 그 삶에서 풍기는 것을
              옛사람들은 <b>‘예수의 향기’</b>라 했습니다.
            </p>
          </>
        )}
      </Section>

      {/* ── Korea is their home — 양화진 ── */}
      <Section>
        <span style={{ ...kicker, color: C.rust }}>Korea is their home</span>
        <h2 style={h2()}>{s.homeTitle}</h2>
        {mn ? (
          <p style={p()}>
            Олонх нь нутаг буцаагүй. Сөүлийн Хан мөрний эрэг дэх <b>Янхважин</b>-д 15 орны 400
            гаруй хүн амарч байна. Хулберт: &ldquo;Би Вестминстерийн сүмд оршуулагдснаас Солонгосын
            нутагт оршуулагдахыг илүүд үзнэ&rdquo; гэж хэлсэн. Тэдэнд Солонгос бол томилолтын газар
            биш <b>гэр</b> байсан бөгөөд эдгээр булш нь байршил биш, нэг амьдралын оргил юм.
          </p>
        ) : en ? (
          <p style={p()}>
            Many never went home. At <b>Yanghwajin</b>, on the banks of the Han River in Seoul, more
            than 400 people from 15 nations lie at rest. Hulbert left these words: &ldquo;I would
            rather be buried in Korea than in Westminster Abbey.&rdquo; To them Korea was not a
            posting but a <b>home</b>, and these graves are not a location but the summit of a life.
          </p>
        ) : (
          <p style={p()}>
            많은 이들이 돌아가지 않았습니다. 서울 한강가 <b>양화진</b>에는 15개국 400여 명이
            잠들어 있습니다. 헐버트는 “웨스트민스터 사원보다 한국 땅에 묻히기를 원한다”는
            말을 남겼습니다. 그들에게 조선은 임지가 아니라 <b>집</b>이었고, 그 무덤은
            위치가 아니라 한 생애의 정점입니다.
          </p>
        )}
        <div style={{ marginTop: 28 }}>
          <Link href="/?focus=yanghwajin" style={btn(true)}>{T("양화진 묘역을 찾아가기 →", "Visit Yanghwajin Cemetery →", "Янхважины оршуулгын газар руу →")}</Link>
        </div>
      </Section>

      {/* ── 움직임 2: 복음이 나를 통해 세계로 ── */}
      <Section dark style={{ background: "linear-gradient(180deg,#3a2a1c,#2e2218)" }}>
        <span style={{ ...kicker, color: "#e8a765" }}>{T("두 번째 움직임", "Second Movement", "Хоёрдугаар хөдөлгөөн")}</span>
        <h2 style={h2(true)}>{s.m2Title}</h2>
        {mn ? (
          <p style={p(true)}>
            Сайн мэдээ надаар зогсдоггүй. Хүлээн авсан хүн дамжуулдаг хүн болдог. Сайн мэдээг хүлээн
            авсан Солонгосын чуулган удалгүй <Link href="/people/leegipung" style={a(true)}>Ли Ги-пун</Link>-г
            Жэжү арал руу илгээсэн шиг, энэ бол үеэс үед дамждаг <b>буухиа</b> юм.
          </p>
        ) : en ? (
          <p style={p(true)}>
            The gospel does not stop with me. The one who receives becomes the one who gives. Just as
            the Korean church, having received the gospel, soon sent <Link href="/people/leegipung" style={a(true)}>Yi
            Gi-pung</Link> to Jeju Island, this is a <b>relay</b> handed from one generation to the next.
          </p>
        ) : (
          <p style={p(true)}>
            복음은 나에게서 멈추지 않습니다. 받은 사람은 전하는 사람이 됩니다. 복음을 받은
            한국 교회가 곧 <Link href="/people/leegipung" style={a(true)}>이기풍</Link>을 제주로 보냈듯이,
            이것은 한 세대에서 다음 세대로 넘겨지는 <b>릴레이</b>입니다.
          </p>
        )}
        {/* 바통이 넘겨지는 흐름 — 마지막 칸은 비어 있다 */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", margin: "32px 0 8px" }}>
          {(mn ? ["Эхлээд Үг", "Номлогчид", "Солонгосын чуулган", "Та"] : en ? ["The Word first", "Missionaries", "The Korean church", "You"] : ["말씀이 먼저", "선교사", "한국 교회", "당신"]).map((label, i, arr) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  padding: "10px 16px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 800,
                  border: i === arr.length - 1 ? "2px dashed rgba(232,167,101,.8)" : "1px solid rgba(255,248,236,.2)",
                  background: i === arr.length - 1 ? "transparent" : "rgba(255,248,236,.08)",
                  color: i === arr.length - 1 ? "#e8a765" : "#fff8ec",
                }}
              >
                {label}
              </span>
              {i < arr.length - 1 && <span style={{ color: "rgba(255,248,236,.4)", fontSize: 18 }}>→</span>}
            </div>
          ))}
        </div>
        <p style={{ ...p(true), fontStyle: "italic", color: "rgba(255,248,236,.7)" }}>
          {T("마지막 칸은 비어 있습니다. 거기에 들어설 사람은 당신입니다.", "The last space is empty. The one to step into it is you.", "Сүүлчийн нүд хоосон байна. Тийш орох хүн бол та.")}
        </p>
        <p style={{ fontFamily: "var(--font-serif)", fontWeight: 900, fontSize: "clamp(24px,4vw,38px)", lineHeight: 1.3, marginTop: 28, color: "#fff8ec", whiteSpace: "pre-line" }}>
          {`“${s.nextRunner}”`}
        </p>
      </Section>

      {/* ── 묻는 자리(평가하지 않는다) + 아카이브 진입 ── */}
      <Section style={{ textAlign: "center", background: "linear-gradient(180deg,#efe4cd,#f6efe1)" }}>
        <h2 style={{ ...h2(), textAlign: "center" }}>{s.closeTitle}</h2>
        <p style={{ ...p(), textAlign: "center" }}>{s.closeLead}</p>
        <div style={{ marginTop: 36, display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/" style={btn(true)}>{T("지도에서 만나기", "Meet them on the map", "Газрын зураг дээр уулзах")}</Link>
          <Link href="/people" style={btn(false)}>{T("인물 목록", "People", "Хүмүүс")}</Link>
          <Link href="/dictionary" style={btn(false)}>{T("인명사전", "Directory", "Нэрсийн толь")}</Link>
        </div>
      </Section>
    </main>
  );
}

function h2(dark?: boolean): React.CSSProperties {
  return {
    fontFamily: "var(--font-serif)",
    fontWeight: 900,
    fontSize: "clamp(28px,4.6vw,46px)",
    letterSpacing: "-0.03em",
    lineHeight: 1.15,
    margin: "14px 0 22px",
    color: dark ? "#fff8ec" : "#2e2218",
  };
}
function p(dark?: boolean): React.CSSProperties {
  return {
    fontSize: "clamp(15px,2vw,17px)",
    lineHeight: 1.9,
    margin: "0 0 18px",
    color: dark ? "rgba(255,248,236,.86)" : "#5f4d39",
  };
}
function a(dark?: boolean): React.CSSProperties {
  return {
    color: dark ? "#f0c98a" : "#9b3d2d",
    fontWeight: 800,
    textDecoration: "underline",
    textUnderlineOffset: 3,
    textDecorationColor: dark ? "rgba(240,201,138,.4)" : "rgba(155,61,45,.35)",
  };
}
function quote(): React.CSSProperties {
  return {
    margin: "28px 0",
    padding: "18px 22px",
    borderLeft: "4px solid #bf6b22",
    background: "rgba(191,107,34,.07)",
    borderRadius: "0 14px 14px 0",
    fontFamily: "var(--font-serif)",
    fontSize: "clamp(18px,2.6vw,23px)",
    fontWeight: 800,
    lineHeight: 1.5,
    color: "#5f3a1f",
  };
}
function btn(primary: boolean): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "13px 24px",
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 800,
    textDecoration: "none",
    cursor: "pointer",
    background: primary ? "linear-gradient(135deg,#9b3d2d,#bf6b22)" : "rgba(255,255,255,.7)",
    color: primary ? "#fff8ec" : "#5f4d39",
    border: primary ? "none" : "1px solid rgba(120,90,50,.25)",
    boxShadow: primary ? "0 10px 24px rgba(155,61,45,.28)" : "none",
  };
}
