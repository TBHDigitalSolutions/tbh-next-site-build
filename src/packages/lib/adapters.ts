// src/packages/lib/adapters.ts
// Production-ready adapters that map SSOT domain types → UI-friendly props.
// Layering rule: no *runtime* imports from /components. Importing component
// *types* is OK (erased at compile time).

import type { PackageBundle, PackageInclude, Price } from "./types";
import type { AddOnCardProps } from "@/packages/components/AddOnCard"; // type-only; safe
import {
  toStartingPrice,
  toOneTimePrice,
  toMonthlyPrice,
} from "@/data/packages/_types/currency";

/* ----------------------------------------------------------------------------
 * Local adapter output types (mirror component prop shapes without coupling)
 * ---------------------------------------------------------------------------- */

export type CardCTA = { label: string; href?: string; onClick?: (slug: string) => void };

/** Mirrors PackageCardProps (without depending on component runtime) */
export type PackageCardAdapter = {
  slug: string;
  name: string;
  description: string;
  price?: Price;
  features?: string[];
  badge?: string;
  highlight?: boolean;
  detailsHref?: string;
  primaryCta?: CardCTA;
  secondaryCta?: CardCTA;
  footnote?: string;
};

/** Mirrors PackageGridItem */
export type PackageGridItemAdapter = PackageCardAdapter & { weight?: number };

/** Mirrors PriceBlockProps (no handlers) */
export type PriceBlockAdapter = {
  price: Partial<Price> & { yearly?: number };
  enableBillingToggle?: boolean;
  annualDiscountPercent?: number;
  showSetup?: boolean;
  unitLabel?: string;
  caption?: string;
  badge?: string;
  highlight?: boolean;
  title?: string;
  primaryCta?: { label: string; href?: string };
  secondaryCta?: { label: string; href?: string };
  note?: string;
  jsonLd?: boolean;
};

/** Thin add-on domain view (used by grid filters) */
export type AddOnAdapter = {
  slug: string;
  name: string;
  description: string;
  price?: Price;
  category?: string;
  popular?: boolean;
};

/** Canonical Add-on domain model (from facade normalization) */
export type AddOnDomain = {
  id: string;
  slug?: string;
  service?: string;
  name: string;
  description?: string;
  price?: { oneTime?: number; monthly?: number; currency?: string };
  deliverables?: Array<{ label: string; detail?: string }>;
  popular?: boolean;
  category?: string;
};

/* ----------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------- */

const currencyOf = (p?: Price) => p?.currency ?? "USD";

function fmt(n?: number, currency = "USD") {
  if (n == null) return undefined;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}

/** Extracts a human name/description from mixed bundle shapes. */
function coerceMeta(b: PackageBundle): { name: string; description: string } {
  const name = b.name ?? b.title ?? b.hero?.content?.title ?? "Package";
  const description =
    b.description ??
    b.summary ??
    b.subtitle ??
    b.valueProp ??
    b.hero?.content?.subtitle ??
    "";
  return { name, description };
}

/** Parse a currency string like "$7,500" → 7500 (tolerant). */
function parseMoney(input?: unknown): number | undefined {
  if (typeof input === "number") return input;
  if (typeof input !== "string") return undefined;
  const digits = input.replace(/[^\d.]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) ? n : undefined;
}

/** Derive a simple price object from tiered `pricing` if `price` is absent. */
function derivePriceFromPricing(b: PackageBundle): Price | undefined {
  const pricing = b.pricing;
  if (!pricing || pricing.kind !== "tiers" || !Array.isArray(pricing.tiers)) return undefined;

  let monthly: number | undefined;
  let oneTime: number | undefined;

  for (const tier of pricing.tiers) {
    const tierPrice = tier?.price as unknown;
    const p = parseMoney(tierPrice);
    if (!p) continue;
    const period = String(tier?.period ?? "").toLowerCase();
    if (period.includes("month")) monthly = monthly ?? p;
    if (period.includes("one-time") || period.includes("one time") || period.includes("setup")) {
      oneTime = oneTime ?? p;
    }
  }

  if (monthly == null && oneTime == null) return undefined;
  return { monthly, oneTime, currency: "USD" };
}

/** Prefer explicit bundle.price; otherwise derive from pricing. */
function resolvePrice(b: PackageBundle): Price | undefined {
  if (b?.price) return b.price;
  return derivePriceFromPricing(b);
}

function flattenFeatures(b: PackageBundle, limit?: number) {
  const all = (b.includes ?? []).flatMap((s) => s.items ?? []);
  return typeof limit === "number" ? all.slice(0, Math.max(0, limit)) : all;
}

/* ----------------------------------------------------------------------------
 * Package → Card / Grid options
 * ---------------------------------------------------------------------------- */

