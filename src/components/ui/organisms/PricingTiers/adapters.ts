// src/components/ui/organisms/PricingTiers/adapters.ts
// -----------------------------------------------------------------------------
// PricingTiers — Production-Ready Adapters
// - Pure, dependency-free mappers: raw service data → PricingTiersProps
// - Keep ALL transformation logic here (not in components)
// - No JSX. No side effects. No fetching.
// -----------------------------------------------------------------------------

import type {
  TierCard,
  TierFeature,
  TierCta,
  TierPrice,
  PricingTiersProps,
  BillingPeriod,
  ServiceTypeKey,
} from "./PricingTiers.types";

// Optional validator hooks (guard if omitted in build)
// If you have ./utils/pricingTiersValidator, you can uncomment/import & use.
// import { pricingTiersValidator } from "./utils/pricingTiersValidator";

/* =============================================================================
 * Shared coercions & normalizers
 * ========================================================================== */

const toStr = (v: unknown) => (v == null ? "" : String(v));
const toText = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);
const toId = (v: unknown, fallback: string) => {
  const s = toStr(v).trim();
  return s ? s : fallback;
};
const toBool = (v: unknown) => (typeof v === "boolean" ? v : undefined);
const toNum = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) ? v : undefined;

const parsePriceNumber = (v: unknown): number | undefined => {
  if (typeof v === "number" && Number.isFinite(v)) return Math.round(v);
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.]/g, "");
    const n = Number(cleaned);
    return Number.isFinite(n) ? Math.round(n) : undefined;
  }
  return undefined;
};

const isCustomPrice = (v: unknown): boolean => {
  if (typeof v !== "string") return false;
  const s = v.toLowerCase();
  return s.includes("custom") || s.includes("quote") || s.includes("contact");
};

const toCurrency = (v: unknown, fallback: string = "USD"): string => {
  const s = toText(v);
  return s && /^[A-Z]{3}$/.test(s) ? s : fallback;
};

const toPriceFromCommon = (input: any, defaultInterval?: string): TierPrice => {
  const amount =
    toNum(input?.amount) ??
    parsePriceNumber(input?.monthlyPrice ?? input?.price);

  const originalAmount =
    toNum(input?.originalAmount) ??
    parsePriceNumber(input?.originalMonthlyPrice ?? input?.originalPrice);

  const currency = toCurrency(input?.currency, "USD");
  const interval = toText(input?.interval)
    ?? (input?.period ? `/${String(input.period)}` : defaultInterval);

  return { amount, originalAmount, currency, interval };
};

const normalizeCta = (input: any): TierCta | undefined => {
  if (!input) return undefined;
  const label = toText(input.label ?? input.ctaText);
  const href = toText(input.href ?? input.ctaLink ?? input.url);
  if (!label || !href) return undefined;

  const variant = ((): TierCta["variant"] => {
    const v = toText(input.variant ?? input.ctaType);
    return v === "secondary" || v === "outline" ? (v as any) : "primary";
  })();

  const target = input.target === "_blank" ? "_blank" : "_self";
  const rel = target === "_blank" ? (toText(input.rel) ?? "noopener noreferrer") : toText(input.rel);

  return { label, href, variant, target, rel };
};

const normalizeFeatures = (list: unknown): TierFeature[] => {
  if (!Array.isArray(list)) return [];
  return list
    .map((f, i): TierFeature | undefined => {
      if (typeof f === "string") {
        const label = f.trim();
        if (!label) return undefined;
        return { id: `f-${i}`, label, included: true };
      }
      if (f && typeof f === "object") {
        const anyF: any = f;
        const label =
          toText(anyF.label ?? anyF.name ?? anyF.title ?? anyF.text) ?? "";
        if (!label) return undefined;
        const included =
          anyF.included === true
            ? true
            : anyF.included === false || anyF.available === false
            ? false
            : undefined;
        const note =
          toText(anyF.note ?? anyF.description ?? anyF.hint ?? anyF.tooltip ?? anyF.highlight);
        return { id: toId(anyF.id ?? anyF.key ?? anyF.slug, `f-${i}`), label, included, note };
      }
      return undefined;
    })
    .filter(Boolean) as TierFeature[];
};

const toHighlighted = (input: any): boolean =>
  Boolean(input?.highlighted ?? input?.popular ?? input?.featured);

/* =============================================================================
 * Canonical TierCard builder
 * ========================================================================== */

function buildTierCard(input: {
  id: string | number | undefined;
  name: string | undefined;
  description?: string;
  badge?: string;
  price: TierPrice;
  features?: TierFeature[];
  cta?: TierCta;
  highlighted?: boolean;
}): TierCard | null {
  const id = toId(input.id, "");
  const name = toText(input.name);
  if (!id || !name) return null;

  return {
    id,
    name,
    badge: toText(input.badge),
    description: toText(input.description),
    price: {
      amount: toNum(input.price?.amount),
      originalAmount: toNum(input.price?.originalAmount),
      currency: toCurrency(input.price?.currency, "USD"),
      interval: toText(input.price?.interval),
    },
    features: input.features ?? [],
    cta: input.cta,
    highlighted: Boolean(input.highlighted),
  };
}

