// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

import * as React from "react";
import styles from "./PackagesDetailTemplate.module.css";

import type { PackageBundle } from "@/packages/lib/types";
import { emitServiceJsonLd, hasServicePrice } from "@/packages/lib/jsonld";
import { toPackageCard, toIncludesTable, toPriceBlock } from "@/packages/lib/adapters";

// Page-level sections
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";
// ⬇️ fix: import the concrete file to avoid broken index re-exports
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQSection from "@/components/sections/section-layouts/FAQSection";

// Detail stack
import PackageDetailOverview from "@/packages/sections/PackageDetailOverview";
import PriceBlock from "@/packages/components/PriceBlock";
import PackagePricingMatrix, {
  type PackagePricingMatrixProps,
} from "@/packages/components/PackagePricingMatrix";
import AddOnSection from "@/packages/sections/AddOnSection";
import RelatedItemsRail from "@/packages/components/RelatedItemsRail";

export type PackagesDetailTemplateProps = {
  /** The bundle/package to render */
  bundle: PackageBundle;
  /** Optional: curated related bundles/packages for the rail */
  related?: PackageBundle[];
  /** Optional: recommended add-ons for this bundle */
  addOns?: Array<any>;
  /** Optional: FAQ entries (fallback if bundle has none) */
  faqs?: Array<{ id?: string | number; question: string; answer: string }>;
};

export default function PackagesDetailTemplate({
  bundle,
  related = [],
  addOns = [],
  faqs = [],
}: PackagesDetailTemplateProps) {
  // --------------------------
  // Hero content (safe defaults)
  // --------------------------
  const heroTitle = bundle.title ?? (bundle as any).name ?? "Package";
  const heroSubtitle =
    bundle.summary ?? (bundle as any).valueProp ?? (bundle as any).subtitle;

  // --------------------------
  // Derived booleans
  // --------------------------
  const hasAddOns = (addOns?.length ?? 0) > 0;
  const hasRelated = (related?.length ?? 0) > 0;
  const bundleFaqItems = (bundle as any)?.faq?.faqs ?? [];
  const hasFaq = (bundleFaqItems.length ?? 0) > 0 || (faqs?.length ?? 0) > 0;

  // --------------------------
  // Adapters / models
  // --------------------------
  const overviewIncludes = toIncludesTable(bundle);
  const overviewPinnedCard = toPackageCard(bundle);
  const priceBlockModel = toPriceBlock(bundle);
  const shouldRenderServiceJsonLd = hasServicePrice(bundle);

  // Pricing Matrix: accept an in-object model if provided; otherwise omit
  const pricingMatrixModel = React.useMemo<PackagePricingMatrixProps | null>(() => {
    const m =
      (bundle as any)?.pricingMatrix ??
      (bundle as any)?.matrix ??
      (bundle as any)?.pricing?.matrix;

    if (m && Array.isArray(m.columns) && Array.isArray(m.groups)) {
      return m as PackagePricingMatrixProps;
    }
    return null;
  }, [bundle]);

  // Related rail items — pass the adapted cards (the rail handles presentation)
  const relatedRailItems = related.map((b) => toPackageCard(b));

  // Schema.org JSON-LD (service) for SEO
  const jsonLd = shouldRenderServiceJsonLd ? emitServiceJsonLd(bundle) : null;

  return (
    <article className={styles.wrap}>
      {/* SEO (schema.org) */}
      {jsonLd}

      {/* =========================================================
          PAGE HERO — ServiceHero
         ========================================================= */}
      <ServiceHero
        title={heroTitle}
        subtitle={heroSubtitle}
        tags={(bundle as any)?.services ?? (bundle as any)?.tags ?? []}
        primaryCta={{ label: "Request proposal", href: "/contact" }}
        secondaryCta={{ label: "Book a call", href: "/book" }}
      />

      {/* =========================================================
          SUPER CARD (AT A GLANCE) — PackageDetailOverview
         ========================================================= */}
      <PackageDetailOverview
        id={bundle.slug}
        title={heroTitle}
        valueProp={heroSubtitle}
        icp={(bundle as any).icp}
        service={(bundle as any).primaryService ?? (bundle as any).services?.[0]}
        tags={(bundle as any).services ?? []}
        packagePrice={(bundle as any).price}
        ctaPrimary={{ label: "Request proposal", href: "/contact" }}
        ctaSecondary={{ label: "Book a call", href: "/book" }}
        outcomes={(bundle as any).outcomes}
        includesTable={overviewIncludes as any}
        pinnedPackageCard={overviewPinnedCard as any}
        notes={(bundle as any).assumptionsNote}
      />

      {/* =========================================================
          PRICING — PriceBlock + PackagePricingMatrix (optional)
         ========================================================= */}
      <section className={styles.section} aria-label="Pricing">
        <PriceBlock {...(priceBlockModel as any)} />
        {pricingMatrixModel ? <PackagePricingMatrix {...pricingMatrixModel} /> : null}
      </section>

      {/* =========================================================
          NARRATIVE — compiled HTML from MDX
         ========================================================= */}
      {(bundle as any)?.content?.html && (
        <section className={styles.section} aria-label="Narrative">
          {/* eslint-disable-next-line react/no-danger */}
          <article dangerouslySetInnerHTML={{ __html: (bundle as any).content.html }} />
        </section>
      )}

      {/* =========================================================
          ADD-ONS — recommended upsells
         ========================================================= */}
      {hasAddOns && (
        <section className={styles.section} aria-label="Recommended add-ons">
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
        <section className={styles.section} aria-label="Related packages">
          <RelatedItemsRail items={relatedRailItems as any} />
        </section>
      )}

      {/* =========================================================
          CTA BAND — closing call to action
         ========================================================= */}
      <section className={styles.section} aria-label="Get started">
        <CTASection
          title="Let’s shape your growth plan"
          description="We’ll scope your package and timeline in a quick call."
          primaryCta={{ label: "Request proposal", href: "/contact" }}
          secondaryCta={{ label: "Book a call", href: "/book" }}
        />
      </section>

      {/* =========================================================
          FAQ — final panel
         ========================================================= */}
      {hasFaq && (
        <FAQSection
          id="bundle-faq"
          title={(bundle as any)?.faq?.title ?? "Frequently asked questions"}
          items={(bundleFaqItems.length ? bundleFaqItems : faqs).map((f: any, i: number) => ({
            id: String(f?.id ?? i),
            question: f.question,
            answer: f.answer,
          }))}
        />
      )}
    </article>
  );
}
