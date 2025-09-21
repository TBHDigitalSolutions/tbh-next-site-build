---
title: "Documents Directory – Refactor Plan & Ideal Structure"
domain: "project"
file: "documents-directory_RefactorPlan_2025-09-21.md"
main: "documents-directory"
qualifier: "RefactorPlan"
date: "2025-09-21"
status: "InReview"
owners: ["@conor"]
tags: ["refactor","structure","standards"]
links:
  related:
    - "./project-documents_Handbook_2025-09-21.md"
    - "./documents-indexing-linking_Standard_2025-09-21.md"
---

**Official Title:** Documents Directory – Refactor Plan & Ideal Structure  
**Domain:** project  
**File Name:** documents-directory_RefactorPlan_2025-09-21.md  
**Main Part:** documents-directory  
**Qualifier:** RefactorPlan  
**Date:** 2025-09-21  

**Spotlight Comments:**  
- Maps current → target tree; defines rename and move steps  
- Aligns with indexing standard and handbook  
- Serves as checklist for cleanup

**Summary:**  
Actionable plan to bring the `/documents/**` tree to standard: normalize filenames, add headers, create folder READMEs, and (optionally) generate per-folder indexes. Use this as the working checklist during cleanup.

## Migration checklist
- [ ] Rename three seed files to the new convention  
- [ ] Add headers (this doc shows the pattern)  
- [ ] Add `README.md` in this folder  
- [ ] (Optional) Wire generator to produce `_generated/index.json`  

---

# Documents Directory – Refactor Plan & Ideal Structure

This guide audits the **current** `/documents` layout, pinpoints issues, and prescribes an **ideal, production-ready structure** with a concrete refactor plan, naming rules, and migration steps.

---

## Goals

* **Predictable structure** per domain (packages, portfolio, search, services, etc.)
* **Consistent filenames** using `kebab-main_Pascal-qualifier_YYYY-MM-DD.md`
* **Required header block** (and optional YAML frontmatter) for every doc
* **Clean cross-links** via relative paths
* **Folder READMEs** that index key docs

---

## Quick naming recap (apply during refactor)

**File name format:** `kebab-main_Pascal-qualifier_YYYY-MM-DD.md`

* `kebab-main` → subject (kebab-case)
* `Pascal-qualifier` → one of: `Overview | Guide | Plan | Policy | Standard | Playbook | Worksheet | Example | Review | Template | Checklist | Spec | Notes`
* `YYYY-MM-DD` → include for time-bound docs (plans/reviews). Omit for evergreen (guides/overviews/policies).

**Every file begins with the visible header block** (title/domain/file/…); frontmatter is optional.

---

## Current → Issues (snapshot)

Below are representative problems seen across the posted tree (not exhaustive of 95 files):

* **Inconsistent naming**

  * Mixed separators: `web_development_packages.md`, `marketing-services_packages.md`, `marketing services …`
  * Missing qualifiers/dates on time-bound docs
  * Duplicates with minor variations (e.g., `content_production_packages.md` vs `content-production_packages.md`)
* **Mixed concerns in folders**

  * Strategy/architecture mixed with operational docs
  * “Company information / pricing and packages” overlapping domain content
* **Missing folder READMEs**

  * Several directories lack an index and folder purpose
* **No standard header block**

  * Many files do not start with the required header metadata
* **Cross-linking is ad-hoc**

  * Few docs point to upstream/downstream related material; some dead or ambiguous links likely
* **Untitled / placeholder directories**

  * e.g., `company-information/untitled folder/`
* **Case/spacing issues**

  * Spaces in filenames; mixed case conventions

---

## Refactor Plan (phased, safe, auditable)

### Phase 1 — Standards scaffolding (no file moves yet)

1. **Adopt naming + header standard** (already defined).
2. Add `/documents/meta/linting-rules_for-docs.md` and `/documents/meta/docs-contributing_guide.md` (you already have these—ensure they mention the standard).
3. Add or update **README.md** at each folder root stating purpose + index.

### Phase 2 — Controlled renames (no content changes)

1. **Normalize separators**: replace spaces/underscores with hyphens.
2. **Apply consistent qualifiers**:

   * If it describes system at a high level → `Overview`
   * How-to → `Guide`
   * Roadmap/future changes → `Plan_YYYY-MM-DD`
   * Team-wide enforcement → `Policy` or `Standard`
3. **De-duplicate**: keep the most complete doc; set `Deprecated` banner in the older duplicate and link to the winner.
4. **Fix cross-links** to new filenames (search/replace PR).

> Tip: perform renames per folder with focused PRs to keep diffs small.

### Phase 3 — Folder moves & consolidation

* Move misfiled docs to the correct domain folder (mapping below).
* Remove “untitled” dirs and replace with clear names or merge content.
* Ensure each folder has a `README.md` index listing key docs.

### Phase 4 — Add headers + backfill metadata

