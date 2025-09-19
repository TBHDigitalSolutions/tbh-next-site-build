// src/components/portfolio/types.ts
// Component-level types and configurations for portfolio system

// ============================
// RE-EXPORT FROM DATA LAYER
// ============================

export type { 
  CategorySlug,
  Project,
  PortfolioMedia,
  ProjectMetric
} from '@/data/portfolio/_types';

// ============================
// COMPONENT CONFIGURATION
// ============================

export const CATEGORY_SLUGS = [
  "web-development",
  "video-production", 
  "seo-services",
  "marketing-automation", // Keep existing for compatibility
  "content-production",
  "lead-generation"
] as const;

export interface CategoryConfig {
  label: string;
  variant: "interactive" | "video" | "gallery";
  viewAllHref: string;
  description?: string;
}

export const CATEGORY_COMPONENTS: Record<string, CategoryConfig> = {
  "web-development": {
    label: "Web Development",
    variant: "interactive",
    viewAllHref: "/portfolio/web-development",
    description: "Interactive builds and scalable web applications."
  },
  "video-production": {
    label: "Video Production", 
    variant: "video",
    viewAllHref: "/portfolio/video-production",
    description: "Showreels, explainers, and brand stories that convert."
  },
  "seo-services": {
    label: "SEO Services",
    variant: "gallery",
    viewAllHref: "/portfolio/seo-services",
    description: "Rankings, visibility, and measurable organic growth."
  },
  "marketing-automation": {
    label: "Marketing Automation",
    variant: "gallery", 
    viewAllHref: "/portfolio/marketing-automation",
    description: "Journeys, workflows, and nurture campaigns that convert."
  },
  "content-production": {
    label: "Content Production",
    variant: "gallery",
    viewAllHref: "/portfolio/content-production",
    description: "Editorial content and design for acquisition and enablement."
  },
  "lead-generation": {
    label: "Lead Generation",
    variant: "gallery",
    viewAllHref: "/portfolio/lead-generation",
    description: "Funnels, creatives, and campaigns that generate pipeline."
  }
} as const;

// ============================
// UTILITY TYPES
// ============================

export type CategoryVariant = CategoryConfig['variant'];
export type ProjectsByCategory = Record<CategorySlug, Project[]>;

// ============================
// HELPER FUNCTIONS
// ============================

export function getCategoriesByVariant(variant: CategoryVariant): string[] {
  return Object.entries(CATEGORY_COMPONENTS)
    .filter(([, config]) => config.variant === variant)
    .map(([slug]) => slug);
}

export function getCategoryConfig(slug: string): CategoryConfig | undefined {
  return CATEGORY_COMPONENTS[slug];
}