// src/packages/lib/mdx-frontmatter-schema.ts
/**
 * MDX Frontmatter Schema (author-facing) → PackageSchema (runtime)
 * src/packages/lib/mdx-frontmatter-schema.ts
 * =============================================================================
 * PURPOSE
 * -----------------------------------------------------------------------------
 * 1) Validate author-facing `public.mdx` frontmatter (lenient, ergonomic).
 * 2) Normalize → convert to the strict runtime `PackageSchema` shape.
 * 3) Export `InternalPricingSchema` for optional, non-public build data.
 *
 * WHY TWO SCHEMAS?
 * -----------------------------------------------------------------------------
 * - MDX frontmatter is writer-friendly (accepts aliases & flexible tables).
 * - Runtime schema is consumer-friendly (strict, aligned with components).
 *
 * CRITICAL EXPORTS (for scripts you already have)
 * -----------------------------------------------------------------------------
 * - `PackageMarkdownSchema`  — the MDX frontmatter validator (alias below)
 * - `InternalPricingSchema`  — optional internal.json validator (defaults to {})
 *
 * AUTHORING RULE
 * -----------------------------------------------------------------------------
 * Frontmatter must provide at least one inclusion source:
 *   - `includes`        (preferred, grouped bullets), OR
 *   - `includesGroups`  (legacy alias), OR
 *   - `includesTable`   (table-like fallback)
 */

import { z } from "zod";
import { PackageSchema } from "@/packages/lib/schemas/package-schema";

/** Runtime type (fully normalized, consumer-facing). */
export type PackageSchemaType = z.infer<typeof PackageSchema>;

/* =============================================================================
 * Shared primitives (author-facing)
 * ============================================================================= */

/** Money (writer-friendly). Requires at least one of { monthly, oneTime }. */
export const MdxMoneySchema = z
  .object({
    monthly: z.number().positive().finite().optional(),
    oneTime: z.number().positive().finite().optional(),
    currency: z.literal("USD").default("USD"),
  })
  .refine((p) => p.monthly != null || p.oneTime != null, {
    message: "price must include monthly or oneTime",
  });

/** Detail-band microcopy (writer-provided; no formatting/logic here). */
export const MdxPriceBandSchema = z.object({
  tagline: z.string().optional(),
  baseNote: z.enum(["proposal", "final"]).optional(),
  finePrint: z.string().optional(),
});

/**
 * Writer-friendly fallback “table-like” includes shape.
 * Example:
 *   columns: ["Feature", "Included"]
 *   rows:
 *     - ["Territory-based distribution", "yes"]
 *     - ["Round-robin assignment", true]
 */
export const MdxIncludesTableLikeSchema = z.object({
  title: z.string().optional(),   // ignored in transform; use `caption`
  caption: z.string().optional(),
  columns: z.array(z.string()).optional(),
  rows: z
    .array(
      z.union([
        z.array(z.string()),                     // ["Label", "✓", ...]
        z.object({ cells: z.array(z.string()) }),// { cells: [...] }
      ])
    )
    .min(1),
});

/** Minimal SEO frontmatter. */
export const MdxSeoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
});

/** Writer-friendly FAQ item. */
export const MdxFaqSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  q: z.string().optional(),
  a: z.string().optional(),
  question: z.string().optional(),
  answer: z.string().optional(),
});

/** Included bullets (author-facing). Accept strings or {label,note}. */
const MdxIncludeItemSchema = z.union([
  z.string().min(1),
  z.object({ label: z.string().min(1), note: z.string().optional() }),
]);

/** Grouped includes. */
export const MdxIncludesGroupSchema = z.object({
  title: z.string().min(1),
  items: z.array(MdxIncludeItemSchema).min(1),
});

/* =============================================================================
 * MDX Frontmatter Schema (author-facing)
 * ============================================================================= */

/**
 * `service` is lenient here (string) to avoid churn when adding services.
 * The runtime transform will coerce known aliases, and `PackageSchema.parse`
 * enforces the final enum.
 */
