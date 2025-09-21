// src/data/packages/index.ts
// Central barrel + helpers for packages data (bundles, add-ons, featured/recs).

import type { PackageBundle } from "@/packages/lib/types";
import { bundleToGrowthPackage, type GrowthPackage } from "@/packages/lib/bridge-growth";


// JSON data (requires tsconfig: `"resolveJsonModule": true`)
import addOnsJson from "./addOns.json";
import bundlesJson from "./bundles.json";
import featuredJson from "./featured.json";

// --- Local types -------------------------------------------------------------

// Matches your addOns.json structure exactly (price may be missing).
export type RawAddOn = {
  slug: string;
  name: string;
  description: string;
  price?: { oneTime?: number; monthly?: number; currency?: "USD" };
  category?: string;
};

// A tiny “feature” alias to help with UI mapping where needed.
export type BundleFeatureSection = { section: string; items: string[] };

// --- Canonical data exports --------------------------------------------------

/** All add-ons exactly as-authored (some items may omit price by design). */
export const ADD_ONS: RawAddOn[] = addOnsJson as RawAddOn[];

/** All bundles (SSOT for package pages and sections). */
export const BUNDLES: PackageBundle[] = bundlesJson as PackageBundle[];

/** Featured bundle slugs (for recommendations modules). */
export const FEATURED_BUNDLE_SLUGS: string[] = Array.from(
  new Set((featuredJson as { slugs: string[] }).slugs ?? []),
);

// --- Lookups & search --------------------------------------------------------

/** Find a bundle by slug. */
export function getBundleBySlug(slug: string): PackageBundle | undefined {
  return BUNDLES.find((b) => b.slug === slug);
}

/** Find an add-on by slug. */
export function getAddOnBySlug(slug: string): RawAddOn | undefined {
  return ADD_ONS.find((a) => a.slug === slug);
}

/** Get bundles by a service page slug (e.g., "seo-services"). */
export function getBundlesByService(serviceSlug: string): PackageBundle[] {
  return BUNDLES.filter((b) => (b.services ?? []).includes(serviceSlug));
}

/** Simple text search across bundle name/description/highlights. */
export function searchBundles(query: string): PackageBundle[] {
  const q = query.trim().toLowerCase();
  if (!q) return BUNDLES;
  return BUNDLES.filter((b) =>
    [b.name, b.description, ...(b.includes ?? []).flatMap((s) => s.items)]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

/** Convert any bundles to GrowthPackages (used by Growth sections). */
export function toGrowthPackages(bundles: PackageBundle[]): GrowthPackage[] {
  return bundles.map(bundleToGrowthPackage);
}

/** Convenience: top-N growth packages for a service page slug. */
export function topNForService(serviceSlug: string, n = 3): GrowthPackage[] {
  const subset = getBundlesByService(serviceSlug).slice(0, n);
  return toGrowthPackages(subset);
}

// --- Guards ------------------------------------------------------------------

/** True if an add-on slug is referenced by at least one bundle. */
export function isAddOnUsed(slug: string): boolean {
  return BUNDLES.some((b) => (b.addOnSlugs ?? []).includes(slug));
}

// --- Re-exports for convenience ---------------------------------------------

export type { PackageBundle } from "@/src/packages/lib/types";
export type { GrowthPackage } from "@/src/packages/lib/bridge-growth";
