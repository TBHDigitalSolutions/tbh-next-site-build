// src/packages/lib/mdx-frontmatter-schema.ts
/**
 * MDX Frontmatter Schema (author-facing) → PackageSchema (runtime-facing)
 * =============================================================================
 * PURPOSE
 * -----------------------------------------------------------------------------
 * Authors edit `public.mdx` files with simple frontmatter. This module:
 *   1) Validates that frontmatter using Zod (tolerant, writer-friendly).
 *   2) Converts frontmatter (+ optional MDX body HTML) into the canonical
 *      runtime object validated by `PackageSchema` (the consumer-facing shape
 *      used by your TSX components via mappers).
 *
 * DESIGN
 * -----------------------------------------------------------------------------
 * - This schema is intentionally *more lenient* than the runtime `PackageSchema`
 *   to keep MDX authoring ergonomic (e.g., flexible includes table syntax).
 * - A robust transform then normalizes frontmatter → runtime shape and finally
 *   validates again with `PackageSchema.parse(...)` to guarantee safety.
 *
 * WHAT THIS FILE DOES NOT DO
 * -----------------------------------------------------------------------------
 * - It does not decide price display/labels (handled by `pricing.ts`).
 * - It does not decide CTA copy (handled by `copy.ts`).
 * - It does not choose band variants (handled at the detail surface / `band.ts`).
 *
 * TYPICAL BUILD FLOW
 * -----------------------------------------------------------------------------
 *   MDX (public.mdx)
 *     └─► loader extracts frontmatter + converts the body to HTML
 *           └─► parseMdxFrontmatter(frontmatter)
 *                 └─► frontmatterToPackage(frontmatter, { bodyHtml })
 *                        └─► PackageSchema.parse(...)  ✅ safe runtime object
 *
 * AUTHORING RULE
 * -----------------------------------------------------------------------------
 * Frontmatter must provide at least one inclusion source:
 *   - `includesGroups`  (grouped bullets), OR
 *   - `includesTable`   (table-like fallback)
 *
 * See `superRefine` below for a friendly error if neither is present.
 */

import { z } from "zod";
import {
  PackageSchema,
  type PackageSchemaType,
} from "@/packages/lib/package-schema";

/* =============================================================================
 * Shared primitives (author-facing)
 * ============================================================================= */

/** Money (writer-friendly). Requires at least one of { oneTime, monthly }. */
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
 *  columns: ["Feature", "Included"]
 *  rows: [
 *    ["Territory-based distribution", "yes"],
 *    ["Round-robin assignment", true],
 *  ]
 */
