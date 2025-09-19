// src/data/composers/subServiceComposer.ts
import type {
  Breadcrumbs,
  SubServiceNode,
} from "@/types/servicesTaxonomy.types";
import type { SubServiceTemplateData } from "@/types/servicesTemplate.types";
import { buildBreadcrumbs } from "@/lib/services/taxonomy";
import {
  selectTestimonials,
  selectPortfolio,
  selectModules,
} from "@/data/selectors";

/** What SubServiceTemplate expects after composition */
export interface SubServiceViewModel {
  node: SubServiceNode;
  breadcrumbs: Breadcrumbs;

  hero?: SubServiceTemplateData["hero"];
  twoColVideo?: SubServiceTemplateData["twoColVideo"];

  /** Sub-service specifics */
  capabilities?: SubServiceTemplateData["capabilities"];
  workflow?: SubServiceTemplateData["workflow"];
  scope?: SubServiceTemplateData["scope"];
  results?: SubServiceTemplateData["results"];
  pricingCallout?: SubServiceTemplateData["pricingCallout"];

  /** Supplemental content */
  portfolio?: any[];
  modules?: any[];
  testimonials?: SubServiceTemplateData["testimonials"];
  faqs?: SubServiceTemplateData["faqs"] | SubServiceTemplateData["faq"];
  cta?: SubServiceTemplateData["cta"];
}

/**
 * Compose Sub-service page view model from taxonomy node + page data.
 * - No tiered pricing here (pricing lives at the L2 leaf)
 * - Pulls portfolio/modules/testimonials scoped to hub/service/sub
 */
export function composeSubService(
  node: SubServiceNode,
  data: SubServiceTemplateData
): SubServiceViewModel {
  const breadcrumbs = buildBreadcrumbs(node);

  const hubSlug = String((node as any).hubSlug ?? (node as any).rootSlug ?? "");
  const serviceSlug = String((node as any).serviceSlug ?? (node as any).parentSlug ?? "");
  const subSlug = String(node.slug);

  const portfolio = selectPortfolio({
    hub: hubSlug || serviceSlug || subSlug,
    service: serviceSlug,
    sub: subSlug,
    featured: true,
    limit: 6,
  });

  const modules = selectModules({
    hub: hubSlug || serviceSlug || subSlug,
    service: serviceSlug,
    sub: subSlug,
    limit: 10,
  });

  const tData = selectTestimonials({
    hub: hubSlug || serviceSlug || subSlug,
    service: serviceSlug,
    sub: subSlug,
    limit: 5,
  });

  const testimonials =
    data.testimonials ??
    (tData?.length
      ? {
          title: "What teams achieve with us",
          subtitle: undefined,
          data: tData,
          count: Math.min(3, tData.length),
          intervalMs: 6000,
        }
      : undefined);

  return {
    node,
    breadcrumbs,
    hero: data.hero,
    twoColVideo: (data as any).twoColVideo,
    capabilities: data.capabilities,
    workflow: (data as any).workflow,
    scope: (data as any).scope,
    results: (data as any).results,
    pricingCallout: (data as any).pricingCallout,
    portfolio,
    modules,
    testimonials,
    faqs: (data as any).faqs ?? (data as any).faq,
    cta: data.cta,
  };
}
