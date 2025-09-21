Here’s a ready-to-save documentation file that standardizes how every docs subfolder builds and stores its `_generated/index.json`.

---

# Official Title

Generated Index JSON – Build Specification & Usage Guide

# Domain

documents

# File Name

generated-index\_BuildSpec\_2025-09-21.md

# Main Part

generated-index

# Qualifier

BuildSpec

# Date

2025-09-21

# Spotlight Comments

* Defines a **single, shared schema** for `_generated/index.json` across **all** docs subdirectories.
* Explains **where the index lives**, **how it’s built**, **what it reads**, and **how to consume it**.
* Cross-references:

  * [Project Documents Handbook](./project-documents_Handbook_2025-09-21.md)
  * [Documents Indexing & Linking Standard](./documents-indexing-linking_Standard_2025-09-21.md)
  * [Documents Directory – Refactor Plan & Ideal Structure](./documents-directory_RefactorPlan_2025-09-21.md)

# Summary

This guide defines the contract for `_generated/index.json`—a lightweight, machine-readable inventory of Markdown/MDX documents inside a given **documents** subdirectory. It specifies **where the file is saved**, the **JSON schema**, **derivation rules** (how metadata is pulled from document headers and file names), and a **repeatable build workflow**.
Following this guide ensures every documentation subfolder provides a consistent, linkable index that can power search, listings, and cross-references in UIs or scripts.

---

## 1) Where the index lives

* **Human-authored documents live at:**
  `documents/<subdir>/*.md[x]?` (plus nested folders as needed)
* **The generated index lives at:**
  `documents/<subdir>/_generated/index.json`  ← **authoritative output location**
* **This spec file (the one you’re reading) should live alongside the docs:**
  `documents/<subdir>/generated-index_BuildSpec_YYYY-MM-DD.md`
  (Do **not** place human docs inside `_generated/`.)

> For our root docs folder this means:
>
> * Index: `documents/documents/_generated/index.json`
> * This guide: `documents/documents/generated-index_BuildSpec_2025-09-21.md`

### Version control

* Default: **commit** `_generated/index.json` so the index is browsable in Git and can be consumed by simple static tooling.
* If you prefer ephemeral outputs, add `_generated/**` to `.gitignore` in that subfolder and regenerate in CI. Pick **one** approach and stick to it.

---

## 2) What the index contains (schema)

Top-level keys:

```json
{
  "version": 1,
  "generatedAt": "2025-09-21T12:00:00.000Z",
  "root": "/documents/<subdir>",
  "docs": [ /* DocumentIndex[] (see below) */ ]
}
```

Each document entry (`DocumentIndex`) has:

```ts
type DocumentIndex = {
  /** Path relative to the subdir root, e.g. "./project-documents_Handbook_2025-09-21.md" */
  path: string;

  /** Base file name only */
  file: string;

  /** Human title */
  title: string;

  /** Domain or area (e.g., "project", "packages", "architecture") */
  domain: string;

  /** The "main" kebab-case subject (from file name or header) */
  main: string;

  /** The PascalCase qualifier (e.g., "Handbook", "Standard", "RefactorPlan") */
  qualifier: string;

  /** YYYY-MM-DD or "Evergreen" for README-like docs */
  date: string;

  /** Optional metadata */
  status?: "Draft" | "InReview" | "Approved" | "Deprecated";
  owners?: string[];             // e.g., ["@conor"]
  tags?: string[];               // free-form tags
  links?: {
    related?: string[];          // relative paths to sibling docs
    supersedes?: string[];       // docs this replaces
    supersededBy?: string[];     // docs that replace this one
  };

  /** Optional narrative pulled from the header if present */
  spotlight?: string;            // short note (1–3 lines or bullets, flattened)
  summary?: string;              // brief paragraph summary (plain text)
};
```

**Notes & conventions**

* **`title`**, **`domain`**, **`status`**, **`owners`**, **`tags`**, **`links`**, **`spotlight`**, **`summary`** come from the document header (see §3).
* **`main`**, **`qualifier`**, **`date`** default to parsing from the **file name** following the **`kebab-main_Pascal-qualifier_YYYY-MM-DD.ext`** rule (see §4).
* `date` may be **"Evergreen"** for README/landing docs without a date.
* Paths in `links.*` must be **relative to the same subdir** and resolve to existing files.

---

## 3) Document header (what the index reads)

Each Markdown/MDX doc should start with a lightweight header block (structured list). Use the same fields the index expects.

**Header fields (recommended):**

* **Official Title:** *string*
* **Domain:** *string* (e.g., `project`, `packages`, `architecture`, `services`, `search`)
* **File Name:** *string* (for human clarity; the builder does **not** rely on this)
* **Main Part:** *kebab-case* (e.g., `documents-indexing-linking`)
* **Qualifier:** *PascalCase* (e.g., `Standard`, `Handbook`, `RefactorPlan`)
* **Date:** *YYYY-MM-DD* or `Evergreen`
* **Spotlight Comments:** *1–3 lines or bullet points*
* **Summary:** *1–2 paragraphs*
* **Status:** *Draft | InReview | Approved | Deprecated*
* **Owners:** *array* (e.g., `["@conor"]`)
* **Tags:** *array* (e.g., `["docs","indexing"]`)
* **Related / Supersedes / Superseded By:** *relative paths* (e.g., `./documents-directory_RefactorPlan_2025-09-21.md`)

