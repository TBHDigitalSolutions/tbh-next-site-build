// ===================================================================
// /src/components/portfolio/PortfolioOverviewSection/adapters.ts
// ===================================================================
// Maps author-friendly input → presentational props for
// PortfolioOverviewSection (which composes OverviewText + Stats).
//
// Supports *both* shapes:
// 1) Authoring Input (preferred upstream): { text, statistics, ... }
// 2) Pre-adapted Props (pass-through):     { textProps, statsProps, ... }
//
// No cycles: we import the PROPS type from *.types.ts (not from the .tsx).
// ===================================================================

import {
  DEFAULTS,
  type OverviewTextContent,
  type OverviewStatistics,
  type PortfolioOverviewSectionInput,
  type PortfolioOverviewSectionProps,
} from "./PortfolioOverviewSection.types";

// If you added a Zod validator, import it here (optional, tolerant).
// Keep this import optional so the adapter can be used without Zod at runtime.
let validate: ((raw: unknown) => any) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const validator = require("./utils/portfolioOverviewValidator");
  // Accept either .parse or a helper you exported
  validate =
    (validator?.portfolioOverviewSectionInputSchema?.parse as any) ||
    (validator?.portfolioOverviewValidator?.parse as any) ||
    (validator?.parsePortfolioOverviewInput as any) ||
    null;
} catch {
  // validator is optional; continue without it
}

// ----------------------------
// Options
// ----------------------------

export interface NormalizeOptions {
  /** Apply section defaults for background/layout/reverse/title when missing */
  fillDefaults?: boolean;
  /** Ensure we always provide a text block (safe fallback) */
  requireText?: boolean;
  /** Ensure we always provide a stats block (safe fallback) */
  requireStats?: boolean;
  /** Strictly throw on invalid input if a validator is present */
  strictValidate?: boolean;
}

const DEFAULT_OPTS: NormalizeOptions = {
  fillDefaults: true,
  requireText: true,
  requireStats: true,
  strictValidate: false,
};

// ----------------------------
// Type guards (shape detection)
// ----------------------------

function hasPresentationalKeys(raw: any): raw is PortfolioOverviewSectionProps {
  return raw && (typeof raw === "object") && ("textProps" in raw || "statsProps" in raw);
}

function hasAuthoringKeys(raw: any): raw is PortfolioOverviewSectionInput {
  return raw && (typeof raw === "object") && ("text" in raw || "statistics" in raw);
}

// ----------------------------
// Mappers: Authoring → Child Props
// ----------------------------

/**
 * OverviewTextContent → PortfolioOverviewTextProps (partial)
 * - title     ← headline
 * - paragraphs← [description, ...highlights]
 * - CTA fields split & flagged
 */
function toTextProps(text?: OverviewTextContent) {
  if (!text) return undefined;

  const paragraphs: string[] = [];
  if (text.description) paragraphs.push(text.description);
  if (Array.isArray(text.highlights) && text.highlights.length) {
    paragraphs.push(...text.highlights);
  }

  return {
    title: text.headline,
    paragraphs,
    // keep variant/className unset unless you want to force one here
    showCTA: !!text.cta,
    ctaText: text.cta?.label,
    ctaHref: text.cta?.href,
  } as const;
}

/**
 * OverviewStatistics → PortfolioStatsSectionProps (partial)
 * - Map simple stats into ResultsStatsStrip-compatible `customStats`
 *   (id, label, value). Extra fields (icon/suffix/etc.) can be added upstream.
 */
function toStatsProps(statistics?: OverviewStatistics) {
  if (!statistics) return undefined;

  const customStats = (statistics.stats || []).map((s, idx) => {
    // generate a stable id from label
    const id =
      (s.label || `stat-${idx}`)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `stat-${idx}`;

    return {
      id,
      label: s.label,
      value: typeof s.value === "number" ? s.value : String(s.value),
      // Minimal shape; ResultsStatsStrip accepts richer props if desired.
    };
  });

  // Choose a sensible default layout; callers can override later.
  return {
    customStats,
    layout: "horizontal",
  } as const;
}

// ----------------------------
// Defaults for missing content
// ----------------------------

const FALLBACK_TEXT = {
  title: "Results you can see.",
  paragraphs: [
    "We ship work that moves the needle—clean builds, strong creative, and measurable performance across channels.",
  ],
} as const;

const FALLBACK_STATS = {
  customStats: [],
  layout: "horizontal" as const,
};

// ----------------------------
// Core adapter
// ----------------------------

/**
 * Convert raw authoring/pre-adapted data → PortfolioOverviewSectionProps.
 * - Validates (if validator present), otherwise tolerantly maps.
 * - Fills defaults based on options.
 */
export function overviewFromInput(
  raw: unknown,
  opts: NormalizeOptions = DEFAULT_OPTS
): PortfolioOverviewSectionProps {
  const options = { ...DEFAULT_OPTS, ...opts };

  // Optional validation step (tolerant by default)
  let parsed: any = raw;
  if (validate) {
    try {
      parsed = options.strictValidate ? validate(raw) : (validate as any)(raw);
    } catch {
      // If strict, bubble up; otherwise keep working with `raw`.
      if (options.strictValidate) throw;
      parsed = raw;
    }
  }

  // 1) If caller already passed presentational props, pass through (with defaults)
  if (hasPresentationalKeys(parsed)) {
    const p = parsed as PortfolioOverviewSectionProps;

    return {
      sectionTitle: p.sectionTitle ?? (options.fillDefaults ? DEFAULTS.sectionTitle : undefined),
      sectionId: p.sectionId,
      background: p.background ?? (options.fillDefaults ? DEFAULTS.background : undefined),
      textProps:
        p.textProps ??
        (options.requireText ? { ...FALLBACK_TEXT } : undefined),
      statsProps:
        p.statsProps ??
        (options.requireStats ? { ...FALLBACK_STATS } : undefined),
      layout: p.layout ?? (options.fillDefaults ? DEFAULTS.layout : undefined),
      reverse:
        typeof p.reverse === "boolean" ? p.reverse :
        (options.fillDefaults ? DEFAULTS.reverse : undefined),
      className: p.className ?? "",
    };
  }

  // 2) Otherwise, treat it as authoring input and map to child props
  const a = (hasAuthoringKeys(parsed) ? parsed : {}) as PortfolioOverviewSectionInput;

  const textProps = toTextProps(a.text) ?? (options.requireText ? { ...FALLBACK_TEXT } : undefined);
  const statsProps = toStatsProps(a.statistics) ?? (options.requireStats ? { ...FALLBACK_STATS } : undefined);

  return {
    sectionTitle: a.sectionTitle ?? (options.fillDefaults ? DEFAULTS.sectionTitle : undefined),
    sectionId: a.sectionId,
    background: a.background ?? (options.fillDefaults ? DEFAULTS.background : undefined),
    textProps,
    statsProps,
    layout: a.layout ?? (options.fillDefaults ? DEFAULTS.layout : undefined),
    reverse:
      typeof a.reverse === "boolean" ? a.reverse :
      (options.fillDefaults ? DEFAULTS.reverse : undefined),
    className: a.className ?? "",
  };
}

// Friendly alias (kept for compatibility with earlier references)
export const adaptPortfolioOverview = overviewFromInput;

/**
 * Minimal pass-through for code that expects a "mapTo…" API.
 * Uses tolerant defaults and authoring → props mapping by default.
 */
export function mapToPortfolioOverviewSection(raw: unknown): PortfolioOverviewSectionProps {
  return overviewFromInput(raw, DEFAULT_OPTS);
}
