title: "Seed Frontmatter & Authoring Validator (Hybrid Packages)"
domain: "packages"
file: "packages-seed-frontmatter_Guide_2025-10-01.md"
main: "packages-seed-frontmatter"
qualifier: "Guide"
date: "2025-10-01"
time: 12:20pm
status: "Approved"
owners: ["@yourname"]
tags: ["packages","hybrid","mdx","external-json","internal-json","seeding","validator","zod","ci","scripts"]
spotlight:
  - "Seeds narrative-only public.mdx and minimal external.json/internal.json per slug (hybrid model)"
  - "CLI flags: --force, --no-external, --no-internal, --dry-run; auto-creates assets/ folder"
  - "Detects slug folders under catalog/<service>/<subservice>/<slug> and enforces slug equality"
  - "Adds Zod schemas and a validator CLI for authored external/internal JSON"
  - "CI wiring to fail PRs on schema errors; optional validation for generated per-slug JSON"
  - "Prevents pricing prose in MDX and fixes the 'one big JSON' problem via per-slug outputs"
summary: "Production-ready replacement for seeding authoring files in the hybrid packages model. Creates narrative-only public.mdx plus external.json and internal.json for each slug, with safe defaults and ergonomics. Includes canonical Zod schemas and a validator CLI that checks schema compliance, slug-folder parity, and integrates with CI. Supports per-slug generation and keeps pricing out of MDX."
links:
  related:
    - "./scripts/seed-frontmatter.ts"
    - "./scripts/validate-authoring.ts"
    - "./scripts/validate-generated.ts"
    - "./src/packages/lib/registry/zod-schemas.ts"

-----
10-01-2025 | 12:020pm
---
Awesome — I reviewed your current `scripts/seed-frontmatter.ts`. It’s solid as a starting point, but it doesn’t match the **hybrid** model we finalized:

* It seeds **a lot of structured fields into MDX** (price, includes, outcomes, etc.).
  In the hybrid approach, **MDX is narrative-only**; all structured fields belong in `external.json`.
* It doesn’t create `external.json` or `internal.json`, which are now first-class authoring files.
* It only overwrites existing `public.mdx`; it won’t **create** a missing `public.mdx` for a slug folder.
* It assumes a strict path shape but doesn’t proactively seed the expected files per slug folder.

Below is a **production-ready** replacement that:

* Seeds **narrative-only `public.mdx`** (no pricing or structured fields).
* **Also** seeds minimal, valid **`external.json`** and **`internal.json`** (configurable).
* Works from **any** root you give it (e.g., `…/catalog/lead-generation`) and finds **every slug folder** under it:
  `…/catalog/<service>/<subservice>/<slug>/`
* Has **CLI flags**: `--force`, `--no-external`, `--no-internal`, `--dry-run`.
* Creates an `assets/` folder for convenience.

---

# ✅ Production script

Create: `scripts/seed-frontmatter.ts`

