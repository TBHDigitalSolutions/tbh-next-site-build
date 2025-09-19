// src/components/ui/organisms/PricingSection/adapters.ts
// ----------------------------------------------------------------------------
// PricingSection → PricingTiers adapters (Production-Ready)
// - Map raw, service-specific pricing data into the presentational props that
//   <PricingTiers /> expects (strict, normalized, display-ready).
// - Keep *all* transformation logic here (not in components).
// ----------------------------------------------------------------------------

import type {
  PricingTiersProps,
  TierCard,
  TierFeature,
} from "@/components/ui/organisms/PricingTiers/PricingTiers";
import type {
  MapToTiersProps,
} from "@/components/ui/organisms/PricingSection/PricingSection.types";
// Optional: schema guard if you keep one
// import { pricingSectionValidator } from "./utils/pricingSectionValidator";

/* =============================================================================
 * Shared helpers
 * ========================================================================== */

/** Parse "$8,500", "USD 1,299", "1299", "Custom" → { amount, isCustom } */
export function parsePriceString(input: unknown): { amount: number; isCustom: boolean } {
  if (input == null) return { amount: 0, isCustom: true };
  const raw = String(input).trim();
  const digits = raw.replace(/[^0-9.]/g, "");
  if (!digits || Number.isNaN(Number(digits))) return { amount: 0, isCustom: true };
  return { amount: Math.round(Number(digits)), isCustom: false };
}

/** Normalize feature entries that may be strings or objects */
export function normalizeFeatures(features: unknown[]): TierFeature[] {
  if (!Array.isArray(features)) return [];
  return features.map((f, i) => {
    if (typeof f === "string") {
      return { id: `f-${i}`, label: f, included: true };
    }
    if (f && typeof f === "object") {
      const anyF: any = f;
      const included =
        typeof anyF.included === "boolean"
          ? anyF.included
          : typeof anyF.available === "boolean"
          ? anyF.available
          : true;
      return {
        id: String(anyF.id ?? `f-${i}`),
        label: String(anyF.label ?? anyF.text ?? anyF.name ?? ""),
        included,
        note: anyF.note ?? anyF.tooltip,
      };
    }
    return { id: `f-${i}`, label: String(f ?? ""), included: true };
  });
}

/** Normalize CTA shapes: { label|text|ctaText, href|link|url|ctaLink, variant|ctaType } */
export function normalizeCta(input: any): TierCard["cta"] {
  if (!input) return undefined;
  const label = input.label ?? input.text ?? input.ctaText;
  const href = input.href ?? input.link ?? input.url ?? input.ctaLink;
  if (!label || !href) return undefined;
  return {
    label: String(label),
    href: String(href),
    target: input.target,
    rel: input.rel,
    variant: input.variant ?? input.ctaType, // "primary"|"secondary"|"outline"
  };
}

/** Coerce "featured"/"popular"/"highlighted" → boolean */
export function toHighlightedFlag(input: any): boolean {
  return Boolean(input?.highlighted ?? input?.popular ?? input?.featured);
}

/** Choose a safe display interval string like "/mo", "/yr", "/project" (or undefined) */
function normalizeInterval(input?: string | null, fallback?: string): string | undefined {
  if (!input || typeof input !== "string") return fallback;
  if (input.startsWith("/")) return input;
  return `/${input}`;
}

/** Safe money object for TierCard.price (guarantees presence) */
function toMoneyObject(amountLike: unknown, currencyLike: unknown, intervalLike?: string | null) {
  const amount =
    typeof amountLike === "number" && Number.isFinite(amountLike)
      ? Math.round(amountLike)
      : 0;
  const currency = (currencyLike ? String(currencyLike) : "USD").toUpperCase();
  const interval = normalizeInterval(intervalLike ?? undefined);
  return { amount, currency, interval };
}

/** Small utility to safely read numeric fields */
function num(val: any): number | undefined {
  return typeof val === "number" && Number.isFinite(val) ? Math.round(val) : undefined;
}

/* =============================================================================
 * Generic tier normalizer
 * - Handles common shapes across services with minimal per-service config
 * ========================================================================== */

type GenericTierInput = any;

interface GenericTierConfig {
  /** Read the "name/title" */
  getName?: (t: GenericTierInput, i: number) => string;
  /** Read the "description/subtitle" */
  getDescription?: (t: GenericTierInput) => string | undefined;
  /** Read the primary price number (monthly/by-project/etc.) */
  getPrimaryAmount?: (t: GenericTierInput) => number | undefined;
  /** Optional original/struck-through price */
  getOriginalAmount?: (t: GenericTierInput) => number | undefined;
  /** Optional currency override */
  getCurrency?: (t: GenericTierInput) => string | undefined;
  /** Optional interval label (e.g., "/mo", "/project") */
  getInterval?: (t: GenericTierInput) => string | undefined;
  /** Whether this tier is highlighted */
  getHighlighted?: (t: GenericTierInput) => boolean;
  /** Optional badge text (e.g., "Most Popular" or "Custom") */
  getBadge?: (t: GenericTierInput, priceAmount: number) => string | undefined;
  /** Read features list */
  getFeatures?: (t: GenericTierInput) => unknown[];
  /** Read CTA object */
  getCta?: (t: GenericTierInput) => any;
  /** Read/derive a stable id */
  getId?: (t: GenericTierInput, i: number) => string;
}

