// src/components/ui/organisms/CaseStudyCarousel/adapters.ts

import type {
  CaseStudy,
  CaseStudyInput,
  CaseStudyCarouselProps,
  CaseStudyCarouselSection,
  LegacyCaseStudy,
  CaseStudyMetric,
  WebDevCaseStudyCarousel,
  VideoProductionCaseStudyCarousel,
  LeadGenerationCaseStudyCarousel,
  MarketingAutomationCaseStudyCarousel,
  SEOServicesCaseStudyCarousel,
  ContentProductionCaseStudyCarousel
} from './CaseStudyCarousel.types';

// ============================================================================
// Service-Specific Carousel Adapters
// ============================================================================

/**
 * Creates Web Development case study carousel with optimized defaults
 */
export const createWebDevCaseStudyCarousel = (
  caseStudies: CaseStudy[], 
  overrides: Partial<CaseStudyCarouselProps> = {}
): WebDevCaseStudyCarousel => ({
  title: "Web Development Success Stories",
  subtitle: "Discover how we've transformed businesses with modern web solutions that drive real results.",
  caseStudies: caseStudies.filter(cs => 
    cs.category === "Web Development" || 
    cs.services?.includes("Web Development") ||
    cs.tags.some(tag => ["Web Development", "Website", "React", "Next.js"].includes(tag))
  ),
  slidesToShow: 1,
  autoPlay: true,
  autoPlayInterval: 6000,
  showProgress: true,
  showPagination: true,
  showNavigation: true,
  infinite: true,
  enableDrag: true,
  variant: "detailed",
  sortBy: "featured",
  sortOrder: "desc",
  ...overrides
});

/**
 * Creates Video Production case study carousel with media-focused defaults
 */
export const createVideoProductionCaseStudyCarousel = (
  caseStudies: CaseStudy[],
  overrides: Partial<CaseStudyCarouselProps> = {}
): VideoProductionCaseStudyCarousel => ({
  title: "Video Production Portfolio",
  subtitle: "Compelling visual stories that drive engagement and deliver measurable business impact.",
  caseStudies: caseStudies.filter(cs =>
    cs.category === "Video Production" ||
    cs.services?.includes("Video Production") ||
    cs.tags.some(tag => ["Video", "Animation", "Commercial", "Corporate Video"].includes(tag))
  ),
  slidesToShow: 1,
  autoPlay: false, // Manual control for video content
  showProgress: false,
  showPagination: true,
  showNavigation: true,
  infinite: true,
  enableDrag: true,
  variant: "detailed",
  sortBy: "date",
  sortOrder: "desc",
  ...overrides
});

/**
 * Creates Lead Generation case study carousel with results-focused defaults
 */
export const createLeadGenCaseStudyCarousel = (
  caseStudies: CaseStudy[],
  overrides: Partial<CaseStudyCarouselProps> = {}
): LeadGenerationCaseStudyCarousel => ({
  title: "Lead Generation Results",
  subtitle: "Real case studies showing how we've helped businesses scale their lead generation and reduce acquisition costs.",
  caseStudies: caseStudies.filter(cs =>
    cs.category === "Lead Generation" ||
    cs.services?.includes("Lead Generation") ||
    cs.tags.some(tag => ["Lead Gen", "PPC", "Demand Generation", "B2B Marketing"].includes(tag))
  ),
  slidesToShow: 1,
  autoPlay: true,
  autoPlayInterval: 7000,
  showProgress: true,
  showPagination: true,
  showNavigation: true,
  infinite: true,
  enableDrag: true,
  variant: "detailed", // Emphasize metrics for lead gen
  sortBy: "featured",
  sortOrder: "desc",
  filterByCategory: ["Lead Generation", "B2B Marketing"],
  ...overrides
});

/**
 * Creates Marketing Automation case study carousel with efficiency-focused defaults
 */
