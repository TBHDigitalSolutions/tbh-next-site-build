// ============================================================================
// /src/data/packages/_types/domain.ts  (canonical SSOT entities)
// ============================================================================
import type { BillingModel, FeatureItem, Money, PriceMeta, ServiceSlug, Tier } from "./primitives";

export interface ServicePackage {
  id: string; // e.g., "seo-professional"
  service: ServiceSlug;
  name: string;
  tier?: Tier;
  summary?: string;
  idealFor?: string;
  outcomes?: string[];
  features?: FeatureItem[];
  price?: Money;
  priceMeta?: PriceMeta;
  badges?: string[];
  tags?: string[];
  category?: string;
  sla?: string;
  popular?: boolean;
}

export interface AddOn {
  id: string; // normalized from JSON slug
  service: ServiceSlug;
  name: string;
  description: string;
  deliverables?: FeatureItem[];
  billing?: BillingModel; // optional taxonomy from JSON
  price?: Money;
  priceMeta?: PriceMeta; // derived from JSON price.notes
  dependencies?: string[]; // ids/notes
  pairsBestWith?: Tier[];
  badges?: string[];
  popular?: boolean;
  tags?: string[];
  category?: string;
}

export type IncludeGroup = { title?: string; items: string[] };

export interface Bundle {
  slug: string; // page slug
  id: string; // mirrors slug or internal id
  title: string;
  subtitle?: string;
  summary?: string;
  tags?: string[];
  category?: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  price?: Money;
  priceMeta?: PriceMeta;
  includes?: IncludeGroup[];
  components?: string[]; // package ids included
  addOnRecommendations?: string[]; // add-on ids
  outcomes?: Array<{ label: string; value: string }>;
  timeline?: string;
  faq?: { title?: string; faqs: Array<{ id: string; question: string; answer: string }> };
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
  popular?: boolean;
}

// Presentation-only (kept for legacy templates)
export interface BundleTier {
  id: string;
  name: string;
  price: string; // preformatted text (e.g., "$2,500/mo")
  period: string; // "Monthly" | "One-time"
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

export interface PackageBundle { // legacy/lib-compatible presentation model
  slug: string;
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  category: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags: string[];
  icon?: string;
  cardImage?: { src: string; alt: string };
  hero?: {
    content?: {
      title?: string;
      subtitle?: string;
      primaryCta?: { label: string; href: string };
      secondaryCta?: { label: string; href: string };
    };
    background?: { type: "image"; src: string; alt?: string };
  };
  includedServices?: string[];
  highlights?: string[];
  outcomes?: { title?: string; variant?: "stats"; items: Array<{ label: string; value: string }> };
  pricing?: ServicePricing;
  faq?: { title?: string; faqs: Array<{ id: string; question: string; answer: string }> };
  cta?: {
    title: string;
    subtitle?: string;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
    layout?: "centered";
    backgroundType?: "gradient";
  };
}

