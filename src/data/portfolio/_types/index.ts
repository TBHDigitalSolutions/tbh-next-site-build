// /src/data/portfolio/_types/index.ts
// Core portfolio types - canonical source of truth

export const CANONICAL_CATEGORIES = [
  "web-development",
  "video-production", 
  "seo-services",
  "marketing-services", // ← CANONICAL (no more marketing-automation)
  "content-production",
  "lead-generation"
] as const;

export type CategorySlug = (typeof CANONICAL_CATEGORIES)[number];

export interface Project {
  id: string;
  title: string;
  description?: string;
  category: CategorySlug;
  tags?: string[];
  client?: string;
  featured?: boolean;
  priority?: number; // Lower numbers = higher priority for featured items
  media: PortfolioMedia;
  href?: string; // Link to live site or case study
  metrics?: ProjectMetric[];
}

export interface PortfolioMedia {
  type: "video" | "image" | "interactive" | "pdf";
  src: string; // URL to the media or demo
  thumbnail: string; // Required for grid display
  poster?: string; // For videos
  alt?: string; // For accessibility
  title?: string; // For interactive demos
}

export interface ProjectMetric {
  label: string;
  value: string; // Keep as string for safe React rendering
}

export interface PortfolioCategory {
  slug: CategorySlug;
  title: string;
  description?: string;
  variant: "interactive" | "video" | "gallery";
}

// Category configuration for components
export const CATEGORY_CONFIGS: Record<CategorySlug, PortfolioCategory> = {
  "web-development": {
    slug: "web-development",
    title: "Web Development",
    description: "Interactive builds and scalable web applications",
    variant: "interactive"
  },
  "video-production": {
    slug: "video-production",
    title: "Video Production",
    description: "Showreels, explainers, and brand stories that convert",
    variant: "video"
  },
  "seo-services": {
    slug: "seo-services",
    title: "SEO Services",
    description: "Rankings, visibility, and measurable organic growth",
    variant: "gallery"
  },
  "marketing-services": {
    slug: "marketing-services",
    title: "Marketing Services",
    description: "Journeys, workflows, and nurture campaigns that convert",
    variant: "gallery"
  },
  "content-production": {
    slug: "content-production",
    title: "Content Production",
    description: "Editorial content and design for acquisition and enablement",
    variant: "gallery"
  },
  "lead-generation": {
    slug: "lead-generation",
    title: "Lead Generation",
    description: "Funnels, creatives, and campaigns that generate pipeline",
    variant: "gallery"
  }
};

// Legacy alias support for backward compatibility
export const CATEGORY_ALIASES: Record<string, CategorySlug> = {
  "marketing-automation": "marketing-services",
  "marketing": "marketing-services",
  "seo": "seo-services",
  "leadgen": "lead-generation",
  "web-dev": "web-development",
  "video": "video-production",
  "content": "content-production"
};

// Type guards
export const isCategorySlug = (value: unknown): value is CategorySlug => {
  return typeof value === 'string' && 
         (CANONICAL_CATEGORIES as readonly string[]).includes(value);
};

export const isValidProject = (item: unknown): item is Project => {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'title' in item && 
         'category' in item &&
         'media' in item &&
         isCategorySlug((item as any).category);
};

// Utility functions
export const normalizeCategory = (input: string): CategorySlug => {
  const lowered = input.toLowerCase();
  const alias = CATEGORY_ALIASES[lowered];
  if (alias) return alias;
  if (isCategorySlug(lowered)) return lowered;
  throw new Error(`Unknown category slug: ${input}`);
};

export const tryNormalizeCategory = (input: string): CategorySlug | undefined => {
  try {
    return normalizeCategory(input);
  } catch {
    return undefined;
  }
};