// src/components/sections/section-layouts/PackageCarousel/adapters/featuredDataAdapter.ts
// Normalizes "featured" data (and GrowthPackage) → domain PackageCardProps.
// Keeps this adapter UI-agnostic (no component imports), but it guarantees
// the final props shape required by the domain PackageCard.

import type { PackageCardProps } from "@/packages/components/PackageCard";
import type { GrowthPackage } from "@/packages/lib/bridge-growth";
import { toStartingPrice } from "@/data/packages/_types/currency";

/* ----------------------------------------------------------------------------
 * Featured authoring shape (service rails / curated)
 * ---------------------------------------------------------------------------- */

export type ServiceSlug = "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";

export interface FeaturedCard {
  id: string;
  service: ServiceSlug;
  packageId?: string; // preferred per-service id/anchor
  name?: string;      // optional explicit name
  headline: string;   // marketing headline (used as fallback name)
  summary?: string;   // short description
  tier?: "Essential" | "Professional" | "Enterprise";
  popular?: boolean;
  href?: string;      // optional explicit deep link
  image?: { src: string; alt?: string } | null; // ignored by PackageCardProps (no image prop)
  price?: { setup?: number; monthly?: number } | null;
  ctaLabel?: string;      // not required; PackageCard defaults label
  highlights?: string[];  // mapped → features
  startingAt?: number;    // optional, used for footnote if no price
  badge?: string;         // "Most Popular", etc.
  savingsPct?: number;    // ignored at card level
}

/* ----------------------------------------------------------------------------
 * Type guards
 * ---------------------------------------------------------------------------- */

export function isFeaturedCard(data: unknown): data is FeaturedCard {
  if (!data || typeof data !== "object") return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.service === "string" &&
    typeof obj.headline === "string"
  );
}

export function isFeaturedCardArray(data: unknown): data is FeaturedCard[] {
  return Array.isArray(data) && data.every(isFeaturedCard);
}

/* ----------------------------------------------------------------------------
 * Internals
 * ---------------------------------------------------------------------------- */

function determineSlug(card: FeaturedCard): string {
  return card.packageId ?? card.id;
}

function determineName(card: FeaturedCard): string {
  return card.name ?? card.headline ?? "Package";
}

function determineHref(card: FeaturedCard): string {
  if (card.href) return card.href;
  // Prefer a clean package route; fall back to service anchor if needed
  const slug = determineSlug(card);
  return `/packages/${slug}`;
}

function toPrice(card: FeaturedCard): PackageCardProps["price"] | undefined {
  if (card.price && (card.price.setup != null || card.price.monthly != null)) {
    return {
      oneTime: card.price.setup ?? undefined,
      monthly: card.price.monthly ?? undefined,
      currency: "USD",
    };
  }
  // No explicit price; if we have startingAt, surface as a footnote (not a chip)
  return undefined;
}

function toBadge(card: FeaturedCard): string | undefined {
  if (card.badge) return card.badge;
  return card.popular ? "Most Popular" : undefined;
}

function toFootnote(card: FeaturedCard): string | undefined {
  if (card.startingAt != null && (card.price == null || (card.price.setup == null && card.price.monthly == null))) {
    // We only show a "from" note when explicit price chips are absent
    return toStartingPrice(card.startingAt);
  }
  return undefined;
}

/* ----------------------------------------------------------------------------
 * Featured → PackageCardProps
 * ---------------------------------------------------------------------------- */

export function adaptFeaturedCardToPackageCard(card: FeaturedCard): PackageCardProps {
  const slug = determineSlug(card);
  const name = determineName(card);
  const description = card.summary ?? "";
  const price = toPrice(card);
  const badge = toBadge(card);
  const detailsHref = determineHref(card);
  const features = (card.highlights ?? []).slice(0, 8);

  return {
    slug,
    name,
    description,
    price,
    features,
    badge,
    detailsHref,
    // Let PackageCard generate primary/secondary CTAs if not provided.
    // If you want to override labels:
    // primaryCta: { label: card.ctaLabel ?? "View details", href: detailsHref },
    // secondaryCta: { label: "Book a call", href: "/book" },
    highlight: card.popular === true || /popular/i.test(card.badge ?? ""),
    footnote: toFootnote(card),
  };
}

export function adaptFeaturedCardsToPackageCards(cards: FeaturedCard[]): PackageCardProps[] {
  if (!Array.isArray(cards)) return [];
  return cards.filter(isFeaturedCard).map(adaptFeaturedCardToPackageCard);
}

/* ----------------------------------------------------------------------------
 * GrowthPackage → PackageCardProps (optional convenience)
 * ---------------------------------------------------------------------------- */

export function toPackageCardItems(pkgs: GrowthPackage[]): PackageCardProps[] {
  return (pkgs ?? []).map((p) => {
    const price = p.price
      ? {
          oneTime: p.price.oneTime ?? undefined,
          monthly: p.price.monthly ?? undefined,
          currency: p.price.currency ?? "USD",
        }
      : undefined;

    return {
      slug: p.slug,
      name: p.title,
      description: p.subtitle ?? p.summary ?? "",
      price,
      features: (p.highlights ?? []).slice(0, 8),
      badge: p.badge,
      detailsHref: `/packages/${p.slug}`,
      highlight: p.badge ? /popular|best|recommended/i.test(p.badge) : false,
      // Keep footnote empty here; GrowthPackage already has explicit price fields if applicable
    };
  });
}

/* ----------------------------------------------------------------------------
 * Utilities
 * ---------------------------------------------------------------------------- */

export function validateFeaturedCardData(data: unknown, context = "featured"): FeaturedCard[] {
  if (!Array.isArray(data)) return [];
  const valid: FeaturedCard[] = [];
  for (let i = 0; i < data.length; i++) {
    if (isFeaturedCard(data[i])) valid.push(data[i]);
    else if (typeof console !== "undefined") {
      // eslint-disable-next-line no-console
      console.warn(`[${context}] invalid FeaturedCard at index ${i}`, data[i]);
    }
  }
  return valid;
}

export function mergeFeaturedData(...sources: Array<FeaturedCard[] | undefined>): FeaturedCard[] {
  const out: FeaturedCard[] = [];
  const seen = new Set<string>();
  for (const src of sources) {
    if (!src) continue;
    for (const card of src) {
      if (!isFeaturedCard(card)) continue;
      if (seen.has(card.id)) continue;
      out.push(card);
      seen.add(card.id);
    }
  }
  return out;
}

/* ----------------------------------------------------------------------------
 * Service-scoped helpers (optional)
 * ---------------------------------------------------------------------------- */

export const serviceAdapters = {
  seo: (arr: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(arr),
  webdev: (arr: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(arr),
  marketing: (arr: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(arr),
  leadgen: (arr: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(arr),
  video: (arr: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(arr),
  content: (arr: FeaturedCard[]) => adaptFeaturedCardsToPackageCards(arr),
} as const;

export function adaptServiceFeaturedData(
  serviceSlug: ServiceSlug,
  featuredData: FeaturedCard[],
): PackageCardProps[] {
  const fn = (serviceAdapters as any)[serviceSlug] as ((d: FeaturedCard[]) => PackageCardProps[]) | undefined;
  return fn ? fn(featuredData) : adaptFeaturedCardsToPackageCards(featuredData);
}
