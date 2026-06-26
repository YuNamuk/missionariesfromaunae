import * as cheerio from "cheerio";

export interface Extracted {
  title: string | null;
  siteName: string | null;
  author: string | null;
  license: string | null;
  /** short summary candidate (meta description or first paragraph) */
  summary: string | null;
  /** cleaned body text, trimmed for review */
  text: string;
  /** dated lines we could turn into timeline events: [year, text] */
  datedLines: [number, string][];
}

const KO_YEAR = /(1[89]\d{2})\s*년/g;

/**
 * Generic article extractor. Site-specific extractors can wrap this and map
 * the cleaned output into structured `ingestion_candidates` payloads.
 */
export function extractArticle(html: string): Extracted {
  const $ = cheerio.load(html);
  $("script, style, nav, footer, header, noscript").remove();

  const meta = (sel: string) => $(sel).attr("content")?.trim() || null;
  const title =
    meta('meta[property="og:title"]') || $("title").first().text().trim() || null;
  const siteName = meta('meta[property="og:site_name"]');
  const author = meta('meta[name="author"]') || meta('meta[property="article:author"]');
  const license =
    meta('meta[name="license"]') || $('a[rel="license"]').attr("href") || null;
  const summary = meta('meta[name="description"]') || meta('meta[property="og:description"]');

  const paras = $("p")
    .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
    .get()
    .filter((t) => t.length > 30);
  const text = paras.join("\n").slice(0, 8000);

  const datedLines: [number, string][] = [];
  for (const line of paras) {
    const years = [...line.matchAll(KO_YEAR)];
    if (years.length) datedLines.push([Number(years[0][1]), line.slice(0, 240)]);
  }

  return {
    title,
    siteName,
    author,
    license,
    summary: summary || paras[0]?.slice(0, 240) || null,
    text,
    datedLines: datedLines.slice(0, 40),
  };
}