export type ToCardOptions = {
  featureLimit?: number;
  detailsHref?: (slug: string) => string;
  footnoteFromTimeline?: boolean;
  highlightMostPopular?: boolean;
  badgeFromMostPopular?: boolean;
  withBookCall?: boolean;
  primaryLabel?: string;
  secondaryLabel?: string;
};

export type ToGridOptions = ToCardOptions & {
  featuredSlugs?: string[];
  weightFeatured?: boolean;
};

export type ToPriceBlockOptions = {
  title?: string;
  enableBillingToggle?: boolean;
  annualDiscountPercent?: number;
  showSetup?: boolean;
  unitLabel?: string;
  caption?: string;
  badgeFromMostPopular?: boolean;
  highlightMostPopular?: boolean;
  note?: string;
  jsonLd?: boolean;
  primary?: { label: string; href?: string };
  secondary?: { label: string; href?: string };
};

/* ----------------------------------------------------------------------------
 * Adapters → PackageCard / Grid
 * ---------------------------------------------------------------------------- */

export function toPackageCard(b: PackageBundle, opts: ToCardOptions = {}): PackageCardAdapter {
  const {
    featureLimit,
    detailsHref,
    footnoteFromTimeline = true,
    highlightMostPopular = true,
    badgeFromMostPopular = true,
    withBookCall = true,
    primaryLabel,
    secondaryLabel,
  } = opts;

  const details = detailsHref ? detailsHref(b.slug) : `/packages/${b.slug}`;
  const features = flattenFeatures(b, featureLimit);
  const { name, description } = coerceMeta(b);
  const price = resolvePrice(b);

  const card: PackageCardAdapter = {
    slug: b.slug,
    name,
    description,
    price,
    features,
    detailsHref: details,
  };

  if (highlightMostPopular && b.isMostPopular) card.highlight = true;
  if (badgeFromMostPopular && b.isMostPopular) card.badge = card.badge ?? "Most Popular";

  if (footnoteFromTimeline && b.timeline) card.footnote = `Typical onboarding ${b.timeline}`;

  // Primary CTA → Details
  card.primaryCta = { label: primaryLabel ?? "View details", href: details };

  if (withBookCall) {
    card.secondaryCta = { label: secondaryLabel ?? "Book a call", href: "/book" };
  }

  return card;
}

export function toPackageGridItems(bundles: PackageBundle[], opts: ToGridOptions = {}): PackageGridItemAdapter[] {
  const { featuredSlugs = [], weightFeatured = true } = opts;
  const featuredIndex = new Map<string, number>();
  featuredSlugs.forEach((s, i) => featuredIndex.set(s, i));

  return bundles.map((b) => {
    const base = toPackageCard(b, opts);
    const item: PackageGridItemAdapter = { ...base };
    if (weightFeatured && featuredIndex.has(b.slug)) {
      item.weight = 100 - (featuredIndex.get(b.slug) ?? 0);
      item.highlight = true;
    }
    return item;
  });
}

/* ----------------------------------------------------------------------------
 * Adapter → PriceBlock
 * ---------------------------------------------------------------------------- */

export function toPriceBlock(b: PackageBundle, opts: ToPriceBlockOptions = {}): PriceBlockAdapter {
  const {
    title,
    enableBillingToggle = true,
    annualDiscountPercent,
    showSetup = true,
    unitLabel,
    caption,
    badgeFromMostPopular = true,
    highlightMostPopular = true,
    note,
    jsonLd = true,
    primary,
    secondary,
  } = opts;

  const { name } = coerceMeta(b);
  const priceResolved = resolvePrice(b);

  const pb: PriceBlockAdapter = {
    price: { ...(priceResolved ?? {}) },
    enableBillingToggle,
    annualDiscountPercent,
    showSetup,
    unitLabel,
    caption,
    title: title ?? name,
    jsonLd,
    primaryCta: primary ?? { label: "View details", href: `/packages/${b.slug}` },
    secondaryCta: secondary ?? { label: "Book a call", href: "/book" },
    note,
  };

  if (badgeFromMostPopular && b.isMostPopular) pb.badge = pb.badge ?? "Most Popular";
  if (highlightMostPopular && b.isMostPopular) pb.highlight = true;

  return pb;
}

/* ----------------------------------------------------------------------------
 * Adapter → PackageIncludesTable
 * ---------------------------------------------------------------------------- */

export type ToIncludesOptions = {
  title?: string;
  enableSearch?: boolean;
  collapsible?: boolean;
  initiallyOpenCount?: number;
  dense?: boolean;
  printExpandAll?: boolean;
};

