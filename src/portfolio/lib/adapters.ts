// /src/portfolio/lib/adapters.ts
// Production-ready domain adapters for template architecture

import type { HubSection } from '@/portfolio/templates/PortfolioHubTemplate';
import type { CategoryPageData } from '@/portfolio/templates/PortfolioCategoryTemplate';
import type { CategoryBundle } from '@/data/portfolio';
import type { Project, CategorySlug, PortfolioVariant } from './types';

// =============================================================================
// TEMPLATE ADAPTERS (Required by App Router pages)
// =============================================================================

/**
 * Adapts raw hub sections data for PortfolioHubTemplate
 * Used by: Hub page after calling getAllFeaturedByCategory()
 */
export function adaptSectionsForHub(rawSections: unknown): readonly HubSection[] {
  if (!Array.isArray(rawSections)) {
    console.warn('adaptSectionsForHub: Expected array, received:', typeof rawSections);
    return [];
  }

  return rawSections
    .map((section, index) => {
      if (!section || typeof section !== 'object') {
        console.warn(`adaptSectionsForHub: Invalid section at index ${index}:`, section);
        return null;
      }

      const { slug, label, variant, viewAllHref, items, subtitle, priority } = section as any;

      // Validate required fields
      if (!slug || !label || !variant || !viewAllHref) {
        console.warn(`adaptSectionsForHub: Missing required fields in section ${index}:`, {
          slug: !!slug,
          label: !!label,
          variant: !!variant,
          viewAllHref: !!viewAllHref
        });
        return null;
      }

      // Validate and normalize variant
      const normalizedVariant = normalizeVariant(variant);
      if (!normalizedVariant) {
        console.warn(`adaptSectionsForHub: Invalid variant "${variant}" in section ${index}, defaulting to "gallery"`);
      }

      return {
        slug: String(slug),
        label: String(label),
        variant: normalizedVariant || 'gallery',
        viewAllHref: String(viewAllHref),
        items: normalizeProjectsArray(items),
        subtitle: subtitle ? String(subtitle) : `Featured ${String(label).toLowerCase()} work`,
        priority: typeof priority === 'number' ? priority : (index + 1) * 10
      } as HubSection;
    })
    .filter((section): section is HubSection => section !== null)
    .sort((a, b) => (a.priority || 999) - (b.priority || 999)); // Sort by priority
}

/**
 * Adapts raw category bundle data for PortfolioCategoryTemplate
 * Used by: Category page after calling getCategoryBundle()
 */
export function adaptCategoryPageData(rawCategoryData: unknown): CategoryPageData {
  if (!rawCategoryData || typeof rawCategoryData !== 'object') {
    console.warn('adaptCategoryPageData: Invalid category data, using empty defaults');
    return createEmptyCategoryData();
  }

  const bundle = rawCategoryData as CategoryBundle;

  try {
    return {
      items: normalizeProjectsArray(bundle.items),
      tools: normalizeToolsArray(bundle.tools),
      caseStudies: normalizeCaseStudiesArray(bundle.caseStudies),
      recommendedPackages: normalizePackagesArray(bundle.recommendedPackages),
      metrics: normalizeMetrics(bundle.metrics)
    };
  } catch (error) {
    console.warn('adaptCategoryPageData: Error during adaptation:', error);
    return createEmptyCategoryData();
  }
}

// =============================================================================
// NORMALIZATION HELPERS
// =============================================================================

/**
 * Normalize and validate projects array with comprehensive error handling
 */
function normalizeProjectsArray(items: unknown): readonly Project[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item, index) => {
      if (!item || typeof item !== 'object') {
        console.warn(`Invalid project at index ${index}:`, item);
        return null;
      }

      const project = item as any;

      // Ensure required fields
      if (!project.id || !project.title) {
        console.warn(`Project missing required fields at index ${index}:`, {
          id: !!project.id,
          title: !!project.title
        });
        return null;
      }

      try {
        return {
          id: String(project.id),
          title: String(project.title),
          description: project.description ? String(project.description) : undefined,
          client: project.client ? String(project.client) : undefined,
          category: normalizeCategorySlug(project.category),
          tags: normalizeTagsArray(project.tags),
          featured: Boolean(project.featured),
          href: normalizeHref(project),
          media: normalizeProjectMedia(project.media),
          metrics: normalizeProjectMetrics(project.metrics)
        } as Project;
      } catch (error) {
        console.warn(`Error normalizing project at index ${index}:`, error);
        return null;
      }
    })
    .filter((project): project is Project => project !== null);
}

/**
 * Normalize project media with validation
 */
