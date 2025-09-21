---
title: "Documents Indexing & Linking Standard"
domain: "project"
file: "documents-indexing-linking_Standard_2025-09-21.md"
main: "documents-indexing-linking"
qualifier: "Standard"
date: "2025-09-21"
status: "Approved"
owners: ["@conor"]
tags: ["indexing","linking","automation"]
links:
  related:
    - "./project-documents_Handbook_2025-09-21.md"
    - "./documents-directory_RefactorPlan_2025-09-21.md"
---

**Official Title:** Documents Indexing & Linking Standard  
**Domain:** project  
**File Name:** documents-indexing-linking_Standard_2025-09-21.md  
**Main Part:** documents-indexing-linking  
**Qualifier:** Standard  
**Date:** 2025-09-21  

**Spotlight Comments:**  
- Front-matter is the **single source of truth** for metadata  
- Index pages are **generated**, not hand-maintained  
- READMEs remain curated overviews

**Summary:**  
Defines the indexing pipeline and rules: mandatory headers, filename format, generated catalogs (JSON/MD), and how folder READMEs relate to generated indexes. Use it to eliminate drift and ensure consistent cross-links across the tree.

---

Here’s a tight, opinionated standard for **indexing and linking the documents tree** that you can drop into `/documents/README.md` and follow everywhere.

---

# Documents Indexing & Linking Standard

## What we’re optimizing for

* **One source of truth** for metadata → **document front-matter**.
* **Zero manual drift** → indexes are **generated** from front-matter.
* **Human-friendly** navigation pages exist, but they’re **curated summaries**, not the source of truth.

---

## The rule (TL;DR)

1. **Every document** must include the **Doc Header** front-matter block (see template below).
2. **Do not hand-maintain “index” lists** in every folder. Instead:

   * Put a short, human **overview** in `README.md` per folder.
   * Let the **generator** build machine and human indexes:

     * `_generated/index.json` (global catalog)
     * `_generated/sitemap.md` (global, human-readable)
     * `_generated/<folder>/index.json` (per-folder catalog)
     * Optionally `_generated/<folder>/index.md` (per-folder list)
3. Keep a small number of **curated landing pages** (e.g., `services_index.md`) for storytelling. They **link to** generated indexes; they **don’t replace** them. (Example: your current `services_index.md` is a good curated landing.  )

---

## File naming

Use: **`kebab-main_Pascal-qualifier_YYYY-MM-DD.md`**

* **kebab-main** = core subject (`packages-hub`, `search-architecture`)
* **Pascal-qualifier** = type or stage (`Overview`, `Guide`, `Decision`, `Spec`, `RFC`, `Playbook`)
* **YYYY-MM-DD** = relevant date (created or decision date)
* Examples:

  * `packages-domain_Overview_2025-09-14.md`
  * `search-indexing_Guide_2025-09-15.md`
  * `services-taxonomy_Decision_2025-09-10.md`

If it’s a living page (no point-in-time), you can omit the date: `system-overview_Overview.md`.

> Keep extensions **`.md`** for docs. Use **`.mdx`** only if you need JSX or embeds.

---

## Required Doc Header (front-matter)

At the very top of every file:

```yaml
---
title: "Official Title of Doc"
domain: "packages" # services | portfolio | packages | search | architecture | project | etc.
main: "packages-domain"       # kebab-case main subject
qualifier: "Overview"         # PascalCase (Overview|Guide|Decision|Spec|RFC|Playbook|Policy)
date: "2025-09-15"            # YYYY-MM-DD (omit for living docs if you want)
status: "Active"              # Active | Draft | Deprecated | Superseded
owner: "team-packages"        # team or person handle
tags: ["packages","data","content"]
related:
  - "../architecture/system-overview_Overview.md"
  - "/documents/domains/packages/global-packages_hub_overview.md"
replaces: []                  # files this supersedes
supersededBy: []              # filled when this doc is replaced
spotlight: |
  One-liner context or bullets for quick scanning.
  - Key change
  - Cross-ref to spec X
---
```

**Notes**

* `title`, `domain`, `main`, `qualifier` are **required**.
* `status`, `owner`, `tags` highly recommended.
* `related`, `replaces`, `supersededBy` enable cross-linking without manual index edits.

---

## Folder structure rules

* **Every folder** must have a **`README.md`** (human overview + purpose + high-level links).
* **Never** hand-maintain long link lists inside `README.md`. Keep it short; rely on generated `index.md` that the generator drops into `_generated/<folder>/index.md`.
* If you need a curated landing page (e.g., **services landing**), put it **next to** the folder’s `README.md` (e.g., `services_index.md`) and link to the generated index.

**Example (ideal)**

```
documents/
  README.md                         # global purpose & how-to
  _generated/                       # auto-created, gitignored
    index.json
    sitemap.md
    data/
      services-pages/
        index.json
        index.md
  data/
    services-pages/
      README.md                     # short overview
      services_index.md             # curated landing (optional)
      content-production-services/
        README.md
        content_production_structure_Overview_2025-09-10.md
        content_production_directory_tree_Overview_2025-09-10.txt
      lead-generation-services/
        README.md
        lead_generation_structure_Overview_2025-09-10.md
        lead_generation_directory_tree_Overview_2025-09-10.txt
      # ...
```

