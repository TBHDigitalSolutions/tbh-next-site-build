// src/templates/HubPage/HubTemplate.tsx
"use client";

import React from "react";
import su from "@/styles/services-unified.module.css";
import s from "./HubTemplate.module.css";

// --- Types ---
import type { AnyServiceNode as TaxonomyNode } from "@/types/servicesTaxonomy.types";
import type { HubTemplateData } from "@/types/servicesTemplate.types";

// --- Taxonomy helpers ---
import { buildBreadcrumbs, listChildren, canonicalPath } from "@/lib/services/taxonomy";

// --- Shared adapters (DRY across Hub/Service/Subservice) ---
import { toHeroProps } from "@/templates/shared/heroAdapter";

// --- Layout wrappers ---
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";

// --- Sections ---
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import ServicesAndCapabilities from "@/components/sections/section-layouts/ServicesAndCapabilities/ServicesAndCapabilities";
import CaseStudyCarousel from "@/components/ui/organisms/CaseStudyCarousel/CaseStudyCarousel";
import { FAQAccordion } from "@/components/ui/organisms/FAQAccordion";
import TestimonialSlider from "@/components/ui/organisms/Testimonials/TestimonialSlider";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import Breadcrumbs from "@/components/global/Breadcrumbs/Breadcrumbs";
import { ModulesCarousel } from "@/components/sections/section-layouts/ModulesCarousel";

// Two-column video section (with adapter util)
import TwoColVideoSection, {
  toTwoColVideoData,
} from "@/components/sections/section-layouts/TwoColVideoSection";

/* =====================================================================
   Local adapters
   ===================================================================== */

// SERVICES & CAPABILITIES — bullets-first (but allow cards via props)
function toServicesAndCapabilitiesProps(data: HubTemplateData) {
  const cap = data.capabilities ?? {};
  const title = cap.title ?? "Our Services";
  const description = cap.description ?? data.serviceCards?.subtitle ?? "";
  const bullets = Array.isArray(cap.bullets) ? cap.bullets.slice(0, 9) : [];

  const pillars =
    bullets.length === 0
      ? (Array.isArray(cap.pillars) && cap.pillars.length > 0
          ? cap.pillars
          : (data.serviceCards?.items ?? []).map((c, i) => ({
              id: c.id ?? `svc-${i}`,
              title: c.title,
              description: c.description,
              icon: (c as any).icon,
              deliverables:
                (c as any).highlights ?? (c as any).features ?? [],
            })))
      : [];

  const ctas =
    cap.ctas ??
    {
      secondary: data.carousel?.title
        ? { label: "See portfolio", href: "#case-studies" }
        : undefined,
      primary: data.cta?.primaryCta
        ? {
            label: data.cta.primaryCta.label,
            href: data.cta.primaryCta.href,
          }
        : undefined,
    };

  const cards = data.serviceCards?.items ?? []; // show cards even when bullets are present
  return { title, description, chips: [], bullets, pillars, ctas, cards };
}

