// ===================================================================
// /src/components/portfolio/PortfolioOverviewText/utils/portfolioOverviewTextValidator.ts
// ===================================================================
import { z } from "zod";
import type { OverviewTextInput, OverviewTextVariant } from "../PortfolioOverviewText.types";

const variantEnum: z.ZodType<OverviewTextVariant> = z.enum([
  "default",
  "services",
  "about",
  "marketing",
]);

export const overviewTextInputSchema = z.object({
  headline: z.string().trim().min(1).optional(),
  subtitle: z.string().trim().optional(),
  description: z.string().trim().optional(),
  highlights: z.array(z.string()).optional().default([]),
  cta: z
    .object({
      label: z.string().trim().min(1),
      href: z.string().trim().min(1),
    })
    .optional(),
  variant: variantEnum.optional(),
  className: z.string().optional(),
});

/** Tolerant parse: returns {} on failure unless strict=true */
export function parseOverviewTextInput(
  raw: unknown,
  strict = false
): OverviewTextInput {
  if (strict) return overviewTextInputSchema.parse(raw) as OverviewTextInput;
  const res = overviewTextInputSchema.safeParse(raw);
  return res.success ? (res.data as OverviewTextInput) : {};
}