function normalizeProjectMedia(media: unknown) {
  if (!media || typeof media !== 'object') {
    return undefined;
  }

  const m = media as any;
  
  try {
    return {
      type: m.type || 'image',
      src: String(m.src || m.url || ''),
      alt: m.alt ? String(m.alt) : undefined,
      thumbnail: m.thumbnail ? String(m.thumbnail) : undefined,
      poster: m.poster ? String(m.poster) : undefined
    };
  } catch (error) {
    console.warn('Error normalizing project media:', error);
    return undefined;
  }
}

/**
 * Normalize project metrics to consistent array format
 */
function normalizeProjectMetrics(metrics: unknown) {
  if (!metrics) return undefined;

  try {
    // Handle array format
    if (Array.isArray(metrics)) {
      return metrics
        .map(metric => {
          if (!metric || typeof metric !== 'object') return null;
          const m = metric as any;
          if (!m.label && !m.name) return null;
          
          return {
            label: String(m.label || m.name || ''),
            value: m.value !== undefined ? String(m.value) : ''
          };
        })
        .filter(m => m && m.label);
    }

    // Handle object format
    if (typeof metrics === 'object') {
      return Object.entries(metrics)
        .map(([key, value]) => ({
          label: String(key),
          value: value !== undefined ? String(value) : ''
        }))
        .filter(m => m.label && m.value);
    }

    return undefined;
  } catch (error) {
    console.warn('Error normalizing project metrics:', error);
    return undefined;
  }
}

/**
 * Normalize tools array with validation
 */
function normalizeToolsArray(tools: unknown) {
  if (!Array.isArray(tools)) {
    return [];
  }

  return tools
    .map((tool, index) => {
      if (!tool || typeof tool !== 'object') {
        console.warn(`Invalid tool at index ${index}:`, tool);
        return null;
      }

      const t = tool as any;

      if (!t.id || !t.name) {
        console.warn(`Tool missing required fields at index ${index}:`, {
          id: !!t.id,
          name: !!t.name
        });
        return null;
      }

      try {
        return {
          id: String(t.id),
          name: String(t.name),
          iconUrl: t.iconUrl || t.icon ? String(t.iconUrl || t.icon) : undefined,
          href: normalizeHref(t)
        };
      } catch (error) {
        console.warn(`Error normalizing tool at index ${index}:`, error);
        return null;
      }
    })
    .filter(tool => tool !== null);
}

/**
 * Normalize case studies array with validation
 */
function normalizeCaseStudiesArray(caseStudies: unknown) {
  if (!Array.isArray(caseStudies)) {
    return [];
  }

  return caseStudies
    .map((study, index) => {
      if (!study || typeof study !== 'object') {
        console.warn(`Invalid case study at index ${index}:`, study);
        return null;
      }

      const cs = study as any;

      if (!cs.id || !cs.title) {
        console.warn(`Case study missing required fields at index ${index}:`, {
          id: !!cs.id,
          title: !!cs.title
        });
        return null;
      }

      try {
        return {
          id: String(cs.id),
          title: String(cs.title),
          summary: cs.summary ? String(cs.summary) : undefined,
          href: normalizeHref(cs)
        };
      } catch (error) {
        console.warn(`Error normalizing case study at index ${index}:`, error);
        return null;
      }
    })
    .filter(study => study !== null);
}

/**
 * Normalize packages array with validation
 */
function normalizePackagesArray(packages: unknown) {
  if (!Array.isArray(packages)) {
    return [];
  }

  return packages
    .map((pkg, index) => {
      if (!pkg || typeof pkg !== 'object') {
        console.warn(`Invalid package at index ${index}:`, pkg);
        return null;
      }

      const p = pkg as any;

      if (!p.id || !p.title) {
        console.warn(`Package missing required fields at index ${index}:`, {
          id: !!p.id,
          title: !!p.title
        });
        return null;
      }

      try {
        return {
          id: String(p.id),
          title: String(p.title),
          priceLabel: p.priceLabel || p.price ? String(p.priceLabel || p.price) : undefined,
          href: normalizeHref(p)
        };
      } catch (error) {
        console.warn(`Error normalizing package at index ${index}:`, error);
        return null;
      }
    })
    .filter(pkg => pkg !== null);
}

/**
 * Normalize metrics object with validation
 */
function normalizeMetrics(metrics: unknown) {
  if (!metrics || typeof metrics !== 'object') {
    return undefined;
  }

  const m = metrics as any;

  try {
    return {
      totalProjects: typeof m.totalProjects === 'number' ? m.totalProjects : 0,
      avgProjectDuration: m.avgProjectDuration ? String(m.avgProjectDuration) : undefined,
      successRate: m.successRate ? String(m.successRate) : undefined,
      clientSatisfaction: m.clientSatisfaction ? String(m.clientSatisfaction) : undefined
    };
  } catch (error) {
    console.warn('Error normalizing metrics:', error);
    return undefined;
  }
}