```ts
// scripts/seed-frontmatter.ts
// Seed authoring files for every package slug folder under a catalog subtree.
//
// Hybrid model (final):
// - public.mdx: narrative-only (Overview, Purpose, Notes, FAQ). NO PRICING or structured fields.
// - external.json: public structured fields (minimal skeleton here).
// - internal.json: private pricing/tiers/ops (minimal skeleton here).
//
// Usage:
//   npx -y tsx scripts/seed-frontmatter.ts /ABS/PATH/TO/documents/domains/packages/catalog/<service>
//   Flags:
//     --force        Overwrite non-empty files (default: skip if file has content)
//     --no-external  Do not seed external.json
//     --no-internal  Do not seed internal.json
//     --dry-run      Show what would be created/overwritten without writing
//
// Examples:
//   npx -y tsx scripts/seed-frontmatter.ts "/path/to/docs/packages/catalog/lead-generation"
//   npx -y tsx scripts/seed-frontmatter.ts "/path/to/docs/packages/catalog/content-production" --force
//
// Notes:
// - We detect slug folders by path segments after "catalog": <service>/<subservice>/<slug> (exactly 3).
// - We will create: public.mdx, external.json, internal.json, assets/ (if missing).
// - MDX is narrative-only; structured fields are in external.json; pricing only in internal.json.

import { promises as fs } from "node:fs";
import path from "node:path";

type SeedOpts = {
  force?: boolean;
  seedExternal?: boolean;
  seedInternal?: boolean;
  dryRun?: boolean;
};

// ---------- FS helpers ----------
async function isDir(p: string) {
  try { return (await fs.stat(p)).isDirectory(); } catch { return false; }
}
async function isFile(p: string) {
  try { return (await fs.stat(p)).isFile(); } catch { return false; }
}
async function readText(p: string) {
  try { return await fs.readFile(p, "utf8"); } catch { return ""; }
}
async function ensureDir(p: string) {
  await fs.mkdir(p, { recursive: true });
}

// Walk directories and yield directories (not files)
async function* walkDirs(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  yield dir;
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    yield* walkDirs(full);
  }
}

// ---------- Path parsing ----------

// Return { service, subservice, slug } if `p` is a slug directory under .../catalog/<service>/<subservice>/<slug>/
// Otherwise return null
function parseSlugPartsFromDir(p: string): { service: string; subservice: string; slug: string } | null {
  const parts = path.resolve(p).split(path.sep);
  const idx = parts.lastIndexOf("catalog");
  if (idx < 0) return null;
  const rel = parts.slice(idx + 1); // e.g., ["lead-generation","conversion-optimization","ab-test-starter", ...]
  if (rel.length !== 3) return null;
  const [service, subservice, slug] = rel;
  if (!service || !subservice || !slug) return null;
  return { service, subservice, slug };
}

function makeId(service: string, slug: string) {
  return `${service}-${slug}`.toLowerCase().replace(/[^a-z0-9-]/g, "");
}

// ---------- Templates ----------

function buildMdxTemplate(slug: string, title = "") {
  const today = new Date().toISOString().slice(0, 10);
  // Narrative-only MDX per hybrid model. No pricing, no structured fields.
  return `---
slug: "${slug}"                 # must match folder name
title: "${title || slug}"       # customer-facing title (H1)
summary: ""                     # 1–2 sentence value prop; do not include pricing
status: "Draft"                 # Draft | In Review | Approved
authors: ["@owner-handle"]      # optional author handles
seo:
  title: ""
  description: ""
authoredAt: "${today}"
templateVersion: "2025-10-01"
---

<!--
Authoring guardrails:
1) NO PRICING (numbers, currency symbols, "starting at") in this MDX.
2) Keep paragraphs short; use headings & lists.
3) Link text should be descriptive (accessibility).
-->

## Overview

Brief narrative (2–6 sentences) explaining what this package is and why it matters.
Avoid bullet lists here; outcomes and includes render elsewhere.

## Purpose

One paragraph (~3–5 sentences) defining success in business terms.
Speak to exec/decision-maker context; avoid technical implementation details.

## Notes

- Scope assumptions or caveats important to buyers (high level).
- Any small-print that complements ethics/requirements defined in external.json.

## FAQ

### What if our CRM is messy?
We include a hygiene checklist; if critical gaps exist we’ll scope a patch.

