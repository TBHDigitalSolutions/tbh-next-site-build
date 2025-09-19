// ===================================================================
// portfolioOverviewValidator.ts - Production Ready
// ===================================================================

import { z } from "zod";

// ----------------------------
// Base schemas
// ----------------------------

export const overviewLayoutSchema = z.enum(["two-column", "stacked", "stats-first"]);
export const overviewBackgroundSchema = z.enum(["surface", "muted", "elevated", "accent"]);
export const textVariantSchema = z.enum(["default", "services", "about", "marketing"]);
export const statsVariantSchema = z.enum(["portfolio", "company", "services", "performance"]);
export const statsLayoutSchema = z.enum(["horizontal", "grid"]);

// ----------------------------
// Content schemas
// ----------------------------

export const overviewCTASchema = z.object({
  label: z.string().min(1),
  href: z.string().url(),
  target: z.enum(["_self", "_blank"]).optional(),
  rel: z.string().optional(),
  ariaLabel: z.string().optional(),
});

export const statItemSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string().min(1), z.number()]),
  helpText: z.string().optional(),
});

export const overviewTextSchema = z.object({
  headline: z.string().min(1),
  description: z.string().min(1),
  highlights: z.array(z.string().min(1)).optional(),
  cta: overviewCTASchema.optional(),
});

export const overviewStatisticsSchema = z.object({
  title: z.string().optional(),
  stats: z.array(statItemSchema).min(1),
  variant: z.enum(["compact", "detailed"]).optional(),
});

// ----------------------------
// Input schema (authoring)
// ----------------------------

export const portfolioOverviewInputSchema = z.object({
  sectionTitle: z.string().optional(),
  sectionId: z.string().optional(),
  background: overviewBackgroundSchema.optional(),
  layout: overviewLayoutSchema.optional(),
  reverse: z.boolean().optional(),
  className: z.string().optional(),
  text: overviewTextSchema.optional(),
  statistics: overviewStatisticsSchema.optional(),
}).refine(
  data => data.text || data.statistics,
  { message: "Either text or statistics content is required" }
);

// ----------------------------
// Props schema (component)
// ----------------------------

export const portfolioOverviewPropsSchema = z.object({
  sectionTitle: z.string().optional(),
  sectionId: z.string().optional(),
  background: overviewBackgroundSchema.optional(),
  layout: overviewLayoutSchema.optional(),
  reverse: z.boolean().optional(),
  className: z.string().optional(),
  textProps: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    paragraphs: z.array(z.string()).optional(),
    variant: textVariantSchema.optional(),
    className: z.string().optional(),
    showCTA: z.boolean().optional(),
    ctaText: z.string().optional(),
    ctaHref: z.string().optional(),
    ctaTarget: z.enum(["_self", "_blank"]).optional(),
    ctaRel: z.string().optional(),
    ctaAriaLabel: z.string().optional(),
  }).optional(),
  statsProps: z.object({
    variant: statsVariantSchema.optional(),
    layout: statsLayoutSchema.optional(),
    showTrends: z.boolean().optional(),
    showIcons: z.boolean().optional(),
    animated: z.boolean().optional(),
    className: z.string().optional(),
    customStats: z.array(z.object({
      id: z.string().optional(),
      label: z.string(),
      value: z.union([z.string(), z.number()]),
      suffix: z.string().optional(),
      icon: z.string().optional(),
      color: z.string().optional(),
      highlight: z.boolean().optional(),
    })).optional(),
  }).optional(),
}).refine(
  data => data.textProps || data.statsProps,
  { message: "Either textProps or statsProps is required" }
);

// ----------------------------
// Validation functions
// ----------------------------

export function validatePortfolioOverviewInput(input: unknown, strict = false) {
  if (strict) {
    return portfolioOverviewInputSchema.parse(input);
  }
  
  const result = portfolioOverviewInputSchema.safeParse(input);
  return result.success ? result.data : null;
}

export function validatePortfolioOverviewProps(props: unknown, strict = false) {
  if (strict) {
    return portfolioOverviewPropsSchema.parse(props);
  }
  
  const result = portfolioOverviewPropsSchema.safeParse(props);
  return result.success ? result.data : null;
}

// Type exports
export type ValidatedInput = z.infer<typeof portfolioOverviewInputSchema>;
export type ValidatedProps = z.infer<typeof portfolioOverviewPropsSchema>;