function normalizeTier(
  t: GenericTierInput,
  i: number,
  cfg: GenericTierConfig
): TierCard {
  const name = cfg.getName?.(t, i) ?? String(t?.name ?? t?.title ?? `Tier ${i + 1}`);
  const description = cfg.getDescription?.(t) ?? (t?.description ?? t?.subtitle);
  const amount = cfg.getPrimaryAmount?.(t);
  const originalAmount = cfg.getOriginalAmount?.(t);
  const currency = cfg.getCurrency?.(t) ?? t?.currency ?? "USD";
  const interval = cfg.getInterval?.(t);

  const price =
    amount !== undefined
      ? {
          ...toMoneyObject(amount, currency, interval),
          originalAmount: num(originalAmount),
        }
      : {
          ...toMoneyObject(0, currency, interval),
          originalAmount: num(originalAmount),
        };

  return {
    id: cfg.getId?.(t, i) ?? String(t?.id ?? t?.slug ?? name ?? `tier-${i}`),
    name,
    badge: cfg.getBadge?.(t, price.amount),
    description,
    highlighted: cfg.getHighlighted?.(t) ?? toHighlightedFlag(t),
    price,
    features: normalizeFeatures(cfg.getFeatures?.(t) ?? t?.features ?? []),
    cta: normalizeCta(cfg.getCta?.(t) ?? t?.cta ?? {
      label: t?.ctaText,
      href: t?.ctaLink,
      variant: t?.ctaType,
      target: t?.ctaTarget,
      rel: t?.ctaRel,
    }),
  };
}

/** Build props object for <PricingTiers /> */
function toPricingTiersProps(rawTiers: any[], opts?: { layout?: "grid" | "columns"; showBillingToggle?: boolean; }): PricingTiersProps {
  const tiers: TierCard[] = (Array.isArray(rawTiers) ? rawTiers : [])
    .map((t, i) => t && typeof t === "object" ? t : null)
    .filter(Boolean) as any[];
  return {
    tiers: tiers as unknown as TierCard[],
    layout: opts?.layout ?? "grid",
    showBillingToggle: Boolean(opts?.showBillingToggle),
  };
}

/* =============================================================================
 * 1) Content Production
 * Assumptions:
 * { tiers: [{ id,name,badge?,description?, monthlyPrice, yearlyPrice?, originalMonthlyPrice?,
 *   features, ctaText?, ctaLink?, ctaType?, popular?|featured? }] }
 * ========================================================================== */
export const mapContentProdPricingToTiersProps: MapToTiersProps = (data: any): PricingTiersProps => {
  // pricingSectionValidator?.(data);
  const rawTiers: any[] = data?.tiers ?? [];

  const mapped: TierCard[] = rawTiers.map((t, i) =>
    normalizeTier(t, i, {
      getName: (x) => String(x?.name ?? x?.title ?? `Tier ${i + 1}`),
      getDescription: (x) => x?.description ?? x?.subtitle,
      getPrimaryAmount: (x) =>
        typeof x?.monthlyPrice === "number" ? x.monthlyPrice : num(x?.price) ?? undefined,
      getOriginalAmount: (x) => num(x?.originalMonthlyPrice),
      getCurrency: (x) => x?.currency ?? "USD",
      getInterval: (x) => normalizeInterval(x?.billingInterval, "/mo"),
      getHighlighted: (x) => toHighlightedFlag(x),
      getBadge: (x) => x?.badge,
      getFeatures: (x) => Array.isArray(x?.features) ? x.features : [],
      getCta: (x) => ({
        label: x?.cta?.label ?? x?.ctaText,
        href: x?.cta?.href ?? x?.ctaLink,
        variant: x?.cta?.variant ?? x?.ctaType,
        target: x?.cta?.target,
        rel: x?.cta?.rel,
      }),
      getId: (x) => String(x?.id ?? x?.slug ?? x?.name ?? `tier-${i}`),
    })
  );

  return {
    tiers: mapped,
    layout: data?.layout ?? "grid",
    showBillingToggle: Boolean(data?.showBillingToggle ?? data?.yearlyPrice),
  };
};

/* =============================================================================
 * 2) Lead Generation (same field set as content)
 * ========================================================================== */
