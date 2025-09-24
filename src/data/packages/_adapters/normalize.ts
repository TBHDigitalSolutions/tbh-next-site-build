// ============================================================================
// /src/data/packages/_adapters/normalize.ts  (legacy JSON -> SSOT)
// ============================================================================
import type {
  AddOn,
  Bundle,
  PackageBundle,
  ServicePackage,
} from "../_types/domain";
import type { Money } from "../_types/primitives";
import type { RawAddOnJson, RawBundleJson, RawFeaturedJson, RawServicePackageJson } from "../_types/raw";

export function normalizeMoney(raw?: { setup?: number; monthly?: number; currency?: "USD" }): Money | undefined {
  if (!raw) return undefined;
  const { setup, monthly, currency } = raw;
  const oneTime = typeof setup === "number" ? setup : undefined;
  const m = typeof monthly === "number" ? monthly : undefined;
  if (oneTime == null && m == null) return undefined;
  return { oneTime, monthly: m, currency };
}

export function normalizeServicePackage(raw: RawServicePackageJson): ServicePackage {
  return {
    id: raw.id,
    service: raw.service,
    name: raw.name,
    tier: raw.tier,
    summary: raw.summary,
    idealFor: raw.idealFor,
    outcomes: raw.outcomes,
    features: raw.features,
    price: normalizeMoney(raw.price),
    priceMeta: raw.price?.notes ? { note: raw.price.notes } : undefined,
    badges: raw.badges,
    tags: raw.tags,
    category: raw.category,
    sla: raw.sla,
    popular: raw.popular,
  };
}

export function normalizeAddOn(raw: RawAddOnJson): AddOn {
  const deps = Array.isArray(raw.dependencies) ? raw.dependencies : raw.dependencies ? [raw.dependencies] : undefined;
  return {
    id: raw.slug, // normalize slug -> id
    service: raw.service,
    name: raw.name,
    description: raw.description,
    deliverables: raw.deliverables,
    billing: raw.billing as any,
    price: normalizeMoney(raw.price),
    priceMeta: raw.price?.notes ? { note: raw.price.notes } : undefined,
    dependencies: deps,
    pairsBestWith: raw.pairsBestWith,
    badges: undefined,
    popular: raw.popular,
    tags: raw.tags,
    category: raw.category,
  };
}

export function normalizeBundleHeaders(raw: RawBundleJson): Bundle {
  return {
    slug: raw.slug,
    id: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle,
    summary: raw.summary,
    category: raw.category,
    tags: raw.tags,
  } as Bundle; // composition/pricing will be attached later in build/enrichment
}

export function normalizeFeatured(raw: RawFeaturedJson): {
  featuredBundleSlugs: string[];
  serviceFeaturedSlugs: string[];
} {
  return {
    featuredBundleSlugs: Array.from(new Set(raw.slugs || [])),
    serviceFeaturedSlugs: Array.from(new Set(raw.serviceFeaturedSlugs || [])),
  };
}

// Convenience: presentation mapping when needed
export function toPackageBundle(b: Bundle): PackageBundle {
  return {
    slug: b.slug,
    id: b.id,
    title: b.title,
    subtitle: b.subtitle || "",
    summary: b.summary || "",
    category: (b.category ?? "custom") as any,
    tags: b.tags ?? [],
  };
}