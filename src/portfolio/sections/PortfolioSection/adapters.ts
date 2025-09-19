// ===================================================================
// adapters.ts - Production Ready Adapters
// ===================================================================

import {
  DEFAULTS,
  type PortfolioSectionInput,
  type PortfolioSectionProps,
  type Project,
  type PortfolioVariant,
  type PortfolioLayout,
  type PortfolioSize,
  isPortfolioVariant,
  isPortfolioLayout,
  isPortfolioSize,
  isValidProject,
} from './PortfolioSection.types';

// ----------------------------
// Adapter Options
// ----------------------------

export interface AdapterOptions {
  /** Fill missing defaults */
  fillDefaults?: boolean;
  /** Validate input strictly (throw on invalid) */
  strict?: boolean;
  /** Maximum items to process */
  maxItems?: number;
  /** Default variant if not specified */
  defaultVariant?: PortfolioVariant;
  /** Default layout if not specified */
  defaultLayout?: PortfolioLayout;
  /** Filter out invalid items */
  filterInvalidItems?: boolean;
}

const DEFAULT_ADAPTER_OPTIONS: AdapterOptions = {
  fillDefaults: true,
  strict: false,
  maxItems: 100,
  defaultVariant: 'gallery',
  defaultLayout: 'grid',
  filterInvalidItems: true,
};

// ----------------------------
// Type Guards
// ----------------------------

function isPortfolioSectionProps(raw: any): raw is PortfolioSectionProps {
  return raw && 
         typeof raw === 'object' && 
         Array.isArray(raw.items);
}

function isPortfolioSectionInput(raw: any): raw is PortfolioSectionInput {
  return raw && 
         typeof raw === 'object' && 
         (Array.isArray(raw.items) || 'variant' in raw || 'title' in raw);
}

// ----------------------------
// Content Processing
// ----------------------------

/**
 * Process and validate project items
 */
function processItems(
  items: any[], 
  options: AdapterOptions
): Project[] {
  if (!Array.isArray(items)) return [];
  
  let processed = items;
  
  // Filter invalid items if enabled
  if (options.filterInvalidItems) {
    processed = items.filter(isValidProject);
  }
  
  // Limit items
  if (options.maxItems && processed.length > options.maxItems) {
    processed = processed.slice(0, options.maxItems);
    console.warn(`Portfolio section: Limiting to ${options.maxItems} items`);
  }
  
  return processed;
}

/**
 * Normalize configuration values
 */
function normalizeConfig(input: PortfolioSectionInput, options: AdapterOptions) {
  return {
    variant: isPortfolioVariant(input.variant) 
      ? input.variant 
      : options.defaultVariant || DEFAULTS.variant,
    layout: isPortfolioLayout(input.layout) 
      ? input.layout 
      : options.defaultLayout || DEFAULTS.layout,
    size: isPortfolioSize(input.size) 
      ? input.size 
      : DEFAULTS.size,
    maxItems: typeof input.maxItems === 'number' && input.maxItems > 0 
      ? input.maxItems 
      : DEFAULTS.maxItems,
  };
}

// ----------------------------
// Main Adapter
// ----------------------------

/**
 * Convert various input formats to PortfolioSectionProps
 */
export function adaptPortfolioSection(
  raw: unknown,
  options: AdapterOptions = {}
): PortfolioSectionProps {
  const opts = { ...DEFAULT_ADAPTER_OPTIONS, ...options };
  
  // Input validation
  if (!raw || typeof raw !== 'object') {
    if (opts.strict) {
      throw new Error('Invalid input: expected object');
    }
    return createFallbackProps(opts);
  }
  
  try {
    // Handle pre-adapted props (pass-through with validation)
    if (isPortfolioSectionProps(raw)) {
      return normalizeProps(raw as PortfolioSectionProps, opts);
    }
    
    // Handle authoring input (convert to props)
    if (isPortfolioSectionInput(raw)) {
      return convertInputToProps(raw as PortfolioSectionInput, opts);
    }
    
    // Handle raw project array
    if (Array.isArray(raw)) {
      return {
        items: processItems(raw, opts),
        variant: opts.defaultVariant || DEFAULTS.variant,
        layout: opts.defaultLayout || DEFAULTS.layout,
        size: DEFAULTS.size,
        maxItems: DEFAULTS.maxItems,
      };
    }
    
    // Unknown format
    if (opts.strict) {
      throw new Error('Invalid input: unrecognized format');
    }
    return createFallbackProps(opts);
    
  } catch (error) {
    if (opts.strict) throw error;
    
    console.warn('Portfolio section adapter error:', error);
    return createFallbackProps(opts);
  }
}

/**
 * Normalize pre-adapted props
 */