/* =============================================================================
 * 1) Service-specific tier normalizers
 * ========================================================================== */

// Content Production (recurring by default)
export const fromContentProductionTier = (t: any, index = 0): TierCard | null => {
  const price = toPriceFromCommon(t, "/mo");
  return buildTierCard({
    id: t?.id ?? t?.slug ?? `content-${index}`,
    name: t?.name ?? t?.title,
    description: t?.description ?? t?.subtitle,
    badge: t?.badge,
    price,
    features: normalizeFeatures(t?.features),
    cta: normalizeCta(t?.cta ?? { label: t?.ctaText, href: t?.ctaLink, variant: t?.ctaType }),
    highlighted: toHighlighted(t),
  });
};

// Lead Generation (recurring)
export const fromLeadGenerationTier = (t: any, index = 0): TierCard | null => {
  const price = toPriceFromCommon(t, "/mo");
  return buildTierCard({
    id: t?.id ?? t?.slug ?? `lead-${index}`,
    name: t?.name ?? t?.title,
    description: t?.description ?? t?.subtitle,
    badge: t?.badge,
    price,
    features: normalizeFeatures(t?.features),
    cta: normalizeCta(t?.cta ?? { label: t?.ctaText, href: t?.ctaLink, variant: t?.ctaType }),
    highlighted: toHighlighted(t),
  });
};

// Marketing Automation (recurring)
export const fromMarketingAutomationTier = (t: any, index = 0): TierCard | null => {
  const price = toPriceFromCommon(t, "/mo");
  return buildTierCard({
    id: t?.id ?? t?.slug ?? `mkt-${index}`,
    name: t?.name ?? t?.title,
    description: t?.description ?? t?.subtitle,
    badge: t?.badge,
    price,
    features: normalizeFeatures(t?.features),
    cta: normalizeCta(t?.cta ?? { label: t?.ctaText, href: t?.ctaLink, variant: t?.ctaType }),
    highlighted: toHighlighted(t),
  });
};

// SEO Services (recurring)
export const fromSEOServicesTier = (t: any, index = 0): TierCard | null => {
  const price = toPriceFromCommon(t, "/mo");
  return buildTierCard({
    id: t?.id ?? t?.slug ?? `seo-${index}`,
    name: t?.name ?? t?.title,
    description: t?.description ?? t?.subtitle,
    badge: t?.badge,
    price,
    features: normalizeFeatures(t?.features),
    cta: normalizeCta(t?.cta ?? { label: t?.ctaText, href: t?.ctaLink, variant: t?.ctaType }),
    highlighted: toHighlighted(t),
  });
};

// Video Production (project-based, supports "Custom")
export const fromVideoProductionTier = (t: any, index = 0): TierCard | null => {
  const custom = isCustomPrice(t?.price);
  const price: TierPrice = {
    amount: custom ? undefined : parsePriceNumber(t?.price),
    originalAmount: parsePriceNumber(t?.originalPrice),
    currency: toCurrency(t?.currency, "USD"),
    interval: t?.period ? `/${String(t.period)}` : (custom ? undefined : "/project"),
  };

  return buildTierCard({
    id: t?.id ?? t?.slug ?? `video-${index}`,
    name: t?.name ?? t?.title,
    description: (t?.description ?? t?.subtitle ?? t?.idealFor) as string | undefined,
    badge: custom ? t?.badge ?? "Custom" : t?.badge,
    price,
    features: normalizeFeatures(t?.features),
    cta: normalizeCta(t?.cta ?? { label: t?.ctaText, href: t?.ctaLink, variant: t?.ctaType }),
    highlighted: toHighlighted(t),
  });
};

// Web Development (project-based, often “Custom”)
export const fromWebDevelopmentTier = (t: any, index = 0): TierCard | null => {
  const custom = isCustomPrice(t?.price);
  const price: TierPrice = {
    amount: custom ? undefined : parsePriceNumber(t?.price),
    originalAmount: parsePriceNumber(t?.originalPrice),
    currency: toCurrency(t?.currency, "USD"),
    interval: custom ? undefined : "/project",
  };

  return buildTierCard({
    id: t?.id ?? t?.slug ?? `web-${index}`,
    name: t?.name ?? t?.title,
    description: t?.description ?? t?.subtitle,
    badge: custom ? t?.badge ?? "Custom" : t?.badge,
    price,
    features: normalizeFeatures(t?.features),
    cta: normalizeCta(t?.cta ?? { label: t?.ctaText, href: t?.ctaLink, variant: t?.ctaType }),
    highlighted: toHighlighted(t),
  });
};

