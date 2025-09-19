// src/components/ui/organisms/PricingTiers/PricingTiers.types.ts

/**
 * PricingTiers — Production Type Contracts
 * ----------------------------------------
 * Canonical types used by:
 *  - Presentational component: PricingTiers.tsx
 *  - Service mappers (adapters)
 *  - Section orchestrator (via PricingSection)
 *
 * Principles:
 *  - DOMAIN: canonical, UI-agnostic shapes (Tier*, Price)
 *  - COMPONENT: honest props supported by the UI today
 *  - MIGRATION: minimal legacy aliases to ease refactors
 */

/* ============================================================================
 * Domain (canonical) types
 * ========================================================================== */

export interface TierPrice {
  /** Numeric amount; 0 (or undefined) implies "Custom" in the UI. */
  amount?: number;
  /** Human period token shown verbatim, e.g., "/mo", "/yr", "/project". */
  interval?: string;
  /** ISO currency code used for formatting (e.g., "USD"). */
  currency?: string;
  /** Optional strike-through anchor for discount calculations. */
  originalAmount?: number;
}

export interface TierFeature {
  id: string;
  /** Short human label. */
  label: string;
  /** true → ✓, false → ✗, undefined → neutral bullet. */
  included?: boolean;
  /** Optional small note (e.g., "up to 3 seats"). */
  note?: string;
}

export type TierCtaVariant = "primary" | "secondary" | "outline";

export interface TierCta {
  label: string;
  href: string;
  target?: "_self" | "_blank";
  rel?: string;
  variant?: TierCtaVariant;
}

export interface TierCard {
  id: string;
  name: string;
  badge?: string;          // e.g., "Most Popular"
  description?: string;
  price: TierPrice;        // Adapters must always supply a price object
  features?: TierFeature[];
  cta?: TierCta;
  /** Visual emphasis only. */
  highlighted?: boolean;
}

/* ============================================================================
 * Component contract (what the UI actually supports)
 * ========================================================================== */

export type PricingLayout = "grid" | "list";
export type BillingPeriod = "monthly" | "yearly";

export interface PricingTiersProps {
  /** Display-ready tier cards. */
  tiers: TierCard[];
  /** Grid or list layout. Defaults to "grid". */
  layout?: PricingLayout;
  /** Presentational monthly/yearly toggle. */
  showBillingToggle?: boolean;
  /** Optional class hook for the wrapping section. */
  className?: string;
  /** Optional callback when the billing toggle changes. */
  onBillingChange?: (period: BillingPeriod) => void;
}

/* ============================================================================
 * Section authoring (optional convenience contract)
 * ========================================================================== */

export interface PricingTiersDisplayOptions {
  layout?: PricingLayout;
  showBillingToggle?: boolean;
}

export interface PricingTiersSection {
  title?: string;
  subtitle?: string;
  data: { tiers: TierCard[] };
  display?: PricingTiersDisplayOptions;
}

/* ============================================================================
 * Legacy / migration helpers (minimal)
 *  - Keep only what's useful for adapters normalizing older shapes.
 * ========================================================================== */

export type LegacyPricingFeature =
  | string
  | {
      text?: string;
      available?: boolean;
      tooltip?: string;
      highlight?: string;
      label?: string;
      included?: boolean;
      note?: string;
      description?: string;
      name?: string;
      hint?: string;
    };

export interface LegacyTierData {
  id: string | number;
  name: string;
  description?: string;
  badge?: string;

  // Prices across older services
  monthlyPrice?: number | string | null;
  yearlyPrice?: number | string | null;
  originalMonthlyPrice?: number | string | null;
  originalYearlyPrice?: number | string | null;
  price?: string | number;      // e.g., "Custom", "$8,500"
  originalPrice?: number;       // optional anchor for strike-through
  period?: string;              // "project" | "month" | ...

  // Features
  features?: LegacyPricingFeature[];

  // CTA variants
  ctaText?: string;
  ctaLink?: string;
  ctaType?: "primary" | "secondary" | "outline";
  cta?: { label?: string; href?: string; variant?: TierCtaVariant; target?: "_self" | "_blank"; rel?: string };

  // Flags
  featured?: boolean;
  popular?: boolean;
  highlighted?: boolean;

  // Service-specific hints (ignored by presenter; used during mapping)
  idealFor?: string;
  turnaround?: string;
  revisions?: string;
  usage?: string;
  addOns?: string[];
}

/* ============================================================================
 * Service keys (for adapter facades)
 * ========================================================================== */

export type ServiceTypeKey =
  | "content-production"
  | "video-production"
  | "lead-generation"
  | "marketing-automation"
  | "seo-services"
  | "web-development";

/* ============================================================================
 * Minimal validation helpers (runtime type guards)
 * ========================================================================== */

export const isTierCard = (x: unknown): x is TierCard => {
  if (!x || typeof x !== "object") return false;
  const obj = x as any;
  return typeof obj.id === "string"
    && typeof obj.name === "string"
    && obj.price
    && typeof obj.price === "object";
};

export const isPricingTiersProps = (x: unknown): x is PricingTiersProps => {
  if (!x || typeof x !== "object") return false;
  const obj = x as any;
  return Array.isArray(obj.tiers) && obj.tiers.every(isTierCard);
};

/* ============================================================================
 * Small shared utility types
 * ========================================================================== */

export type NonEmptyArray<T> = [T, ...T[]];
export type Primitive = string | number | boolean | null | undefined;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
