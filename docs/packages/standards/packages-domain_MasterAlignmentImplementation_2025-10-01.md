title: "Packages Domain — Master Alignment Implementation"
domain: "packages"
file: "packages-domain_MasterAlignmentImplementation_2025-10-01.md"
main: "packages-domain"
qualifier: "MasterAlignmentImplementation"
date: "2025-10-01"
time: 11:44am
status: "Approved"
owners: ["@yourname"]
tags: ["packages","schemas","normalizer","build","mdx","pricing","tiers","zod","nextjs","ci","runtime"]
spotlight:
  - "Implements aligned External (public) and Internal (pricing) schemas"
  - "Adds a normalizer that bridges nested external docs to normalized top-level fields"
  - "Generates one per-slug external JSON plus a small index.json (fixes the 'one big JSON' issue)"
  - "Includes internal-tier preview with a public rendering toggle"
  - "Keeps runtime shape unchanged: base.ts → mappers → UI"
summary: "Paste-ready implementation of the master alignment for the Packages domain: Zod schemas for External and Internal docs, a normalizer to produce the runtime-friendly shape, a per-slug build that compiles MDX sections and merges pricing, and wiring that preserves the typed base.ts → mappers → UI flow while enabling an internal-tier toggle and robust validation."
links:
  related: []

-----
10-01-2025 | 11:44am
---
Locked to your master alignment ✅

Below are paste-ready files that implement your **exact contract** (nested External doc with phased blocks **plus** normalized top-level fields), the **internal-tier toggle**, the **per-slug build**, and the **typed runtime** that keeps `base.ts → mappers → UI` unchanged.

I’ve split this into small, drop-in files with clear paths.

---

# 1) Schemas (External doc + Internal pricing)

**File:** `src/packages/lib/registry/schemas.aligned.ts`

