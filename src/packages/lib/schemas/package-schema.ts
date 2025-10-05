// src/packages/lib/package-schema.ts
/**
 * Package content schema (Zod) — runtime / consumer-facing
 * src/packages/lib/package-schema.ts
 * =============================================================================
 * PURPOSE
 * -----------------------------------------------------------------------------
 * This is the single canonical schema for a *Package* record as consumed by:
 *  - PackageDetailOverview (and Phase 1–5 sections)
 *  - PackageDetailExtras (timeline, requirements, ethics/limits)
 *  - Registry loaders / mappers (validated content → UI props)
 *
 * PIPELINE CONTEXT
 * -----------------------------------------------------------------------------
 * Authoring happens in MDX. A build step converts that to JSON and calls
 * `PackageSchema.parse(...)` as the final guardrail before shipping.
 *
 * POLICY
 * -----------------------------------------------------------------------------
 * - Author must provide *either* `includes` (groups) or `includesTable`.
 * - Price formatting & labels belong in pricing utilities (not here).
 * - CTA copy belongs in copy utilities (not here).
 *
 * DEFAULTS
 * -----------------------------------------------------------------------------
 * Zod strips unknown keys by default; add `.passthrough()` locally if needed.
 */

import { z } from "zod";

/* =============================================================================
 * Primitive / Reusable Blocks
 * ============================================================================= */

/**
 * Canonical price shape (SSOT).
 * Requires at least one of {oneTime, monthly}. Currency defaults to "USD".
 */
export const MoneySchema = z
  .object({
    oneTime: z.number().positive().finite().optional(),
    monthly: z.number().positive().finite().optional(),
    currency: z.literal("USD").default("USD"),
  })
  .refine((p) => p.oneTime != null || p.monthly != null, {
    message: "price must include either oneTime or monthly",
  });

/** Microcopy shown on the detail price band (author-provided content). */
export const PriceBandSchema = z.object({
  tagline: z.string().trim().min(1).optional(),
  baseNote: z.enum(["proposal", "final"]).optional(),
  finePrint: z.string().trim().min(1).optional(),
});

/** Author-friendly FAQ (supports q/a and question/answer keys). */
export const FaqSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  q: z.string().trim().min(1).optional(),
  a: z.string().trim().min(1).optional(),
  question: z.string().trim().min(1).optional(),
  answer: z.string().trim().min(1).optional(),
});

/**
 * “What’s included” item. Prefer strings for portability; object allows
 * optional micro-note (no rendering rules here).
 */
export const IncludeItemSchema = z.union([
  z.string().trim().min(1),
  z.object({
    label: z.string().trim().min(1),
    note: z.string().trim().min(1).optional(),
  }),
]);

/** Group of included items rendered in Phase 3. */
export const IncludeGroupSchema = z.object({
  title: z.string().trim().min(1),
  items: z.array(IncludeItemSchema).min(1),
});

/**
 * Optional tabular includes (fallback/legacy). Kept framework-agnostic so
 * mappers can adapt it to the UI table without coupling.
 */
export const IncludesTableSchema = z.object({
  caption: z.string().trim().min(1).optional(),
  columns: z.array(z.object({ id: z.string(), label: z.string() })).min(1),
  rows: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        values: z.record(z.union([z.boolean(), z.string()])),
      })
    )
    .min(1),
});

/** Optional per-phase header/title/tagline overrides for Section headers. */
export const PhaseCopySchema = z.object({
  phase1: z.object({ title: z.string().optional(), tagline: z.string().optional() }).optional(),
  phase2: z.object({ title: z.string().optional(), tagline: z.string().optional() }).optional(),
  phase3: z
    .object({
      title: z.string().optional(),
      tagline: z.string().optional(),
      includesTitle: z.string().optional(),
      includesSubtitle: z.string().optional(),
      highlightsTitle: z.string().optional(),
      highlightsTagline: z.string().optional(),
    })
    .optional(),
  phase4: z.object({ title: z.string().optional(), tagline: z.string().optional() }).optional(),
  phase5: z.object({ title: z.string().optional(), tagline: z.string().optional() }).optional(),
});

