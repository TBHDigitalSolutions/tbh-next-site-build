// src/packages/lib/registry.ts
// Central registry for canonical service slugs, routes, featured selections,
// and small utilities used by adapters/templates. Pure TypeScript (no React).

import type { PackageBundle } from "./types";

/* ----------------------------------------------------------------------------
 * Canonical Services
 * ---------------------------------------------------------------------------- */

export const SERVICES = {
  "seo-services": {
    slug: "seo-services",
    name: "SEO",
    href: "/services/seo",
  },
  "marketing-services": {
    slug: "marketing-services",
    name: "Marketing",
    href: "/services/marketing",
  },
  "content-services": {
    slug: "content-services",
    name: "Content",
    href: "/services/content",
  },
  "web-development": {
    slug: "web-development",
    name: "Web Development",
    href: "/services/web-development",
  },
  "video-production": {
    slug: "video-production",
    name: "Video Production",
    href: "/services/video-production",
  },
  "lead-generation": {
    slug: "lead-generation",
    name: "Lead Generation",
    href: "/services/lead-generation",
  },
} as const;

export type ServiceSlug = keyof typeof SERVICES;
export type ServiceInfo = (typeof SERVICES)[ServiceSlug];

/** quick lookup */
const serviceSet: ReadonlySet<string> = new Set(Object.keys(SERVICES));

/** Synonyms → canonical service slugs */
const SYNONYMS = new Map<string, ServiceSlug>([
  ["seo", "seo-services"],
  ["search-engine-optimization", "seo-services"],
  ["marketing", "marketing-services"],
  ["growth-marketing", "marketing-services"],
  ["content", "content-services"],
  ["content-marketing", "content-services"],
  ["web", "web-development"],
  ["web-dev", "web-development"],
  ["website-development", "web-development"],
  ["video", "video-production"],
  ["video-prod", "video-production"],
  ["leadgen", "lead-generation"],
  ["lead-gen", "lead-generation"],
  ["lead-generation", "lead-generation"],
]);

/**
 * Normalize arbitrary input into a canonical service slug when possible.
 * Returns the canonical slug if recognized; otherwise the lowercased input.
 */
export function normalizeServiceSlug(input: string): ServiceSlug | string {
  const s = input.trim().toLowerCase();
  if (serviceSet.has(s)) return s as ServiceSlug;
  return SYNONYMS.get(s) ?? s;
}

export function isKnownServiceSlug(slug: string): slug is ServiceSlug {
  return serviceSet.has(slug);
}

export function getService(slug: string): ServiceInfo | undefined {
  const key = (isKnownServiceSlug(slug) ? slug : normalizeServiceSlug(slug)) as ServiceSlug;
  return (SERVICES as any)[key];
}

export function getAllServices(): ServiceInfo[] {
  return Object.values(SERVICES);
}

export function serviceHref(slug: string): string | undefined {
  return getService(slug)?.href;
}

/* ----------------------------------------------------------------------------
 * Defaults & constraints
 * ---------------------------------------------------------------------------- */

export const REGISTRY_DEFAULTS = {
  recommendedCount: 3, // number of cards for Growth/Grids
  cardFeatureLimit: 6, // max features shown on card
  minFeatureCountForCard: 3, // warn in checks if under this
} as const;

export type RegistryDefaults = typeof REGISTRY_DEFAULTS;

export function constraints(): RegistryDefaults {
  return { ...REGISTRY_DEFAULTS };
}

/* ----------------------------------------------------------------------------
 * Featured selections (env-driven override friendly)
 * ---------------------------------------------------------------------------- */

export type FeaturedRegistry = Partial<Record<ServiceSlug | "global", string[]>>;

