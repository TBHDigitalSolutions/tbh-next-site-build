**Official Title:** Documents Directory – Quick Reference Guide  
**Domain:** project  
**File Name:** documents-directory_QuickReferenceGuide_2025-09-22.md  
**Main Part:** documents-directory  
**Qualifier:** QuickReferenceGuide  
**Date:** 2025-09-22  

**Spotlight Comments:**  
- Unified quick-reference from handbook, indexing standard, refactor plan, and build spec  
- Compact checklist for contributors  
- Centralized entry point for `/documents` practices

**Summary:**  
This quick-reference guide consolidates the **Project Documents Handbook**, **Indexing & Linking Standard**, **Refactor Plan**, and **Generated Index Build Spec** into one concise, prompt-style operational reference. It ensures that documentation is consistently authored, structured, and indexed across the `/documents/**` tree.

---

# 📘 Documents Directory – Quick Reference Guide

## 1. Goals & Principles

* **Findable** → predictable directory tree, curated READMEs.
* **Scannable** → every doc starts with a required header.
* **Linkable** → relative links + cross-references in headers.
* **Typed** → clear domain placement (packages, services, project, etc.).
* **Versionable** → use dates for time-bound docs.
* **Composable** → machine-generated indexes prevent drift.

---

## 2. Folder Structure

Top-level domains under `/documents` include:

`architecture`, `authoring`, `company`, `content`, `css`, `data`, `domains`, `knowledge`, `meta`, `project`, `search`, `taxonomy`, `tools`.

**Every folder must include:**

* `README.md` → human overview, purpose, short curated links.
* (Optional) `_assets/` → images or attachments.
* (Optional) curated landings (e.g., `services_index.md`).

Generated outputs go in `_generated/` subfolders.

---

## 3. File Naming Standard

**Format:**

```
kebab-main_Pascal-qualifier_YYYY-MM-DD.md
```

* `kebab-main` → subject (`content-production`, `search-indexing`).
* `Pascal-qualifier` → controlled list: `Overview`, `Guide`, `Plan`, `Policy`, `Standard`, `Playbook`, `Worksheet`, `Example`, `Review`, `Template`, `Checklist`, `Spec`, `Notes`.
* `YYYY-MM-DD` → required for time-bound docs (omit for evergreen).
* Extension → `.md` preferred, `.mdx` only if embedding React.

Examples:

* `portfolio-app-router_RefactorPlan_2025-09-14.md`
* `packages-domain_Overview.md`

---

## 4. Required Document Header

Every file begins with a **visible header block** (front-matter optional but recommended).

**Visible block (copy-paste):**

```md
**Official Title:** <Full Title>  
**Domain:** <project|packages|services|etc.>  
**File Name:** <kebab-main_Pascal-qualifier_YYYY-MM-DD.md>  
**Main Part:** <kebab-main>  
**Qualifier:** <Qualifier>  
**Date:** <YYYY-MM-DD or Evergreen>  

**Spotlight Comments:**  
- <1–3 bullets of context>

**Summary:**  
<1–2 paragraphs explaining purpose & usage>
```

Optional YAML front-matter mirrors these fields for automation.

---

## 5. Indexing & Linking Rules

* **Front-matter = source of truth**.
* **Indexes are generated** (`_generated/index.json` + `_generated/index.md`), never hand-maintained.
* **Folder `README.md`** = curated overview, not a full list.
* **Cross-links**:

  * Use relative paths (`../sibling/doc.md`).
  * Populate `related`, `supersedes`, `supersededBy` in headers.
  * Add optional “See also” sections inside body.

---

## 6. Generated Index Specification

Each subfolder provides `_generated/index.json` with schema:

```json
{
  "version": 1,
  "generatedAt": "ISO-8601 timestamp",
  "root": "/documents/<subdir>",
  "docs": [
    {
      "path": "./file.md",
      "file": "file.md",
      "title": "Human title",
      "domain": "project",
      "main": "kebab-main",
      "qualifier": "Guide",
      "date": "2025-09-21",
      "status": "Approved",
      "owners": ["@conor"],
      "tags": ["docs","indexing"],
      "links": { "related": ["../other.md"] },
      "spotlight": "short notes",
      "summary": "1–2 sentences"
    }
  ]
}
```

**Rules:**

* Headers win; filename is fallback.
* `date="Evergreen"` for `README.md`.
* Validate required fields + relative links.
* Commit `_generated/index.json` OR gitignore & regenerate in CI (pick one approach).

---

## 7. Refactor & Migration Workflow

From the Refactor Plan:

**Phase 1 – Standards scaffolding**

* Add headers, README.md in each folder.
* Create `meta/linting-rules_for-docs.md` & `meta/docs-contributing_Guide.md`.

**Phase 2 – Controlled renames**

* Normalize separators → `-`.
* Apply correct qualifiers.
* Deduplicate → keep canonical file, mark old as `Deprecated`.
* Fix cross-links.

**Phase 3 – Folder moves**

* Consolidate misplaced docs into correct domains.
* Remove/rename “untitled” folders.

**Phase 4 – Header backfill**

* Add required header block to all docs.

**Phase 5 – Automation & hygiene**

* Prettier/markdownlint.
* Optional GitHub Action to check filenames, headers, links.

---

## 8. Status & Lifecycle

* `Draft` → working, unstable.
* `InReview` → open for peer feedback.
* `Approved` → official reference.
* `Deprecated` → replaced but kept for history.

Mark old docs with **Deprecated banner** + link forward.

---

## 9. Author Checklist

Before committing a new or updated doc:

* [ ] Correct folder placement.
* [ ] File named with **kebab-main_Pascal-qualifier_YYYY-MM-DD.md**.
* [ ] Header block filled out.
* [ ] Concise **Summary** + **Spotlight**.
* [ ] Relative links only.
* [ ] Add to folder `README.md` if key doc.
* [ ] Status + owner set.
* [ ] Images in `_assets/` with descriptive names.

---

## 10. Success Criteria

* Any contributor can **predict doc path** by name/domain.
* Docs are **auto-indexed** and never drift.
* Every folder has a purpose & README.
* Duplicates are resolved or deprecated.
* Standards are enforceable via tooling.

---

## Related (Master References)
- [Project Documents Handbook](./project-documents_Handbook_2025-09-21.md)
- [Documents Indexing & Linking Standard](./documents-indexing-linking_Standard_2025-09-21.md)
- [Documents Directory – Refactor Plan & Ideal Structure](./documents-directory_RefactorPlan_2025-09-21.md)
- [Generated Index JSON – Build Specification & Usage Guide](./generated-index_BuildSpec_2025-09-21.md)

---

✅ Use this as your **canonical quick guide** when writing, updating, or cleaning up `/documents/**`. It distills the full handbook, standards, refactor plan, and build spec into one operational reference.