// =============================================================================
// UTILITY HELPERS
// =============================================================================

/**
 * Normalize variant to valid PortfolioVariant
 */
function normalizeVariant(variant: unknown): PortfolioVariant | null {
  if (typeof variant !== 'string') return null;
  
  const validVariants: PortfolioVariant[] = ['gallery', 'video', 'interactive'];
  return validVariants.includes(variant as PortfolioVariant) ? variant as PortfolioVariant : null;
}

/**
 * Normalize category slug with validation
 */
function normalizeCategorySlug(category: unknown): CategorySlug | undefined {
  if (typeof category !== 'string') return undefined;
  
  // Define valid category slugs (should match your CATEGORY_SLUGS)
  const validCategories: CategorySlug[] = [
    'web-development',
    'video-production',
    'seo-services', 
    'marketing-services',
    'content-production',
    'lead-generation'
  ];
  
  return validCategories.includes(category as CategorySlug) ? category as CategorySlug : undefined;
}

/**
 * Normalize tags array
 */
function normalizeTagsArray(tags: unknown): string[] | undefined {
  if (!Array.isArray(tags)) return undefined;
  
  const normalizedTags = tags
    .filter(tag => typeof tag === 'string' && tag.trim().length > 0)
    .map(tag => String(tag).trim());
    
  return normalizedTags.length > 0 ? normalizedTags : undefined;
}

/**
 * Normalize href from various possible fields
 */
function normalizeHref(item: any): string | undefined {
  const possibleHrefs = [item.href, item.url, item.link];
  const validHref = possibleHrefs.find(href => typeof href === 'string' && href.trim().length > 0);
  return validHref ? String(validHref).trim() : undefined;
}

/**
 * Create empty category data fallback
 */
function createEmptyCategoryData(): CategoryPageData {
  return {
    items: [],
    tools: [],
    caseStudies: [],
    recommendedPackages: [],
    metrics: undefined
  };
}

// =============================================================================
// LEGACY SUPPORT & BACKWARD COMPATIBILITY
// =============================================================================

/**
 * Legacy adapter function for backward compatibility
 * Converts flexible portfolio section input to component props
 */
export function toPortfolioSectionProps(input: unknown) {
  if (!input || typeof input !== 'object') {
    console.warn('toPortfolioSectionProps: Invalid input:', input);
    return null;
  }

  try {
    const data = input as any;
    const items = normalizeProjectsArray(data.items || data.projects || []);

    return {
      title: data.title ? String(data.title) : undefined,
      subtitle: data.subtitle ? String(data.subtitle) : undefined,
      description: data.description ? String(data.description) : undefined,
      items,
      variant: normalizeVariant(data.variant) || 'gallery',
      layout: data.layout || 'grid',
      size: data.size || 'medium',
      maxItems: typeof data.maxItems === 'number' ? data.maxItems : undefined,
      showSearch: Boolean(data.showSearch),
      showFilters: Boolean(data.showFilters),
      showLoadMore: Boolean(data.showLoadMore),
      showTitles: Boolean(data.showTitles),
      viewAllHref: normalizeHref(data),
      viewAllText: data.viewAllText ? String(data.viewAllText) : 'View All',
      analyticsContext: data.analyticsContext ? String(data.analyticsContext) : 'portfolio',
      className: data.className ? String(data.className) : '',
      background: data.background ? String(data.background) : undefined
    };
  } catch (error) {
    console.warn('toPortfolioSectionProps: Error processing input:', error);
    return null;
  }
}

/**
 * Quick adapter for simple gallery sections
 */
export function adaptSimpleGallery(
  items: Project[], 
  title?: string
) {
  return {
    title,
    items: normalizeProjectsArray(items),
    variant: 'gallery' as const,
    layout: 'grid' as const,
    size: 'medium' as const,
    showSearch: false,
    showFilters: false
  };
}

/**
 * Adapter optimized for video content
 */
export function adaptVideoSection(
  items: Project[], 
  title?: string,
  showSearch = false
) {
  return {
    title,
    items: normalizeProjectsArray(items),
    variant: 'video' as const,
    layout: 'grid' as const,
    size: 'medium' as const,
    showSearch,
    showTitles: true
  };
}

/**
 * Adapter for interactive demos
 */
export function adaptInteractiveSection(
  items: Project[], 
  title?: string,
  maxItems = 6
) {
  return {
    title,
    items: normalizeProjectsArray(items),
    variant: 'interactive' as const,
    layout: 'grid' as const,
    size: 'medium' as const,
    maxItems,
    showTitles: true
  };
}