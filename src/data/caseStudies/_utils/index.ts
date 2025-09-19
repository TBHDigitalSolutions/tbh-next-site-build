// /src/data/caseStudies/_utils/index.ts
// Case studies utility functions for search, filtering, and data manipulation

import type { CaseStudy, CaseStudyMetric, LegacyCaseStudy, CaseStudyInput } from '../_types';
import type { CategorySlug } from '@/data/portfolio/_types';

// Search functionality
export const searchCaseStudies = (studies: CaseStudy[], query: string): CaseStudy[] => {
  const q = query.toLowerCase().trim();
  if (!q) return studies;
  
  return studies.filter((study) => {
    const searchableText = [
      study.title,
      study.summary,
      study.client,
      study.industry || "",
      study.challenge || "",
      study.solution || "",
      ...(study.tags || []),
      ...(study.results || [])
    ].join(" ").toLowerCase();
    
    return searchableText.includes(q);
  });
};

// Category filtering
export const getCaseStudiesByCategory = (studies: CaseStudy[], category: CategorySlug): CaseStudy[] => {
  return studies.filter(study => study.category === category);
};

// Featured items
export const getFeaturedCaseStudies = (studies: CaseStudy[]): CaseStudy[] => {
  return studies.filter(study => study.featured);
};

export const getFeaturedByCategory = (
  studies: CaseStudy[], 
  category: CategorySlug, 
  limit?: number
): CaseStudy[] => {
  const categoryStudies = studies
    .filter(study => study.category === category && study.featured)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999));
    
  return limit ? categoryStudies.slice(0, limit) : categoryStudies;
};

// Industry filtering
export const getCaseStudiesByIndustry = (studies: CaseStudy[], industry: string): CaseStudy[] => {
  const q = industry.toLowerCase();
  return studies.filter(study => 
    study.industry?.toLowerCase().includes(q)
  );
};

// Client filtering
export const getCaseStudiesByClient = (studies: CaseStudy[], client: string): CaseStudy[] => {
  const q = client.toLowerCase();
  return studies.filter(study => 
    study.client.toLowerCase().includes(q)
  );
};

// Tag filtering
export const filterCaseStudiesByTags = (studies: CaseStudy[], tags: string[]): CaseStudy[] => {
  if (!tags.length) return studies;
  return studies.filter((study) => 
    tags.some((tag) => study.tags?.includes(tag))
  );
};

// Get available tags from case studies
export const getAvailableTags = (studies: CaseStudy[]): string[] => {
  const allTags = studies.flatMap((study) => study.tags || []);
  return Array.from(new Set(allTags)).sort();
};

// Get available industries
export const getAvailableIndustries = (studies: CaseStudy[]): string[] => {
  const industries = studies
    .map(study => study.industry)
    .filter(industry => industry !== undefined) as string[];
  return Array.from(new Set(industries)).sort();
};

// Data normalization
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

// Legacy data migration
export const migrateLegacyCaseStudy = (legacy: LegacyCaseStudy): CaseStudy => {
  return {
    id: legacy.id || generateCaseStudyId(legacy),
    client: legacy.client || legacy.company || legacy.clientName || "Client",
    title: legacy.title || legacy.name || legacy.headline || "Untitled Case Study",
    summary: legacy.summary || legacy.description || legacy.content || "",
    category: normalizeCategorySlug(legacy.category || legacy.service || legacy.type || "web-development"),
    logo: legacy.logo || legacy.image || legacy.imageUrl || legacy.thumbnail,
    primaryMetric: extractPrimaryMetric(legacy),
    secondaryMetrics: normalizeCaseStudyMetrics(legacy.metrics || legacy.results || legacy.kpis),
    link: legacy.link || legacy.url || legacy.href || legacy.caseStudyUrl,
    featured: Boolean(legacy.featured),
    priority: legacy.priority,
    industry: legacy.industry,
    timeline: legacy.timeline,
    challenge: legacy.challenge,
    solution: legacy.solution,
    results: extractResults(legacy),
    tags: Array.isArray(legacy.tags) ? legacy.tags.filter(Boolean) : [],
    publishedDate: legacy.date
  };
};

// Normalize case study input from various formats
export const normalizeCaseStudyInput = (data: CaseStudyInput): CaseStudy[] => {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.map(study => 
      isValidCaseStudy(study) ? study : migrateLegacyCaseStudy(study as LegacyCaseStudy)
    );
  }
  
  if (typeof data === 'object') {
    const input = data as any;
    const items = input.items || input.caseStudies || input.studies || input.projects || [];
    return Array.isArray(items) ? normalizeCaseStudyInput(items) : [];
  }
  
  return [];
};

