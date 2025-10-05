// src/packages/lib/bridge-growth.ts
// Bridges SSOT PackageBundle → props shape expected by GrowthPackagesSection.
// Pure utilities: no React imports, no component coupling.

import type { PackageBundle, Price } from "./types/types";

/** Shape consumed by GrowthPackagesSection */
export type GrowthPackage = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  setupPrice?: number;   // one-time
  monthlyPrice?: number; // recurring
  features: string[];    // concise bullet points
  badge?: string;        // e.g., "Most Popular"
};

/* ----------------------------------------------------------------------------
 * Options
 * ---------------------------------------------------------------------------- */
export type GrowthBridgeOptions = {
  /** Limit number of features per card (default 6). */
  featuresLimit?: number;
  /** De-duplicate identical features after trimming (default true). */
  dedupeFeatures?: boolean;
  /** If set, these slugs are preferred (sorted first) and highlighted. */
  featuredSlugs?: string[];
  /** When true, set `badge` to "Most Popular" if bundle.isMostPopular (default true). */
  badgeFromMostPopular?: boolean;
  /** Normalize/alias service slugs before matching (optional). */
  normalizeServiceSlug?: (slug: string) => string;
  /** Match mode when filtering by service: any|all (default: any). */
  serviceMatch?: "any" | "all";
  /** Sort strategy (default: featuredThenName). */
  sort?: "featuredThenName" | "name" | "priceAsc" | "priceDesc" | "none";
};

const DEFAULTS: Required<Pick<GrowthBridgeOptions, "featuresLimit" | "dedupeFeatures" | "badgeFromMostPopular" | "serviceMatch" | "sort">> = {
  featuresLimit: 6,
  dedupeFeatures: true,
  badgeFromMostPopular: true,
  serviceMatch: "any",
  sort: "featuredThenName",
};

/* ----------------------------------------------------------------------------
 * Internal helpers
 * ---------------------------------------------------------------------------- */

function clampPrice(p?: number): number | undefined {
  if (p == null) return undefined;
  return Number.isFinite(p) && p >= 0 ? p : undefined;
}

function sanitizeFeatures(items: string[], limit: number, dedupe: boolean): string[] {
  const norm = items
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.endsWith(".") ? s.slice(0, -1) : s));
  const out = dedupe ? Array.from(new Set(norm)) : norm;
  return out.slice(0, Math.max(0, limit));
}

function priceKey(price: Price | undefined, prefer: "monthly" | "oneTime") {
  if (!price) return Number.POSITIVE_INFINITY;
  const primary = prefer === "monthly" ? price.monthly : price.oneTime;
  const secondary = prefer === "monthly" ? price.oneTime : price.monthly;
  if (typeof primary === "number") return primary;
  if (typeof secondary === "number") return secondary;
  return Number.POSITIVE_INFINITY;
}

function byName(a: GrowthPackage, b: GrowthPackage) {
  return a.title.localeCompare(b.title);
}

/* ----------------------------------------------------------------------------
 * Core mapping
 * ---------------------------------------------------------------------------- */

export function bundleToGrowthPackage(bundle: PackageBundle, opts: GrowthBridgeOptions = {}): GrowthPackage {
  const { featuresLimit, dedupeFeatures, badgeFromMostPopular } = { ...DEFAULTS, ...opts };

  const allFeatures = (bundle.includes ?? []).flatMap((s) => s.items ?? []);
  const features = sanitizeFeatures(allFeatures, featuresLimit!, dedupeFeatures!);

  return {
    id: bundle.slug,
    slug: bundle.slug,
    title: bundle.name,
    tagline: bundle.description,
    setupPrice: clampPrice(bundle.price?.oneTime),
    monthlyPrice: clampPrice(bundle.price?.monthly),
    features,
    badge: badgeFromMostPopular && bundle.isMostPopular ? "Most Popular" : undefined,
  };
}

/* ----------------------------------------------------------------------------
 * Collections & selection
 * ---------------------------------------------------------------------------- */

