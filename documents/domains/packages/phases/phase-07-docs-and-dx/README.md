Perfect—here are the **production-ready docs** for **Phase 07 — Docs & Developer Experience**.
Create these four files under:

```
documents/domains/packages/phases/phase-07-docs-and-dx/
├─ _generated/index.json
├─ README.md
├─ phase-07-docs-and-dx_Checklist_2025-09-22.md
└─ phase-07-docs-and-dx_Playbook_2025-09-22.md
```

They match your naming/header standard, target `TBHDigitalSolutions/tbh-next-site-build`, use **Node 20 + npm**, and assume work happens on `feat/packages-refactor` (never `main`).

---

## 1) `README.md`

```md
**Official Title:** Phase 07 — Docs & Developer Experience  
**Domain:** packages  
**File Name:** phase-07-docs-and-dx_Readme_2025-09-22.md  
**Main Part:** phase-07-docs-and-dx  
**Qualifier:** Guide  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Make the **SSOT plan** obvious, phase docs consistent, and searching/browsing instant.  
- Add **Quick Start** so a new dev can add a SKU end-to-end using docs only.  
- Ship **doc index generator + linter** to prevent drift and enforce headers/filenames.

**Summary:**  
This phase finalizes documentation & DX for the Packages domain. We standardize file headers & names, wire an index generator for the domain, add a doc linter to keep everything tidy, and publish a “New SKU Quick Start.” The goal: a new contributor can read, follow, and ship changes without tribal knowledge. Nothing here changes runtime behavior; it improves authoring, review, and onboarding.
```

---

## 2) `phase-07-docs-and-dx_Checklist_2025-09-22.md`

```md
**Official Title:** Phase 07 — Docs & Developer Experience (Checklist)  
**Domain:** packages  
**File Name:** phase-07-docs-and-dx_Checklist_2025-09-22.md  
**Main Part:** phase-07-docs-and-dx  
**Qualifier:** Checklist  
**Date:** 2025-09-22

**Spotlight Comments:**  
- Work on `feat/packages-refactor` only.  
- Docs must have the **official header block** and follow **file naming**.

**Summary:**  
Tight, verifiable steps to land SSOT discoverability, per-phase consistency, Quick Start, and doc linting/indexing.

---

## Working rules
- Branch: `feat/packages-refactor` → feature branch for this phase → PR into `feat/packages-refactor`.
- Package manager: **npm** only.
- Don’t alter runtime code paths; this phase touches **docs & scripts** only.

## Preconditions
- [ ] `documents/domains/packages/packages-phase-driven_Plan_2025-09-22.md` exists & is current.  
- [ ] Phase folders 00–06 created (short/long) per structure.

## Do this (check each)
- [ ] **Add/Update domain README** at `documents/domains/packages/README.md` with: domain overview, links to SSOT, phases index, standards, and Quick Start anchor.  
- [ ] **Quick Start (New SKU)** section present in README (copy from playbook below).  
- [ ] **Doc index generator** present at `documents/domains/packages/scripts/build-doc-index.ts` and builds:  
      - [ ] `documents/domains/packages/index.md` (table)  
      - [ ] `_generated/index.json` in each relevant folder  
- [ ] **Doc linter** present at `documents/domains/packages/scripts/check-docs.ts` and enforces:  
      - [ ] Required header block  
      - [ ] Filename pattern `<kebab-main>_<PascalQualifier>_YYYY-MM-DD.md`  
      - [ ] Domain=`packages`  
- [ ] **npm scripts** in `package.json`:  
      - [ ] `"docs:build-index"` → node documents/domains/packages/scripts/build-doc-index.ts  
      - [ ] `"docs:check"` → node documents/domains/packages/scripts/check-docs.ts  
- [ ] **PR template** references SSOT + phase IDs + Quick Start.  
- [ ] Run locally: `npm run docs:check && npm run docs:build-index` (green).  
- [ ] Update **changelog.md** (docs changes).  

## Acceptance
- [ ] A new dev can add a SKU end-to-end using only the docs (Quick Start).  
- [ ] `docs:check` passes on CI; bad headers/filenames fail PR.  
- [ ] `index.md` shows all phases with status/links; `_generated/index.json` populated.  
```

---

## 3) `phase-07-docs-and-dx_Playbook_2025-09-22.md`

````md
**Official Title:** Phase 07 — Docs & Developer Experience (Playbook)  
**Domain:** packages  
**File Name:** phase-07-docs-and-dx_Playbook_2025-09-22.md  
**Main Part:** phase-07-docs-and-dx  
**Qualifier:** Playbook  
**Date:** 2025-09-22

**Spotlight Comments:**  
- SSOT is normative; phases never contradict it.  
- Lint & index scripts prevent drift and missing headers.

**Summary:**  
Hands-on steps to finalize domain documentation & DX: domain README, Quick Start, doc indexer, doc linter, npm scripts, and PR template touch-ups.

---

## 0) Branch