// Statistics and analytics
export const getCaseStudyStats = (studies: CaseStudy[]) => {
  const byCategory = {} as Record<CategorySlug, number>;
  const byIndustry = {} as Record<string, number>;
  
  studies.forEach(study => {
    byCategory[study.category] = (byCategory[study.category] || 0) + 1;
    if (study.industry) {
      byIndustry[study.industry] = (byIndustry[study.industry] || 0) + 1;
    }
  });
  
  return {
    total: studies.length,
    featured: getFeaturedCaseStudies(studies).length,
    categories: byCategory,
    industries: byIndustry,
    tags: getAvailableTags(studies).length,
    averagePerCategory: studies.length / Object.keys(byCategory).length || 0
  };
};

// Asset validation
export const checkCaseStudyAssets = (studies: CaseStudy[]): string[] => {
  const issues: string[] = [];
  
  studies.forEach(study => {
    if (!study.logo) {
      issues.push(`${study.id}: missing logo`);
    }
    
    if (!study.primaryMetric.value || !study.primaryMetric.label) {
      issues.push(`${study.id}: incomplete primary metric`);
    }
    
    if (!study.summary || study.summary.length < 50) {
      issues.push(`${study.id}: summary too short (minimum 50 characters)`);
    }
  });
  
  return issues;
};

// Helper functions
const generateCaseStudyId = (study: Partial<CaseStudy | LegacyCaseStudy>): string => {
  const client = (study.client || (study as any).company || 'client')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20);
  
  const title = (study.title || (study as any).name || 'case-study')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20);
    
  return `${client}-${title}`;
};

const normalizeCategorySlug = (category: string): CategorySlug => {
  const categoryMap: Record<string, CategorySlug> = {
    'web': 'web-development',
    'website': 'web-development',
    'development': 'web-development',
    'video': 'video-production',
    'media': 'video-production',
    'seo': 'seo-services',
    'search': 'seo-services',
    'marketing': 'marketing-services',
    'automation': 'marketing-services',
    'marketing-automation': 'marketing-services',
    'content': 'content-production',
    'copywriting': 'content-production',
    'leadgen': 'lead-generation',
    'lead-gen': 'lead-generation',
    'leads': 'lead-generation'
  };
  
  const normalized = category.toLowerCase().replace(/\s+/g, '-');
  return categoryMap[normalized] || 'web-development';
};

const extractPrimaryMetric = (legacy: LegacyCaseStudy): CaseStudyMetric => {
  // Try to find the most important metric
  const metrics = legacy.metrics || legacy.results || legacy.kpis || [];
  
  if (Array.isArray(metrics) && metrics.length > 0) {
    const first = metrics[0];
    if (first && first.label && first.value) {
      return {
        label: String(first.label),
        value: String(first.value)
      };
    }
  }
  
  // Fallback to default
  return {
    label: "Results",
    value: "Improved"
  };
};

const extractResults = (legacy: LegacyCaseStudy): string[] | undefined => {
  if (Array.isArray(legacy.results)) {
    return legacy.results.map(String).filter(Boolean);
  }
  
  if (typeof legacy.results === 'string') {
    return [legacy.results];
  }
  
  return undefined;
};

const isValidCaseStudy = (item: unknown): item is CaseStudy => {
  return typeof item === 'object' && 
         item !== null && 
         'id' in item && 
         'title' in item && 
         'client' in item &&
         'category' in item &&
         'featured' in item &&
         'primaryMetric' in item;
};

// Development helpers
export const getCaseStudyValidationReport = (studies: CaseStudy[]) => {
  const stats = getCaseStudyStats(studies);
  const assetIssues = checkCaseStudyAssets(studies);
  
  if (process.env.NODE_ENV === 'development') {
    console.log("[caseStudies] Case Study Statistics:", {
      totalStudies: stats.total,
      featuredStudies: stats.featured,
      categoriesWithStudies: Object.entries(stats.categories).filter(([, count]) => count > 0),
      totalIndustries: Object.keys(stats.industries).length,
      assetIssues: assetIssues.length,
    });
  }
  
  return {
    stats,
    assetIssues,
    isValid: assetIssues.length === 0
  };
};