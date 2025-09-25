// ============================================================================
// /src/data/packages/index.ts  (production-ready facade + enriched access)
// ----------------------------------------------------------------------------
// Requirements:
// - tsconfig.json: "resolveJsonModule": true
// - Path aliases:
//    "@/data/*"     -> "src/data/*"
//    "@/packages/*" -> "src/packages/*"
// Authoring JSON (co-located):
//    ./addOns.json, ./bundles.json, ./featured.json
//
// This module is the ONLY import point for bundle/add-on/featured data.
// 1) Reads authored JSON
// 2) Normalizes to canonical headers
// 3) Exposes presentation view (`PackageBundle`) for templates
// 4) Prefers __generated__ enriched artifacts (no runtime MDX parsing)
// 5) Provides safe search/curation utilities + Growth bridge
// ============================================================================

import addOnsJson from "./addOns.json";
import bundlesJson from "./bundles.json";
import featuredJson from "./featured.json";

import type { PackageBundle } from "@/packages/lib/types";
import { bundleToGrowthPackage, type GrowthPackage } from "@/packages/lib/bridge-growth";

// ============================================================================
// Raw authoring shapes (internal only; tolerant to optional fields)
// ============================================================================

type Tier = "Essential" | "Professional" | "Enterprise";
type ServiceSlug = "content" | "leadgen" | "marketing" | "seo" | "webdev" | "video";

type RawAddOnJson = {
  slug: string;
  service?: ServiceSlug;
  name: string;
  description?: string;
  billing?: "one-time" | "monthly" | "hybrid" | "hourly";
  price?: { setup?: number; monthly?: number; currency?: string };
  deliverables?: Array<{ label: string; detail?: string }>;
  pairsBestWith?: Tier[];
  dependencies?: string[] | string;
  popular?: boolean;
  category?: string;
};

type RawBundleJson = {
  slug: string;
  // Presentation
  title?: string;
  subtitle?: string;
  summary?: string;
  category?: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags?: string[];
  // Optional richer shape (enriched build may add these)
  icon?: string;
  cardImage?: { src: string; alt?: string };
  hero?: {
    content?: {
      title?: string;
      subtitle?: string;
      primaryCta?: { label: string; href?: string };
      secondaryCta?: { label: string; href?: string };
    };
    background?: { type?: "image"; src?: string; alt?: string };
  };
  services?: string[];            // e.g., ["seo-services"]
  includedServices?: string[];    // human-readable labels
  highlights?: string[];
  outcomes?: {
    title?: string;
    variant?: "stats";
    items?: Array<{ label: string; value: string }>;
  };
  pricing?: any;                  // leave loose; templates own variants
  faq?: { title?: string; faqs?: Array<{ id?: string; question: string; answer: string }> };
  cta?: {
    title?: string;
    subtitle?: string;
    primaryCta?: { label: string; href?: string };
    secondaryCta?: { label: string; href?: string };
    layout?: "centered";
    backgroundType?: "gradient";
  };
  content?: { html?: string };    // compiled MDX attachment (build step)
  addOnSlugs?: string[];          // optional linkage for guards
};

type RawFeaturedJson = {
  slugs?: string[];                 // curated bundle slugs (rails / homepage)
  serviceFeaturedSlugs?: string[];  // curated per service
};

// ============================================================================
// Canonical headers (internal) + in-file normalizers
// (We export Presentation `PackageBundle` for templates)
// ============================================================================

type CanonicalAddOn = {
  id: string;                       // normalized from slug
  slug: string;
  service?: ServiceSlug;
  name: string;
  description?: string;
  billing?: "one-time" | "monthly" | "hybrid" | "hourly";
  price?: { oneTime?: number; monthly?: number; currency?: string; notes?: string };
  deliverables?: Array<{ label: string; detail?: string }>;
  pairsBestWith?: Tier[];
  dependencies?: string[];
  popular?: boolean;
  category?: string;
};

type CanonicalBundleHeader = {
  id: string;                       // normalized from slug
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  category?: RawBundleJson["category"];
  tags: string[];
  // Optional richer fields (pass-through when present)
  icon?: string;
  cardImage?: { src: string; alt?: string };
  hero?: RawBundleJson["hero"];
  services?: string[];
  includedServices?: string[];
  highlights?: string[];
  outcomes?: RawBundleJson["outcomes"];
  pricing?: RawBundleJson["pricing"];
  faq?: RawBundleJson["faq"];
  cta?: RawBundleJson["cta"];
  content?: RawBundleJson["content"]; // compiled MDX html (controlled render)
  addOnSlugs?: string[];
};

// --- helpers -----------------------------------------------------------------

const nonEmpty = <T,>(x: T | null | undefined): x is T => x != null;
const trimOr = (s: string | undefined, fallback = "") =>
  (s ?? "").toString().trim() || fallback;