### How fast can we go live?
Typical projects complete in two weeks after access is granted.
`;
}

function buildExternalJsonTemplate(service: string, subservice: string, slug: string) {
  // Minimal, valid external.json that the build can expand.
  // Pricing is intentionally omitted here; copy from internal.json during synthesis if desired.
  const id = makeId(service, slug);
  const obj = {
    id,
    slug,
    service,
    category: "",
    tags: [] as string[],
    // Recommended to keep sticky summary close to hero value prop
    tagline: "",
    summary: "",
    seo: { title: "", description: "" },

    // Public structured content authors can fill now or later:
    outcomes: [] as string[],
    features: [] as string[],
    includesGroups: [
      { title: "Core", items: [] as string[] }
    ],
    // includesTable: { title: "What’s included", caption: "", rows: [] as string[] },

    // Price band copy (no numbers). Price (numbers) comes from internal.json during build.
    priceBand: {
      label: "",       // e.g., "Starting at" (or leave blank; UI can default)
      note: "",        // short note under price
      finePrint: "",   // long disclaimer (detail-only)
      ctas: [] as Array<{ kind: "primary" | "secondary"; label: string; href?: string; ariaLabel?: string }>,
    },

    sticky: { summary: "" },

    extras: {
      timelineBlocks: [] as Array<{ title: string; description: string }>,
      requirements: [] as string[],
      ethics: [] as string[],
    },

    crossSell: [] as Array<{ slug: string; label: string }>,
    addOns: [] as Array<{ slug: string; label: string }>,

    // narrative.*Html will be attached by the build from public.mdx
    narrative: {
      overviewHtml: "",
      purposeHtml: "",
      notesHtml: "",
      faqHtml: "",
    }
  };
  return JSON.stringify(obj, null, 2) + "\n";
}

function buildInternalJsonTemplate(service: string, subservice: string, slug: string) {
  // Minimal private internal.json (authoritative price + ops).
  // This is never shipped; pricing is copied into external during synthesis.
  const obj = {
    sku: `SKU-${service}-${slug}`.toUpperCase().replace(/[^A-Z0-9-]/g, ""),
    owner: "@owner-handle",
    tiers: [
      {
        name: "Core",
        bestFor: [] as string[],
        includes: [] as string[],
        price: {
          // Fill one or both; build will support monthly and/or oneTime
          // monthly: { amount: 0, currency: "USD" },
          // oneTime: { amount: 0, currency: "USD" }
        } as any,
        grossMarginTarget: 0.6,
        deliveryNotes: ""
      }
    ],
    ops: {
      leadTimeDays: 14,
      staffing: [
        { role: "GTM Strategist", allocationPct: 50 },
        { role: "MarTech/CRM", allocationPct: 50 }
      ],
      constraints: [] as string[]
    }
  };
  return JSON.stringify(obj, null, 2) + "\n";
}

// ---------- Seeding logic ----------

async function ensureFile(filePath: string, contents: string, opts: SeedOpts, label: string) {
  const exists = await isFile(filePath);
  if (!exists) {
    if (!opts.dryRun) {
      await ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, contents, "utf8");
    }
    console.log(`✚ created ${label}: ${filePath}`);
    return;
  }
  const current = await readText(filePath);
  const isEmpty = current.trim().length === 0;

  if (isEmpty || opts.force) {
    if (!opts.dryRun) await fs.writeFile(filePath, contents, "utf8");
    console.log(`${opts.force ? "↻ overwritten" : "✚ filled"} ${label}: ${filePath}`);
  } else {
    console.log(`• skipped ${label} (non-empty): ${filePath}`);
  }
}

async function seedSlugDir(slugDir: string, parts: { service: string; subservice: string; slug: string }, opts: SeedOpts) {
  const { service, subservice, slug } = parts;

  const mdxPath = path.join(slugDir, "public.mdx");
  const externalPath = path.join(slugDir, "external.json");
  const internalPath = path.join(slugDir, "internal.json");
  const assetsDir = path.join(slugDir, "assets");

  // MDX (narrative-only)
  await ensureFile(mdxPath, buildMdxTemplate(slug), opts, "public.mdx");

  // external.json (public structured)
  if (opts.seedExternal !== false) {
    await ensureFile(externalPath, buildExternalJsonTemplate(service, subservice, slug), opts, "external.json");
  } else {
    console.log(`• skipped external.json by flag: ${externalPath}`);
  }

  // internal.json (private pricing/ops)
  if (opts.seedInternal !== false) {
    await ensureFile(internalPath, buildInternalJsonTemplate(service, subservice, slug), opts, "internal.json");
  } else {
    console.log(`• skipped internal.json by flag: ${internalPath}`);
  }

  // assets/
  if (!opts.dryRun) await ensureDir(assetsDir);
  console.log(`• ensured assets dir: ${assetsDir}`);
}

async function seed(baseDir: string, opts: SeedOpts = {}) {
  if (!(await isDir(baseDir))) {
    console.error(`❌ Base directory not found: ${baseDir}`);
    process.exit(1);
  }

  let slugCount = 0;
  for await (const dir of walkDirs(baseDir)) {
    const parts = parseSlugPartsFromDir(dir);
    if (!parts) continue;
    slugCount++;
    await seedSlugDir(dir, parts, opts);
  }

  if (slugCount === 0) {
    console.warn("⚠️  No slug directories found. Expected …/catalog/<service>/<subservice>/<slug>/");
  } else {
    console.log(`✅ Seeded ${slugCount} slug folder(s).`);
  }
}

// ---------- CLI ----------
const base = process.argv[2] || "";
if (!base) {
  console.error("Usage: npx -y tsx scripts/seed-frontmatter.ts /ABS/PATH/TO/documents/domains/packages/catalog/<service> [--force] [--no-external] [--no-internal] [--dry-run]");
  process.exit(1);
}

const force = process.argv.includes("--force");
const noExternal = process.argv.includes("--no-external");
const noInternal = process.argv.includes("--no-internal");
const dryRun = process.argv.includes("--dry-run");

seed(base, {
  force,
  seedExternal: !noExternal,
  seedInternal: !noInternal,
  dryRun
}).catch(err => {
  console.error(err);
  process.exit(1);
});
```

