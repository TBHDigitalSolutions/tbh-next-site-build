/**
 * Package content schema (Zod) src/packages/lib/package-schema.ts
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * This module defines the single, canonical Zod schema for a *package detail*
 * record as consumed by:
 *   - PackageDetailOverview (and its Phase 1–5 sections)
 *   - PackageDetailExtras (timeline, requirements, ethics/limits)
 *   - Registry mappers (validated content → UI props)
 *
 * Pipeline Context
 * -----------------------------------------------------------------------------
 * MDX authoring (content.mdx) → build processor emits JSON →
 * this schema validates that JSON at build time and converts it into a
 * fully-typed, runtime-safe object for use by TSX components and mappers.
 *
 * Why unify here?
 * -----------------------------------------------------------------------------
 * - Avoid divergence across multiple schema files.
 * - Keep the shape aligned with the *consumer* components.
 * - Centralize validation for maintainability and testability.
 *
 * Notes & Policy
 * -----------------------------------------------------------------------------
 * - Pricing (labels, formatting) is handled in pricing.ts, not here.
 * - CTA copy lives in copy.ts, not here.
 * - Band variant decisions happen at the rendering surface (e.g., via band.ts).
 * - Authoring rule: provide EITHER `includes` (groups) OR `includesTable`.
 *
 * Defaults & Unknown Keys
 * -----------------------------------------------------------------------------
 * - Zod objects are "strip" by default: unknown keys are removed.
 *   Use `.passthrough()` locally if you need to preserve out-of-schema data.
 */

import { z } from "zod";

/* =============================================================================
 * Primitive / Reusable Blocks
 * ============================================================================= */

/**
 * Canonical price shape (SSOT). Requires at least one of {oneTime, monthly}.
 * Currency defaults to "USD".
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

/**
 * Microcopy shown on the detail price band (never auto-falls back to summary).
 * This is NOT formatting logic; it’s authoring content only.
 */
export const PriceBandSchema = z.object({
  tagline: z.string().trim().min(1).optional(),
  baseNote: z.enum(["proposal", "final"]).optional(),
  finePrint: z.string().trim().min(1).optional(),
});

/**
 * Author-friendly FAQ (supports q/a and question/answer keys).
 * Renderer will normalize to a consistent shape.
 */
export const FaqSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  q: z.string().trim().min(1).optional(),
  a: z.string().trim().min(1).optional(),
  question: z.string().trim().min(1).optional(),
  answer: z.string().trim().min(1).optional(),
});

/**
 * “What’s included” item. Prefer plain strings for portability.
 * An object variant with {label, note?} supports future micro-notes per item.
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
 * mappers can adapt it to the UI table props without coupling.
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

/**
 * Optional per-phase header/title/tagline overrides shown by PhaseSectionHeader.
 */
export const PhaseCopySchema = z.object({
  phase1: z
    .object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    })
    .optional(),
  phase2: z
    .object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    })
    .optional(),
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
  phase4: z
    .object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    })
    .optional(),
  phase5: z
    .object({
      title: z.string().optional(),
      tagline: z.string().optional(),
    })
    .optional(),
});

/* =============================================================================
 * Root Package Schema
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
    summary: z.string().min(1), // 1–2 sentence value prop
    description: z.string().optional(), // longer hero body
    image: z.object({ src: z.string().min(1), alt: z.string().min(1) }).optional(),

    /* ------------------------------- Pricing ------------------------------ */
    price: MoneySchema, // SSOT; formatting happens elsewhere
    priceBand: PriceBandSchema.optional(),

    /* ------------------------- Phase 2 — Why section ---------------------- */
    painPoints: z.array(z.string()).optional(),
    purposeHtml: z.string().optional(), // compiled HTML/MD from MDX
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
    timeline: z
      .object({
        setup: z.string().optional(),
        launch: z.string().optional(),
        ongoing: z.string().optional(),
      })
      .optional(),
    ethics: z.array(z.string()).optional(),
    notes: z.string().optional(), // small print under includes

    /* ---------------------- Phase 5 — Next step / support ----------------- */
    faqs: z.array(FaqSchema).optional(),
    relatedSlugs: z.array(z.string()).default([]),
    addOnRecommendations: z.array(z.string()).default([]),

    /* ------------------------------- SEO / Meta --------------------------- */
    seo: z.object({ title: z.string().optional(), description: z.string().optional() }).optional(),
    copy: PhaseCopySchema.optional(),
  })
  .superRefine((pkg, ctx) => {
    /**
     * Authoring rule: must provide at least one inclusion source:
     *  - groups via `includes`, OR
     *  - a fallback `includesTable`
     */
    if ((!pkg.includes || pkg.includes.length === 0) && !pkg.includesTable) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Provide either includes (groups) or includesTable",
        path: ["includes"],
      });
    }
  });

/* =============================================================================
 * Exported Types
 * ============================================================================= */

/**
 * The validated, fully type-safe package object your app uses everywhere.
 * You may also re-export this alias from `@/types/package` if you keep a
 * central types barrel.
 */
export type PackageSchemaType = z.infer<typeof PackageSchema>;

// (Optional convenience: alias the runtime “shape name” most call sites expect)
export type PackageMetadata = PackageSchemaType;

/** Fine-grained types (handy in tests/mappers) */
export type MoneySchemaType = z.infer<typeof MoneySchema>;
export type PriceBandSchemaType = z.infer<typeof PriceBandSchema>;
export type FaqSchemaType = z.infer<typeof FaqSchema>;
export type IncludeItemSchemaType = z.infer<typeof IncludeItemSchema>;
export type IncludeGroupSchemaType = z.infer<typeof IncludeGroupSchema>;
export type IncludesTableSchemaType = z.infer<typeof IncludesTableSchema>;
export type PhaseCopySchemaType = z.infer<typeof PhaseCopySchema>;

/* =============================================================================
 * Parse Helpers (ergonomic entry points)
 * ============================================================================= */

/**
 * Strict validator that throws on failure.
 * Use this in build-time loaders (e.g., `index.ts` next to content.generated.json).
 */
export function parsePackage(data: unknown): PackageMetadata {
  return PackageSchema.parse(data);
}

/**
 * Safe validator for runtime guards or tests.
 * Example:
 *   const result = safeParsePackage(json);
 *   if (!result.success) console.error(result.error.format());
 */
export function safeParsePackage(data: unknown) {
  return PackageSchema.safeParse(data);
}

/* =============================================================================
 * (Optional) Back-compat shim guidance
 * =============================================================================
 * If you still have legacy imports from `src/packages/lib/registry/schemas.ts`
 * in scripts or older surfaces, you can create a temporary shim file:
 *
 *   // src/packages/lib/registry/schemas.ts
 *   /** @deprecated Use src/packages/lib/package-schema.ts *\/
 *   export { MoneySchema } from "@/packages/lib/package-schema";
 *   // If you had a *different* markdown frontmatter schema there, keep that
 *   // or migrate those scripts to parse with PackageSchema after the MDX → JSON step.
 *
 * Remove the shim once all imports are migrated.
 */
