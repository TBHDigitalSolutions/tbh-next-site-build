// ===================================================================
// adapters.ts - Production Ready
// ===================================================================

import {
  DEFAULTS,
  type OverviewTextContent,
  type OverviewStatistics,
  type PortfolioOverviewSectionInput,
  type PortfolioOverviewSectionProps,
  type PortfolioOverviewTextProps,
  type PortfolioStatsSectionProps,
} from "./PortfolioOverviewSection.types";

// ----------------------------
// Type guards
// ----------------------------

function isPortfolioOverviewSectionProps(raw: any): raw is PortfolioOverviewSectionProps {
  return raw && 
         typeof raw === "object" && 
         ("textProps" in raw || "statsProps" in raw);
}

function isPortfolioOverviewSectionInput(raw: any): raw is PortfolioOverviewSectionInput {
  return raw && 
         typeof raw === "object" && 
         ("text" in raw || "statistics" in raw);
}

// ----------------------------
// Content mappers
// ----------------------------

/**
 * Convert authoring text content to component props
 */
function mapTextContent(text?: OverviewTextContent): PortfolioOverviewTextProps | undefined {
  if (!text) return undefined;

  const paragraphs: string[] = [];
  if (text.description) paragraphs.push(text.description);
  if (Array.isArray(text.highlights)) {
    paragraphs.push(...text.highlights.filter(h => typeof h === 'string' && h.trim()));
  }

  return {
    title: text.headline || undefined,
    paragraphs: paragraphs.length > 0 ? paragraphs : undefined,
    showCTA: Boolean(text.cta),
    ctaText: text.cta?.label,
    ctaHref: text.cta?.href,
    ctaTarget: text.cta?.target,
    ctaRel: text.cta?.rel,
    ctaAriaLabel: text.cta?.ariaLabel,
  };
}

/**
 * Convert authoring statistics to component props
 */
function mapStatistics(statistics?: OverviewStatistics): PortfolioStatsSectionProps | undefined {
  if (!statistics) return undefined;

  const customStats = (statistics.stats || [])
    .filter(stat => stat && typeof stat === 'object' && stat.label && stat.value != null)
    .map((stat, idx) => {
      const id = typeof stat.label === 'string' 
        ? stat.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `stat-${idx}`
        : `stat-${idx}`;

      return {
        id,
        label: String(stat.label),
        value: stat.value,
        ...(stat.helpText && { helpText: String(stat.helpText) })
      };
    });

  return {
    customStats: customStats.length > 0 ? customStats : undefined,
    layout: "horizontal" as const,
    variant: statistics.variant === "detailed" ? "performance" : "portfolio",
  };
}

// ----------------------------
// Fallback content
// ----------------------------

const FALLBACK_TEXT_PROPS: PortfolioOverviewTextProps = {
  title: "Results you can see",
  paragraphs: [
    "We deliver measurable outcomes across web development, video production, SEO, and marketing automation."
  ],
};

const FALLBACK_STATS_PROPS: PortfolioStatsSectionProps = {
  customStats: [],
  layout: "horizontal",
  variant: "portfolio",
};

// ----------------------------
// Adapter options
// ----------------------------

export interface AdapterOptions {
  /** Fill missing section-level defaults */
  fillDefaults?: boolean;
  /** Ensure text component is always rendered */
  requireText?: boolean;
  /** Ensure stats component is always rendered */
  requireStats?: boolean;
  /** Validate input strictly (throw on invalid) */
  strict?: boolean;
}

const DEFAULT_ADAPTER_OPTIONS: AdapterOptions = {
  fillDefaults: true,
  requireText: false,
  requireStats: false,
  strict: false,
};

// ----------------------------
// Main adapter
// ----------------------------

/**
 * Convert various input formats to PortfolioOverviewSectionProps
 */
export function adaptPortfolioOverview(
  raw: unknown,
  options: AdapterOptions = {}
): PortfolioOverviewSectionProps {
  const opts = { ...DEFAULT_ADAPTER_OPTIONS, ...options };

  // Input validation
  if (!raw || typeof raw !== 'object') {
    if (opts.strict) {
      throw new Error('Invalid input: expected object');
    }
    return createFallbackProps(opts);
  }

  try {
    // Handle pre-adapted props (pass-through with defaults)
    if (isPortfolioOverviewSectionProps(raw)) {
      return normalizeProps(raw, opts);
    }

    // Handle authoring input (convert to props)
    if (isPortfolioOverviewSectionInput(raw)) {
      return convertInputToProps(raw, opts);
    }

    // Unknown format
    if (opts.strict) {
      throw new Error('Invalid input: unrecognized format');
    }
    return createFallbackProps(opts);

  } catch (error) {
    if (opts.strict) throw error;
    
    console.warn('Portfolio overview adapter error:', error);
    return createFallbackProps(opts);
  }
}

/**
 * Normalize pre-adapted props
 */
function normalizeProps(
  props: PortfolioOverviewSectionProps, 
  opts: AdapterOptions
): PortfolioOverviewSectionProps {
  return {
    sectionTitle: props.sectionTitle ?? (opts.fillDefaults ? DEFAULTS.sectionTitle : undefined),
    sectionId: props.sectionId,
    background: props.background ?? (opts.fillDefaults ? DEFAULTS.background : undefined),
    layout: props.layout ?? (opts.fillDefaults ? DEFAULTS.layout : undefined),
    reverse: props.reverse ?? (opts.fillDefaults ? DEFAULTS.reverse : undefined),
    className: props.className || "",
    textProps: props.textProps ?? (opts.requireText ? FALLBACK_TEXT_PROPS : undefined),
    statsProps: props.statsProps ?? (opts.requireStats ? FALLBACK_STATS_PROPS : undefined),
    onError: props.onError,
  };
}

/**
 * Convert authoring input to component props
 */
function convertInputToProps(
  input: PortfolioOverviewSectionInput, 
  opts: AdapterOptions
): PortfolioOverviewSectionProps {
  const textProps = mapTextContent(input.text) ?? (opts.requireText ? FALLBACK_TEXT_PROPS : undefined);
  const statsProps = mapStatistics(input.statistics) ?? (opts.requireStats ? FALLBACK_STATS_PROPS : undefined);

  return {
    sectionTitle: input.sectionTitle ?? (opts.fillDefaults ? DEFAULTS.sectionTitle : undefined),
    sectionId: input.sectionId,
    background: input.background ?? (opts.fillDefaults ? DEFAULTS.background : undefined),
    layout: input.layout ?? (opts.fillDefaults ? DEFAULTS.layout : undefined),
    reverse: input.reverse ?? (opts.fillDefaults ? DEFAULTS.reverse : undefined),
    className: input.className || "",
    textProps,
    statsProps,
  };
}

/**
 * Create fallback props for error cases
 */
function createFallbackProps(opts: AdapterOptions): PortfolioOverviewSectionProps {
  return {
    sectionTitle: opts.fillDefaults ? DEFAULTS.sectionTitle : undefined,
    background: opts.fillDefaults ? DEFAULTS.background : undefined,
    layout: opts.fillDefaults ? DEFAULTS.layout : undefined,
    reverse: opts.fillDefaults ? DEFAULTS.reverse : undefined,
    className: "",
    textProps: opts.requireText ? FALLBACK_TEXT_PROPS : undefined,
    statsProps: opts.requireStats ? FALLBACK_STATS_PROPS : undefined,
  };
}

// Legacy aliases for backward compatibility
export const overviewFromInput = adaptPortfolioOverview;
export const mapToPortfolioOverviewSection = (raw: unknown) => 
  adaptPortfolioOverview(raw, { fillDefaults: true });