// src/templates/ServicePage/ServiceTemplate.tsx
"use client";

import * as React from "react";
import su from "@/styles/services-unified.module.css";
import s from "./ServiceTemplate.module.css";

// --- Types ---
import type { TaxonomyNode } from "@/types/servicesTaxonomy.types";
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";

// --- Taxonomy helpers ---
import {
  buildBreadcrumbs,
  listChildren,
  canonicalPath,
} from "@/lib/services/taxonomy";

// --- Shared adapters ---
import { toHeroProps } from "@/templates/shared/heroAdapter";

// --- Layout wrappers (match HubTemplate) ---
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";
import Breadcrumbs from "@/components/global/Breadcrumbs/Breadcrumbs";

// --- Sections ---
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import TwoColumnSection from "@/components/sections/section-layouts/TwoColumnSection/TwoColumnSection";
import ServiceCardsGrid from "@/components/sections/section-layouts/ServiceCardsGrid/ServiceCardsGrid";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";

// NEW: Combined Services & Capabilities + Expandable
import ServicesAndCapabilitiesExpandable from "@/components/ui/organisms/ServicesAndCapabilitiesExpandable";

// Portfolio viewers (visual examples)
import StandardPortfolioGallery from "@/components/portfolio/StandardPortfolioGallery/StandardPortfolioGallery";
import VideoPortfolioGallery from "@/components/ui/organisms/VideoPortfolioGallery";
import PortfolioDemoClient from "@/components/ui/organisms/PortfolioDemo/PortfolioDemoClient";

// Resources rail
import { PlaybookShowcase } from "@/components/ui/organisms/PlaybookShowcase";

// Pricing
import PricingSection from "@/components/ui/organisms/PricingSection/PricingSection";
import ComparisonTable from "@/components/ui/organisms/ComparisonTable/ComparisonTable";

// Packages & Add-ons
import GrowthPackagesSection from "@/components/packages/GrowthPackagesSection/GrowthPackagesSection";

// Social proof + objections
import { FAQAccordion } from "@/components/ui/organisms/FAQAccordion";
import Testimonials from "@/components/ui/organisms/Testimonials/Testimonials";

// Search (domain-specific)
import SearchBanner from "@/search/ui/SearchBanner";

// Pricing adapter router
import { resolvePricingAdapter } from "@/lib/services/pricingAdapters";

// Delegate to sub-hub if L2 has children
import SubHubTemplate from "@/templates/SubHubPage/SubHubTemplate";

/* ============================================================
   Adapters (tolerant, production-ready)
   ============================================================ */

// 1) HERO
function toHero(data: ServiceTemplateData) {
  return toHeroProps((data as any).hero);
}

// 2) SEARCH (domain-specific)
function toSearchProps(node: TaxonomyNode, data: ServiceTemplateData) {
  // Optional: allow page-data to override index/tag filters
  const cfg = (data as any).search ?? {};
  return {
    placeholder: cfg.placeholder ?? "Search services, tools, and resources…",
    // example: use your search config keys
    index: cfg.index ?? "services",
    filters: cfg.filters ?? { hub: (node as any).parentId, service: node.slug },
  };
}

// 3) OVERVIEW intro (TwoColumnSection / TwoColVideoSection)
function hasOverview(data: ServiceTemplateData) {
  return Boolean((data as any).twoColVideo);
}

// 4) Services & Capabilities + Expandable Bullets
function toSACExpandableProps(data: ServiceTemplateData) {
  // Accept either new combined block or legacy `capabilities` and `expandable`
  const block =
    (data as any).servicesAndCapabilitiesExpandable ??
    (data as any).capabilities ??
    {};
  // Let component’s own adapters do the heavy lifting via `block`
  return { block, analyticsId: "service:sac-expandable" };
}

// 5) Portfolio (visual examples orchestrator)
type PortfolioVariant = "web" | "video" | "demo";
function toPortfolio(data: ServiceTemplateData): {
  variant?: PortfolioVariant;
  title?: string;
  subtitle?: string;
  items?: any[];
} | null {
  const p = (data as any).portfolio;
  if (!p) return null;

  // tolerant: items can live at portfolio.items or directly as array
  const items = Array.isArray(p?.items) ? p.items : Array.isArray(p) ? p : [];
  const variant: PortfolioVariant =
    p?.variant ?? (p?.video ? "video" : p?.demo ? "demo" : "web");

  return items?.length
    ? {
        variant,
        title: p.title ?? "Selected Work",
        subtitle: p.subtitle,
        items,
      }
    : null;
}

// 6) Module Carousel (resources rail – contains case studies)
function toModuleCarouselProps(data: ServiceTemplateData) {
  const rail =
    (data as any).modules ??
    (data as any).resources ??
    (data as any).carousel ??
    null;
  // Expect a tolerant shape: { title, subtitle, items: [{ title, href, kind, ...}] }
  if (!rail?.items?.length) return null;

  return {
    title: rail.title ?? "Resources & Case Studies",
    subtitle:
      rail.subtitle ??
      "Playbooks, checklists, tools, and case studies to explore.",
    items: rail.items,
  };
}

