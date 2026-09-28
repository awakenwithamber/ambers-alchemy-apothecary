// Shared helpers for the read-only check scripts in scripts/.
// No dependencies: node:fs / node:path only. Nothing here writes files.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));

// Folders never scanned (vendor code, VCS metadata, local build state).
const SKIP_DIRS = new Set(["node_modules", ".git", ".netlify", ".cache"]);

// Folders that are server-side or blocked from the public site by netlify.toml.
// Everything else under publish = "." is publicly served.
export const NON_PUBLIC = [
  "api", "lib", "netlify", "docs", "scripts", "tests", "data", "supabase",
  ".claude", "attached_assets", "exports", "updates",
];
const NON_PUBLIC_FILES = new Set([
  "server.js", "index.mjs", "test.js", "package.json", "package-lock.json", "vercel.json",
  "CLAUDE.md", "threat_model.md", "SETUP.md", "VERCEL_DEPLOY.md", "CONSOLIDATION_AUDIT.md",
  "deno.lock",
]);

export function rel(file) {
  return relative(ROOT, file).split(sep).join("/");
}

export function walk(dir = ROOT, exts = null, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, exts, out);
    else if (!exts || exts.some((e) => name.toLowerCase().endsWith(e))) out.push(full);
  }
  return out;
}

export function isPublic(file) {
  const r = rel(file);
  const top = r.split("/")[0];
  if (NON_PUBLIC.includes(top)) return false;
  if (!r.includes("/") && NON_PUBLIC_FILES.has(r)) return false;
  return true;
}

export function read(file) {
  return readFileSync(file, "utf8");
}

// Line number (1-based) of a character offset.
export function lineOf(text, index) {
  let n = 1;
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) n++;
  return n;
}

// Collects PASS/WARN/FAIL results and prints them as text or JSON.
// Exit code is 1 when any FAIL was recorded.
export function reporter(name) {
  const results = [];
  const add = (status, check, detail = "") => results.push({ status, check, detail });
  return {
    pass: (c, d) => add("PASS", c, d),
    warn: (c, d) => add("WARN", c, d),
    fail: (c, d) => add("FAIL", c, d),
    finish() {
      const counts = { PASS: 0, WARN: 0, FAIL: 0 };
      for (const r of results) counts[r.status]++;
      if (process.argv.includes("--json")) {
        console.log(JSON.stringify({ script: name, counts, results }, null, 2));
      } else {
        for (const r of results) console.log(`${r.status.padEnd(4)}  ${r.check}${r.detail ? " — " + r.detail : ""}`);
        console.log(`\n${name}: ${counts.PASS} pass, ${counts.WARN} warn, ${counts.FAIL} fail`);
      }
      process.exitCode = counts.FAIL > 0 ? 1 : 0;
    },
  };
}
