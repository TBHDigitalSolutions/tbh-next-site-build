// src/packages/lib/types.ts
// Domain type system for the Packages module. Framework-agnostic and import-safe.
// Keep this file free of runtime code and React-specific types.

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
export type Price = {
  oneTime?: number;
  monthly?: number;
  currency?: CurrencyCode;
};

/** A named section of included deliverables for a package. */
export type PackageInclude = {
  section: string;        // e.g., "Setup", "Ongoing"
  items: string[];        // bullet list items
};

/**
 * A sellable package/bundle. This is the primary SSOT entity.
 */
export type PackageBundle = {
  slug: Slug;             // e.g., "local-lead-capture"
  name: string;           // marketing display name
  description: string;    // concise value prop
  price: Price;           // pricing structure

  /** One or more canonical service slugs this bundle belongs to. */
  services?: string[];    // e.g., ["seo-services", "lead-generation"]

  /** Structured inclusions grouped by section. */
  includes: PackageInclude[];

  /** Optional related add-on slugs that pair well with this bundle. */
  addOnSlugs?: Slug[];

  /** Audience hints for merchandising or recommendations. */
  idealFor?: string[];    // e.g., ["single-location", "professional services"]

  /** Typical onboarding range (display copy, not a machine-enforced SLA). */
  timeline?: string;      // e.g., "3–6 weeks"

  /** Whether to emphasize in UI as a top pick. */
  isMostPopular?: boolean;
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

/* ----------------------------------------------------------------------------
 * Define shared, documented types (used by base/card/details mappers and components)
 * **Acceptance**
 *   - All downstream imports compile.
 *   - No circular deps.
 * ---------------------------------------------------------------------------- */
export type Money = { monthly?: number; oneTime?: number; currency: "USD" | string };

export type BandVariant =
  | "detail-hybrid"
  | "card-hybrid"
  | "detail-oneTime"
  | "card-oneTime";

export type PriceBandCopy = {
  /** Optional marketing line shown ONLY on details. Never falls back to summary. */
  tagline?: string;
  /** Base note selector: "proposal" → “Base price — request proposal”, "final" → “… final after scope” */
  baseNote?: "proposal" | "final";
  /** Additional microcopy for details: e.g., “3-month minimum • + ad spend” */
  finePrint?: string;
  /** Derived from price shape if not supplied */
  variantOverride?: BandVariant;
};

export type PackageIdentity = {
  id: string;
  slug: string;
  service: "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";
  name: string;
  summary?: string;
  // … other core metadata
};

export type PackagePricing = {
  price: Money;
  priceBand?: PriceBandCopy; // NEW: explicit band copy container
};