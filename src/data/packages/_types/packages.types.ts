// /src/data/packages/_types/packages.types.ts
// SSOT type definitions for packages, add-ons, featured cards, and bundles.
// These types are for the data layer only — keep them framework-agnostic.

/** Canonical service slugs for data classification. */
export type ServiceSlug =
  | "content"
  | "leadgen"
  | "marketing"
  | "seo"
  | "webdev"
  | "video";

/** Standard merchandising tiers. */
export type Tier = "Essential" | "Professional" | "Enterprise";

/** Billing model taxonomy for add-ons and modules. */
export type BillingModel = "one-time" | "monthly" | "hourly" | "hybrid";

/** Numeric price primitives; format in UI with currency helpers. */
export interface Price {
  /** One-time/setup charge (numeric; UI formats it). */
  setup?: number;
  /** Monthly recurring charge (numeric; UI formats it). */
  monthly?: number;
  /** Optional clarifying note (e.g., “per location”). */
  notes?: string;
}

/** A feature/deliverable row, optionally with a short detail. */
export interface FeatureItem {
  label: string;
  detail?: string;
}

/** Core package definition used across services. */
export interface Package {
  /** Stable id, e.g., "seo-essential". */
  id: string;
  service: ServiceSlug;
  name: string;
  tier: Tier;
  /** Short, scannable summary for cards. */
  summary: string;
  /** Optional ICP hint (e.g., “single-location”). */
  idealFor?: string;
  /** Expected outcomes/value statements. */
  outcomes: string[];
  /** What’s included. */
  features: FeatureItem[];
  /** Pricing for this package (setup/monthly). */
  price: Price;
  /** Visual or merchandising badges. */
  badges?: string[];
  /** Optional timeline/SLA copy. */
  sla?: string;
  /** Emphasize as popular in UI. */
  popular?: boolean;
}

/** Add-on (attachable to packages). */
export interface AddOn {
  id: string; // e.g., "video-ugc-kit"
  service: ServiceSlug;
  name: string;
  description: string;
  /** Deliverables list. */
  deliverables: FeatureItem[];
  /** Billing model taxonomy. */
  billing: BillingModel;
  /** Pricing (can be partial for custom quotes). */
  price: Price;
  /** Other add-ons/packages required first. */
  dependencies?: string[];
  /** Suggested package tiers to pair with. */
  pairsBestWith?: Tier[];
  /** Emphasize as popular in UI. */
  popular?: boolean;
}

/** Featured card used for home/section highlights. */
export interface FeaturedCard {
  id: string;
  service: ServiceSlug;
  /** Must reference an existing Package.id. */
  packageId: string;
  /** Short headline (card title). */
  headline: string;
  /** 3–6 concise bullets. */
  highlights: string[];
  /** Optional “starting at” amount (numeric). */
  startingAt?: number;
  /** Optional badge label (e.g., “Most Popular”). */
  badge?: string;
  /** Optional CTA label override. */
  ctaLabel?: string;
}

/** A module within an integrated bundle. */
export interface BundleModule {
  service: ServiceSlug;
  /** Short description of what the module covers. */
  scopeSummary: string;
}

/** A multi-service integrated bundle (solution). */
export interface IntegratedBundle {
  id: string;
  name: string;
  /** Ideal customer profile descriptor. */
  icp: string;
  /** Problem statement the bundle solves. */
  problem: string;
  outcomes: string[];
  modules: BundleModule[];
  /** Estimated timeline (weeks). */
  timelineWeeks?: number;
  price: Price;
  /** KPIs to track for this bundle. */
  kpis: string[];
  /** Optional FAQs. */
  faq?: { q: string; a: string }[];
  /** Bundle-level CTA. */
  cta?: { label: string; href?: string };
  /** Merchandising flag. */
  popular?: boolean;
}

/** A tier row for service pricing tables. */
export interface BundleTier {
  id: string;
  name: string;
  price: string;   // preformatted string for display (e.g., "$2,500/mo")
  period: string;  // e.g., "Monthly", "One-time"
  features: string[];
  badge?: string;
  cta: { label: string; href: string };
}

/** Pricing model container (can be extended with future kinds) */
export interface ServicePricing {
  kind: "tiers";
  title: string;
  subtitle: string;
  tiers: BundleTier[];
}

/**
 * Rich, page-ready bundle for marketing pages.
 * This is separate from app/lib types and used by data-driven pages.
 */
export interface PackageBundle {
  slug: string;        // URL slug for the bundle
  id: string;          // internal id (can mirror slug)
  title: string;       // hero/card title
  subtitle: string;    // hero subtitle
  summary: string;     // short card summary
  category: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags: string[];      // freeform tags for filtering
  icon: string;        // icon key/name
  cardImage: {
    src: string;
    alt: string;
  };
  hero: {
    content: {
      title: string;
      subtitle: string;
      primaryCta: { label: string; href: string };
      secondaryCta: { label: string; href: string };
    };
    background: { type: "image"; src: string; alt: string };
  };
  /** Human-readable list of services involved. */
  includedServices: string[];
  /** 3–6 bullets for quick scan. */
  highlights: string[];
  /** Stats-style outcomes block. */
  outcomes: {
    title: string;
    variant: "stats";
    items: Array<{ label: string; value: string }>;
  };
  /** Pricing presentation model (tiers, etc.). */
  pricing: ServicePricing;
  /** FAQs for the package page. */
  faq: {
    title: string;
    faqs: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  };
  /** Page CTA section config. */
  cta: {
    title: string;
    subtitle?: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    layout: "centered";
    backgroundType: "gradient";
  };
}