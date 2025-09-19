# README.md (for `/scripts`)

> Place this file at: `/scripts/README.md`

## Overview

This folder contains **TypeScript CLIs** for data quality, migrations, and maintenance. They run with [`tsx`](https://github.com/esbuild-kit/tsx), share a common logger, and exit non-zero on problems so you can wire them into CI safely.

### Directory layout

```
/scripts
├── _shared/                     # Reusable helpers for all CLIs
│   └── logger.ts                # Consistent logging + --verbose/--quiet flags
├── packages/                    # All “Packages” domain checks
│   ├── check-featured-refs.ts   # Cross-ref integrity for `featured` lists
│   └── validate-packages.ts     # Schema + consistency validation
├── portfolio/                   # All “Portfolio/Case Studies” domain tools
│   ├── check-portfolio-health.ts# Non-schema sanity checks (orphans, media)
│   ├── fix-portfolio-data.ts    # Safe auto-fixes (supports --dry-run)
│   ├── migrate-portfolio.ts     # Versioned migrations (supports --dry-run)
│   ├── portfolio-stats.ts       # Metrics/coverage for dashboards
│   └── validate-portfolio.ts    # Strict schema validation
├── services/
│   └── validate-services-pages.ts # Validates `src/data/page/services-pages/**`
└── taxonomy/
    └── validate-taxonomy.ts     # Single source-of-truth checks for services tree
```

### What belongs in each folder?

* **`_shared/`**: tiny utilities used by multiple CLIs (logging, path helpers, file IO, JSON read/write, slug utilities). No domain logic here.
* **`packages/`**: scripts that read/validate the **Packages** data models and any cross-references they expose (e.g., “featured”, bundles).
* **`portfolio/`**: scripts that operate on **Portfolio/Case Studies** data and assets (validation, health, fixing, migration, stats).
* **`services/`**: scripts that validate **Services pages** data files vs taxonomy (slugs, required sections, shared fragments).
* **`taxonomy/`**: scripts that validate the **services taxonomy** (the tree that powers `/services/...`) and any generated outputs.

> Rule of thumb: if a script needs to know about **hubs/services/subservices**, it lives under `taxonomy/` or `services/` depending on whether it validates the tree itself or the page data built on top of it.

---

## Per-script reference

### `_shared/logger.ts`

* **Purpose**: consistent, leveled logging (`info`, `warn`, `error`, `debug`).
* **Flags**: `--verbose` enables debug; `--quiet` suppresses info.
* **Used by**: all CLIs.

---

### `packages/validate-packages.ts`

* **What it checks**: Zod schema, slugs, currencies/price format, internal consistency.
* **Use when**: you edit any package files/schemas.
* **Run**:

  ```bash
  npm run validate:packages
  ```
* **Outputs**: human or `--json`. Exit `1` on validation errors.

### `packages/check-featured-refs.ts`

* **What it checks**: that `featured`/cross-refs point to real package IDs/items; hub/service slugs align with taxonomy.
* **Use when**: you change `featured` lists, rename slugs, or add/remove packages.
* **Run**:

  ```bash
  npm run check:packages:featured
  ```

---

### `portfolio/validate-portfolio.ts`

* **What it checks**: strict schema for every portfolio item.
* **Use when**: any portfolio content/schema changes.
* **Run**:

  ```bash
  npm run validate:portfolio          # normal
  npm run validate:portfolio:quick    # faster pass (CI-friendly)
  npm run validate:portfolio:verbose
  npm run validate:portfolio:json
  ```

### `portfolio/check-portfolio-health.ts`

* **What it checks**: non-schema drift—orphans, missing media, inconsistent tags, broken cross-links.
* **Use when**: routine hygiene; before releases.
* **Run**:

  ```bash
  npm run health:portfolio
  npm run health:portfolio:ping   # lightweight ping (fast)
  npm run health:portfolio:json
  ```

### `portfolio/portfolio-stats.ts`

* **What it does**: counts & coverage by hub/service; category breakdowns; exportable metrics.
* **Use when**: planning backlog, reporting, dashboards.
* **Run**:

  ```bash
  npm run stats:portfolio
  npm run stats:portfolio:verbose
  npm run stats:portfolio:json
  npm run stats:portfolio:category --category=web-development
  ```

### `portfolio/fix-portfolio-data.ts`

* **What it does**: safe auto-fixes (slug normalization, sort keys, small field migrations).
* **Use when**: validation flags easy-to-fix issues.
* **Run**:

  ```bash
  npm run fix:portfolio:dry   # preview changes only
  npm run fix:portfolio       # apply fixes
  npm run fix:portfolio:verbose
  npm run fix:portfolio:json
  ```

### `portfolio/migrate-portfolio.ts`

* **What it does**: versioned migrations between schema versions (with backups).
* **Use when**: you change schema or field layouts across many items.
* **Run**:

  ```bash
  npm run migrate:portfolio:dry
  npm run migrate:portfolio
  npm run migrate:portfolio:verbose
  npm run migrate:portfolio:json
  ```

---

### `taxonomy/validate-taxonomy.ts`

* **What it checks**: the **services tree** (canonical hubs/services/subservices) is valid, has required fields, and matches reserved naming rules; confirms sync with middleware expectations where applicable.
* **Use when**: updating `src/data/taxonomy/servicesTree.ts` or related helpers.
* **Run**:

  ```bash
  npm run validate:taxonomy
  ```

### `services/validate-services-pages.ts`

* **What it checks**: `src/data/page/services-pages/**` matches taxonomy slugs and per-page schema (required sections, shared fragments).
* **Use when**: editing services page data or adding new services.
* **Run**:

  ```bash
  npm run validate:services-pages
  ```

---

## Common workflows & cadence

* **Daily / before feature work**

  ```bash
  npm run data:quick-check
  ```

  (packages, portfolio quick, health ping, taxonomy, services pages)

* **Before commit**

  ```bash
  npm run precommit:portfolio
  ```

  Or replace with `data:quick-check` if you want the broader set.

* **Before pushing / merging PR**

  ```bash
  npm run verify:public   # /public mirrors data strictly (with prune in dry-run)
  npm run data:ci         # CI gate: mirror verify + all key validators
  ```

* **Weekly maintenance**

  ```bash
  npm run portfolio:maintenance       # fix (dry) + validate
  npm run mirror:public:prune:dry     # preview deletions
  npm run mirror:public:prune         # apply deletions safely
  ```

* **When schemas change**

  ```bash
  npm run migrate:portfolio:dry
  npm run migrate:portfolio
  npm run validate:*
  npm run verify:public
  ```

### Exit codes (all CLIs)

* `0` success
* `1` validation failed (actionable issues)
* `2` unexpected runtime error (I/O, parse, crash)

---

## Convenience npm scripts (already wired)

```bash
# fast local safety net
npm run data:quick-check

# strict CI gate
npm run data:ci

# portfolio bundles
npm run portfolio:full-check
npm run portfolio:quick-check
npm run portfolio:deep-analysis
npm run portfolio:maintenance
```

---

# Document: Enhancing & Extending the Scripts

## Goals

* Keep all CLIs **type-safe**, **fast**, and **predictable**.
* Minimize duplication by sharing helpers and importing canonical types/schemas from `src/**`.
* Make it trivial to add a new domain validator.

## Standards to keep

1. **Flags**:
   Every new script should support:

* `--verbose` / `--quiet`
* `--json` (for machine output)
* `--dry-run` where it can mutate

2. **Exit codes**:

* `0` success
* `1` validation failures
* `2` unexpected error

3. **Logging**:

* Use `scripts/_shared/logger.ts` for all output.

4. **Types/Schemas**:

* Import from `src/types/**` and `src/lib/**` (schemas, selectors).
* Don’t duplicate schemas inside `/scripts`.

5. **File IO**:

* Use shared helpers (consider adding `fs.ts`, `paths.ts` in `_shared/`) to resolve `src/` and `public/` consistently.

---

## New scripts to add (recommended)

### 1) Links validator (optional polish)

**File**: `scripts/content/validate-links.ts`
**What**: Scan markdown/JSON blobs across `src/data/**` for internal links and validate:

* References to `/services/{hub}/{service}/{sub?}` match the taxonomy.
* Image/media paths exist in `/public/**`.

**Add to `package.json`:**

```json
"validate:links": "tsx scripts/content/validate-links.ts"
```

### 2) Assets usage audit (optional polish)

**File**: `scripts/assets/validate-usage.ts`
**What**: Graph of assets under `/public/**` → reports unreferenced files (beyond what `verify:public` covers).
**Add to `package.json`:**

```json
"validate:assets": "tsx scripts/assets/validate-usage.ts"
```

### 3) Taxonomy → generated slugs (DX helper)

**File**: `scripts/taxonomy/export-slugs.ts`
**What**: Emit `.generated/taxonomy-slugs.json` with canonical hub/service/sub slugs for use by middleware/pages/tools without importing TS.
**Add to `package.json`:**

```json
"taxonomy:export-slugs": "tsx scripts/taxonomy/export-slugs.ts"
```

**Run it** before build or as part of `postinstall` if desired.

### 4) Services-page scaffolder (DX helper)

**File**: `scripts/services/scaffold-service-page.ts`
**What**: Given `--hub` and `--service` (and optional `--sub`), scaffold a new `src/data/page/services-pages/.../index.ts` from a template and prefill required blocks.
**Add to `package.json`:**

```json
"scaffold:service-page": "tsx scripts/services/scaffold-service-page.ts"
```

### 5) Portfolio media normalizer (safe helper)

**File**: `scripts/portfolio/normalize-media.ts`
**What**: Move/rename media files to canonical paths based on item slug; update references in data. Always supports `--dry-run`.
**Add to `package.json`:**

```json
"portfolio:normalize-media": "tsx scripts/portfolio/normalize-media.ts"
```

---

Lint script: `scripts/services/lint-services-seo.ts`

**What it does**

* Walks `src/data/taxonomy/servicesTree.ts` (your single source of truth).
* For each node:

  * Computes the **expected** H1 and `<title>` per rules above.
  * Loads service page data modules under `src/data/page/services-pages/**/index.ts` (your existing data store for services pages).
  * Compares the exported `meta.title` and `hero.content.title` (H1) to the expected values.
* Prints a concise report and exits **1** on mismatches (CI-friendly).
* Flags missing pages for any taxonomy node.

> Assumptions (tweak if your shape differs):
>
> * Each page data module exports:
>
>   ```ts
>   export const meta = { title: string, description?: string }
>   export const hero = { content: { title: string } }
>   ```
> * Page data locations:
>
>   * L2 hub:   `src/data/page/services-pages/{hub-slug}/index.ts`
>   * L3:       `src/data/page/services-pages/{hub-slug}/{service-slug}/index.ts`
>   * L4:       `src/data/page/services-pages/{hub-slug}/{service-slug}/{sub-slug}/index.ts`
### Run it

```bash
npm run lint:services:seo
```

* **Pass:** `✅ Services SEO lint passed…`
* **Fail:** Detailed mismatches and a non-zero exit code (great for CI).

## Notes / tweaks you might want

* **Brand name:** change `BRAND = "Company"` at the top of the script.
* **Data shape:** if your service pages export different keys, tweak the `PageModule` type and the property lookups for `meta.title` and `hero.content.title`.
* **Locations:** if L2 hub pages live elsewhere (e.g., `src/data/page/services-pages/marketing-services/index.ts`), you’re covered; the script already expects that for hubs.
* **Future-proofing:** you could also validate `meta.description` length and presence of `BreadcrumbList` JSON-LD in the same script—happy to extend it if you want.
---
---

## 2) Quick wins — improvements to existing scripts

These are light, high-ROI tweaks you can make once and benefit forever.

1. **Standardize CLI UX**

   * Ensure every script supports:

     * `--json` (machine output), `--verbose` (extra logs), and `--quiet` (errors only).
     * `--fix` / `--dry-run` consistently where it makes sense (fixers/migrations).
   * Exit codes:

     * `0` = success/no issues
     * `1` = validation error(s) / failed checks
     * `2` = unexpected crash (uncaught exception)

2. **Consistent logging**

   * Use a tiny shared logger (`scripts/_shared/logger.ts`) with levels (`info`, `warn`, `error`, `debug` gated by `--verbose`).

3. **Shared helpers (single source of truth)**

   * Move common primitives to `scripts/_shared` (or reuse `src/lib` where appropriate):

     * `loadServicesTree()` (from `src/data/taxonomy/servicesTree.ts`)
     * `validateSlug()`, `normalizeSlug()`
     * `resolvePublicPath()` and media path helpers
   * This avoids duplication and prevents drift.

4. **Type imports from `src/types`**

   * Keep types central (`src/types/servicesTaxonomy.types.ts`, etc.), and import types into scripts to catch breakage early.

5. **Performance**

   * For larger data sets, add **parallel reads** (Node worker threads not required—just `Promise.all` carefully) and **glob caching** to reduce IO.

6. **Guardrails**

   * When applying **fixes** or **migrations**, always:

     * Print a **diff summary** (files changed, added, deleted).
     * Write a **timestamped backup** (e.g., `scripts/_backups/portfolio-YYYYMMDD-HHmm/`).
     * Respect `--dry-run` first.

---

## 3) Additions — small scripts that close real gaps

Based on the rest of your project (middleware + taxonomy + app router), these will pay off:

### A) Taxonomy integrity (high value)

* `taxonomy/validate-taxonomy.ts`
  **Why:** You currently have taxonomy in multiple places (`src/data/taxonomy/servicesTree.ts` and helpers in `src/lib/services`). Validate that:

  * All **canonical slugs** match the middleware’s expectations (or a canonical list exported from lib).
  * No reserved slugs are used (e.g., `"packages"` at subservice level).
  * Every node has the minimal fields required by templates (e.g., `hero.content.title`).

* **When to run:** pre-commit + CI.

* `taxonomy/export-slugs.ts` (optional)
  **Why:** Generate a **single JSON file** with canonical hubs/services/subservices (e.g., `.generated/taxonomy-slugs.json`) so middleware/pages/scripts can consume it without re-importing TS code.

* **When to run:** as part of build or prebuild.

### B) Services pages data validation (medium value)

* `services/validate-services-pages.ts`
  **Why:** Validate `src/data/page/services-pages/**` against `src/lib/schemas/servicesPage.zod.ts` and ensure slugs align with taxonomy/hubs/services.
* **When to run:** CI + before releases.

### C) Case studies & testimonials cross-domain checks (medium value)

* `content/validate-case-studies.ts` and `content/validate-testimonials.ts` (or combine into one)
  **Why:** Make sure each case/testimonial references valid hubs/services/subservices; surface missing assets; ensure consistent author/company fields.
* **When to run:** CI + weekly maintenance.

*(You can implement these as thin wrappers that reuse your existing **portfolio** validators and shared taxonomy helpers.)*

---

## 4) Final “when to run” guide

### Per change (local dev)

* **You touched portfolio data**
  `npm run validate:portfolio` → `npm run health:portfolio`
  If needed: `npm run fix:portfolio:dry` then `npm run fix:portfolio`.

* **You touched packages**
  Add `scripts`:

  ```json
  "validate:packages": "tsx scripts/packages/validate-packages.ts",
  "check:packages:featured": "tsx scripts/packages/check-featured-refs.ts"
  ```

  Then run:
  `npm run validate:packages && npm run check:packages:featured`

* **You changed taxonomy/services tree**
  (after you add the new script)
  `tsx scripts/taxonomy/validate-taxonomy.ts`

* **You changed services pages data**
  (after you add the new script)
  `tsx scripts/services/validate-services-pages.ts`

### Pre-commit (fast checks)

* Portfolio quick:
  `npm run validate:portfolio:quick && npm run health:portfolio:ping`
* Packages quick:
  `npm run validate:packages`
* Taxonomy quick:
  `tsx scripts/taxonomy/validate-taxonomy.ts`

*(Bundle those in a single npm script if you like, e.g., `precommit:data`.)*

### CI (authoritative)

* **Build gate** (already present):

  * `npm run build:validate` (quick portfolio)
* **Recommended CI job**:

  ```bash
  npm run verify:public               # strict mirror check
  npm run validate:packages
  npm run check:packages:featured
  npm run validate:portfolio:quick
  npm run health:portfolio:ping
  tsx scripts/taxonomy/validate-taxonomy.ts
  tsx scripts/services/validate-services-pages.ts
  ```

  If any fail → non-zero exit → block merge.

### Scheduled maintenance (weekly or bi-weekly)

* **Deep portfolio analysis**:

  * `npm run portfolio:deep-analysis`
    (verbose validation + stats)
* **Auto-fix dry run**:

  * `npm run fix:portfolio:dry`
* **Case studies/testimonials validator** (new):

  * `tsx scripts/content/validate-cts.ts --json` (example)

---

## 5) “Done definition” for the scripts directory

* All CLIs support `--json` / `--verbose` / standard exit codes.
* Shared utilities live in `scripts/_shared` (or reuse `src/lib/**`).
* New validators exist for **taxonomy** and **services pages**.
* `package.json` has convenience scripts for the new CLIs.
* CI runs **verify\:public**, **packages**, **portfolio quick**, **taxonomy**, **services pages**.
* Optional: nightly/weekly workflow runs deep stats and dry-run fixers.

---

## 6) Suggested npm scripts to add

```json
{
  "scripts": {
    // --- taxonomy ---
    "validate:taxonomy": "tsx scripts/taxonomy/validate-taxonomy.ts",

    // --- services pages data ---
    "validate:services-pages": "tsx scripts/services/validate-services-pages.ts",

    // --- packages (you already have underlying files) ---
    "validate:packages": "tsx scripts/packages/validate-packages.ts",
    "check:packages:featured": "tsx scripts/packages/check-featured-refs.ts",

    // --- combined quick data check (great for precommit) ---
    "data:quick-check": "npm run validate:packages && npm run check:packages:featured && npm run validate:portfolio:quick && npm run health:portfolio:ping && npm run validate:taxonomy && npm run validate:services-pages",

    // --- CI consolidated (authoritative) ---
    "data:ci": "npm run verify:public && npm run validate:packages && npm run check:packages:featured && npm run validate:portfolio:quick && npm run health:portfolio:ping && npm run validate:taxonomy && npm run validate:services-pages"
  }
}
```

---

## 7) Frequency & reasoning (cheat sheet)

* **Every edit**: run the domain validator(s) you touched.
* **Before commit**: `data:quick-check` (fast and broad).
* **CI**: `data:ci` (strict and blocking).
* **Weekly**: `portfolio:deep-analysis` and `fix:portfolio:dry` to plan content cleanup.
* **Before large refactors/migrations**: run validators + `migrate-portfolio.ts` with `--dry-run` first; commit backups.

---

# Phase 1 Foundation Scripts

This document covers the three new production-ready scripts that complete your Phase 1 foundation implementation.

## Overview

These scripts fill the remaining gaps in your Phase 1 foundation:

1. **`scripts/taxonomy/export-slugs.ts`** - Lightweight taxonomy export for middleware
2. **`scripts/routing/validate-middleware.ts`** - Comprehensive middleware validation
3. **`scripts/services/scaffold-service-page.ts`** - Service page template generator

## Scripts Documentation

### 1. Export Taxonomy Slugs (`scripts/taxonomy/export-slugs.ts`)

**Purpose**: Generate `.generated/taxonomy-slugs.json` for lightweight consumption by middleware and other tools without importing the full TypeScript taxonomy.

**Key Features**:
- Full and minimal export formats
- Validation of slug uniqueness and canonical format  
- Middleware-ready data structures
- Path mapping and hierarchy information
- Reserved slug checking

**Usage**:
```bash
# Generate full export (default)
npm run taxonomy:export-slugs

# Generate minimal export (smaller file)
npm run taxonomy:export-slugs:minimal

# Custom output path
tsx scripts/taxonomy/export-slugs.ts --output=custom-path.json

# Dry run with verbose output
tsx scripts/taxonomy/export-slugs.ts --verbose --json
```

**Output Structure** (full format):
```json
{
  "meta": {
    "generated": "2025-01-XX...",
    "totalHubs": 6,
    "totalServices": XX,
    "totalSubservices": XX
  },
  "canonical": {
    "hubs": ["web-development-services", "..."],
    "hubsSet": { "web-development-services": true }
  },
  "hierarchy": {
    "web-development-services": {
      "services": ["website", "ecommerce", "applications"],
      "subservices": {
        "website": ["cms", "forms", "analytics"]
      }
    }
  },
  "middleware": {
    "canonicalHubs": ["web-development-services", "..."],
    "matchers": ["/services/:path*", "/web-development-services/:path*"]
  }
}
```

**Integration**: The generated file can be imported by middleware to avoid bundling the full taxonomy:
```javascript
// In middleware.ts (future enhancement)
import { canonicalHubs } from './.generated/taxonomy-slugs.json';
```

### 2. Validate Middleware (`scripts/routing/validate-middleware.ts`) 

**Purpose**: Comprehensive testing of middleware routing configuration against the taxonomy to prevent redirect loops and ensure complete coverage.

**Key Features**:
- Taxonomy alignment validation
- Hub coverage analysis
- Alias consistency checking
- Redirect simulation and loop detection
- Comprehensive reporting

**Usage**:
```bash
# Basic validation
npm run validate:middleware

# Full validation with loop detection and redirect testing
npm run validate:middleware:full

# Just test redirects
npm run validate:middleware:redirects

# Just check for loops
npm run validate:middleware:loops

# JSON output for CI
tsx scripts/routing/validate-middleware.ts --json
```

**Validation Checks**:
- ✅ All taxonomy hubs exist in middleware `CANONICAL_HUBS`
- ✅ All middleware hubs exist in taxonomy
- ✅ Hub aliases point to valid canonical hubs
- ✅ Legacy redirects point to valid canonical paths
- ✅ No circular redirect chains
- ✅ Redirect simulation matches expected outcomes

**Example Output**:
```
Middleware Validation Results
============================
Canonical Hubs: 6
Hub Aliases: 12
Legacy Redirects: 15
Taxonomy: 6 hubs, 23 services, 89 subservices

Validation Checks:
✅ Taxonomy Alignment
✅ Hub Coverage
✅ Alias Consistency
✅ Redirect Validation
✅ Loop Detection

✅ Middleware validation passed
```

### 3. Scaffold Service Page (`scripts/services/scaffold-service-page.ts`)

**Purpose**: Generate properly structured service page data files with complete templates to speed up development and ensure consistency.

**Key Features**:
- Hub, service, and sub-service template generation
- Full, minimal, and hub-specific templates
- Taxonomy validation and node resolution
- Proper TypeScript typing and imports
- Dry-run capability

**Usage**:
```bash
# Generate full service page
npm run scaffold:service-page --hub=marketing-services --service=content-creative

# Generate sub-service page  
npm run scaffold:service-page --hub=seo-services --service=technical --sub=core-web-vitals

# Generate hub page
npm run scaffold:service-page --hub=marketing-services --template=hub

# Generate minimal template
npm run scaffold:service-page:minimal --hub=web-development-services --service=website

# Preview without creating files
npm run scaffold:service-page:dry --hub=marketing-services --service=content-creative

# Force overwrite existing files
tsx scripts/services/scaffold-service-page.ts --hub=marketing-services --service=content-creative --force
```

**Template Types**:

1. **Full Template** (default) - Complete service page with all sections:
   - Hero with proper title formatting
   - Two-column video section
   - Services & capabilities with expandable bullets  
   - Portfolio section with selector integration
   - Module carousel for resources
   - Pricing section with package integration
   - Testimonials with targeted selection
   - FAQ section with common questions
   - Final CTA section

2. **Minimal Template** - Basic structure with TODOs:
   - Essential sections only
   - Placeholder content marked with TODO
   - Faster to customize for simple pages

3. **Hub Template** - Hub-specific layout:
   - Overview sections
   - Child service cards
   - Hub-wide testimonials and resources
   - Different content structure for directory pages

**Generated File Structure**:
```
src/data/page/services-pages/
  marketing-services/
    index.ts                    # Hub page
    content-creative/
      index.ts                  # Service page
    digital-advertising/
      index.ts                  # Service page
      paid-social/
        index.ts                # Sub-service page
```

## Installation & Setup

### 1. Add the Scripts

Place the three script files in your repository:
- `scripts/taxonomy/export-slugs.ts`
- `scripts/routing/validate-middleware.ts` 
- `scripts/services/scaffold-service-page.ts`

### 2. Update package.json

Add the provided script entries to your `package.json`:

```json
{
  "scripts": {
    "taxonomy:export-slugs": "tsx scripts/taxonomy/export-slugs.ts",
    "validate:middleware": "tsx scripts/routing/validate-middleware.ts", 
    "scaffold:service-page": "tsx scripts/services/scaffold-service-page.ts",
    // ... other scripts from the provided bundle
  }
}
```

### 3. Create .generated Directory

The export-slugs script will create this automatically, but you can create it manually:
```bash
mkdir -p .generated
echo "# Auto-generated files - do not commit" > .generated/.gitignore
```

### 4. Test the Scripts

```bash
# Test taxonomy export
npm run taxonomy:export-slugs

# Test middleware validation  
npm run validate:middleware:full

# Test scaffolding (dry run)
npm run scaffold:service-page:dry --hub=marketing-services --service=content-creative
```

## Integration with Existing Workflows

### Development Workflow
```bash
# Daily development check (includes new scripts)
npm run data:foundation

# Before committing
npm run precommit:data
```

### CI/CD Integration
```bash
# Complete CI validation
npm run data:ci

# Foundation validation (includes new scripts)  
npm run data:foundation
```

### Content Creation Workflow
```bash
# 1. Add service to taxonomy (servicesTree.ts)
# 2. Generate slugs for middleware
npm run taxonomy:export-slugs

# 3. Validate middleware still works
npm run validate:middleware:full

# 4. Scaffold the service page
npm run scaffold:service-page --hub=your-hub --service=your-service

# 5. Customize the generated template
# 6. Validate the result
npm run validate:services-pages
```

## Error Handling & Troubleshooting

### Common Issues

**Export Slugs Errors**:
- `Duplicate hub slug: X` - Fix duplicate slugs in servicesTree.ts
- `Hub slug should end with "-services": X` - Ensure canonical format
- `Reserved slug "packages" used` - Don't use "packages" as a sub-service slug

**Middleware Validation Errors**:
- `Taxonomy hub "X" not found in middleware` - Add missing hub to CANONICAL_HUBS
- `Redirect loop detected` - Fix circular references in redirect tables
- `Alias "X" points to non-canonical hub` - Update alias to point to canonical hub

**Scaffolding Errors**:
- `Node not found in taxonomy` - Ensure hub/service/sub exists in servicesTree.ts
- `File already exists` - Use `--force` to overwrite or choose different path
- `Invalid combination of parameters` - Check hub/service/sub parameter logic

### Debugging Tips

1. **Use verbose output**: Add `--verbose` to see detailed logs
2. **Use JSON output**: Add `--json` for machine-readable results
3. **Use dry-run**: Add `--dry-run` to test without making changes
4. **Check taxonomy first**: Always validate taxonomy before other scripts

## Performance Considerations

- **Export slugs**: Fast operation, generates ~10KB files
- **Middleware validation**: Takes 1-3 seconds with full testing enabled
- **Scaffolding**: Instant operation, generates single files

## Future Enhancements

### Potential Improvements

1. **Export Slugs**:
   - Add TypeScript declaration file generation
   - Support for custom export formats
   - Integration with build process

2. **Middleware Validation**:
   - Integration testing with actual Next.js routing
   - Performance testing of redirect chains
   - Visual redirect flow diagrams

3. **Scaffolding**:
   - Custom template support
   - Batch scaffolding for multiple services
   - Integration with content management workflows

### Integration Points

- **Build Process**: Run export-slugs in prebuild
- **IDE Integration**: Use scaffolding for code generation
- **CI/CD**: Include all validations in deployment pipeline
- **Documentation**: Auto-generate routing documentation from middleware validation

## Support & Maintenance

These scripts are designed to be:
- **Self-documenting**: Clear error messages and help text
- **Maintainable**: Simple TypeScript with minimal dependencies  
- **Extensible**: Easy to add new features or modify behavior
- **Reliable**: Comprehensive error handling and validation

For issues or feature requests, refer to the inline documentation and error messages first, then check the troubleshooting section above.