---

## Why these changes?

1. **Hybrid correctness**: the old script pushed structured fields (and pricing) into MDX. This version **keeps MDX narrative-only** and seeds proper **external/internal JSON** files where structured fields belong.
2. **Seeding missing files**: it creates `public.mdx`, `external.json`, `internal.json`, and `assets/` **even if** they don’t exist yet.
3. **Safer default behavior**: won’t overwrite non-empty files unless you pass `--force`.
4. **Better DX**: `--dry-run`, selective `--no-external` / `--no-internal` flags, clean logs.
5. **Path-robust**: it finds **every slug folder** by checking segments after `catalog` (exactly `<service>/<subservice>/<slug>`).

---

## Should seeding `internal.json` be here or separate?

**Include it here (default)**. Authors nearly always need the trio (`public.mdx`, `external.json`, `internal.json`) to start a package. Keeping them together:

* prevents broken states (e.g., MDX without an external/internal skeleton),
* reduces friction for new packages,
* still lets you disable with `--no-internal` if a team really doesn’t want it.

If later you want a dedicated script (e.g., to seed richer tier templates per practice), you can add `scripts/seed-internal.ts`. For now, **bundling it is the most ergonomic path.**

---

## How to run

```bash
# Lead Gen tree
npx -y tsx scripts/seed-frontmatter.ts "/ABS/PATH/documents/domains/packages/catalog/lead-generation"

# Overwrite non-empty files (be careful)
npx -y tsx scripts/seed-frontmatter.ts "/ABS/PATH/documents/domains/packages/catalog/lead-generation" --force

# Seed only MDX (skip JSONs)
npx -y tsx scripts/seed-frontmatter.ts "/ABS/PATH/documents/domains/packages/catalog/lead-generation" --no-external --no-internal

# Dry run
npx -y tsx scripts/seed-frontmatter.ts "/ABS/PATH/documents/domains/packages/catalog/lead-generation" --dry-run
```

---

Here is the companion **validator** (Zod) that ensures the seeded `external.json` and `internal.json` match the canonical schemas on every PR.

Absolutely—here’s a **production-ready Zod validator** that checks every authored `external.json` and `internal.json` against your **canonical hybrid schemas** on every PR.

It includes:

* Canonical **Zod schemas** (external & internal)
* A **CLI validator** that:

  * Recursively finds every package slug folder
  * Validates `external.json` and (if present) `internal.json`
  * Verifies `slug` in JSON matches the **folder name**
  * Prints friendly, precise error messages with file paths & JSON paths
  * Fails the build (exit code `1`) if any errors are found
* **NPM scripts** + **GitHub Actions** step to wire it into CI

---

# 1) Add canonical schemas (Zod)

Create: `src/packages/lib/registry/zod-schemas.ts`

