// /src/data/packages/_types/packages.types.ts
// SSOT type definitions for packages, add-ons, featured, and bundles.
// Framework-agnostic: no React/Next imports. These are the *authoring* shapes.

// ===== Shared primitives =====================================================

/** Canonical service slugs used across the domain. */
export type ServiceSlug =
  | "content"
  | "leadgen"
  | "marketing"
  | "seo"
  | "webdev"
  | "video";

/** Standard merchandising tiers (per service). */
export type Tier = "Essential" | "Professional" | "Enterprise";

/** Canonical money model (replaces legacy `setup`). */
export type Money = {
  /** One-time charge (AKA setup/project). */
  oneTime?: number;
  /** Monthly recurring charge (retainer). */
  monthly?: number;
  /** ISO code; defaults to "USD" in consumers when omitted. */
  currency?: "USD";
};

/** Optional display/contract metadata shown near prices. */
export type PriceMeta = {
  /** Short note near price: "+ ad spend", "starting at", etc. */
  note?: string;
  /** Minimum commitment in months (e.g., 3, 6, 12). */
  minTermMonths?: number;
  /** Display hint when setup is waived after N months. */
  setupWaivedAfterMonths?: number;
  /** Optional internal discount (%); never auto-applied in UI. */
  discountPercent?: number;
};

/** Simple deliverable/feature row. */
export interface FeatureItem {
  label: string;
  detail?: string;
}

// ===== Core authoring entities ==============================================

/** Per-service package (tiered offering). */
export interface ServicePackage {
  /** Stable id, kebab-case, service-prefixed; e.g., "seo-professional". */
  id: string;
  service: ServiceSlug;
  name: string;
  /** Tier is common but not strictly required for specialized packs. */
  tier?: Tier;
  /** One-liner for cards/search. */
  summary?: string;
  /** Bulleted deliverables/specs. */
  features?: FeatureItem[];
  /** Pricing is optional (custom/enterprise packages may omit it). */
  price?: Money;
  /** Optional pricing display/meta. */
  priceMeta?: PriceMeta;
  /** Merchandising aids. */
  badges?: string[];
  tags?: string[];
  /** Optional grouping/category key. */
  category?: string;
  /** Optional SLA/timeline string. */
  sla?: string;
  /** Weigh as “Popular” in rails/search. */
  popular?: boolean;
}

/** Add-on (a-la-carte, attachable to ServicePackages). */
export interface AddOn {
  /** e.g., "video-ugc-kit". */
  id: string;
  service: ServiceSlug;
  name: string;
  description: string;
  /** Deliverables list. */
  deliverables: FeatureItem[];
  /** Optional price (custom add-ons can omit). */
  price?: Money;
  /** Optional pricing display/meta. */
  priceMeta?: PriceMeta;
  /** Dependencies by id (package/add-on). */
  dependencies?: string[];
  /** Suggested package tiers this pairs best with. */
  pairsBestWith?: Tier[];
  /** Merchandising */
  badges?: string[];
  popular?: boolean;
  tags?: string[];
}

/** Lightweight featured card used across service hubs/rails. */
export interface FeaturedCard {
  id: string;
  service: ServiceSlug;
  /** Must reference an existing `ServicePackage.id`. */
  packageId: string;
  /** Card headline. */
  headline: string;
  /** 3–6 bullets. */
  highlights: string[];
  /** Optional “starting at” amount (numeric). */
  startingAt?: number;
  /** Optional label like “Most Popular”. */
  badge?: string;
  /** CTA label override. */
  ctaLabel?: string;
}

// ===== Bundles (cross-service solutions) ====================================

/** Optional grouped “what’s included” section. */
export type IncludeGroup = { title?: string; items: string[] };

/** A multi-service integrated bundle resolved at build-time into the façade. */
export interface Bundle {
  /** Page slug; e.g., "local-business-growth". */
  slug: string;
  /** Internal id (may mirror slug). */
  id: string;

  // Hero/card basics
  title: string;
  subtitle?: string;
  summary?: string;
  tags?: string[];
  category?: "startup" | "local" | "ecommerce" | "b2b" | "custom";

  // Pricing (optional)
  price?: Money;
  priceMeta?: PriceMeta;

  // Composition & presentation
  /** Optional “what’s included” prose groups for quick scan. */
  includes?: IncludeGroup[];
  /** IDs of service packages included in the bundle. */
  components?: string[];
  /** IDs of recommended add-ons to pair with this bundle. */
  addOnRecommendations?: string[];

  // Outcomes & timeline
  outcomes?: Array<{ label: string; value: string }>;
  timeline?: string;

  // FAQ (page-ready)
  faq?: { title?: string; faqs: Array<{ id: string; question: string; answer: string }> };

  // Optional media for hero/card; MDX may also supply this via front-matter.
  hero?: {
    content?: {
      title?: string;
      subtitle?: string;
      primaryCta?: { label: string; href: string };
      secondaryCta?: { label: string; href: string };
    };
    background?: { type: "image" | "video"; src: string; alt?: string };
  };
  cardImage?: { src: string; alt?: string };

  /** Merchandising hint used by rails/search. */
  popular?: boolean;
}

// ===== Presentation-only (kept for existing pages) ==========================

/** A tier row for on-page pricing tables (preformatted strings). */
export interface BundleTier {
  id: string;
  name: string;
  /** Preformatted “$X/month” or “$Y one-time” string for UI. */
  price: string;
  period: string; // e.g., "Monthly", "One-time"
  features: string[];
  badge?: string;
  cta: { label: string; href: string };
}

/** Pricing presentation model for bundle page templates. */
export interface ServicePricing {
  kind: "tiers";
  title: string;
  subtitle: string;
  tiers: BundleTier[];
}

/** Legacy/lib-compatible marketing bundle for page templates. */
export interface PackageBundle {
  slug: string;
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  category: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags: string[];
  icon: string;
  cardImage: { src: string; alt: string };
  hero: {
    content: {
      title: string;
      subtitle: string;
      primaryCta: { label: string; href: string };
      secondaryCta: { label: string; href: string };
    };
    background: { type: "image"; src: string; alt: string };
  };
  includedServices: string[];
  highlights: string[];
  outcomes: {
    title: string;
    variant: "stats";
    items: Array<{ label: string; value: string }>;
  };
  pricing: ServicePricing;
  faq: {
    title: string;
    faqs: Array<{ id: string; question: string; answer: string }>;
  };
  cta: {
    title: string;
    subtitle?: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    layout: "centered";
    backgroundType: "gradient";
  };
}
