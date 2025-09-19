// src/templates/SubServicePage/SubServiceTemplate.tsx

import React from "react";
import su from "@/styles/services-unified.module.css";
import s from "./SubServiceTemplate.module.css";

// --- Types ---
import type { TaxonomyNode } from "@/types/servicesTaxonomy.types";
import type {
  SubServiceTemplateData,
  WorkflowData,
  ScopeData,
} from "@/types/servicesTemplate.types";

// --- Taxonomy helpers ---
import { buildBreadcrumbs } from "@/lib/services/taxonomy";

// --- Shared adapters ---
import { toHeroProps } from "@/templates/shared/heroAdapter";

// --- Layout wrappers (match Hub/Service templates) ---
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";

// --- Sections (match Hub/Service templates) ---
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import ServicesAndCapabilities from "@/components/sections/section-layouts/ServicesAndCapabilities/ServicesAndCapabilities";
import CaseStudyCarousel from "@/components/ui/organisms/CaseStudyCarousel/CaseStudyCarousel";
import { FAQAccordion } from "@/components/ui/organisms/FAQAccordion";
import Testimonials from "@/components/ui/organisms/Testimonials/Testimonials";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import Breadcrumbs from "@/components/global/Breadcrumbs/Breadcrumbs";

// --- Sub-service specific sections ---
import TwoColumnSection from "@/components/sections/section-layouts/TwoColumnSection/TwoColumnSection";

// --- Optional organisms (guard usage at runtime) ---
import ProcessTimeline from "@/components/ui/organisms/ProcessTimeline/ProcessTimeline";
import { ProcessFlow } from "@/components/ui/organisms/ProcessFlow/ProcessFlow";
import WorkflowDiagram from "@/components/ui/organisms/WorkflowDiagram/WorkflowDiagram";
import ComparisonTable from "@/components/ui/organisms/ComparisonTable/ComparisonTable";
import { StatsStrip } from "@/components/ui/organisms/StatsStrip/StatsStrip";
import ResultsStatsStrip from "@/components/ui/organisms/ResultsStatsStrip/ResultsStatsStrip";

// --- ✅ Level 3 Pricing (Callout only) ---
import PricingCallout from "@/components/ui/organisms/PricingCallout/PricingCallout";

/* ============================================================
   Utilities
   ============================================================ */

function hasItems(arr?: unknown[]) {
  return Array.isArray(arr) && arr.length > 0;
}

/* ============================================================
   Adapters
   ============================================================ */

// SERVICES & CAPABILITIES (adapted for Sub-Service)
function toServicesAndCapabilitiesProps(data: SubServiceTemplateData) {
  const cap = data.capabilities ?? {};
  const title = cap.title ?? "Services & Capabilities";
  const description = cap.description ?? "Included tasks & adjacent modules";
  const chips = cap.chips ?? [];

  // For Level 3, prefer concrete task bullets; fallback to pillars
  const pillars =
    Array.isArray(cap.pillars) && cap.pillars.length
      ? cap.pillars
      : (cap.bullets ?? []).map((b: any, i: number) => ({
          id: b.id ?? `bullet-${i}`,
          title: b.label ?? b.title ?? String(b),
          description:
            b.description ??
            (b.label ? `Detailed implementation of ${String(b.label).toLowerCase()}` : ""),
          deliverables: b.deliverables ?? [],
        }));

  const ctas =
    cap.ctas ??
    (data.cta?.primaryCta
      ? { primary: { label: data.cta.primaryCta.label, href: data.cta.primaryCta.href } }
      : undefined);

  return { title, description, chips, pillars, ctas };
}

// FAQ (same as other templates)
function toFaqProps(data: SubServiceTemplateData) {
  const src = (data as any).faq ?? (data as any).faqs;
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

// CTA (standardized to match CTASection)
function toCtaProps(data: SubServiceTemplateData) {
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
    style: (c.layout as any) ?? "centered",
    backgroundColor: c.backgroundType === "gradient" ? undefined : (c as any).backgroundColor,
  };
}

/* ============================================================
   Workflow Renderer
   ============================================================ */

function renderWorkflow(workflow: WorkflowData) {
  const variant = workflow.variant ?? "timeline";
  switch (variant) {
    case "flow":
      return <ProcessFlow {...(workflow as any)} />;
    case "diagram":
      return <WorkflowDiagram {...(workflow as any)} />;
    case "timeline":
    default:
      return <ProcessTimeline {...(workflow as any)} />;
  }
}

/* ============================================================
   Scope & Deliverables Block
   ============================================================ */