```ts
import { z } from "zod";

/** ---------- Money / Price ---------- */
export const Currency = z.enum(["USD", "EUR", "GBP"]);
export const Money = z.object({
  amount: z.number().positive(),
  currency: Currency,
});
export const Price = z.object({
  monthly: Money.optional(),
  oneTime: Money.optional(),
}).refine(p => p.monthly || p.oneTime, {
  message: "Price must include monthly or oneTime (or omit price entirely)",
});

/** ---------- Internal pricing (never shipped) ---------- */
export const InternalTier = z.object({
  name: z.string().min(1),
  best_for: z.string().optional(),
  problem_solved: z.string().optional(),
  includes: z.array(z.string()).default([]),
  price: z.object({
    monthly: z.number().nullable().optional(),
    oneTime: z.number().nullable().optional(),
    currency: z.literal("USD").default("USD"),
  }).transform(p => {
    // normalize to public Price (Money) shape
    const toMoney = (n?: number | null) => (typeof n === "number" ? { amount: n, currency: "USD" as const } : undefined);
    return { monthly: toMoney(p.monthly), oneTime: toMoney(p.oneTime) };
  }),
  is_public: z.boolean().optional(),
});

export const InternalPricingDoc = z.object({
  id: z.string().min(1),
  service: z.string().min(1),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  tiers: z.array(InternalTier).min(1),
  sales_notes: z.object({
    upsell: z.record(z.string()).optional(),
    discounts: z.string().optional(),
    effective: z.string().optional(),
    review: z.string().optional(),
  }).optional(),
});

/** ---------- External doc (generated; runtime) ---------- */
const Meta = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  service: z.string().min(1),
  category: z.string().optional(),
  tier: z.string().optional(),
  badges: z.union([z.array(z.string()), z.string()]).optional(),
  tags: z.array(z.string()).optional(),
});

const Hero = z.object({
  seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
  summary: z.string().min(1),
  description: z.string().optional(),
  image: z.object({ src: z.string(), alt: z.string().optional() }).optional(),
  ctas: z.object({
    details: z.string().url().optional(),
    book_a_call: z.string().optional(),
    request_proposal: z.string().optional(),
  }).optional(),
});

const Narrative = z.object({
  overviewHtml: z.string().optional(),
  purposeHtml: z.string().optional(),
  faqHtml: z.string().optional(),
  notesHtml: z.string().optional(),
}).partial();

const Why = z.object({
  pain_points: z.array(z.string()).optional(),
  icp: z.string().optional(),
  outcomes: z.array(z.string()).optional(),
}).partial();

const WhatIncludes = z.object({
  group_name: z.string(),
  bullets: z.array(z.string().min(1)),
});

const What = z.object({
  highlights: z.array(z.string()).optional(),
  includes: z.array(WhatIncludes).optional(),
  deliverables: z.array(z.string()).optional(),
}).partial();

const DetailsAndTrust = z.object({
  pricing: z.object({
    monthly: z.number().nullable().optional(),
    oneTime: z.number().nullable().optional(),
    currency: z.literal("USD").default("USD"),
  }).optional(),
  price_band: z.object({
    tagline: z.string().optional(),
    base_note: z.enum(["proposal", "final"]).optional(),
    fine_print: z.string().optional(),
  }).optional(),
  timeline: z.object({
    setup: z.string().optional(),
    launch: z.string().optional(),
    ongoing: z.string().optional(),
  }).optional(),
  requirements: z.array(z.string()).optional(),
  caveats: z.array(z.string()).optional(),
}).partial();

const NextStep = z.object({
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  cross_sell: z.object({
    related: z.array(z.string()).optional(),
    add_ons: z.array(z.string()).optional(),
  }).optional(),
  notes: z.string().nullable().optional(),
}).partial();

/** ExternalDoc (nested) as per your table */
export const ExternalDoc = z.object({
  meta: Meta,
  hero: Hero,
  narrative: Narrative.optional(),
  why_you_need_this: Why.optional(),
  what_you_get: What.optional(),
  details_and_trust: DetailsAndTrust.optional(),
  next_step: NextStep.optional(),

  /** Normalized top-level fields the app expects today */
  price: Price.optional(),
  priceBand: z.object({
    tagline: z.string().optional(),
    baseNote: z.enum(["proposal", "final"]).optional(),
    finePrint: z.string().optional(),
    ctas: z.any().array().optional(), // UI maps these; kept loose by design
  }).optional(),
  includesGroups: z.array(z.object({ title: z.string(), items: z.array(z.string().min(1)) })).optional(),
  includesTable: z.object({ title: z.string().optional(), caption: z.string().optional(), rows: z.array(z.string().min(1)) }).optional(),
  extras: z.object({
    timelineBlocks: z.array(z.object({ title: z.string(), description: z.string() })).optional(),
    requirements: z.array(z.string()).optional(),
    ethics: z.array(z.string()).optional(),
  }).optional(),
  features: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
  crossSell: z.array(z.object({ slug: z.string(), label: z.string() })).optional(),
  addOns: z.array(z.object({ slug: z.string(), label: z.string() })).optional(),

  /** Internal-tier preview + toggle (future public surface) */
  internal_tiers: z.array(InternalTier).optional(),
  ui: z.object({ showTieredPricing: z.boolean().optional() }).optional(),
}).superRefine((doc, ctx) => {
  if (!doc.includesGroups && !doc.includesTable) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Provide includesGroups or includesTable" });
  }
});
export type ExternalDocT = z.infer<typeof ExternalDoc>;
export type InternalPricingDocT = z.infer<typeof InternalPricingDoc>;
```

---

# 2) Normalizer & bridge to your current runtime/base.ts

**Goal:** Accept the *nested* External doc (your table) and **produce the normalized top-level fields** your mappers & PDO already consume. Also, mirror the **tier toggle**.

**File:** `src/packages/lib/registry/normalize.aligned.ts`