---

## How indexing works (generator approach)

We use a tiny script that scans `/documents/**` for `.md/.mdx`, reads front-matter, and writes:

* **Global** catalog: `/documents/_generated/index.json`
* **Per-folder** catalogs: `/documents/_generated/<folder>/index.json`
* **Human lists**: `/documents/_generated/sitemap.md` and per-folder `index.md`

**NPM scripts**

```json
{
  "scripts": {
    "docs:build-index": "tsx scripts/docs/build-docs-index.ts",
    "docs:check": "tsx scripts/docs/validate-docs.ts",
    "precommit:docs": "npm run docs:build-index && npm run docs:check"
  }
}
```

**Validation rules (`docs:check`)**

* Ensure required front-matter keys exist & are valid (title/domain/main/qualifier).
* Enforce filename convention → warn/fail on mismatch.
* Validate all paths in `related`/`replaces`/`supersededBy`.
* Optional: check for broken in-body relative links.

---

## Where to put “index” pages you write by hand?

* Keep curated overviews like `services_index.md` or high-level primers.
* They should **not** list every child file (that’s the generator’s job). Instead:

  * Introduce the domain.
  * Link to the **generated index**.
  * Feature 3–7 “start here” docs with one-line rationale.

> Your existing `services_index.md` is perfect as a curated landing. Keep it, and add a small link to the generated index below it. (It references your *Lead-Generation Services Structure* docs; those are good examples to cross-link in the header.  )

---

## Linking & cross-refs (make it obvious)

* Prefer **relative links** (`../sibling/f-name.md`) so moves don’t break.
* Use the **Doc Header `related`** to express relationships. The generator includes these in per-folder `index.md` under a “Related” section.
* Within the doc body, you can add a **“See also”** list; the generator doesn’t parse that, but humans love it.

**Body block pattern**

```md
## See also
- Related: [Packages Hub Overview](../packages/global-packages_hub_overview.md)
- Decision: [Services Taxonomy Decision](../../taxonomy/services-taxonomy_Decision_2025-09-10.md)
```

---

## When to use `.txt` trees or diagrams?

* `.txt` trees are useful snapshots (like directory trees). Keep them, but **date-stamp** and include front-matter so they show up in the catalog.
* Prefer **Mermaid** in `.md` for living diagrams:

````md
```mermaid
flowchart LR
  A[Data] --> B[Build]
  B --> C[Generated Index]
  C --> D[Docs UI]
````

````

---

## Examples (copy/paste)

**Folder `README.md`**

```md
# Services Pages Docs

Short purpose statement. Who should read this. What decisions live here.

- Start here: `services_index.md`
- Full list: see generated index for this folder at `_generated/data/services-pages/index.md`
````

**A doc with full header**

```md
---
title: "Lead-Generation Services Structure"
domain: "services"
main: "lead-generation-services"
qualifier: "Overview"
date: "2025-09-10"
status: "Active"
owner: "team-services"
tags: ["lead-gen","structure","taxonomy"]
related:
  - "../services_index.md"
  - "../../architecture/system-overview_Overview.md"
spotlight: |
  Canonical structure for lead-gen service families and sub-areas.
---

# Lead-Generation Services Structure
...
```

---

## Why not keep per-folder `index.md` by hand?

* They drift. You’ll forget to add/remove entries.
* The generator can **sort by title, date, or status**, apply filters, and keep it consistent.
* Humans still get **curated essays** (landing pages) and **automatic lists** (indexes).

---

## What changes in your current tree?

* Rename “floating” files to follow the **filename convention**.
* Add the **Doc Header** everywhere (including `.txt` tree snapshots).
* Move long lists out of hand-written “index” docs; keep curated overviews only.
* Add the **docs generator** and wire `precommit:docs`.

---

## FAQ

**Q: Can we keep a single master index like `services_index.md`?**
A: Yes, as a **curated landing**. The generator is still the catalog. Your curated page should link to `_generated/.../index.md`.

**Q: Where do we put cross-domain link maps?**
A: Use the `related` array in headers across docs. The generator surfaces cross-links in both directions.

**Q: Do we need MDX for docs?**
A: Only if you want JSX/shortcodes. Otherwise `.md` is simpler and compiles faster.

---

## Quick start (today)

1. Add the **Doc Header** to existing docs.
2. Add `scripts/docs/build-docs-index.ts` + `scripts/docs/validate-docs.ts` (tiny scanner using `gray-matter` + `globby`).
3. `npm run docs:build-index` → commit `_generated/sitemap.md` **OR** gitignore generated outputs and run in CI to publish to your team wiki.

---

This hybrid approach gives you:

* **Front-matter as the single source of truth**,
* **Generated indexes** that never drift, and
* **Curated landings** where humans tell the story.