export const mapLeadGenPricingToTiersProps: MapToTiersProps = (data: any): PricingTiersProps => {
  // pricingSectionValidator?.(data);
  const rawTiers: any[] = data?.tiers ?? [];

  const mapped: TierCard[] = rawTiers.map((t, i) =>
    normalizeTier(t, i, {
      getName: (x) => String(x?.name ?? x?.title ?? `Tier ${i + 1}`),
      getDescription: (x) => x?.description ?? x?.subtitle,
      getPrimaryAmount: (x) =>
        typeof x?.monthlyPrice === "number" ? x.monthlyPrice : num(x?.price) ?? undefined,
      getOriginalAmount: (x) => num(x?.originalMonthlyPrice),
      getCurrency: (x) => x?.currency ?? "USD",
      getInterval: (x) => normalizeInterval(x?.billingInterval, "/mo"),
      getHighlighted: (x) => toHighlightedFlag(x),
      getBadge: (x) => x?.badge,
      getFeatures: (x) => Array.isArray(x?.features) ? x.features : [],
      getCta: (x) => ({
        label: x?.cta?.label ?? x?.ctaText,
        href: x?.cta?.href ?? x?.ctaLink,
        variant: x?.cta?.variant ?? x?.ctaType,
        target: x?.cta?.target,
        rel: x?.cta?.rel,
      }),
      getId: (x) => String(x?.id ?? x?.slug ?? x?.name ?? `tier-${i}`),
    })
  );

  return {
    tiers: mapped,
    layout: data?.layout ?? "grid",
    showBillingToggle: Boolean(data?.showBillingToggle ?? data?.yearlyPrice),
  };
};

/* =============================================================================
 * 3) Video Production
 * Assumptions:
 *   price: string ("$8,500" | "Custom" | "From $3,000")
 *   period?: "project" | "monthly" | ...
 * ========================================================================== */
export const mapVideoProdPricingToTiersProps: MapToTiersProps = (data: any): PricingTiersProps => {
  // pricingSectionValidator?.(data);
  const rawTiers: any[] = data?.tiers ?? [];

  const mapped: TierCard[] = rawTiers.map((t, i) => {
    const parsed = parsePriceString(t?.price);
    const baseDescription = t?.description ?? t?.subtitle;
    const description = parsed.isCustom
      ? [baseDescription, "Custom pricing based on scope."].filter(Boolean).join(" ")
      : baseDescription;

    const interval = parsed.isCustom
      ? undefined
      : normalizeInterval(t?.period, "/project");

    const badge = t?.badge ?? (parsed.isCustom ? "Custom" : undefined);

    return normalizeTier(t, i, {
      getName: (x) => String(x?.name ?? x?.title ?? `Tier ${i + 1}`),
      getDescription: () => description,
      getPrimaryAmount: () => parsed.amount, // 0 for "Custom"
      getOriginalAmount: (x) => num(x?.originalPrice),
      getCurrency: (x) => x?.currency ?? "USD",
      getInterval: () => interval,
      getHighlighted: (x) => toHighlightedFlag(x),
      getBadge: () => badge,
      getFeatures: (x) => Array.isArray(x?.features) ? x.features : [],
      getCta: (x) => ({
        label: x?.cta?.label ?? x?.ctaText,
        href: x?.cta?.href ?? x?.ctaLink,
        variant: x?.cta?.variant ?? x?.ctaType,
        target: x?.cta?.target,
        rel: x?.cta?.rel,
      }),
      getId: (x) => String(x?.id ?? x?.slug ?? x?.name ?? `tier-${i}`),
    });
  });

  return {
    tiers: mapped,
    layout: data?.layout ?? "grid",
    showBillingToggle: Boolean(data?.showBillingToggle),
  };
};

/* =============================================================================
 * 4) Marketing Automation
 * Assumptions (flexible):
 *   monthlyPrice | price (number or "$1,999")
 *   interval?: "monthly" | "yr" | "project"
 * ========================================================================== */
export const mapMarketingAutoPricingToTiersProps: MapToTiersProps = (data: any): PricingTiersProps => {
  const rawTiers: any[] = data?.tiers ?? [];

  const mapped: TierCard[] = rawTiers.map((t, i) =>
    normalizeTier(t, i, {
      getName: (x) => String(x?.name ?? x?.title ?? `Tier ${i + 1}`),
      getDescription: (x) => x?.description ?? x?.subtitle,
      getPrimaryAmount: (x) => {
        if (typeof x?.monthlyPrice === "number") return x.monthlyPrice;
        if (typeof x?.price === "number") return x.price;
        return parsePriceString(x?.price)?.amount ?? 0;
      },
      getOriginalAmount: (x) => num(x?.originalMonthlyPrice ?? x?.originalPrice),
      getCurrency: (x) => x?.currency ?? "USD",
      getInterval: (x) => normalizeInterval(x?.billingInterval ?? x?.interval, "/mo"),
      getHighlighted: (x) => toHighlightedFlag(x),
      getBadge: (x) => x?.badge,
      getFeatures: (x) => Array.isArray(x?.features) ? x.features : [],
      getCta: (x) => x?.cta,
      getId: (x) => String(x?.id ?? x?.slug ?? x?.name ?? `tier-${i}`),
    })
  );

  return {
    tiers: mapped,
    layout: data?.layout ?? "grid",
    showBillingToggle: Boolean(data?.showBillingToggle),
  };
};

