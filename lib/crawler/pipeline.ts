import "server-only";
import { getServiceSupabase } from "@/lib/db/supabase";
import { checkRobots } from "./robots";
import { politeFetch, crawlerUserAgent } from "./fetcher";
import { extractArticle } from "./extract";

export interface IngestResult {
  url: string;
  ok: boolean;
  reason: string;
  sourceId?: number;
  candidateId?: number;
}

/**
 * Crawl one public URL into the review queue.
 *
 * Flow: robots check → polite fetch → record `source` (source_url is REQUIRED,
 * so attribution is always preserved) → extract → stage an
 * `ingestion_candidate` with status 'pending'. Nothing touches the live
 * people/places tables until a human approves it.
 */
export async function ingestUrl(url: string): Promise<IngestResult> {
  const ua = crawlerUserAgent();

  const verdict = await checkRobots(url, ua);
  if (!verdict.allowed) {
    return { url, ok: false, reason: `크롤링 불가: ${verdict.reason}` };
  }

  const page = await politeFetch(url, verdict.crawlDelay ?? 1);
  if (page.status >= 400) {
    return { url, ok: false, reason: `HTTP ${page.status}` };
  }

  const article = extractArticle(page.html);
  const db = getServiceSupabase();

  // 1) provenance — always cite the origin
  const { data: src, error: srcErr } = await db
    .from("sources")
    .insert({
      source_url: page.finalUrl,
      site_name: article.siteName,
      title: article.title,
      author: article.author,
      license: article.license,
      content_hash: page.contentHash,
      raw: { summary: article.summary, text: article.text.slice(0, 4000) },
    })
    .select("id")
    .single();
  if (srcErr) return { url, ok: false, reason: srcErr.message };
  const sourceId = src.id as number;

  // 2) stage a candidate for human review (never auto-merged)
  const { data: cand, error: candErr } = await db
    .from("ingestion_candidates")
    .insert({
      source_id: sourceId,
      target_type: "person",
      target_id: null,
      payload: {
        title: article.title,
        summary: article.summary,
        datedLines: article.datedLines,
        excerpt: article.text.slice(0, 2000),
      },
      status: "pending",
    })
    .select("id")
    .single();
  if (candErr) return { url, ok: false, reason: candErr.message, sourceId };

  return {
    url,
    ok: true,
    reason: "검수 대기열에 등록됨",
    sourceId,
    candidateId: cand.id as number,
  };
}