export const createMarketingAutomationCaseStudyCarousel = (
  caseStudies: CaseStudy[],
  overrides: Partial<CaseStudyCarouselProps> = {}
): MarketingAutomationCaseStudyCarousel => ({
  title: "Marketing Automation Success Stories",
  subtitle: "See how marketing automation has transformed our clients' efficiency and revenue growth.",
  caseStudies: caseStudies.filter(cs =>
    cs.category === "Marketing Automation" ||
    cs.services?.includes("Marketing Automation") ||
    cs.tags.some(tag => ["Automation", "CRM", "Email Marketing", "Workflows"].includes(tag))
  ),
  slidesToShow: 1,
  autoPlay: true,
  autoPlayInterval: 8000,
  showProgress: true,
  showPagination: true,
  showNavigation: true,
  infinite: true,
  enableDrag: true,
  variant: "detailed",
  sortBy: "featured",
  sortOrder: "desc",
  ...overrides
});

/**
 * Creates SEO Services case study carousel with traffic-focused defaults
 */
export const createSEOServicesCaseStudyCarousel = (
  caseStudies: CaseStudy[],
  overrides: Partial<CaseStudyCarouselProps> = {}
): SEOServicesCaseStudyCarousel => ({
  title: "SEO Results That Speak Volumes",
  subtitle: "Organic growth success stories featuring significant traffic increases and improved search rankings.",
  caseStudies: caseStudies.filter(cs =>
    cs.category === "SEO" ||
    cs.category === "SEO Services" ||
    cs.services?.includes("SEO") ||
    cs.tags.some(tag => ["SEO", "Search Engine Optimization", "Organic Traffic", "Rankings"].includes(tag))
  ),
  slidesToShow: 1,
  autoPlay: true,
  autoPlayInterval: 6000,
  showProgress: true,
  showPagination: true,
  showNavigation: true,
  infinite: true,
  enableDrag: true,
  variant: "detailed",
  sortBy: "featured",
  sortOrder: "desc",
  ...overrides
});

/**
 * Creates Content Production case study carousel with engagement-focused defaults
 */
export const createContentProductionCaseStudyCarousel = (
  caseStudies: CaseStudy[],
  overrides: Partial<CaseStudyCarouselProps> = {}
): ContentProductionCaseStudyCarousel => ({
  title: "Content That Converts",
  subtitle: "Strategic content production that drives engagement, builds authority, and generates leads.",
  caseStudies: caseStudies.filter(cs =>
    cs.category === "Content Production" ||
    cs.services?.includes("Content Production") ||
    cs.tags.some(tag => ["Content Marketing", "Copywriting", "Blog", "Content Strategy"].includes(tag))
  ),
  slidesToShow: 1,
  autoPlay: true,
  autoPlayInterval: 7000,
  showProgress: true,
  showPagination: true,
  showNavigation: true,
  infinite: true,
  enableDrag: true,
  variant: "detailed",
  sortBy: "date",
  sortOrder: "desc",
  ...overrides
});

// ============================================================================
// Data Transformation Utilities
// ============================================================================

/**
 * Normalizes various case study input formats to standard CaseStudy array
 */
export const normalizeCaseStudyInput = (data: CaseStudyInput): CaseStudy[] => {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.map(normalizeCaseStudy);
  }
  
  if (typeof data === 'object') {
    const input = data as any;
    const items = input.items || input.caseStudies || input.studies || input.projects || [];
    return Array.isArray(items) ? items.map(normalizeCaseStudy) : [];
  }
  
  return [];
};

/**
 * Normalizes a single case study, handling legacy field names
 */
export const normalizeCaseStudy = (study: LegacyCaseStudy | CaseStudy): CaseStudy => {
  const input = study as LegacyCaseStudy;
  
  return {
    id: input.id || generateCaseStudyId(input),
    client: input.client || input.company || input.clientName || "Client",
    title: input.title || input.name || input.headline || "Untitled Case Study",
    description: input.description || input.summary || input.content || "",
    category: input.category || input.service || input.type || "General",
    image: input.image || input.imageUrl || input.thumbnail || input.heroImage || "/images/default-case-study.jpg",
    metrics: normalizeMetrics(input.metrics || input.results || input.kpis || []),
    tags: Array.isArray(input.tags) ? input.tags.filter(Boolean) : [],
    date: input.date || new Date().toLocaleDateString(),
    link: input.link || input.url || input.href || input.caseStudyUrl || "#",
    featured: Boolean(input.featured),
    results: input.results && typeof input.results === 'string' ? input.results : undefined,
    industry: input.industry,
    duration: input.duration,
    budgetRange: input.budgetRange,
    services: input.services || []
  };
};

