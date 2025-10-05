// src/types/package.ts
/**
 * Package Type Exports (Runtime, App-Wide)
 * =============================================================================
 * PURPOSE
 * -----------------------------------------------------------------------------
 * This module exposes **TypeScript types only**, all derived from the canonical
 * Zod schemas defined in `src/packages/lib/package-schema.ts`. Import these
 * types across your app (components, mappers, loaders, tests) to ensure
 * everything stays 100% in sync with the content contract that is enforced
 * at build time by Zod.
 *
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - There is **one source of truth** for shapes: the Zod schemas. We "infer"
 *   types from those schemas so that any schema change is immediately reflected
 *   in the compile-time types (no drift).
 * - This file should contain **no logic**. Keep it side-effect free to avoid
 *   circular dependencies (schemas → types → consumers).
 *
 * HOW TO USE
 * -----------------------------------------------------------------------------
 * - Use `PackageMetadata` for the fully-validated package object your UI
 *   receives from the MDX pipeline + schema validation.
 * - Use smaller picks (e.g., `PackageIdentity`, `PackagePricing`) when a given
 *   surface only needs a subset of the model. This improves clarity and makes
 *   refactors safer.
 *
 * RELATED FILES
 * -----------------------------------------------------------------------------
 * - `src/packages/lib/package-schema.ts`  (Zod schemas)
 * - `src/packages/lib/mdx-frontmatter-schema.ts` (author-facing → runtime transform)
 * - `src/packages/lib/registry/mappers.ts` (mapping validated content → UI props)
 */

import type { z } from "zod";
import {
  PackageSchema,
  MoneySchema,
  PriceBandSchema,
  IncludesTableSchema,
  IncludeGroupSchema,
  IncludeItemSchema,
  FaqSchema,
  PhaseCopySchema,
} from "@/packages/lib/schemas/package-schema";

/* =============================================================================
 * Primary Runtime Model
 * ============================================================================= */

/**
 * The fully-validated, runtime package object.
 * - Produced by `PackageSchema.parse(...)`
 * - Consumed by mapping functions and TSX components
 */
export type PackageMetadata = z.infer<typeof PackageSchema>;

/* =============================================================================
 * Reusable Primitives (derived directly from the schema)
 * ============================================================================= */

/** Canonical price container (single source of truth for $). */
export type Money = z.infer<typeof MoneySchema>;

/** Detail-band microcopy shown on detail pages (separate from price). */
export type PriceBand = z.infer<typeof PriceBandSchema>;

/** An individual "What's included" bullet (string or {label, note}). */
export type IncludeItem = z.infer<typeof IncludeItemSchema>;

/** A titled group of included items. */
export type IncludeGroup = z.infer<typeof IncludeGroupSchema>;

/** Optional tabular includes (already normalized for the UI table component). */
export type IncludesTable = z.infer<typeof IncludesTableSchema>;

/** Flexible FAQ item (authoring-friendly keys q/a or question/answer). */
export type PackageFaq = z.infer<typeof FaqSchema>;

/** Optional per-phase title/tagline overrides used by section headers. */
export type PhaseCopy = z.infer<typeof PhaseCopySchema>;

/* =============================================================================
 * Convenient Picks for Common Surfaces
 * ============================================================================= */

/** Minimal identity info often needed for analytics, URIs, or rails. */
export type PackageIdentity = Pick<PackageMetadata, "id" | "slug" | "name" | "service">;

/** Pricing-only pick used by price bands, labels, and CTAs. */
export type PackagePricing = Pick<PackageMetadata, "price" | "priceBand">;

/** Hero/overview slice used by top-of-page scaffolding. */
export type PackageHero = Pick<
  PackageMetadata,
  "name" | "summary" | "description" | "image" | "seo" | "icp" | "service" | "tags"
>;

/** Phase 2 ("Why you need this") slice. */
export type PackageWhy = Pick<
  PackageMetadata,
  "painPoints" | "purposeHtml" | "icp" | "outcomes"
>;

/** Phase 3 ("What you get") slice. */
export type PackageWhat = Pick<
  PackageMetadata,
  "features" | "includes" | "includesTable" | "deliverables"
>;

/** Phase 4 ("Details & Trust") slice. */
export type PackageDetails = Pick<
  PackageMetadata,
  "requirements" | "timeline" | "ethics" | "notes"
>;

/** Phase 5 ("Next step") slice. */
export type PackageNext = Pick<
  PackageMetadata,
  "faqs" | "relatedSlugs" | "addOnRecommendations"
>;

/* =============================================================================
 * Narrow Helpers (handy for component props & array mapping)
 * ============================================================================= */

/**
 * A single feature item as it would appear in the `features` array.
 * (Authoring allows `string` or `{ label, icon? }` objects; components usually
 * render just the user-facing label.)
 */
export type FeatureItem = NonNullable<PackageMetadata["features"]>[number];

/**
 * A single outcome line (KPI statement).
 * Kept as `string` for portability across surfaces.
 */
export type OutcomeItem = PackageMetadata["outcomes"][number];

/* =============================================================================
 * Notes
 * =============================================================================
 * - Keep this file synchronized with `package-schema.ts`.
 * - Add new re-exported types here only if they are directly derived from
 *   the Zod schemas (or are simple `Pick<>`/utility composites of those).
 * - Avoid importing React types or UI component props here to prevent
 *   circular dependencies and keep the domain layer clean.
 */