/* =============================================================================
 * Root Package Schema (runtime, strict)
 * ============================================================================= */

export const PackageSchema = z
  .object({
    /* --------------------------- Identity & taxonomy ---------------------- */
    id: z.string().min(1),
    slug: z.string().min(1),
    service: z.enum(["content", "leadgen", "marketing", "seo", "video", "webdev"]),
    category: z.string().optional(),
    name: z.string().min(1),
    tier: z.string().optional(),
    tags: z.array(z.string()).default([]),
    badges: z.array(z.string()).default([]),

    /* --------------------------------- Hero -------------------------------- */
    summary: z.string().min(1),
    description: z.string().optional(),
    image: z.object({ src: z.string().min(1), alt: z.string().min(1) }).optional(),

    /* ------------------------------- Pricing ------------------------------ */
    price: MoneySchema,
    priceBand: PriceBandSchema.optional(),

    /* ------------------------- Phase 2 — Why section ---------------------- */
    painPoints: z.array(z.string()).optional(),
    purposeHtml: z.string().optional(), // compiled MDX (short, conservative)
    icp: z.string().optional(),
    outcomes: z.array(z.string()).min(1),

    /* ------------------------ Phase 3 — What you get ---------------------- */
    features: z
      .array(z.union([z.string(), z.object({ label: z.string(), icon: z.string().optional() })]))
      .optional(),
    includes: z.array(IncludeGroupSchema).default([]),
    includesTable: IncludesTableSchema.optional(),
    deliverables: z.array(z.string()).optional(),

    /* --------------------- Phase 4 — Details & trust extras --------------- */
    requirements: z.array(z.string()).optional(),
    timeline: z.object({ setup: z.string().optional(), launch: z.string().optional(), ongoing: z.string().optional() }).optional(),
    ethics: z.array(z.string()).optional(),
    notes: z.string().optional(),

    /* ---------------------- Phase 5 — Next step / support ----------------- */
    faqs: z.array(FaqSchema).optional(),
    relatedSlugs: z.array(z.string()).default([]),
    addOnRecommendations: z.array(z.string()).default([]),

    /* ------------------------------- SEO / Meta --------------------------- */
    seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
    copy: PhaseCopySchema.optional(),
  })
  .superRefine((pkg, ctx) => {
    // Authoring rule: must provide at least one inclusion source
    const hasGroups = Array.isArray(pkg.includes) && pkg.includes.length > 0;
    const hasTable = !!pkg.includesTable;
    if (!hasGroups && !hasTable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either includes (groups) or includesTable",
        path: ["includes"],
      });
    }
  });

/* =============================================================================
 * Exported Types & Helpers
 * ============================================================================= */

export type PackageSchemaType = z.infer<typeof PackageSchema>;
export type PackageMetadata = PackageSchemaType;

export type MoneySchemaType = z.infer<typeof MoneySchema>;
export type PriceBandSchemaType = z.infer<typeof PriceBandSchema>;
export type FaqSchemaType = z.infer<typeof FaqSchema>;
export type IncludeItemSchemaType = z.infer<typeof IncludeItemSchema>;
export type IncludeGroupSchemaType = z.infer<typeof IncludeGroupSchema>;
export type IncludesTableSchemaType = z.infer<typeof IncludesTableSchema>;
export type PhaseCopySchemaType = z.infer<typeof PhaseCopySchema>;

/** Strict validator (throws on failure). Use at build time. */
export function parsePackage(data: unknown): PackageMetadata {
  return PackageSchema.parse(data);
}

/** Safe validator (no-throw). Handy for tests/guards. */
export function safeParsePackage(data: unknown) {
  return PackageSchema.safeParse(data);
}
