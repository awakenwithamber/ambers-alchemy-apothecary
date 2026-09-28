// node scripts/scan-secrets.mjs [--all] [--json]
//
// Looks for credential-shaped strings. Prints file:line and the pattern name
// only — never the matched value. By default scans text files tracked in the
// working tree except node_modules/.git; --all also scans lock files, .env*
// files and binary-looking files.
// Exits 1 when anything is found.

import { ROOT, walk, read, rel, lineOf, reporter } from "./_shared.mjs";

const ALL = process.argv.includes("--all");

const PATTERNS = [
  ["Stripe live secret key", /\bsk_live_[0-9A-Za-z]{10,}/g],
  ["Stripe test secret key", /\bsk_test_[0-9A-Za-z]{10,}/g],
  ["Stripe restricted key", /\brk_(live|test)_[0-9A-Za-z]{10,}/g],
  ["Stripe webhook secret", /\bwhsec_[0-9A-Za-z]{16,}/g],
  ["Resend API key", /\bre_[0-9A-Za-z]{8,}_[0-9A-Za-z]{8,}/g],
  ["AWS access key id", /\bAKIA[0-9A-Z]{16}\b/g],
  ["Private key block", /-----BEGIN (RSA |EC |OPENSSH |DSA |PGP |ENCRYPTED )?PRIVATE KEY( BLOCK)?-----/g],
  ["GitHub token", /\bgh[pousr]_[0-9A-Za-z]{30,}/g],
  ["Slack token", /\bxox[abposr]-[0-9A-Za-z-]{10,}/g],
  ["JWT (possible service-role key)", /\beyJ[0-9A-Za-z_-]{15,}\.eyJ[0-9A-Za-z_-]{15,}\.[0-9A-Za-z_-]{20,}/g],
];

const BINARY = /\.(png|jpe?g|gif|webp|avif|ico|mp3|mp4|wav|ogg|woff2?|ttf|otf|zip|pdf)$/i;
const SKIP_DEFAULT = /(^|\/)(package-lock\.json|deno\.lock)$|(^|\/)\.env/;
// This scanner and its tests contain the pattern definitions / fake fixtures.
const SELF = new Set(["scripts/scan-secrets.mjs"]);

const r = reporter("scan-secrets");
let scanned = 0;
let hits = 0;

for (const file of walk(ROOT)) {
  const path = rel(file);
  if (SELF.has(path)) continue;
  if (!ALL && (BINARY.test(path) || SKIP_DEFAULT.test(path))) continue;
  let text;
  try { text = read(file); } catch { continue; }
  scanned++;
  for (const [name, re] of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text))) {
      hits++;
      r.fail("secret pattern", `${path}:${lineOf(text, m.index)} ${name}`);
    }
  }
}

if (!hits) r.pass("secret pattern", `no credential-shaped strings in ${scanned} files${ALL ? " (--all)" : ""}`);
r.finish();
