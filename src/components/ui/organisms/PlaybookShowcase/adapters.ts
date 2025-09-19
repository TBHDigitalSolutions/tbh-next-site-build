// src/components/ui/organisms/PlaybookShowcase/adapters.ts
// src/components/ui/organisms/PlaybookShowcase/adapters.ts

import type { 
  PlaybookShowcaseProps, 
  PlaybookItem, 
  PlaybookInput,
  PlaybookSection,
  PlaybookDifficulty
} from "./PlaybookShowcase.types";

/**
 * PlaybookShowcase Data Adapters for Service Templates
 * Maps raw service page data to PlaybookShowcase component props
 */

// ============================================================================
// Input Normalization
// ============================================================================

/**
 * Normalizes various playbook input formats into PlaybookItem[]
 */
export const normalizePlaybookInput = (input: PlaybookInput): PlaybookItem[] => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean).map(normalizePlaybookItem).filter(Boolean) as PlaybookItem[];
  
  // Handle object formats
  if (typeof input === 'object') {
    let items: any[] = [];
    
    if ('playbooks' in input && Array.isArray(input.playbooks)) {
      items = input.playbooks;
    } else if ('resources' in input && Array.isArray(input.resources)) {
      items = input.resources;
    } else if ('guides' in input && Array.isArray(input.guides)) {
      items = input.guides;
    }
    
    return items.filter(Boolean).map(normalizePlaybookItem).filter(Boolean) as PlaybookItem[];
  }
  
  return [];
};

/**
 * Normalizes a single playbook item
 */
export const normalizePlaybookItem = (item: any): PlaybookItem | null => {
  if (!item || typeof item !== 'object') return null;
  
  const title = item.title || item.name || 'Untitled Resource';
  const id = item.id || item.slug || generatePlaybookId(title);
  
  return {
    id,
    title,
    description: item.description || item.excerpt || item.summary || 'Resource description',
    category: item.category || item.type || item.topic || 'General',
    difficulty: validateDifficulty(item.difficulty || item.level),
    tags: normalizeTagsArray(item.tags),
    steps: normalizeStepsArray(item.steps || item.sections),
    metrics: normalizeMetricsObject(item.metrics || item.stats || item.results),
    cover: item.cover || item.thumbnail || item.image,
    href: item.href || item.url || item.link || '#',
    downloadUrl: item.downloadUrl || item.download,
    readTime: item.readTime || item.duration || item.estimatedTime,
    featured: Boolean(item.featured || item.highlight || item.priority),
    fileType: determineFileType(item),
    fileSize: item.fileSize || item.size
  };
};

/**
 * Generates a safe ID from playbook title
 */
const generatePlaybookId = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '') || 'playbook';
};

/**
 * Validates and normalizes difficulty level
 */
const validateDifficulty = (difficulty: any): PlaybookDifficulty | undefined => {
  if (typeof difficulty !== 'string') return undefined;
  
  const normalized = difficulty.toLowerCase();
  if (normalized.includes('beginner') || normalized.includes('basic') || normalized.includes('intro')) {
    return 'Beginner';
  }
  if (normalized.includes('advanced') || normalized.includes('expert') || normalized.includes('pro')) {
    return 'Advanced';
  }
  if (normalized.includes('intermediate') || normalized.includes('medium')) {
    return 'Intermediate';
  }
  
  return undefined;
};

/**
 * Normalizes tags array
 */
const normalizeTagsArray = (tags: any): string[] => {
  if (!tags) return [];
  if (Array.isArray(tags)) return tags.filter(t => typeof t === 'string' && t.trim()).map(t => t.trim());
  if (typeof tags === 'string') return tags.split(',').map(t => t.trim()).filter(Boolean);
  return [];
};

/**
 * Normalizes steps array
 */
const normalizeStepsArray = (steps: any): PlaybookItem['steps'] => {
  if (!Array.isArray(steps)) return undefined;
  
  return steps.map((step, index) => {
    if (typeof step === 'string') {
      return {
        id: `step-${index + 1}`,
        title: step,
        description: undefined
      };
    }
    if (typeof step === 'object' && step) {
      return {
        id: step.id || `step-${index + 1}`,
        title: step.title || step.name || `Step ${index + 1}`,
        description: step.description || step.desc
      };
    }
    return null;
  }).filter(Boolean) as NonNullable<PlaybookItem['steps']>;
};

/**
 * Normalizes metrics object
 */