// FAQ → FAQAccordion props
function toFaqProps(data: HubTemplateData) {
  const src = data.faq;
  if (!src?.faqs?.length) return undefined;

  const faqs = src.faqs.map((f, i) => ({
    id: f.id ?? `faq-${i}`,
    question: f.question ?? f.title ?? "",
    answer: f.answer ?? f.content ?? "",
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

// CTA → CTASection props
function toCtaProps(data: HubTemplateData) {
  const c = data.cta;
  if (!c?.primaryCta) return undefined;

  return {
    title: c.title,
    subtitle: c.subtitle,
    description: c.description,
    primaryCTA: { text: c.primaryCta.label, link: c.primaryCta.href },
    secondaryCTA: c.secondaryCta
      ? { text: c.secondaryCta.label, link: c.secondaryCta.href }
      : undefined,
    trustElements: c.trustElements,
    layout: c.layout,
    backgroundType: c.backgroundType,
  };
}

/* =====================================================================
   Component
   ===================================================================== */

type Props = { node: TaxonomyNode; data: HubTemplateData };

export default function HubTemplate({ node, data }: Props) {
  // Level rule enforcement (dev-only): no pricing at the hub level
  if (process.env.NODE_ENV === "development" && (data as any)?.pricing) {
    // eslint-disable-next-line no-console
    console.warn(
      "[HubTemplate] Pricing was provided on a hub. Level-1 is directory-only; remove any hub-level pricing."
    );
  }

  const crumbs = buildBreadcrumbs(node);
  const children = listChildren(node.id) ?? [];

  // Auto-bullets fallback (don’t mutate original)
  const autoBullets = children.map((c) => ({
    label: c.title,
    href: canonicalPath(c),
  }));

  const normalizedData: HubTemplateData =
    (!data.capabilities?.bullets || data.capabilities?.bullets.length === 0) &&
    autoBullets.length
      ? {
          ...data,
          capabilities: { ...(data.capabilities ?? {}), bullets: autoBullets },
        }
      : data;

  // HERO via shared adapter (DRY across templates)
  const heroProps = normalizedData.hero
    ? toHeroProps(normalizedData.hero)
    : undefined;

  // TwoColVideo (read from either sections or top-level)
  const rawTwoColVideo =
    (normalizedData as any).twoColVideo ??
    (normalizedData.sections as any)?.twoColVideo ??
    undefined;
  const twoColVideo = rawTwoColVideo
    ? toTwoColVideoData(rawTwoColVideo)
    : undefined;

  const sacProps = toServicesAndCapabilitiesProps(normalizedData);
  const faqProps = toFaqProps(normalizedData);
  const ctaProps = toCtaProps(normalizedData);

  const shouldRenderSAC =
    Boolean(sacProps?.bullets?.length) ||
    Boolean(sacProps?.pillars?.length) ||
    Boolean(sacProps?.cards?.length);

  return (
    <div className={`${su.servicePage} ${s.servicePage}`}>
      {/* 0) Breadcrumbs */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <Breadcrumbs items={crumbs} />
        </Container>
        <Divider variant="constrained" tone="default" thickness="md" />
      </FullWidthSection>

      {/* 1) HERO */}
      {heroProps ? <ServiceHero {...heroProps} /> : null}

      {/* 1.5) TWO-COLUMN VIDEO */}
      {twoColVideo ? (
        <TwoColVideoSection
          data={twoColVideo}
          containerSize="wide"
          tone="transparent"
          showDivider
          dividerVariant="constrained"
          dividerTone="default"
        />
      ) : null}

      {/* 2) SERVICES & CAPABILITIES (directory emphasis) */}
      {shouldRenderSAC ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>{sacProps.title}</h2>
              {sacProps.description && (
                <p className={su.sectionSubtitle}>{sacProps.description}</p>
              )}
              <Divider />
            </header>
            <ServicesAndCapabilities {...sacProps} />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 3) Modules / Process carousel (optional) */}
      {normalizedData.modules?.items?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <ModulesCarousel
              title={normalizedData.modules.title ?? "Explore More"}
              subtitle={normalizedData.modules.subtitle}
              items={normalizedData.modules.items}
              layout={normalizedData.modules.layout ?? "carousel"}
            />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 4) Testimonials (slider) */}
      {normalizedData.testimonials?.data?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="full" tone="gradient" padded>
            {(normalizedData.testimonials.title ||
              normalizedData.testimonials.subtitle) && (
              <header className={su.centeredHeader}>
                {normalizedData.testimonials.title && (
                  <h2 className={su.sectionTitle}>
                    {normalizedData.testimonials.title}
                  </h2>
                )}
                {normalizedData.testimonials.subtitle && (
                  <p className={su.sectionSubtitle}>
                    {normalizedData.testimonials.subtitle}
                  </p>
                )}
                <Divider />
              </header>
            )}
            <TestimonialSlider
              data={normalizedData.testimonials.data}
              count={3}
              intervalMs={6000}
            />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 5) Case studies / portfolio (optional, hub strip) */}
      {normalizedData.carousel?.items?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>
                {normalizedData.carousel.title ?? "Success Stories"}
              </h2>
              {normalizedData.carousel.subtitle && (
                <p className={su.sectionSubtitle}>
                  {normalizedData.carousel.subtitle}
                </p>
              )}
              <Divider />
            </header>
            <CaseStudyCarousel
              title={normalizedData.carousel.title}
              caseStudies={normalizedData.carousel.items}
            />
          </Container>
          <Divider variant="constrained" tone="default" thickness="md" />
        </FullWidthSection>
      ) : null}

      {/* 6) FAQ */}
      {faqProps?.faqs?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>{faqProps.title}</h2>
              {faqProps.subtitle && (
                <p className={su.sectionSubtitle}>{faqProps.subtitle}</p>
              )}
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

      {/* 7) Final CTA */}
      {toCtaProps(normalizedData) ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="gradient" padded>
            <CTASection {...toCtaProps(normalizedData)!} />
          </Container>
        </FullWidthSection>
      ) : null}
    </div>
  );
}
