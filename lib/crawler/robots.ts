// Minimal robots.txt fetch + check. We default to *disallow on uncertainty*
// so we never crawl something we shouldn't.

interface RobotsRules {
  disallow: string[];
  allow: string[];
  crawlDelay: number | null;
}

const cache = new Map<string, RobotsRules | null>();

async function loadRobots(origin: string, ua: string): Promise<RobotsRules | null> {
  if (cache.has(origin)) return cache.get(origin)!;
  let rules: RobotsRules | null = null;
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      headers: { "user-agent": ua },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) rules = parseRobots(await res.text(), ua);
  } catch {
    rules = null; // unreachable robots.txt → treat as "unknown"
  }
  cache.set(origin, rules);
  return rules;
}

function parseRobots(txt: string, ua: string): RobotsRules {
  const lines = txt.split("\n").map((l) => l.replace(/#.*$/, "").trim());
  const groups: { agents: string[]; disallow: string[]; allow: string[]; delay: number | null }[] = [];
  let cur: (typeof groups)[number] | null = null;
  for (const line of lines) {
    const [rawK, ...rest] = line.split(":");
    if (!rest.length) continue;
    const k = rawK.trim().toLowerCase();
    const v = rest.join(":").trim();
    if (k === "user-agent") {
      if (!cur || cur.disallow.length || cur.allow.length || cur.delay !== null) {
        cur = { agents: [], disallow: [], allow: [], delay: null };
        groups.push(cur);
      }
      cur.agents.push(v.toLowerCase());
    } else if (cur && k === "disallow") cur.disallow.push(v);
    else if (cur && k === "allow") cur.allow.push(v);
    else if (cur && k === "crawl-delay") cur.delay = Number(v) || null;
  }
  const uaLc = ua.toLowerCase();
  const match =
    groups.find((g) => g.agents.some((a) => a !== "*" && uaLc.includes(a))) ??
    groups.find((g) => g.agents.includes("*"));
  return {
    disallow: match?.disallow.filter(Boolean) ?? [],
    allow: match?.allow.filter(Boolean) ?? [],
    crawlDelay: match?.delay ?? null,
  };
}

export interface RobotsVerdict {
  allowed: boolean;
  crawlDelay: number | null;
  reason: string;
}

export async function checkRobots(url: string, ua: string): Promise<RobotsVerdict> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return { allowed: false, crawlDelay: null, reason: "잘못된 URL" };
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    return { allowed: false, crawlDelay: null, reason: "http(s)만 허용" };
  }
  const rules = await loadRobots(u.origin, ua);
  if (!rules) {
    // No readable robots.txt — be conservative but allow (common for archives).
    return { allowed: true, crawlDelay: 2, reason: "robots.txt 없음 — 보수적 진행" };
  }
  const path = u.pathname + u.search;
  const longestMatch = (patterns: string[]) =>
    patterns
      .filter((p) => path.startsWith(p))
      .reduce((m, p) => Math.max(m, p.length), -1);
  const dis = longestMatch(rules.disallow);
  const alw = longestMatch(rules.allow);
  if (dis > alw) {
    return { allowed: false, crawlDelay: rules.crawlDelay, reason: "robots.txt Disallow" };
  }
  return { allowed: true, crawlDelay: rules.crawlDelay ?? 1, reason: "허용" };
}