function normalizeProps(
  props: PortfolioSectionProps, 
  opts: AdapterOptions
): PortfolioSectionProps {
  const items = processItems(props.items || [], opts);
  
  return {
    ...props,
    items,
    variant: isPortfolioVariant(props.variant) ? props.variant : DEFAULTS.variant,
    layout: isPortfolioLayout(props.layout) ? props.layout : DEFAULTS.layout,
    size: isPortfolioSize(props.size) ? props.size : DEFAULTS.size,
    maxItems: typeof props.maxItems === 'number' && props.maxItems > 0 
      ? props.maxItems 
      : DEFAULTS.maxItems,
    showSearch: typeof props.showSearch === 'boolean' 
      ? props.showSearch 
      : DEFAULTS.showSearch,
    showFilters: typeof props.showFilters === 'boolean' 
      ? props.showFilters 
      : DEFAULTS.showFilters,
    showLoadMore: typeof props.showLoadMore === 'boolean' 
      ? props.showLoadMore 
      : DEFAULTS.showLoadMore,
    showTitles: typeof props.showTitles === 'boolean' 
      ? props.showTitles 
      : DEFAULTS.showTitles,
    showItemCount: typeof props.showItemCount === 'boolean' 
      ? props.showItemCount 
      : DEFAULTS.showItemCount,
    viewAllText: props.viewAllText || DEFAULTS.viewAllText,
    analyticsContext: props.analyticsContext || DEFAULTS.analyticsContext,
    loading: typeof props.loading === 'boolean' ? props.loading : DEFAULTS.loading,
  };
}

/**
 * Convert authoring input to component props
 */
function convertInputToProps(
  input: PortfolioSectionInput, 
  opts: AdapterOptions
): PortfolioSectionProps {
  const items = processItems(input.items || [], opts);
  const config = normalizeConfig(input, opts);
  
  return {
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    items,
    ...config,
    showSearch: input.showSearch ?? DEFAULTS.showSearch,
    showFilters: input.showFilters ?? DEFAULTS.showFilters,
    showLoadMore: input.showLoadMore ?? DEFAULTS.showLoadMore,
    showTitles: input.showTitles ?? DEFAULTS.showTitles,
    viewAllHref: input.viewAllHref,
    viewAllText: input.viewAllText || DEFAULTS.viewAllText,
    analyticsContext: input.analyticsContext || DEFAULTS.analyticsContext,
    className: input.className || '',
    background: input.background,
  };
}

/**
 * Create fallback props for error cases
 */
function createFallbackProps(opts: AdapterOptions): PortfolioSectionProps {
  return {
    title: opts.fillDefaults ? "Portfolio Section" : undefined,
    items: [],
    variant: opts.defaultVariant || DEFAULTS.variant,
    layout: opts.defaultLayout || DEFAULTS.layout,
    size: DEFAULTS.size,
    maxItems: DEFAULTS.maxItems,
    showSearch: DEFAULTS.showSearch,
    showFilters: DEFAULTS.showFilters,
    showLoadMore: DEFAULTS.showLoadMore,
    showTitles: DEFAULTS.showTitles,
    showItemCount: DEFAULTS.showItemCount,
    viewAllText: DEFAULTS.viewAllText,
    analyticsContext: DEFAULTS.analyticsContext,
    loading: DEFAULTS.loading,
  };
}

// ----------------------------
// Convenience Adapters
// ----------------------------

/**
 * Quick adapter for simple gallery
 */
export function adaptSimpleGallery(
  items: Project[], 
  title?: string
): PortfolioSectionProps {
  return adaptPortfolioSection({
    title,
    items,
    variant: 'gallery',
    layout: 'grid',
  });
}

/**
 * Adapter optimized for video content
 */
export function adaptVideoSection(
  items: Project[], 
  title?: string,
  showSearch = false
): PortfolioSectionProps {
  return adaptPortfolioSection({
    title,
    items,
    variant: 'video',
    layout: 'grid',
    showSearch,
    showTitles: true,
  });
}

/**
 * Adapter for interactive demos
 */
export function adaptInteractiveSection(
  items: Project[], 
  title?: string,
  maxItems = 6
): PortfolioSectionProps {
  return adaptPortfolioSection({
    title,
    items,
    variant: 'interactive',
    layout: 'grid',
    maxItems,
    showTitles: true,
  });
}

/**
 * Legacy alias for backward compatibility
 */
export const portfolioSectionFromInput = adaptPortfolioSection;
export const mapToPortfolioSection = adaptPortfolioSection;

/**
 * Main adapter function from your lib/adapters.ts
 */
export function toPortfolioSectionProps(input: any): PortfolioSectionProps | null {
  try {
    return adaptPortfolioSection(input);
  } catch (error) {
    console.warn('toPortfolioSectionProps failed:', error);
    return null;
  }
}