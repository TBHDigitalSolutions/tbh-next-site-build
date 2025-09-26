// ============================================================================
// /src/data/packages/_types/domain.ts
// ----------------------------------------------------------------------------
// Canonical SSOT entities for the Packages domain.
// - No MDX: long-form narrative is compiled HTML strings.
// - Public pricing policy: one “Starting at …” price per package.
// - Optional _internal tiers allowed, but UI must not read them.
// - Bundles are curated sets of existing ServicePackage IDs.
// - Works across service-scoped bundles and cross-service (Growth) bundles.
// ============================================================================

import type {
  BillingModel,
  FeatureItem,
  Money,
  PriceMeta,
  ServiceSlug,
  Tier,
} from "./primitives";

/* ----------------------------------------------------------------------------
 * Common supporting shapes (presentation-safe, UI-agnostic)
 * --------------------------------------------------------------------------*/

export type ImageRef = { src: string; alt?: string };

export type IncludeItem = { label: string; note?: string };
export type IncludesSection = { title?: string; items: IncludeItem[] };

export type OutcomeItem = { label: string; value?: string };
export type OutcomesBlock = { title?: string; items: OutcomeItem[] };

export type FAQItem = { id?: string | number; question: string; answer: string };
export type FAQBlock = { title?: string; faqs: FAQItem[] };

// Minimal matrix typing to avoid importing UI component types.
// If present, adapters/templates should verify shape at runtime.
export type MinimalPricingMatrix = {
  columns: unknown[];
  groups: unknown[];
};

export type GrowthCategory = "startup" | "local" | "ecommerce" | "b2b" | "custom";

/* ----------------------------------------------------------------------------
 * ServicePackage (the sellable unit)
 * --------------------------------------------------------------------------*/
/**
 * A single offering the client can buy. One public price only.
 * Narrative lives in `content.html`. Optional `_internal` allows
 * private pricing tiers for quoting/CRM; UI must ignore them.
 */
export interface ServicePackage {
  /** Kebab-case unique ID; also used as default slug. */
  id: string; // e.g., "content-design-professional"

  /** Canonical service namespace (e.g., "content", "leadgen", "marketing", "seo", "webdev", "video"). */
  service: ServiceSlug;

  /** Optional route/display slug; defaults to `id` when omitted. */
  slug?: string;

  /** Human-readable package name. */
  name: string;

  /** Optional tier label (kept for taxonomy/search; not for public tier tables). */
  tier?: Tier;

  /** Short marketing line for cards/heroes. */
  summary?: string;

  /** Arbitrary tags for filtering (e.g., "under-1k"). */
  tags?: string[];

  /** Small presentational badges (e.g., "Best Value"). */
  badges?: string[];

  /** Public “Starting at …” price (monthly and/or one-time). */
  price: Money;

  /** Optional richer structure for includes/outcomes/faq/narrative. */
  includes?: IncludesSection[];
  outcomes?: OutcomesBlock;
  faq?: FAQBlock;
  content?: { html: string };

  /** Optional pricing matrix (single-column usage preferred per policy). */
  pricingMatrix?: MinimalPricingMatrix;

  /** Optional add-on IDs to recommend on the detail page. */
  addOnRecommendations?: string[];

  /** Optional image for cards/OG. */
  cardImage?: ImageRef;

  /**
   * Internal-only fields not consumed by public UI.
   * Use to preserve legacy 3-tier quotes (Starter/Pro/Enterprise).
   */
  _internal?: {
    pricing?: {
      tiers: Array<{
        name: "Starter" | "Professional" | "Enterprise" | string;
        price: Money;
        note?: string;
      }>;
    };
    notes?: string;
  };
}

/* ----------------------------------------------------------------------------
 * AddOn (attachable upsell)
 * --------------------------------------------------------------------------*/
export interface AddOn {
  /** Kebab-case unique ID. */
  id: string;

  /** Primary service affinity (for filtering/rails). */
  service?: ServiceSlug;

  name: string;
  description?: string;

  /** Optional structured bullets/deliverables for detail cards. */
  deliverables?: FeatureItem[];

