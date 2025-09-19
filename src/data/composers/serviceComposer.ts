// src/data/composers/serviceComposer.ts
import type {
  Breadcrumbs,
  ServiceNode,
  SubServiceNode,
} from "@/types/servicesTaxonomy.types";
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";
import {
  buildBreadcrumbs,
  listChildren,
  canonicalPath,
} from "@/lib/services/taxonomy";
import {
  selectPortfolio,
  selectTestimonials,
  selectModules,
  selectPackages,
  selectCaseStudies,
} from "@/data/selectors";

/** What ServiceTemplate expects after composition */
export interface ServiceViewModel {
  node: ServiceNode;
  breadcrumbs: Breadcrumbs;

  // Sections
  hero?: ServiceTemplateData["hero"];
  twoColVideo?: ServiceTemplateData["twoColVideo"];

  /** Services & Capabilities (author-provided) */
  capabilities?: ServiceTemplateData["capabilities"];

  /** Combined/derived cards for sibling services if needed */
  serviceCards?: {
    title: string;
    items: Array<{ title: string; description?: string; href: string }>;
  };

  /** Portfolio examples for this service (featured or curated) */
  portfolio?: any[];

  /** Modules rail (resources & case studies; note: case studies live here) */
  modules?: any[];

  /** Pricing orchestration: raw pricing data stays on page data */
  pricing?: ServiceTemplateData["pricing"];
  /** Optional comparison table within pricing */
  comparison?: ServiceTemplateData["pricing"] extends { comparison?: infer C } ? C : any;

  /** Packages & Add-ons */
  packages?: {
    featured?: any[];
    items?: any[];
    addons?: any[];
  };

  testimonials?: ServiceTemplateData["testimonials"];
  faqs?: ServiceTemplateData["faqs"] | ServiceTemplateData["faq"];
  cta?: ServiceTemplateData["cta"];

  /** If node has children, caller (template) may forward to SubHubTemplate */
  hasChildren: boolean;
}

/**
 * Compose Service page view model from taxonomy node + page data.
 * - Detects leaf vs. sub-hub (children)
 * - Fills portfolio/modules/testimonials
 * - Prepares sibling cards fallback
 * - Leaves pricing data intact for PricingSection adapter to consume
 */
export function composeService(
  node: ServiceNode,
  data: ServiceTemplateData
): ServiceViewModel {
  const breadcrumbs = buildBreadcrumbs(node);
  const children = (listChildren(node.id) as SubServiceNode[]) ?? [];
  const hasChildren = children.length > 0;

  // Sibling cards auto-fill (for "Related Services")
  const parentId = (node as any).parentId as string | undefined;
  const siblings =
    (parentId ? (listChildren(parentId) as ServiceNode[]) : []) ?? [];
  const siblingCardsAuto = siblings
    .filter((s) => s.id !== node.id)
    .map((s) => ({
      title: s.title,
      description: (s as any).summary,
      href: canonicalPath(s),
    }));

  const serviceCards = {
    title: data.serviceCards?.title ?? "Related Services",
    items: data.serviceCards?.items?.length
      ? data.serviceCards.items
      : siblingCardsAuto,
  };

  // Cross-domain content scoped to hub+service
  const hubSlug = String((node as any).parentSlug ?? (node as any).parentId ?? "");
  const portfolio = selectPortfolio({
    hub: hubSlug || String((node as any).slug), // safe fallback
    service: String(node.slug),
    featured: true,
    limit: 6,
  });

  const modules = selectModules({
    hub: hubSlug || String((node as any).slug),
    service: String(node.slug),
    limit: 10,
  });

  const tData = selectTestimonials({
    hub: hubSlug || String((node as any).slug),
    service: String(node.slug),
    limit: 5,
  });

  // Packages snapshot (featured + all + addons)
  const packageFeatured = selectPackages({
    hub: hubSlug || String((node as any).slug),
    service: String(node.slug),
    featured: true,
    limit: 3,
  });
  const packageAll = selectPackages({
    hub: hubSlug || String((node as any).slug),
    service: String(node.slug),
    featured: false,
    limit: 8,
  });
  const addons = selectPackages({
    hub: hubSlug || String((node as any).slug),
    service: String(node.slug),
    featured: false,
    limit: 20,
  })?.filter((p: any) => p?.kind === "addon" || p?.type === "addon");

  // Testimonials section normalization (allows author override)
  const testimonials =
    data.testimonials ??
    (tData?.length
      ? {
          title: "Results our clients talk about",
          subtitle: undefined,
          data: tData,
          count: Math.min(3, tData.length),
          intervalMs: 6000,
        }
      : undefined);

  return {
    node,
    breadcrumbs,
    hasChildren,
    hero: data.hero,
    twoColVideo: data.twoColVideo,
    capabilities: data.capabilities,
    serviceCards,
    portfolio,
    modules,
    pricing: (data as any).pricing,
    comparison: (data as any).pricing?.comparison,
    packages: {
      featured: packageFeatured,
      items: packageAll,
      addons,
    },
    testimonials,
    faqs: (data as any).faqs ?? (data as any).faq,
    cta: data.cta,
  };
}
