# 🔄 REPOSITORY CONSOLIDATION AUDIT

**Status:** Phase 2 — Merge Review Complete  
**Date:** August 24, 2026  
**Primary Repo:** `ambers-alchemy-apothecary` (JavaScript/Netlify) ✅  

---

## 📊 AUDIT SUMMARY

### **ACTIVE REPOSITORIES (Duplicates to Consolidate)**

| Repo | Language | Last Update | Status | Action |
|------|----------|-------------|--------|--------|
| **ambers-alchemy-apothecary** | JavaScript | Aug 24, 2026 | ✅ LIVE | **PRIMARY — Keep as main** |
| `Amber-s-Alchemy-Apothecary-` | HTML | Unknown | 🟡 Duplicate | Extract assets, then archive |
| `Ambers-Appthecary` | HTML | June 2025 | 🟡 Duplicate | Extract assets, then archive |
| `Website-build` | HTML | Unknown | 🟡 Duplicate | Extract assets, then archive |
| `Awaken-Again-2` | Mixed | Unknown | 🟡 Noise | Archive (scattered content) |

### **RELATED PROJECTS (Keep Separate for Now)**
- `the-bredesen-protocol-by-dr-thomas` (TypeScript) — Independent project
- `labsfunctionalneurologyslc` (TypeScript) — Independent project

### **IGNORE (Unrelated)**
- `attest-build-provenance`, `build`, `wpt`, `Owner-new`, `owner-repo`

---

## 🔍 DETAILED REPOSITORY ANALYSIS

### 1. **PRIMARY: `ambers-alchemy-apothecary`** ✅
**Status:** Active, Netlify-connected, Production  
**Tech Stack:** JavaScript (App.js), Netlify Functions, Service Worker  
**Key Features:**
- ✅ Homepage (redesigned with PR #11)
- ✅ Shop (Shopify-integrated)
- ✅ Botanicals library
- ✅ Soap builder (2 modes)
- ✅ Services
- ✅ Reviews page (dedicated)
- ✅ Blog/Articles
- ✅ Contact form
- ✅ Cart (client-side)
- ✅ Grimior subscription (12 chapters, $3.33/mo)
- ✅ Lunna AI assistant widget

**Netlify Deployment:** ✅ Auto-deploy on main push  
**Domain:** `ambers-alchemy-apothecary.netlify.app` + `awakenagain.com`  

**DECISION:** **KEEP THIS AS PRIMARY** — Do not merge secondary repos INTO this one.

---

### 2. **SECONDARY: `Amber-s-Alchemy-Apothecary-`** 🟡
**Status:** Duplicate, Static HTML  
**Tech Stack:** HTML + CSS (inline), MP3 audio  
**Files:**
- `index-1.html` (47 KB) — Static music gate UI
- `nastelbom-love-488313-1.mp3` (5.3 MB) — Ambient music

**Content:**
- Music gate experience (mystical entry)
- No dynamic features (no JS framework)
- No Shopify integration
- No API connectivity

**Unique Assets to Extract:**
- ✅ Music file: `nastelbom-love-488313-1.mp3` (ambient experience)
- ✅ Music gate UX pattern (optional reference)

**DECISION:** 
- ✅ Extract music file → store in `assets/audio/`
- ✅ Consider adding music toggle to homepage (optional)
- ❌ **ARCHIVE REPO** — Mark as `[ARCHIVED] Legacy music gate`

---

### 3. **SECONDARY: `Ambers-Appthecary`** 🟡
**Status:** Duplicate, Last updated June 2025  
**Tech Stack:** HTML + CSS (inline), no frameworks  
**Files:**
- `index.html` (40 KB) — Full UI with cart, filters, products
- `nastelbom-love-488313-1.mp3` (same music)
- LICENSE, README

**Content:**
- Similar layout to current site (hero, shop, botanicals, builder, services, blog, contact)
- Cart implementation (client-side)
- Product grid
- Service cards
- No API integration (static)
- No Shopify (manual checkout UX only)

**Unique Assets to Extract:**
- ✅ None (all content duplicated in primary repo)
- ⚠️ Service descriptions (check if newer than current)
- ⚠️ CSS patterns (already in main repo)

**DECISION:**
- ❌ **ARCHIVE REPO** — Mark as `[ARCHIVED] Static HTML version (pre-API)`
- ✅ Create git tag `legacy-june-2025` for reference

---

### 4. **SECONDARY: `Website-build`** 🟡
**Status:** Duplicate, Standalone portfolio site  
**Tech Stack:** HTML + CSS (inline), Google Forms integration  
**Files:**
- `index.html` (14 KB) — Portfolio/services site
- LICENSE, README

**Content (Different from Apothecary):**
- Tarot readings
- Admin assistance services
- Hypnotherapy
- Modeling & talent portfolio
- Social media marketing services
- **INCLUDES:** Apothecary section (link to products)
- Contact form (Google Forms backend)
- Gallery of professional photos

**Unique Assets to Extract:**
- ✅ **Service descriptions** (tarot, admin, hypnotherapy, modeling, marketing)
- ✅ **Professional photos** (headshots, portfolio images)
- ✅ **Branding language** ("Earth Medicine • Creative Marketing • Conscious Living")
- ⚠️ **Google Forms contact integration** (check if better than current)

**DECISION:**
- ✅ **MERGE SERVICES** — Add to main apothecary site
- ✅ Integrate professional photos and branding
- ✅ Create "Services" section
- ❌ **ARCHIVE REPO** after merge

---

### 5. **SECONDARY: `Awaken-Again-2`** 🟡
**Status:** Noise/Experiment  
**Tech Stack:** Mixed (PowerShell, console test refs, unclear purpose)  
**Files:**
- README (1 KB) — Links to Netlify agent run, unrelated PowerShell scripts

**Content:**
- PowerShell admin script (ADUC user provisioning)
- Web platform test references
- Lint fixes
- No actual website code

**Unique Assets to Extract:**
- ❌ **None** (no web content)

**DECISION:**
- ❌ **ARCHIVE REPO** — Mark as `[ARCHIVED] Experiment (incomplete)`

---

## ✅ CONSOLIDATION ACTION PLAN

### **APPROVED ACTIONS:**

**1. Extract & Consolidate Assets** ✅
- Extract music: `nastelbom-love-488313-1.mp3` from secondary repos
- Extract services content: Tarot, Admin, Hypnotherapy, Modeling, Marketing
- Extract photos: Professional headshots from `Website-build`
- Extract branding: "Earth Medicine • Creative Marketing • Conscious Living"

**2. Archive Secondary Repos** ✅
- Update descriptions with `[ARCHIVED]` prefix
- Add consolidation notice
- Link to primary repo
- Preserve git history (do NOT delete)

**3. Netlify Configuration** ✅
- Primary repo: `ambers-alchemy-apothecary` (already connected)
- Domain: `awakenagain.com` (verified)
- Auto-deploy: main branch
- Secondary repos: Do NOT connect

**4. Validation** ✅
- Site deploys successfully
- All Shopify integrations work
- Grimior subscription functional
- Lunna widget active
- No broken links

---

## 🚀 PROCEEDING WITH CONSOLIDATION...

