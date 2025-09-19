// src/types/servicesTemplate.types.ts
/**
 * Services Template Types - Production Ready
 * ==========================================
 * 
 * LEVEL RULES (enforced at compile time):
 * - Level 1 (Hub):       🚫 No pricing (pricing?: never)
 * - Level 2 (Service):   ✅ Full pricing via adapters (tiers/range/custom)
 * - Level 3 (SubService): ✅ Callout only (included/addon/custom)
 * 
 * Single source of truth for all service page templates.
 * UI-agnostic types - no component imports to avoid circular dependencies.
 */

// ================================================================
// Primitives
// ================================================================

export type Slug = string & { readonly __brand?: "Slug" };
export type RoutePath = `/${string}`;

/** CTA structure used across all levels */
export interface CTA {
  label: string;
  href: string;
  ariaLabel?: string;
  target?: "_self" | "_blank";
  rel?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

// ================================================================
// Hero System (Canonical)
// ================================================================

/** Hero background media types */
export type HeroBackground = 
  | {
      type: "image";
      src: string;
      alt?: string;
    }
  | {
      type: "video";
      src: string;
      poster?: string;
      fallback?: string;
      autoPlay?: boolean;
      muted?: boolean;
      loop?: boolean;
    };

/** Canonical hero data structure (nested) */
export interface ServiceHeroData {
  id?: string;
  background?: HeroBackground;
  content: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    primaryCta?: CTA;
    secondaryCta?: CTA;
    badges?: Array<{
      id: string;
      label: string;
      icon?: string;
    }>;
  };
}

/** Component props that ServiceHero expects */
export interface ServiceHeroProps {
  title: string;
  subtitle?: string;
  media?: HeroBackground;
  button?: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
  secondaryButton?: {
    text: string;
    href: string;
    ariaLabel?: string;
  };
}

/** Adapter function signature */
export type ToServiceHeroProps = (hero: ServiceHeroData) => ServiceHeroProps;

// ================================================================
// Content Blocks
// ================================================================

/** Two-column intro/video section */
export interface TwoColVideoBlock {
  id?: string;
  title?: string;
  description?: string;
  video?: {
    src: string;
    poster?: string;
    autoPlay?: boolean;
    loop?: boolean;
    muted?: boolean;
  };
  image?: {
    src: string;
    alt?: string;
  };
  cta?: CTA;
}

/** Services & Capabilities section */
export interface CapabilityBullet {
  label: string;
  href?: string;
  icon?: string;
}

export interface CapabilityPillar {
  id: string;
  title: string;
  description?: string;
  deliverables?: string[];
  icon?: string;
}

export interface CapabilitiesBlock {
  title?: string;
  subtitle?: string;
  description?: string;
  chips?: string[];
  bullets?: CapabilityBullet[];
  pillars?: CapabilityPillar[];
  ctas?: {
    primary?: CTA;
    secondary?: CTA;
  };
}

/** Service cards grid */
export interface ServiceCardItem {
  id?: string;
  title: string;
  description?: string;
  href: string;
  icon?: string;
  highlights?: string[];
  features?: string[];
}

export interface ServiceCardsBlock {
  title?: string;
  subtitle?: string;
  items: ServiceCardItem[];
}

/** Modules carousel/grid (used by hubs) */
export type ModuleKind =
  | "case-studies" | "portfolio" | "video-portfolio" | "icp" | "playbook"
  | "editorial" | "audit" | "pricing" | "contact" | "booking" | "blog"
  | "video" | "custom";

export interface ModuleCardItem {
  id?: string;
  kind?: ModuleKind;
  title: string;
  description?: string;
  href: string;
  badge?: string;
  icon?: string;
  image?: {
    src: string;
    alt?: string;
  };
  cta?: {
    label: string;
    ariaLabel?: string;
  };
}

export interface ModulesSectionData {
  title?: string;
  subtitle?: string;
  items: ModuleCardItem[];
  layout?: "carousel" | "grid";
}

// ================================================================
// Pricing System (Level-Specific)
// ================================================================

/** Level 2 (Service) - Pricing tier for full pricing tables */
export interface PricingTier {
  id: string;
  name: string;
  price: number | string;
  period?: "one-time" | "monthly" | "quarterly" | "yearly";
  originalPrice?: number | string;
  priceNote?: string;
  features?: string[];
  badge?: string;
  highlighted?: boolean;
  cta?: CTA;
}

/** Level 2 (Service) - Comparison table for detailed feature comparison */
export interface ComparisonRow {
  feature: string;
  values: Array<boolean | string | number | null>;
}

export interface ComparisonTableData {
  title?: string;
  subtitle?: string;
  columns: string[];
  rows: ComparisonRow[];
  footerNote?: string;
}

/** Level 2 (Service) - Union type for different pricing models */
export type ServicePricing =
  | {
      kind: "tiers";
      title?: string;
      subtitle?: string;
      tiers: PricingTier[];
      comparison?: ComparisonTableData;
      notes?: string[];
    }
  | {
      kind: "range";
      title?: string;
      subtitle?: string;
      startingAt?: number | string;
      range?: {
        min?: number | string;
        max?: number | string;
        note?: string;
      };
      bullets?: string[];
      notes?: string[];
    }
  | {
      kind: "custom";
      title?: string;
      subtitle?: string;
      note: string;
      cta?: CTA;
      notes?: string[];
    };

/** Level 3 (SubService) - Simple pricing callout only */
export type PricingCalloutVariant = "included" | "addon" | "custom";

export interface SubServicePricingCallout {
  variant: PricingCalloutVariant;
  label?: string;
  amount?: number | string;
  note?: string;
  cta?: CTA;
}

// ================================================================
// Content Sections (Shared)
// ================================================================

