// node scripts/audit-compliance.mjs [--json]
//
// Read-only copy checks on publicly served files (see CLAUDE.md invariant 6
// and .claude/skills/compliance-copy-check/REFERENCE.md):
//   FAIL — retired terms, HIPAA-compliance claims, the $AmberAlchemy handle
//   WARN — disease/drug verbs that need a human compliance read
//   FAIL — FDA disclaimer missing on index.html or grimior.html
// Lines that exist to retire a term (redirect maps, "retired" lists,
// renamed-product aliases) are allowlisted by the RETIRED_CONTEXT pattern.
// Exits 1 when any check FAILs.

import { existsSync } from "node:fs";
import { join } from "node:path";
import { ROOT, walk, isPublic, read, rel, reporter } from "./_shared.mjs";

const RETIRED = [
  ["age reversal", /\bage[\s-]revers(al|ing|e)\b/i],
  ["miracle", /\bmiracle\b/i],
  ["hair regrowth", /\bhair[\s-]re-?growth\b|\bregrow(s|th)? hair\b/i],
  ["parasite cleanse", /\bparasite[\s-]cleans(e|ing)\b/i],
  ["heavy metal detox", /\bheavy[\s-]metal[\s-]detox/i],
  ["diabetic", /\bdiabetic\b/i],
  ["blood sugar", /\bblood[\s-]sugar\b/i],
  ["PTSD", /\bPTSD\b/],
  ["bipolar", /\bbipolar\b/i],
];
const HIPAA = /\bHIPAA[\s-](compliant|compliance|certified|secure)\b|\bcomplies with HIPAA\b/i;
const HANDLE = /\$AmberAlchemy\b/;
const DISEASE_VERBS = /\b(cures?|cured|treats?|treatment for|heals?|prevents?|diagnos(e|es|is))\b(?=[^.\n]{0,60}\b(disease|cancer|diabetes|infection|insomnia|anxiety|depression|arthritis|eczema|psoriasis|acne|hypertension|illness|disorder|condition)s?\b)/i;
// Lines that mention a term only to retire or disclaim it.
const RETIRED_CONTEXT = /retired|withheld|redirect|renamed|legacy|formerly|not intended to diagnose|never (claim|say)|avoid|banned|do not use/i;
// Image file names are not rendered copy; renaming the files is tracked separately.
const IMAGE_PATH = /[\w\/.:-]*\.(png|jpe?g|webp|gif|svg|avif)\b/gi;
const FDA = /not been evaluated by the Food and Drug Administration/i;

const r = reporter("audit-compliance");
const files = walk(ROOT, [".html", ".js", ".json", ".xml", ".txt", ".webmanifest"]).filter(isPublic);

const counts = { retired: 0, hipaa: 0, handle: 0, disease: 0 };
for (const file of files) {
  const path = rel(file);
  const lines = read(file).split("\n");
  lines.forEach((line, i) => {
    const at = `${path}:${i + 1}`;
    if (line.length > 2000) line = line.slice(0, 2000);
    const allowed = RETIRED_CONTEXT.test(line);
    const copy = line.replace(IMAGE_PATH, "");
    for (const [term, re] of RETIRED) {
      if (re.test(copy) && !allowed) { counts.retired++; r.fail("retired term", `"${term}" at ${at}`); }
    }
    if (HIPAA.test(line) && !/\bnot\b[^.]{0,30}HIPAA|HIPAA[^.]{0,30}\bnot\b/i.test(line)) { counts.hipaa++; r.fail("HIPAA claim", at); }
    if (HANDLE.test(line)) { counts.handle++; r.fail("$AmberAlchemy handle", at); }
    if (DISEASE_VERBS.test(line) && !allowed) { counts.disease++; r.warn("disease claim wording", `${at} (needs human read)`); }
  });
}
if (!counts.retired) r.pass("retired term", `none in ${files.length} public files`);
if (!counts.hipaa) r.pass("HIPAA claim", "none");
if (!counts.handle) r.pass("$AmberAlchemy handle", "none");
if (!counts.disease) r.pass("disease claim wording", "no flagged phrasing");

for (const page of ["index.html", "grimior.html"]) {
  const f = join(ROOT, page);
  if (!existsSync(f)) r.fail(`FDA disclaimer ${page}`, "page missing");
  else if (FDA.test(read(f))) r.pass(`FDA disclaimer ${page}`, "present");
  else r.fail(`FDA disclaimer ${page}`, "missing");
}

r.finish();
