// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

/**
 * PackagesDetailTemplate
 * =============================================================================
 * Page-level composition for rendering a **single** package/bundle detail page.
 *
 * PURPOSE
 * - Provide a thin, documented shell that wires validated package content into
 *   the UI sections (Hero, Overview/Super Card, Extras, Add-ons, Related, CTA, FAQ).
 * - Keep **content rules** and **UI policies** centralized in shared libraries:
 *     • Pricing rules → "@/packages/lib/pricing"
 *     • CTA policy    → "@/packages/lib/copy" + "@/packages/lib/registry/mappers"
 *     • Band variant  → resolved inside PackageDetailOverview via "@/packages/lib/band"
 * - Avoid authoring/schema logic in this component. It should be dominated by
 *   composition and light normalization for optional author shapes.
 *
 * INPUT SHAPE
 * - Accepts a flexible **PackageBundle** (domain type) plus a few optional
 *   authoring conveniences (e.g., `faqs`, `includes`, `image`, etc.).
 * - For validated “registry” packages you would typically *map* (or load) those
 *   into this template at the route level.
 *
 * KEY IMPLEMENTATION DETAILS
 * - ✅ Uses **buildIncludesTableFromGroups** from registry mappers to construct an
 *   optional 1-column “What’s included” fallback table from grouped bullets.
 *   This guarantees consistent IDs/captions and prevents bespoke, divergent logic.
 * - ✅ Resolves **CTA policy** via `buildDetailCtas` (detail surfaces) and
 *   `buildCardCtas` (pinned/rail cards).
 * - ✅ Uses `startingAtLabel` for the CTA band subtitle (marketing-friendly).
 * - 🧠 The price band **variant** is NOT decided here; it’s computed within
 *   `<PackageDetailOverview />` using `bandPropsFor("detail", price, priceBand)`.
 *
 * ACCESSIBILITY
 * - Each major region is labeled with `aria-label`.
 * - Headings and sections in downstream components (Phase wrappers) provide
 *   predictable, screen-reader friendly structure.
 *
 * PERFORMANCE
 * - Only uses inexpensive React memoization for derived arrays/props.
 * - Heavy work (MDX → JSON → Zod validation) happens at build/loader step.
 */

import * as React from "react";
import styles from "./PackagesDetailTemplate.module.css";

/* --------------------------------- Types ---------------------------------- */
import type { PackageBundle } from "@/packages/lib/types/types";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";

/* ------------------------------- Data & utils ------------------------------ */
import { emitServiceJsonLd } from "@/packages/lib/jsonld";
import { toPackageCard } from "@/packages/lib/adapters";
import { startingAtLabel } from "@/packages/lib/types/pricing";
import {
  buildCardCtas,
  buildDetailCtas,
  buildIncludesTableFromGroups, // ✅ canonical fallback-table builder
} from "@/packages/lib/registry/mappers";

/* --------------------------------- Layout --------------------------------- */
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQSection from "@/components/sections/section-layouts/FAQSection";

/* --------------------------------- Detail --------------------------------- */
import PackageDetailOverview from "@/packages/sections/PackageDetailOverview";
import PackageDetailExtras from "@/packages/sections/PackageDetailExtras";
import AddOnSection from "@/packages/sections/AddOnSection";
import RelatedItemsRail from "@/packages/components/RelatedItemsRail";

/* ----------------------------------------------------------------------------
 * Props
 * -------------------------------------------------------------------------- */