export function toIncludesTable(b: PackageBundle, opts: ToIncludesOptions = {}) {
  const {
    title = "What's included",
    enableSearch = true,
    collapsible = true,
    initiallyOpenCount,
    dense,
    printExpandAll = true,
  } = opts;

  return {
    sections: (b.includes ?? []) as PackageInclude[],
    title,
    enableSearch,
    collapsible,
    initiallyOpenCount,
    dense,
    printExpandAll,
  };
}

/* ----------------------------------------------------------------------------
 * Adapter → Add-ons (cards, grids, filters)
 * ---------------------------------------------------------------------------- */

/**
 * Map canonical add-on domain → AddOnCardProps (component props).
 * Uses tolerant currency helpers; chooses Monthly > One-time > Contact for pricing.
 */
export function toAddOnCardProps(a: AddOnDomain, locale?: string): AddOnCardProps {
  const priceLabel =
    a.price?.monthly != null
      ? toMonthlyPrice(a.price.monthly, a.price.currency, locale)
      : a.price?.oneTime != null
      ? toOneTimePrice(a.price.oneTime, a.price.currency, locale)
      : "Contact for pricing";

  return {
    id: a.id,
    title: a.name,
    description: a.description,
    bullets: a.deliverables?.map((d) => d.label),
    priceLabel,
    badge: a.popular ? "Popular" : undefined,
    href: a.service ? `/services/${a.service}#${a.slug ?? a.id}` : undefined,
  };
}

/** Bulk mapping for convenience */
export function toAddOnCardList(addOns: AddOnDomain[], locale?: string): AddOnCardProps[] {
  return addOns.map((a) => toAddOnCardProps(a, locale));
}

/** Thin pass-through with optional filters for grid usage */
export type ToAddOnsOptions = {
  categories?: string[];
  query?: string;
};

/** Keep for grids that still work with a minimal add-on view. */
export function toAddOnsGrid(addOns: AddOnAdapter[], opts: ToAddOnsOptions = {}) {
  const { categories, query } = opts;
  const q = query?.trim().toLowerCase();

  return addOns.filter((a) => {
    if (categories && categories.length && !categories.includes(a.category ?? "")) return false;
    if (!q) return true;
    return (
      a.name.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      a.description.toLowerCase().includes(q)
    );
  });
}

/* ----------------------------------------------------------------------------
 * JSON-LD helpers (optional convenience for templates/pages)
 * ---------------------------------------------------------------------------- */

export function toItemListJsonLd(items: Array<{ slug: string; name: string; detailsHref?: string }>) {
  const listItems = items.map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.name,
    url: it.detailsHref ?? `/packages/${it.slug}`,
  }));
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listItems,
  } as const;
}

export function toServiceOfferJsonLd(bundle: PackageBundle) {
  const price = resolvePrice(bundle); // may be undefined
  const currency = currencyOf(price);
  const offers: any[] = [];

  if (price?.monthly != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(price.monthly),
      availability: "https://schema.org/InStock",
      description: `${coerceMeta(bundle).name} — monthly`,
    });
  }
  if (price?.oneTime != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(price.oneTime),
      availability: "https://schema.org/InStock",
      description: `${coerceMeta(bundle).name} — setup`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: coerceMeta(bundle).name,
    description: coerceMeta(bundle).description,
    ...(offers.length ? { offers } : {}),
  } as const;
}

/* ----------------------------------------------------------------------------
 * Convenience: bundles → hub/detail view models
 * ---------------------------------------------------------------------------- */

export type ToHubModel = {
  grid: PackageGridItemAdapter[];
  jsonLd?: ReturnType<typeof toItemListJsonLd>;
};

export function toHubModel(
  bundles: PackageBundle[],
  opts: ToGridOptions & { jsonLd?: boolean } = {},
): ToHubModel {
  const grid = toPackageGridItems(bundles, opts);
  const jsonLd = opts.jsonLd
    ? toItemListJsonLd(grid.map((g) => ({ slug: g.slug, name: g.name, detailsHref: g.detailsHref })))
    : undefined;
  return { grid, jsonLd };
}

export type ToDetailModel = {
  card: PackageCardAdapter;
  price: PriceBlockAdapter;
  includes: ReturnType<typeof toIncludesTable>;
  jsonLd?: ReturnType<typeof toServiceOfferJsonLd>;
};

export function toDetailModel(
  bundle: PackageBundle,
  opts: { card?: ToCardOptions; price?: ToPriceBlockOptions; includes?: ToIncludesOptions; jsonLd?: boolean } = {},
): ToDetailModel {
  const card = toPackageCard(bundle, opts.card);
  const price = toPriceBlock(bundle, opts.price);
  const includes = toIncludesTable(bundle, opts.includes);
  const jsonLd = opts.jsonLd ? toServiceOfferJsonLd(bundle) : undefined;
  return { card, price, includes, jsonLd };
}