```ts
import { ExternalDocT } from "./schemas.aligned";

/** Convert nested sections → normalized top-level for runtime */
export function normalizeExternalDoc(doc: ExternalDocT): ExternalDocT {
  const normalized: ExternalDocT = { ...doc };

  // price: prefer details_and_trust.pricing (Mode A) unless price already set
  if (!normalized.price) {
    const p = normalized.details_and_trust?.pricing;
    if (p && (p.monthly || p.oneTime)) {
      const toMoney = (n?: number | null) => (typeof n === "number" ? { amount: n, currency: "USD" as const } : undefined);
      normalized.price = { monthly: toMoney(p.monthly ?? undefined), oneTime: toMoney(p.oneTime ?? undefined) };
    }
  }

  // priceBand: normalize keys (base_note → baseNote, fine_print → finePrint)
  if (!normalized.priceBand && normalized.details_and_trust?.price_band) {
    const b = normalized.details_and_trust.price_band;
    normalized.priceBand = { tagline: b.tagline, baseNote: b.base_note, finePrint: b.fine_print };
  }

  // includesGroups / includesTable
  if (!normalized.includesGroups && normalized.what_you_get?.includes) {
    normalized.includesGroups = normalized.what_you_get.includes.map(g => ({
      title: g.group_name,
      items: g.bullets,
    }));
  }
  if (!normalized.includesTable && normalized.includesGroups) {
    // optional: create a 1-col table from groups (not required)
  }

  // features & outcomes (ensure top-level)
  if (!normalized.features && normalized.what_you_get?.highlights) {
    normalized.features = normalized.what_you_get.highlights;
  }
  if (!normalized.outcomes && normalized.why_you_need_this?.outcomes) {
    normalized.outcomes = normalized.why_you_need_this.outcomes;
  }

  // extras.timelineBlocks
  if (!normalized.extras) normalized.extras = {};
  if (!normalized.extras.timelineBlocks && normalized.details_and_trust?.timeline) {
    const t = normalized.details_and_trust.timeline;
    normalized.extras.timelineBlocks = [
      t.setup && { title: "Setup", description: t.setup },
      t.launch && { title: "Launch", description: t.launch },
      t.ongoing && { title: "Ongoing", description: t.ongoing },
    ].filter(Boolean) as { title: string; description: string }[];
  }
  // extras.requirements / ethics
  if (!normalized.extras.requirements && normalized.details_and_trust?.requirements) {
    normalized.extras.requirements = normalized.details_and_trust.requirements;
  }
  if (!normalized.extras.ethics && normalized.details_and_trust?.caveats) {
    normalized.extras.ethics = normalized.details_and_trust.caveats;
  }

  return normalized;
}

/** (Optional) minimal facade for existing mappers that expect flat keys */
export function toAuthoringBase(normalized: ExternalDocT) {
  return {
    id: normalized.meta.id,
    slug: normalized.meta.slug,
    service: normalized.meta.service,
    category: normalized.meta.category,
    tier: normalized.meta.tier,
    badges: normalized.meta.badges,
    tags: normalized.meta.tags ?? [],

    // hero / meta
    summary: normalized.hero.summary,
    seo: normalized.hero.seo,
    description: undefined, // prefer narrative.overviewHtml for long form
    image: normalized.hero.image,

    // narrative
    descriptionHtml: normalized.narrative?.overviewHtml,
    purposeHtml: normalized.narrative?.purposeHtml,
    notesHtml: normalized.narrative?.notesHtml,
    faqHtml: normalized.narrative?.faqHtml,

    // content
    outcomes: normalized.outcomes ?? [],
    features: normalized.features ?? [],
    includesGroups: normalized.includesGroups,
    includesTable: normalized.includesTable,
    extras: normalized.extras,

    // pricing
    price: normalized.price,
    priceBand: normalized.priceBand,

    // rails
    crossSell: normalized.crossSell,
    addOns: normalized.addOns,

    // tiers preview + toggle
    internalTiers: normalized.internal_tiers,
    ui: normalized.ui,
  };
}
```

