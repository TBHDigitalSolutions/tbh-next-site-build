// src/data/composers/hubComposer.ts
import type {
  HubNode,
  ServiceNode,
  Breadcrumbs,
} from "@/types/servicesTaxonomy.types";
import type { HubTemplateData } from "@/types/servicesTemplate.types";
import {
  buildBreadcrumbs,
  listChildren,
  canonicalPath,
} from "@/lib/services/taxonomy";
import {
  selectPortfolio,
  selectTestimonials,
  selectModules,
  selectCaseStudies,
} from "@/data/selectors";

/** What HubTemplate expects after composition */
export interface HubViewModel {
  node: HubNode;
  breadcrumbs: Breadcrumbs;
  hero?: HubTemplateData["hero"];
  /** L2 service cards (derived from taxonomy unless explicitly provided) */
  serviceCards: {
    title: string;
    items: Array<{ title: string; description?: string; href: string }>;
  };
  /** Optional intro/video block from page data */
  twoColVideo?: HubTemplateData["twoColVideo"];
  /** Optional modules rail (resources & case studies) */
  modules?: any[];
  /** Optional portfolio teaser for this hub (featured) */
  portfolio?: any[];
  /** Optional testimonials scoped to this hub */
  testimonials?: HubTemplateData["testimonials"];
  /** Optional FAQs passthrough */
  faqs?: HubTemplateData["faqs"] | HubTemplateData["faq"];
  /** Optional CTA passthrough */
  cta?: HubTemplateData["cta"];
}

/**
 * Compose Hub page view model from taxonomy node + page data.
 * - Derives L2 cards from taxonomy if not provided in page data
 * - Pulls featured portfolio / modules / testimonials scoped to hub
 */
export function composeHub(node: HubNode, data: HubTemplateData): HubViewModel {
  const crumbs = buildBreadcrumbs(node);

  // 1) Derive L2 service cards automatically (unless author overrides)
  const services = (listChildren(node.id) as ServiceNode[]) ?? [];
  const autoCards = services.map((s) => ({
    title: s.title,
    description: (s as any).summary,
    href: canonicalPath(s),
  }));

  const serviceCards = {
    title: data.serviceCards?.title ?? "Explore our services",
    items: data.serviceCards?.items?.length ? data.serviceCards.items : autoCards,
  };

  // 2) Cross-domain pulls (scoped to hub)
  const portfolioFeatured = selectPortfolio({ hub: String(node.slug), featured: true, limit: 3 });
  const modules = selectModules({ hub: String(node.slug), limit: 8 });
  const tData = selectTestimonials({ hub: String(node.slug), limit: 5 });

  // 3) Testimonials section normalization
  const testimonials = data.testimonials ?? {
    title: "What clients say",
    subtitle: undefined,
    data: tData,
    count: Math.min(3, tData?.length ?? 0),
    intervalMs: 6000,
  };

  return {
    node,
    breadcrumbs: crumbs,
    hero: data.hero,
    twoColVideo: data.twoColVideo,
    serviceCards,
    modules,
    portfolio: portfolioFeatured,
    testimonials,
    faqs: (data as any).faqs ?? (data as any).faq,
    cta: data.cta,
  };
}