/**
 * Normalizes metrics data handling various input formats
 */
export const normalizeMetrics = (metrics: any[]): CaseStudyMetric[] => {
  if (!Array.isArray(metrics)) return [];
  
  return metrics.map(metric => {
    if (typeof metric === 'object' && metric !== null) {
      return {
        label: metric.label || metric.name || metric.title || "Metric",
        value: metric.value || metric.result || metric.number || "N/A",
        change: metric.change || metric.delta || metric.improvement,
        trend: metric.trend || (metric.change && metric.change.startsWith('+') ? 'up' : 
               metric.change && metric.change.startsWith('-') ? 'down' : 'neutral')
      };
    }
    
    // Handle string format like "Revenue: +300%"
    if (typeof metric === 'string') {
      const parts = metric.split(':');
      return {
        label: parts[0]?.trim() || "Metric",
        value: parts[1]?.trim() || metric,
        trend: parts[1]?.includes('+') ? 'up' : 
               parts[1]?.includes('-') ? 'down' : 'neutral'
      };
    }
    
    return {
      label: "Metric",
      value: String(metric),
      trend: 'neutral'
    };
  }).filter(metric => metric.label && metric.value);
};

/**
 * Generates a unique ID for case studies missing one
 */
const generateCaseStudyId = (study: LegacyCaseStudy): string => {
  const title = study.title || study.name || study.headline || "untitled";
  const client = study.client || study.company || study.clientName || "client";
  const slug = `${client}-${title}`.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return slug + '-' + Date.now().toString(36);
};

// ============================================================================
// External Data Source Adapters
// ============================================================================

/**
 * Adapter for Strapi CMS case studies
 */
export const adaptStrapiCaseStudies = (strapiData: any[]): CaseStudy[] => {
  return strapiData.map(item => ({
    id: item.id?.toString() || generateCaseStudyId(item),
    client: item.attributes?.client || item.client || "Client",
    title: item.attributes?.title || item.title || "Untitled",
    description: item.attributes?.description || item.description || "",
    category: item.attributes?.category?.data?.attributes?.name || 
              item.attributes?.category || 
              item.category || "General",
    image: item.attributes?.image?.data?.attributes?.url || 
           item.attributes?.heroImage?.data?.attributes?.url ||
           item.image || "/images/default-case-study.jpg",
    metrics: normalizeMetrics(item.attributes?.metrics || item.metrics || []),
    tags: item.attributes?.tags?.data?.map((tag: any) => tag.attributes?.name) ||
          item.attributes?.tags ||
          item.tags || [],
    date: formatStrapiDate(item.attributes?.publishedAt || item.publishedAt || item.date),
    link: `/case-studies/${item.attributes?.slug || item.slug || item.id}`,
    featured: item.attributes?.featured || item.featured || false,
    results: item.attributes?.results || item.results,
    industry: item.attributes?.industry?.data?.attributes?.name ||
              item.attributes?.industry ||
              item.industry,
    duration: item.attributes?.duration || item.duration,
    services: item.attributes?.services?.data?.map((service: any) => service.attributes?.name) ||
              item.attributes?.services ||
              item.services || []
  }));
};

/**
 * Adapter for Contentful case studies
 */
export const adaptContentfulCaseStudies = (contentfulData: any[]): CaseStudy[] => {
  return contentfulData.map(item => ({
    id: item.sys?.id || generateCaseStudyId(item),
    client: item.fields?.client || "Client",
    title: item.fields?.title || "Untitled",
    description: item.fields?.description || "",
    category: item.fields?.category || "General",
    image: item.fields?.image?.fields?.file?.url || "/images/default-case-study.jpg",
    metrics: normalizeMetrics(item.fields?.metrics || []),
    tags: item.fields?.tags || [],
    date: formatContentfulDate(item.fields?.date || item.sys?.updatedAt),
    link: `/case-studies/${item.fields?.slug || item.sys?.id}`,
    featured: item.fields?.featured || false,
    results: item.fields?.results,
    industry: item.fields?.industry,
    duration: item.fields?.duration,
    services: item.fields?.services || []
  }));
};

