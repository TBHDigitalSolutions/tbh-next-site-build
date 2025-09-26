// ============================================================================
// /src/data/packages/_types/packages.types.ts
// ----------------------------------------------------------------------------
// SSOT authoring shapes used by packages, bundles, and add-ons.
// Framework-agnostic and UI-friendly. Aligns with:
//  - No public 3-tier pricing (single public “Starting at …” price).
//  - Narrative as HTML (no MDX at runtime).
//  - Normalized includes/outcomes/faq blocks for templates/adapters.
// ============================================================================

import type { Money, ServiceSlug, Tier } from "./primitives";

/* ----------------------------------------------------------------------------
 * Common presentation blocks
 * --------------------------------------------------------------------------*/

export type FAQItem = { id?: string | number; question: string; answer: string };

export type FAQBlock = { title?: string; faqs: FAQItem[] };

export type IncludesSection = {
  title?: string;
  items: { label: string; note?: string }[];
};

export type OutcomesBlock = {
  title?: string;
  items: { label: string; value?: string }[]; // value optional for simple bullet lists
};

/**
 * Optional matrix for feature/limits display.
 * NOTE: This is NOT a public 3-tier pricing table; keep pricing single-column.
 */
export type PackagePricingMatrix = {
  columns: { id: string; label: string; note?: string }[]; // e.g., a single "Scope" column
  groups: {
    id: string;
    label: string;
    note?: string;
    rows: {
      id: string;
      label: string;
      note?: string;
      values: Record<string, unknown>; // adapter decides how to render
    }[];
  }[];
  caption?: string;
  footnotes?: string;
};

/* ----------------------------------------------------------------------------
 * Service Packages (the sellable offerings)
 * --------------------------------------------------------------------------*/

export type ServicePackage = {
  /** Stable kebab-case id; usually equals the leaf folder name. */
  id: string;
  /** If omitted, UI/adapters default slug=id. */
  slug?: string;

  /** Primary service key (e.g., "content", "leadgen"). */
  service: ServiceSlug | string;

  /** Display name for cards/detail pages. */
  name: string;

  /** Optional merchandising tier label (not used for public tier tables). */
  tier?: Tier | string;

  /** One-liner / strapline for cards & SEO. */
  summary?: string;

  /** Freeform tags for filtering/rails. Include "under-1k" when applicable. */
  tags?: string[];

  /** “Popular”, “Premium”, etc. */
  badges?: string[];

  /**
   * Public price shown as “Starting at …”.
   * Keep single-price policy: no public 3-tier tables.
   * (If you maintain internal tiers, do that in a private field outside this type.)
   */
  price: Money;

  /** Normalized content blocks */
  includes?: IncludesSection[];
  outcomes?: OutcomesBlock;
  faq?: FAQBlock;

  /** Narrative HTML fragment (single safe injection point; no MDX at runtime). */
  content?: { html: string };

  /** Optional single-column feature/limits matrix for the detail page. */
  pricingMatrix?: PackagePricingMatrix;

  /** IDs of add-ons to recommend alongside this package. */
  addOnRecommendations?: string[];

  /** Optional card/OG image. */
  cardImage?: { src: string; alt?: string };
};

/* ----------------------------------------------------------------------------
 * Bundles (curated kits of existing packages)
 * --------------------------------------------------------------------------*/

export type PackageBundle = {
  /** Stable id (often equals slug). */
  id: string;
  /** If omitted, UI/adapters default slug=id. */
  slug?: string;

  /** Optional service affinity for filtering (choose a primary if mixed). */
  service?: ServiceSlug | string;

  /** Card/hero title & supporting copy. */
  name: string;
  subtitle?: string;
  summary?: string;

  /** Public price; “compareAt” enables “You save …” UI. */
  price: Money;
  compareAt?: Money;

  /** Component packages by ID (SSOT cross-ref). */
  components: string[];

  /** Merchandising */
  badges?: string[];
  tags?: string[];

  /** Optional long-form sections (not required for all bundles). */
  includes?: IncludesSection[];
  outcomes?: OutcomesBlock;
  faq?: FAQBlock;
  content?: { html?: string };

  /** Optional media for cards/OG. */
  cardImage?: { src: string; alt?: string };
};

/* ----------------------------------------------------------------------------
 * Add-Ons (attachable upsells)
 * --------------------------------------------------------------------------*/

export type AddOn = {
  /** Stable id; kebab-case. */
  id: string;

  /** Service affinity (used for grouping/filters). */
  service?: ServiceSlug | string;

  /** Display name & optional description. */
  name: string;
  description?: string;

  /** Simple bullet list for cards/detail. */
  bullets?: string[];

  /** Public price (or omit and provide a priceNote for formulas). */
  price?: Money;

  /** Human-readable pricing hint (e.g., “+50% of base package rate”). */
  priceNote?: string;

  /** Billing hint for UIs. */
  billing?: "one-time" | "monthly" | "hybrid";

  /** Merchandising & targeting */
  popular?: boolean;
  tags?: string[];

  /**
   * Recommendations: package IDs, tags, or tier labels this add-on pairs well with.
   * (Adapters may resolve these into chips/links.)
   */
  pairsBestWith?: string[];
};