// 7) Pricing (+ starting-price disclaimer)
function toPricing(node: TaxonomyNode, data: ServiceTemplateData) {
  const pricing = (data as any).pricing;
  if (!pricing) return null;

  const pricingAdapter = resolvePricingAdapter({
    level: 2,
    hub: (node as any).parentId,
    service: node.slug,
  });

  if (!pricingAdapter) return null;

  const hubName =
    ((node as any).parentId?.charAt(0).toUpperCase() ??
      "") + ((node as any).parentId?.slice(1) ?? "");

  return {
    title: pricing.title || `${hubName} Pricing & Packages`,
    subtitle:
      pricing.subtitle || "Investment levels designed for sustainable growth",
    data: pricing,
    mapToTiersProps: pricingAdapter,
    notes: {
      // REQUIRED NOTE: starting prices disclaimer
      disclaimer:
        pricing.disclaimer ||
        "Prices shown are starting points; final pricing is determined after a scope consultation.",
      contact:
        pricing.contactNote ||
        "Not sure which plan is right? We’ll help you outline the scope.",
      contactHref: pricing.contactHref || "/contact",
    },
    comparison: pricing.comparison, // pass-through; validated below
  };
}

// 8) Packages & Add-ons
function toPackagesProps(data: ServiceTemplateData) {
  const pkg = (data as any).packages ?? (data as any).addons ?? null;
  if (!pkg) return null;

  return {
    title: pkg.title ?? "Packages & Add-Ons",
    subtitle:
      pkg.subtitle ??
      "Mix-and-match bundles and add-ons to fit your unique scope.",
    items: pkg.items ?? [],
    featured: pkg.featured ?? [],
    cta: pkg.cta,
  };
}

// 9) Testimonials
function toTestimonials(data: ServiceTemplateData) {
  const t = (data as any).testimonials;
  if (!t?.data?.length) return null;
  return {
    title: t.title ?? "What clients say",
    subtitle: t.subtitle,
    data: t.data,
  };
}

// 10) FAQ
function toFaq(data: ServiceTemplateData) {
  const src = (data as any).faq ?? (data as any).faqs;
  const list = src?.faqs ?? src?.items;
  if (!Array.isArray(list) || list.length === 0) return null;

  const faqs = list.map((f: any, i: number) => ({
    id: f.id ?? `faq-${i}`,
    question: f.question ?? f.q ?? f.title ?? "",
    answer: f.answer ?? f.a ?? f.content ?? "",
    category: f.category ?? src.title ?? "FAQ",
    tags: f.tags,
  }));

  return {
    title: src.title ?? "Frequently Asked Questions",
    subtitle: src.subtitle,
    faqs,
    categories: src.categories,
    searchPlaceholder: src.searchPlaceholder,
  };
}

// 11) Final CTA
function toCta(data: ServiceTemplateData) {
  const c = (data as any).cta;
  if (!c?.primaryCta) return null;

  return {
    title: c.title ?? "Ready to Get Started?",
    subtitle: c.subtitle,
    description: c.description,
    primaryCta: { label: c.primaryCta.label, href: c.primaryCta.href },
    secondaryCta: c.secondaryCta
      ? { label: c.secondaryCta.label, href: c.secondaryCta.href }
      : undefined,
    style: (c.layout as any) ?? "centered",
    backgroundColor:
      c.backgroundType === "gradient" ? undefined : (c as any).backgroundColor,
  };
}

/* ============================================================
   Component
   ============================================================ */
type Props = { node: TaxonomyNode; data: ServiceTemplateData };