export type PackagesDetailTemplateProps = {
  /**
   * Primary data model for this page. `PackageBundle` is a domain type:
   * - `price` is canonical Money { monthly?, oneTime?, currency? }
   * - `includes` is structured groups [{ title, items[] }]
   * - `outcomes`, `faqs`, `image`, etc. are optional conveniences here
   */
  bundle: PackageBundle & {
    slug?: string;
    service?: string;
    services?: string[];
    tags?: string[];

    /** Headline stack */
    name?: string;
    title?: string;
    summary?: string;       // short value prop
    description?: string;   // longer paragraph for Detail Overview
    icp?: string;

    /** Pricing (canonical Money shape) */
    price?: { oneTime?: number; monthly?: number; currency?: "USD" };

    /** Content collections */
    outcomes?: Array<string | { label: string }>;
    includes?: Array<{ title: string; items: (string | { label: string; note?: string })[] }>;
    notes?: string | string[];

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
 * Small helpers (pure)
 * -------------------------------------------------------------------------- */

/** Normalize an authored FAQ shape to `{ id, question, answer }[]`. */
function normalizeFaqs(input: unknown, fallback: unknown = []): Array<{ id: string; question: string; answer: string }> {
  const authored = Array.isArray((input as any)?.faqs)
    ? (input as any).faqs
    : Array.isArray(input)
    ? (input as any)
    : [];

  const normalizedAuthored = authored.map((f: any, i: number) => ({
    id: String(f?.id ?? i),
    question: f?.question ?? f?.q ?? "",
    answer: f?.answer ?? f?.a ?? "",
  })).filter((f: any) => f.question || f.answer);

  if (normalizedAuthored.length > 0) return normalizedAuthored;

  const normalizedFallback = (Array.isArray(fallback) ? fallback : []).map((f: any, i: number) => ({
    id: String(f?.id ?? i),
    question: f?.question ?? f?.q ?? "",
    answer: f?.answer ?? f?.a ?? "",
  })).filter((f: any) => f.question || f.answer);

  return normalizedFallback;
}

/** Ensure a footnote-like value renders safely; join arrays with bullets. */
function normalizeFootnote(input?: unknown): string | undefined {
  if (input == null) return undefined;
  if (typeof input === "string") return input.trim() || undefined;
  if (typeof input === "number") return String(input);
  if (Array.isArray(input)) return input.filter(Boolean).join(" • ") || undefined;
  return undefined;
}

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
  const heroSubtitle = bundle.summary ?? (bundle as any).valueProp ?? (bundle as any).subtitle ?? "";

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

  /**
   * Optional fallback “What’s included” table.
   * We prefer *groups* for the “What you get” section. But for legacy renderers
   * or matrix displays, we can pass a simple 1-column presence table built from
   * the groups. This builder guarantees consistent IDs/captions across the app.
   */
  const includesTable: PackageIncludesTableProps | undefined = React.useMemo(() => {
    const groups = (bundle as any).includes;
    if (!Array.isArray(groups) || groups.length === 0) return undefined;
    return buildIncludesTableFromGroups({ name: heroTitle, includes: groups });
  }, [bundle, heroTitle]);

  // Explicit empty fallback (keeps renderer predictable in rigid layouts)
  const emptyIncludes: PackageIncludesTableProps = React.useMemo(
    () => ({ caption: "What’s included", columns: [], rows: [] }),
    [],
  );

  /* ------------------------------------------------------------------------ *
   * PINNED CARD & RELATED
   * ------------------------------------------------------------------------ */
  const pinnedCardBase = toPackageCard(bundle);

  // ✅ Use mappers builders (card CTA policy lives there)
  const {
    primaryCta: pinnedPrimary,
    secondaryCta: pinnedSecondary,
  } = buildCardCtas(bundle.name ?? bundle.slug ?? heroTitle, bundle.slug ?? "");

  const pinnedCard = {
    ...pinnedCardBase,
    variant: "rail" as const,
    primaryCta: pinnedPrimary,
    secondaryCta: pinnedSecondary,
  };

  const relatedRailItems = React.useMemo(
    () => related.map((b) => ({ ...toPackageCard(b), variant: "rail" as const })),
    [related],
  );

  // Schema.org JSON-LD for SEO
  const jsonLd = emitServiceJsonLd(bundle);

  // ✅ Detail section CTAs from mappers (labels+href+aria policy)
  const { primary: sectionPrimaryCta, secondary: sectionSecondaryCta } = buildDetailCtas(heroTitle);

  // CTA band subtitle derived from canonical price
  const priceSubtitle = bundle.price ? startingAtLabel(bundle.price as any) : undefined;

  // Outcomes normalized to strings for Overview
  const outcomes: string[] =
    (bundle as any).outcomes?.map((o: any) => (typeof o === "string" ? o : o?.label)).filter(Boolean) ?? [];

  // Chips shown in HERO (omit in Overview to avoid duplication)
  const tagChips = (bundle as any).tags ?? (bundle as any).services ?? [];

  // Extras (Timeline / Ethics only — deliverables appear elsewhere by design)
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

  // Normalized FAQs (author-provided or page-level fallback)
  const normalizedFaqs = React.useMemo(
    () => normalizeFaqs((bundle as any)?.faqs ?? (bundle as any)?.faq?.faqs, faqs),
    [bundle, faqs],
  );

  const faqTitle =
    (bundle as any)?.faq?.title /* optional authored title */ ?? "Frequently asked questions";

  /* ------------------------------------------------------------------------ *
   * RENDER
   * ------------------------------------------------------------------------ */
  return (
    <article
      className={styles.detailTemplate}
      data-template="packages-detail"
      data-bundle={bundle.slug ?? ""}
    >
      {/* ============================== SEO =============================== */}
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
          /* Phase 1 (Hero within super-card) */
          title={heroTitle}
          valueProp={heroSubtitle}
          description={(bundle as any).description}
          icp={(bundle as any).icp}
          /* De-dup meta: let the HERO show chips; hide them in overview */
          service={undefined as any}
          tags={undefined}
          showMeta={false}
          /* Canonical price only (renderer derives band via bandPropsFor internally) */
          packagePrice={(bundle as any).price}
          /* CTAs (policy standard for detail pages) */
          ctaPrimary={sectionPrimaryCta}       // "Request proposal" → /contact
          ctaSecondary={sectionSecondaryCta}   // "Book a call" → /book
          /* Phase 2+ (Why / What) */
          outcomes={outcomes}
          /* Prefer groups; table is legacy/alt presentation */
          includesGroups={(bundle as any).includes}
          includesTitle="What’s included"
          includesVariant="cards"
          includesMaxCols={3}
          includesDense={false}
          includesShowIcons
          includesFootnote={normalizeFootnote((bundle as any).notes)}
          /* Optional fallback table (legacy/matrix cases). If absent, pass an explicit empty table
             to keep downstream renderers predictable in strict layouts. */
          includesTable={(includesTable as any) ?? emptyIncludes}
          /* Right sticky card */
          pinnedPackageCard={pinnedCard as any}
          /* Phase 4 (Details) is rendered separately via PackageDetailExtras */
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
      {normalizedFaqs.length > 0 && (
        <FullWidthSection
          aria-label="Frequently asked questions"
          containerSize="wide"
          containerSpacing="sm"
          className={styles.faqSection}
        >
          <FAQSection
            id="bundle-faq"
            title={faqTitle}
            faqs={normalizedFaqs}
            variant="default"
            allowMultiple={false}
            enableSearch={true}
            enableCategoryFilter={false}
            searchPlaceholder="Search FAQs"
          />
        </FullWidthSection>
      )}
    </article>
  );
}