export const MdxIncludesTableLikeSchema = z.object({
  title: z.string().optional(),   // ignored in transform; use `caption`
  caption: z.string().optional(),
  columns: z.array(z.string()).optional(),
  rows: z
    .array(
      z.union([
        z.array(z.string()),               // ["Label", "×", "✓", ...]
        z.object({ cells: z.array(z.string()) }), // { cells: [...] }
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

/** A group of included bullets (writer-facing). */
export const MdxIncludesGroupSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
});

/* =============================================================================
 * MDX Frontmatter Schema (author-facing)
 * ============================================================================= */

export const MdxFrontmatterSchema = z
  .object({
    /* Identity & taxonomy */
    id: z.string().min(1),
    slug: z.string().min(1),
    /** Display name is required for the runtime PackageSchema. Keep it explicit. */
    name: z.string().min(1),
    service: z.enum(["webdev", "seo", "marketing", "leadgen", "content", "video"]),
    /** Optional taxonomy/labelling that docs may use for navigation. */
    subservice: z.string().min(1).optional(),
    subsubservice: z.string().optional(),

    tags: z.array(z.string()).default([]),
    badges: z.array(z.string()).default([]),
    tier: z.string().optional(),

    image: z
      .object({
        src: z.string().min(1),
        alt: z.string().min(1),
      })
      .optional(),

    seo: MdxSeoSchema.default({}),

    /* Hero copy */
    summary: z.string().min(1),
    description: z.string().optional(), // long-form hero, optional

    /* Phase 2 — Why */
    painPoints: z.array(z.string()).optional(),
    /**
     * Option A: author can supply purposeHtml directly via frontmatter.
     * Option B: pipeline can pass compiled MDX body to the transformer.
     */
    purposeHtml: z.string().optional(),
    icp: z.string().optional(),
    outcomes: z.array(z.string()).min(1),

    /* Phase 3 — What */
    features: z.array(z.string()).default([]),
    includesGroups: z.array(MdxIncludesGroupSchema).optional(),
    includesTable: MdxIncludesTableLikeSchema.optional(),
    deliverables: z.array(z.string()).optional(),

    /* Pricing (SSOT) */
    price: MdxMoneySchema,
    priceBand: MdxPriceBandSchema.optional(),

    /* Phase 4 — Details & Trust */
    extras: z
      .object({
        timeline: z
          .object({
            setup: z.string().optional(),
            launch: z.string().optional(),
            ongoing: z.string().optional(),
          })
          .optional(),
        requirements: z.array(z.string()).optional(),
        ethics: z.array(z.string()).optional(),
      })
      .optional(),
    notes: z.string().optional(),

    /* Phase 5 — Next */
    faqs: z.array(MdxFaqSchema).optional(),
    crossSell: z.array(z.string()).optional(), // maps → relatedSlugs
    addOns: z.array(z.string()).optional(),    // maps → addOnRecommendations

    /* Optional metadata for docs/build tracking */
    authoredAt: z.string().optional(),
    templateVersion: z.string().optional(),
  })
  .superRefine((fm, ctx) => {
    // Author must provide at least one inclusions source.
    const hasGroups = Array.isArray(fm.includesGroups) && fm.includesGroups.length > 0;
    const hasTable = !!fm.includesTable && Array.isArray(fm.includesTable.rows) && fm.includesTable.rows.length > 0;
    if (!hasGroups && !hasTable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["includesGroups"],
        message: "Provide either `includesGroups` (bulleted groups) or `includesTable` (tabular fallback).",
      });
    }
  });

/** Inferred type for author-facing frontmatter. */
export type MdxFrontmatter = z.infer<typeof MdxFrontmatterSchema>;

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
 * Convert an author-facing `includesTable` (flexible) into the strict runtime
 * table shape expected by `PackageSchema` consumers.
 *
 * - If no columns are provided, we build a 1-column table labeled with the package name.
 * - We consider any non-empty / non-"false" / non-"0" cell beyond the first as "true".
 */
function normalizeIncludesTableLike(
  pkgName: string,
  like?: z.infer<typeof MdxIncludesTableLikeSchema>
): PackageSchemaType["includesTable"] | undefined {
  if (!like || !Array.isArray(like.rows) || like.rows.length === 0) return undefined;

  // Determine columns (writer may omit them)
  const columnLabels = Array.isArray(like.columns) && like.columns.length > 0 ? like.columns : [pkgName];
  const columns = columnLabels.map((label, i) => ({
    id: `c${i}-${idify(label, `c${i}`)}`,
    label,
  }));

  // Map rows
  const rows = like.rows
    .map((r, i) => {
      const cells = Array.isArray(r) ? r : r?.cells;
      if (!cells || cells.length === 0) return null;

      const rawLabel = String(cells[0] ?? "").trim();
      if (!rawLabel) return null;

      const values: Record<string, boolean | string> = {};
      // For each subsequent cell, map presence/truthiness to the corresponding column id
      for (let j = 1; j < cells.length && j <= columns.length; j++) {
        const raw = cells[j];
        const truthy =
          raw === true ||
          (typeof raw === "string" && raw.trim() !== "" && raw.toLowerCase() !== "false" && raw !== "0");
        if (truthy) values[columns[j - 1].id] = true;
      }

      return {
        id: `row-${i}-${idify(rawLabel, "row")}`,
        label: rawLabel,
        values,
      };
    })
    .filter(Boolean) as NonNullable<PackageSchemaType["includesTable"]>["rows"];

  return { caption: like.caption ?? "What’s included", columns, rows };
}

/* =============================================================================
 * Transform: MDX Frontmatter → PackageSchema (runtime)
 * ============================================================================= */

/**
 * Transform author-facing MDX frontmatter into the canonical runtime object.
 * The returned object is validated by `PackageSchema.parse(...)`.
 *
 * @param frontmatter  Parsed, validated MDX frontmatter (author-facing).
 * @param options
 *  - bodyHtml: compiled MDX HTML (used as purposeHtml if frontmatter.purposeHtml is absent)
 *  - category: optional category label to copy into runtime shape
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

  // Prefer author-provided purposeHtml; otherwise use compiled MDX body when provided.
  const resolvedPurposeHtml = purposeHtml ?? options?.bodyHtml;

  // Prefer grouped includes (primary renderer); convert table-like only when groups are absent.
  const hasGroups = Array.isArray(includesGroups) && includesGroups.length > 0;
  const runtimeIncludes =
    hasGroups
      ? includesGroups.map((g) => ({ title: g.title, items: g.items }))
      : [];

  const runtimeIncludesTable =
    !hasGroups ? normalizeIncludesTableLike(name, includesTable) : undefined;

  // Map extras (writer-facing) → runtime fields
  const requirements = extras?.requirements;
  const timeline = extras?.timeline;
  const ethics = extras?.ethics;

  // Cross-sell & add-ons naming parity with runtime schema
  const relatedSlugs = crossSell ?? [];
  const addOnRecommendations = addOns ?? [];

  // Build the runtime object (exactly the shape expected by PackageSchema)
  const runtimeCandidate = {
    id,
    slug,
    service,
    category: options?.category, // optional: allow pipeline to attach a category label
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

    features,          // string[] is allowed; runtime schema also accepts richer objects
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

  // Final guard: ensure we complied with the consumer-facing schema strictly.
  return PackageSchema.parse(runtimeCandidate);
}

/* =============================================================================
 * Parse helpers (build-time ergonomics)
 * ============================================================================= */

/**
 * Strict frontmatter parser (throws on validation errors).
 * Use this right after extracting frontmatter from MDX.
 */
export function parseMdxFrontmatter(data: unknown): MdxFrontmatter {
  return MdxFrontmatterSchema.parse(data);
}

/**
 * Convenience one-liner for build steps:
 *
 *   const fm = parseMdxFrontmatter(rawFrontmatter);
 *   const pkg = buildPackageFromMdx(rawFrontmatter, { bodyHtml });
 *
 * Throws on any validation error with a precise Zod error tree.
 */
export function buildPackageFromMdx(
  rawFrontmatter: unknown,
  opts?: { bodyHtml?: string; category?: string }
): PackageSchemaType {
  const frontmatter = parseMdxFrontmatter(rawFrontmatter);
  return frontmatterToPackage(frontmatter, opts);
}

/* =============================================================================
 * Notes on Migration from legacy registry/schemas.ts
 * =============================================================================
 * - If your scripts previously imported `PackageMarkdownSchema` from
 *   `src/packages/lib/registry/schemas.ts`, replace that import with
 *   `MdxFrontmatterSchema` from this file.
 * - If you relied on a looser `includesTable: any`, this module already accepts
 *   a flexible table-like shape and performs a deterministic normalization for
 *   the runtime model (matching the UI table component).
 */