/** Portfolio/case studies */
export interface PortfolioItem {
  id?: string;
  title?: string;
  image?: string;
  href?: RoutePath | string;
  tags?: string[];
  blurb?: string;
}

export interface PortfolioBlock {
  title?: string;
  subtitle?: string;
  items: PortfolioItem[];
  displayLimit?: number;
}

/** Testimonials */
export interface TestimonialItem {
  id?: string;
  author?: string;
  company?: string;
  quote: string;
  avatar?: string;
  rating?: number;
}

export interface TestimonialsBlock {
  title?: string;
  subtitle?: string;
  data: TestimonialItem[];
  displayLimit?: number;
}

/** FAQ */
export interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
  tags?: string[];
}

export interface FAQBlock {
  title?: string;
  subtitle?: string;
  faqs: FAQItem[];
  categories?: string[];
  searchPlaceholder?: string;
}

/** CTA Section */
export interface CTASectionBlock {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCta: CTA;
  secondaryCta?: CTA;
  layout?: "centered" | "split";
  backgroundType?: "gradient" | "surface" | "transparent";
  backgroundColor?: string;
  trustElements?: string[];
}

/** SEO metadata */
export interface SEOMeta {
  title?: string;
  description?: string;
  canonical?: RoutePath | string;
  keywords?: string[];
}

// ================================================================
// Workflow & Process (Level 3 Specific)
// ================================================================

export type WorkflowVariant = "timeline" | "flow" | "diagram";

export interface WorkflowStep {
  title: string;
  description?: string;
  duration?: string;
  deliverables?: string[];
}

export interface WorkflowData {
  title?: string;
  variant?: WorkflowVariant;
  steps: WorkflowStep[];
}

export interface ScopeData {
  title?: string;
  description?: string;
  includes?: string[];
  deliverables?: string[];
  addons?: string[];
}

export interface ResultsItem {
  label: string;
  value: string;
  sublabel?: string;
  icon?: string;
}

export interface ResultsData {
  title?: string;
  subtitle?: string;
  description?: string;
  items: ResultsItem[];
  variant?: "stats" | "results";
}

// ================================================================
// Page Template Data (Level-Enforced)
// ================================================================

/** Base page data shared by all levels */
export interface BaseServicePageData {
  kind: "hub" | "service" | "subservice";
  slug: Slug;
  path: RoutePath;
  title: string;
  label?: string;
  hero: ServiceHeroData;
  sections?: Record<string, unknown>;
  seo?: SEOMeta;
}

/** Level 1 - Hub (NO pricing allowed) */
export interface HubTemplateData extends Omit<BaseServicePageData, "kind"> {
  kind: "hub";
  pricing?: never; // 🔒 Compile-time block
  capabilities?: CapabilitiesBlock;
  serviceCards?: ServiceCardsBlock;
  modules?: ModulesSectionData;
  portfolio?: PortfolioBlock;
  testimonials?: TestimonialsBlock;
  faq?: FAQBlock;
  carousel?: {
    title?: string;
    subtitle?: string;
    items?: PortfolioItem[];
  };
  cta?: CTASectionBlock;
}

/** Level 2 - Service (Full pricing allowed) */
export interface ServiceTemplateData extends Omit<BaseServicePageData, "kind"> {
  kind: "service";
  twoColVideo?: TwoColVideoBlock;
  capabilities?: CapabilitiesBlock;
  serviceCards?: ServiceCardsBlock;
  pricing?: ServicePricing; // ✅ Full pricing via adapters
  portfolio?: PortfolioBlock;
  testimonials?: TestimonialsBlock;
  faq?: FAQBlock;
  carousel?: {
    title?: string;
    subtitle?: string;
    items?: PortfolioItem[];
  };
  cta?: CTASectionBlock;
}

/** Level 3 - SubService (Callout only) */
export interface SubServiceTemplateData extends Omit<BaseServicePageData, "kind"> {
  kind: "subservice";
  twoColVideo?: TwoColVideoBlock;
  capabilities?: CapabilitiesBlock;
  workflow?: WorkflowData;
  scope?: ScopeData;
  results?: ResultsData;
  pricing?: SubServicePricingCallout; // ✅ Callout only
  /** @deprecated Use pricing field instead */
  pricingCallout?: SubServicePricingCallout;
  comparison?: ComparisonTableData;
  portfolio?: PortfolioBlock;
  testimonials?: TestimonialsBlock;
  faq?: FAQBlock;
  cta?: CTASectionBlock;
}

/** Union type for any service page data */
export type AnyServicePageData = 
  | HubTemplateData 
  | ServiceTemplateData 
  | SubServiceTemplateData;

// ================================================================
// Type Guards & Utilities
// ================================================================

export function isHubPage(data: AnyServicePageData): data is HubTemplateData {
  return data.kind === "hub";
}

export function isServicePage(data: AnyServicePageData): data is ServiceTemplateData {
  return data.kind === "service";
}

export function isSubServicePage(data: AnyServicePageData): data is SubServiceTemplateData {
  return data.kind === "subservice";
}

export function hasTiers(pricing?: ServicePricing): pricing is Extract<ServicePricing, { kind: "tiers" }> {
  return Boolean(pricing && (pricing as any).kind === "tiers" && Array.isArray((pricing as any).tiers));
}

export function hasRange(pricing?: ServicePricing): pricing is Extract<ServicePricing, { kind: "range" }> {
  return Boolean(pricing && (pricing as any).kind === "range" && ((pricing as any).startingAt || (pricing as any).range));
}

export function hasCustomPricing(pricing?: ServicePricing): pricing is Extract<ServicePricing, { kind: "custom" }> {
  return Boolean(pricing && (pricing as any).kind === "custom" && (pricing as any).note);
}