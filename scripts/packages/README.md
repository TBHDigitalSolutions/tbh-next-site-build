# Packages Build Scripts

A small, deterministic toolkit for building, validating, and exporting your **Packages** registry. Everything is **framework-agnostic** (no React/Next imports), runs on Node, and leans on your SSOT schema via `src/packages/lib/registry/loader.ts`.

```
scripts/packages
├── build.ts                     # Orchestrator (single entry point)
├── validate.ts                  # Multi-check CLI (schema, featured, growth)
├── mdx-to-registry.ts           # Authoring → registry JSON
├── mirror-docs-to-registry.ts   # Sync/mirror docs to registry
├── generate-registry-manifest.ts# List of entries (slug, serviceDir, path)
├── build-catalog-json.ts        # Consolidated runtime-safe catalog JSON
├── build-unified-search.ts      # Search index builder
├── packages-stats.ts            # Stats report (stdout and/or JSON)
└── README.md
```

---

## Quick start

### Requirements

* Node 18+ (or 20+ recommended)
* A TypeScript runner (e.g. [`tsx`](https://github.com/esbuild-kit/tsx)) or compile to JS
* Path alias `@/` → `src/` (or adjust imports accordingly)

### Package.json wiring (recommended)

```json
{
  "scripts": {
    "packages:build": "tsx scripts/packages/build.ts",
    "packages:validate": "tsx scripts/packages/validate.ts --all",
    "packages:validate:schema": "tsx scripts/packages/validate.ts --schema",
    "packages:manifest": "tsx scripts/packages/generate-registry-manifest.ts",
    "packages:catalog": "tsx scripts/packages/build-catalog-json.ts",
    "packages:search": "tsx scripts/packages/build-unified-search.ts",
    "packages:stats": "tsx scripts/packages/packages-stats.ts",
    "packages:mdx": "tsx scripts/packages/mdx-to-registry.ts",
    "packages:mirror-docs": "tsx scripts/packages/mirror-docs-to-registry.ts",
    "packages:doctor": "tsx scripts/packages/validate.ts --all"
  }
}
```

> Prefer `tsx` for zero-config TypeScript. If you compile to JS, use `node` and adjust paths (e.g. `build.js`).

### Environment variables (optional)

* `PACKAGES_REGISTRY_ROOT` — override default `src/packages/registry`
* `PACKAGES_CONFIG_DIR` — base directory for config files (defaults to `config/`)
* `PACKAGES_FEATURED_FILE` — featured config JSON path
* `PACKAGES_GROWTH_FILE` — growth embeds JSON path
* `NEXT_PUBLIC_PACKAGES_FEATURED_*` — featured overrides (see **validate.ts**)

---

## Pipeline overview

A typical CI/local pipeline runs:

1. **mdx-to-registry.ts** *(optional if you author JSON directly)*
2. **validate.ts** `--schema --featured --growth`
3. **generate-registry-manifest.ts**
4. **build-catalog-json.ts**
5. **build-unified-search.ts**
6. **packages-stats.ts**

You can run each step individually (see sections below) or let the orchestrator `build.ts` run them in order.

---

## Orchestrator — `build.ts`

**Purpose:** single entry point that runs the full pipeline in order with clean logs, timing, and options for CI debug.

**Why keep it:** centralized control of pipeline order, fail-fast behavior, dry-run for diagnostics, and selective step execution.

### Usage

```bash
# Run full pipeline
pnpm tsx scripts/packages/build.ts

# Dry run (show planned steps, don’t execute)
pnpm tsx scripts/packages/build.ts --dry-run

# Continue on errors (useful when auditing multiple failures locally)
pnpm tsx scripts/packages/build.ts --continue-on-error

# Only a subset of steps (comma-separated)
pnpm tsx scripts/packages/build.ts --only=validate,manifest

# Skip steps (comma-separated)
pnpm tsx scripts/packages/build.ts --skip=search,stats
```

### Flags

* `--dry-run` — print steps without running them
* `--continue-on-error` — keep going even if a step fails (still exits non-zero)
* `--only=<a,b,c>` — run only listed steps (aliases: `mdx`, `validate`, `manifest`, `catalog`, `search`, `stats`)
* `--skip=<a,b,c>` — skip listed steps
* `--runner=<tsx|node>` — override runner (defaults to `tsx`)
* `--quiet` — terse logs

> This script shells out to the individual scripts below (so you can still run them directly).

---

## Validator — `validate.ts`

**Purpose:** merge all registry checks into one CLI.

* `--schema`  Validate `content.generated.json` via SSOT schema (`parsePackage`)
* `--featured` Ensure **featured** slugs (from ENV or config file) exist
* `--growth`   Ensure growth embed configs reference valid slugs

**Output:** clear, deterministic logs with file paths and Zod paths (`a → b → c`), plus duplicate slug detection.

### Usage

```bash
# All checks
pnpm tsx scripts/packages/validate.ts --all

# Individually
pnpm tsx scripts/packages/validate.ts --schema
pnpm tsx scripts/packages/validate.ts --featured
pnpm tsx scripts/packages/validate.ts --growth

# Advanced: custom roots/configs
pnpm tsx scripts/packages/validate.ts --all \
  --registry-root=src/packages/registry \
  --config-dir=config \
  --featured-file=config/featured.json \
  --growth-file=config/growth-embeds.json \
  --quiet
```

### Featured sources

* **ENV** (CSV lists):
  `NEXT_PUBLIC_PACKAGES_FEATURED_GLOBAL`
  `NEXT_PUBLIC_PACKAGES_FEATURED_SEO`
  `NEXT_PUBLIC_PACKAGES_FEATURED_MARKETING`
  `NEXT_PUBLIC_PACKAGES_FEATURED_CONTENT`
  `NEXT_PUBLIC_PACKAGES_FEATURED_WEB`
  `NEXT_PUBLIC_PACKAGES_FEATURED_VIDEO`
  `NEXT_PUBLIC_PACKAGES_FEATURED_LEADGEN`

* **File**: `config/featured.json` (override ENV if both present)

```json
{
  "global": ["seo-starter"],
  "seo-services": ["seo-starter", "local-seo-pro"]
}
```

### Growth config shapes accepted

```json
{ "slugs": ["pkg-a","pkg-b"] }
{ "hero": ["pkg-a"], "footer": ["pkg-b"] }
["pkg-a","pkg-b"]
[{ "slugs": ["pkg-a"] }, { "slugs": ["pkg-b"] }]
```

---

## Authoring → Registry — `mdx-to-registry.ts` (optional)

**Purpose:** transform MDX frontmatter into runtime registry entries (`content.generated.json`) using your **frontmatter schema** and canonical transform (`frontmatterToPackage(...)` + `PackageSchema.parse(...)`).

**Typical flow:**

* Read MDX from a source directory
* Extract/validate frontmatter
* Normalize into runtime `PackageSchemaType`
* Write `src/packages/registry/<service>/<slug>/content.generated.json`

### Usage

```bash
# Default conventions (reads from content directories you define inside the script)
pnpm tsx scripts/packages/mdx-to-registry.ts

# Example custom run
pnpm tsx scripts/packages/mdx-to-registry.ts \
  --src=content/packages/**/*.mdx \
  --out=src/packages/registry \
  --clean
```

### Flags

* `--src=<glob>` — MDX glob (can repeat)
* `--out=<dir>` — output registry root
* `--clean` — remove previously generated JSON before writing new files
* `--dry-run` — report what would be written
* `--verbose` — extra logs

**Output layout (convention):**

```
src/packages/registry/<service-dir>/<slug>/content.generated.json
```

---

## Mirror docs — `mirror-docs-to-registry.ts` (optional)

**Purpose:** copy or transform “docs” (e.g., long-form MD/MDX, assets) into per-package registry folders so the app can co-locate marketing/detail assets with runtime content.

**Usage**

```bash
pnpm tsx scripts/packages/mirror-docs-to-registry.ts \
  --from=content/packages/docs \
  --to=src/packages/registry \
  --delete-orphans \
  --dry-run
```

**Flags**

* `--from=<dir>` — source docs directory
* `--to=<dir>` — registry root
* `--delete-orphans` — remove mirrored files no longer present at source
* `--dry-run`, `--verbose`

---

## Manifest — `generate-registry-manifest.ts`

**Purpose:** discover all `content.generated.json` files and emit a manifest with minimal metadata for fast lookups and indexing.

**Data source:** `src/packages/lib/registry/loader.ts` (ensures deterministic discovery)

**Output (example):** `src/packages/registry/manifest.generated.json`

```json
{
  "generatedAt": "2025-02-15T10:30:45.123Z",
  "items": [
    {
      "slug": "local-seo-starter",
      "serviceDir": "seo-services",
      "jsonPath": "src/packages/registry/seo-services/local-seo-starter/content.generated.json"
    }
  ]
}
```

**Usage**

```bash
pnpm tsx scripts/packages/generate-registry-manifest.ts --out=src/packages/registry/manifest.generated.json
```

**Flags**

* `--out=<file>` — where to write the manifest (default inside registry)
* `--registry-root=<dir>`
* `--pretty` — pretty print (default) / `--minify`

---

## Catalog JSON — `build-catalog-json.ts`

**Purpose:** create a **runtime-safe**, consolidated catalog for hubs/lists. Ideal for static export or client fetching.

**Typical contents:** minimal card/grid view model per package (slug, name, summary, price, top features, tags, service, etc.). Built by mapping validated packages through your **adapters/mappers**.

**Output (example):** `public/generated/packages.catalog.json`

```json
{
  "generatedAt": "2025-02-15T10:31:00.000Z",
  "count": 24,
  "items": [
    {
      "slug": "local-seo-starter",
      "name": "Local SEO Starter",
      "description": "Drive local visibility...",
      "price": { "monthly": 1200, "oneTime": 750, "currency": "USD" },
      "features": ["GMB optimization", "Local citations", "Review strategy"],
      "service": "seo-services",
      "tags": ["local", "beginner"]
    }
  ]
}
```

**Usage**

```bash
pnpm tsx scripts/packages/build-catalog-json.ts \
  --out=public/generated/packages.catalog.json \
  --minify
```

**Flags**

* `--out=<file>` — output path
* `--minify` | `--pretty`
* `--registry-root=<dir>`

> **Guardrail:** This script should **fail** if schema validation fails (it should depend on `validate.ts` or call the loader and check for errors).

---

## Unified Search — `build-unified-search.ts`

**Purpose:** produce a lightweight search index (e.g., reverse index or Lunr-style JSON) that can be merged with other site indices or loaded client-side.

**What goes in:** tokenized fields (name, summary, features, tags), plus a compact payload to resolve to routes (e.g., `/packages/[slug]`).

**Output (example):** `public/generated/packages.search.json`

```json
{
  "generatedAt": "2025-02-15T10:31:10.000Z",
  "index": { "local": [0, 12, 19], "seo": [0, 7], "content": [4] },
  "docs": [
    { "id": 0, "slug": "local-seo-starter", "title": "Local SEO Starter", "url": "/packages/local-seo-starter" }
  ]
}
```

**Usage**

```bash
pnpm tsx scripts/packages/build-unified-search.ts \
  --out=public/generated/packages.search.json \
  --minify
```

**Flags**

* `--out=<file>`
* `--minify` | `--pretty`
* `--registry-root=<dir>`
* `--stopwords=<file>` (optional)

> Keep the index **small**. Favor a simple inverted index + doc list over heavyweight formats unless you truly need them.

---

## Stats — `packages-stats.ts`

**Purpose:** compute and print useful stats for QA and dashboards.

**Examples:** total packages, with/without monthly/setup, min/avg/max monthly, count by service, duplicates (if any).

**Stdout (example):**

```
Packages: 24
With monthly: 21  •  With setup: 12
Avg monthly: $1,450  •  Min: $300  •  Max: $6,000
By service:
  seo-services: 9
  marketing-services: 5
  content-services: 4
  web-development: 4
  video-production: 2
Duplicates: none
```

**JSON output (optional):**

```json
{
  "generatedAt": "2025-02-15T10:31:20.000Z",
  "total": 24,
  "withMonthly": 21,
  "withSetup": 12,
  "avgMonthly": 1450,
  "minMonthly": 300,
  "maxMonthly": 6000,
  "services": { "seo-services": 9, "marketing-services": 5, "content-services": 4, "web-development": 4, "video-production": 2 }
}
```

**Usage**

```bash
# Console report
pnpm tsx scripts/packages/packages-stats.ts

# Write JSON
pnpm tsx scripts/packages/packages-stats.ts --out=.artifacts/packages.stats.json --minify
```

**Flags**

* `--out=<file>` — write JSON in addition to console
* `--minify` | `--pretty`
* `--registry-root=<dir>`

---

## How these scripts integrate with the library

All scripts should **only** read packages via the loader:

```ts
import {
  discoverPackageEntries,
  loadAllPackages,
  indexBySlug
} from "@/packages/lib/registry/loader";
```

When building presentation models (cards, detail super-cards, includes tables), prefer the **mappers/adapters**:

```ts
import {
  buildPackageCardProps,
  buildPackageDetailOverviewProps
} from "@/packages/lib/mappers/package-mappers";

import { buildServiceJsonLd } from "@/packages/lib/utils/jsonld";
import { startingAtLabel } from "@/packages/lib/utils/pricing";
```

This guarantees:

* **Validation** through `parsePackage` (SSOT schema)
* **Deterministic adapters** (pure functions, no React)
* **Separation of concerns** (scripts don’t import UI components)

---

## CI suggestions

* **Pre-build gate:** `packages:validate` (or `validate.ts --all`)
* **Build artifacts:** run `packages:build` to generate manifest, catalog, search, and stats
* **Cache:** cache `src/packages/registry/**/content.generated.json` and generated files between CI runs when possible
* **Fail fast:** don’t proceed to `catalog` or `search` if `validate` fails

Example GitHub Actions step:

```yaml
- name: Packages — Validate
  run: pnpm tsx scripts/packages/validate.ts --all

- name: Packages — Build artifacts
  if: success()
  run: pnpm tsx scripts/packages/build.ts
```

---

## Troubleshooting

* **“Cannot find module '@/packages/lib/…'”**
  Ensure your TS/Node path alias resolves `@/` → `src/`. For tsx/esbuild, set `tsconfig.compilerOptions.paths`.

* **Validation fails with Zod issues**
  The log prints `file` and schema `path`. Open the JSON at that path and fix the field (most common: missing `price.currency`, malformed `includes`, or wrong `slug`).

* **Duplicates detected**
  Two different directories contain the same `slug`. Rename one slug or consolidate. Duplicate slugs can break SSG route generation.

* **No featured config found**
  That’s OK if you don’t use featured rails. Add ENV or `config/featured.json` when ready.

* **Search index too big**
  Reduce tokenized fields, lower the feature count included, or minify without pretty-printing.

---

## Glossary

* **Registry** — the on-disk tree under `src/packages/registry/**/<slug>/content.generated.json`
* **SSOT** — single source of truth schema in `src/packages/lib/package-schema.ts`
* **Loader** — `src/packages/lib/registry/loader.ts` that discovers/reads/validates
* **Adapters/Mappers** — pure functions that turn runtime packages into view models
* **Catalog** — consolidated JSON for hubs/lists
* **Unified search** — small inverted index + docs list for client/server search

---

If you want, I can also produce concrete implementations for any scripts you haven’t finalized yet (e.g., MDX conversion, catalog/search specifics) tailored to your exact registry layout and adapter shapes.
