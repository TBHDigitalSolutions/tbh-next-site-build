// src/packages/lib/transforms.ts
// Production-ready, framework-agnostic utilities to search, filter, sort,
// page, and summarize PackageBundle data. Keep this file free of React.

import type { PackageBundle, Price } from "./types";
import { normalizeServiceSlug } from "./registry";

/* ----------------------------------------------------------------------------
 * Price helpers
 * ---------------------------------------------------------------------------- */

export function effectiveMonthly(price?: Price): number | undefined {
  if (!price) return undefined;
  if (typeof price.monthly === "number" && price.monthly >= 0) return price.monthly;
  return undefined;
}

export function effectiveSetup(price?: Price): number | undefined {
  if (!price) return undefined;
  if (typeof price.oneTime === "number" && price.oneTime >= 0) return price.oneTime;
  return undefined;
}

export function computeYearly(price: Price, annualDiscountPercent?: number): number | undefined {
  if (typeof (price as any).yearly === "number") return (price as any).yearly as number;
  if (price.monthly == null) return undefined;
  const base = price.monthly * 12;
  if (!annualDiscountPercent || annualDiscountPercent <= 0) return Math.round(base);
  return Math.round(base * (1 - annualDiscountPercent / 100));
}

/* ----------------------------------------------------------------------------
 * Collections & indices
 * ---------------------------------------------------------------------------- */

export function indexBySlug<T extends { slug: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, it) => { acc[it.slug] = it; return acc; }, {});
}

export function mapBySlug<T extends { slug: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((it) => [it.slug, it] as const));
}

export function ensureUniqueBySlug<T extends { slug: string }>(items: T[]) {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const unique: T[] = [];
  for (const it of items) {
    if (seen.has(it.slug)) { duplicates.push(it.slug); continue; }
    seen.add(it.slug); unique.push(it);
  }
  return { items: unique, duplicates };
}

/* ----------------------------------------------------------------------------
 * Features helpers
 * ---------------------------------------------------------------------------- */

export function flattenIncludes(bundle: PackageBundle): string[] {
  return (bundle.includes ?? []).flatMap((s) => s.items ?? []);
}

export function featureCount(bundle: PackageBundle): number {
  return flattenIncludes(bundle).length;
}

export function dedupeFeatures(bundle: PackageBundle): PackageBundle {
  const next = { ...bundle } as PackageBundle;
  next.includes = (bundle.includes ?? []).map((sec) => ({
    section: sec.section,
    items: Array.from(new Set((sec.items ?? []).map((s) => s.trim()).filter(Boolean))),
  }));
  return next;
}

/* ----------------------------------------------------------------------------
 * Search, Filter, Sort
 * ---------------------------------------------------------------------------- */

export type BundleTransform = (bundles: PackageBundle[]) => PackageBundle[];

export function pipeBundles(...ops: BundleTransform[]): BundleTransform {
  return (bundles) => ops.reduce((acc, op) => op(acc), bundles);
}

