// ============================================================================
// /src/data/packages/_validators/schema.ts
// ----------------------------------------------------------------------------
// Zod schemas for the Packages SSOT authoring shapes.
// - Framework-agnostic; safe for build/CI
// - Validates structure only (cross-refs live in packages.validate.ts)
// - Mirrors /src/data/packages/_types/packages.types.ts
// ============================================================================

import { z } from "zod";

// ----------------------------------------------------------------------------
// Primitives
// ----------------------------------------------------------------------------

/** Currency model used across the domain. */
export const Money = z
  .object({
    currency: z.literal("USD"),
    oneTime: z.number().nonnegative().optional(),
    monthly: z.number().nonnegative().optional(),
  })
  .refine((m) => m.oneTime != null || m.monthly != null, {
    message: "Money requires at least one of {oneTime, monthly}",
  });

/** FAQ entries rendered on detail pages. */
export const FAQItem = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  question: z.string().min(3, "FAQ question is too short"),
  answer: z.string().min(3, "FAQ answer is too short"),
});
export const FAQBlock = z.object({
  title: z.string().optional(),
  faqs: z.array(FAQItem).min(1, "At least one FAQ item is required"),
});

/** “What’s included” sections with rows. */
export const IncludesSection = z.object({
  title: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string().min(1, "Include row requires a label"),
        note: z.string().optional(),
      }),
    )
    .min(1, "Includes section must have at least one item"),
});

/** Outcomes/metrics section. */
export const OutcomesBlock = z.object({
  title: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string().min(1, "Outcome requires a label"),
        value: z.string().optional(),
      }),
    )
    .min(1, "Outcomes must contain at least one item"),
});

/** Loose matrix used for single-column “pricing matrix” presentation. */
export const PackagePricingMatrix = z.object({
  columns: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        note: z.string().optional(),
      }),
    )
    .min(1),
  groups: z
    .array(
      z.object({
        id: z.string().min(1),
        label: z.string().min(1),
        note: z.string().optional(),
        rows: z
          .array(
            z.object({
              id: z.string().min(1),
              label: z.string().min(1),
              note: z.string().optional(),
              // Values are intentionally untyped to allow checkmarks, text, etc.
              values: z.record(z.unknown()),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
  caption: z.string().optional(),
  footnotes: z.string().optional(),
});

// ----------------------------------------------------------------------------
// ServicePackage (authoring shape)
// ----------------------------------------------------------------------------

/**
 * Authoring-time package shape (single public “Starting at …” price).
 * IDs/slugs are kebab-case; `service` is a free string (validated elsewhere).
 */
export const ServicePackage = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be kebab-case"),
  slug: z.string().optional(),
  service: z.string().min(2, "service is required"),
  name: z.string().min(2, "name is required"),
  summary: z.string().optional(),
  tier: z.string().optional(),
  tags: z.array(z.string()).optional(),
  badges: z.array(z.string()).optional(),
  price: Money, // required per SSOT
  includes: z.array(IncludesSection).optional(),
  outcomes: OutcomesBlock.optional(),
  faq: FAQBlock.optional(),
  content: z.object({ html: z.string() }).optional(),
  pricingMatrix: PackagePricingMatrix.optional(),
  addOnRecommendations: z.array(z.string()).optional(),
  // Allow relative paths or URLs for images; avoid strict URL() requirement.
  cardImage: z.object({ src: z.string().min(1), alt: z.string().optional() }).optional(),
});

// ----------------------------------------------------------------------------
// PackageBundle (authoring shape)
// ----------------------------------------------------------------------------

export const PackageBundle = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id must be kebab-case"),
  slug: z.string().optional(),
  service: z.string().optional(), // primary service for filtering (optional)
  name: z.string().min(2, "name is required"),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  price: Money, // required per SSOT
  compareAt: Money.optional(),
  components: z.array(z.string()).min(1, "components must list at least one package id"),
  badges: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  includes: z.array(IncludesSection).optional(),
  outcomes: OutcomesBlock.optional(),
  faq: FAQBlock.optional(),
  content: z.object({ html: z.string().optional() }).optional(),
  cardImage: z.object({ src: z.string().min(1), alt: z.string().optional() }).optional(),
});

// ----------------------------------------------------------------------------
// Collections + convenience parsers
// ----------------------------------------------------------------------------

export const ServicePackages = z.array(ServicePackage);
export const PackageBundles = z.array(PackageBundle);

export function parseServicePackages(json: unknown) {
  return ServicePackages.parse(json);
}
export function parsePackageBundles(json: unknown) {
  return PackageBundles.parse(json);
}
