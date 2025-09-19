// ===================================================================
// adapters.ts - Production Ready Adapters
// ===================================================================

import {
  DEFAULTS,
  type PortfolioOverviewTextInput,
  type PortfolioOverviewTextProps,
  type TextVariant,
  type TextSize,
  type TextAlign,
  isTextVariant,
  isTextSize,
  isTextAlign,
  isCTAVariant,
} from './PortfolioOverviewText.types';

// ----------------------------
// Adapter Options
// ----------------------------

export interface AdapterOptions {
  /** Fill missing defaults */
  fillDefaults?: boolean;
  /** Validate input strictly (throw on invalid) */
  strict?: boolean;
  /** Maximum paragraphs to include */
  maxParagraphs?: number;
  /** Default CTA variant if not specified */
  defaultCtaVariant?: 'primary' | 'secondary' | 'outline';
}

const DEFAULT_ADAPTER_OPTIONS: AdapterOptions = {
  fillDefaults: true,
  strict: false,
  maxParagraphs: 10,
  defaultCtaVariant: 'primary',
};

// ----------------------------
// Type Guards
// ----------------------------

function isPortfolioOverviewTextProps(raw: any): raw is PortfolioOverviewTextProps {
  return raw && 
         typeof raw === 'object' && 
         ('title' in raw || 'subtitle' in raw || 'paragraphs' in raw);
}

function isPortfolioOverviewTextInput(raw: any): raw is PortfolioOverviewTextInput {
  return raw && 
         typeof raw === 'object' && 
         ('headline' in raw || 'title' in raw || 'description' in raw || 'paragraphs' in raw);
}

// ----------------------------
// Content Processing
// ----------------------------

/**
 * Process and normalize paragraphs from various input formats
 */
function processParagraphs(input: PortfolioOverviewTextInput, maxParagraphs: number): string[] {
  const paragraphs: string[] = [];
  
  // Add description as first paragraph
  if (input.description && typeof input.description === 'string') {
    paragraphs.push(input.description.trim());
  }
  
  // Add explicit paragraphs
  if (Array.isArray(input.paragraphs)) {
    const validParagraphs = input.paragraphs
      .filter(p => typeof p === 'string' && p.trim())
      .map(p => p.trim());
    paragraphs.push(...validParagraphs);
  }
  
  // Add highlights as additional paragraphs
  if (Array.isArray(input.highlights)) {
    const validHighlights = input.highlights
      .filter(h => typeof h === 'string' && h.trim())
      .map(h => h.trim());
    paragraphs.push(...validHighlights);
  }
  
  // Limit paragraphs and ensure uniqueness
  const uniqueParagraphs = [...new Set(paragraphs)];
  return uniqueParagraphs.slice(0, maxParagraphs);
}

/**
 * Determine title from various input sources
 */
function resolveTitle(input: PortfolioOverviewTextInput): string | undefined {
  return input.headline || input.title;
}

/**
 * Process CTA information
 */
function processCTA(input: PortfolioOverviewTextInput, defaultVariant: 'primary' | 'secondary' | 'outline') {
  if (!input.cta) {
    return {
      showCTA: false,
      ctaText: undefined,
      ctaHref: undefined,
      ctaTarget: undefined,
      ctaRel: undefined,
      ctaAriaLabel: undefined,
      ctaVariant: undefined,
    };
  }
  
  const { cta } = input;
  
  return {
    showCTA: Boolean(cta.label && cta.href),
    ctaText: cta.label,
    ctaHref: cta.href,
    ctaTarget: cta.target || DEFAULTS.ctaTarget,
    ctaRel: cta.rel,
    ctaAriaLabel: cta.ariaLabel,
    ctaVariant: isCTAVariant(cta.variant) ? cta.variant : defaultVariant,
  };
}

// ----------------------------
// Main Adapter
// ----------------------------

/**
 * Convert various input formats to PortfolioOverviewTextProps
 */
