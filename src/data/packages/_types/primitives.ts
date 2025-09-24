// ============================================================================
// Packages Domain — Types & Adapters Refactor (SSOT-aligned)
// ----------------------------------------------------------------------------
// This single file includes refactored types, raw JSON shapes, generated
// artifact types, currency formatters, and normalization helpers that map
// all provided JSON/TS/MDX sources into a *canonical SSOT* used by pages.
//
// Copy the sections below into your repo as separate files under:
//   /src/data/packages/_types/*
//   /src/data/packages/_adapters/normalize.ts
//   /src/data/packages/index.ts  (drop-in fixed version)
//
// Notes:
// - Canonical price model = Money { oneTime?, monthly?, currency? }.
// - Legacy JSON may use { setup }. The normalizer maps "setup" -> oneTime.
// - Add-on JSON uses `slug` (not `id`) and may include `billing` taxonomy.
// - Bundles JSON contains presentation headers only — narrative MDX is compiled
//   into __generated__/bundles.enriched.json as content.html during build.
// - All types are framework-agnostic.
// ============================================================================

// ============================================================================
// /src/data/packages/_types/primitives.ts
// ============================================================================
export type ServiceSlug = "content" | "leadgen" | "marketing" | "seo" | "webdev" | "video";
export type Tier = "Essential" | "Professional" | "Enterprise";
export type BillingModel = "one-time" | "monthly" | "hourly" | "hybrid";

/** Canonical money model (replaces legacy `setup`). */
export type Money = {
  oneTime?: number;
  monthly?: number;
  currency?: "USD"; // default in formatters/consumers
};

/** Optional display/contract metadata next to price. */
export type PriceMeta = {
  note?: string; // e.g., "+ ad spend", "starting at"
  minTermMonths?: number;
  setupWaivedAfterMonths?: number;
  discountPercent?: number; // internal; never auto-applied
};

export type FeatureItem = { label: string; detail?: string };

