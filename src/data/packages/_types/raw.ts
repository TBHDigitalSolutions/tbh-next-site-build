// ============================================================================
// /src/data/packages/_types/raw.ts  (shapes of the provided JSON files)
// ============================================================================
import type { BillingModel, FeatureItem, ServiceSlug, Tier } from "./primitives";

// src/data/packages/addOns.json items
export type RawAddOnJson = {
  slug: string; // will normalize to AddOn.id
  service: ServiceSlug;
  name: string;
  description: string;
  deliverables?: FeatureItem[];
  billing?: BillingModel | "hybrid" | "one-time" | "monthly"; // tolerant
  price?: { setup?: number; monthly?: number; currency?: "USD"; notes?: string };
  pairsBestWith?: Tier[];
  dependencies?: string[] | string; // tolerate string notes
  popular?: boolean;
  category?: string;
  tags?: string[];
};

// src/data/packages/bundles.json items
export type RawBundleJson = {
  slug: string;
  title: string;
  subtitle?: string;
  summary?: string;
  category?: "startup" | "local" | "ecommerce" | "b2b" | "custom";
  tags?: string[];
};

// src/data/packages/featured.json
export type RawFeaturedJson = {
  slugs: string[]; // featured bundle slugs
  serviceFeaturedSlugs?: string[]; // curated service rails ids
};

// service packages JSON (the large catalog you provided)
export type RawServicePackageJson = {
  id: string;
  service: ServiceSlug;
  name: string;
  tier?: Tier;
  summary?: string;
  idealFor?: string;
  outcomes?: string[];
  features?: FeatureItem[];
  price?: { setup?: number; monthly?: number; currency?: "USD"; notes?: string };
  badges?: string[];
  sla?: string;
  popular?: boolean;
  tags?: string[];
  category?: string;
};

// MDX front-matter for /src/content/packages/bundles/<slug>.mdx
export type BundleMdxFrontmatter = {
  slug: string; // must match bundle.slug
  lede?: string;
  image?: { src: string; alt?: string };
  seo?: { title?: string; description?: string };
};

