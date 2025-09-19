// /src/data/caseStudies/_types/index.ts
// Core case studies types - canonical source of truth

import type { CategorySlug } from '@/data/portfolio/_types';

export interface CaseStudyMetric {
  label: string;
  value: string; // Always string for safe React rendering
}

export interface CaseStudy {
  id: string;
  client: string;
  title: string;
  summary: string;
  category: CategorySlug; // Use same categories as portfolio
  logo?: string;
  primaryMetric: CaseStudyMetric;
  secondaryMetrics?: CaseStudyMetric[];
  link?: string;
  featured: boolean;
  priority?: number; // Lower numbers = higher priority for featured items
  industry?: string;
  timeline?: string;
  challenge?: string;
  solution?: string;
  results?: string[];
  tags?: string[];
  publishedDate?: string; // ISO date string
}

// Legacy case study format for migration
export interface LegacyCaseStudy {
  id?: string;
  client?: string;
  company?: string;
  clientName?: string;
  title?: string;
  name?: string;
  headline?: string;
  summary?: string;
  description?: string;
  content?: string;
  category?: string;
  service?: string;
  type?: string;
  logo?: string;
  image?: string;
  imageUrl?: string;
  thumbnail?: string;
  heroImage?: string;
  metrics?: any[];
  results?: any[] | string;
  kpis?: any[];
  tags?: string[];
  date?: string;
  link?: string;
  url?: string;
  href?: string;
  caseStudyUrl?: string;
  featured?: boolean;
  priority?: number;
  industry?: string;
  timeline?: string;
  challenge?: string;
  solution?: string;
}

// Type for flexible input handling
export type CaseStudyInput = 
  | CaseStudy[] 
  | LegacyCaseStudy[] 
  | { 
      items?: CaseStudy[] | LegacyCaseStudy[];
      caseStudies?: CaseStudy[] | LegacyCaseStudy[];
      studies?: CaseStudy[] | LegacyCaseStudy[];
      projects?: CaseStudy[] | LegacyCaseStudy[];
    }
  | null 
  | undefined;

// Type guards
export const isValidCaseStudy = (item: unknown): item is CaseStudy => {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'title' in item && 
         'client' in item &&
         'category' in item &&
         'featured' in item &&
         'primaryMetric' in item;
};

export const isValidCaseStudyMetric = (metric: unknown): metric is CaseStudyMetric => {
  return typeof metric === 'object' &&
         metric !== null &&
         'label' in metric &&
         'value' in metric &&
         typeof (metric as any).label === 'string' &&
         typeof (metric as any).value === 'string';
};

// Case study category configuration
export interface CaseStudyCategory {
  slug: CategorySlug;
  title: string;
  description?: string;
  expectedStudies: number; // Target number of case studies per category
}

export const CASE_STUDY_CATEGORIES: Record<CategorySlug, CaseStudyCategory> = {
  "web-development": {
    slug: "web-development",
    title: "Web Development",
    description: "Platform rebuilds, performance optimization, and scalable architectures",
    expectedStudies: 3
  },
  "video-production": {
    slug: "video-production", 
    title: "Video Production",
    description: "Product launches, testimonials, and brand storytelling campaigns",
    expectedStudies: 3
  },
  "seo-services": {
    slug: "seo-services",
    title: "SEO Services", 
    description: "Organic growth, local SEO, and technical optimization success stories",
    expectedStudies: 3
  },
  "marketing-services": {
    slug: "marketing-services",
    title: "Marketing Services",
    description: "Lead nurturing, automation workflows, and conversion optimization",
    expectedStudies: 3
  },
  "content-production": {
    slug: "content-production",
    title: "Content Production",
    description: "Thought leadership, content strategy, and authority building campaigns",
    expectedStudies: 3
  },
  "lead-generation": {
    slug: "lead-generation",
    title: "Lead Generation",
    description: "B2B campaigns, multi-channel strategies, and pipeline growth",
    expectedStudies: 3
  }
};

// Utility functions
export const generateCaseStudyId = (study: Partial<CaseStudy>): string => {
  const client = (study.client || 'client').toLowerCase().replace(/\s+/g, '-');
  const title = (study.title || 'case-study').toLowerCase().replace(/\s+/g, '-');
  return `${client}-${title}`.substring(0, 50);
};

export const normalizeCaseStudyMetrics = (
  metrics?: any[]
): CaseStudyMetric[] => {
  if (!metrics || !Array.isArray(metrics)) return [];
  
  return metrics
    .filter(metric => metric && metric.label && metric.value)
    .map(metric => ({
      label: String(metric.label).trim(),
      value: String(metric.value).trim()
    }));
};