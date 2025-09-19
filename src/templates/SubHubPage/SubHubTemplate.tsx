// src/templates/SubHubPage/SubHubTemplate.tsx

import React from "react";
import su from "@/styles/services-unified.module.css";
import s from "./SubHubTemplate.module.css";

// --- Types ---
import type { TaxonomyNode } from "@/types/servicesTaxonomy.types";
import type { SubHubTemplateData } from "@/types/servicesTemplate.types";
 
// --- Taxonomy helpers ---
import { buildBreadcrumbs, listChildren, canonicalPath } from "@/lib/services/taxonomy";

// --- Shared adapters ---
import { toHeroProps } from "@/templates/shared/heroAdapter";

// --- Layout wrappers (match HubTemplate exactly) ---
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";

// --- Sections (match HubTemplate exactly) ---
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import ServicesAndCapabilities from "@/components/sections/section-layouts/ServicesAndCapabilities/ServicesAndCapabilities";
import CaseStudyCarousel from "@/components/ui/organisms/CaseStudyCarousel/CaseStudyCarousel";
import { FAQAccordion } from "@/components/ui/organisms/FAQAccordion";
import Testimonials from "@/components/ui/organisms/Testimonials/Testimonials";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import Breadcrumbs from "@/components/global/Breadcrumbs/Breadcrumbs";

// --- Sub-hub specific sections ---
import TwoColumnSection from "@/components/sections/section-layouts/TwoColumnSection/TwoColumnSection";
import ServiceCardsGrid from "@/components/sections/section-layouts/ServiceCardsGrid/ServiceCardsGrid";

/* ============================================================
   Adapters - standardized to match HubTemplate pattern
   ============================================================ */

// SERVICES & CAPABILITIES (adapted for Sub-Hub pages)
function toServicesAndCapabilitiesProps(data: SubHubTemplateData, children: TaxonomyNode[]) {
  const cap = data.capabilities ?? {};
  const title = cap.title ?? "Services & capabilities";
  const description = cap.description ?? "Explore sub-services in this area";
  const chips = cap.chips ?? [];
  
  // Auto bullets from children if not provided
  const autoBullets = children.map((c) => ({ label: c.title, href: canonicalPath(c) }));
  const bullets = cap.bullets?.length ? cap.bullets : autoBullets;
  
  // Convert bullets to pillars for consistency with ServicesAndCapabilities
  const pillars = Array.isArray(cap.pillars) && cap.pillars.length
    ? cap.pillars
    : bullets.map((b, i) => ({
        id: `bullet-${i}`,
        title: b.label,
        description: `Explore ${b.label.toLowerCase()} services and capabilities`,
        deliverables: [],
      }));

  const ctas = cap.ctas ?? {
    primary: data.cta?.primaryCta
      ? { label: data.cta.primaryCta.label, href: data.cta.primaryCta.href }
      : undefined,
  };

  return { title, description, chips, pillars, ctas };
}

// FAQ (same as HubTemplate)
function toFaqProps(data: SubHubTemplateData) {
  const src = data.faq ?? data.faqs;
  if (!src?.faqs?.length && !src?.items?.length) return undefined;

  const faqs = (src.faqs ?? src.items ?? []).map((f: any, i: number) => ({
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

// CTA (standardized to match CTASection expectations)
function toCtaProps(data: SubHubTemplateData) {
  const c = data.cta;
  if (!c?.primaryCta) return undefined;
  
  return {
    title: c.title ?? "Ready to Get Started?",
    subtitle: c.subtitle,
    description: c.description,
    primaryCta: { label: c.primaryCta.label, href: c.primaryCta.href },
    secondaryCta: c.secondaryCta
      ? { label: c.secondaryCta.label, href: c.secondaryCta.href }
      : undefined,
    style: c.layout ?? "centered",
    backgroundColor: c.backgroundType === "gradient" ? undefined : c.backgroundColor,
  };
}

/* ============================================================
   Component
   ============================================================ */
type Props = {
  node: TaxonomyNode;
  data: SubHubTemplateData;
  cardLimit?: number;
};

export default function SubHubTemplate({ node, data, cardLimit = 6 }: Props) {
  const crumbs = buildBreadcrumbs(node);
  const children = listChildren(node.id) ?? [];

  // Auto service cards from children
  const autoCards = children.map((c) => ({
    title: c.title,
    description: c.description,
    href: canonicalPath(c),
  }));
  
  const providedCards = data.serviceCards?.items ?? [];
  const mergedCards = providedCards.length ? providedCards : autoCards;
  
  const cards = {
    title: data.serviceCards?.title ?? "Explore sub-services",
    items: mergedCards.slice(0, Math.max(1, cardLimit)),
  };

  // ===================================================================
  // Apply Adapters (using shared hero adapter)
  // ===================================================================
  
  const heroProps = toHeroProps(data.hero);
  const sacProps = toServicesAndCapabilitiesProps(data, children);
  const faqProps = toFaqProps(data);
  const ctaProps = toCtaProps(data);

  return (
    <div className={`${su.servicePage} ${s.servicePage}`}>
      {/* 0) Breadcrumbs */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <Breadcrumbs items={crumbs} />
        </Container>
        <Divider variant="constrained" tone="default" thickness="md" />
      </FullWidthSection>

      {/* 1) HERO - Using shared adapter */}
      {heroProps ? <ServiceHero {...heroProps} /> : null}

      {/* 2) TWO-COLUMN VIDEO (Sub-Hub specific) */}
      {data.twoColVideo ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <TwoColumnSection block={data.twoColVideo} />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 3) SERVICES & CAPABILITIES */}
      {sacProps?.pillars?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>{sacProps.title}</h2>
              {sacProps.description && <p className={su.sectionSubtitle}>{sacProps.description}</p>}
              <Divider />
            </header>
            <ServicesAndCapabilities {...sacProps} />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 4) SERVICE CARDS */}
      {cards.items?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>{cards.title}</h2>
              <Divider />
            </header>
            <ServiceCardsGrid title={cards.title} items={cards.items} />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 5) CASE STUDIES */}
      {data.carousel?.items?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>{data.carousel.title ?? "Success Stories"}</h2>
              {data.carousel.subtitle && <p className={su.sectionSubtitle}>{data.carousel.subtitle}</p>}
              <Divider />
            </header>
            <CaseStudyCarousel title={data.carousel.title} caseStudies={data.carousel.items} />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 6) TESTIMONIALS */}
      {data.testimonials?.data?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            {(data.testimonials.title || data.testimonials.subtitle) && (
              <header className={su.centeredHeader}>
                {data.testimonials.title && <h2 className={su.sectionTitle}>{data.testimonials.title}</h2>}
                {data.testimonials.subtitle && <p className={su.sectionSubtitle}>{data.testimonials.subtitle}</p>}
                <Divider />
              </header>
            )}
            <Testimonials data={data.testimonials.data} />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 7) FAQ */}
      {faqProps?.faqs?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>{faqProps.title}</h2>
              {faqProps.subtitle && <p className={su.sectionSubtitle}>{faqProps.subtitle}</p>}
              <Divider />
            </header>
            <FAQAccordion
              faqs={faqProps.faqs}
              variant="default"
              enableSearch
              enableCategoryFilter={Boolean(faqProps.categories?.length)}
              searchPlaceholder={faqProps.searchPlaceholder}
              categories={faqProps.categories}
            />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 8) FINAL CTA */}
      {ctaProps ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="gradient" padded>
            <CTASection {...ctaProps} />
          </Container>
        </FullWidthSection>
      ) : null}
    </div>
  );
}