/**
 * Production-Ready Pricing Adapter System
 * =======================================
 * Enforces level-based pricing rules:
 * - Level 1 (Hub):        ❌ No pricing
 * - Level 2 (Service):    ✅ Full pricing via adapters (tiers/range/custom)
 * - Level 3 (SubService): ❌ No PricingSection — use PricingCallout only
 */

import {
  mapMarketingAutoPricingToTiersProps,
  mapSeoServicesPricingToTiersProps,
  mapWebDevPricingToTiersProps,
  mapVideoProdPricingToTiersProps,
  mapContentProdPricingToTiersProps,
  mapLeadGenPricingToTiersProps,
  type MapToTiersProps,
} from "@/components/ui/organisms/PricingSection/adapters";

/* ================================================================
 * Types & tiny shared constants
 * ================================================================ */

export interface PricingContext {
  /** Service level: 1=Hub, 2=Service, 3=SubService */
  level: 1 | 2 | 3;
  /** Hub slug (canonical *-services format) */
  hub?: string;
  /** Service slug within the hub */
  service?: string;
  /** SubService slug (Level 3 only) */
  subService?: string;
}

export interface PricingSectionProps {
  title: string;
  subtitle: string;
  data: unknown;
  mapToTiersProps: MapToTiersProps;
  notes: {
    disclaimer: string;
    contact: string;
    contactHref: string;
  };
}

/** Avoid "magic numbers" in callers */
export const LEVEL = { HUB: 1, SERVICE: 2, SUBSERVICE: 3 } as const;
export type Level = (typeof LEVEL)[keyof typeof LEVEL];

/* ================================================================
 * Configuration & registry - Updated for canonical hub structure
 * ================================================================ */

const HUB_ADAPTER_MAP = {
  "marketing-services": mapMarketingAutoPricingToTiersProps,
  "seo-services": mapSeoServicesPricingToTiersProps,
  "web-development-services": mapWebDevPricingToTiersProps,
  "video-production-services": mapVideoProdPricingToTiersProps,
  "content-production-services": mapContentProdPricingToTiersProps,
  "lead-generation-services": mapLeadGenPricingToTiersProps,
} as const;

export type SupportedHub = keyof typeof HUB_ADAPTER_MAP;

/** Human-friendly hub display names (canonical slugs) */
const HUB_DISPLAY_NAMES = {
  "marketing-services": "Marketing Services",
  "seo-services": "SEO Services",
  "web-development-services": "Web Development Services",
  "video-production-services": "Video Production Services",
  "content-production-services": "Content Production Services",
  "lead-generation-services": "Lead Generation Services",
} as const satisfies Record<SupportedHub, string>;

/* ================================================================
 * Core: resolve adapter
 * ================================================================ */

/** Overloads + single implementation */
export function resolvePricingAdapter(
  context: PricingContext & { level: 2; hub: SupportedHub }
): MapToTiersProps;
export function resolvePricingAdapter(context: PricingContext): MapToTiersProps | null;
export function resolvePricingAdapter(context: PricingContext): MapToTiersProps | null {
  // Level 1 (Hub): no pricing
  if (context.level === LEVEL.HUB) {
    devLog(`[PricingRouter] Level 1 (Hub): No pricing for ${context.hub}`);
    return null;
  }

  // Level 3 (SubService): callout only (no PricingSection adapter)
  if (context.level === LEVEL.SUBSERVICE) {
    devLog(
      `[PricingRouter] Level 3 (SubService): Use PricingCallout for ${context.hub}/${context.service}/${context.subService}`
    );
    return null;
  }

  // Level 2 (Service): full pricing via adapters
  if (context.level === LEVEL.SERVICE && context.hub) {
    const adapter = HUB_ADAPTER_MAP[context.hub as SupportedHub];
    if (adapter) {
      devLog(
        `[PricingRouter] Level 2 (Service): Using ${context.hub} adapter for ${context.service}`
      );
      return adapter;
    }
    devWarn(`[PricingRouter] No adapter found for hub: ${context.hub}`);
    return null;
  }

  devWarn(`[PricingRouter] Invalid context:`, context);
  return null;
}

/* ================================================================
 * Builder for ServiceTemplate
 * ================================================================ */