export const MdxFrontmatterSchema = z
  .object({
    /* Identity & taxonomy */
    id: z.string().min(1),
    slug: z.string().min(1),
    name: z.string().min(1),
    service: z.string().min(1), // lenient here
    subservice: z.string().min(1).optional(),
    subsubservice: z.string().optional(),
    category: z.string().optional(),

    tags: z.array(z.string()).default([]),
    badges: z.array(z.string()).default([]),
    tier: z.string().optional(),

    image: z.object({ src: z.string().min(1), alt: z.string().min(1) }).optional(),
    seo: MdxSeoSchema.default({}),

    /* Hero copy */
    summary: z.string().min(1),
    description: z.string().optional(),

    /* Phase 2 — Why */
    painPoints: z.array(z.string()).optional(),
    purposeHtml: z.string().optional(), // may be provided or derived from MDX body
    icp: z.string().optional(),
    outcomes: z.array(z.string()).min(1),

    /* Phase 3 — What */
    features: z.array(z.string()).default([]),

    // Accept BOTH names and normalize in transform (includes preferred)
    includes: z.array(MdxIncludesGroupSchema).optional(),
    includesGroups: z.array(MdxIncludesGroupSchema).optional(),

    includesTable: MdxIncludesTableLikeSchema.optional(),
    deliverables: z.array(z.string()).optional(),

    /* Pricing (SSOT) */
    price: MdxMoneySchema,
    priceBand: MdxPriceBandSchema.optional(),

    /* Phase 4 — Details & Trust (writer-facing “extras”) */
    extras: z
      .object({
        timeline: z.object({ setup: z.string().optional(), launch: z.string().optional(), ongoing: z.string().optional() }).optional(),
        requirements: z.array(z.string()).optional(),
        ethics: z.array(z.string()).optional(),
      })
      .optional(),
    notes: z.string().optional(),

    /* Phase 5 — Next */
    faqs: z.array(MdxFaqSchema).optional(),
    crossSell: z.array(z.string()).optional(), // → relatedSlugs
    addOns: z.array(z.string()).optional(),    // → addOnRecommendations

    /* Optional metadata for docs/build tracking */
    authoredAt: z.string().optional(),
    templateVersion: z.string().optional(),
  })
  .superRefine((fm, ctx) => {
    // Author must provide at least one inclusions source.
    const hasIncludes = Array.isArray(fm.includes) && fm.includes.length > 0;
    const hasGroups = Array.isArray(fm.includesGroups) && fm.includesGroups.length > 0;
    const hasTable = !!fm.includesTable && Array.isArray(fm.includesTable.rows) && fm.includesTable.rows.length > 0;

    if (!hasIncludes && !hasGroups && !hasTable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["includes"],
        message:
          "Provide either `includes` (preferred), `includesGroups` (legacy), or `includesTable` (fallback).",
      });
    }
  });

/** Back-compat alias for existing scripts: */
export const PackageMarkdownSchema = MdxFrontmatterSchema;

/** Inferred type for author-facing frontmatter. */
export type MdxFrontmatter = z.infer<typeof MdxFrontmatterSchema>;

/* =============================================================================
 * Internal pricing (optional, non-public) — shipped for ops/scripts
 * =============================================================================
 * NOTE:
 *  - Tolerant and defaulted so a missing/empty internal.json won’t break builds.
 *  - Extend as your ops needs grow.
 */
export const InternalPricingSchema = z
  .object({
    /** Optional price tiers the team can toggle during quoting. */
    tiers: z
      .array(
        z.object({
          id: z.string().min(1),
          label: z.string().optional(),
          price: z
            .object({
              monthly: z.number().positive().finite().optional(),
              oneTime: z.number().positive().finite().optional(),
              currency: z.literal("USD").default("USD"),
            })
            .refine((p) => p.monthly != null || p.oneTime != null, {
              message: "tier.price must include monthly or oneTime",
            })
            .optional(),
          enabled: z.boolean().default(true),
          note: z.string().optional(),
        })
      )
      .optional(),

    /** Global currency default for ops */
    currency: z.literal("USD").default("USD"),

    /** Feature flags / ops toggles */
    flags: z.object({ featured: z.boolean().optional(), internalOnly: z.boolean().optional() }).default({}),

    /** Optional modifiers (discounts, promos) */
    modifiers: z.object({ discountPercent: z.number().min(0).max(100).optional(), setupWaived: z.boolean().optional() }).default({}),

    /** Free-form metadata (SOW notes, internal references, etc.) */
    meta: z.record(z.unknown()).default({}),
  })
  .default({});

export type InternalPricing = z.infer<typeof InternalPricingSchema>;

/* =============================================================================
 * Normalization helpers
 * ============================================================================= */

