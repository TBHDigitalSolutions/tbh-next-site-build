// ============================================================================
// src/data/packages/index.ts
// ----------------------------------------------------------------------------
// Production SSOT façade for the Packages domain.
// Defensive against inconsistent module exports (default/named/mixed).
// ============================================================================

import type { PackageBundle, ServicePackage, AddOn } from "./_types/packages.types";
import type { PackagesSearchRecord } from "./_types/generated";
import searchIndexJson from "./__generated__/search/unified.search.json" assert { type: "json" };

const PACKAGES_SEARCH_INDEX: PackagesSearchRecord[] = Array.isArray(searchIndexJson)
  ? (searchIndexJson as PackagesSearchRecord[])
  : [];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

/** Coerce any imported module or value into a flat array<T>. */
function toArray<T = unknown>(modOrVal: unknown): T[] {
  // Direct array export
  if (Array.isArray(modOrVal)) return modOrVal as T[];

  // ESM/CJS default export that is an array
  if (
    modOrVal &&
    typeof modOrVal === "object" &&
    Array.isArray((modOrVal as any).default)
  ) {
    return (modOrVal as any).default as T[];
  }

  // If it's an object with multiple named array exports, flatten them
  if (modOrVal && typeof modOrVal === "object") {
    const arrays = Object.values(modOrVal as Record<string, unknown>).filter(Array.isArray) as T[][];
    if (arrays.length > 0) return arrays.flat();
  }

  return [];
}

/** Ensure `slug` exists on bundles/packages without mutating originals. */
const withSlugBundle = (b: PackageBundle): PackageBundle => ({
  slug: (b as any).slug ?? b.id,
  ...b,
});

const withSlugPackage = (p: ServicePackage): ServicePackage => ({
  slug: (p as any).slug ?? p.id,
  ...p,
});

// ----------------------------------------------------------------------------
// Bundles — by service
// (Each folder can export: default PackageBundle[], or named arrays, or both.)
// ----------------------------------------------------------------------------
import * as ContentBundlesMod from "./bundles/content-production-bundles";
import * as LeadgenBundlesMod from "./bundles/lead-generation-bundles";
import * as MarketingBundlesMod from "./bundles/marketing-bundles";
import * as SeoBundlesMod from "./bundles/seo-bundles";
import * as VideoBundlesMod from "./bundles/video-production-bundles";
import * as WebdevBundlesMod from "./bundles/web-development-bundles";

// Cross-service (Growth) bundles — directory exports PackageBundle[] (any shape)
import * as CrossServiceMod from "./CrossService";

// Coerce everything to arrays and normalize slugs
const contentBundles = toArray<PackageBundle>(ContentBundlesMod).map(withSlugBundle);
const leadgenBundles = toArray<PackageBundle>(LeadgenBundlesMod).map(withSlugBundle);
const marketingBundles = toArray<PackageBundle>(MarketingBundlesMod).map(withSlugBundle);
const seoBundles = toArray<PackageBundle>(SeoBundlesMod).map(withSlugBundle);
const videoBundles = toArray<PackageBundle>(VideoBundlesMod).map(withSlugBundle);
const webdevBundles = toArray<PackageBundle>(WebdevBundlesMod).map(withSlugBundle);
const CROSS_SERVICE_BUNDLES = toArray<PackageBundle>(CrossServiceMod).map(withSlugBundle);

export const SERVICE_BUNDLES: Record<
  "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev",
  PackageBundle[]
> = {
  content: contentBundles,
  leadgen: leadgenBundles,
  marketing: marketingBundles,
  seo: seoBundles,
  video: videoBundles,
  webdev: webdevBundles,
};

export const GROWTH_BUNDLES: PackageBundle[] = CROSS_SERVICE_BUNDLES;

export const ALL_BUNDLES: PackageBundle[] = [
  ...SERVICE_BUNDLES.content,
  ...SERVICE_BUNDLES.leadgen,
  ...SERVICE_BUNDLES.marketing,
  ...SERVICE_BUNDLES.seo,
  ...SERVICE_BUNDLES.video,
  ...SERVICE_BUNDLES.webdev,
  ...GROWTH_BUNDLES,
];