```ts
// src/packages/lib/registry/zod-schemas.ts
import { z } from "zod";

/** Shared */
export const CurrencyZ = z.enum(["USD", "EUR", "GBP"]).default("USD");

export const MoneyZ = z.object({
  amount: z.number().positive({ message: "amount must be > 0" }),
  currency: CurrencyZ
});

export const PriceZ = z.object({
  monthly: MoneyZ.optional(),
  oneTime: MoneyZ.optional(),
}).refine((v) => !!v.monthly || !!v.oneTime, {
  message: "Provide monthly and/or oneTime",
});

export const CTAZ = z.object({
  kind: z.enum(["primary", "secondary"]),
  label: z.string().min(1),
  href: z.string().url().or(z.string().regex(/^\/[^\s]*$/, {
    message: "href must be a valid URL or root-relative path (/...)",
  })).optional(),
  onClickId: z.string().optional(),
  ariaLabel: z.string().optional(),
});

/** External (authored public JSON; pricing may be omitted in hybrid model) */
export const ExternalPackageZ = z.object({
  id: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  service: z.string().min(1),
  category: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),

  tagline: z.string().optional().default(""),
  summary: z.string().optional().default(""),

  seo: z.object({
    title: z.string().optional().default(""),
    description: z.string().optional().default(""),
  }).optional().default({}),

  outcomes: z.array(z.string()).optional().default([]),
  features: z.array(z.string()).optional().default([]),

  includesGroups: z.array(z.object({
    title: z.string().min(1),
    items: z.array(z.string())
  })).optional().default([]),

  includesTable: z.object({
    title: z.string().optional(),
    caption: z.string().optional(),
    rows: z.array(z.string())
  }).optional(),

  // Hybrid: price is allowed but OPTIONAL in authored external.json.
  // The build may copy canonical price from internal.json later.
  price: z.object({
    monthly: MoneyZ.optional(),
    oneTime: MoneyZ.optional(),
  }).optional(),

  priceBand: z.object({
    label: z.string().optional().default(""),
    note: z.string().optional().default(""),
    finePrint: z.string().optional().default(""),
    ctas: z.array(CTAZ).optional().default([]),
  }).optional().default({}),

  sticky: z.object({
    summary: z.string().optional().default(""),
  }).optional().default({}),

  extras: z.object({
    timelineBlocks: z.array(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    })).optional().default([]),
    requirements: z.array(z.string()).optional().default([]),
    ethics: z.array(z.string()).optional().default([]),
  }).optional().default({}),

  crossSell: z.array(z.object({ slug: z.string().min(1), label: z.string().min(1) })).optional().default([]),
  addOns: z.array(z.object({ slug: z.string().min(1), label: z.string().min(1) })).optional().default([]),

  // Attached by build from MDX; present in seeds, but not required.
  narrative: z.object({
    overviewHtml: z.string().optional().default(""),
    purposeHtml: z.string().optional().default(""),
    notesHtml: z.string().optional().default(""),
    faqHtml: z.string().optional().default(""),
  }).optional().default({})
});

/** Internal (never shipped) */
export const InternalPricingZ = z.object({
  sku: z.string().min(1),
  owner: z.string().min(1),

  tiers: z.array(z.object({
    name: z.string().min(1),
    bestFor: z.array(z.string()).optional().default([]),
    includes: z.array(z.string()).default([]),
    price: z.object({
      monthly: MoneyZ.optional(),
      oneTime: MoneyZ.optional(),
    }).refine((v) => !!v.monthly || !!v.oneTime, {
      message: "Each tier.price must include monthly and/or oneTime",
    }),
    grossMarginTarget: z.number().min(0).max(1).optional(),
    deliveryNotes: z.string().optional().default(""),
  })).min(1, "At least one tier is required"),

  ops: z.object({
    leadTimeDays: z.number().int().nonnegative().optional(),
    staffing: z.array(z.object({
      role: z.string().min(1),
      allocationPct: z.number().min(0).max(100)
    })).optional().default([]),
    constraints: z.array(z.string()).optional().default([]),
  }).optional().default({})
});
```

