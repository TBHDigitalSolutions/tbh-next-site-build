// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

import * as React from "react";
import styles from "./PackagesDetailTemplate.module.css";

import type { PackageBundle } from "@/packages/lib/types";
import { emitServiceJsonLd } from "@/packages/lib/jsonld";
import { toPackageCard, toIncludesTable } from "@/packages/lib/adapters";
import { sectionCtas, cardCtas, ROUTES } from "@/packages/lib/cta";
import { startingAtLabel } from "@/packages/lib/pricing";

// Page-level sections
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";
// ⬇️ keep concrete file import to avoid broken index re-exports in some builds
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQSection from "@/components/sections/section-layouts/FAQSection";

// Detail stack
import PackageDetailOverview from "@/packages/sections/PackageDetailOverview";
import AddOnSection from "@/packages/sections/AddOnSection";
import RelatedItemsRail from "@/packages/components/RelatedItemsRail";

/* ----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type PackagesDetailTemplateProps = {
  /** The bundle/package entity to render (page-level SSOT) */
  bundle: PackageBundle & {
    slug?: string;
    service?: string;
    services?: string[];
    tags?: string[];
    summary?: string;
    name?: string;
    title?: string;
    icp?: string;
    price?: { oneTime?: number; monthly?: number; currency?: "USD" };
    outcomes?: Array<string | { label: string }>;
    includes?: Array<{ title: string; items: string[] }>;
    notes?: string;
    faq?: { title?: string; faqs?: Array<{ q: string; a: string }>; };
    addOnRecommendations?: string[];
  };

  /** Optional curated related items (will be adapted to cards) */
  related?: PackageBundle[];

  /** Optional add-ons already resolved to the section’s expected shape */
  addOns?: Array<any>;

  /** Optional fallback FAQ items (used if bundle has none) */
  faqs?: Array<{ id?: string | number; question: string; answer: string }>;
};

/* ----------------------------------------------------------------------------
 * Component
 * -------------------------------------------------------------------------- */

export default function PackagesDetailTemplate({
  bundle,
  related = [],
  addOns = [],
  faqs = [],
}: PackagesDetailTemplateProps) {
  // --------------------------------------------------------------------------
  // Hero content (safe defaults)
  // --------------------------------------------------------------------------
  const heroTitle = bundle.title ?? (bundle as any).name ?? "Package";
  const heroSubtitle =
    bundle.summary ?? (bundle as any).valueProp ?? (bundle as any).subtitle ?? "";

  // --------------------------------------------------------------------------
  // Derived collections / flags
  // --------------------------------------------------------------------------
  const hasAddOns = (addOns?.length ?? 0) > 0;
  const hasRelated = (related?.length ?? 0) > 0;

  const bundleFaqTitle = (bundle as any)?.faq?.title ?? "Frequently asked questions";
  const bundleFaqItems: Array<{ q: string; a: string }> = (bundle as any)?.faq?.faqs ?? [];
  const hasFaq = (bundleFaqItems.length ?? 0) > 0 || (faqs?.length ?? 0) > 0;

  // --------------------------------------------------------------------------
  // Adapters / models (single source of truth)
  // --------------------------------------------------------------------------
  const includesTable = toIncludesTable(bundle); // normalized for PackageIncludesTable
  const pinnedCardBase = toPackageCard(bundle);
  const pinnedCard = { ...pinnedCardBase, variant: "rail", ...cardCtas(bundle.slug ?? "") };

  const relatedRailItems = related.map((b) => ({ ...toPackageCard(b), variant: "rail" }));

  // JSON-LD (schema.org) for SEO
  const jsonLd = emitServiceJsonLd(bundle);

  // CTA helpers (policy standard)
  const { primary: sectionPrimaryCta, secondary: sectionSecondaryCta } = sectionCtas();

  // Optional CTASection subtitle: reinforce single “Starting at …” label
  const priceSubtitle =
    bundle.price ? startingAtLabel(bundle.price as any) : undefined;

  // Normalize outcomes for the overview (strings -> labels)
  const outcomes: string[] =
    (bundle as any).outcomes?.map((o: any) => (typeof o === "string" ? o : o?.label)).filter(Boolean) ?? [];

  // Resolve service/tags
  const serviceSlug = (bundle as any).service ?? (bundle as any).primaryService;
  const tagChips = (bundle as any).tags ?? (bundle as any).services ?? [];

  return (
    <article
      className={styles.detailTemplate}
      data-template="packages-detail"
      data-bundle={bundle.slug ?? ""}
    >
      {/* SEO (schema.org) */}
      {jsonLd}

      {/* =========================================================
          PAGE HERO — ServiceHero
         ========================================================= */}
      <section className={styles.heroSection} aria-label="Overview hero">
        <ServiceHero
          title={heroTitle}
          subtitle={heroSubtitle}
          tags={tagChips}
          primaryCta={sectionPrimaryCta}   // "Request proposal" → /contact
          secondaryCta={sectionSecondaryCta} // "Book a call" → /book
        />
      </section>

      {/* =========================================================
          SUPER CARD (AT A GLANCE) — PackageDetailOverview
         ========================================================= */}
      <section className={styles.overviewSection} aria-label="Package details at a glance">
        <PackageDetailOverview
          id={bundle.slug}
          title={heroTitle}
          valueProp={heroSubtitle}
          icp={(bundle as any).icp}
          service={serviceSlug as any}
          tags={tagChips}
          // canonical price only; UI derives label
          price={(bundle as any).price}
          ctaPrimary={sectionPrimaryCta}
          ctaSecondary={sectionSecondaryCta}
          outcomes={outcomes}
          includesTable={includesTable as any}
          pinnedPackageCard={pinnedCard as any}
          notes={(bundle as any).notes ? <p>{(bundle as any).notes}</p> : undefined}
        />
      </section>

      {/* =========================================================
          ADD-ONS — recommended upsells
         ========================================================= */}
      {hasAddOns && (
        <section className={styles.addOnsSection} aria-label="Recommended add-ons">
          <AddOnSection
            id="recommended-addons"
            title="Recommended add-ons"
            layout="carousel" /* or "grid" */
            addOns={addOns as any}
          />
        </section>
      )}

      {/* =========================================================
          RELATED — packages and/or bundles
         ========================================================= */}
      {hasRelated && (
        <section className={styles.relatedSection} aria-label="Related packages">
          <RelatedItemsRail items={relatedRailItems as any} />
        </section>
      )}

      {/* =========================================================
          CTA BAND — closing call to action
         ========================================================= */}
      <section className={styles.ctaSection} aria-label="Get started">
        <CTASection
          title="Let’s shape your growth plan"
          subtitle={priceSubtitle}
          primaryCta={sectionPrimaryCta}
          secondaryCta={sectionSecondaryCta}
        />
      </section>

      {/* =========================================================
          FAQ — final panel
         ========================================================= */}
      {hasFaq && (
        <section className={styles.faqSection} aria-label="Frequently asked questions">
          <FAQSection
            id="bundle-faq"
            title={bundleFaqTitle}
            items={(bundleFaqItems.length ? bundleFaqItems : faqs).map((f: any, i: number) => ({
              id: String(f?.id ?? i),
              question: f.q ?? f.question,
              answer: f.a ?? f.answer,
            }))}
          />
        </section>
      )}
    </article>
  );
}