  /** Billing model (one-time, monthly, or hybrid). */
  billing?: BillingModel;

  /** Optional explicit price. Use `priceNote` when formula-based. */
  price?: Money;

  /** Freeform note for price formulas (e.g., “+50% of base package”). */
  priceNote?: string;

  /** Dependency hints (IDs or human notes). */
  dependencies?: string[];

  /** “Pairs best with …” hints (tiers, package IDs, or tags). */
  pairsBestWith?: string[];

  /** Presentation sugar. */
  badges?: string[];
  popular?: boolean;
  tags?: string[];
  category?: string;
}

/* ----------------------------------------------------------------------------
 * Bundle (curated kit of ServicePackage IDs)
 * --------------------------------------------------------------------------*/
/**
 * A curated set of existing packages sold together.
 * Used for service-scoped bundles (e.g., Content Growth) and
 * cross-service Growth bundles (e.g., Digital Transformation Starter).
 */
export interface Bundle {
  /** Route/display slug; defaults to `id` when omitted. */
  slug?: string;

  /** Kebab-case unique ID; prefer “bundle-…” prefix for clarity. */
  id: string;

  /** Primary service for filtering (optional for cross-service bundles). */
  service?: ServiceSlug;

  /** Human-readable bundle name (preferred). */
  name: string;

  /** Optional legacy alias (kept for back-compat of older datasets). */
  /** @deprecated Use `name`. */
  title?: string;

  /** Short supporting line. */
  subtitle?: string;

  /** Longer description for cards/detail. */
  summary?: string;

  /** Public bundle price. Use `compareAt` to power “You save …” UI. */
  price: Money;
  compareAt?: Money;

  /** IDs of ServicePackages that compose this bundle. */
  components: string[];

  /** Optional category used by storefront sorting/rails. */
  category?: GrowthCategory;

  /** Presentation sugar. */
  badges?: string[];
  tags?: string[];
  cardImage?: ImageRef;

  /** Optional long-form narrative and FAQ. */
  includes?: IncludesSection[];
  outcomes?: OutcomesBlock;
  faq?: FAQBlock;
  content?: { html?: string };

  /** Optional recommendations for upsells. */
  addOnRecommendations?: string[];

  /** Optional list of service namespaces involved (for discovery/reco). */
  services?: ServiceSlug[];

  /** Optional pricing matrix (generally unused for public display). */
  pricingMatrix?: MinimalPricingMatrix;
}

/* ----------------------------------------------------------------------------
 * PackageBundle (presentation-friendly view for legacy bridges)
 * --------------------------------------------------------------------------*/
/**
 * A slimmer, presentation-oriented view retained for bridge/adapters that
 * expect “title/summary/category/tags”. Prefer using `Bundle` in new code.
 */
export interface PackageBundle {
  slug: string;
  id: string;

  /** For bridges that expect `title`; adapters can map from `name`. */
  title: string;

  subtitle: string;
  summary: string;

  /** Category is kept as GrowthCategory for storefront grouping. */
  category: GrowthCategory;

  tags: string[];

  icon?: string;
  cardImage?: ImageRef;

  /** Optional hero hints for certain templates. */
  hero?: {
    content?: {
      title?: string;
      subtitle?: string;
      primaryCta?: { label: string; href: string };
      secondaryCta?: { label: string; href: string };
    };
    background?: { type: "image"; src: string; alt?: string };
  };

  /** Optional sections used by some rails/pages. */
  includedServices?: string[];
  highlights?: string[];
  outcomes?: {
    title?: string;
    variant?: "stats";
    items: Array<{ label: string; value: string }>;
  };

  /** Presentation-only tier blocks (avoid for new public pages). */
  pricing?: {
    kind: "tiers";
    title: string;
    subtitle: string;
    tiers: Array<{
      id: string;
      name: string;
      price: string; // preformatted, presentation-only
      period: string; // "Monthly" | "One-time"
      features: string[];
      badge?: string;
      cta: { label: string; href: string };
    }>;
  };

  faq?: FAQBlock;

  cta?: {
    title: string;
    subtitle?: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    layout?: "centered";
    backgroundType?: "gradient";
  };
}