export default function ServiceTemplate({ node, data }: Props) {
  // If this node has children, delegate to SubHubTemplate (L2 sub-hub)
  const children = listChildren(node.id) ?? [];
  if (children.length > 0) {
    return <SubHubTemplate node={node} data={data as any} />;
  }

  const crumbs = buildBreadcrumbs(node);

  // Auto sibling cards if not provided
  const parentId = (node as any).parentId as string | undefined;
  const siblings = parentId ? listChildren(parentId) ?? [] : [];
  const siblingCardsAuto = siblings
    .filter((s) => s.id !== node.id)
    .map((s) => ({
      title: s.title,
      description: (s as any).description,
      href: canonicalPath(s),
    }));

  // Apply adapters
  const hero = toHero(data);
  const searchProps = toSearchProps(node, data);
  const hasIntro = hasOverview(data);
  const sacExpandable = toSACExpandableProps(data);
  const portfolio = toPortfolio(data);
  const resources = toModuleCarouselProps(data);
  const pricing = toPricing(node, data);
  const packagesProps = toPackagesProps(data);
  const testimonials = toTestimonials(data);
  const faq = toFaq(data);
  const cta = toCta(data);

  const related = {
    title: (data as any).serviceCards?.title ?? "Related Services",
    items:
      (data as any).serviceCards?.items?.length
        ? (data as any).serviceCards.items
        : siblingCardsAuto,
  };

  // Runtime diagnostics (dev only)
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.log(`[ServiceTemplate] ${node.slug}`, {
      hero: !!hero,
      search: !!searchProps,
      intro: !!hasIntro,
      sacExpandable,
      portfolio: !!portfolio?.items?.length,
      resourcesRail: !!resources?.items?.length,
      pricing: !!pricing,
      comparison: !!pricing?.comparison?.rows?.length,
      packages: !!packagesProps?.items?.length || !!packagesProps?.featured?.length,
      testimonials: !!testimonials?.data?.length,
      faq: !!faq?.faqs?.length,
      cta: !!cta,
    });
  }

  return (
    <div className={`${su.servicePage} ${s.servicePage}`}>

      {/* 0) Breadcrumbs */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <Breadcrumbs items={crumbs} />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 1) HERO */}
      {hero ? <ServiceHero {...hero} /> : null}

      {/* 2) SEARCH BANNER (domain-specific) */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="surface" padded>
          <SearchBanner {...searchProps} />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 3) OVERVIEW INTRO (TwoColumnSection / Video) */}
      {hasIntro ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            {/* Your block already decides between text/video variants */}
            <TwoColumnSection block={(data as any).twoColVideo} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 4) SERVICES & CAPABILITIES + EXPANDABLE BULLETS */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <header className={su.centeredHeader}>
            <h2 className={su.sectionTitle}>
              {(sacExpandable as any)?.block?.title ?? "Services & Capabilities"}
            </h2>
            {(sacExpandable as any)?.block?.description && (
              <p className={su.sectionSubtitle}>
                {(sacExpandable as any).block.description}
              </p>
            )}
            <Divider />
          </header>
          <ServicesAndCapabilitiesExpandable {...sacExpandable} />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 5) PORTFOLIO SECTION (visual examples only) */}
      {portfolio?.items?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>
                {portfolio.title ?? "Selected Work"}
              </h2>
              {portfolio.subtitle && (
                <p className={su.sectionSubtitle}>{portfolio.subtitle}</p>
              )}
              <Divider />
            </header>

            {/* Orchestrate the right viewer by variant */}
            {portfolio.variant === "video" ? (
              <VideoPortfolioGallery items={portfolio.items} />
            ) : portfolio.variant === "demo" ? (
              <PortfolioDemoClient items={portfolio.items} />
            ) : (
              <StandardPortfolioGallery items={portfolio.items} />
            )}
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 6) MODULE CAROUSEL (Resources & Case Studies) */}
      {resources?.items?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>
                {resources.title ?? "Resources & Case Studies"}
              </h2>
              {resources.subtitle && (
                <p className={su.sectionSubtitle}>{resources.subtitle}</p>
              )}
              <Divider />
            </header>
            <PlaybookShowcase items={resources.items} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 7) PRICING + COMPARISON */}
      {pricing ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <PricingSection
              title={pricing.title}
              subtitle={pricing.subtitle}
              data={pricing.data}
              mapToTiersProps={pricing.mapToTiersProps}
              notes={pricing.notes}
            />
            {pricing.comparison?.rows?.length ? (
              <div style={{ marginTop: "2rem" }}>
                <ComparisonTable {...pricing.comparison} />
              </div>
            ) : null}
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 8) PACKAGES & ADD-ONS */}
      {packagesProps?.items?.length || packagesProps?.featured?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>
                {packagesProps.title ?? "Packages & Add-Ons"}
              </h2>
              {packagesProps.subtitle && (
                <p className={su.sectionSubtitle}>{packagesProps.subtitle}</p>
              )}
              <Divider />
            </header>
            <GrowthPackagesSection
              items={packagesProps.items}
              featured={packagesProps.featured}
              cta={packagesProps.cta}
            />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 9) TESTIMONIALS */}
      {testimonials?.data?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            {(testimonials.title || testimonials.subtitle) && (
              <header className={su.centeredHeader}>
                {testimonials.title && (
                  <h2 className={su.sectionTitle}>{testimonials.title}</h2>
                )}
                {testimonials.subtitle && (
                  <p className={su.sectionSubtitle}>{testimonials.subtitle}</p>
                )}
                <Divider />
              </header>
            )}
            <Testimonials data={testimonials.data} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 10) FAQ */}
      {faq?.faqs?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>{faq.title}</h2>
              {faq.subtitle && (
                <p className={su.sectionSubtitle}>{faq.subtitle}</p>
              )}
              <Divider />
            </header>
            <FAQAccordion
              faqs={faq.faqs}
              variant="default"
              enableSearch
              enableCategoryFilter={Boolean(faq.categories?.length)}
              searchPlaceholder={faq.searchPlaceholder}
              categories={faq.categories}
            />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 11) FINAL CTA */}
      {cta ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="gradient" padded>
            <CTASection {...cta} />
          </Container>
        </FullWidthSection>
      ) : null}
    </div>
  );
}
