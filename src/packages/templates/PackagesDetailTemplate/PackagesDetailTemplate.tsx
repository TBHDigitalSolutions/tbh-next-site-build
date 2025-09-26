// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

import * as React from "react";
import styles from "./PackagesDetailTemplate.module.css";

import type { PackageBundle } from "@/packages/lib/types";
import { emitServiceJsonLd } from "@/packages/lib/jsonld";
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
import type { OutcomeItem } from "@/components/ui/molecules/OutcomeList/OutcomeList";

const DEFAULT_PRIMARY_CTA = { label: "Request proposal", href: "/contact" } as const;
const DEFAULT_SECONDARY_CTA = { label: "Book a call", href: "/book" } as const;

type BundleFaqItem = NonNullable<PackageBundle["faq"]>["faqs"][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCellValue(value: unknown): boolean {
  if (typeof value === "boolean") return true;
  if (value === "limit" || value === "add-on") return true;
  if (typeof value === "number" || typeof value === "string") return true;
  if (isRecord(value) && ("money" in value || "note" in value)) return true;
  return false;
}

function isMatrixColumn(value: unknown): value is PackagePricingMatrixProps["columns"][number] {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.label !== "string") return false;
  if ("note" in value && value.note != null && typeof value.note !== "string") return false;
  return true;
}

function isMatrixRow(value: unknown): value is PackagePricingMatrixProps["groups"][number]["rows"][number] {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.label !== "string") return false;
  if ("note" in value && value.note != null && typeof value.note !== "string") return false;
  if (!isRecord(value.values)) return false;
  return Object.values(value.values).every(isCellValue);
}

function isMatrixGroup(value: unknown): value is PackagePricingMatrixProps["groups"][number] {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.label !== "string") return false;
  if ("note" in value && value.note != null && typeof value.note !== "string") return false;
  if (!Array.isArray(value.rows)) return false;
  return value.rows.every(isMatrixRow);
}

function isPackagePricingMatrix(
  value: PackageBundle["pricingMatrix"],
): value is PackagePricingMatrixProps {
  if (!value) return false;
  if (!Array.isArray(value.columns) || !Array.isArray(value.groups)) return false;
  return value.columns.every(isMatrixColumn) && value.groups.every(isMatrixGroup);
}