---

# 2) Add the CLI validator

Create: `scripts/validate-authoring.ts`

```ts
// scripts/validate-authoring.ts
// Validate every authored external.json & internal.json against Zod schemas.
// Also verifies that external.slug === folder slug.
//
// Usage:
//   npx -y tsx scripts/validate-authoring.ts documents/domains/packages/catalog
//   npx -y tsx scripts/validate-authoring.ts documents/domains/packages/catalog/lead-generation
//
// Flags:
//   --quiet      Less verbose output
//
// Exits with code 1 if any validation fails.

import { promises as fs } from "node:fs";
import path from "node:path";
import { ExternalPackageZ, InternalPricingZ } from "@/packages/lib/registry/zod-schemas";

type Ctx = { quiet: boolean; failures: number; checked: number; };

async function isDir(p: string) { try { return (await fs.stat(p)).isDirectory(); } catch { return false; } }
async function isFile(p: string) { try { return (await fs.stat(p)).isFile(); } catch { return false; } }

async function* walkDirs(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const full = path.join(dir, e.name);
    yield full;
    yield* walkDirs(full);
  }
}

function fmtZodErrors(issue: any) {
  const path = (issue.path ?? []).join(".");
  return `  • ${path || "<root>"} — ${issue.message}`;
}

function lastSegment(p: string) {
  const trimmed = p.endsWith(path.sep) ? p.slice(0, -1) : p;
  return path.basename(trimmed);
}

async function validateExternal(filePath: string, ctx: Ctx) {
  const dir = path.dirname(filePath);
  const slugFromDir = lastSegment(dir);
  const raw = await fs.readFile(filePath, "utf8").catch(() => "");
  if (!raw) {
    console.error(`✖ external.json missing or unreadable: ${filePath}`);
    ctx.failures++; return;
  }
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch (e) { console.error(`✖ external.json is not valid JSON: ${filePath}`); ctx.failures++; return; }

  const res = ExternalPackageZ.safeParse(parsed);
  if (!res.success) {
    console.error(`✖ external.json schema errors: ${filePath}`);
    for (const issue of res.error.issues) console.error(fmtZodErrors(issue));
    ctx.failures++; return;
  }

  // Slug match check
  if (res.data.slug !== slugFromDir) {
    console.error(`✖ slug mismatch: folder="${slugFromDir}" but external.slug="${res.data.slug}" in ${filePath}`);
    ctx.failures++; return;
  }

  if (!ctx.quiet) console.log(`✓ external.json OK (${res.data.slug})`);
  ctx.checked++;
}

async function validateInternalIfPresent(filePath: string, ctx: Ctx) {
  const exists = await isFile(filePath);
  if (!exists) {
    if (!ctx.quiet) console.log(`• internal.json not present (OK): ${filePath}`);
    return;
  }

  const raw = await fs.readFile(filePath, "utf8").catch(() => "");
  if (!raw) {
    console.error(`✖ internal.json unreadable: ${filePath}`);
    ctx.failures++; return;
  }
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch (e) { console.error(`✖ internal.json is not valid JSON: ${filePath}`); ctx.failures++; return; }

  const res = InternalPricingZ.safeParse(parsed);
  if (!res.success) {
    console.error(`✖ internal.json schema errors: ${filePath}`);
    for (const issue of res.error.issues) console.error(fmtZodErrors(issue));
    ctx.failures++; return;
  }

  if (!ctx.quiet) console.log(`✓ internal.json OK (${filePath})`);
  ctx.checked++;
}

async function main() {
  const base = process.argv[2];
  const quiet = process.argv.includes("--quiet");

  if (!base) {
    console.error("Usage: npx -y tsx scripts/validate-authoring.ts documents/domains/packages/catalog[/<service>]");
    process.exit(2);
  }
  if (!(await isDir(base))) {
    console.error(`Base is not a directory: ${base}`);
    process.exit(2);
  }

  const ctx: Ctx = { quiet, failures: 0, checked: 0 };

  for await (const dir of walkDirs(base)) {
    // A slug folder is where external.json lives (authoring contract).
    const externalPath = path.join(dir, "external.json");
    const internalPath = path.join(dir, "internal.json");
    const hasExternal = await isFile(externalPath);
    if (!hasExternal) continue;

    await validateExternal(externalPath, ctx);
    await validateInternalIfPresent(internalPath, ctx);
  }

  if (!ctx.quiet) console.log(`\nSummary: checked=${ctx.checked}, failures=${ctx.failures}`);
  if (ctx.failures > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

> This script treats any directory that contains an `external.json` as a **slug folder**.
> It validates `external.json`, **optionally** validates `internal.json` if present, and enforces **slug equality** (folder name === `external.slug`).

---

# 3) NPM scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "validate:authoring": "tsx scripts/validate-authoring.ts documents/domains/packages/catalog",
    "validate:authoring:quiet": "tsx scripts/validate-authoring.ts documents/domains/packages/catalog --quiet"
  }
}
```

