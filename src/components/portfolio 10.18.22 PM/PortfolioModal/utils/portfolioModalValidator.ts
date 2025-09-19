// ===================================================================
// /src/components/portfolio/PortfolioModal/utils/portfolioModalValidator.ts
// ===================================================================
// Light Zod schemas + tolerant parsers for the single-item modal.
// - Validates media union
// - Coerces metrics to strings
// - Defaults tags/metrics to []
// ===================================================================

import { z } from "zod";
import type { PMediaType, PortfolioModalProject } from "../PortfolioModal.types";

const mediaTypeEnum: z.ZodType<PMediaType> = z.enum(["image", "video", "interactive", "pdf"]);

const metricSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]).transform((v) => String(v)),
});

const mediaSchema = z.object({
  type: mediaTypeEnum,
  src: z.string().min(1),
  poster: z.string().optional(),
  alt: z.string().optional(),
  title: z.string().optional(),
});

export const portfolioModalProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  client: z.string().optional(),
  href: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  metrics: z.array(metricSchema).optional().default([]),
  media: mediaSchema,
});

export type ParsedPortfolioModalProject = z.infer<typeof portfolioModalProjectSchema>;

/** Tolerant parse: returns null when invalid unless strict=true (then throws). */
export function parsePortfolioModalProject(raw: unknown, strict = false): PortfolioModalProject | null {
  if (strict) return portfolioModalProjectSchema.parse(raw);
  const res = portfolioModalProjectSchema.safeParse(raw);
  return res.success ? res.data : null;
}
