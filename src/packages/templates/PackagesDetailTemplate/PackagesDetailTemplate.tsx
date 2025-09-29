// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

/* =============================================================================
   PackagesDetailTemplate
   - Page-level composition for a single package/bundle
   - Renders the hero, overview (super card), extras, add-ons, related, CTA band,
     and FAQ with consistent containers.
   - Important fixes included:
     • Pass `description` to PackageDetailOverview → TitleBlock.
     • Pass `includesGroups={bundle.includes}` (SSOT) to PackageDetailOverview.
     • Keep table fallback for legacy/matrix includes (will be removed later).
     • Normalize authored FAQs (supports both legacy `faq.faqs` and flat `faqs`).
     • Use FullWidthSection wrappers with requested container sizing.
============================================================================= */

import * as React from "react";
import styles from "./PackagesDetailTemplate.module.css";

/* ------------------------------- Data & utils ------------------------------ */
import type { PackageBundle } from "@/packages/lib/types";
import { emitServiceJsonLd } from "@/packages/lib/jsonld";
import { toPackageCard } from "@/packages/lib/adapters";
import { sectionCtas, cardCtas } from "@/packages/lib/cta";
import { startingAtLabel } from "@/packages/lib/pricing";

/* --------------------------------- Layout --------------------------------- */
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";

/* --------------------------- Page-level sections --------------------------- */
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQSection from "@/components/sections/section-layouts/FAQSection";

/* --------------------------------- Detail --------------------------------- */
import PackageDetailOverview from "@/packages/sections/PackageDetailOverview";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import AddOnSection from "@/packages/sections/AddOnSection";
import RelatedItemsRail from "@/packages/components/RelatedItemsRail";
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";

/* ----------------------------------------------------------------------------
 * Types
 * -------------------------------------------------------------------------- */