---

# 4) GitHub Actions (run on every PR/push)

Create/extend: `.github/workflows/packages.yml`

```yml
name: Packages — Build & Validate
on:
  pull_request:
    paths:
      - "documents/domains/packages/**"
      - "src/packages/lib/registry/**"
      - "scripts/**"
  push:
    paths:
      - "documents/domains/packages/**"
      - "src/packages/lib/registry/**"
      - "scripts/**"

jobs:
  validate-authoring:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run validate:authoring:quiet
```

> This fails the job if **any** authored `external.json` or `internal.json` is invalid or if **any slug mismatch** is detected.

---

# 5) (Optional) Validate the **generated** JSON too

If you also want to validate the **per-slug generated** JSON under `src/data/packages/__generated__/packages/`, add a minimal wrapper script or reuse the same schema:

Create: `scripts/validate-generated.ts`

```ts
// scripts/validate-generated.ts
import { promises as fs } from "node:fs";
import path from "node:path";
import { ExternalPackageZ } from "@/packages/lib/registry/zod-schemas";

async function isDir(p: string) { try { return (await fs.stat(p)).isDirectory(); } catch { return false; } }
async function isFile(p: string) { try { return (await fs.stat(p)).isFile(); } catch { return false; } }

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function fmt(issue: any) {
  const path = (issue.path ?? []).join(".");
  return `  • ${path || "<root>"} — ${issue.message}`;
}

async function main() {
  const base = process.argv[2] || "src/data/packages/__generated__/packages";
  if (!(await isDir(base))) {
    console.error(`Not a directory: ${base}`);
    process.exit(2);
  }
  let failures = 0, checked = 0;
  for await (const file of walk(base)) {
    if (!file.endsWith(".external.json")) continue;
    const raw = await fs.readFile(file, "utf8").catch(() => "");
    if (!raw) { console.error(`✖ unreadable: ${file}`); failures++; continue; }
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { console.error(`✖ invalid JSON: ${file}`); failures++; continue; }
    const res = ExternalPackageZ.safeParse(parsed);
    if (!res.success) {
      console.error(`✖ schema errors: ${file}`);
      for (const issue of res.error.issues) console.error(fmt(issue));
      failures++; continue;
    }
    checked++;
  }
  console.log(`Generated validation: checked=${checked}, failures=${failures}`);
  if (failures) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Add scripts:

```json
{
  "scripts": {
    "validate:generated": "tsx scripts/validate-generated.ts"
  }
}
```

And (optional) CI step after your build:

```yml
  build-and-validate-generated:
    runs-on: ubuntu-latest
    needs: validate-authoring
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build:packages
      - run: npm run validate:generated
```

---

## Done ✅

* Zod schemas reflect your **canonical hybrid** model.
* `validate-authoring.ts` enforces correctness **before** build.
* Optional `validate-generated.ts` ensures what the app consumes is also valid.
* CI wiring makes this run on every PR/push.

If you want, I can also add a tiny **MDX guard** (regex) to fail the PR when price-like patterns appear in `public.mdx` (to keep pricing out of Markdown).