> See examples in:
>
> * [Project Documents Handbook](./project-documents_Handbook_2025-09-21.md)
> * [Documents Indexing & Linking Standard](./documents-indexing-linking_Standard_2025-09-21.md)

**Extraction rules**

1. **Header wins.** If a field exists in the header, use it.
2. **File name fallback.** If `main`, `qualifier`, or `date` are missing, parse them from the file name (see §4).
3. **Computed defaults.**

   * `date = "Evergreen"` when the base name is `readme.md` (case-insensitive).
   * `domain = "project"` if omitted.
   * `status = "Approved"` if omitted.

---

## 4) File naming rule (fallback source)

All docs should follow:

```
kebab-main_Pascal-qualifier_YYYY-MM-DD.md
```

**Examples**

* `documents-indexing-linking_Standard_2025-09-21.md`
  → `main="documents-indexing-linking"`, `qualifier="Standard"`, `date="2025-09-21"`
* `documents-directory_RefactorPlan_2025-09-21.md`
  → `main="documents-directory"`, `qualifier="RefactorPlan"`, `date="2025-09-21"`

**Special case**

* `README.md` → `main="readme"`, `qualifier="Overview"`, `date="Evergreen"`

**Regex (for the builder)**

```
/^(?<main>[a-z0-9]+(?:-[a-z0-9]+)*)_(?<qualifier>[A-Z][A-Za-z0-9]*)_(?<date>\d{4}-\d{2}-\d{2})\.(md|mdx)$/i
```

---

## 5) Build workflow (repeatable)

1. **Discover** all `*.md`/`*.mdx` files in the subdir **excluding**:

   * `_generated/**`, `node_modules/**`, dotfiles.
2. **Parse header** block (top of file); normalize fields (trim, arrays).
3. **Parse file name** using the regex in §4 for any missing `main`, `qualifier`, `date`.
4. **Assemble entries** (`DocumentIndex`), validate:

   * `title`, `main`, `qualifier`, `date`, `domain` present.
   * `date` is `YYYY-MM-DD` or `Evergreen`.
   * `links.*` paths resolve to existing files within the same subdir.
5. **Sort** by `main` (asc), then `date` (desc), then `qualifier` (asc).
6. **Write output** to `./_generated/index.json` with stable formatting (2-space indent).
7. **(Optional)** Lint: warn on unknown fields or duplicate (`main`,`date`,`qualifier`) tuples.

**CLI suggestion**

```
# scripts/docs/build-doc-index.ts
tsx scripts/docs/build-doc-index.ts documents/documents
```

**Programmatic outline (TypeScript pseudo)**

```ts
const ROOT = resolve(process.argv[2] ?? "documents/documents");
const OUT  = join(ROOT, "_generated/index.json");

const files = await glob("**/*.{md,mdx}", { cwd: ROOT, ignore: ["_generated/**", "**/node_modules/**", "**/.*"] });

const docs: DocumentIndex[] = [];
for (const rel of files) {
  const abs = join(ROOT, rel);
  const raw = await fs.readFile(abs, "utf8");
  const header = parseHeader(raw);          // from top block
  const parsed = parseName(rel);            // regex fallback for main/qualifier/date
  const meta = merge(header, parsed);       // header wins
  const entry = normalizeAndValidate({ rel, raw, meta, ROOT });
  docs.push(entry);
}

const payload = {
  version: 1,
  generatedAt: new Date().toISOString(),
  root: ROOT.replace(process.cwd(), "") || ROOT,
  docs: sortDocs(docs),
};

await fs.mkdir(dirname(OUT), { recursive: true });
await fs.writeFile(OUT, JSON.stringify(payload, null, 2));
console.log(`✅ Wrote ${relPath(OUT)}`);
```

---

## 6) Validation rules (quick list)

* **Required**: `title`, `domain`, `main`, `qualifier`, `date`.
* **Date**: `YYYY-MM-DD` or `"Evergreen"`.
* **Links**: paths must exist; otherwise warn.
* **Status**: one of `Draft | InReview | Approved | Deprecated` (default `Approved`).
* **Owners**: array of `@github`-like handles or names.
* **Tags**: array of lowercase keywords (kebab-case recommended).

---

## 7) Consuming the index

* **Docs site / UI lists**: Render `title`, `summary`, `status`, `date`, chips for `tags`; use `links.related` to surface “See also”.
* **Search**: Feed `docs[]` into your minisearch or client search builder.
* **Cross-folder rollups**: Build one index per subdir, then stitch top-level lists as needed.

---

## 8) Failure modes & troubleshooting

* **Missing `title`** → Add it to the header.
* **Bad `date`** → Fix to `YYYY-MM-DD` or set to `Evergreen` (README only).
* **Broken links** → Ensure relative paths are correct and within the same subdir.
* **Unexpected file names** → Conform to the naming rule or provide header overrides.

---

## 9) Related standards

* [Project Documents Handbook](./project-documents_Handbook_2025-09-21.md)
* [Documents Indexing & Linking Standard](./documents-indexing-linking_Standard_2025-09-21.md)
* [Documents Directory – Refactor Plan & Ideal Structure](./documents-directory_RefactorPlan_2025-09-21.md)

---

## 10) TL;DR

* **Index output**: `documents/<subdir>/_generated/index.json`
* **Spec doc**: `documents/<subdir>/generated-index_BuildSpec_YYYY-MM-DD.md`
* **Header first**, file name as fallback.
* **One schema, everywhere.** Keep it boring and predictable.