* Add the **visible header block** at the top of every doc.
* (Optional) Add YAML frontmatter for automation.

### Phase 5 — Automation & hygiene

* Add Prettier/markdownlint for `/documents/**`.
* (Optional) Add a GitHub Action to validate:

  * Filenames match convention
  * Required header present
  * Links resolve (basic relative link check)

---

## Current → Target mapping (representative)

Below are common examples. Apply the same pattern across similarly named docs.

| Current path/file                                                                  | Issue                     | Target path/file                                                                                                                                                     |
| ---------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `documents/domains/packages/content_production_packages.md`                        | underscore + ambiguous    | `documents/domains/packages/content-production_Packages_Overview.md`                                                                                                 |
| `documents/domains/packages/content-production_packages.md`                        | duplicate variant         | **Remove** or consolidate into the above; mark deprecated where kept                                                                                                 |
| `documents/domains/packages/marketing services packages.md`                        | spaces                    | `documents/domains/packages/marketing-services_Packages_Overview.md`                                                                                                 |
| `documents/domains/packages/integrated-growth-packages_MultiServiceBundles`        | missing ext + qualifier   | `documents/domains/packages/integrated-growth-packages_MultiServiceBundles_Overview.md`                                                                              |
| `documents/domains/packages/3-card-package-display_guide.md`                       | ok but case               | Keep; optionally `3-card-package-display_Guide.md`                                                                                                                   |
| `documents/domains/packages/client-facing-sales-sheet_IntegratedGrowthPackages.md` | unclear qualifier         | `documents/domains/packages/integrated-growth-packages_ClientSalesSheet_Guide.md`                                                                                    |
| `documents/domains/company/pricing-and-packages.md`                                | mixing company & packages | If company policy → `documents/project/policies/pricing-and-packages_Policy.md`; if product overview → `documents/domains/packages/pricing-and-packages_Overview.md` |
| `documents/domains/portfolio/current-assessment_todo.md`                           | informal + underscore     | `documents/domains/portfolio/current-assessment_Todo_Notes_YYYY-MM-DD.md` (or merge into `Review`)                                                                   |
| `documents/domains/portfolio/Current assesment and to do review and plans`         | spaces & folder misuse    | Merge into `current-assessment_Review_YYYY-MM-DD.md` and delete folder                                                                                               |
| `documents/domains/search/search_complete-domain_example.md`                       | fine                      | Keep; ensure header metadata present                                                                                                                                 |

> Repeat for `lead_generation_packages.md`, `video_production_packages.md`, `web_development_packages.md` → normalize to hyphenated service slugs and apply `Packages_Overview.md`.

---

## Ideal refactored tree (example)

> This is the **target** structure after refactor. Your actual files will map into these slots with normalized names and qualifiers. Keep only meaningful docs; remove noise.

```
/documents
  /architecture
    README.md
    app-router_OfficialGuide.md
    system-overview_Overview.md
    service-data-patterns_Overview.md
    src-tree-audit_ImprovementPlan_2025-09-18.md
    terminology_Guide.md

  /authoring
    README.md
    /copy
      service-content_two-lens-framework_Guide.md
      service-template_four-area-framework_Guide.md
      service-template_four-area-skeleton_Worksheet.md
    /knowledge
      marketing-seo-vs-web-dev-seo_Comparison.md
      service-taxonomy_leaf-children-structure_Guide.md
    /templates
      domain-implementation_Template.md
      generic-domain-structure_AuthoringTemplate.md

  /content
    README.md
    data_OfficialGuide.md
    /services-pages
      services_index_Overview.md
      /content-production
        directory-tree.txt
        structure_Overview.md
      /lead-generation
        directory-tree.txt
        structure_Overview.md
      /marketing
        directory-tree.txt
        structure_Overview.md
      /seo
        structure_Overview.md
      /video-production
        directory-tree.txt
        structure_Overview.md
      /web-development
        directory-tree.txt
        structure_Overview.md

  /data
    README.md
    /services-pages
      README.md
      /content-production-services
      /lead-generation-services
      /marketing-services
      /seo-services
        seo-services_directory-tree.txt
      /video-production-services
      /web-development-services

  /domains
    README.md

    /packages
      README.md
      global-packages-hub_Overview.md
      integrated-growth-packages_Overview.md
      integrated-growth-packages_MultiServiceBundles_Overview.md
      3-card-package-display_Guide.md
      complete-service-packages_Overview.md
      comprehensive-packages_Overview.md
      additional-addons-opportunities_Overview.md
      client-facing-sales-sheet_IntegratedGrowthPackages_Guide.md
      content-production_Packages_Overview.md
      lead-generation_Packages_Overview.md
      marketing-services_Packages_Overview.md
      seo-services_Packages_Overview.md
      video-production_Packages_Overview.md
      web-development_Packages_Overview.md

    /portfolio
      README.md
      portfolio_AppRouter_IntegrationGuide_2025-09-14.md
      portfolio_AppRouter_RefactorPlan_2025-09-14.md
      portfolio_template-parity_Review_2025-09-14.md
      portfolio_ProductionStandards_Standard.md
      portfolio_Domain_Overview.md
      portfolio_Domain_ImplementationGuide_2025-09-12.md

    /search
      README.md
      search_CompleteDomain_Example.md
      search_Implementing_Guide.md
      search_StarterBundle.md

    /services
      README.md
      information-architecture_Overview.md
      page-template-layout_IntegrationGuide.md
      data-passing_Plan.md
      rules_Policy.md
      /marketing
        qa_Guide.md
        data-integration_QAGuide.md
      /Service-Specific-Tools
        README.md
        tools_Overview.md

    /company
      README.md
      pricing-and-packages_Overview.md

  /meta
    README.md
    docs-contributing_Guide.md
    docs-roadmap.md
    linting-rules_for-docs.md

  /project
    README.md
    project-overview_Guide.md
    enhancements_Roadmap.md
    /policies
      canonical-services_global-rules_Policy.md

  /taxonomy
    README.md
    canonical-hub-slugs_EnforcementGuide.md
    services-taxonomy_MiddlewareRules_Guide.md
    services-taxonomy_Simplification_Plan.md

  /css
    README.md

  /tools
    README.md
```

