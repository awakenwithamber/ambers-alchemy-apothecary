// node scripts/check-locked.mjs [--json]
//
// Read-only checks for the invariants in CLAUDE.md that must never drift:
//   1. Locked audio file exists and matches its sha256 exactly.
//   2. No Grimoire premium text (pages 8–88) is shipped in public HTML.
//   3. No banned payment processor or retired payment handle in client code.
//   4. No audio/video autoplay.
// Exits 1 when any check FAILs.

import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, walk, isPublic, read, rel, lineOf, reporter } from "./_shared.mjs";

const AUDIO_PATH = "public/audio/awaken-ambient.mp3";
const AUDIO_SHA256 = "57b069dd15f9faab06cc8f951f83cd5174b9d34c1b13423a85290729ccbbacf7";
// Visible text allowed inside the gated #grimior-content block (the heading only).
const GRIMOIRE_MAX_TEXT = 200;

const r = reporter("check-locked");

// 1. Locked audio
const audioFile = join(ROOT, AUDIO_PATH);
if (!existsSync(audioFile)) {
  r.fail("locked audio", `${AUDIO_PATH} is missing`);
} else {
  const hash = createHash("sha256").update(readFileSync(audioFile)).digest("hex");
  if (hash === AUDIO_SHA256) r.pass("locked audio", "sha256 matches");
  else r.fail("locked audio", `sha256 mismatch (got ${hash.slice(0, 12)}…)`);
}

const clientFiles = walk(ROOT, [".html", ".js", ".mjs", ".css", ".json", ".webmanifest"]).filter(isPublic);

// 2. Grimoire premium text leak
const grimoire = join(ROOT, "grimior.html");
if (!existsSync(grimoire)) {
  r.warn("grimoire gating", "grimior.html not found");
} else {
  const html = read(grimoire);
  const start = html.indexOf('id="grimior-content"');
  if (start === -1) {
    r.warn("grimoire gating", "#grimior-content block not found");
  } else {
    // The block ends where </main> begins.
    const end = html.indexOf("</main>", start);
    const block = html.slice(start, end === -1 ? undefined : end);
    const text = block
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/^id="grimior-content"/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (text.length > GRIMOIRE_MAX_TEXT) {
      r.fail("grimoire gating", `${text.length} chars of text inside #grimior-content ship in public HTML; premium pages must be served server-side`);
    } else {
      r.pass("grimoire gating", "no premium text in public HTML (placeholder only)");
    }
  }
}

// 3. Banned processors / retired handle in client code
const BANNED = [
  ["Shopify checkout", /shopify[^\n]{0,40}checkout|checkout\.shopify|cdn\.shopify\.com\/[^\s"']*buy-button/i],
  ["Square", /squareup\.com|web\.squarecdn\.com|square\.payments/i],
  ["Gumroad", /gumroad\.com/i],
  ["Klarna", /klarna/i],
  ["Afterpay", /afterpay/i],
  ["$AmberAlchemy handle", /\$AmberAlchemy/],
];
let bannedHits = 0;
for (const file of clientFiles) {
  const text = read(file);
  for (const [label, re] of BANNED) {
    const m = re.exec(text);
    if (m) {
      bannedHits++;
      r.fail("banned payment", `${label} in ${rel(file)}:${lineOf(text, m.index)}`);
    }
  }
}
if (!bannedHits) r.pass("banned payment", "no Shopify checkout, Square, Gumroad, Klarna, Afterpay or $AmberAlchemy in client code");

// 4. No autoplay (iframe allow="autoplay" and ?autoplay=0 are permissions/off, not autoplay)
const AUTOPLAY = [
  /<(audio|video)\b[^>]*\sautoplay\b/i,
  /\.autoplay\s*=\s*true/,
  /[?&]autoplay=1\b/,
  /\.play\(\)\s*;?\s*\/\/\s*autoplay/i,
];
let autoplayHits = 0;
for (const file of clientFiles) {
  const text = read(file);
  for (const re of AUTOPLAY) {
    const m = re.exec(text);
    if (m) {
      autoplayHits++;
      r.fail("no autoplay", `${rel(file)}:${lineOf(text, m.index)}`);
    }
  }
}
if (!autoplayHits) r.pass("no autoplay", "no autoplay attributes or flags in client code");

r.finish();