---

# 3) Build script (per-slug generation; MDX → HTML; pricing merge; toggle)

**File:** `scripts/build-packages.aligned.ts`

```ts
#!/usr/bin/env tsx
import path from "node:path";
import { promises as fs } from "node:fs";
import matter from "gray-matter";
import fg from "fast-glob";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";
import { ExternalDoc, ExternalDocT, InternalPricingDoc, InternalPricingDocT } from "@/packages/lib/registry/schemas.aligned";
import { normalizeExternalDoc } from "@/packages/lib/registry/normalize.aligned";

const DOCS_ROOT = "docs/packages/catalog";
const OUT_DIR = "src/data/packages/__generated__";
const OUT_PACKAGES = path.join(OUT_DIR, "packages");

const PRICING_SOURCE: "prefer-internal" | "internal" | "frontmatter" = "prefer-internal";

const mdToHtml = async (md?: string) => {
  if (!md) return undefined;
  const file = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype, { allowDangerousHtml: true }).use(rehypeRaw).use(rehypeStringify).process(md);
  const html = String(file.value || "").trim();
  return html || undefined;
};

const sliceBy = (body: string, start: string, end?: string) => {
  const s = body.indexOf(start);
  if (s < 0) return "";
  const e = end ? body.indexOf(end) : -1;
  return body.slice(s, e >= 0 ? e : undefined);
};

async function buildOne(publicMdxPath: string) {
  const dir = path.dirname(publicMdxPath); // package folder
  const internalJsonPath = path.join(dir, "internal.json");

  const mdxRaw = await fs.readFile(publicMdxPath, "utf8");
  const { data: fm, content: body } = matter(mdxRaw);

  // Compile narrative HTML sections
  const overviewHtml = await mdToHtml(sliceBy(body, "## Overview", "##"));
  const purposeHtml  = await mdToHtml(sliceBy(body, "## Purpose",  "##"));
  const notesHtml    = await mdToHtml(sliceBy(body, "## Notes",    "##"));
  const faqHtml      = await mdToHtml(sliceBy(body, "## FAQ",      undefined));

  // Optional internal pricing
  let internal: InternalPricingDocT | undefined;
  try {
    const raw = JSON.parse(await fs.readFile(internalJsonPath, "utf8"));
    internal = InternalPricingDoc.parse(raw);
  } catch { /* optional */ }

  /** Build nested ExternalDoc from frontmatter (+ narrative) */
  const nested: ExternalDocT = ExternalDoc.parse({
    meta: {
      id: fm.id, slug: fm.slug, service: fm.service,
      category: fm.category, tier: fm.tier, badges: fm.badges, tags: fm.tags,
    },
    hero: {
      seo: fm.seo, summary: fm.summary,
      description: fm.description, image: fm.image, ctas: fm.ctas,
    },
    narrative: { overviewHtml, purposeHtml, notesHtml, faqHtml },
    why_you_need_this: { pain_points: fm.pain_points, icp: fm.icp, outcomes: fm.outcomes },
    what_you_get: {
      highlights: fm.features,
      includes: fm.includesGroups
        ? fm.includesGroups.map((g: any) => ({ group_name: g.title, bullets: g.items }))
        : fm.what_you_get?.includes,
      deliverables: fm.deliverables,
    },
    details_and_trust: {
      pricing: PRICING_SOURCE !== "frontmatter" && internal?.tiers?.[0]?.price ? {
        monthly: internal.tiers[0].price.monthly?.amount ?? null,
        oneTime: internal.tiers[0].price.oneTime?.amount ?? null,
        currency: "USD",
      } : (PRICING_SOURCE !== "internal" ? fm.pricing : undefined),
      price_band: fm.priceBand ? {
        tagline: fm.priceBand.tagline,
        base_note: fm.priceBand.baseNote,
        fine_print: fm.priceBand.finePrint,
      } : undefined,
      timeline: fm.extras?.timeline ? fm.extras.timeline : fm.timeline,
      requirements: fm.extras?.requirements ?? fm.requirements,
      caveats: fm.extras?.ethics ?? fm.caveats,
    },
    next_step: {
      faqs: fm.faqs,
      cross_sell: fm.crossSell || fm.next_step?.cross_sell,
      notes: fm.next_step?.notes,
    },

    // allow author to pre-normalize if they want; we’ll fill any gaps
    price: fm.price,
    priceBand: fm.priceBand,
    includesGroups: fm.includesGroups,
    includesTable: fm.includesTable,
    extras: fm.extras,
    features: fm.features,
    outcomes: fm.outcomes,
    crossSell: fm.crossSell,
    addOns: fm.addOns,

    internal_tiers: internal?.tiers,
    ui: fm.ui,
  });

  // Normalize → ensure top-level fields populated from nested sections
  const external = normalizeExternalDoc(nested);

  // Final guard: at least one includes path
  if (!external.includesGroups && !external.includesTable) {
    throw new Error(`Includes missing for ${external.meta.slug}`);
  }

  // Write artifact
  await fs.mkdir(OUT_PACKAGES, { recursive: true });
  await fs.writeFile(
    path.join(OUT_PACKAGES, `${external.meta.slug}.external.json`),
    JSON.stringify(external, null, 2),
    "utf8",
  );

  return {
    id: external.meta.id,
    slug: external.meta.slug,
    service: external.meta.service,
    category: external.meta.category,
    tags: external.meta.tags ?? [],
    summary: external.hero.summary,
    hasPrice: Boolean(external.price?.monthly || external.price?.oneTime),
  };
}

async function run() {
  const mdxPaths = await fg(`${DOCS_ROOT}/**/public.mdx`, { dot: false });
  const items = [];
  for (const p of mdxPaths) items.push(await buildOne(p));

  await fs.mkdir(OUT_DIR, { recursive: true });
  await fs.writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify({ items }, null, 2), "utf8");
  console.log(`✔ Built ${items.length} packages`);
}
run().catch(e => { console.error(e); process.exit(1); });
```

