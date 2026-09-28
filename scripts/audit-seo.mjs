// node scripts/audit-seo.mjs [--json]
//
// Read-only SEO checks for the public HTML pages, sitemap.xml and robots.txt.
// Title ≤ 65 chars, description 70–160 chars, canonical, exactly one <h1>,
// Open Graph tags, JSON-LD that parses; sitemap uses https://awakenagain.com
// with no "#" URLs; robots.txt has a Sitemap line; admin is noindex.
// Exits 1 when any check FAILs.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, walk, isPublic, read, rel, reporter } from "./_shared.mjs";

const ORIGIN = "https://awakenagain.com";
// Pages that must not be indexed (checked for noindex instead of snippet rules).
const NOINDEX = new Set(["admin.html", "404.html", "offline.html"]);
const REQUIRED_NOINDEX = new Set(["admin.html"]);

const r = reporter("audit-seo");

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const meta = (html, attr, value) => {
  const re = new RegExp(`<meta\\b[^>]*${attr}=["']${value}["'][^>]*>`, "i");
  const tag = html.match(re);
  if (!tag) return null;
  const c = tag[0].match(/\bcontent=(["'])([\s\S]*?)\1/i);
  return c ? decode(c[2]).trim() : "";
};

// Sitemap
const sitemapFile = join(ROOT, "sitemap.xml");
if (!existsSync(sitemapFile)) {
  r.fail("sitemap", "sitemap.xml missing");
} else {
  const locs = [...read(sitemapFile).matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
  const hash = locs.filter((u) => u.includes("#"));
  const offOrigin = locs.filter((u) => !u.startsWith(ORIGIN + "/") && u !== ORIGIN);
  if (!locs.length) r.fail("sitemap", "no <loc> entries");
  if (hash.length) r.fail("sitemap", `${hash.length} URL(s) contain "#": ${hash.slice(0, 3).join(", ")}`);
  if (offOrigin.length) r.fail("sitemap", `${offOrigin.length} URL(s) not on ${ORIGIN}: ${offOrigin.slice(0, 3).join(", ")}`);
  if (locs.length && !hash.length && !offOrigin.length) r.pass("sitemap", `${locs.length} URLs, all on ${ORIGIN}, none with "#"`);
}

// robots.txt
const robotsFile = join(ROOT, "robots.txt");
if (!existsSync(robotsFile)) r.fail("robots", "robots.txt missing");
else if (/^\s*Sitemap:\s*https:\/\/awakenagain\.com\/sitemap\.xml\s*$/im.test(read(robotsFile))) r.pass("robots", "Sitemap line present");
else r.fail("robots", "no `Sitemap: https://awakenagain.com/sitemap.xml` line");

// HTML pages
for (const file of walk(ROOT, [".html"]).filter(isPublic)) {
  const page = rel(file);
  const html = read(file);
  const robots = meta(html, "name", "robots") || "";

  if (NOINDEX.has(page) || page.includes("/")) {
    if (/noindex/i.test(robots)) r.pass(`${page} noindex`, robots);
    else if (REQUIRED_NOINDEX.has(page)) r.fail(`${page} noindex`, "missing <meta name=\"robots\" content=\"noindex\">");
    else r.warn(`${page} noindex`, "utility page without noindex");
    continue;
  }

  const t = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = t ? decode(t[1]).trim() : "";
  if (!title) r.fail(`${page} title`, "missing");
  else if (title.length > 65) r.fail(`${page} title`, `${title.length} chars (max 65): "${title}"`);
  else r.pass(`${page} title`, `${title.length} chars`);

  const desc = meta(html, "name", "description");
  if (desc == null || desc === "") r.fail(`${page} description`, "missing");
  else if (desc.length < 70 || desc.length > 160) r.fail(`${page} description`, `${desc.length} chars (want 70–160)`);
  else r.pass(`${page} description`, `${desc.length} chars`);

  const canon = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i);
  const href = canon && (canon[0].match(/href=["']([^"']+)["']/i) || [])[1];
  if (!href) r.fail(`${page} canonical`, "missing");
  else if (!href.startsWith(ORIGIN)) r.fail(`${page} canonical`, `not on ${ORIGIN}: ${href}`);
  else if (href.includes("#")) r.fail(`${page} canonical`, `contains "#": ${href}`);
  else r.pass(`${page} canonical`, href);

  const h1 = (html.replace(/<!--[\s\S]*?-->/g, "").match(/<h1\b/gi) || []).length;
  if (h1 === 1) r.pass(`${page} h1`, "exactly one");
  else r.fail(`${page} h1`, `${h1} <h1> elements (want 1)`);

  const og = ["og:title", "og:description", "og:url", "og:image", "og:type"].filter((p) => !meta(html, "property", p));
  if (og.length) r.warn(`${page} open graph`, `missing ${og.join(", ")}`);
  else r.pass(`${page} open graph`, "og:title/description/url/image/type present");

  const blocks = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  let bad = 0;
  for (const b of blocks) {
    try { JSON.parse(b[1]); } catch { bad++; }
  }
  if (bad) r.fail(`${page} json-ld`, `${bad} of ${blocks.length} block(s) do not parse`);
  else if (blocks.length) r.pass(`${page} json-ld`, `${blocks.length} block(s) parse`);
  else r.warn(`${page} json-ld`, "no structured data");
}

r.finish();