export function adaptPortfolioOverviewText(
  raw: unknown,
  options: AdapterOptions = {}
): PortfolioOverviewTextProps {
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
    if (isPortfolioOverviewTextProps(raw)) {
      return normalizeProps(raw as PortfolioOverviewTextProps, opts);
    }
    
    // Handle authoring input (convert to props)
    if (isPortfolioOverviewTextInput(raw)) {
      return convertInputToProps(raw as PortfolioOverviewTextInput, opts);
    }
    
    // Unknown format
    if (opts.strict) {
      throw new Error('Invalid input: unrecognized format');
    }
    return createFallbackProps(opts);
    
  } catch (error) {
    if (opts.strict) throw error;
    
    console.warn('Portfolio overview text adapter error:', error);
    return createFallbackProps(opts);
  }
}

/**
 * Normalize pre-adapted props
 */
function normalizeProps(
  props: PortfolioOverviewTextProps, 
  opts: AdapterOptions
): PortfolioOverviewTextProps {
  const paragraphs = Array.isArray(props.paragraphs) 
    ? props.paragraphs.slice(0, opts.maxParagraphs)
    : props.paragraphs;
    
  return {
    ...props,
    variant: isTextVariant(props.variant) ? props.variant : DEFAULTS.variant,
    size: isTextSize(props.size) ? props.size : DEFAULTS.size,
    align: isTextAlign(props.align) ? props.align : DEFAULTS.align,
    headingLevel: typeof props.headingLevel === 'number' && 
                 props.headingLevel >= 1 && 
                 props.headingLevel <= 6 
                   ? props.headingLevel 
                   : DEFAULTS.headingLevel,
    paragraphs,
    ctaTarget: props.ctaTarget === '_blank' ? '_blank' : '_self',
    ctaVariant: isCTAVariant(props.ctaVariant) ? props.ctaVariant : DEFAULTS.ctaVariant,
  };
}

/**
 * Convert authoring input to component props
 */
function convertInputToProps(
  input: PortfolioOverviewTextInput, 
  opts: AdapterOptions
): PortfolioOverviewTextProps {
  const title = resolveTitle(input);
  const paragraphs = processParagraphs(input, opts.maxParagraphs!);
  const ctaProps = processCTA(input, opts.defaultCtaVariant!);
  
  return {
    title,
    subtitle: input.subtitle,
    paragraphs: paragraphs.length > 0 ? paragraphs : undefined,
    variant: isTextVariant(input.variant) ? input.variant : DEFAULTS.variant,
    size: isTextSize(input.size) ? input.size : DEFAULTS.size,
    align: isTextAlign(input.align) ? input.align : DEFAULTS.align,
    maxWidth: input.maxWidth,
    className: input.className || '',
    showReadMore: input.showReadMore ?? DEFAULTS.showReadMore,
    readMoreText: input.readMoreText || DEFAULTS.readMoreText,
    readLessText: input.readLessText || DEFAULTS.readLessText,
    truncateAt: typeof input.truncateAt === 'number' ? input.truncateAt : DEFAULTS.truncateAt,
    ...ctaProps,
  };
}

/**
 * Create fallback props for error cases
 */
function createFallbackProps(opts: AdapterOptions): PortfolioOverviewTextProps {
  return {
    title: opts.fillDefaults ? "Content Available Soon" : undefined,
    paragraphs: opts.fillDefaults ? ["This content is being prepared."] : undefined,
    variant: DEFAULTS.variant,
    size: DEFAULTS.size,
    align: DEFAULTS.align,
    headingLevel: DEFAULTS.headingLevel,
    showCTA: false,
  };
}

// ----------------------------
// Convenience Functions
// ----------------------------

/**
 * Quick adapter for simple text content
 */
export function adaptSimpleText(
  title?: string, 
  description?: string, 
  cta?: { label: string; href: string }
): PortfolioOverviewTextProps {
  return adaptPortfolioOverviewText({
    title,
    description,
    cta,
  });
}

/**
 * Adapter optimized for marketing content
 */
export function adaptMarketingText(
  headline: string,
  paragraphs: string[],
  cta?: { label: string; href: string }
): PortfolioOverviewTextProps {
  return adaptPortfolioOverviewText({
    headline,
    paragraphs,
    cta,
    variant: 'marketing',
    size: 'large',
    align: 'center',
  });
}

/**
 * Legacy alias for backward compatibility
 */
export const overviewTextFromInput = adaptPortfolioOverviewText;
export const mapToPortfolioOverviewText = adaptPortfolioOverviewText;