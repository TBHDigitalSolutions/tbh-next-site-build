---
title: "Project Documents Handbook"
domain: "project"
file: "project-documents_Handbook_2025-09-21.md"
main: "project-documents"
qualifier: "Handbook"
date: "2025-09-21"
status: "Approved"
owners: ["@conor"]
tags: ["docs","standards","indexing"]
links:
  related:
    - "./documents-indexing-linking_Standard_2025-09-21.md"
    - "./documents-directory_RefactorPlan_2025-09-21.md"
---

**Official Title:** Project Documents Handbook  
**Domain:** project  
**File Name:** project-documents_Handbook_2025-09-21.md  
**Main Part:** project-documents  
**Qualifier:** Handbook  
**Date:** 2025-09-21  

**Spotlight Comments:**  
- Canonical rules for structure, naming, headers, and cross-linking  
- Basis for docs validation and generated indexes  
- Pairs with the Indexing & Linking Standard

**Summary:**  
This handbook defines our documentation operating model: folder roles, filename conventions, required headers, linking rules, lifecycle and status. It is the **single source of truth** for authors and reviewers.

## See also
- [Indexing & Linking Standard](./documents-indexing-linking_Standard_2025-09-21.md)
- [Refactor Plan & Ideal Structure](./documents-directory_RefactorPlan_2025-09-21.md)

---

# Project Documents Handbook

*Guide to structure, naming, headers, and cross-linking*

This handbook defines how we organize everything under `/documents/**`: project rules, global policies, domain-specific guides, playbooks, and knowledge notes. It makes docs easy to find, parse, and evolve over time.

---

## 1) Goals & principles

* **Findable:** predictable directory tree + consistent filenames.
* **Scannable:** every doc begins with the same header fields.
* **Linkable:** short, stable URLs (relative links within `/documents`).
* **Typed:** clear domains (packages, services, portfolio, search, etc.).
* **Versionable:** date-stamped filenames when content is time-bound.
* **Composable:** cross-refs between related docs are first-class, not ad-hoc.

---

## 2) Where docs live, and what goes where

```
/documents
  /architecture       # system diagrams, app router notes, terminology
  /authoring          # content/copy frameworks, templates, worksheets
  /company-information
  /content            # content system guides, per-service content structure
  /css                # style tokens, CSS architecture notes
  /data               # data modeling, schemas, JSON/TS data guides
  /domains            # domain handbooks (packages, portfolio, search, etc.)
  /knowledge          # general knowledge, research, comparisons
  /meta               # docs-on-docs (contributing, linting, roadmap)
  /project            # project overview, enhancements, policies
  /search             # (optionally) top-level search guides if not under /domains/search
  /taxonomy           # service taxonomy, middleware, routing rules
  /tools              # small scripts, helpers, doc tooling
```

### Required file per folder

* `README.md` — a quick index of what’s inside, why it exists, and how to use it.
* Optional `_assets/` — images, diagrams, and downloadable attachments used by docs in the same folder.

> Keep docs in the **closest domain folder** (e.g., `/documents/domains/packages/**`) rather than scattering top-level. Put **global** rules in `/documents/project/**` or `/documents/architecture/**`.

---

## 3) File naming standard

**Format:**
`kebab-main_Pascal-qualifier_YYYY-MM-DD.ext`

* **kebab-main** — short, descriptive subject in kebab-case.
* **Pascal-qualifier** — one of the controlled terms below (PascalCase).
* **YYYY-MM-DD** — when the document is time-bound (plans, reviews, change logs). Omit for evergreen docs (guides, overviews, policies).
* **ext** — usually `md` (prefer Markdown for docs).

**Examples**

* `service-taxonomy_middleware-rules_2025-09-18.md`
* `packages-domain_Overview.md` (evergreen, no date)
* `portfolio-app-router_RefactorPlan_2025-09-14.md`
* `search_complete-domain_Example.md`

**Controlled qualifier list (PascalCase)**