export type PackagesDetailTemplateProps = {
  /** SSOT bundle; minimal typing + flexible optional fields for authoring */
  bundle: PackageBundle & {
    slug?: string;
    service?: string;
    services?: string[];
    tags?: string[];

    /** Headline stack */
    name?: string;
    title?: string;
    summary?: string;       // short value prop
    description?: string;   // longer paragraph used on detail overview
    icp?: string;

    /** Pricing (canonical Money shape) */
    price?: { oneTime?: number; monthly?: number; currency?: "USD" };

    /** Content collections */
    outcomes?: Array<string | { label: string }>;
    includes?: Array<{ title: string; items: (string | { label: string; note?: string })[] }>;
    notes?: string;

    /** FAQ — support both legacy and flat shapes */
    faq?: { title?: string; faqs?: Array<{ q?: string; a?: string; id?: string | number }> };
    faqs?: Array<{ question?: string; answer?: string; id?: string | number }>;

    /** Media (hero background) */
    image?: { src?: string; alt?: string };

    /** Extras shown in PackageDetailExtras */
    timeline?: { setup?: string; launch?: string; ongoing?: string };
    ethics?: string[];

    addOnRecommendations?: string[];
  };

  /** Optional related bundles and add-ons (already resolved upstream) */
  related?: PackageBundle[];
  addOns?: Array<any>;

  /** Optional page-level FAQ fallback */
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
  /* ------------------------------------------------------------------------ *
   * HERO CONTENT
   * ------------------------------------------------------------------------ */
  const heroTitle = bundle.title ?? (bundle as any).name ?? "Package";
  const heroSubtitle =
    bundle.summary ?? (bundle as any).valueProp ?? (bundle as any).subtitle ?? "";

  // Pass hero image via `media` (expected API for visual/background hero)
  const heroImage = (bundle as any).image as { src?: string; alt?: string } | undefined;
  const heroMedia =
    heroImage?.src
      ? ({ type: "image", src: heroImage.src, alt: heroImage.alt } as const)
      : undefined;

  /* ------------------------------------------------------------------------ *
   * DERIVED COLLECTIONS / FLAGS
   * ------------------------------------------------------------------------ */
  const hasAddOns = (addOns?.length ?? 0) > 0;
  const hasRelated = (related?.length ?? 0) > 0;

  // Build a simple one-column "What's included" table from grouped bullets (fallback only)
  const includesTable: PackageIncludesTableProps | undefined = React.useMemo(() => {
    const groups = (bundle as any).includes as Array<{ title: string; items: string[] }> | undefined;
    if (!groups?.length) return undefined;

    const rows =
      groups.flatMap((group) =>
        (group.items ?? []).map((item, i) => ({
          id: `${group.title.toLowerCase().replace(/\s+/g, "-")}-${i}`,
          label: `${group.title} — ${typeof item === "string" ? item : (item as any)?.label ?? ""}`,
          values: { pkg: true }, // single checkmark column
        })),
      ) ?? [];

    if (!rows.length) return undefined;

    return {
      caption: "What’s included",
      columns: [{ id: "pkg", label: heroTitle }],
      rows,
    } as PackageIncludesTableProps;
  }, [bundle, heroTitle]);

  // Explicit empty fallback (keeps renderer predictable)
  const emptyIncludes: PackageIncludesTableProps = {
    caption: "What’s included",
    columns: [],
    rows: [],
  };

  // Pinned rail card & related rails (adapted from bundle)
  const pinnedCardBase = toPackageCard(bundle);
  const { primary, secondary } = cardCtas(bundle.slug ?? "");
  const pinnedCard = { ...pinnedCardBase, variant: "rail", primaryCta: primary, secondaryCta: secondary };
  const relatedRailItems = React.useMemo(
    () => related.map((b) => ({ ...toPackageCard(b), variant: "rail" })),
    [related],
  );

  // Schema.org JSON-LD for SEO
  const jsonLd = emitServiceJsonLd(bundle);

  // CTAs (policy standard)
  const { primary: sectionPrimaryCta, secondary: sectionSecondaryCta } = sectionCtas();

  // CTA band subtitle derived from canonical price
  const priceSubtitle = bundle.price ? startingAtLabel(bundle.price as any) : undefined;

  // Outcomes normalized (strings → {label} → string[])
  const outcomes: string[] =
    (bundle as any).outcomes?.map((o: any) => (typeof o === "string" ? o : o?.label)).filter(Boolean) ?? [];

  // Chips shown in HERO (omit in Overview to avoid duplication)
  const tagChips = (bundle as any).tags ?? (bundle as any).services ?? [];

  // Extras (Timeline / Ethics only — deliverables handled elsewhere by design)
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

  /* ------------------------------------------------------------------------ *
   * RENDER
   * ------------------------------------------------------------------------ */
  return (
    <article
      className={styles.detailTemplate}
      data-template="packages-detail"
      data-bundle={bundle.slug ?? ""}
    >
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
        containerSpacing="none"
        className={styles.overviewSection}
      >
        <PackageDetailOverview
          id={bundle.slug}
          title={heroTitle}
          valueProp={heroSubtitle}
          description={(bundle as any).description}  // long blurb into TitleBlock
          icp={(bundle as any).icp}

          /* De-dup meta: let the HERO show chips; hide them in overview */
          service={undefined as any}
          tags={undefined}
          showMeta={false}

          /* Canonical price only (renderer derives “Starting at …”) */
          packagePrice={(bundle as any).price}

          /* CTAs (policy standard for detail pages) */
          ctaPrimary={sectionPrimaryCta}       // "Request proposal" → /contact
          ctaSecondary={sectionSecondaryCta}   // "Book a call" → /book

          /* Outcomes & Includes */
          outcomes={outcomes}

          /* ✅ NEW: Pass SSOT groups directly from base.ts */
          includesGroups={(bundle as any).includes}
          includesTitle="What’s included"
          includesVariant="cards"              // default; explicit for clarity
          includesMaxCols={3}                  // three-up grid on desktop (“boom, boom”)
          includesDense={false}
          includesShowIcons
          includesFootnote={(bundle as any).notes}

          /* Optional fallback table (legacy/matrix cases) */
          includesTable={(includesTable as any) ?? emptyIncludes}

          /* Right sticky card */
          pinnedPackageCard={pinnedCard as any}

          /* Page-level notes (if you choose to keep a separate NotesBlock) */
          notes={undefined}
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
          <AddOnSection
            id="recommended-addons"
            title="Recommended add-ons"
            layout="carousel" /* or "grid" */
            addOns={addOns as any}
          />
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
        // Normalize FAQs from either authoring shape:
        (() => {
          const rawAuthored =
            (Array.isArray((bundle as any)?.faqs) && (bundle as any).faqs) ||
            (Array.isArray((bundle as any)?.faq?.faqs) && (bundle as any).faq.faqs) ||
            [];

          // → { id, question, answer }
          const normalizedAuthored = rawAuthored.map((f: any, i: number) => ({
            id: String(f?.id ?? i),
            question: f?.question ?? f?.q,
            answer: f?.answer ?? f?.a,
          }));

          // Page-level fallback
          const normalizedFallback = (faqs ?? []).map((f: any, i: number) => ({
            id: String(f?.id ?? i),
            question: f?.question ?? f?.q,
            answer: f?.answer ?? f?.a,
          }));

          const list = normalizedAuthored.length ? normalizedAuthored : normalizedFallback;
          const title =
            (bundle as any)?.faq?.title /* optional authored title */ ??
            "Frequently asked questions";

          if (list.length === 0) return null;

          return (
            <FullWidthSection
              aria-label="Frequently asked questions"
              containerSize="wide"
              containerSpacing="sm"
              className={styles.faqSection}
            >
              <FAQSection
                id="bundle-faq"
                title={title}
                faqs={list}                 // FAQSection expects `faqs`
                variant="default"
                allowMultiple={false}
                enableSearch={true}
                enableCategoryFilter={false}
                searchPlaceholder="Search FAQs"
              />
            </FullWidthSection>
          );
        })()
      }
    </article>
  );
}
