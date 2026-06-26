import { NextResponse } from "next/server";
import { z } from "zod";
import { ingestUrl } from "@/lib/crawler/pipeline";

const Body = z.object({
  urls: z.array(z.string().url()).min(1).max(20),
});

/**
 * POST /api/ingest  { urls: string[] }
 * Protected by the INGEST_TOKEN header so the crawler can't be triggered
 * anonymously. Each URL is robots-checked, fetched politely, and staged in the
 * review queue with its source URL recorded.
 */
export async function POST(req: Request) {
  const token = process.env.INGEST_TOKEN;
  if (token && req.headers.get("x-ingest-token") !== token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const results = [];
  for (const url of parsed.data.urls) {
    try {
      results.push(await ingestUrl(url));
    } catch (e) {
      results.push({ url, ok: false, reason: (e as Error).message });
    }
  }
  return NextResponse.json({ results });
}