* **Overview** — high-level narrative description.
* **Guide** — how to implement / operate.
* **Plan** — upcoming changes; time-bound.
* **Policy** — rules the team must follow.
* **Standard** — non-negotiable conventions.
* **Playbook** — repeatable steps for a scenario.
* **Worksheet** — prompts or fill-ins.
* **Example** — canonical example / sample.
* **Review** — analysis or findings.
* **Template** — copy-paste boilerplate to start from.
* **Checklist** — yes/no list to validate readiness.
* **Spec** — detailed specification.
* **Notes** — looser collection of findings (avoid for long-term docs).

> Tip: If you’re unsure, default to **Overview** or **Guide**.

---

## 4) Document header (required)

Every doc begins with a **visible header block** using the fields below. (We also include optional YAML frontmatter to make automated indexing possible.)

### 4.1 Visible header block (copy this)

```
**Official Title:** <Full, formal title here>  
**Domain:** <packages | services | portfolio | search | architecture | project | content | data | taxonomy | company | css | tools | meta>  
**File Name:** <kebab-main_Pascal-qualifier_YYYY-MM-DD.md>  
**Main Part:** <kebab-case subject>  
**Qualifier:** <PascalCase term>  
**Date:** <YYYY-MM-DD or 'Evergreen'>  

**Spotlight Comments:**  
- <1–3 short bullets of context/status/cross-refs>

**Summary:**  
<1–2 short paragraphs describing what this doc covers and how it’s used.>
```

### 4.2 Optional YAML frontmatter (machine-readable)

```yaml
---
title: "Full, formal title"
domain: "packages"
file: "kebab-main_Pascal-qualifier_2025-09-18.md"
main: "kebab-main"
qualifier: "Guide"
date: "2025-09-18"
status: "Approved"      # Draft | InReview | Approved | Deprecated
owners:
  - "@conor"            # GitHub handles or Slack IDs are fine
links:
  supersedes: ""        # path to prior doc if any
  related:
    - "../taxonomy/services-taxonomy_middleware-rules_2025-09-18.md"
tags:
  - "routing"
  - "packages"
---
```

> Keep the visible header; the frontmatter is optional but recommended for automation.

---

## 5) Linking rules

* **Use relative links** within `/documents/**`.

  * ✅ `[Packages Overview](../domains/packages/README.md)`
  * ✅ `[Taxonomy Plan](../taxonomy/services-taxonomy-simplification_Plan.md)`
* **Cross-reference section anchors** for deep links:

  * `[See "Validation Rules"](#validation-rules)`
* **Images & attachments**: store in `_assets/` beside the doc and use relative paths:

  * `![](_assets/packages-overview-diagram.png)`
* **Backlinks**: add a **“Related”** section at the bottom with links to upstream/downstream docs.

---

## 6) Organization & storage rules

* **One topic, one doc.** Don’t mix unrelated concerns. Split large documents.
* **Evergreen vs dated**:

  * **Evergreen** (e.g., policies/standards/overviews): no date in the filename.
  * **Dated** (plans/reviews/change logs): include the date.
* **Superseding**: when a doc replaces an older one:

  * Update frontmatter `links.supersedes` on the **new** doc.
  * Add a **Deprecated** banner at the top of the **old** doc and link to the new one.
* **README.md** at each folder root lists:

  * Purpose of the folder
  * Index of key docs (grouped by qualifier)
  * Pointers to related folders
* **Keep prose in docs;** keep structured data in `src/data/**`; don’t duplicate prices/IDs/specs in docs.

---

## 7) Status & lifecycle

Add `status` in frontmatter and an optional badge at the top:

* `Draft` — working doc; may change frequently.
* `InReview` — ready for peer review.
* `Approved` — official; link from READMEs.
* `Deprecated` — replaced; keep for historical context.

*Optional visual badge (first line):*

```
> **Status:** ✅ Approved · **Owner:** @conor · **Last updated:** 2025-09-18
```

---

## 8) Doc types & where to put them (examples)

* **Global policies/standards:** `/documents/project/policies/**`
* **Architecture decisions:** `/documents/architecture/**`
* **Domain handbooks:**

  * Packages: `/documents/domains/packages/**`
  * Portfolio: `/documents/domains/portfolio/**`
  * Search: `/documents/domains/search/**`
* **Data modeling:** `/documents/data/**` (schemas, validation, SSOT)
* **Content authoring:** `/documents/authoring/**` (frameworks, templates)
* **Taxonomy & routing:** `/documents/taxonomy/**`

