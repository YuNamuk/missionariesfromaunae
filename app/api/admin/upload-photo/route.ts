import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/db/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

// 관리자 초상 업로드 + (선택) AI 컬러 변환. Supabase Storage 'portraits' 버킷에 저장.
//   원본 → portraits/<id>.jpg, 컬러본 → portraits/<id>-color.jpg
const PROMPT =
  "Restore and naturally colorize this historical black-and-white or sepia portrait photograph of a real person from the late 19th / early 20th century, " +
  "into a high-quality, photorealistic COLOR portrait that looks taken today: sharp, fine skin texture, natural studio lighting, full natural color. " +
  "STRICTLY preserve the person's exact identity, facial features, age, expression, hairstyle, facial hair and clothing — do not redraw, beautify, change ethnicity or add anything not present. " +
  "CONTEXT late-Joseon Korea: a round wide-brimmed black hat is a Korean 'gat' (갓), robes are hanbok/durumagi — keep traditional dress authentic, never modernized; a Western face stays Western. " +
  "Output a clean head-and-shoulders color portrait of the single subject only.";

async function colorize(buf: Buffer, mime: string): Promise<Buffer | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  const model = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: mime, data: buf.toString("base64") } }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const part = (data?.candidates?.[0]?.content?.parts ?? []).find((p: { inlineData?: { data?: string } }) => p?.inlineData?.data);
    return part ? Buffer.from(part.inlineData.data, "base64") : null;
  } catch {
    return null;
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

  let form: FormData;
  try { form = await req.formData(); } catch { return NextResponse.json({ error: "bad form" }, { status: 400 }); }
  const file = form.get("file");
  const id = String(form.get("id") || "").trim();
  const doColor = String(form.get("colorize") || "") === "1";
  if (!(file instanceof Blob) || !id) return NextResponse.json({ error: "file·id 필요" }, { status: 400 });

  const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
  const ext = mime === "image/png" ? "png" : "jpg";
  const buf = Buffer.from(await file.arrayBuffer());
  const bucket = db.storage.from("portraits");

  const origPath = `${id}.${ext}`;
  const up = await bucket.upload(origPath, buf, { contentType: mime, upsert: true });
  if (up.error) return NextResponse.json({ error: `업로드 실패: ${up.error.message}` }, { status: 500 });
  const url = bucket.getPublicUrl(origPath).data.publicUrl;

  let colorUrl: string | null = null;
  if (doColor) {
    const cbuf = await colorize(buf, mime);
    if (cbuf) {
      const cpath = `${id}-color.jpg`;
      const cup = await bucket.upload(cpath, cbuf, { contentType: "image/jpeg", upsert: true });
      if (!cup.error) colorUrl = bucket.getPublicUrl(cpath).data.publicUrl;
    }
  }
  // 캐시 무력화용 쿼리(같은 경로 덮어쓰기 시 갱신)
  const v = `?v=${Date.now().toString(36)}`;
  return NextResponse.json({ url: url + v, colorUrl: colorUrl ? colorUrl + v : null });
}
