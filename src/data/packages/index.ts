// ============================================================================
// src/data/packages/index.ts
// ----------------------------------------------------------------------------
// Production SSOT façade for the Packages domain (registry-driven).
// - Keep this file tiny and explicit: import registry entries and expose
//   stable lookups for pages/components.
// - Add new packages by importing their `base` and `card` and appending below.
// ============================================================================

import type { PackageCardProps } from "@/packages/components/PackageCard/PackageCard";

// ────────────────────────────────────────────────────────────────────────────
// Lightweight public types (keep in sync with your base.ts scaffold)
// ────────────────────────────────────────────────────────────────────────────

export type Money = {
  oneTime?: number;
  monthly?: number;
  currency?: "USD" | string;
};

export type ServiceSlug =
  | "content"
  | "leadgen"
  | "marketing"
  | "seo"
  | "video"
  | "webdev"
  | (string & {});

export type PackageBase = {
  id: string;
  slug: string;
  service: ServiceSlug;
  name: string;
  summary: string;
  price: Money;
  tags?: string[];
  badges?: string[];
  tier?: string;
  image?: { src: string; alt: string };

  // Detail content (optional on some packages)
  icp?: string;
  outcomes?: string[];
  includes?: Array<{ title: string; items: string[] }>;
  faqs?: Array<{ q: string; a: string }>;
  notes?: string;

  // Cross-sell / SEO (optional)
  addOnRecommendations?: string[];
  relatedSlugs?: string[];
  seo?: { title?: string; description?: string };
};

// ────────────────────────────────────────────────────────────────────────────
// Registry imports
// Add one import line per package (base + card) and append to arrays/maps.
// ────────────────────────────────────────────────────────────────────────────

import { base as leadRoutingBase } from "@/packages/registry/lead-generation-packages/lead-routing-distribution/base";
import { leadRoutingDistributionCard } from "@/packages/registry/lead-generation-packages/lead-routing-distribution/card";

// If you add more packages, import their `base` and `card` here.
// Example:
// import { base as anotherBase } from "@/packages/registry/<dir>/<slug>/base";
// import { anotherCard } from "@/packages/registry/<dir>/<slug>/card";

// ────────────────────────────────────────────────────────────────────────────
// SSOT arrays & maps
// ────────────────────────────────────────────────────────────────────────────

/** All public packages (AKA “bundles” in some legacy code). */
export const PACKAGES: PackageBase[] = [
  leadRoutingBase,
  // anotherBase,
];

/** Legacy alias so existing pages keep working. */
export const BUNDLES: PackageBase[] = PACKAGES;

/** Map slug → PackageCard (used by grids/rails). */
const CARD_MAP: Record<string, PackageCardProps> = {
  [leadRoutingBase.slug]: leadRoutingDistributionCard,
  // [anotherBase.slug]: anotherCard,
};

// ────────────────────────────────────────────────────────────────────────────
// Lookups
// ────────────────────────────────────────────────────────────────────────────

/** Get a package by slug. */
export function getPackageBySlug(slug: string): PackageBase | undefined {
  return PACKAGES.find((p) => p.slug === slug);
}

/** Legacy alias (detail page currently calls getBundleBySlug). */
export const getBundleBySlug = getPackageBySlug;

/** Get a package by id. */
export function getPackageById(id: string): PackageBase | undefined {
  return PACKAGES.find((p) => p.id === id);
}

/** Return a PackageCard model for the given slug (for grids/rails). */
export function getCardBySlug(slug: string): PackageCardProps | undefined {
  return CARD_MAP[slug];
}

/** Resolve related packages by slug list. */
export function getRelatedBySlugs(slugs?: string[]): PackageBase[] {
  if (!slugs?.length) return [];
  const set = new Set(slugs);
  return PACKAGES.filter((p) => set.has(p.slug));
}

// ────────────────────────────────────────────────────────────────────────────
/** Add-ons dictionary placeholder (keeps API stable as you introduce add-ons). */
export const ADDONS_BY_ID: Record<string, any> = {};

// Back-compat exports some code still imports
export default PACKAGES;