function toOutcomeList(outcomes: PackageBundle["outcomes"]): Array<string | OutcomeItem> {
  if (!outcomes) return [];
  if (Array.isArray(outcomes)) return [...outcomes];
  if (isRecord(outcomes) && Array.isArray((outcomes as { items?: unknown }).items)) {
    return (outcomes.items as Array<{ label: string; value?: string }>).map((item, index) => ({
      id: item.label ? `outcome-${index}` : `outcome-${index}`,
      label: item.label,
      note: item.value,
    }));
  }
  return [];
}

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
  const heroTitle =
    bundle.hero?.content?.title ?? bundle.title ?? bundle.name ?? "Package";
  const heroSubtitle =
    bundle.hero?.content?.subtitle ??
    bundle.summary ??
    bundle.valueProp ??
    bundle.subtitle ??
    bundle.description ??
    "";
  const heroPrimaryCta = bundle.hero?.content?.primaryCta ?? DEFAULT_PRIMARY_CTA;
  const heroSecondaryCta =
    bundle.hero?.content?.secondaryCta ?? DEFAULT_SECONDARY_CTA;
  const heroButton = { text: heroPrimaryCta.label, href: heroPrimaryCta.href };
  const heroMedia =
    bundle.hero?.background?.type === "image"
      ? {
          type: "image" as const,
          src: bundle.hero.background.src,
          alt: bundle.hero.background.alt,
        }
      : undefined;

  // --------------------------
  // Derived booleans
  // --------------------------
  const hasAddOns = (addOns?.length ?? 0) > 0;
  const hasRelated = (related?.length ?? 0) > 0;
  const bundleFaqItems: BundleFaqItem[] = bundle.faq?.faqs ?? [];
  const hasFaq = bundleFaqItems.length > 0 || faqs.length > 0;

  // --------------------------
  // Adapters / models
  // --------------------------
  const overviewIncludes = toIncludesTable(bundle);
  const overviewPinnedCard = toPackageCard(bundle);
  const priceBlockModel = toPriceBlock(bundle);
  const overviewOutcomes = React.useMemo<Array<string | OutcomeItem>>(
    () => toOutcomeList(bundle.outcomes),
    [bundle.outcomes],
  );
  const normalizedFaqItems = React.useMemo(
    () =>
      (bundleFaqItems.length ? bundleFaqItems : faqs).map((faq, index) => ({
        id: String(("id" in faq && faq.id != null ? faq.id : index)),
        question: faq.question,
        answer: faq.answer,
      })),
    [bundleFaqItems, faqs],
  );

  // Pricing Matrix: accept an in-object model if provided; otherwise omit
  const pricingMatrixModel = React.useMemo<PackagePricingMatrixProps | null>(() => {
    return isPackagePricingMatrix(bundle.pricingMatrix) ? bundle.pricingMatrix : null;
  }, [bundle.pricingMatrix]);

  // Related rail items — pass the adapted cards (the rail handles presentation)
  const relatedRailItems = related.map((b) => toPackageCard(b));

  // Schema.org JSON-LD (service) for SEO
  const jsonLd = emitServiceJsonLd(bundle);

  return (
    <article className={styles.wrap}>
      {/* SEO (schema.org) */}
      {jsonLd}

      {/* =========================================================
          PAGE HERO — ServiceHero
         ========================================================= */}
      <ServiceHero title={heroTitle} subtitle={heroSubtitle} media={heroMedia} button={heroButton} />

      {/* =========================================================
          SUPER CARD (AT A GLANCE) — PackageDetailOverview
         ========================================================= */}
      <PackageDetailOverview
        id={bundle.slug}
        title={heroTitle}
        valueProp={heroSubtitle}
        icp={bundle.icp}
        service={bundle.primaryService ?? bundle.service ?? bundle.services?.[0]}
        tags={bundle.tags?.length ? bundle.tags : bundle.services ?? []}
        packagePrice={bundle.price}
        ctaPrimary={heroPrimaryCta}
        ctaSecondary={heroSecondaryCta}
        outcomes={overviewOutcomes}
        includesTable={overviewIncludes as any}
        pinnedPackageCard={overviewPinnedCard as any}
        notes={bundle.assumptionsNote}
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
      {bundle.content?.html && (
        <section className={styles.section} aria-label="Narrative">
          {/* eslint-disable-next-line react/no-danger */}
          <article dangerouslySetInnerHTML={{ __html: bundle.content.html }} />
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
        {(() => {
          const ctaContent =
            bundle.cta ?? {
              title: "Let’s shape your growth plan",
              subtitle: "We’ll scope your package and timeline in a quick call.",
              primaryCta: DEFAULT_PRIMARY_CTA,
              secondaryCta: DEFAULT_SECONDARY_CTA,
              layout: "centered" as const,
            };
          const ctaPrimary = ctaContent.primaryCta ?? DEFAULT_PRIMARY_CTA;
          const ctaSecondary = ctaContent.secondaryCta ?? DEFAULT_SECONDARY_CTA;
          const ctaStyle =
            ctaContent.layout === "centered" ||
            ctaContent.layout === "split" ||
            ctaContent.layout === "fullwidth"
              ? ctaContent.layout
              : "centered";
          const ctaTitle = ctaContent.title ?? "Let’s shape your growth plan";
          const ctaDescription =
            ctaContent.subtitle ?? "We’ll scope your package and timeline in a quick call.";

          return (
            <CTASection
              title={ctaTitle}
              description={ctaDescription}
              primaryCta={ctaPrimary}
              secondaryCta={ctaSecondary}
              style={ctaStyle}
            />
          );
        })()}
      </section>

      {/* =========================================================
          FAQ — final panel
         ========================================================= */}
      {hasFaq && (
        <FAQSection
          id="bundle-faq"
          title={bundle.faq?.title ?? "Frequently asked questions"}
          items={normalizedFaqItems}
        />
      )}
    </article>
  );
}