/* =============================================================================
 * 5) SEO Services
 * Similar to Marketing Automation; accepts strings or numbers for price
 * ========================================================================== */
export const mapSeoServicesPricingToTiersProps: MapToTiersProps = (data: any): PricingTiersProps => {
  const rawTiers: any[] = data?.tiers ?? [];

  const mapped: TierCard[] = rawTiers.map((t, i) =>
    normalizeTier(t, i, {
      getName: (x) => String(x?.name ?? x?.title ?? `Tier ${i + 1}`),
      getDescription: (x) => x?.description ?? x?.subtitle,
      getPrimaryAmount: (x) => {
        if (typeof x?.monthlyPrice === "number") return x.monthlyPrice;
        if (typeof x?.price === "number") return x.price;
        return parsePriceString(x?.price)?.amount ?? 0;
      },
      getOriginalAmount: (x) => num(x?.originalMonthlyPrice ?? x?.originalPrice),
      getCurrency: (x) => x?.currency ?? "USD",
      getInterval: (x) => normalizeInterval(x?.billingInterval ?? x?.interval, "/mo"),
      getHighlighted: (x) => toHighlightedFlag(x),
      getBadge: (x) => x?.badge,
      getFeatures: (x) => Array.isArray(x?.features) ? x.features : [],
      getCta: (x) => x?.cta,
      getId: (x) => String(x?.id ?? x?.slug ?? x?.name ?? `tier-${i}`),
    })
  );

  return {
    tiers: mapped,
    layout: data?.layout ?? "grid",
    showBillingToggle: Boolean(data?.showBillingToggle),
  };
};

/* =============================================================================
 * 6) Web Development
 * Accepts "monthlyPrice" or numeric/string "price". Allows "/project" interval.
 * ========================================================================== */
export const mapWebDevPricingToTiersProps: MapToTiersProps = (data: any): PricingTiersProps => {
  const rawTiers: any[] = data?.tiers ?? [];

  const mapped: TierCard[] = rawTiers.map((t, i) =>
    normalizeTier(t, i, {
      getName: (x) => String(x?.name ?? x?.title ?? `Tier ${i + 1}`),
      getDescription: (x) => x?.description ?? x?.subtitle,
      getPrimaryAmount: (x) => {
        if (typeof x?.monthlyPrice === "number") return x.monthlyPrice;
        if (typeof x?.price === "number") return x.price;
        return parsePriceString(x?.price)?.amount ?? 0;
      },
      getOriginalAmount: (x) => num(x?.originalMonthlyPrice ?? x?.originalPrice),
      getCurrency: (x) => x?.currency ?? "USD",
      getInterval: (x) => normalizeInterval(x?.billingInterval ?? x?.period ?? x?.interval, "/project"),
      getHighlighted: (x) => toHighlightedFlag(x),
      getBadge: (x) => x?.badge,
      getFeatures: (x) => Array.isArray(x?.features) ? x.features : [],
      getCta: (x) => x?.cta ?? {
        label: x?.ctaText,
        href: x?.ctaLink,
        variant: x?.ctaType,
      },
      getId: (x) => String(x?.id ?? x?.slug ?? x?.name ?? `tier-${i}`),
    })
  );

  return {
    tiers: mapped,
    layout: data?.layout ?? "grid",
    showBillingToggle: Boolean(data?.showBillingToggle),
  };
};

/* =============================================================================
 * Universal facade — pick the right mapper by service key
 * ========================================================================== */
export function mapServicePricingToTiersProps(
  serviceKey:
    | "content"
    | "leadgen"
    | "video"
    | "marketing"
    | "seo"
    | "web",
  data: any
): PricingTiersProps {
  switch (serviceKey) {
    case "content":
      return mapContentProdPricingToTiersProps(data);
    case "leadgen":
      return mapLeadGenPricingToTiersProps(data);
    case "video":
      return mapVideoProdPricingToTiersProps(data);
    case "marketing":
      return mapMarketingAutoPricingToTiersProps(data);
    case "seo":
      return mapSeoServicesPricingToTiersProps(data);
    case "web":
      return mapWebDevPricingToTiersProps(data);
    default:
      return { tiers: [] };
  }
}
