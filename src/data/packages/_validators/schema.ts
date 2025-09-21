// /src/data/packages/_validators/schema.ts
// Zod schemas for the data-layer SSOT types.
// These validate shape only; deeper cross-refs live in packages.validate.ts

import { z } from "zod";
import { SERVICE_SLUGS } from "../_utils/slugs";

// --- Primitives / enums ------------------------------------------------------

export const ServiceSlugSchema = z.enum(SERVICE_SLUGS as unknown as [string, ...string[]]);

export const TierSchema = z.enum(["Essential", "Professional", "Enterprise"]);

export const BillingModelSchema = z.enum(["one-time", "monthly", "hourly", "hybrid"]);

// --- Shared primitives -------------------------------------------------------

export const PriceSchema = z.object({
  setup: z.number().nonnegative().optional(),
  monthly: z.number().nonnegative().optional(),
  notes: z.string().min(1).optional(),
}).refine(p => p.setup != null || p.monthly != null, {
  message: "Price requires at least one of {setup, monthly}",
  path: ["setup"],
});

export const FeatureItemSchema = z.object({
  label: z.string().min(1, "feature label is required"),
  detail: z.string().min(1).optional(),
});

// --- Core entities -----------------------------------------------------------

export const PackageSchema = z.object({
  id: z.string().min(1),
  service: ServiceSlugSchema,
  name: z.string().min(1),
  tier: TierSchema,
  summary: z.string().min(1),
  idealFor: z.string().min(1).optional(),
  outcomes: z.array(z.string().min(1)).min(1),
  features: z.array(FeatureItemSchema).min(1),
  price: PriceSchema,
  badges: z.array(z.string().min(1)).optional(),
  sla: z.string().min(1).optional(),
  popular: z.boolean().optional(),
});

export const AddOnSchema = z.object({
  id: z.string().min(1),
  service: ServiceSlugSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  deliverables: z.array(FeatureItemSchema).min(1),
  billing: BillingModelSchema,
  price: PriceSchema.optional(), // allow custom-quoted add-ons
  dependencies: z.array(z.string().min(1)).optional(),
  pairsBestWith: z.array(TierSchema).optional(),
  popular: z.boolean().optional(),
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

export const BundleModuleSchema = z.object({
  service: ServiceSlugSchema,
  scopeSummary: z.string().min(1),
});

export const IntegratedBundleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  icp: z.string().min(1),
  problem: z.string().min(1),
  outcomes: z.array(z.string().min(1)).min(1),
  modules: z.array(BundleModuleSchema).min(1),
  timelineWeeks: z.number().int().positive().optional(),
  price: PriceSchema,
  kpis: z.array(z.string().min(1)).min(1),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).optional(),
  cta: z.object({ label: z.string().min(1), href: z.string().min(1).optional() }).optional(),
  popular: z.boolean().optional(),
});

export const BundleTierSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // Preformatted (e.g., "$2,500/mo"); keep as string to avoid locale coupling
  price: z.string().min(1),
  period: z.string().min(1),
  features: z.array(z.string().min(1)).min(1),
  badge: z.string().min(1).optional(),
  cta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
});

export const ServicePricingSchema = z.object({
  kind: z.literal("tiers"),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  tiers: z.array(BundleTierSchema).min(1),
});

// Data-layer marketing bundle used by pages (NOT the lib PackageBundle)
export const DataPackageBundleSchema = z.object({
  slug: z.string().min(1),
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  summary: z.string().min(1),
  category: z.enum(["startup", "local", "ecommerce", "b2b", "custom"]),
  tags: z.array(z.string().min(1)).default([]),
  icon: z.string().min(1),
  cardImage: z.object({ src: z.string().min(1), alt: z.string().min(1) }),
  hero: z.object({
    content: z.object({
      title: z.string().min(1),
      subtitle: z.string().min(1),
      primaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
      secondaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
    }),
    background: z.object({ type: z.literal("image"), src: z.string().min(1), alt: z.string().min(1) }),
  }),
  includedServices: z.array(z.string().min(1)).min(1),
  highlights: z.array(z.string().min(1)).min(3).max(8),
  outcomes: z.object({
    title: z.string().min(1),
    variant: z.literal("stats"),
    items: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).min(1),
  }),
  pricing: ServicePricingSchema,
  faq: z.object({
    title: z.string().min(1),
    faqs: z.array(z.object({ id: z.string().min(1), question: z.string().min(1), answer: z.string().min(1) })).min(1),
  }),
  cta: z.object({
    title: z.string().min(1),
    subtitle: z.string().optional(),
    primaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
    secondaryCta: z.object({ label: z.string().min(1), href: z.string().min(1) }),
    layout: z.literal("centered"),
    backgroundType: z.literal("gradient"),
  }),
});

// --- Collections -------------------------------------------------------------

export const PackagesSchema = z.array(PackageSchema);
export const AddOnsSchema = z.array(AddOnSchema);
export const FeaturedCardsSchema = z.array(FeaturedCardSchema);
export const IntegratedBundlesSchema = z.array(IntegratedBundleSchema);
export const DataPackageBundlesSchema = z.array(DataPackageBundleSchema);

// --- Convenience parsers -----------------------------------------------------

export function parsePackages(json: unknown) {
  return PackagesSchema.parse(json);
}
export function parseAddOns(json: unknown) {
  return AddOnsSchema.parse(json);
}
export function parseFeatured(json: unknown) {
  return FeaturedCardsSchema.parse(json);
}
export function parseBundles(json: unknown) {
  return IntegratedBundlesSchema.parse(json);
}
export function parseDataPackageBundles(json: unknown) {
  return DataPackageBundlesSchema.parse(json);
}