export function buildServicePricingProps(
  context: PricingContext,
  rawData: unknown,
  overrides: Partial<{
    title: string;
    subtitle: string;
    disclaimer: string;
    contactNote: string;
    contactHref: string;
  }> = {}
): PricingSectionProps | null {
  const adapter = resolvePricingAdapter(context);

  if (!adapter || !rawData) {
    // Helpful dev warning if someone tried to attach pricing at L1/L3
    if (process.env.NODE_ENV === "development" && rawData && context.level !== LEVEL.SERVICE) {
      devWarn(
        "[PricingRouter] Pricing data was supplied, but level != 2. It will not be rendered.",
        { context, hasData: !!rawData }
      );
    }
    return null;
  }

  const hubName = hubDisplayName(context.hub);
  const defaults = {
    title: `${hubName} Pricing & Packages`,
    subtitle: "Investment levels designed for sustainable growth",
    disclaimer: "All packages include setup, implementation, and 30-day support period.",
    contactNote: "Questions about which package fits your needs?",
    contactHref: "/contact" as const,
  };

  return {
    title: overrides.title ?? defaults.title,
    subtitle: overrides.subtitle ?? defaults.subtitle,
    data: rawData,
    mapToTiersProps: adapter,
    notes: {
      disclaimer: overrides.disclaimer ?? defaults.disclaimer,
      contact: overrides.contactNote ?? defaults.contactNote,
      contactHref: overrides.contactHref ?? defaults.contactHref,
    },
  };
}

/* ================================================================
 * Utilities
 * ================================================================ */

function hubDisplayName(slug?: string): string {
  if (!slug) return "Service";
  return HUB_DISPLAY_NAMES[slug as SupportedHub] ?? slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function isSupportedHub(hub: string): hub is SupportedHub {
  return hub in HUB_ADAPTER_MAP;
}

export function getSupportedHubs(): SupportedHub[] {
  return Object.keys(HUB_ADAPTER_MAP) as SupportedHub[];
}

export function validatePricingContext(context: Partial<PricingContext>): context is PricingContext {
  if (!context.level || ![LEVEL.HUB, LEVEL.SERVICE, LEVEL.SUBSERVICE].includes(context.level)) {
    return false;
  }
  if (context.level === LEVEL.SERVICE && !context.hub) return false;
  if (context.level === LEVEL.SUBSERVICE && (!context.hub || !context.service)) return false;
  return true;
}

export function validatePricingContextWithHub(
  context: Partial<PricingContext>
): context is PricingContext & { hub: SupportedHub } {
  if (!validatePricingContext(context)) return false;
  if (context.level === LEVEL.SERVICE) {
    return Boolean(context.hub && isSupportedHub(context.hub));
  }
  return true;
}

/* ================================================================
 * Dev helpers
 * ================================================================ */

function devLog(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") console.log(...args);
}

function devWarn(...args: unknown[]): void {
  if (process.env.NODE_ENV === "development") console.warn(...args);
}

export function debugPricingDecision(context: PricingContext, hasData: boolean): void {
  if (process.env.NODE_ENV !== "development") return;

  const adapter = resolvePricingAdapter(context);
  const levelNames = { [LEVEL.HUB]: "Hub", [LEVEL.SERVICE]: "Service", [LEVEL.SUBSERVICE]: "SubService" } as const;

  console.group(`[PricingRouter] ${levelNames[context.level]} Decision`);
  console.log("Context:", context);
  console.log("Has pricing data:", hasData);
  console.log("Adapter selected:", adapter ? "✅" : "❌");
  console.log("Should render pricing:", !!(adapter && hasData));
  console.log("Hub supported:", context.hub ? isSupportedHub(context.hub) : "N/A");
  if (hasData && context.level !== LEVEL.SERVICE) {
    console.warn("⚠️  Pricing data provided but level !== 2 - will be ignored");
  }
  console.groupEnd();
}

/**
 * System validation (non-blocking at runtime; useful for boot checks)
 * - derives required hubs from the registry to avoid drift.
 */
export function validatePricingSystem(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredHubs = Object.keys(HUB_ADAPTER_MAP) as SupportedHub[];

  for (const hub of requiredHubs) {
    if (!HUB_ADAPTER_MAP[hub]) errors.push(`Missing adapter for hub: ${hub}`);
    if (!HUB_DISPLAY_NAMES[hub]) errors.push(`Missing display name for hub: ${hub}`);
  }

  // sanity: functions
  for (const [hub, adapter] of Object.entries(HUB_ADAPTER_MAP)) {
    if (typeof adapter !== "function") {
      errors.push(`Invalid adapter for hub ${hub}: not a function`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

export function getAdapterStats(): {
  supportedHubs: string[];
  totalAdapters: number;
  missingDisplayNames: string[];
} {
  const supportedHubs = getSupportedHubs();
  const missingDisplayNames = supportedHubs.filter((hub) => !HUB_DISPLAY_NAMES[hub]);
  return { supportedHubs, totalAdapters: supportedHubs.length, missingDisplayNames };
}

/**
 * Helper to check if pricing data should be processed for a given context
 */
export function shouldProcessPricing(context: PricingContext, hasData: boolean): boolean {
  if (!hasData) return false;
  if (context.level !== LEVEL.SERVICE) return false;
  if (!context.hub || !isSupportedHub(context.hub)) return false;
  return true;
}

/* ================================================================
 * Exports (types)
 * ================================================================ */
export type { PricingContext, SupportedHub, MapToTiersProps, PricingSectionProps };