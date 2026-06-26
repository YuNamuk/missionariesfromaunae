// Polite fetch: identifies itself, times out, and rate-limits per host.

const lastHit = new Map<string, number>();

const UA =
  process.env.CRAWLER_USER_AGENT ??
  "MissionariesArchiveBot/0.1 (+contact: pgm@dreamyedu.net)";

export function crawlerUserAgent() {
  return UA;
}

export interface FetchedPage {
  url: string;
  finalUrl: string;
  status: number;
  html: string;
  contentHash: string;
}

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function politeFetch(
  url: string,
  delaySeconds = 1,
): Promise<FetchedPage> {
  const host = new URL(url).host;
  const wait = lastHit.get(host)
    ? Math.max(0, delaySeconds * 1000 - (Date.now() - lastHit.get(host)!))
    : 0;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastHit.set(host, Date.now());

  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml" },
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
  });
  const html = await res.text();
  return {
    url,
    finalUrl: res.url || url,
    status: res.status,
    html,
    contentHash: await sha256(html),
  };
}
