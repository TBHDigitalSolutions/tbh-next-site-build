// src/packages/lib/types.ts
// Domain type system for the Packages module. Framework-agnostic and import-safe.
// Keep this file free of runtime code and React-specific types.

import type {
  PackageBundle as CanonicalMarketingBundle,
  FAQBlock,
  MinimalPricingMatrix,
} from "@/data/packages/_types/domain";
import type { Money } from "@/data/packages/_types/primitives";

/* ----------------------------------------------------------------------------
 * Primitives & Utility Aliases
 * ---------------------------------------------------------------------------- */

/** ISO 4217 currency code. Default usage is "USD". */
export type CurrencyCode = "USD" | (string & {});

/** Slug string (opaque branded for editor hints; still a plain string at runtime). */
export type Slug = string & { __brand?: "Slug" };

/* ----------------------------------------------------------------------------
 * Core Domain Types (SSOT-aligned)
 * ---------------------------------------------------------------------------- */

/**
 * Price representation for a package or add-on.
 * - `oneTime`: setup or implementation fee
 * - `monthly`: recurring monthly fee
 * - `currency`: ISO code (default "USD")
 */
export type Price = Money;

/**
 * A named section of included deliverables for a package. Normalized to a
 * simple title + list of bullet strings so legacy transforms continue to
 * operate, while allowing upstream authors to provide richer marketing copy.
 */
export type PackageInclude = {
  section?: string;       // legacy alias kept for transforms
  title?: string;         // canonical field name
  items: string[];        // bullet list items
};

/**
 * A sellable package/bundle. This is the primary SSOT entity.
 */
export type PackageBundle = {
  slug: Slug;             // e.g., "local-lead-capture"
  id: string;             // stable canonical identifier
  name: string;           // marketing display name
  title?: string;         // optional legacy alias used by some marketing bundles
  description?: string;   // concise value prop / fallback copy
  summary?: string;       // longer card copy
  subtitle?: string;      // optional supporting line
  valueProp?: string;     // richer hero/overview headline

  /** Pricing — explicit bundle pricing or derived from tiers. */
  price?: Price;          // pricing structure (may be omitted for tier-only bundles)
  compareAt?: Price;      // optional "compare at" reference price

  /** Component packages and service affinity. */
  components?: string[];
  service?: string;
  services?: string[];    // e.g., ["seo", "leadgen"]

  /** Structured inclusions grouped by section. */
  includes?: PackageInclude[];

  /** Optional related add-on slugs that pair well with this bundle. */
  addOnSlugs?: Slug[];
  addOnRecommendations?: string[];

  /** Audience hints for merchandising or recommendations. */
  idealFor?: string[];    // e.g., ["single-location", "professional services"]
  icp?: string;           // ideal customer profile (detail overview)

  /** Typical onboarding range (display copy, not a machine-enforced SLA). */
  timeline?: string;      // e.g., "3–6 weeks"
  assumptionsNote?: string; // supplemental notes under includes table

  /** Merchandising toggles. */
  isMostPopular?: boolean;
  badges?: string[];
  tags?: string[];
  category?: string;
  cardImage?: CanonicalMarketingBundle["cardImage"];

  /** Optional hero content for detail templates. */
  hero?: CanonicalMarketingBundle["hero"];
  includedServices?: CanonicalMarketingBundle["includedServices"];
  highlights?: CanonicalMarketingBundle["highlights"];

  /** Outcomes may be canonical stats blocks or simple bullet lists. */
  outcomes?: CanonicalMarketingBundle["outcomes"] | string[];

  /** Tiered pricing blocks for legacy marketing layouts. */
  pricing?: CanonicalMarketingBundle["pricing"];

  /** Optional FAQ + CTA marketing sections. */
  faq?: FAQBlock;
  cta?: CanonicalMarketingBundle["cta"];

  /** Narrative content & supporting sections. */
  content?: { html?: string };
  pricingMatrix?: MinimalPricingMatrix;

  /** SEO metadata used by pages/templates. */
  seo?: { title?: string; description?: string };

  /** Primary service hint for overview sections. */
  primaryService?: string;
};

/* ----------------------------------------------------------------------------
 * Add-ons (optional SSOT entity when authoring separately)
 * ---------------------------------------------------------------------------- */

export type AddOn = {
  slug: Slug;
  name: string;
  description: string;
  price?: Price;          // some add-ons may be custom-quoted
  category?: string;      // optional grouping for filters (e.g., "Analytics")
};

/* ----------------------------------------------------------------------------
 * Collections & Indexes
 * ---------------------------------------------------------------------------- */

export type BundleMap = Record<string, PackageBundle>;
export type AddOnMap = Record<string, AddOn>;

/* ----------------------------------------------------------------------------
 * Filters & View-Model Helpers (types only; keep logic elsewhere)
 * ---------------------------------------------------------------------------- */

export type PriceRange = {
  minMonthly?: number;
  maxMonthly?: number;
};

export type BundleQuery = {
  text?: string;                  // free-text search terms
  services?: string[];            // service slugs to match
  price?: PriceRange;             // monthly band
  minFeatureCount?: number;       // includes length threshold
  featuredSlugs?: string[];       // curated priority list
  sort?: "name" | "monthlyAsc" | "monthlyDesc" | "setupAsc" | "setupDesc" | "mostPopularFirst" | "featuredThenName";
};

/* ----------------------------------------------------------------------------
 * Authoring/Generated Metadata (optional)
 * ---------------------------------------------------------------------------- */

/** Optional metadata commonly attached during build generation. */
export type BundleMeta = {
  sourceFile?: string;            // path of the authoring JSON/TS
  generatedAt?: string;           // ISO timestamp
  warnings?: string[];            // non-fatal validation notes
};

/** Bundle with attached metadata (for scripts/build output). */
export type BundleWithMeta = PackageBundle & { __meta?: BundleMeta };