---

# 4) base.ts, details.ts, card.ts (runtime ergonomics unchanged)

**File:** `src/packages/registry/<service>/<slug>/base.ts`

```ts
import generated from "@/data/packages/__generated__/packages/<slug>.external.json";
import type { ExternalDocT } from "@/packages/lib/registry/schemas.aligned";

// We export the normalized external doc as the typed base object
export const base: ExternalDocT = generated;
```

**File:** `src/packages/registry/<service>/<slug>/details.ts`

```ts
import { base } from "./base";
import { toPackageDetailOverviewProps } from "@/packages/lib/registry/adapter.pdo"; // your existing adapter → PDO
export default toPackageDetailOverviewProps(base);
```

**File:** `src/packages/registry/<service>/<slug>/card.ts`

```ts
import { base } from "./base";
import { buildDefaultCard } from "@/packages/lib/registry/mappers"; // existing card mapper
export default buildDefaultCard(base);
```

> If your current mappers expect slightly different names, keep your adapter thin (e.g., re-export `base.meta.id` as `id`, etc.). The **normalizer** already filled all the top-level fields.

---

# 5) Adapter to PDO (kept minimal; band owns defaults)

**File:** `src/packages/lib/registry/adapter.pdo.ts`

```ts
import type { ExternalDocT } from "./schemas.aligned";

export type PackageDetailOverviewProps = {
  id: string;
  title: string;
  tagline?: string;
  meta?: { category?: string; tags: string[] };
  descriptionHtml?: string;
  outcomes?: string[];
  includes?: {
    groups?: Array<{ title: string; items: string[] }>;
    table?:  { title?: string; caption?: string; rows: string[] };
  };
  notesHtml?: string;
  priceBand?: {
    price?: { monthly?: { amount:number; currency:"USD"|"EUR"|"GBP" }, oneTime?: { amount:number; currency:"USD"|"EUR"|"GBP" } };
    tagline?: string; baseNote?: "proposal" | "final"; finePrint?: string; ctas?: any[];
  };
  sticky?: { summary?: string };
  extras?: ExternalDocT["extras"];
  faqHtml?: string;
  crossSell?: ExternalDocT["crossSell"];
  addOns?: ExternalDocT["addOns"];
};

export function toPackageDetailOverviewProps(pkg: ExternalDocT): PackageDetailOverviewProps {
  return {
    id: pkg.meta.id,
    title: pkg.meta.slug.replace(/-/g, " "), // or prefer hero.seo?.title/name if you store it
    tagline: pkg.hero.summary,
    meta: { category: pkg.meta.category, tags: pkg.meta.tags ?? [] },
    descriptionHtml: pkg.narrative?.overviewHtml,
    outcomes: pkg.outcomes ?? pkg.why_you_need_this?.outcomes ?? [],
    includes: { groups: pkg.includesGroups, table: pkg.includesTable },
    notesHtml: pkg.narrative?.notesHtml,
    priceBand: {
      ...(pkg.priceBand ?? {}),
      price: pkg.price ?? pkg.priceBand?.price,
    },
    sticky: { summary: pkg.hero.summary },
    extras: pkg.extras,
    faqHtml: pkg.narrative?.faqHtml,
    crossSell: pkg.crossSell,
    addOns: pkg.addOns,
  };
}
```

