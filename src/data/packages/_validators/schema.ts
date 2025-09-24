// /src/data/packages/_validators/schema.ts
// Zod schemas for SSOT types — validates authoring shape only.
// Deeper cross-refs (e.g., featured → packageId, components[]) live in packages.validate.ts

import { z } from "zod";

// --- Primitives / enums ------------------------------------------------------

export const ServiceSlugSchema = z.enum([
  "content",
  "leadgen",
  "marketing",
  "seo",
  "webdev",
  "video",
] as const);

export const TierSchema = z.enum(["Essential", "Professional", "Enterprise"] as const);

// --- Money (canonical) -------------------------------------------------------

export const MoneySchema = z
  .object({
    oneTime: z.number().nonnegative().optional(),
    monthly: z.number().nonnegative().optional(),
    currency: z.literal("USD").optional(),
  })
  .refine((p) => p.oneTime != null || p.monthly != null, {
    message: "Money requires at least one of {oneTime, monthly}",
    path: ["oneTime"],
  });

export const PriceMetaSchema = z.object({
  note: z.string().min(1).max(40).optional(),
  minTermMonths: z.number().int().positive().optional(),
  setupWaivedAfterMonths: z.number().int().positive().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
});

// --- Shared primitives -------------------------------------------------------

export const FeatureItemSchema = z.object({
  label: z.string().min(1),
  detail: z.string().min(1).optional(),
});

// --- Core entities -----------------------------------------------------------

export const ServicePackageSchema = z.object({
  id: z.string().min(1),
  service: ServiceSlugSchema,
  name: z.string().min(1),
  tier: TierSchema.optional(),
  summary: z.string().min(1).optional(),
  features: z.array(FeatureItemSchema).min(1).optional(),
  price: MoneySchema.optional(),
  priceMeta: PriceMetaSchema.optional(),
  badges: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
  category: z.string().min(1).optional(),
  sla: z.string().min(1).optional(),
  popular: z.boolean().optional(),
});

export const AddOnSchema = z.object({
  id: z.string().min(1),
  service: ServiceSlugSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  deliverables: z.array(FeatureItemSchema).min(1),
  price: MoneySchema.optional(),
  priceMeta: PriceMetaSchema.optional(),
  dependencies: z.array(z.string().min(1)).optional(),
  pairsBestWith: z.array(TierSchema).optional(),
  badges: z.array(z.string().min(1)).optional(),
  popular: z.boolean().optional(),
  tags: z.array(z.string().min(1)).optional(),
});

export const FeaturedCardSchema = z.object({
  id: z.string().min(1),
  service: ServiceSlugSchema,
  packageId: z.string().min(1),
  headline: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(3).max(6),
  startingAt: z.number().nonnegative().optional(),
  badge: z.string().min(1).optional(),
  ctaLabel: z.string().min(1).optional(),
});

export const IncludeGroupSchema = z.object({
  title: z.string().min(1).optional(),
  items: z.array(z.string().min(1)).min(1),
});

export const BundleSchema = z.object({
  slug: z.string().min(1),
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  summary: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  category: z.enum(["startup", "local", "ecommerce", "b2b", "custom"]).optional(),
  price: MoneySchema.optional(),
  priceMeta: PriceMetaSchema.optional(),
  includes: z.array(IncludeGroupSchema).optional(),
  components: z.array(z.string().min(1)).optional(),
  addOnRecommendations: z.array(z.string().min(1)).optional(),
  outcomes: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).optional(),
  timeline: z.string().optional(),
  faq: z
    .object({
      title: z.string().optional(),
      faqs: z.array(
        z.object({
          id: z.string().min(1),
          question: z.string().min(1),
          answer: z.string().min(1),
        }),
      ),
    })
    .optional(),
  hero: z
    .object({
      content: z
        .object({
          title: z.string().optional(),
          subtitle: z.string().optional(),
          primaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }).optional(),
          secondaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }).optional(),
        })
        .optional(),
      background: z
        .object({
          type: z.enum(["image", "video"]),
          src: z.string().min(1),
          alt: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  cardImage: z.object({ src: z.string().min(1), alt: z.string().optional() }).optional(),
  popular: z.boolean().optional(),
});

// Presentation-only schemas (kept for existing page templates)
export const BundleTierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  price: z.string().min(1), // preformatted "$x/mo" or "$y one-time"
  period: z.string().min(1),
  features: z.array(z.string().min(1)).min(1),
  badge: z.string().min(1).optional(),
  cta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
});

export const ServicePricingSchema = z.object({
  kind: z.literal("tiers"),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  tiers: z.array(BundleTierSchema).min(1),
});

// Collections + convenience parsers
export const ServicePackagesSchema = z.array(ServicePackageSchema);
export const AddOnsSchema = z.array(AddOnSchema);
export const FeaturedCardsSchema = z.array(FeaturedCardSchema);
export const BundlesSchema = z.array(BundleSchema);

export function parseServicePackages(json: unknown) { return ServicePackagesSchema.parse(json); }
export function parseAddOns(json: unknown) { return AddOnsSchema.parse(json); }
export function parseFeatured(json: unknown) { return FeaturedCardsSchema.parse(json); }
export function parseBundles(json: unknown) { return BundlesSchema.parse(json); }
