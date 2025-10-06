/**
 * Adapters (master) — SSOT → UI-friendly view models
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Convert canonical domain types (your SSOT) into light, *component-agnostic*
 * props that UIs can consume. These adapters:
 *   • never import React/runtime code
 *   • define local prop types (mirroring component shapes) to avoid coupling
 *   • keep formatting minimal and deterministic
 *
 * What belongs here?
 * -----------------------------------------------------------------------------
 * - Card/grid adapters
 * - Price block adapter
 * - Includes table adapter
 * - Add-on adapters
 * - JSON-LD helpers for pages
 *
 * What does NOT belong here?
 * -----------------------------------------------------------------------------
 * - Schema validation (handled by package-schema.ts)
 * - Registry I/O (handled by registry/loader.ts)
 * - Growth-specific selection (in adapters/growth.ts)
 */

import type { PackageBundle, PackageInclude, Price } from "../types/types";

/* =============================================================================
 * Local view-model types (mirror component props without runtime coupling)
 * ============================================================================= */

/** Thin CTA shape safe for server and client */
export type CardCTA = {
  label: string;
  href?: string;
  onClick?: (slug: string) => void; // optional client hook (not used server-side)
};

/** Mirrors typical PackageCard props (no runtime import) */
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

/** Grid item = card + optional weighting */
export type PackageGridItemAdapter = PackageCardAdapter & { weight?: number };

/** Mirrors a typical PriceBlock props shape (no event handlers) */
export type PriceBlockAdapter = {
  price: Partial<Price> & { yearly?: number | null };
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

/** Minimal add-on card props (mirrors common UI needs) */
export type AddOnCardProps = {
  id: string;
  title: string;
  description?: string;
  bullets?: string[];
  priceLabel?: string;
  badge?: string;
  href?: string;
};

/** Lightweight add-on view for grids/filters */
export type AddOnAdapter = {
  slug: string;
  name: string;
  description: string;
  price?: Price;
  category?: string;
  popular?: boolean;
};

/** Canonical add-on domain model (from your SSOT/facade) */
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

/* =============================================================================
 * Tiny helpers (formatting + coercion)
 * ============================================================================= */

const currencyOf = (p?: Price) => p?.currency ?? "USD";

/** Tolerant money formatter (no localization hard-coding) */
function fmtCurrency(n?: number, currency = "USD", locale?: string) {
  if (n == null) return undefined;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `$${n}`;
  }
}

/** Extract friendly name/description from mixed bundle shapes */
function coerceMeta(b: any): { name: string; description: string } {
  const name = b?.name ?? b?.title ?? "Package";
  const description = b?.description ?? b?.summary ?? b?.subtitle ?? "";
  return { name, description };
}

/** Parse "$7,500" → 7500 (tolerant); number passthrough */
function parseMoney(input?: unknown): number | undefined {
  if (typeof input === "number") return input;
  if (typeof input !== "string") return undefined;
  const digits = input.replace(/[^\d.]/g, "");
  if (!digits) return undefined;
  const n = Number(digits);
  return Number.isFinite(n) ? n : undefined;
}

/** Derive Price from tiered pricing when `bundle.price` is missing */
function derivePriceFromPricing(b: any): Price | undefined {
  const pricing = b?.pricing;
  if (!pricing || !Array.isArray(pricing.tiers)) return undefined;

  let monthly: number | undefined;
  let oneTime: number | undefined;

  for (const tier of pricing.tiers) {
    const p = parseMoney(tier?.price);
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

/** Prefer explicit bundle.price; otherwise derive from pricing tiers */
function resolvePrice(b: any): Price | undefined {
  if (b?.price) return b.price as Price;
  return derivePriceFromPricing(b);
}

/** Flatten the includes sections into a features array (optionally limited) */
function flattenFeatures(b: PackageBundle, limit?: number) {
  const all = (b.includes ?? []).flatMap((s) => s.items);
  return typeof limit === "number" ? all.slice(0, Math.max(0, limit)) : all;
}

/* =============================================================================
 * Options
 * ============================================================================= */

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

export type ToIncludesOptions = {
  title?: string;
  enableSearch?: boolean;
  collapsible?: boolean;
  initiallyOpenCount?: number;
  dense?: boolean;
  printExpandAll?: boolean;
};

export type ToAddOnsOptions = {
  categories?: string[];
  query?: string;
};

/* =============================================================================
 * Package → Card / Grid
 * ============================================================================= */

/**
 * Map a PackageBundle to a small card view-model.
 * - Features: flattens includes (limit optional)
 * - Price: resolves from bundle.price or pricing tiers
 * - CTA: default "View details" + optional "Book a call"
 * - Footnote: can derive from bundle.timeline (opt-in)
 */
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

  if (highlightMostPopular && (b as any).isMostPopular) card.highlight = true;
  if (badgeFromMostPopular && (b as any).isMostPopular) card.badge = card.badge ?? "Most Popular";
  if (footnoteFromTimeline && (b as any).timeline) card.footnote = `Typical onboarding ${(b as any).timeline}`;

  // Primary CTA → Details
  card.primaryCta = { label: primaryLabel ?? "View details", href: details };

  // Secondary CTA → Book a call (optional)
  if (withBookCall) {
    card.secondaryCta = { label: secondaryLabel ?? "Book a call", href: "/book" };
  }

  return card;
}

/** Bulk mapping for card → grid items with optional featured weighting */
export function toPackageGridItems(
  bundles: PackageBundle[],
  opts: ToGridOptions = {},
): PackageGridItemAdapter[] {
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

/* =============================================================================
 * Package → PriceBlock
 * ============================================================================= */

/**
 * Map a PackageBundle to a PriceBlock-like view-model.
 * Leaves currency formatting to the consumer where possible; includes a minimal
 * Intl-based fallback for labels in add-ons mapping below.
 */
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

  if (badgeFromMostPopular && (b as any).isMostPopular) pb.badge = pb.badge ?? "Most Popular";
  if (highlightMostPopular && (b as any).isMostPopular) pb.highlight = true;

  return pb;
}

/* =============================================================================
 * Package → Includes (table/accordion)
 * ============================================================================= */

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

/* =============================================================================
 * Add-ons (cards / grids / filters)
 * ============================================================================= */

/** Map canonical add-on domain → AddOnCardProps (component-agnostic) */
export function toAddOnCardProps(a: AddOnDomain, locale?: string): AddOnCardProps {
  const currency = (a.price?.currency as any) ?? "USD";
  const monthly = a.price?.monthly;
  const oneTime = a.price?.oneTime;

  const priceLabel =
    monthly != null
      ? `${fmtCurrency(monthly, currency, locale)} / mo`
      : oneTime != null
      ? `${fmtCurrency(oneTime, currency, locale)} one-time`
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

/** Bulk adapter for add-on cards */
export function toAddOnCardList(addOns: AddOnDomain[], locale?: string): AddOnCardProps[] {
  return addOns.map((a) => toAddOnCardProps(a, locale));
}

/** Simple add-on grid filter/search */
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

/* =============================================================================
 * JSON-LD helpers (optional convenience for pages)
 * ============================================================================= */

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
  const price = resolvePrice(bundle);
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

/* =============================================================================
 * Convenience: hub/detail composite view models
 * ============================================================================= */

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
