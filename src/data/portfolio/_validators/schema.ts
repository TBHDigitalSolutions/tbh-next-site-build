// /src/data/portfolio/_validators/schema.ts
// Zod schemas for portfolio data validation

import { z } from "zod";
import { CANONICAL_CATEGORIES } from "../_types";

export const MediaSchema = z.object({
  type: z.enum(["video", "image", "interactive", "pdf"]),
  src: z.string().min(1, "Media source is required"),
  thumbnail: z.string().min(1, "Thumbnail is required for grid display"),
  poster: z.string().optional(),
  alt: z.string().optional(),
  title: z.string().optional(),
});

export const MetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"), // Always string for safe rendering
});

export const ProjectSchema = z.object({
  id: z.string().min(1, "Project ID is required").max(50, "Project ID too long"),
  title: z.string().min(1, "Project title is required").max(100, "Title too long"),
  description: z.string().max(500, "Description too long").optional(),
  category: z.enum(CANONICAL_CATEGORIES, {
    errorMap: () => ({ 
      message: `Category must be one of: ${CANONICAL_CATEGORIES.join(', ')}` 
    })
  }),
  tags: z.array(z.string().min(1)).optional(),
  client: z.string().max(100, "Client name too long").optional(),
  featured: z.boolean().optional(),
  priority: z.number().int().min(1).max(999).optional(),
  media: MediaSchema,
  href: z.string().url("href must be a valid URL").optional(),
  metrics: z.array(MetricSchema).max(10, "Too many metrics").optional()
});

export const ProjectArraySchema = z.array(ProjectSchema);

export type ProjectInput = z.input<typeof ProjectSchema>;