/**
 * Adapter for generic API responses
 */
export const adaptGenericAPIResponse = (apiData: any): CaseStudy[] => {
  const items = apiData.data || apiData.items || apiData.caseStudies || apiData;
  
  if (!Array.isArray(items)) {
    console.warn('Case Study API response is not an array:', apiData);
    return [];
  }
  
  return items.map(normalizeCaseStudy);
};

// ============================================================================
// Filtering and Sorting Utilities
// ============================================================================

/**
 * Filters case studies by service category
 */
export const filterCaseStudiesByService = (
  caseStudies: CaseStudy[], 
  serviceCategories: string[]
): CaseStudy[] => {
  return caseStudies.filter(study =>
    serviceCategories.some(category =>
      study.category.toLowerCase().includes(category.toLowerCase()) ||
      study.services?.some(service => 
        service.toLowerCase().includes(category.toLowerCase())
      ) ||
      study.tags.some(tag =>
        tag.toLowerCase().includes(category.toLowerCase())
      )
    )
  );
};

/**
 * Sorts case studies by specified criteria
 */
export const sortCaseStudies = (
  caseStudies: CaseStudy[],
  sortBy: 'date' | 'client' | 'category' | 'featured' | 'title' = 'featured',
  direction: 'asc' | 'desc' = 'desc'
): CaseStudy[] => {
  return [...caseStudies].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
        break;
      case 'client':
        comparison = a.client.localeCompare(b.client);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'featured':
        comparison = (a.featured ? 1 : 0) - (b.featured ? 1 : 0);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

/**
 * Limits the number of case studies and prioritizes featured ones
 */
export const limitAndPrioritizeCaseStudies = (
  caseStudies: CaseStudy[],
  limit: number,
  prioritizeFeatured: boolean = true
): CaseStudy[] => {
  let studies = [...caseStudies];
  
  if (prioritizeFeatured) {
    const featured = studies.filter(s => s.featured);
    const regular = studies.filter(s => !s.featured);
    studies = [...featured, ...regular];
  }
  
  return studies.slice(0, limit);
};

// ============================================================================
// Date Formatting Utilities
// ============================================================================

const formatStrapiDate = (dateString: string): string => {
  if (!dateString) return new Date().toLocaleDateString();
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatContentfulDate = (dateString: string): string => {
  if (!dateString) return new Date().toLocaleDateString();
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  });
};

// ============================================================================
// Section Factory for Service Pages
// ============================================================================

/**
 * Creates a complete carousel section for service pages
 */
export const createCaseStudySection = (
  serviceName: string,
  caseStudies: CaseStudy[],
  config: Partial<CaseStudyCarouselProps> = {}
): CaseStudyCarouselSection => {
  const serviceAdapters = {
    'Web Development': createWebDevCaseStudyCarousel,
    'Video Production': createVideoProductionCaseStudyCarousel,
    'Lead Generation': createLeadGenCaseStudyCarousel,
    'Marketing Automation': createMarketingAutomationCaseStudyCarousel,
    'SEO Services': createSEOServicesCaseStudyCarousel,
    'Content Production': createContentProductionCaseStudyCarousel
  };
  
  const adapter = serviceAdapters[serviceName as keyof typeof serviceAdapters];
  
  if (adapter) {
    const carouselProps = adapter(caseStudies, config);
    return {
      title: carouselProps.title,
      subtitle: carouselProps.subtitle,
      data: carouselProps.caseStudies,
      config: carouselProps
    };
  }
  
  // Fallback for unrecognized services
  return {
    title: `${serviceName} Case Studies`,
    subtitle: "Success stories and results from our client partnerships.",
    data: caseStudies,
    config: {
      slidesToShow: 1,
      autoPlay: true,
      autoPlayInterval: 6000,
      showProgress: true,
      showPagination: true,
      showNavigation: true,
      infinite: true,
      enableDrag: true,
      variant: "default",
      ...config
    }
  };
};