export const BUNDLES_BY_ID: Record<string, PackageBundle> =
  Object.fromEntries(ALL_BUNDLES.map((b) => [b.id, b]));

export const BUNDLES_BY_SLUG: Record<string, PackageBundle> =
  Object.fromEntries(ALL_BUNDLES.map((b) => [b.slug!, b]));

export const getBundleBySlug = (slug: string) => BUNDLES_BY_SLUG[slug];
export const getBundleById = (id: string) => BUNDLES_BY_ID[id];

// ----------------------------------------------------------------------------
// Packages — by service
// (Each folder can export: default ServicePackage[], or named arrays, or both.)
// ----------------------------------------------------------------------------
import * as ContentPackagesMod from "./Services/content-production";
import * as LeadgenPackagesMod from "./Services/lead-generation";
import * as MarketingPackagesMod from "./Services/marketing-services";
import * as SeoPackagesMod from "./Services/seo-services";
import * as VideoPackagesMod from "./Services/video-production";
import * as WebdevPackagesMod from "./Services/web-development";

const contentPackages = toArray<ServicePackage>(ContentPackagesMod).map(withSlugPackage);
const leadgenPackages = toArray<ServicePackage>(LeadgenPackagesMod).map(withSlugPackage);
const marketingPackages = toArray<ServicePackage>(MarketingPackagesMod).map(withSlugPackage);
const seoPackages = toArray<ServicePackage>(SeoPackagesMod).map(withSlugPackage);
const videoPackages = toArray<ServicePackage>(VideoPackagesMod).map(withSlugPackage);
const webdevPackages = toArray<ServicePackage>(WebdevPackagesMod).map(withSlugPackage);

export const SERVICE_PACKAGES: Record<
  "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev",
  ServicePackage[]
> = {
  content: contentPackages,
  leadgen: leadgenPackages,
  marketing: marketingPackages,
  seo: seoPackages,
  video: videoPackages,
  webdev: webdevPackages,
};

export const ALL_PACKAGES: ServicePackage[] = [
  ...SERVICE_PACKAGES.content,
  ...SERVICE_PACKAGES.leadgen,
  ...SERVICE_PACKAGES.marketing,
  ...SERVICE_PACKAGES.seo,
  ...SERVICE_PACKAGES.video,
  ...SERVICE_PACKAGES.webdev,
];

export const PACKAGES_BY_ID: Record<string, ServicePackage> =
  Object.fromEntries(ALL_PACKAGES.map((p) => [p.id, p]));

export const getPackageById = (id: string) => PACKAGES_BY_ID[id];

// ----------------------------------------------------------------------------
// Add-Ons — by service
// (Each folder can export: default AddOn[], or named arrays, or both.)
// ----------------------------------------------------------------------------
import * as ContentAddOnsMod from "./add-ons/content-production-add-ons";
import * as LeadgenAddOnsMod from "./add-ons/lead-generation-add-ons";
import * as MarketingAddOnsMod from "./add-ons/marketing-add-ons";
import * as SeoAddOnsMod from "./add-ons/seo-add-ons";
import * as VideoAddOnsMod from "./add-ons/video-production-add-ons";
import * as WebdevAddOnsMod from "./add-ons/web-development-add-ons";

const contentAddOns = toArray<AddOn>(ContentAddOnsMod);
const leadgenAddOns = toArray<AddOn>(LeadgenAddOnsMod);
const marketingAddOns = toArray<AddOn>(MarketingAddOnsMod);
const seoAddOns = toArray<AddOn>(SeoAddOnsMod);
const videoAddOns = toArray<AddOn>(VideoAddOnsMod);
const webdevAddOns = toArray<AddOn>(WebdevAddOnsMod);

export const SERVICE_ADDONS: Record<
  "content" | "leadgen" | "marketing" | "seo" | "video" | "webdev",
  AddOn[]