const normalizeMetricsObject = (metrics: any): Record<string, string> | undefined => {
  if (!metrics || typeof metrics !== 'object') return undefined;
  
  const normalized: Record<string, string> = {};
  Object.keys(metrics).forEach(key => {
    const value = metrics[key];
    if (value != null) {
      normalized[key] = String(value);
    }
  });
  
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

/**
 * Determines file type from item properties
 */
const determineFileType = (item: any): PlaybookItem['fileType'] => {
  const href = item.href || item.url || item.link || '';
  const downloadUrl = item.downloadUrl || item.download || '';
  const fileType = item.fileType || item.type;
  
  if (fileType && ['pdf', 'doc', 'guide', 'checklist'].includes(fileType)) {
    return fileType as PlaybookItem['fileType'];
  }
  
  if (href.includes('.pdf') || downloadUrl.includes('.pdf')) return 'pdf';
  if (href.includes('.doc') || downloadUrl.includes('.doc')) return 'doc';
  if (item.category?.toLowerCase().includes('checklist')) return 'checklist';
  
  return 'guide';
};

// ============================================================================
// Main Adapter Functions
// ============================================================================

/**
 * Primary adapter: transforms playbook data to component props
 */
export const toPlaybookShowcaseProps = (
  input: PlaybookInput,
  overrides: Partial<PlaybookShowcaseProps> = {}
): PlaybookShowcaseProps => {
  const normalizedPlaybooks = normalizePlaybookInput(input);
  
  return {
    title: "Resources & Guides",
    subtitle: "Download our comprehensive playbooks and implementation guides",
    playbooks: normalizedPlaybooks,
    categories: undefined, // Let component derive from playbooks
    difficulties: undefined, // Let component derive from playbooks
    defaultCategory: "All",
    defaultDifficulty: undefined,
    cardVariant: "detailed",
    columns: 3,
    maxItems: undefined,
    showFeatured: true,
    ...overrides
  };
};

// ============================================================================
// Service-Specific Adapters
// ============================================================================

/**
 * Creates PlaybookShowcase section for Web Development services
 */
export const createWebDevPlaybookSection = (
  input: PlaybookInput,
  overrides: Partial<PlaybookShowcaseProps> = {}
): PlaybookShowcaseProps => ({
  title: "Development Resources",
  subtitle: "Technical guides, best practices, and implementation playbooks for modern web development",
  playbooks: normalizePlaybookInput(input),
  cardVariant: "detailed",
  columns: 3,
  maxItems: 12,
  showFeatured: true,
  cta: {
    label: "View All Development Resources",
    href: "/resources/web-development"
  },
  ...overrides
});

/**
 * Creates PlaybookShowcase section for Video Production services
 */
export const createVideoPlaybookSection = (
  input: PlaybookInput,
  overrides: Partial<PlaybookShowcaseProps> = {}
): PlaybookShowcaseProps => ({
  title: "Production Guides",
  subtitle: "Step-by-step guides for video production and post-production workflows",
  playbooks: normalizePlaybookInput(input),
  cardVariant: "detailed",
  columns: 3,
  maxItems: 9,
  showFeatured: true,
  cta: {
    label: "Browse Video Resources",
    href: "/resources/video-production"
  },
  ...overrides
});

/**
 * Creates PlaybookShowcase section for Marketing services
 */
export const createMarketingPlaybookSection = (
  input: PlaybookInput,
  overrides: Partial<PlaybookShowcaseProps> = {}
): PlaybookShowcaseProps => ({
  title: "Marketing Playbooks",
  subtitle: "Proven strategies, templates, and campaign guides for growth marketing",
  playbooks: normalizePlaybookInput(input),
  cardVariant: "detailed",
  columns: 3,
  maxItems: 15, // Marketing has many resources
  showFeatured: true,
  cta: {
    label: "Explore Marketing Resources",
    href: "/resources/marketing"
  },
  ...overrides
});

/**
 * Creates PlaybookShowcase section for SEO services
 */
export const createSEOPlaybookSection = (
  input: PlaybookInput,
  overrides: Partial<PlaybookShowcaseProps> = {}
): PlaybookShowcaseProps => ({
  title: "SEO Resources",
  subtitle: "Technical guides, audit checklists, and optimization strategies for search visibility",
  playbooks: normalizePlaybookInput(input),
  cardVariant: "detailed",
  columns: 3,
  maxItems: 12,
  showFeatured: true,
  cta: {
    label: "View SEO Resources",
    href: "/resources/seo"
  },
  ...overrides
});

/**
 * Creates PlaybookShowcase section for Lead Generation services
 */
export const createLeadGenPlaybookSection = (
  input: PlaybookInput,
  overrides: Partial<PlaybookShowcaseProps> = {}
): PlaybookShowcaseProps => ({
  title: "Lead Generation Playbooks",
  subtitle: "Proven frameworks for building and optimizing lead generation funnels",
  playbooks: normalizePlaybookInput(input),
  cardVariant: "detailed",
  columns: 3,
  maxItems: 12,
  showFeatured: true,
  cta: {
    label: "Access Lead Gen Resources",
    href: "/resources/lead-generation"
  },
  ...overrides
});

/**
 * Creates PlaybookShowcase section for Content Production services
 */
export const createContentPlaybookSection = (
  input: PlaybookInput,
  overrides: Partial<PlaybookShowcaseProps> = {}
): PlaybookShowcaseProps => ({
  title: "Content Strategy Guides",
  subtitle: "Editorial calendars, content frameworks, and production workflows for content marketing",
  playbooks: normalizePlaybookInput(input),
  cardVariant: "detailed",
  columns: 3,
  maxItems: 12,
  showFeatured: true,
  cta: {
    label: "Browse Content Resources",
    href: "/resources/content-production"
  },
  ...overrides
});

// ============================================================================
// Section Factory
// ============================================================================

/**
 * Creates a complete PlaybookShowcase section for service pages
 */
export const createPlaybookShowcaseSection = (
  section: PlaybookSection,
  serviceType: 'web-dev' | 'video' | 'marketing' | 'seo' | 'lead-gen' | 'content' = 'web-dev'
): PlaybookShowcaseProps => {
  const baseProps = {
    title: section.title,
    subtitle: section.subtitle,
    cardVariant: section.cardVariant,
    columns: section.columns,
    showFeatured: section.showFeatured,
    maxItems: section.maxItems,
    defaultCategory: section.defaultCategory,
    defaultDifficulty: section.defaultDifficulty
  };

  const adapterMap = {
    'web-dev': createWebDevPlaybookSection,
    'video': createVideoPlaybookSection,
    'marketing': createMarketingPlaybookSection,
    'seo': createSEOPlaybookSection,
    'lead-gen': createLeadGenPlaybookSection,
    'content': createContentPlaybookSection
  };

  const adapter = adapterMap[serviceType];
  return adapter(section.data, baseProps);
};

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates PlaybookShowcase input data
 */
export const validatePlaybookShowcaseInput = (input: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  data?: PlaybookInput 
} => {
  const errors: string[] = [];
  
  if (!input) {
    return { isValid: false, errors: ['PlaybookShowcase input is required'] };
  }
  
  if (Array.isArray(input)) {
    if (input.length === 0) {
      errors.push('Playbooks array cannot be empty');
    }
    
    input.forEach((playbook, index) => {
      if (!playbook || typeof playbook !== 'object') {
        errors.push(`Playbook at index ${index} must be an object`);
      } else {
        const title = playbook.title || playbook.name;
        if (!title || typeof title !== 'string' || !title.trim()) {
          errors.push(`Playbook at index ${index} must have a valid title or name`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? input : undefined
    };
  }
  
  if (typeof input === 'object') {
    const playbookInput = input as any;
    const hasAnyPlaybooks = ['playbooks', 'resources', 'guides']
      .some(key => Array.isArray(playbookInput[key]) && playbookInput[key].length > 0);
    
    if (!hasAnyPlaybooks) {
      errors.push('PlaybookShowcase must have at least one playbook in playbooks, resources, or guides array');
    }
    
    // Validate each array that exists
    ['playbooks', 'resources', 'guides'].forEach(key => {
      const arr = playbookInput[key];
      if (Array.isArray(arr)) {
        arr.forEach((item, index) => {
          if (!item || typeof item !== 'object') {
            errors.push(`${key}[${index}] must be an object`);
          } else {
            const title = item.title || item.name;
            if (!title || typeof title !== 'string' || !title.trim()) {
              errors.push(`${key}[${index}] must have a valid title or name`);
            }
          }
        });
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      data: errors.length === 0 ? playbookInput : undefined
    };
  }
  
  return { isValid: false, errors: ['Invalid PlaybookShowcase input format'] };
};

// Export main adapter for template usage
export { toPlaybookShowcaseProps as toPlaybookShowcaseAdapter };