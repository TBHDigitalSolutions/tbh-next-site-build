# Build Pipeline Guide

**File:** `docs/packages/build-pipeline.md`

# Package Build Pipeline

**Version:** 2.0.0  
**Last Updated:** January 2025

## Overview

The package build pipeline transforms human-authored MDX files into validated, type-safe JSON that powers the entire packages domain. This document explains the architecture, data flow, and all build steps.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Data Flow Diagram](#data-flow-diagram)
- [Build Steps](#build-steps)
- [Command Reference](#command-reference)
- [Output Artifacts](#output-artifacts)
- [Validation Layers](#validation-layers)
- [Performance](#performance)
- [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Single Source of Truth (SSOT)

```
┌─────────────────────────────────────────────────────────────┐
│              HUMAN-EDITABLE (SSOT)                          │
│  content/packages/catalog/<service>/<slug>/public.mdx       │
│  ├─ Frontmatter (YAML)                                      │
│  ├─ Body (Markdown)                                         │
│  └─ Assets (images)                                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    ┌───────────────┐
                    │  Build Pipeline│
                    └───────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│           MACHINE-GENERATED (Never edit by hand)            │
│  src/data/packages/__generated__/                           │
│  ├─ packages/<slug>.json  (validated, snake_case)          │
│  ├─ index.json            (catalog for hub/search)          │
│  ├─ cards.json            (precomputed card props)          │
│  ├─ routes.json           (routing lookups)                 │
│  ├─ search/               (search indexes)                  │
│  ├─ schema/               (JSON Schema from Zod)            │
│  ├─ health.json           (errors/warnings)                 │
│  └─ hashes.json           (incremental build cache)         │
└─────────────────────────────────────────────────────────────┘
```

### Design Principles

1. **SSOT:** Only `public.mdx` files are human-edited
2. **Type Safety:** Zod schema validates everything
3. **Fail Fast:** CI blocks merges on validation errors
4. **Incremental:** Hash-based caching for speed
5. **Derived:** All display values computed at render time

---

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        BUILD PIPELINE                             │
└──────────────────────────────────────────────────────────────────┘

1. AUTHOR-LINT (Pre-Build Validation)
   ├─ Input: Generated JSON from previous build (or empty)
   ├─ Checks: PRC001, INC001, CTA001
   ├─ Output: author-lint-report.json
   └─ Exit: Code 1 if errors (CI-blocking)
              ↓
2. DATA:BUILD (Core Pipeline)
   ├─ Read: content/packages/catalog/**/public.mdx
   ├─ Parse: Frontmatter (YAML) + Body (Markdown)
   ├─ Normalize: camelCase → snake_case, arrays → strings
   ├─ Compile: Markdown ## sections → HTML
   ├─ Validate: Zod PackageSchema (PRC001, DRIFT001, IMG001)
   ├─ Write: __generated__/packages/<slug>.json
   ├─ Aggregate: index.json, health.json, hashes.json
   └─ Exit: Code 1 if errors
              ↓
3. DERIVED ARTIFACTS (Parallel)
   ├─ routes:build  → routes.json
   ├─ cards:build   → cards.json
   ├─ search:build  → search/unified.search.json
   └─ schema:build  → schema/package-data.schema.json
              ↓
4. POST-BUILD VALIDATION
   ├─ data:validate → Final JSON Schema check
   └─ registry:check → Registry parity verification
              ↓
5. REGISTRY SYNC
   ├─ registry:sync  → Create/update base.ts, cards.ts
   └─ registry:prune → Remove orphaned entries
              ↓
6. CI SUCCESS ✅
```

---

## Build Steps

### Step 1: Author-Lint (Pre-Build)

**Script:** `scripts/author-lint.ts`  
**Command:** `npm run lint:author`  
**Duration:** < 5 seconds for 18 packages

**What it does:**

- Reads generated JSON from previous build
- Validates content rules (PRC001, INC001, CTA001)
- Generates machine-readable report
- Exits with code 1 on errors (CI-blocking)

**Output:**

```
src/data/packages/__generated__/author-lint-report.json
```

**When it runs:**

- Locally: `npm run lint:author`
- CI: First step, before build
- Pipeline: `npm run data:all`

**Flags:**

```bash
npm run lint:author --strict   # Warnings as errors
npm run lint:author --verbose  # Detailed output
```

---

### Step 2: Data:Build (Core Pipeline)

**Script:** `scripts/packages/build-package-data.ts`  
**Command:** `npm run data:build`  
**Duration:** 10-20 seconds for 18 packages

**What it does:**

1. **Read MDX**
   - Glob: `content/packages/catalog/**/public.mdx`
   - Parse frontmatter (YAML)
   - Extract body (Markdown)

2. **Normalize**
   - Convert camelCase → snake_case
   - Join arrays → strings (e.g., notes)
   - Handle service aliases → canonical

3. **Compile MDX Sections**
   - `## Purpose` → `narrative.purpose_html`
   - `## Overview` → `narrative.overview_html`
   - `## Notes` → `narrative.notes_html`
   - `## FAQ` → `narrative.faq_html`

4. **Validate**
   - Run Zod PackageSchema.parse()
   - Enforce PRC001 (pricing → tagline)
   - Enforce DRIFT001 (no display fields)
   - Enforce IMG001 (image src required)

5. **Write Outputs**
   - `__generated__/packages/<slug>.json`
   - `__generated__/index.json` (catalog)
   - `__generated__/health.json` (errors/warnings)
   - `__generated__/hashes.json` (cache)

**Flags:**

```bash
npm run data:build --strict     # Fail on warnings
npm run data:build --changed    # Only changed packages
npm run data:build --slug foo   # Single package
```

**Environment Variables:**

```bash
VALIDATE_DURING_BUILD=1  # Enable Zod validation (default: on)
VALIDATE_DURING_BUILD=0  # Disable validation
```

---

### Step 3: Routes:Build

**Script:** `scripts/packages/build-routes.ts`  
**Command:** `npm run routes:build`  
**Duration:** < 1 second

**What it does:**

- Reads validated package JSONs
- Generates slug → registry import path mapping
- Enables lazy-loading in Next.js

**Output:**

```json
// __generated__/routes.json
{
  "explainer-video-starter": "@/packages/registry/video/explainer-video-starter/base",
  "featured-snippet": "@/packages/registry/seo/featured-snippet/base"
}
```

---

### Step 4: Cards:Build

**Script:** `scripts/packages/build-cards.ts`  
**Command:** `npm run cards:build`  
**Duration:** < 2 seconds

**What it does:**

- Reads validated package JSONs
- Extracts minimal data for card rendering
- **Excludes** price_band (detail-only content)
- Precomputes card props for performance

**Output:**

```json
// __generated__/cards.json
[
  {
    "slug": "explainer-video-starter",
    "title": "Explainer Video Starter",
    "summary": "Launch a simple explainer...",
    "image": { "src": "...", "alt": "..." },
    "service": "video",
    "tier": "starter",
    "tags": ["video", "explainer"],
    "badges": ["popular"]
  }
]
```

---

### Step 5: Search:Build

**Script:** `scripts/packages/build-unified-search.ts`  
**Command:** `npm run search:build`  
**Duration:** < 2 seconds

**What it does:**

- Tokenizes package names, summaries, tags
- Builds inverted index for client-side search
- Generates lightweight search artifact

**Output:**

```
__generated__/search/unified.search.json
```

---

### Step 6: Schema:Build

**Script:** `scripts/packages/build-json-schema.ts`  
**Command:** `npm run schema:build`  
**Duration:** < 1 second

**What it does:**

- Imports Zod PackageSchema
- Converts to JSON Schema using `zod-to-json-schema`
- Adds metadata (version, timestamp)
- Validates output structure

**Output:**

```
__generated__/schema/package-data.schema.json
```

**Used by:**

- VS Code (autocomplete for package JSONs)
- JSON validators
- Documentation generators
- External tools

---

### Step 7: Data:Validate

**Script:** `scripts/packages/validate-package-data.ts`  
**Command:** `npm run data:validate`  
**Duration:** < 3 seconds

**What it does:**

- Post-build sanity checks
- Validates generated JSONs against schema
- Catches edge cases missed during build

---

### Step 8: Registry:Sync

**Script:** `scripts/packages/registry/sync-registry.ts`  
**Command:** `npm run registry:sync`  
**Duration:** < 2 seconds

**What it does:**

- Reads validated package JSONs
- Creates/updates registry stubs:
  - `src/packages/registry/<service>/<slug>/base.ts`
  - `src/packages/registry/<service>/<slug>/cards.ts`
- Ensures every package has registry entry

**Generated Files:**

```typescript
// base.ts
import json from "@/data/packages/__generated__/packages/explainer-video-starter.json";
import { PackageSchema } from "@/packages/lib/package-schema";
const base = PackageSchema.parse(json);
export default base;

// cards.ts
import base from "./base";
const card = {
  slug: base.meta.slug,
  title: base.meta.name,
  summary: base.hero?.summary,
  // ...
} as const;
export default card;
```

---

### Step 9: Registry:Prune

**Script:** `scripts/packages/registry/prune-registry.ts`  
**Command:** `npm run registry:prune`  
**Duration:** < 1 second

**What it does:**

- Finds registry entries without corresponding package JSON
- Removes orphaned registry folders
- Keeps registry in sync with content

---

### Step 10: Registry:Check

**Script:** `scripts/packages/registry/check-registry.ts`  
**Command:** `npm run registry:check`  
**Duration:** < 1 second

**What it does:**

- Verifies parity between catalog and registry
- Ensures no missing registry entries
- Ensures no extra registry entries
- CI gate (must pass to merge)

---

## Command Reference

### Primary Commands

```bash
# Full pipeline (recommended)
npm run data:all

# CI pipeline (includes tests)
npm run ci:packages
```

### Individual Steps

```bash
npm run lint:author      # Pre-build validation
npm run data:build       # Core build
npm run routes:build     # Routes index
npm run cards:build      # Card props
npm run search:build     # Search index
npm run schema:build     # JSON Schema
npm run data:validate    # Post-build check
npm run registry:sync    # Update registry
npm run registry:prune   # Clean registry
npm run registry:check   # Verify parity
npm run doctor           # Non-blocking diagnostics
```

### Build Flags

```bash
# Strict mode (warnings = errors)
npm run data:build -- --strict
npm run lint:author -- --strict

# Incremental (only changed)
npm run data:build -- --changed

# Single package
npm run data:build -- --slug explainer-video-starter

# Verbose output
npm run lint:author -- --verbose
npm run schema:build -- --verbose
```

---

## Output Artifacts

All machine-generated files live in `src/data/packages/__generated__/`:

```
__generated__/
├── packages/                    # Core package data
│   ├── explainer-video-starter.json
│   ├── featured-snippet.json
│   └── ...
│
├── index.json                   # Catalog index (hub/search)
├── cards.json                   # Precomputed card props
├── routes.json                  # Slug → registry import paths
│
├── search/
│   └── unified.search.json      # Client-side search index
│
├── schema/
│   └── package-data.schema.json # JSON Schema (from Zod)
│
├── health.json                  # Build errors/warnings
├── hashes.json                  # Incremental build cache
└── author-lint-report.json      # Latest lint results
```

### File Purposes

| File | Size | Purpose | Used By |
|------|------|---------|---------|
| `packages/<slug>.json` | 5-15 KB | Full package data | Detail pages, PDF generation |
| `index.json` | 20-40 KB | Catalog rows | Hub grid, filters |
| `cards.json` | 20-40 KB | Card props | Card components |
| `routes.json` | 2-5 KB | Lazy imports | Next.js routing |
| `search/

```markdown
| `search/unified.search.json` | 10-20 KB | Search index | Client search, filters |
| `schema/package-data.schema.json` | 30-50 KB | JSON Schema | VS Code, validators |
| `health.json` | 5-10 KB | Build report | CI, debugging |
| `hashes.json` | 2-5 KB | Cache keys | Incremental builds |
| `author-lint-report.json` | 5-10 KB | Validation | CI, local dev |

---

## Validation Layers

The pipeline has **three validation layers** for defense in depth:

### Layer 1: Author-Lint (Pre-Build)

**When:** Before build starts  
**Speed:** < 5 seconds  
**Purpose:** Fast fail on content issues

**Checks:**
- ✅ PRC001: Pricing requires tagline
- ✅ INC001: Includes XOR table
- ✅ CTA001: No duplicate CTAs
- ✅ Content quality heuristics

**Technology:** Custom TypeScript validation  
**Blocking:** Yes (CI gate)

---

### Layer 2: Zod Schema (Build-Time)

**When:** During `data:build`  
**Speed:** Adds 2-3 seconds  
**Purpose:** Runtime type safety

**Checks:**
- ✅ PRC001: Pricing requires tagline (redundant check)
- ✅ DRIFT001: No display-only fields
- ✅ IMG001: Image src required
- ✅ Type coercion (service normalization)
- ✅ Field presence (required vs optional)
- ✅ Format validation (kebab-case, URLs)

**Technology:** Zod schema validation  
**File:** `src/packages/lib/package-schema.ts`  
**Blocking:** Yes (build fails)

---

### Layer 3: JSON Schema (Post-Build)

**When:** After build completes  
**Speed:** < 3 seconds  
**Purpose:** Contract verification

**Checks:**
- ✅ Output conforms to JSON Schema
- ✅ No unexpected fields
- ✅ All required fields present

**Technology:** JSON Schema validator  
**File:** `__generated__/schema/package-data.schema.json`  
**Blocking:** Yes (CI gate)

---

### Validation Matrix

| Rule | Author-Lint | Zod Schema | JSON Schema |
|------|-------------|------------|-------------|
| PRC001 | ✅ Primary | ✅ Redundant | ❌ |
| INC001 | ✅ Primary | ❌ | ❌ |
| CTA001 | ✅ Primary | ❌ | ❌ |
| DRIFT001 | ❌ | ✅ Primary | ❌ |
| IMG001 | ❌ | ✅ Primary | ❌ |
| SVC001 | ❌ | ✅ Primary | ❌ |
| Types | ❌ | ✅ Primary | ✅ Redundant |
| Format | Partial | ✅ Primary | ✅ Redundant |

**Why redundancy?**
- Fast fail (author-lint) before slow build
- Deep validation (Zod) during transformation
- Contract verification (JSON Schema) for external tools

---

## Performance

### Build Times (18 packages)

| Command | Cold | Warm (Cached) |
|---------|------|---------------|
| `lint:author` | 5s | 2s |
| `data:build` | 18s | 5s (--changed) |
| `routes:build` | 1s | 1s |
| `cards:build` | 2s | 2s |
| `search:build` | 2s | 2s |
| `schema:build` | 1s | 1s |
| `data:validate` | 3s | 3s |
| `registry:sync` | 2s | 1s |
| `registry:prune` | 1s | 1s |
| `registry:check` | 1s | 1s |
| **Total (data:all)** | **~35s** | **~20s** |

### Optimization Strategies

**1. Incremental Builds**
```bash
# Only rebuild changed packages
npm run data:build -- --changed

# Hash-based change detection (automatic)
# Skips unchanged packages based on MD5 hash
```

**2. Parallel Execution**

```bash
# Build, routes, cards, search, schema can run in parallel
# Currently sequential for simplicity

# Potential future optimization:
npm run build:parallel  # 35s → 20s estimated
```

**3. CI Caching**

```yaml
# .github/workflows/packages.yml
- uses: actions/cache@v3
  with:
    path: src/data/packages/__generated__/hashes.json
    key: packages-${{ hashFiles('content/packages/**/*.mdx') }}
```

**4. Single Package Builds**

```bash
# Work on one package at a time
npm run data:build -- --slug explainer-video-starter  # < 2s
```

---

## Troubleshooting

### Build Fails with "Pricing requires tagline"

**Error:**

```
❌ PRC001: Pricing present but price_band.tagline is missing
Path: details_and_trust.price_band.tagline
```

**Solution:**
Add tagline to your MDX frontmatter:

```yaml
detailsAndTrust:
  priceBand:
    tagline: "Your pricing message here"
```

**Check:**

- Tagline is at least 10 characters
- Tagline is under `priceBand`, not `pricing`
- Spelling: `tagline` not `tagLine` or `tag_line`

---

### Build Fails with "Unrecognized service"

**Error:**

```
Error: Unrecognized service: "consulting"
Must be one of: content, leadgen, marketing, seo, video, webdev
```

**Solution:**
Use a recognized service alias:

```yaml
# Change
service: consulting

# To one of
service: marketing  # or "marketing services", etc.
service: seo
service: content
```

**Valid values:** See [Service Normalization](#service-normalization) in authoring rules.

---

### Build Succeeds but Package Not Visible in UI

**Possible causes:**

1. **Registry out of sync**

   ```bash
   npm run registry:sync
   npm run registry:check
   ```

2. **Cache not cleared**

   ```bash
   # Next.js cache
   rm -rf .next
   npm run dev
   ```

3. **Package filtered by service/tier**
   - Check UI filters are not hiding your package
   - Verify service matches expected category

4. **Build didn't write file**

   ```bash
   # Check file exists
   ls src/data/packages/__generated__/packages/<your-slug>.json
   
   # If missing, rebuild
   npm run data:build
   ```

---

### Incremental Build Not Working

**Symptoms:** `--changed` flag rebuilds everything

**Causes:**

1. **Hashes file missing**

   ```bash
   # Check if exists
   ls src/data/packages/__generated__/hashes.json
   
   # If missing, first build creates it
   npm run data:build
   ```

2. **Git working tree dirty**

   ```bash
   # Incremental detection uses file modification
   git status  # Should be clean for accurate detection
   ```

3. **Global content changes**

   ```bash
   # If config changed, all packages rebuild
   # This is intentional and correct
   ```

---

### JSON Schema Generation Fails

**Error:**

```
❌ Failed to import PackageSchema
```

**Solutions:**

1. **TypeScript not compiled**

   ```bash
   npm run build  # Compile TS to JS
   npm run schema:build
   ```

2. **Import path incorrect**

   ```typescript
   // In build-json-schema.ts, verify path
   const modulePath = path.resolve(process.cwd(), "src/packages/lib/package-schema.js");
   ```

3. **Missing dependency**

   ```bash
   npm install --save-dev zod-to-json-schema
   ```

---

### Validation Passes Locally, Fails in CI

**Possible causes:**

1. **Environment differences**

   ```bash
   # CI might use different Node version
   # Check .nvmrc matches CI config
   ```

2. **Missing files in Git**

   ```bash
   # Ensure all content committed
   git status
   git add content/packages/
   ```

3. **CI cache stale**

   ```yaml
   # Clear CI cache in GitHub Actions
   # Settings → Actions → Caches → Delete
   ```

4. **Test data differences**

   ```bash
   # CI runs clean build
   # Local might have stale generated files
   
   # Clean and rebuild
   rm -rf src/data/packages/__generated__/
   npm run data:all
   ```

---

### Health.json Shows Warnings but Build Passes

**This is normal!**

Warnings don't block builds by default.

**To make warnings block:**

```bash
npm run data:build -- --strict
npm run lint:author -- --strict
```

**Common warnings:**

- Short taglines (< 10 chars)
- Missing optional fields
- Array-style notes (auto-fixed)
- Fewer than 3 outcomes

**Action:**

- Review warnings in `health.json`
- Fix high-priority ones
- Some warnings are informational only

---

### Doctor Command Shows Issues

**Purpose of Doctor:**
Non-blocking diagnostics for maintainability

**Run:**

```bash
npm run doctor
```

**Common findings:**

- Unused images in content folders
- Missing alt text (accessibility)
- Inconsistent naming conventions
- Orphaned files

**Action:**

- Review recommendations
- Fix when convenient
- Not CI-blocking

---

## Advanced Topics

### Custom Validation Rules

**To add a new validation rule:**

1. **Add to author-lint.ts** (pre-build)

   ```typescript
   // scripts/author-lint.ts
   if (pkg.custom_field?.length < 5) {
     errors.push({
       code: "CUS001",
       path: "custom_field",
       message: "Custom field must have at least 5 items"
     });
   }
   ```

2. **Add to package-schema.ts** (build-time)

   ```typescript
   // src/packages/lib/package-schema.ts
   .superRefine((pkg, ctx) => {
     if (pkg.custom_field?.length < 5) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: "CUS001: Custom field requires 5+ items",
         path: ["custom_field"]
       });
     }
   });
   ```

3. **Update documentation**
   - Add rule to authoring-rules.md
   - Document in this file
   - Update error messages

---

### Adding New Package Fields

**To add a new optional field:**

1. **Update Zod schema**

   ```typescript
   // src/packages/lib/package-schema.ts
   export const MetaSchema = z.object({
     // ... existing fields
     new_field: Str.optional(),
   });
   ```

2. **Update build mapper**

   ```typescript
   // scripts/packages/build-package-data.ts
   function fmToBranches(fm: any) {
     return {
       meta: {
         // ... existing mappings
         new_field: fm.newField,
       }
     };
   }
   ```

3. **Regenerate JSON Schema**

   ```bash
   npm run schema:build
   ```

4. **Test with sample data**

   ```bash
   npm run data:build -- --slug test-package
   ```

5. **Update types propagate automatically!**
   - TypeScript types inferred from Zod
   - UI components get autocomplete
   - No manual type updates needed

---

### Extending Output Formats

**To add a new build output:**

1. **Create build script**

   ```typescript
   // scripts/packages/build-custom.ts
   import packages from "@/data/packages/__generated__/index.json";
   
   const custom = packages.map(pkg => ({
     // Custom transformation
   }));
   
   await writeJson("__generated__/custom.json", custom);
   ```

2. **Add to package.json**

   ```json
   {
     "scripts": {
       "custom:build": "tsx scripts/packages/build-custom.ts",
       "data:all": "... && npm run custom:build && ..."
     }
   }
   ```

3. **Document output format**
   - Add to this file
   - Update output artifacts table
   - Explain use case

---

## Pipeline Diagram (Detailed)

```
┌────────────────────────────────────────────────────────────────┐
│                    PACKAGE BUILD PIPELINE                       │
│                          (Detailed)                             │
└────────────────────────────────────────────────────────────────┘

INPUT: content/packages/catalog/<service>/<slug>/public.mdx

    │
    ├─ AUTHOR-LINT ────────────────────────────────────────┐
    │  ├─ Read: Previous build JSON (if exists)            │
    │  ├─ Check: PRC001, INC001, CTA001                    │
    │  ├─ Write: author-lint-report.json                   │
    │  └─ Exit: Code 1 if errors ────────────────────────► FAIL
    │                                                        
    ├─ DATA:BUILD ─────────────────────────────────────────┐
    │  │                                                     │
    │  ├─ PARSE ──────────────────────────────────┐       │
    │  │  ├─ Read MDX file                        │       │
    │  │  ├─ Extract frontmatter (gray-matter)    │       │
    │  │  ├─ Extract body (markdown)              │       │
    │  │  └─ Parse service/slug from path         │       │
    │  │                                           │       │
    │  ├─ NORMALIZE ──────────────────────────────┤       │
    │  │  ├─ camelCase → snake_case              │       │
    │  │  ├─ Arrays → strings (notes)             │       │
    │  │  ├─ Service aliases → canonical          │       │
    │  │  └─ Price key normalization              │       │
    │  │                                           │       │
    │  ├─ COMPILE ────────────────────────────────┤       │
    │  │  ├─ ## Purpose → purpose_html            │       │
    │  │  ├─ ## Overview → overview_html          │       │
    │  │  ├─ ## Notes → notes_html                │       │
    │  │  └─ ## FAQ → faq_html                    │       │
    │  │                                           │       │
    │  ├─ VALIDATE (Zod) ─────────────────────────┤       │
    │  │  ├─ PackageSchema.parse()                │       │
    │  │  ├─ PRC001: Pricing → tagline            │       │
    │  │  ├─ DRIFT001: No display fields          │       │
    │  │  ├─ IMG001: Image src required           │       │
    │  │  └─ Exit: Code 1 if errors ──────────────┼────► FAIL
    │  │                                           │
    │  └─ WRITE ──────────────────────────────────┘
    │     ├─ packages/<slug>.json (validated)
    │     ├─ index.json (catalog)
    │     ├─ health.json (errors/warnings)
    │     └─ hashes.json (cache keys)
    │
    ├─ DERIVED BUILDS (Parallel) ──────────────────────────┐
    │  │                                                     │
    │  ├─ ROUTES:BUILD ──────────────────────────┐        │
    │  │  └─ Write: routes.json                  │        │
    │  │                                          │        │
    │  ├─ CARDS:BUILD ───────────────────────────┤        │
    │  │  ├─ Extract card props (no price_band)  │        │
    │  │  └─ Write: cards.json                   │        │
    │  │                                          │        │
    │  ├─ SEARCH:BUILD ──────────────────────────┤        │
    │  │  ├─ Tokenize names, summaries, tags     │        │
    │  │  └─ Write: search/unified.search.json   │        │
    │  │                                          │        │
    │  └─ SCHEMA:BUILD ──────────────────────────┘        │
    │     ├─ Import: Zod PackageSchema                    │
    │     ├─ Convert: zod-to-json-schema                  │
    │     └─ Write: schema/package-data.schema.json       │
    │                                                       │
    ├─ POST-BUILD VALIDATION ──────────────────────────────┤
    │  ├─ DATA:VALIDATE                                   │
    │  │  └─ Validate JSON against schema ────────────────┼─► FAIL
    │  │                                                   │
    │  └─ REGISTRY:CHECK                                  │
    │     └─ Verify catalog/registry parity ──────────────┼─► FAIL
    │                                                       │
    └─ REGISTRY SYNC ──────────────────────────────────────┘
       ├─ REGISTRY:SYNC
       │  ├─ Create/update base.ts files
       │  └─ Create/update cards.ts files
       │
       └─ REGISTRY:PRUNE
          └─ Remove orphaned registry entries

OUTPUT: src/data/packages/__generated__/* (9 artifact types)

    │
    └─ SUCCESS ✅
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/packages.yml
name: Packages Pipeline

on:
  push:
    paths:
      - 'content/packages/**'
      - 'scripts/packages/**'
      - 'src/packages/**'
  pull_request:
    paths:
      - 'content/packages/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run author-lint
        run: npm run lint:author
      
      - name: Build packages
        run: npm run data:all
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: package-data
          path: src/data/packages/__generated__/
      
      - name: Check for errors
        run: |
          if grep -q '"errors": [^0]' src/data/packages/__generated__/health.json; then
            echo "Build errors detected"
            exit 1
          fi
```

### CI Gates

**PR must pass:**

1. ✅ Author-lint (< 5s)
2. ✅ Data build (< 20s)
3. ✅ Schema validation (< 3s)
4. ✅ Registry check (< 1s)
5. ✅ Zero errors in health.json

**Total CI time:** ~30 seconds

---

## File Structure Reference

```
project-root/
├── content/
│   └── packages/
│       └── catalog/
│           └── <service>/
│               └── <slug>/
│                   ├── public.mdx          # SSOT (human-edited)
│                   └── assets/             # Images, etc.
│
├── src/
│   ├── packages/
│   │   ├── lib/
│   │   │   ├── package-schema.ts          # Zod SSOT
│   │   │   └── mappers/                   # JSON → UI props
│   │   │
│   │   └── registry/
│   │       └── <service>/
│   │           └── <slug>/
│   │               ├── base.ts            # Validated import
│   │               └── cards.ts           # Card props
│   │
│   └── data/
│       └── packages/
│           └── __generated__/             # Machine-generated (never edit)
│               ├── packages/
│               │   └── <slug>.json        # Validated package data
│               ├── index.json
│               ├── cards.json
│               ├── routes.json
│               ├── search/
│               │   └── unified.search.json
│               ├── schema/
│               │   └── package-data.schema.json
│               ├── health.json
│               ├── hashes.json
│               └── author-lint-report.json
│
└── scripts/
    ├── author-lint.ts                     # Pre-build validation
    └── packages/
        ├── build-package-data.ts          # Core build
        ├── build-routes.ts                # Routes index
        ├── build-cards.ts                 # Card props
        ├── build-unified-search.ts        # Search index
        ├── build-json-schema.ts           # JSON Schema gen
        ├── validate-package-data.ts       # Post-build validation
        ├── packages.config.ts             # Shared config
        └── registry/
            ├── sync-registry.ts           # Create registry entries
            ├── prune-registry.ts          # Remove orphans
            └── check-registry.ts          # Verify parity
```

---

## Glossary

**SSOT (Single Source of Truth)**  
The one authoritative source for data. For packages: `public.mdx` files.

**Frontmatter**  
YAML metadata at the top of MDX files, enclosed in `---` delimiters.

**snake_case**  
Naming convention using underscores: `details_and_trust`, `price_band`.

**camelCase**  
Naming convention with capitals: `detailsAndTrust`, `priceBand`. Used in frontmatter.

**Zod**  
TypeScript-first schema validation library. Provides runtime validation + type inference.

**Derived Data**  
Data computed from SSOT, never manually edited. Examples: cards.json, routes.json.

**Incremental Build**  
Build that only processes changed files, using hash-based change detection.

**Registry**  
Type-safe import layer: `src/packages/registry/<service>/<slug>/base.ts`.

**Mapper**  
Function that transforms package JSON into UI component props.

**Health Report**  
Build artifact (`health.json`) listing all errors and warnings.

**Drift**  
When stored data diverges from computed values. Prevented by DRIFT001 rule.

---

## Resources

### Documentation

- Authoring Rules: `docs/packages/authoring-rules.md`
- This File: `docs/packages/build-pipeline.md`
- Schema Source: `src/packages/lib/package-schema.ts`

### Tools

- Author Lint: `npm run lint:author`
- Full Build: `npm run data:all`
- Doctor: `npm run doctor`

### Support

- Slack: #packages-engineering
- Email: <packages-team@company.com>
- Issues: GitHub repo issues

---

## Changelog

### Version 2.0.0 (Current)

- Added PRC001 validation (pricing → tagline)
- Automated JSON Schema generation from Zod
- Enhanced error messages with field paths
- Incremental build support
- Registry auto-sync

### Version 1.0.0

- Initial build pipeline
- Basic Zod validation
- Manual JSON Schema maintenance

---

**Last Updated:** January 2025  
**Maintained By:** Packages Engineering Team  
**Next Review:** March 2025

```

---
