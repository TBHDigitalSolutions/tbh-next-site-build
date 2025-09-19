// /src/portfolio/lib/validators.ts
import { z } from 'zod';
import type { PortfolioVariant, MediaType } from './types';

export const MediaTypeSchema = z.enum(['image', 'video', 'interactive', 'pdf']);

export const ProjectMetricSchema = z.object({
  label: z.string(),
  value: z.union([z.string(), z.number()])
});

export const MediaItemSchema = z.object({
  type: MediaTypeSchema,
  src: z.string().url(),
  alt: z.string().optional(),
  thumbnail: z.string().url().optional(),
  poster: z.string().url().optional()
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  client: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  href: z.string().url().optional(),
  media: MediaItemSchema.optional(),
  metrics: z.array(ProjectMetricSchema).optional()
});

export const PortfolioSectionPropsSchema = z.object({
  variant: z.enum(['gallery', 'video', 'interactive']),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z.array(ProjectSchema)
});

// Validation functions
export function validateProject(input: unknown): boolean {
  return ProjectSchema.safeParse(input).success;
}

export function validatePortfolioSection(input: unknown): boolean {
  return PortfolioSectionPropsSchema.safeParse(input).success;
}

export function isValidMediaType(type: string): type is MediaType {
  return MediaTypeSchema.safeParse(type).success;
}

export function isValidVariant(variant: string): variant is PortfolioVariant {
  return ['gallery', 'video', 'interactive'].includes(variant);
}

---

// /src/portfolio/lib/validators.ts
import type { Project, PortfolioVariant, CategorySlug } from './types';

/**
 * Type guards for runtime validation
 */
export function isValidProject(item: unknown): item is Project {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'title' in item &&
         typeof (item as any).id === 'string' &&
         typeof (item as any).title === 'string';
}

export function isPortfolioVariant(value: unknown): value is PortfolioVariant {
  return typeof value === 'string' && 
         ['gallery', 'video', 'interactive'].includes(value);
}

export function isCategorySlug(value: unknown): value is CategorySlug {
  const validSlugs = [
    'web-development',
    'video-production', 
    'seo-services',
    'marketing-automation',
    'content-production',
    'lead-generation'
  ];
  return typeof value === 'string' && validSlugs.includes(value as CategorySlug);
}

/**
 * Validate array of projects
 */
export function validateProjectsForComponent(projects: unknown[]): Project[] {
  if (!Array.isArray(projects)) return [];
  return projects.filter(isValidProject);
}

/**
 * Sanitize portfolio section input
 */
export function validatePortfolioSectionInput(input: any): {
  variant: PortfolioVariant;
  items: Project[];
  title?: string;
  subtitle?: string;
} | null {
  if (!input) return null;
  
  const variant = isPortfolioVariant(input.variant) ? input.variant : 'gallery';
  const items = Array.isArray(input.items) ? validateProjectsForComponent(input.items) : [];
  
  return {
    variant,
    items,
    title: typeof input.title === 'string' ? input.title : undefined,
    subtitle: typeof input.subtitle === 'string' ? input.subtitle : undefined
  };
}