---

# 6) CI & scripts

**package.json (add):**

```json
{
  "scripts": {
    "build:packages": "tsx scripts/build-packages.aligned.ts",
    "validate:registry": "tsx scripts/validate-packages.ts"
  }
}
```

**.github/workflows/packages.yml (snippet):**

```yml
name: Packages: Build & Validate
on:
  push:
    paths:
      - "docs/packages/**"
      - "scripts/**"
      - "src/packages/lib/registry/**"
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build:packages
      - run: npm run validate:registry
      - uses: actions/upload-artifact@v4
        with:
          name: generated-packages
          path: src/data/packages/__generated__/**
```

*(Your existing `validate-packages.ts` can import `ExternalDoc` to gate schemas and check that each per-slug JSON includes either `includesGroups` or `includesTable`, and—if price exists—has `monthly` or `oneTime`.)*

---

# 7) Authoring guardrails

* **No price prose in MDX.** The builder can lint MDX body for `/\\$\\s*\\d/`.
* **At least one includes path.** Either `includesGroups` or `includesTable`.
* **Currency:** Default USD. If you accept EUR/GBP later, schemas already allow it.
* **JSON-LD:** When `price` missing → omit `offers`. (Your `jsonld.tsx` can detect this.)

---

# 8) Acceptance checklist

* [ ] `build:packages` emits `__generated__/packages/<slug>.external.json` and `index.json`.
* [ ] Each external JSON validates against `ExternalDoc`.
* [ ] `base.ts` compiles by importing the generated JSON (types intact).
* [ ] Detail page renders PDO with/without price.
* [ ] Internal tiers present under `internal_tiers`; when `ui.showTieredPricing === true` **and** any tier has `is_public: true`, your Tiered table component can render from `internal_tiers`; otherwise show `PriceActionsBand`.

---

# 9) What to do next (in one sitting)

1. Paste the three files:

   * `schemas.aligned.ts`
   * `normalize.aligned.ts`
   * `build-packages.aligned.ts`
2. Add the script entries & CI snippet.
3. Switch one package’s `base.ts` to import the generated JSON.
4. Run `npm run build:packages` → load `/packages/<slug>`.

If you want, I can also drop a tiny `validate-packages.ts` with price/MDX linters and a one-file “TieredPricingTable” stub wired to `internal_tiers` + `ui.showTieredPricing`.
