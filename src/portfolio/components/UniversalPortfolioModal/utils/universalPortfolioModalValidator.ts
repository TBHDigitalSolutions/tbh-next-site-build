// ===================================================================
// /src/components/portfolio/UniversalPortfolioModal/utils/universalPortfolioModalValidator.ts
// ===================================================================
// Zod schemas + tolerant parsers for the domain-wide modal project.
// Supports light coercions: metrics → strings, tags → [], minimal media checks.
// ===================================================================

import { z } from "zod";
import type { ModalMediaType, ModalProject } from "../UniversalPortfolioModal.types";

const mediaTypeEnum: z.ZodType<ModalMediaType> = z.enum([
  "image",
  "video",
  "interactive",
  "pdf",
]);

const metricSchema = z.object({
  label: z.string().min(1),
  value: z.union([z.string(), z.number()]).transform((v) => String(v)),
});

const mediaSchema = z.object({
  type: mediaTypeEnum,
  src: z.string().min(1),
  poster: z.string().optional(),
  alt: z.string().optional(),
});

export const modalProjectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  client: z.string().optional(),
  href: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  metrics: z.array(metricSchema).optional().default([]),
  media: mediaSchema,
});

export type ParsedModalProject = z.infer<typeof modalProjectSchema>;

/**
 * Tolerant parser:
 * - strict=true  -> throws on invalid
 * - strict=false -> returns null on invalid
 */
export function parseModalProject(
  raw: unknown,
  strict = false
): ModalProject | null {
  if (strict) return modalProjectSchema.parse(raw);
  const res = modalProjectSchema.safeParse(raw);
  return res.success ? res.data : null;
}