> = {
  content: contentAddOns,
  leadgen: leadgenAddOns,
  marketing: marketingAddOns,
  seo: seoAddOns,
  video: videoAddOns,
  webdev: webdevAddOns,
};

export const ALL_ADDONS: AddOn[] = [
  ...SERVICE_ADDONS.content,
  ...SERVICE_ADDONS.leadgen,
  ...SERVICE_ADDONS.marketing,
  ...SERVICE_ADDONS.seo,
  ...SERVICE_ADDONS.video,
  ...SERVICE_ADDONS.webdev,
];

export const ADDONS_BY_ID: Record<string, AddOn> =
  Object.fromEntries(ALL_ADDONS.map((a) => [a.id, a]));

export const getAddOnById = (id: string) => ADDONS_BY_ID[id];

// ----------------------------------------------------------------------------
// Featured — curated bundle slugs per service
// (Each folder can export: default string[], or named arrays, or both.)
// ----------------------------------------------------------------------------
import * as ContentFeaturedMod from "./Featured/content-production-featured";
import * as LeadgenFeaturedMod from "./Featured/lead-generation-featured";
import * as MarketingFeaturedMod from "./Featured/marketing-featured";
import * as SeoFeaturedMod from "./Featured/seo-featured";
import * as VideoFeaturedMod from "./Featured/video-production-featured";
import * as WebdevFeaturedMod from "./Featured/web-development-featured";

const contentFeatured = toArray<string>(ContentFeaturedMod);
const leadgenFeatured = toArray<string>(LeadgenFeaturedMod);
const marketingFeatured = toArray<string>(MarketingFeaturedMod);
const seoFeatured = toArray<string>(SeoFeaturedMod);
const videoFeatured = toArray<string>(VideoFeaturedMod);
const webdevFeatured = toArray<string>(WebdevFeaturedMod);

export const FEATURED_BUNDLE_SLUGS: string[] = [
  ...contentFeatured,
  ...leadgenFeatured,
  ...marketingFeatured,
  ...seoFeatured,
  ...videoFeatured,
  ...webdevFeatured,
];

// ----------------------------------------------------------------------------
// Under-$1K SKUs — derived slice from ALL_PACKAGES
// ----------------------------------------------------------------------------
export const UNDER_1K_PACKAGE_IDS: string[] = ALL_PACKAGES
  .filter((p) => {
    const m = p.price?.monthly ?? Number.POSITIVE_INFINITY;
    const o = p.price?.oneTime ?? Number.POSITIVE_INFINITY;
    return m <= 1000 || o <= 1000 || p.tags?.includes?.("under-1k");
  })
  .map((p) => p.id);

export const UNDER_1K_PACKAGES: ServicePackage[] = UNDER_1K_PACKAGE_IDS
  .map((id) => PACKAGES_BY_ID[id])
  .filter(Boolean) as ServicePackage[];

// ----------------------------------------------------------------------------
// Catalog helpers (optional)
// ----------------------------------------------------------------------------
export type CatalogItem =
  | ({ kind: "bundle" } & PackageBundle)
  | ({ kind: "package" } & ServicePackage);

export const CATALOG_ITEMS: CatalogItem[] = [
  ...ALL_BUNDLES.map((b) => ({ kind: "bundle", ...b })),
  ...ALL_PACKAGES.map((p) => ({ kind: "package", ...p })),
];

export const getItemBySlug = (slug: string): CatalogItem | undefined =>
  (BUNDLES_BY_SLUG[slug] && ({ kind: "bundle", ...BUNDLES_BY_SLUG[slug] } as const)) ||
  (PACKAGES_BY_ID[slug] && ({ kind: "package", ...PACKAGES_BY_ID[slug] } as const)) ||
  undefined;

export const getPackagesSearchIndex = (): PackagesSearchRecord[] => PACKAGES_SEARCH_INDEX;

// ----------------------------------------------------------------------------
// Back-compat generic names
// ----------------------------------------------------------------------------
export const BUNDLES = ALL_BUNDLES;
export const PACKAGES = ALL_PACKAGES;

// Default export (common grid/card imports use this)
export default ALL_BUNDLES;