---

## 9) Assets & diagrams

* Keep images/diagrams next to the doc in `_assets/`.
* File naming: `kebab-subject_descriptor.ext`

  * `packages-overview_diagram-v1.png`
  * `middleware-flowchart_v2.svg`
* Prefer **SVG** for diagrams (diffable, crisp) or **PNG** for screenshots.

---

## 10) Document templates

### 10.1 New doc skeleton

```md
**Official Title:** <Title here>  
**Domain:** <pick from list>  
**File Name:** <kebab-main_Pascal-qualifier_YYYY-MM-DD.md>  
**Main Part:** <kebab-main>  
**Qualifier:** <Qualifier>  
**Date:** <YYYY-MM-DD or 'Evergreen'>  

**Spotlight Comments:**  
- <context/status/refs>

**Summary:**  
<1–2 paragraphs>

---

## Context
<Why this exists. Problem statement. Constraints.>

## Rules / Decisions
<Numbered list of decisions or rules.>

## Examples
<Code/config examples if applicable.>

## Validation / Checklist
- [ ] item
- [ ] item

## Related
- [Upstream doc](../path/to/doc.md)
- [Downstream doc](../path/to/doc.md)
```

### 10.2 README template (per folder)

```md
# Folder: <name>

**Purpose**  
<What belongs here, who uses it, how to contribute.>

## Index
- **Overviews**
  - [Doc A](./doc-a_Overview.md)
- **Guides**
  - [Doc B](./doc-b_Guide.md)
- **Plans**
  - [Doc C](./doc-c_Plan_2025-09-18.md)

## Related Folders
- [../architecture](../architecture/README.md)
- [../project](../project/README.md)
```

---

## 11) MD vs MDX in `/documents`

* Default to **Markdown (`.md`)** for docs. It’s simpler and universally renderable.
* Use **MDX (`.mdx`)** only if you **must embed interactive React components** (rare for internal docs).
* If you adopt MDX in `/documents`, keep components **pure-presentational** (no network calls, no private keys).

---

## 12) Quality & tooling

* **Linting:** enable `markdownlint` or Prettier MD plugin (optional).
* **Link checks:** run periodic dead-link checks (optional script).
* **Reviews:** treat **Approved** docs like code—PR + review + owner sign-off.
* **Changelogs:** for policies/standards, append a `## Changelog` section.

---

## 13) Examples from the current tree (normalized)

Some of your existing docs can be renamed for consistency:

* `3-card-package-display_guide.md` ✅ already good.
* `global-packages_hub_overview.md` ✅ already good.
* `integrated-growth-packages_MultiServiceBundles` → `integrated-growth-packages_MultiServiceBundles_Overview.md`
* `pricing-and-packages.md` → `pricing-and-packages_Overview.md`
* `portfolio-module-bridge-document_ProductionGuide_2025-09-13.md` ✅ good.

> You don’t have to do a mass rename now. Apply the standard for **new** docs and update older ones opportunistically.

---

## 14) Quick checklist for authors

* [ ] Pick the **right folder**.
* [ ] Name file using **kebab-main\_Pascal-qualifier\_YYYY-MM-DD.md** (omit date if evergreen).
* [ ] Start with the **visible header** (and optional YAML frontmatter).
* [ ] Add concise **Summary** and **Spotlight Comments**.
* [ ] Use **relative links** and a **Related** section.
* [ ] Include images in `_assets/` with descriptive names.
* [ ] Set **status** (Draft/InReview/Approved/Deprecated).
* [ ] Update the folder **README.md** index if this is a key doc.

---

### Appendix A — Allowed domains (canonical list)

`architecture`, `authoring`, `company`, `content`, `css`, `data`, `domains`, `knowledge`, `meta`, `project`, `search`, `taxonomy`, `tools`.

> For domain handbooks, also add the **specific domain name** in the official title and main part where helpful (e.g., `packages-domain_Overview.md`).

---

Use this handbook as the **single source of truth** for documentation across the repo. If something feels ambiguous, add a short **Policy** or **Guide** under `/documents/meta/**` so future contributors don’t guess.