function normalizeAddOn(raw: RawAddOnJson): CanonicalAddOn {
  const price = raw.price ?? {};
  const currency = (price.currency ?? "USD").toUpperCase();
  return {
    id: raw.slug,
    slug: raw.slug,
    service: raw.service,
    name: trimOr(raw.name, raw.slug),
    description: raw.description?.trim(),
    billing: raw.billing,
    price: {
      oneTime: nonEmpty(price.setup) ? Number(price.setup) : undefined,
      monthly: nonEmpty(price.monthly) ? Number(price.monthly) : undefined,
      currency,
    },
    deliverables: raw.deliverables,
    pairsBestWith: raw.pairsBestWith,
    dependencies: Array.isArray(raw.dependencies)
      ? raw.dependencies
      : raw.dependencies
      ? [raw.dependencies]
      : undefined,
    popular: !!raw.popular,
    category: raw.category,
  };
}

function normalizeBundleHeader(raw: RawBundleJson): CanonicalBundleHeader {
  const title = trimOr(raw.title ?? raw.hero?.content?.title, raw.slug);
  const subtitle = trimOr(raw.subtitle ?? raw.hero?.content?.subtitle);
  const summary = trimOr(raw.summary);
  const tags = Array.isArray(raw.tags) ? (raw.tags.filter(Boolean) as string[]) : [];
  return {
    id: raw.slug,
    slug: raw.slug,
    title,
    subtitle: subtitle || undefined,
    summary: summary || undefined,
    category: raw.category,
    tags,
    icon: raw.icon,
    cardImage: raw.cardImage,
    hero: raw.hero,
    services: raw.services,
    includedServices: raw.includedServices,
    highlights: raw.highlights,
    outcomes: raw.outcomes,
    pricing: raw.pricing,
    faq: raw.faq,
    cta: raw.cta,
    content: raw.content,
    addOnSlugs: raw.addOnSlugs,
  };
}

/** Map canonical header → presentation model expected by templates. */
function headerToPackageBundle(header: CanonicalBundleHeader): PackageBundle {
  // Visual fallbacks for robust cards/heroes
  const fallbackCard: PackageBundle["cardImage"] = {
    src: header.cardImage?.src ?? "/images/packages/placeholder-card.jpg",
    alt: header.cardImage?.alt ?? header.title,
  };

  const heroContent = {
    title: header.hero?.content?.title ?? header.title,
    subtitle: header.hero?.content?.subtitle ?? header.subtitle ?? header.summary,
    primaryCta: header.hero?.content?.primaryCta ?? { label: "Book a call", href: "/contact" },
    secondaryCta: header.hero?.content?.secondaryCta ?? { label: "See all packages", href: "/packages" },
  };

  return {
    slug: header.slug,
    id: header.id,
    title: header.title,
    subtitle: header.subtitle ?? header.summary ?? "",
    summary: header.summary ?? header.subtitle ?? "",
    category: (header.category as any) ?? "custom",
    tags: header.tags ?? [],
    icon: header.icon ?? "Package",
    cardImage: fallbackCard,
    hero: {
      content: heroContent,
      background: header.hero?.background ?? {
        type: "image",
        src: fallbackCard.src,
        alt: fallbackCard.alt,
      },
    },
    includedServices: header.includedServices ?? [],
    highlights: header.highlights ?? [],
    outcomes: header.outcomes ?? { title: "Expected results", variant: "stats", items: [] },
    pricing: header.pricing ?? {
      kind: "tiers",
      title: "Plans",
      subtitle: "Choose what fits your team",
      tiers: [],
    },
    faq: header.faq ?? { title: "Frequently Asked Questions", faqs: [] },
    cta: header.cta ?? {
      title: "Ready to get started?",
      subtitle: "Talk to our team and tailor this package to your goals.",
      primaryCta: { label: "Book a call", href: "/contact" },
      secondaryCta: { label: "See all packages", href: "/packages" },
      layout: "centered",
      backgroundType: "gradient",
    },
    // Pass-through compiled MDX html (rendered once in template via controlled injection)
    ...(header.content ? { content: header.content } : {}),
    // Extras used by guards/templates
    ...(header.addOnSlugs ? { addOnSlugs: header.addOnSlugs } : {}),
    ...(header.services ? { services: header.services } : {}),
  } as PackageBundle;
}

function normalizeFeatured(raw: RawFeaturedJson) {
  return {
    featuredBundleSlugs: Array.from(new Set(raw.slugs ?? [])),
    serviceFeaturedSlugs: Array.from(new Set(raw.serviceFeaturedSlugs ?? [])),
  };
}

// ============================================================================
// Canonical data from authored JSON (fallback baseline)
// ============================================================================

const ADD_ONS_CANONICAL: CanonicalAddOn[] = (addOnsJson as RawAddOnJson[]).map(normalizeAddOn);
const BUNDLE_HEADERS: CanonicalBundleHeader[] = (bundlesJson as RawBundleJson[]).map(normalizeBundleHeader);
const featured = normalizeFeatured(featuredJson as RawFeaturedJson);

export const FEATURED_BUNDLE_SLUGS: string[] = featured.featuredBundleSlugs;
export const SERVICE_FEATURED_SLUGS: string[] = featured.serviceFeaturedSlugs;