export function mapBundlesToGrowthPackages(bundles: PackageBundle[], opts: GrowthBridgeOptions = {}): GrowthPackage[] {
  const { featuredSlugs = [], sort } = { ...DEFAULTS, ...opts };
  const featuredIndex = new Map<string, number>();
  featuredSlugs.forEach((s, i) => featuredIndex.set(s, i));

  const list = bundles.map((b) => bundleToGrowthPackage(b, opts));

  switch (sort) {
    case "name":
      return [...list].sort(byName);
    case "priceAsc":
      return [...list].sort((a, b) => (a.monthlyPrice ?? Infinity) - (b.monthlyPrice ?? Infinity));
    case "priceDesc":
      return [...list].sort((a, b) => (b.monthlyPrice ?? -Infinity) - (a.monthlyPrice ?? -Infinity));
    case "featuredThenName":
      return [...list].sort((a, b) => {
        const fa = featuredIndex.has(a.slug) ? -1000 - (featuredIndex.get(a.slug) ?? 0) : 0;
        const fb = featuredIndex.has(b.slug) ? -1000 - (featuredIndex.get(b.slug) ?? 0) : 0;
        if (fa !== fb) return fa - fb;
        return byName(a, b);
      });
    case "none":
    default:
      return list;
  }
}

export function selectBySlugs(bundles: PackageBundle[], slugs: string[], opts: GrowthBridgeOptions = {}): GrowthPackage[] {
  const order = new Map<string, number>();
  slugs.forEach((s, i) => order.set(s, i));
  const selected = bundles.filter((b) => order.has(b.slug));
  const mapped = selected.map((b) => bundleToGrowthPackage(b, opts));
  return mapped.sort((a, b) => (order.get(a.slug)! - order.get(b.slug)!));
}

function matchService(bundle: PackageBundle, serviceSlug: string, normalize?: (s: string) => string, mode: "any" | "all" = "any") {
  const services = (bundle.services ?? []).map((s) => (normalize ? normalize(s) : s));
  const target = normalize ? normalize(serviceSlug) : serviceSlug;
  if (services.length === 0) return false;
  if (mode === "all") return services.every((s) => s === target);
  return services.includes(target);
}

export function topNForService(bundles: PackageBundle[], serviceSlug: string, n = 3, opts: GrowthBridgeOptions = {}): GrowthPackage[] {
  const { serviceMatch, normalizeServiceSlug, featuredSlugs = [], sort } = { ...DEFAULTS, ...opts };
  const filtered = bundles.filter((b) => matchService(b, serviceSlug, normalizeServiceSlug, serviceMatch));
  const mapped = mapBundlesToGrowthPackages(filtered, { ...opts, featuredSlugs, sort: sort ?? "featuredThenName" });
  return mapped.slice(0, Math.max(0, n));
}

/* ----------------------------------------------------------------------------
 * Convenience: choose featured set with service fallback
 * ---------------------------------------------------------------------------- */

export function featuredOrTopN(
  bundles: PackageBundle[],
  featuredSlugs: string[] | undefined,
  serviceSlug: string,
  n = 3,
  opts: GrowthBridgeOptions = {}
): GrowthPackage[] {
  if (featuredSlugs && featuredSlugs.length) {
    const picks = selectBySlugs(bundles, featuredSlugs, opts).slice(0, n);
    if (picks.length === n) return picks;
  }
  return topNForService(bundles, serviceSlug, n, { ...opts, featuredSlugs });
}

/* ----------------------------------------------------------------------------
 * Sorting helpers exposed (optional)
 * ---------------------------------------------------------------------------- */

export function sortGrowthPackages(items: GrowthPackage[], mode: NonNullable<GrowthBridgeOptions["sort"]> = "featuredThenName", featuredSlugs?: string[]) {
  const featuredIndex = new Map<string, number>();
  (featuredSlugs ?? []).forEach((s, i) => featuredIndex.set(s, i));
  switch (mode) {
    case "name":
      return [...items].sort(byName);
    case "priceAsc":
      return [...items].sort((a, b) => (a.monthlyPrice ?? Infinity) - (b.monthlyPrice ?? Infinity));
    case "priceDesc":
      return [...items].sort((a, b) => (b.monthlyPrice ?? -Infinity) - (a.monthlyPrice ?? -Infinity));
    case "featuredThenName":
    default:
      return [...items].sort((a, b) => {
        const fa = featuredIndex.has(a.slug) ? -1000 - (featuredIndex.get(a.slug) ?? 0) : 0;
        const fb = featuredIndex.has(b.slug) ? -1000 - (featuredIndex.get(b.slug) ?? 0) : 0;
        if (fa !== fb) return fa - fb;
        return byName(a, b);
      });
  }
}