function ScopeDeliverables({ id, scope }: { id?: string; scope: ScopeData }) {
  const { title, includes = [], deliverables = [], addons = [] } = scope;
  const hasAnyItems = hasItems(includes) || hasItems(deliverables) || hasItems(addons);
  if (!hasAnyItems) return null;

  return (
    <FullWidthSection id={id} constrained containerSize="wide" padded>
      <Container size="wide" tone="transparent" padded>
        <header className={su.centeredHeader}>
          <h2 className={su.sectionTitle}>{title ?? "Scope & Deliverables"}</h2>
          <Divider />
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {hasItems(includes) && (
            <div>
              <h3 className="text-lg font-medium mb-4">Scope includes</h3>
              <ul className="space-y-2">
                {includes.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-3 mt-1 text-green-500">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasItems(deliverables) && (
            <div>
              <h3 className="text-lg font-medium mb-4">Deliverables</h3>
              <ul className="space-y-2">
                {deliverables.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-3 mt-1 text-blue-500">📋</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {hasItems(addons) && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="text-base font-medium mb-4">Optional add-ons</h4>
            <ul className="space-y-2">
              {addons.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="mr-3 mt-1 text-purple-500">+</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Container>
      <Divider variant="constrained" />
    </FullWidthSection>
  );
}

/* ============================================================
   Component
   ============================================================ */
type Props = {
  node: TaxonomyNode;
  data: SubServiceTemplateData;
};

export default function SubServiceTemplate({ node, data }: Props) {
  const crumbs = buildBreadcrumbs(node);

  // Adapters
  const heroProps = toHeroProps((data as any).hero);
  const sacProps = toServicesAndCapabilitiesProps(data);
  const faqProps = toFaqProps(data);
  const ctaProps = toCtaProps(data);

  // Level 3 pricing: tolerate legacy key `pricing`
  const callout = (data as any).pricingCallout ?? (data as any).pricing;
  const showCallout =
    callout &&
    ["included", "addon", "custom"].includes(String(callout.variant ?? "").toLowerCase());

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
      {heroProps ? <ServiceHero {...heroProps} /> : null}

      {/* 2) TWO-COLUMN INTRO / VIDEO (optional) */}
      {(data as any).twoColVideo ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <TwoColumnSection block={(data as any).twoColVideo} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 3) SERVICES & CAPABILITIES */}
      {sacProps?.pillars?.length ? (
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
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 4) WORKFLOW / PROCESS */}
      {(data as any).workflow ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>
                {(data as any).workflow.title ?? "How It Works"}
              </h2>
              <Divider />
            </header>
            {renderWorkflow((data as any).workflow)}
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 5) SCOPE & DELIVERABLES */}
      {(data as any).scope ? (
        <ScopeDeliverables id="scope" scope={(data as any).scope} />
      ) : null}

      {/* 6) RESULTS / STATS */}
      {(data as any).results?.items ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>
                {(data as any).results.title ?? "Typical Results"}
              </h2>
              <Divider />
            </header>
            {String((data as any).results.variant).toLowerCase() === "results" ? (
              <ResultsStatsStrip {...(data as any).results} />
            ) : (
              <StatsStrip {...(data as any).results} />
            )}
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 7) 💲 PRICING (Level 3 — Callout only) */}
      {showCallout ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <div className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>Pricing</h2>
              <p className={su.sectionSubtitle}>
                Simple, transparent status for this subservice
              </p>
            </div>
            <PricingCallout {...callout} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 8) (Optional) COMPARISON — only when there's a real choice */}
      {(data as any).comparison ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>Compare Options</h2>
              <Divider />
            </header>
            <ComparisonTable {...(data as any).comparison} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 9) PORTFOLIO / EXAMPLES (keep light: 1–2 items) */}
      {(data as any).portfolio?.items?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={su.centeredHeader}>
              <h2 className={su.sectionTitle}>
                {(data as any).portfolio.title ?? "Examples"}
              </h2>
              {(data as any).portfolio.subtitle && (
                <p className={su.sectionSubtitle}>
                  {(data as any).portfolio.subtitle}
                </p>
              )}
              <Divider />
            </header>
            <CaseStudyCarousel
              title={(data as any).portfolio.title}
              caseStudies={(data as any).portfolio.items.slice(0, (data as any).portfolio.displayLimit ?? 2)}
            />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 10) TESTIMONIALS (focused) */}
      {(data as any).testimonials?.data?.length ? (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            {((data as any).testimonials.title || (data as any).testimonials.subtitle) && (
              <header className={su.centeredHeader}>
                {(data as any).testimonials.title && (
                  <h2 className={su.sectionTitle}>{(data as any).testimonials.title}</h2>
                )}
                {(data as any).testimonials.subtitle && (
                  <p className={su.sectionSubtitle}>{(data as any).testimonials.subtitle}</p>
                )}
                <Divider />
              </header>
            )}
            <Testimonials data={(data as any).testimonials.data} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 11) FAQ */}
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
          <Divider variant="constrained" />
        </FullWidthSection>
      ) : null}

      {/* 12) FINAL CTA */}
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