/* =============================================================================
 * 2) Collections → PricingTiersProps
 * ========================================================================== */

type Normalizer = (t: any, index?: number) => TierCard | null;

function mapCollection(
  data: unknown,
  normalize: Normalizer,
  opts?: { layout?: PricingTiersProps["layout"]; showBillingToggle?: boolean }
): PricingTiersProps {
  const arr: any[] = Array.isArray(data) ? data : Array.isArray((data as any)?.tiers) ? (data as any).tiers : [];
  const tiers = arr
    .map((t, i) => normalize(t, i))
    .filter(Boolean) as TierCard[];

  // Optional validation hook
  // const res = pricingTiersValidator?.validateTiers?.(tiers) ?? { ok: true, data: tiers } as const;
  // const cleanTiers = res.ok ? res.data : [];

  const cleanTiers = tiers;

  return {
    tiers: cleanTiers,
    layout: opts?.layout ?? "grid",
    showBillingToggle: Boolean(opts?.showBillingToggle),
  };
}

/* -- Adapters for each service (return clean presenter props) ---------------- */

export const mapContentProdPricingToTiersProps = (data: unknown): PricingTiersProps =>
  mapCollection(data, fromContentProductionTier, { layout: "grid", showBillingToggle: true });

export const mapLeadGenPricingToTiersProps = (data: unknown): PricingTiersProps =>
  mapCollection(data, fromLeadGenerationTier, { layout: "grid", showBillingToggle: true });

export const mapMarketingAutoPricingToTiersProps = (data: unknown): PricingTiersProps =>
  mapCollection(data, fromMarketingAutomationTier, { layout: "grid", showBillingToggle: true });

export const mapSEOServicesPricingToTiersProps = (data: unknown): PricingTiersProps =>
  mapCollection(data, fromSEOServicesTier, { layout: "grid", showBillingToggle: true });

export const mapVideoProdPricingToTiersProps = (data: unknown): PricingTiersProps =>
  mapCollection(data, fromVideoProductionTier, { layout: "grid", showBillingToggle: false });

export const mapWebDevPricingToTiersProps = (data: unknown): PricingTiersProps =>
  mapCollection(data, fromWebDevelopmentTier, { layout: "grid", showBillingToggle: false });

/* -- Universal façade -------------------------------------------------------- */

export function mapServicePricingToTiersProps(
  service: ServiceTypeKey,
  data: unknown
): PricingTiersProps {
  switch (service) {
    case "content-production":
      return mapContentProdPricingToTiersProps(data);
    case "lead-generation":
      return mapLeadGenPricingToTiersProps(data);
    case "marketing-automation":
      return mapMarketingAutoPricingToTiersProps(data);
    case "seo-services":
      return mapSEOServicesPricingToTiersProps(data);
    case "video-production":
      return mapVideoProdPricingToTiersProps(data);
    case "web-development":
      return mapWebDevPricingToTiersProps(data);
    default:
      // Safe fallback: treat like recurring content pricing
      return mapContentProdPricingToTiersProps(data);
  }
}

/* =============================================================================
 * 3) Optional: presentational billing transforms (helper only)
 *     - If the page wants to synthesize yearly prices (e.g. 2 months free)
 *     - Keep this logic out of the presenter component
 * ========================================================================== */

export function withBillingPeriod(
  tiers: TierCard[],
  period: BillingPeriod,
  opts: { yearlyMultiplier?: number; yearlyDiscountMonths?: number } = {}
): TierCard[] {
  const yearlyMultiplier = opts.yearlyMultiplier ?? 12;
  const discountMonths = opts.yearlyDiscountMonths ?? 0;

  return tiers.map((t) => {
    const next: TierCard = { ...t, price: { ...t.price } };
    if (period === "monthly") {
      next.price.interval = next.price.interval ?? "/mo";
      return next;
    }
    // yearly
    const amt = typeof next.price.amount === "number" ? next.price.amount : undefined;
    if (amt != null) {
      const base = amt * yearlyMultiplier;
      const discounted = discountMonths > 0 ? Math.max(0, base - amt * discountMonths) : base;
      next.price.originalAmount = discountMonths > 0 ? base : next.price.originalAmount;
      next.price.amount = discounted;
      next.price.interval = "/yr";
    } else {
      // custom: only swap label
      next.price.interval = "/yr";
    }
    return next;
  });
}

/* =============================================================================
 * 4) Named exports for shared helpers (useful in tests/adapters)
 * ========================================================================== */

export const __helpers = {
  toStr,
  toText,
  toId,
  toBool,
  toNum,
  parsePriceNumber,
  isCustomPrice,
  toCurrency,
  toPriceFromCommon,
  normalizeCta,
  normalizeFeatures,
  toHighlighted,
  buildTierCard,
};
