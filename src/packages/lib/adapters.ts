// src/packages/lib/adapters.ts
// src/packages/lib/adapters.ts
// Production-ready adapters that map SSOT domain types → UI component props
// NOTE: This file intentionally avoids importing from /components to keep
// layering: app → templates → sections → components → lib (this file)
// The adapter return types below mirror component prop shapes but live locally
// to avoid cross-layer type imports.

import type { PackageBundle, PackageInclude, Price } from "./types";

/* ----------------------------------------------------------------------------
 * Local adapter output types (mirror component prop shapes)
 * ---------------------------------------------------------------------------- */

export type CardCTA = { label: string; href?: string; onClick?: (slug: string) => void };

/** Mirrors PackageCardProps (without depending on component types) */
export type PackageCardAdapter = {
  slug: string;
  name: string;
  description: string;
  price: Price;
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
  price: Price & { yearly?: number };
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

/** Mirrors AddOnsGrid AddOn */
export type AddOnAdapter = {
  slug: string;
  name: string;
  description: string;
  price?: Price;
  category?: string;
};

/* ----------------------------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------------------------- */

const currencyOf = (p?: Price) => (p?.currency ?? "USD");

function fmt(n?: number, currency = "USD") {
  if (n == null) return undefined;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    return `$${n}`;
  }
}

function flattenFeatures(b: PackageBundle, limit?: number) {
  const all = (b.includes ?? []).flatMap((s) => s.items);
  return typeof limit === "number" ? all.slice(0, Math.max(0, limit)) : all;
}

/* ----------------------------------------------------------------------------
 * Options
 * ---------------------------------------------------------------------------- */

export type ToCardOptions = {
  /** limit features rendered on the card */
  featureLimit?: number;
  /** override details URL; default `/packages/${slug}` */
  detailsHref?: (slug: string) => string;
  /** derive footnote from bundle timeline */
  footnoteFromTimeline?: boolean;
  /** when true, set highlight from isMostPopular */
  highlightMostPopular?: boolean;
  /** set badge from isMostPopular */
  badgeFromMostPopular?: boolean;
  /** add default secondary CTA to book a call */
  withBookCall?: boolean;
  /** custom primary CTA label */
  primaryLabel?: string;
  /** custom secondary CTA label */
  secondaryLabel?: string;
};

export type ToGridOptions = ToCardOptions & {
  /** order/boost and highlight these slugs */
  featuredSlugs?: string[];
  /** set a numeric weight on items matched in featuredSlugs (higher first) */
  weightFeatured?: boolean;
};

export type ToPriceBlockOptions = {
  title?: string; // plan name if shown standalone
  enableBillingToggle?: boolean;
  annualDiscountPercent?: number; // compute yearly when missing
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
 * Adapters → Card / Grid
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

  const card: PackageCardAdapter = {
    slug: b.slug,
    name: b.name,
    description: b.description,
    price: b.price,
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
      // Higher weight for earlier featured positions
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

  const pb: PriceBlockAdapter = {
    price: { ...b.price },
    enableBillingToggle,
    annualDiscountPercent,
    showSetup,
    unitLabel,
    caption,
    title: title ?? b.name,
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
 * Adapter → AddOnsGrid (thin pass-through with optional filters)
 * ---------------------------------------------------------------------------- */

export type ToAddOnsOptions = {
  /** Only include these categories */
  categories?: string[];
  /** Case-insensitive search across name/slug/description */
  query?: string;
};

export function toAddOnsGrid(addOns: AddOnAdapter[], opts: ToAddOnsOptions = {}): AddOnAdapter[] {
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
  const currency = currencyOf(bundle.price);
  const offers: any[] = [];
  if (bundle.price.monthly != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(bundle.price.monthly),
      availability: "https://schema.org/InStock",
      description: `${bundle.name} — monthly`,
    });
  }
  if (bundle.price.oneTime != null) {
    offers.push({
      "@type": "Offer",
      priceCurrency: currency,
      price: String(bundle.price.oneTime),
      availability: "https://schema.org/InStock",
      description: `${bundle.name} — setup`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: bundle.name,
    description: bundle.description,
    offers,
  } as const;
}

/* ----------------------------------------------------------------------------
 * Convenience bundles → everything
 * ---------------------------------------------------------------------------- */

export type ToHubModel = {
  grid: PackageGridItemAdapter[];
  jsonLd?: ReturnType<typeof toItemListJsonLd>;
};

export function toHubModel(bundles: PackageBundle[], opts: ToGridOptions & { jsonLd?: boolean } = {}): ToHubModel {
  const grid = toPackageGridItems(bundles, opts);
  const jsonLd = opts.jsonLd ? toItemListJsonLd(grid.map((g) => ({ slug: g.slug, name: g.name, detailsHref: g.detailsHref }))) : undefined;
  return { grid, jsonLd };
}

export type ToDetailModel = {
  card: PackageCardAdapter;
  price: PriceBlockAdapter;
  includes: ReturnType<typeof toIncludesTable>;
  jsonLd?: ReturnType<typeof toServiceOfferJsonLd>;
};

export function toDetailModel(bundle: PackageBundle, opts: { card?: ToCardOptions; price?: ToPriceBlockOptions; includes?: ToIncludesOptions; jsonLd?: boolean } = {}): ToDetailModel {
  const card = toPackageCard(bundle, opts.card);
  const price = toPriceBlock(bundle, opts.price);
  const includes = toIncludesTable(bundle, opts.includes);
  const jsonLd = opts.jsonLd ? toServiceOfferJsonLd(bundle) : undefined;
  return { card, price, includes, jsonLd };
}