```bash
git switch feat/packages-refactor
git pull --ff-only
git switch -c chore/phase-07-docs-and-dx
````

---

## 1) Domain README (control tower)

**Edit (or create):** `documents/domains/packages/README.md`

Minimum sections:

* **What this domain covers** (1 paragraph)
* Links: **SSOT** plan, **index.md**, **standards/**, **phases/**, **templates/**, **scripts/**
* **New SKU Quick Start** (use section from §4)

> Keep README short; it should point to deep docs, not duplicate them.

---

## 2) Doc index generator (shared for this domain)

**File:** `documents/domains/packages/scripts/build-doc-index.ts`

```ts
import fs from "node:fs";
import path from "node:path";

type Row = { phase?: string; title: string; owner?: string; status?: string; lastUpdated?: string; link: string };

const ROOT = path.resolve(__dirname, "..");
const PHASES_DIR = path.join(ROOT, "phases");

function readFrontMatter(text: string) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const lines = m[1].split("\n").map(l => l.trim()).filter(Boolean);
  const obj: Record<string, string> = {};
  for (const l of lines) {
    const i = l.indexOf(":");
    if (i > -1) obj[l.slice(0, i).trim()] = l.slice(i + 1).trim();
  }
  return obj;
}

function collectPhaseFiles(): Row[] {
  const rows: Row[] = [];
  const entries = fs.readdirSync(PHASES_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith("phase-"));

  for (const dirent of entries) {
    const dir = path.join(PHASES_DIR, dirent.name);
    const mdFiles = fs.readdirSync(dir).filter(f => f.endsWith(".md"));
    // Prefer Playbook, else Checklist, else README
    const preferred = ["Playbook", "Checklist", "README"];
    let chosen = "";
    for (const tag of preferred) {
      const match = mdFiles.find(f => f.includes(tag));
      if (match) { chosen = match; break; }
    }
    const file = chosen || mdFiles[0];
    if (!file) continue;
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    const fm = readFrontMatter(text);
    const phaseNum = dirent.name.match(/^phase-(\d\d)/)?.[1] ?? "--";
    rows.push({
      phase: phaseNum,
      title: fm.title || dirent.name,
      owner: fm.owner || "",
      status: fm.status || "",
      lastUpdated: fm.lastUpdated || "",
      link: `phases/${dirent.name}/${file}`
    });

    // write per-folder _generated/index.json
    const genDir = path.join(dir, "_generated");
    fs.mkdirSync(genDir, { recursive: true });
    fs.writeFileSync(path.join(genDir, "index.json"), JSON.stringify({
      phase: phaseNum,
      files: mdFiles.sort(),
      lastUpdated: new Date().toISOString().slice(0,10)
    }, null, 2));
  }
  return rows.sort((a,b) => (a.phase||"").localeCompare(b.phase||""));
}

function buildTable(rows: Row[]) {
  const header = `# Packages Domain — Phases Index

| Phase | Title | Owner | Status | Last Updated | Link |
|------:|-------|-------|--------|--------------|------|`;
  const body = rows.map(r =>
    `| ${r.phase ?? ""} | ${r.title} | ${r.owner ?? ""} | ${r.status ?? ""} | ${r.lastUpdated ?? ""} | [doc](${r.link}) |`
  ).join("\n");
  return `${header}\n${body}\n`;
}

function main() {
  const rows = collectPhaseFiles();
  fs.writeFileSync(path.join(ROOT, "index.md"), buildTable(rows));
  // write domain _generated/index.json
  const gen = path.join(ROOT, "_generated");
  fs.mkdirSync(gen, { recursive: true });
  fs.writeFileSync(path.join(gen, "index.json"), JSON.stringify({
    files: ["packages-phase-driven_Plan_2025-09-22.md", "index.md", "README.md", "standards/*", "phases/*"],
    phases: rows,
    lastUpdated: new Date().toISOString().slice(0,10)
  }, null, 2));
  // eslint-disable-next-line no-console
  console.log("Built domain docs index.");
}

main();
```

---

## 3) Doc linter (headers & filenames)

**File:** `documents/domains/packages/scripts/check-docs.ts`

```ts
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");
const QUALIFIERS = ["Plan","Playbook","Checklist","Standard","Spec","Guide","Template","Readme","README"];

type Problem = { file: string; msg: string };
const problems: Problem[] = [];

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "_generated") continue;
      walk(p);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      lintFile(p);
    }
  }
}

function hasHeaderBlock(text: string) {
  return text.startsWith("**Official Title:**");
}

function readHeader(text: string) {
  const lines = text.split("\n").slice(0, 12).map(l => l.trim());
  const o: Record<string,string> = {};
  for (const key of ["Official Title","Domain","File Name","Main Part","Qualifier","Date"]) {
    const row = lines.find(l => l.startsWith(`**${key}:**`));
    if (row) o[key] = row.replace(`**${key}:**`, "").trim();
  }
  return o;
}

