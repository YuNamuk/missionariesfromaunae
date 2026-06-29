import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/db/supabase";
import { getPerson, getRelationships, activePeriods } from "@/lib/data";
import { profileFor } from "@/lib/data/profiles";

export const runtime = "nodejs";
export const maxDuration = 60;

// 선택한 선교사들의 '검증된 사이트 데이터'를 컨텍스트로 조립 → 모델이 근거 기반으로 분석.
function buildContext(ids: string[], era: string): string {
  const set = new Set(ids);
  const lines: string[] = [];
  if (era.trim()) lines.push(`■ 시대/배경 메모(사용자 입력): ${era.trim()}`);
  lines.push("", "■ 선교사 데이터(사이트 검증 자료):");
  for (const id of ids) {
    const p = getPerson(id);
    if (!p) continue;
    const pr = profileFor(id);
    const per = activePeriods(p).map(([s, e]) => `${s}–${e === 9999 ? "?" : e}`).join(", ");
    lines.push(
      `- ${p.name}(${p.en}, ${p.life}) · 입국/대표연도 ${p.year} · ${p.org} · ${p.role} · 활동기간 ${per}`,
      `  요약: ${p.summary}`,
    );
    if (p.timeline?.length) lines.push(`  연표: ${p.timeline.map(([y, t]) => `${y} ${t}`).join(" / ")}`);
    if (pr?.quote) lines.push(`  인용(1차): "${pr.quote.text}" (${pr.quote.source})`);
  }
  const edges = getRelationships().filter((r) => set.has(r.from.id) && set.has(r.to.id));
  if (edges.length) {
    lines.push("", "■ 인물 간 관계(검증):");
    for (const r of edges) lines.push(`- ${r.from.name} →[${r.meta.label}] ${r.to.name}${r.note ? `: ${r.note}` : ""}`);
  }
  return lines.join("\n");
}

const SYSTEM = `당신은 한국 초기 개신교 선교사 디지털 아카이브의 신중한 역사 연구 보조자입니다.
아래 '사이트 데이터'와 널리 확립된 역사적 사실에만 근거해 한국어로 분석을 작성하세요.
규칙:
- 데이터에 없는 구체적 인용·날짜·사건을 지어내지 마세요. 불확실하면 "자료가 분명치 않다"고 명시.
- 과장·미화 없이 사실 기반으로, 학생도 이해할 차분한 문체.
- 구성(소제목으로): ① 인물 간 상관관계와 흐름 ② 당시 시대 배경 ③ 각 인물의 역할 ④ 선교에 미친 영향 ⑤ 사용자 프롬프트에 대한 응답.
- 마지막에 한두 문장의 성찰적 맺음(설교조 금지).`;

async function callAnthropic(context: string, prompt: string): Promise<{ text?: string; error?: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { error: "ANTHROPIC_API_KEY 미설정 — Vercel 환경변수에 키를 추가하세요." };
  const model = process.env.ANALYSIS_MODEL || "claude-sonnet-4-6";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model,
        max_tokens: 2200,
        system: SYSTEM,
        messages: [{ role: "user", content: `${context}\n\n■ 분석 요청(프롬프트): ${prompt.trim() || "위 인물들의 상관관계, 시대 배경, 역할, 선교에 미친 영향을 종합 분석해 주세요."}` }],
      }),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { error: `모델 호출 실패(${res.status}): ${t.slice(0, 200)}` };
    }
    const data = await res.json();
    const text = (data?.content ?? []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("\n").trim();
    return { text: text || "(빈 응답)" };
  } catch (e) {
    return { error: `네트워크 오류: ${String(e).slice(0, 160)}` };
  }
}

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "no token" }, { status: 401 });
  const db = getServiceSupabase();
  const { data: userData, error: userErr } = await db.auth.getUser(token);
  const email = userData?.user?.email?.toLowerCase();
  const { data: adminRow } = await db.from("app_settings").select("value").eq("key", "admins").single();
  const admins = (adminRow?.value as string[] | undefined)?.map((e) => e.toLowerCase()) ?? [process.env.ADMIN_EMAIL?.toLowerCase()];
  if (userErr || !email || !admins.includes(email)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { people?: string[]; era?: string; prompt?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad json" }, { status: 400 }); }
  const people = (body.people ?? []).filter((x) => typeof x === "string");
  if (people.length === 0) return NextResponse.json({ error: "선교사를 1명 이상 선택하세요" }, { status: 400 });

  const context = buildContext(people, body.era ?? "");
  const { text, error } = await callAnthropic(context, body.prompt ?? "");
  if (error) return NextResponse.json({ error }, { status: 503 });
  return NextResponse.json({ analysis: text });
}
