// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

import * as React from "react";
import styles from "./PackagesDetailTemplate.module.css";

import type { PackageBundle } from "@/packages/lib/types";
import { emitServiceJsonLd } from "@/packages/lib/jsonld";
import { toPackageCard } from "@/packages/lib/adapters";
import { sectionCtas, cardCtas } from "@/packages/lib/cta";
import { startingAtLabel } from "@/packages/lib/pricing";

// Layout wrapper
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";

// Page-level sections
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQSection from "@/components/sections/section-layouts/FAQSection";

// Detail stack
import PackageDetailOverview from "@/packages/sections/PackageDetailOverview";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import AddOnSection from "@/packages/sections/AddOnSection";
import RelatedItemsRail from "@/packages/components/RelatedItemsRail";
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";

/* ----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type PackagesDetailTemplateProps = {
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

    /** Legacy + new FAQ authoring shapes */
    faq?: { title?: string; faqs?: Array<{ q?: string; a?: string; id?: string | number }> };
    faqs?: Array<{ question?: string; answer?: string; id?: string | number }>;

    addOnRecommendations?: string[];

    /** Media passed to Hero */
    image?: { src?: string; alt?: string };

    /** Extras (deliverables handled elsewhere by design) */
    timeline?: { setup?: string; launch?: string; ongoing?: string };
    ethics?: string[];
  };

  related?: PackageBundle[];
  addOns?: Array<any>;
  faqs?: Array<{ id?: string | number; question?: string; answer?: string }>;
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
  // --------------------------- HERO CONTENT ---------------------------
  const heroTitle = bundle.title ?? (bundle as any).name ?? "Package";
  const heroSubtitle =
    bundle.summary ?? (bundle as any).valueProp ?? (bundle as any).subtitle ?? "";

  // Pass hero image via `media` (this is the key for background/visual mode)
  const heroImage = (bundle as any).image as { src?: string; alt?: string } | undefined;
  const heroMedia =
    heroImage?.src
      ? ({ type: "image", src: heroImage.src, alt: heroImage.alt } as const)
      : undefined;

  // ---------------------- DERIVED COLLECTIONS/FLAGS -------------------
  const hasAddOns = (addOns?.length ?? 0) > 0;
  const hasRelated = (related?.length ?? 0) > 0;

  // Build the single-column includes table inline ({ columns, rows })
  const includesTable: PackageIncludesTableProps | undefined = React.useMemo(() => {
    const groups = (bundle as any).includes as Array<{ title: string; items: string[] }> | undefined;
    if (!groups?.length) return undefined;

    const rows =
      groups.flatMap((group) =>
        (group.items ?? []).map((item, i) => ({
          id: `${group.title.toLowerCase().replace(/\s+/g, "-")}-${i}`,
          label: `${group.title} — ${item}`,
          values: { pkg: true },
        })),
      ) ?? [];

    if (!rows.length) return undefined;

    return {
      caption: "What’s included",
      columns: [{ id: "pkg", label: heroTitle }],
      rows,
    } as PackageIncludesTableProps;
  }, [bundle, heroTitle]);

  // Explicit empty fallback (no-op for the table component)
  const emptyIncludes: PackageIncludesTableProps = {
    caption: "What’s included",
    columns: [],
    rows: [],
  };

  // Pinned rail card & related rails
  const pinnedCardBase = toPackageCard(bundle);
  const { primary, secondary } = cardCtas(bundle.slug ?? "");
  const pinnedCard = {
    ...pinnedCardBase,
    variant: "rail",
    primaryCta: primary,
    secondaryCta: secondary,
  };
  const relatedRailItems = React.useMemo(
    () => related.map((b) => ({ ...toPackageCard(b), variant: "rail" })),
    [related],
  );

  // SEO JSON-LD
  const jsonLd = emitServiceJsonLd(bundle);

  // CTAs (policy standard)
  const { primary: sectionPrimaryCta, secondary: sectionSecondaryCta } = sectionCtas();

  // CTA band subtitle from canonical price
  const priceSubtitle = bundle.price ? startingAtLabel(bundle.price as any) : undefined;

  // Outcomes (normalize)
  const outcomes: string[] =
    (bundle as any).outcomes?.map((o: any) => (typeof o === "string" ? o : o?.label)).filter(Boolean) ?? [];

  // Chips shown in hero (omitted in overview)
  const tagChips = (bundle as any).tags ?? (bundle as any).services ?? [];

  // Extras (Timeline / Ethics only)
  const extras = React.useMemo(
    () => ({
      timeline: (bundle as any).timeline as
        | { setup?: string; launch?: string; ongoing?: string }
        | undefined,
      ethics: (bundle as any).ethics as string[] | undefined,
    }),
    [bundle],
  );

  const hasExtras =
    !!extras.timeline?.setup || !!extras.timeline?.launch || !!extras.timeline?.ongoing || !!extras.ethics?.length;

  // ----------------------------- RENDER --------------------------------
  return (
    <article className={styles.detailTemplate} data-template="packages-detail" data-bundle={bundle.slug ?? ""}>
      {/* SEO (schema.org) */}
      {jsonLd}

      {/* ============================== HERO ============================== */}
      <FullWidthSection
        aria-label="Overview hero"
        containerSize="full"
        containerSpacing="none"
        padded={false}
        className={styles.heroSection}
      >
        <ServiceHero
          title={heroTitle}
          subtitle={heroSubtitle}
          tags={tagChips}
          media={heroMedia}
          primaryCta={sectionPrimaryCta}
          secondaryCta={sectionSecondaryCta}
        />
      </FullWidthSection>

      {/* ========================== SUPER CARD =========================== */}
      <FullWidthSection
        aria-label="Package details at a glance"
        containerSize="wide"
        containerSpacing="sm"
        className={styles.overviewSection}
      >
        <PackageDetailOverview
          id={bundle.slug}
          title={heroTitle}
          valueProp={heroSubtitle}
          icp={(bundle as any).icp}
          /* De-dup meta: let the HERO show service/tags; hide in overview */
          service={undefined as any}
          tags={undefined}
          showMeta={false}
          /* Canonical price only (renderer derives “Starting at …”) */
          packagePrice={(bundle as any).price}
          /* CTAs (policy) */
          ctaPrimary={sectionPrimaryCta}
          ctaSecondary={sectionSecondaryCta}
          /* Outcomes & Includes */
          outcomes={outcomes}
          includesTable={(includesTable as any) ?? emptyIncludes}
          /* Right sticky card */
          pinnedPackageCard={pinnedCard as any}
          /* Notes (plain text; component accepts ReactNode) */
          notes={(bundle as any).notes}
        />
      </FullWidthSection>

      {/* ============================== EXTRAS ============================ */}
      {hasExtras && (
        <FullWidthSection
          aria-label="Additional details"
          containerSize="wide"
          containerSpacing="sm"
          className={styles.extrasSection}
        >
          <PackageDetailExtras {...extras} />
        </FullWidthSection>
      )}

      {/* ============================== ADD-ONS =========================== */}
      {hasAddOns && (
        <FullWidthSection
          aria-label="Recommended add-ons"
          containerSize="wide"
          containerSpacing="sm"
          className={styles.addOnsSection}
        >
          <AddOnSection id="recommended-addons" title="Recommended add-ons" layout="carousel" addOns={addOns as any} />
        </FullWidthSection>
      )}

      {/* ============================== RELATED =========================== */}
      {hasRelated && (
        <FullWidthSection
          aria-label="Related packages"
          containerSize="wide"
          containerSpacing="sm"
          className={styles.relatedSection}
        >
          <RelatedItemsRail items={relatedRailItems as any} />
        </FullWidthSection>
      )}

      {/* ============================== CTA BAND ========================== */}
      <FullWidthSection
        aria-label="Get started"
        containerSize="wide"
        containerSpacing="sm"
        className={styles.ctaSection}
      >
        <CTASection
          title="Let’s shape your growth plan"
          subtitle={priceSubtitle}
          primaryCta={sectionPrimaryCta}
          secondaryCta={sectionSecondaryCta}
        />
      </FullWidthSection>

      {/* ============================== FAQ ============================== */}
      {
        // Normalize authored FAQs (supports both: bundle.faqs OR bundle.faq?.faqs)
        (() => {
          const rawAuthored =
            (Array.isArray((bundle as any)?.faqs) && (bundle as any).faqs) ||
            (Array.isArray((bundle as any)?.faq?.faqs) && (bundle as any).faq.faqs) ||
            [];

          // Normalize to { id, question, answer }
          const normalizedAuthored = rawAuthored.map((f: any, i: number) => ({
            id: String(f?.id ?? i),
            question: f?.question ?? f?.q,
            answer: f?.answer ?? f?.a,
          }));

          // Page-level fallback `faqs` prop
          const normalizedFallback = (faqs ?? []).map((f: any, i: number) => ({
            id: String(f?.id ?? i),
            question: f?.question ?? f?.q,
            answer: f?.answer ?? f?.a,
          }));

          const list = normalizedAuthored.length ? normalizedAuthored : normalizedFallback;
          const title =
            (bundle as any)?.faq?.title // legacy optional title if present
            ?? "Frequently asked questions";

          const show = list.length > 0;

          return show ? (
            <FullWidthSection
              aria-label="Frequently asked questions"
              containerSize="wide"
              containerSpacing="sm"
              className={styles.faqSection}
            >
              <FAQSection
                id="bundle-faq"
                title={title}
                faqs={list}                 // <-- correct prop for FAQSection
                variant="default"
                allowMultiple={false}
                enableSearch={true}
                enableCategoryFilter={false}
                searchPlaceholder="Search FAQs"
              />
            </FullWidthSection>
          ) : null;
        })()
      }
    </article>
  );
}