**Notes**

* Dates appear only where docs are inherently time-bound (`Plan`, `Review`).
* Every folder has a `README.md` with purpose and index.
* Duplicates resolved into single normalized names; deprecated docs remain with a banner (or are removed if truly redundant).

---

## Detailed to-do list (what to refactor, redo, review)

1. **Normalize names**

   * Replace spaces/underscores with hyphens.
   * Unify service slugs: `content-production`, `lead-generation`, `marketing-services`, `seo-services`, `video-production`, `web-development`.
   * Ensure qualifiers and dates follow the standard.

2. **Resolve duplicates**

   * Keep the most complete variant; move partial content into the keeper where useful.
   * Add a `Deprecated` banner in the older file with link to the replacement (or remove entirely).

3. **Relocate misfiled content**

   * Pricing policy under `/project/policies/**` unless it’s product packaging overview (then keep under `/domains/packages/**`).
   * Company information → `/domains/company/**` or `/project/**`, not mixed with package docs.

4. **Add headers**

   * All docs get the visible header block; optional YAML frontmatter for automation.

5. **READMEs & indexes**

   * Each folder needs `README.md` with: purpose, index, related folders.

6. **Cross-link fixes**

   * Update relative links to new paths.
   * Add **Related** section at the end of key docs.

7. **Delete/rename “untitled”**

   * Remove `untitled folder/`; merge content appropriately.

8. **Quality gates**

   * Add Prettier/markdownlint for `/documents/**`.
   * (Optional) GitHub Action to enforce filename regex + header presence.

---

## Helpful automation (optional)

**Bash: normalize spaces/underscores → hyphens**

```bash
find documents -type f -name "* *" -or -name "*_*" | while read -r f; do
  dir=$(dirname "$f"); base=$(basename "$f")
  normalized=$(echo "$base" | tr '[:upper:]' '[:lower:]' | sed 's/[ _]/-/g')
  git mv "$f" "$dir/$normalized"
done
```

**Header injection (Node/ts-node sketch)**
Adds the visible header if missing; you can adapt to your needs.

```ts
// tools/add-doc-headers.ts
import fs from "node:fs"; import path from "node:path";
const root = path.resolve("documents");
function needsHeader(txt:string){ return !txt.startsWith("**Official Title:**"); }
function guessDomain(p:string){
  const parts = p.split(path.sep);
  const i = parts.indexOf("documents");
  return parts[i+1] || "meta";
}
function titleFromName(name:string){
  const base = name.replace(/\.mdx?$/,"").replace(/-/g," ");
  return base.replace(/\b\w/g, m => m.toUpperCase());
}
for (const p of fs.readdirSync(root, {withFileTypes:true})){
  // …walk recursively (left out for brevity) …
}
```

(Use a dry-run first; commit in small batches.)

---

## Migration workflow

1. **Branch**: `docs/refactor-structure-YYYYMMDD`
2. **Pass 1**: Normalize names only; update links; CI green.
3. **Pass 2**: Move files into final folders; add/refresh READMEs.
4. **Pass 3**: Add headers/frontmatter; fix remaining links.
5. **Pass 4**: Remove deprecated duplicates or mark with banner and link.
6. **Enable lint/format** and (optional) docs CI checks.

---

## What success looks like

* You can **guess any doc path** by its domain + subject, and it’s there.
* Filenames and headers let you build an **auto index** if you ever want a docs site.
* New contributors can create consistent docs by copying the **templates** without asking where things go.

If you want, I can generate the **first-pass rename/move map** as a PR plan document from your repo’s exact file listing—just share the latest `/documents` tree and I’ll produce the concrete before/after mapping.