/** ID-safe helper for columns/rows derived from author text. */
function idify(s: string, fallback = "id"): string {
  const base = (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

/**
 * Convert author-facing `includesTable` (flexible) → strict runtime `includesTable`.
 * - If no columns are provided, we create a single column labeled with the package name.
 * - Any non-empty / non-"false" / non-"0" cell beyond the first is treated as `true`.
 */
function normalizeIncludesTableLike(
  pkgName: string,
  like?: z.infer<typeof MdxIncludesTableLikeSchema>
): PackageSchemaType["includesTable"] | undefined {
  if (!like || !Array.isArray(like.rows) || like.rows.length === 0) return undefined;

  const columnLabels = Array.isArray(like.columns) && like.columns.length > 0 ? like.columns : [pkgName];
  const columns = columnLabels.map((label, i) => ({ id: `c${i}-${idify(label, `c${i}`)}`, label }));

  const rows = like.rows
    .map((r, i) => {
      const cells = Array.isArray(r) ? r : r?.cells;
      if (!cells || cells.length === 0) return null;

      const rawLabel = String(cells[0] ?? "").trim();
      if (!rawLabel) return null;

      const values: Record<string, boolean | string> = {};
      for (let j = 1; j < cells.length && j <= columns.length; j++) {
        const raw = cells[j];
        const truthy =
          raw === true ||
          (typeof raw === "string" && raw.trim() !== "" && raw.toLowerCase() !== "false" && raw !== "0");
        if (truthy) values[columns[j - 1].id] = true;
      }
      return { id: `row-${i}-${idify(rawLabel, "row")}`, label: rawLabel, values };
    })
    .filter(Boolean) as NonNullable<PackageSchemaType["includesTable"]>["rows"];

  return { caption: like.caption ?? "What’s included", columns, rows };
}

/** Map common service aliases to canonical runtime service codes. */
function normalizeServiceCode(input: string): PackageSchemaType["service"] | string {
  const s = input.trim().toLowerCase();
  const map: Record<string, PackageSchemaType["service"]> = {
    "lead-generation": "leadgen",
    "content-production": "content",
    "video-production": "video",
    "web-development": "webdev",
  };
  return map[s] ?? s;
}

/* =============================================================================
 * Transform: MDX Frontmatter → PackageSchema (runtime)
 * ============================================================================= */

/**
 * Transform author-facing MDX frontmatter into the canonical runtime object.
 * The return value is validated strictly by `PackageSchema.parse(...)`.
 *
 * @param frontmatter Parsed MDX frontmatter
 * @param options     { bodyHtml?: string, category?: string }
 */
export function frontmatterToPackage(
  frontmatter: MdxFrontmatter,
  options?: { bodyHtml?: string; category?: string }
): PackageSchemaType {
  const {
    id,
    slug,
    name,
    service,
    tags,
    badges,
    tier,
    image,
    seo,
    summary,
    description,

    painPoints,
    purposeHtml,
    icp,
    outcomes,

    features,
    includes,
    includesGroups,
    includesTable,
    deliverables,

    price,
    priceBand,

    extras,
    notes,

    faqs,
    crossSell,
    addOns,
  } = frontmatter;

  const resolvedPurposeHtml = purposeHtml ?? options?.bodyHtml;

  // Prefer `includes` if present; else `includesGroups`; else table-like fallback.
  const sourceGroups = (includes && includes.length > 0 ? includes : includesGroups) ?? [];
  const runtimeIncludes =
    Array.isArray(sourceGroups) && sourceGroups.length > 0
      ? sourceGroups.map((g) => ({
          title: g.title,
          items: g.items, // strings or {label,note} are both allowed by runtime schema
        }))
      : [];

  const runtimeIncludesTable =
    runtimeIncludes.length === 0 ? normalizeIncludesTableLike(name, includesTable) : undefined;

  // Map writer-facing extras to runtime fields
  const requirements = extras?.requirements;
  const timeline = extras?.timeline;
  const ethics = extras?.ethics;

  // Alias normalization (cross-sell → relatedSlugs; addOns → addOnRecommendations)
  const relatedSlugs = crossSell ?? [];
  const addOnRecommendations = addOns ?? [];

  // Normalize service alias → canonical code (runtime enum enforces final)
  const serviceCanonical = normalizeServiceCode(service);

  // Build the runtime candidate object (exact schema shape)
  const runtimeCandidate = {
    id,
    slug,
    service: serviceCanonical as any, // final validation below ensures enum
    category: options?.category, // optional category attachment by pipeline
    name,
    tier,
    tags,
    badges,

    image,
    seo,

    summary,
    description,

    price,
    priceBand,

    painPoints,
    purposeHtml: resolvedPurposeHtml,
    icp,
    outcomes,

    features,
    includes: runtimeIncludes,
    includesTable: runtimeIncludesTable,
    deliverables,

    requirements,
    timeline,
    ethics,
    notes,

    faqs,
    relatedSlugs,
    addOnRecommendations,
  };

  // Final strict guard: throws if anything is out-of-shape.
  return PackageSchema.parse(runtimeCandidate);
}

/* =============================================================================
 * Parse helpers (build-time ergonomics)
 * ============================================================================= */

/** Strict frontmatter parser (throws on validation errors). */
export function parseMdxFrontmatter(data: unknown): MdxFrontmatter {
  return MdxFrontmatterSchema.parse(data);
}

/** One-liner helper: validate frontmatter + normalize to strict runtime model. */
export function buildPackageFromMdx(
  rawFrontmatter: unknown,
  opts?: { bodyHtml?: string; category?: string }
): PackageSchemaType {
  const frontmatter = parseMdxFrontmatter(rawFrontmatter);
  return frontmatterToPackage(frontmatter, opts);
}