// Presentation mapping from headers (fallback when no enriched bundles are available)
const FALLBACK_BUNDLES: PackageBundle[] = BUNDLE_HEADERS.map(headerToPackageBundle);

// ============================================================================
// Prefer __generated__ enriched artifacts (optional)
// - bundles.enriched.json: fully enriched PackageBundle[] (with content.html)
// - packages.search.json: index for hub live search/filters
// ============================================================================

let ENRICHED_BUNDLES: PackageBundle[] | undefined;
let PACKAGES_SEARCH_INDEX: unknown | null = null;

try {
  // Top-level await is supported in Next.js build pipeline
  const mod = await import("./__generated__/bundles.enriched.json");
  ENRICHED_BUNDLES = (mod.default as PackageBundle[])?.filter(Boolean);
} catch {
  // no-op: fall back to authored headers
}

try {
  const mod = await import("./__generated__/packages.search.json");
  PACKAGES_SEARCH_INDEX = mod.default ?? null;
} catch {
  // no-op: search falls back to header-level filter
}

/** Bundles exported to the app (enriched preferred). */
export const BUNDLES: PackageBundle[] = ENRICHED_BUNDLES ?? FALLBACK_BUNDLES;

/** Canonical add-ons (normalized). */
export const ADD_ONS: CanonicalAddOn[] = ADD_ONS_CANONICAL;

/** Optional: expose generated search index to hub when available. */
export function getPackagesSearchIndex(): unknown | null {
  return PACKAGES_SEARCH_INDEX;
}

// ============================================================================
// Lookups & search
// ============================================================================

/** Find a bundle by slug (presentation model). */
export function getBundleBySlug(slug: string): PackageBundle | undefined {
  return BUNDLES.find((b) => b.slug === slug);
}

/** Back-compat: find an add-on by authored slug (returns canonical). */
export function getAddOnBySlug(slug: string): CanonicalAddOn | undefined {
  return ADD_ONS.find((a) => a.slug === slug || a.id === slug);
}

/** Canonical ID lookup for add-ons. */
export function getAddOnById(id: string): CanonicalAddOn | undefined {
  return ADD_ONS.find((a) => a.id === id);
}

/** Get bundles by a service page slug (e.g., "seo-services"). */
export function getBundlesByService(serviceSlug: string): PackageBundle[] {
  const slug = serviceSlug.toLowerCase();

  return BUNDLES.filter((b: any) => {
    // Preferred: explicit services array on bundle
    if (Array.isArray(b.services) && b.services.some((s: string) => s?.toLowerCase() === slug)) {
      return true;
    }
    // Fallback: includedServices (human labels) loose match
    if (Array.isArray(b.includedServices) && b.includedServices.some((s) => s.toLowerCase().includes(slug))) {
      return true;
    }
    // Heuristic: tags may include a service keyword
    if (Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().includes(slug))) {
      return true;
    }
    return false;
  });
}

/** Header-level text search across title/subtitle/summary (fallback when no index). */
export function searchBundles(query: string): PackageBundle[] {
  const q = query.trim().toLowerCase();
  if (!q) return BUNDLES;
  return BUNDLES.filter((b: any) =>
    [b.title, b.subtitle, b.summary].filter(Boolean).join(" ").toLowerCase().includes(q),
  );
}

// ============================================================================
// Curation utilities
// ============================================================================

/** Top-N bundles prioritizing curated FEATURED_BUNDLE_SLUGS, then filling from all. */
export function topN(n = 3): PackageBundle[] {
  const curated = FEATURED_BUNDLE_SLUGS.map(getBundleBySlug).filter(Boolean) as PackageBundle[];
  const out: PackageBundle[] = [];
  for (const b of curated) {
    if (out.length >= n) break;
    if (!out.find((x) => x.slug === b.slug)) out.push(b);
  }
  if (out.length < n) {
    for (const b of BUNDLES) {
      if (out.length >= n) break;
      if (!out.find((x) => x.slug === b.slug)) out.push(b);
    }
  }
  return out.slice(0, n);
}

/** Convenience: top-N growth packages for a service page slug. */
export function topNForService(serviceSlug: string, n = 3): GrowthPackage[] {
  const subset = getBundlesByService(serviceSlug).slice(0, n);
  return toGrowthPackages(subset);
}

// ============================================================================
// Guards
// ============================================================================

/** True if an add-on slug is referenced by at least one bundle (when linkage exists). */
export function isAddOnUsed(slug: string): boolean {
  // Use authored headers because enrichment may omit linkage metadata
  return BUNDLE_HEADERS.some((b) => Array.isArray(b.addOnSlugs) && b.addOnSlugs.includes(slug));
}

// ============================================================================
// Growth bridge (compat with Growth components)
// ============================================================================

/** Convert presentation bundles → GrowthPackage. */
export function toGrowthPackages(bundles: PackageBundle[]): GrowthPackage[] {
  return bundles.map(bundleToGrowthPackage);
}

// ============================================================================
// Exposed types (QoL re-exports only; keep raw/canonical types internal)
// ============================================================================

export type { PackageBundle } from "@/packages/lib/types";
export type { GrowthPackage } from "@/packages/lib/bridge-growth";