function lintFile(file: string) {
  const name = path.basename(file);
  const text = fs.readFileSync(file, "utf8");
  if (!hasHeaderBlock(text)) {
    problems.push({ file, msg: "Missing required header block (Official Title/Domain/File Name/...)" });
    return;
  }
  const hdr = readHeader(text);

  // Domain check
  if ((hdr["Domain"] || "").toLowerCase() !== "packages") {
    problems.push({ file, msg: `Domain must be "packages" (found "${hdr["Domain"] || ""}")` });
  }

  // Filename convention
  const qual = (hdr["Qualifier"] || "").replace(/\s+/g, "");
  if (!QUALIFIERS.includes(qual)) {
    problems.push({ file, msg: `Qualifier must be one of ${QUALIFIERS.join(", ")}` });
  }
  // Expected pattern: <kebab>_<PascalQualifier>_YYYY-MM-DD.md
  const kebabMain = (hdr["Main Part"] || "").trim();
  const date = (hdr["Date"] || "").trim();
  const expected = `${kebabMain}_${qual}_${date}.md`;
  if (date && !/^\d{4}-\d{2}-\d{2}|Evergreen$/.test(date)) {
    problems.push({ file, msg: `Date must be YYYY-MM-DD or Evergreen (found "${date}")` });
  }
  if (hdr["File Name"] && hdr["File Name"] !== name) {
    problems.push({ file, msg: `Header "File Name" must match actual filename ("${name}")` });
  }
  if (!name.includes(`_${qual}_`)) {
    problems.push({ file, msg: `Filename should include "_${qual}_" (e.g., "${expected}")` });
  }
}

function main() {
  walk(ROOT);
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.error("Doc lint errors:\n" + problems.map(p => `- ${p.file}: ${p.msg}`).join("\n"));
    process.exit(1);
  } else {
    // eslint-disable-next-line no-console
    console.log("Docs OK");
  }
}

main();
```

---

## 4) Quick Start (New SKU) — add this to `documents/domains/packages/README.md`

````md
## New SKU Quick Start (Package/Add-On/Bundle)

1) **Branch**
```bash
git switch -c feat/new-sku
````

2. **Author data (TS)**

* Add to the right file under `src/data/packages/*-packages.ts` or `*-addons.ts` (see `types.ts`).
* Use normalized price keys: `oneTime`, `monthly`, `currency: "USD"`.

3. **(Optional) Bundle narrative (MDX)**

* Create `src/content/packages/bundles/<slug>.mdx` with `slug` frontmatter for rich copy.

4. **Build artifacts**

```bash
npm run data:ci
```

Expect `src/data/packages/__generated__/bundles.enriched.json` and `packages.search.json`.

5. **Run & verify**

```bash
npm run dev
```

* Check `/packages` (search/filters).
* Check `/packages/<slug>` (detail; compiled MDX if provided).

6. **Docs & PR**

* Update `documents/domains/packages/changelog.md`.
* Run `npm run docs:check && npm run docs:build-index`.
* Open PR into `feat/packages-refactor` linking the **Phase ID** if relevant.

````

---

## 5) npm scripts

**Edit:** `package.json` (add if missing)
```json
{
  "scripts": {
    "docs:build-index": "node documents/domains/packages/scripts/build-doc-index.ts",
    "docs:check": "node documents/domains/packages/scripts/check-docs.ts"
  }
}
````

---

## 6) PR template touch-up

**Edit:** `.github/pull_request_template.md`
Add a “Docs” section:

```md
### Docs
- [ ] Linked **SSOT** (packages-phase-driven_Plan_2025-09-22.md) and **Phase ID** (e.g., PKG-PH07)
- [ ] Ran `npm run docs:check && npm run docs:build-index`
- [ ] Updated `documents/domains/packages/changelog.md` if docs changed
```

---

## 7) Run & Commit

```bash
npm run docs:check
npm run docs:build-index

git add documents/domains/packages
git commit -m "docs(packages): domain README, Quick Start, doc indexer & linter (Phase 07)"
git push -u origin chore/phase-07-docs-and-dx
```

Open a PR into `feat/packages-refactor`. Attach a screenshot of `documents/domains/packages/index.md` and the passing `docs:check` output.

---

## 8) Troubleshooting

* **Linter fails (header/filename):** ensure the visible header block is present and the filename matches `<kebab-main>_<PascalQualifier>_YYYY-MM-DD.md`.
* **Index missing rows:** make sure each phase folder has at least one `.md` (Playbook or Checklist) with front-matter.
* **Bad dates:** use `YYYY-MM-DD` or the literal `Evergreen`.
* **Qualifiers wrong:** stick to `Plan | Playbook | Checklist | Standard | Spec | Guide | Template | Readme | README`.

````

---

## 4) `_generated/index.json`

```json
{
  "phase": "07",
  "title": "Docs & Developer Experience",
  "files": [
    "README.md",
    "phase-07-docs-and-dx_Checklist_2025-09-22.md",
    "phase-07-docs-and-dx_Playbook_2025-09-22.md"
  ],
  "lastUpdated": "2025-09-22"
}
````

---

### Final Acceptance (paste in PR)

* **Quick Start works**: a new dev can add a SKU following README only.
* **Doc linter passes** (`npm run docs:check`) and **index builds** (`npm run docs:build-index`).
* `documents/domains/packages/index.md` shows all phases with owner/status/links; each phase folder has its own `_generated/index.json`.
* PR template references SSOT and Phase IDs; changelog updated.
