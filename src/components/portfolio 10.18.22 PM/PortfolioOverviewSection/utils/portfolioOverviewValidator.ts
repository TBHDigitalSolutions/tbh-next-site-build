// ===================================================================
// /src/components/portfolio/PortfolioOverviewSection/utils/portfolioOverviewValidator.ts
// ===================================================================
// Zod schemas + tolerant parsers for PortfolioOverviewSection.
//
// Supports *two* valid inputs:
//
// 1) Authoring Input (preferred upstream):
//    { sectionTitle?, sectionId?, background?, layout?, reverse?, className?,
//      text?: { headline, description, highlights?, cta? },
//      statistics?: { title?, stats: [{label, value, helpText?}], variant? } }
//
// 2) Presentational Props (pre-adapted):
//    { sectionTitle?, sectionId?, background?, className?,
//      layout?, reverse?,
//      textProps?: { title?, subtitle?, paragraphs?, variant?, ... },
//      statsProps?: { variant?, layout?, showTrends?, showIcons?, animated?, ... } }
//
// Use the union parser `smartParsePortfolioOverview()` when you don't
// know which shape you have, or the specific parsers if you do.
// ===================================================================

import { z } from "zod";

// ----------------------------
// Shared enums
// ----------------------------

export const layoutEnum = z.enum(["two-column", "stacked", "stats-first"]);
export const overviewTextVariantEnum = z.enum(["default", "services", "about", "marketing"]);
export const statsLayoutEnum = z.enum(["horizontal", "grid"]);
export const statsVariantEnum = z.enum(["portfolio", "company", "services", "performance"]);
export const inputStatsVariantEnum = z.enum(["compact", "detailed"]);

// ----------------------------
// Authoring-input granular schemas
// ----------------------------

export const overviewCTASchema = z.object({
  label: z.string().min(1, "CTA label is required"),
  href: z.string().min(1, "CTA href is required"),
  target: z.enum(["_self", "_blank"]).optional(),
  rel: z.string().optional(),
  ariaLabel: z.string().optional(),
});

export const statItemSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]).transform((v) => String(v)),
  helpText: z.string().optional(),
});

export const overviewStatisticsSchema = z.object({
  title: z.string().optional(),
  stats: z.array(statItemSchema).default([]),
  variant: inputStatsVariantEnum.optional(), // "compact" | "detailed"
});

export const overviewTextSchema = z.object({
  headline: z.string().min(1, "headline is required"),
  description: z.string().min(1, "description is required"),
  highlights: z.array(z.string()).optional().default([]),
  cta: overviewCTASchema.optional(),
});

// Top-level authoring input
export const portfolioOverviewSectionInputSchema = z.object({
  sectionTitle: z.string().optional(),
  sectionId: z.string().optional(),
  background: z.string().optional(),
  layout: layoutEnum.optional(),
  reverse: z.boolean().optional(),
  className: z.string().optional(),

  text: overviewTextSchema.optional(),
  statistics: overviewStatisticsSchema.optional(),
});

// ----------------------------
// Presentational-props granular schemas
// (These mirror the child components’ props shapes.)
// ----------------------------

export const textPropsSchema = z
  .object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    paragraphs: z.array(z.string()).optional(),
    variant: overviewTextVariantEnum.optional(),
    className: z.string().optional(),
    showCTA: z.boolean().optional(),
    ctaText: z.string().optional(),
    ctaHref: z.string().optional(),
  })
  .partial();

export const statsPropsSchema = z
  .object({
    variant: statsVariantEnum.optional(),
    layout: statsLayoutEnum.optional(),
    showTrends: z.boolean().optional(),
    showIcons: z.boolean().optional(),
    animated: z.boolean().optional(),
    className: z.string().optional(),
    // NOTE: ResultsStatsStrip accepts `customStats` with richer shape.
    // We allow a tolerant pass-through here.
    customStats: z
      .array(
        z
          .object({
            id: z.string().optional(),
            label: z.string().optional(),
            value: z.union([z.string(), z.number()]).optional(),
            suffix: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
            animationType: z.string().optional(),
            highlight: z.boolean().optional(),
            trend: z
              .object({
                direction: z.enum(["up", "down"]).optional(),
                value: z.union([z.string(), z.number()]).optional(),
                period: z.string().optional(),
              })
              .partial()
              .optional(),
          })
          .partial()
      )
      .optional(),
  })
  .partial();

// Top-level presentational props
export const portfolioOverviewPropsSchema = z.object({
  sectionTitle: z.string().optional(),
  sectionId: z.string().optional(),
  background: z.string().optional(),
  textProps: textPropsSchema.optional(),
  statsProps: statsPropsSchema.optional(),
  layout: layoutEnum.optional(),
  reverse: z.boolean().optional(),
  className: z.string().optional(),
});

// ----------------------------
// Union schema (either shape is valid)
// ----------------------------

export const portfolioOverviewUnionSchema = z.union([
  portfolioOverviewSectionInputSchema,
  portfolioOverviewPropsSchema,
]);

// ----------------------------
// Types
// ----------------------------

export type ParsedPortfolioOverviewInput = z.infer<typeof portfolioOverviewSectionInputSchema>;
export type ParsedPortfolioOverviewProps = z.infer<typeof portfolioOverviewPropsSchema>;

export type ParsedPortfolioOverviewUnion =
  | { kind: "input"; data: ParsedPortfolioOverviewInput }
  | { kind: "props"; data: ParsedPortfolioOverviewProps };

// ----------------------------
// Parsers (tolerant by default)
// ----------------------------

/**
 * Validate and coerce an authoring *input* payload.
 * Throws on invalid data when `strict = true`. Otherwise returns {} on failure.
 */
export function parsePortfolioOverviewInput(
  input: unknown,
  strict = false
): ParsedPortfolioOverviewInput {
  if (strict) return portfolioOverviewSectionInputSchema.parse(input);
  const res = portfolioOverviewSectionInputSchema.safeParse(input);
  return res.success ? res.data : ({} as ParsedPortfolioOverviewInput);
}

/**
 * Validate a *presentational props* payload.
 * Throws on invalid data when `strict = true`. Otherwise returns {} on failure.
 */
export function parsePortfolioOverviewProps(
  input: unknown,
  strict = false
): ParsedPortfolioOverviewProps {
  if (strict) return portfolioOverviewPropsSchema.parse(input);
  const res = portfolioOverviewPropsSchema.safeParse(input);
  return res.success ? res.data : ({} as ParsedPortfolioOverviewProps);
}

/**
 * Smart parser that accepts either shape and tells you which one you passed.
 * Throws on invalid data when `strict = true`. Otherwise returns `{ kind, data } | null`.
 */
export function smartParsePortfolioOverview(
  input: unknown,
  strict = false
): ParsedPortfolioOverviewUnion | null {
  if (strict) {
    // Parse with union; then refine which one matched exactly
    const parsed = portfolioOverviewUnionSchema.parse(input);
    const isProps = portfolioOverviewPropsSchema.safeParse(parsed).success;
    if (isProps) return { kind: "props", data: parsed as ParsedPortfolioOverviewProps };
    return { kind: "input", data: parsed as ParsedPortfolioOverviewInput };
  }

  // Tolerant mode: try props first (common in adapted flows), then input
  const asProps = portfolioOverviewPropsSchema.safeParse(input);
  if (asProps.success) return { kind: "props", data: asProps.data };

  const asInput = portfolioOverviewSectionInputSchema.safeParse(input);
  if (asInput.success) return { kind: "input", data: asInput.data };

  return null;
}