function fromEnvList(key: string): string[] {
  const raw = process.env[key];
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * FEATURED holds curated slugs for the homepage/sections by service.
 * You can override via env vars in your deployment:
 * - NEXT_PUBLIC_PACKAGES_FEATURED_GLOBAL
 * - NEXT_PUBLIC_PACKAGES_FEATURED_SEO
 * - NEXT_PUBLIC_PACKAGES_FEATURED_MARKETING
 * - NEXT_PUBLIC_PACKAGES_FEATURED_CONTENT
 * - NEXT_PUBLIC_PACKAGES_FEATURED_WEB
 * - NEXT_PUBLIC_PACKAGES_FEATURED_VIDEO
 * - NEXT_PUBLIC_PACKAGES_FEATURED_LEADGEN
 */
export const FEATURED: FeaturedRegistry = {
  global: fromEnvList("NEXT_PUBLIC_PACKAGES_FEATURED_GLOBAL"),
  "seo-services": fromEnvList("NEXT_PUBLIC_PACKAGES_FEATURED_SEO"),
  "marketing-services": fromEnvList("NEXT_PUBLIC_PACKAGES_FEATURED_MARKETING"),
  "content-services": fromEnvList("NEXT_PUBLIC_PACKAGES_FEATURED_CONTENT"),
  "web-development": fromEnvList("NEXT_PUBLIC_PACKAGES_FEATURED_WEB"),
  "video-production": fromEnvList("NEXT_PUBLIC_PACKAGES_FEATURED_VIDEO"),
  "lead-generation": fromEnvList("NEXT_PUBLIC_PACKAGES_FEATURED_LEADGEN"),
};

export function setFeaturedForService(slug: ServiceSlug | "global", slugs: string[]) {
  FEATURED[slug] = Array.from(new Set(slugs));
}

export function resolveFeaturedSlugsForService(
  serviceSlug: string,
  opts: { limit?: number; fallbackToGlobal?: boolean } = {}
): string[] {
  const limit = opts.limit ?? REGISTRY_DEFAULTS.recommendedCount;
  const normalized = normalizeServiceSlug(serviceSlug);
  const exact = isKnownServiceSlug(normalized as string) ? FEATURED[normalized as ServiceSlug] : undefined;
  let picks = (exact ?? []).slice(0, limit);
  if (picks.length < limit && (opts.fallbackToGlobal ?? true)) {
    const g = FEATURED.global ?? [];
    picks = [...picks, ...g].slice(0, limit);
  }
  // de-duplicate while preserving order
  return Array.from(new Set(picks));
}

/* ----------------------------------------------------------------------------
 * Bundle helpers
 * ---------------------------------------------------------------------------- */

export function filterBundlesByService(bundles: PackageBundle[], serviceSlug: string): PackageBundle[] {
  const target = normalizeServiceSlug(serviceSlug) as string;
  return bundles.filter((b) => (b.services ?? []).map((s) => normalizeServiceSlug(s)).includes(target));
}

export function ensureFeaturedExist(bundles: PackageBundle[], slugs: string[]) {
  const existing = new Set(bundles.map((b) => b.slug));
  const present: string[] = [];
  const missing: string[] = [];
  for (const s of slugs) (existing.has(s) ? present : missing).push(s);
  return { present, missing };
}

export function pickFeaturedBundles(
  bundles: PackageBundle[],
  serviceSlug: string,
  opts: { limit?: number; fallbackToService?: boolean } = {}
): PackageBundle[] {
  const limit = opts.limit ?? REGISTRY_DEFAULTS.recommendedCount;
  const slugs = resolveFeaturedSlugsForService(serviceSlug, { limit, fallbackToGlobal: true });
  const bySlug = new Map(bundles.map((b) => [b.slug, b] as const));

  const selected: PackageBundle[] = [];
  for (const s of slugs) {
    const b = bySlug.get(s);
    if (b) selected.push(b);
  }

  if ((opts.fallbackToService ?? true) && selected.length < limit) {
    const serviceExtra = filterBundlesByService(bundles, serviceSlug)
      .filter((b) => !slugs.includes(b.slug))
      .slice(0, limit - selected.length);
    selected.push(...serviceExtra);
  }

  return selected.slice(0, limit);
}

/* ----------------------------------------------------------------------------
 * Add-on categories (optional ordering aid for UI)
 * ---------------------------------------------------------------------------- */

export const ADDON_CATEGORIES = [
  "Reputation",
  "CRM",
  "Content",
  "Social",
  "Analytics",
  "Automation",
] as const;

export type AddOnCategory = (typeof ADDON_CATEGORIES)[number];

export function orderForAddOnCategory(cat?: string): number {
  const i = ADDON_CATEGORIES.indexOf((cat ?? "") as AddOnCategory);
  return i === -1 ? Number.POSITIVE_INFINITY : i;
}

/* ----------------------------------------------------------------------------
 * Small presentation presets (shared with adapters/grids)
 * ---------------------------------------------------------------------------- */

export const GRID_PRESETS = {
  minCardWidthPx: 280,
} as const;

export const CARD_PRESETS = {
  featureLimit: REGISTRY_DEFAULTS.cardFeatureLimit,
} as const;