export function searchBundles(query: string): BundleTransform {
  const q = query.trim().toLowerCase();
  if (!q) return (xs) => xs;
  const terms = q.split(/\s+/).filter(Boolean);
  return (bundles) =>
    bundles.filter((b) => {
      const hay = [b.name, b.slug, b.description, ...flattenIncludes(b)].join("\n").toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
}

export function filterByService(services: string | string[], mode: "any" | "all" = "any"): BundleTransform {
  const targets = (Array.isArray(services) ? services : [services]).map((s) => normalizeServiceSlug(s));
  return (bundles) =>
    bundles.filter((b) => {
      const own = (b.services ?? []).map((s) => normalizeServiceSlug(s));
      if (own.length === 0) return false;
      if (mode === "all") return targets.every((t) => own.includes(t));
      return targets.some((t) => own.includes(t));
    });
}

export function filterByMonthlyPrice(min?: number, max?: number): BundleTransform {
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";
  return (bundles) =>
    bundles.filter((b) => {
      const m = effectiveMonthly(b.price);
      if (m == null) return false;
      if (hasMin && m < (min as number)) return false;
      if (hasMax && m > (max as number)) return false;
      return true;
    });
}

export function filterByFeatureCount(minFeatures: number): BundleTransform {
  return (bundles) => bundles.filter((b) => featureCount(b) >= minFeatures);
}

export type SortMode =
  | "name"
  | "monthlyAsc"
  | "monthlyDesc"
  | "setupAsc"
  | "setupDesc"
  | "mostPopularFirst"
  | "featuredThenName";

export function sortBundles(mode: SortMode, featuredSlugs?: string[]): BundleTransform {
  const featuredIndex = new Map<string, number>();
  (featuredSlugs ?? []).forEach((s, i) => featuredIndex.set(s, i));

  return (bundles) => {
    const byName = (a: PackageBundle, b: PackageBundle) => a.name.localeCompare(b.name);
    const byMonthly = (a: PackageBundle, b: PackageBundle) =>
      (effectiveMonthly(a.price) ?? Number.POSITIVE_INFINITY) - (effectiveMonthly(b.price) ?? Number.POSITIVE_INFINITY);
    const bySetup = (a: PackageBundle, b: PackageBundle) =>
      (effectiveSetup(a.price) ?? Number.POSITIVE_INFINITY) - (effectiveSetup(b.price) ?? Number.POSITIVE_INFINITY);

    const sorted = [...bundles];
    switch (mode) {
      case "name":
        return sorted.sort(byName);
      case "monthlyAsc":
        return sorted.sort(byMonthly);
      case "monthlyDesc":
        return sorted.sort((a, b) => -byMonthly(a, b));
      case "setupAsc":
        return sorted.sort(bySetup);
      case "setupDesc":
        return sorted.sort((a, b) => -bySetup(a, b));
      case "mostPopularFirst":
        return sorted.sort((a, b) => (b.isMostPopular ? 1 : 0) - (a.isMostPopular ? 1 : 0) || byName(a, b));
      case "featuredThenName":
      default:
        return sorted.sort((a, b) => {
          const fa = featuredIndex.has(a.slug) ? -1000 - (featuredIndex.get(a.slug) ?? 0) : 0;
          const fb = featuredIndex.has(b.slug) ? -1000 - (featuredIndex.get(b.slug) ?? 0) : 0;
          if (fa !== fb) return fa - fb;
          return byName(a, b);
        });
    }
  };
}

/* ----------------------------------------------------------------------------
 * Pagination & slicing
 * ---------------------------------------------------------------------------- */

export function limit(n: number): BundleTransform {
  return (bundles) => bundles.slice(0, Math.max(0, n));
}

export function paginate(page: number, pageSize: number): BundleTransform {
  const p = Math.max(1, Math.floor(page));
  const size = Math.max(1, Math.floor(pageSize));
  const start = (p - 1) * size;
  return (bundles) => bundles.slice(start, start + size);
}

/* ----------------------------------------------------------------------------
 * Stats & summaries (useful for scripts and UI badges)
 * ---------------------------------------------------------------------------- */

export type BundleStats = {
  total: number;
  withMonthly: number;
  withSetup: number;
  avgMonthly?: number;
  minMonthly?: number;
  maxMonthly?: number;
  services: Record<string, number>; // service slug → count
};

export function computeStats(bundles: PackageBundle[]): BundleStats {
  const mVals: number[] = [];
  const services: Record<string, number> = {};
  let withMonthly = 0, withSetup = 0;
  for (const b of bundles) {
    const m = effectiveMonthly(b.price);
    if (m != null) { mVals.push(m); withMonthly++; }
    if (effectiveSetup(b.price) != null) withSetup++;
    for (const s of b.services ?? []) {
      const k = normalizeServiceSlug(s);
      services[k] = (services[k] ?? 0) + 1;
    }
  }
  mVals.sort((a, b) => a - b);
  const avg = mVals.length ? Math.round(mVals.reduce((a, c) => a + c, 0) / mVals.length) : undefined;
  return {
    total: bundles.length,
    withMonthly,
    withSetup,
    avgMonthly: avg,
    minMonthly: mVals[0],
    maxMonthly: mVals[mVals.length - 1],
    services,
  };
}

/* ----------------------------------------------------------------------------
 * High-level selectors
 * ---------------------------------------------------------------------------- */

export function topNForService(
  bundles: PackageBundle[],
  serviceSlug: string,
  n = 3,
  opts: { featuredSlugs?: string[]; sort?: SortMode } = {}
): PackageBundle[] {
  const filtered = filterByService(serviceSlug)(bundles);
  const sorter = sortBundles(opts.sort ?? "featuredThenName", opts.featuredSlugs);
  return pipeBundles(sorter, limit(n))(filtered);
}

export function pickBySlugs(bundles: PackageBundle[], slugs: string[]): PackageBundle[] {
  const order = new Map<string, number>();
  slugs.forEach((s, i) => order.set(s, i));
  return bundles
    .filter((b) => order.has(b.slug))
    .sort((a, b) => (order.get(a.slug)! - order.get(b.slug)!));
}

/* ----------------------------------------------------------------------------
 * Safety — immutable update helpers
 * ---------------------------------------------------------------------------- */

export function withUpdatedPrice(bundle: PackageBundle, price: Partial<Price>): PackageBundle {
  return { ...bundle, price: { ...bundle.price, ...price } } as PackageBundle;
}

export function withAddedFeatures(bundle: PackageBundle, section: string, items: string[]): PackageBundle {
  const next = { ...bundle } as PackageBundle;
  const includes = (next.includes ?? []);
  const idx = includes.findIndex((s) => s.section === section);
  if (idx === -1) {
    next.includes = [...includes, { section, items }];
  } else {
    const existing = includes[idx];
    next.includes = [
      ...includes.slice(0, idx),
      { section: existing.section, items: [...existing.items, ...items] },
      ...includes.slice(idx + 1),
    ];
  }
  return next;
}

export function withoutAddOn(bundle: PackageBundle, addOnSlug: string): PackageBundle {
  const next = { ...bundle } as PackageBundle;
  next.addOnSlugs = (bundle.addOnSlugs ?? []).filter((s) => s !== addOnSlug);
  return next;
}