// /src/data/packages/_types/packages.types.ts
// SSOT for all package/add-on/featured types shared across every service

export type ServiceSlug = "content" | "leadgen" | "marketing" | "seo" | "webdev" | "video";
export type Tier = "Essential" | "Professional" | "Enterprise";
export type BillingModel = "one-time" | "monthly" | "hourly" | "hybrid";

export interface Price {
  setup?: number;      // numeric; format at UI
  monthly?: number;    // numeric; omit when not applicable
  notes?: string;
}

export interface FeatureItem {
  label: string;
  detail?: string;
}

export interface Package {
  id: string;                  // e.g., "seo-essential"
  service: ServiceSlug;
  name: string;
  tier: Tier;
  summary: string;
  idealFor?: string;
  outcomes: string[];
  features: FeatureItem[];
  price: Price;
  badges?: string[];
  sla?: string;
  popular?: boolean;
}

export interface AddOn {
  id: string;                  // e.g., "video-ugc-kit"
  service: ServiceSlug;
  name: string;
  description: string;
  deliverables: FeatureItem[];
  billing: BillingModel;
  price: Price;
  dependencies?: string[];
  pairsBestWith?: Tier[];
  popular?: boolean;
}

export interface FeaturedCard {
  id: string;
  service: ServiceSlug;
  packageId: string;           // must match Package.id
  headline: string;
  highlights: string[];        // 3–6 bullets
  startingAt?: number;         // numeric
  badge?: string;
  ctaLabel?: string;
}

export interface BundleModule {
  service: ServiceSlug;
  scopeSummary: string;
}

export interface IntegratedBundle {
  id: string;
  name: string;
  icp: string;
  problem: string;
  outcomes: string[];
  modules: BundleModule[];
  timelineWeeks?: number;
  price: Price;
  kpis: string[];
  faq?: { q: string; a: string }[];
  cta?: { label: string; href?: string };
  popular?: boolean;
}

// Helper types for bundle pricing tiers
export interface BundleTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  cta: { label: string; href: string };
}

export interface ServicePricing {
  kind: "tiers";
  title: string;
  subtitle: string;
  tiers: BundleTier[];
}

export interface PackageBundle {
  slug: string;
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  category: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags: string[];
  icon: string;
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
    faqs: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
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
// src/types/packages.types.ts - Add this type definition if it doesn't exist

export interface FeaturedCard {
  id: string;
  service: "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";
  packageId: string;
  headline: string;
  highlights: string[];
  startingAt: number;
  badge?: string;
  ctaLabel?: string;
}

// If you already have a packages.types.ts file, just add the FeaturedCard interface to it