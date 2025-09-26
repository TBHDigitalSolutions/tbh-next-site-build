// src/packages/templates/PackagesHubTemplate/PackagesHubTemplate.tsx
// src/packages/templates/PackagesHubTemplate/PackagesHubTemplate.tsx
"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import styles from "./PackagesHubTemplate.module.css";

import type { PackageBundle } from "@/packages/lib/types";
import { toPackageCard } from "@/packages/lib/adapters";
import { emitItemListJsonLd } from "@/packages/lib/jsonld";
import type { PackagesSearchRecord } from "@/data/packages/_types/generated";

// Sections (hero/cta/faq)
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";
import { PackageCarousel } from "@/components/sections/section-layouts/PackageCarousel";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQSection from "@/components/sections/section-layouts/FAQSection"; // NEW

// Optional packages sections (rails/grids)
import AddOnSection from "@/packages/sections/AddOnSection";      // optional
import BundlesSection from "@/packages/sections/BundlesSection";  // optional

// Theme island (unified tokens for packages domain)
import pkgTheme from "@/styles/packages-unified.module.css";

/**
 * Some downstream builds export these as default, others as named.
 * Dynamic + tolerant resolution + client-only guarantees a valid element
 * and avoids "invalid element type" at runtime.
 */
const PackageCard = dynamic(
  () =>
    import("@/packages/components/PackageCard").then(
      (m: any) => m.default ?? m.PackageCard ?? m,
    ),
  { ssr: false },
) as any;

const PackagesToolbar = dynamic(
  () =>
    import("@/packages/components/PackagesToolbar").then(
      (m: any) => m.default ?? m.PackagesToolbar ?? m,
    ),
  { ssr: false },
) as any;

type SortKey = "recommended" | "alphabetical" | "priceAsc" | "priceDesc";

export type FaqItem = { id: string; question: string; answer: string };

export type PackagesHubTemplateProps = {
  title?: string;
  subtitle?: string;

  /** Bundles from facade (`@/data/packages`). */
  bundles: PackageBundle[];

  /** Curated slugs to lift in Featured rail & "Recommended" sort. */
  featuredSlugs?: string[];

  /** Precompiled search index for toolbar counts & downstream use. */
  searchIndex?: PackagesSearchRecord[];

  /** Toolbar toggles (forwarded to the toolbar as needed). */
  showSearch?: boolean;
  showServiceFilter?: boolean;
  showSort?: boolean;

  /** Initial sort key. */
  defaultSort?: SortKey;

  /** Grid card min width. */
  minCardWidthPx?: number;

  /** Emit ItemList JSON-LD for visible items. */
  jsonLd?: boolean;

  /** Empty state copy. */
  emptyMessage?: string;

  /** Optional copy overrides. */
  labels?: {
    featuredTitle?: string;
    ctaTitle?: string;
    ctaSubtitle?: string;
    ctaPrimary?: { label: string; href: string };
    ctaSecondary?: { label: string; href: string };
  };

  /** Optional: show curated bundles rail &/or add-ons below the grid */
  showBundlesSection?: boolean;
  showAddOnsSection?: boolean;
  bundlesForRail?: ReturnType<typeof toPackageCard>[]; // if you want a separate curated rail
  addOnsForSection?: any[]; // your add-on model, passed straight through to AddOnSection

  /** Final-panel FAQ items */
  faqItems?: FaqItem[];

  /** Extra class for outer wrapper. */
  className?: string;
};

type Indexed = {
  slug: string;
  title: string;
  summary: string;
  services: string[];
  includedServices: string[];
  tags: string[];
  card: ReturnType<typeof toPackageCard>;
  /** Prefer monthly for sort, fallback to one-time. */
  priceForSort?: number;
};

export default function PackagesHubTemplate({
  title = "Integrated Growth Packages",
  subtitle = "Proven playbooks bundled into simple plans — faster time to value, repeatable results.",
  bundles,
  featuredSlugs = [],
  searchIndex,
  showSearch = true,
  showServiceFilter = true,
  showSort = true,
  defaultSort = "recommended",
  minCardWidthPx = 300,
  jsonLd = true,
  emptyMessage = "No packages match your filters.",
  labels,
  showBundlesSection = false,
  showAddOnsSection = false,
  bundlesForRail,
  addOnsForSection,
  faqItems,
  className,
}: PackagesHubTemplateProps) {
  // Toolbar (owned here)
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<"all" | "bundles" | "packages" | "addons">("all");
  const [service, setService] = React.useState<string | undefined>(undefined);
  const [sort, setSort] = React.useState<"recommended" | "az" | "price-asc" | "price-desc">(
    defaultSort === "alphabetical"
      ? "az"
      : defaultSort === "priceAsc"
      ? "price-asc"
      : defaultSort === "priceDesc"
      ? "price-desc"
      : "recommended",
  );

  const featuredSet = React.useMemo(() => new Set(featuredSlugs), [featuredSlugs]);

  // Index once for search/filter/sort
  const index: Indexed[] = React.useMemo(
    () =>
      bundles.map((b) => {
        const card = toPackageCard(b, {
          featureLimit: 5,
          badgeFromMostPopular: true,
          highlightMostPopular: true,
          withBookCall: true,
        });

        const title = b.title ?? (b as any).name ?? card.name ?? b.slug;
        const summary = b.summary ?? b.subtitle ?? card.description ?? "";

        const monthly = card.price?.monthly;
        const oneTime = card.price?.oneTime;
        const priceForSort =
          typeof monthly === "number"
            ? monthly
            : typeof oneTime === "number"
            ? oneTime
            : undefined;

        return {
          slug: b.slug,
          title,
          summary,
          services: (b as any).services ?? [],
          includedServices: (b as any).includedServices ?? [],
          tags: (b as any).tags ?? [],
          card,
          priceForSort,
        };
      }),
    [bundles],
  );

  const featuredItems = React.useMemo(
    () => index.filter((it) => featuredSet.has(it.slug)),
    [index, featuredSet],
  );

  const countsByType = React.useMemo(() => {
    if (!Array.isArray(searchIndex) || searchIndex.length === 0) {
      return {
        all: index.length,
        bundles: index.length,
        packages: 0,
        addons: 0,
      };
    }

    return searchIndex.reduce(
      (acc, doc) => {
        acc.all += 1;
        switch (doc.docType) {
          case "bundle":
            acc.bundles += 1;
            break;
          case "package":
            acc.packages += 1;
            break;
          case "addon":
            acc.addons += 1;
            break;
          default:
            break;
        }
        return acc;
      },
      { all: 0, bundles: 0, packages: 0, addons: 0 },
    );
  }, [index.length, searchIndex]);

  // Service options
  const serviceOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const it of index) for (const s of it.services) if (s) set.add(s);
    return [
      { value: "all", label: "All services" },
      ...Array.from(set)
        .sort((a, b) => a.localeCompare(b))
        .map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
    ];
  }, [index]);

  // Filter + search + sort
  const filtered = React.useMemo(() => {
    const qNorm = query.trim().toLowerCase();

    const byType = index; // reserved (future mixed catalog)
    const byService =
      !service || service === "all"
        ? byType
        : byType.filter((it) => {
            const explicit = it.services.some((s) => s?.toLowerCase() === service.toLowerCase());
            if (explicit) return true;
            const hay = [...it.includedServices, ...it.tags].map((x) => String(x).toLowerCase());
            return hay.some((x) => x.includes(service.toLowerCase()));
          });

    const byQuery = qNorm
      ? byService.filter((it) =>
          [it.title, it.summary, it.tags.join(" "), it.services.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(qNorm),
        )
      : byService;

    const out = [...byQuery];
    switch (sort) {
      case "az":
        out.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "price-asc":
        out.sort(
          (a, b) =>
            (a.priceForSort ?? Number.POSITIVE_INFINITY) -
            (b.priceForSort ?? Number.POSITIVE_INFINITY),
        );
        break;
      case "price-desc":
        out.sort((a, b) => (b.priceForSort ?? 0) - (a.priceForSort ?? 0));
        break;
      case "recommended":
      default:
        out.sort((a, b) => {
          const fa = featuredSet.has(a.slug) ? 0 : 1;
          const fb = featuredSet.has(b.slug) ? 0 : 1;
          return fa - fb || a.title.localeCompare(b.title);
        });
        break;
    }
    return out;
  }, [index, query, service, sort, featuredSet]);

  // Grid columns
  const gridStyle = React.useMemo(
    () =>
      ({ gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidthPx}px, 1fr))` }) as React.CSSProperties,
    [minCardWidthPx],
  );

  // JSON-LD for visible list
  const jsonLdNode =
    jsonLd &&
    emitItemListJsonLd(
      filtered.map((it) => ({
        name: it.title,
        url: it.card.detailsHref ?? `/packages/${it.slug}`,
      })),
    );

  return (
    <section className={clsx(pkgTheme.packagesTheme, styles.wrap, className)}>
      {/* HERO ----------------------------------------------------- */}
      <ServiceHero
        title={title}
        subtitle={subtitle}
        primaryCta={{ label: "Book a call", href: "/book" }}
        secondaryCta={{ label: "All services", href: "/services" }}
      />

      {/* TOOLBAR -------------------------------------------------- */}
      <div className={styles.toolbarWrap}>
        <PackagesToolbar
          query={query}
          onQueryChange={setQuery}
          type={type}
          onTypeChange={setType}
          service={service}
          onServiceChange={setService}
          sort={sort}
          onSortChange={setSort}
          serviceOptions={serviceOptions}
          countsByType={countsByType}
        />
      </div>

      {/* FEATURED RAIL (optional) -------------------------------- */}
      {featuredItems.length > 0 && (
        <div className={styles.rail}>
          <PackageCarousel
            title={labels?.featuredTitle ?? "Popular packages"}
            items={featuredItems.map((it) => it.card as any)}
            layout="carousel"
            showFooterActions={false}
          />
        </div>
      )}

      {/* GRID ----------------------------------------------------- */}
      <div className={styles.grid} style={gridStyle}>
        {filtered.length === 0 ? (
          <div className={styles.empty} role="status" aria-live="polite">
            {emptyMessage}
          </div>
        ) : (
          filtered.map((it) => (
            <div
              key={it.slug}
              className={clsx(styles.cardWrap, featuredSet.has(it.slug) && styles.featured)}
              data-featured={featuredSet.has(it.slug)}
            >
              <PackageCard {...it.card} />
            </div>
          ))
        )}
      </div>

      {/* OPTIONAL — BUNDLES rail just below the grid -------------- */}
      {showBundlesSection && (bundlesForRail?.length ?? 0) > 0 && (
        <BundlesSection items={bundlesForRail as any} />
      )}

      {/* OPTIONAL — ADD-ONS section ------------------------------- */}
      {showAddOnsSection && (addOnsForSection?.length ?? 0) > 0 && (
        <AddOnSection layout="grid" addOns={addOnsForSection as any} />
      )}

      {/* CTA BAND ------------------------------------------------- */}
      <div className={styles.ctaBand}>
        <CTASection
          title={labels?.ctaTitle ?? "Ready to grow faster?"}
          subtitle={labels?.ctaSubtitle ?? "Tell us your goals—get a tailored plan in days."}
          primaryCta={labels?.ctaPrimary ?? { label: "Request proposal", href: "/contact" }}
          secondaryCta={labels?.ctaSecondary ?? { label: "See case studies", href: "/work" }}
        />
      </div>

      {/* FAQ (final panel) --------------------------------------- */}
      {faqItems && faqItems.length > 0 && (
        <FAQSection
          id="packages-faq"
          title="Packages FAQ"
          items={faqItems}
        />
      )}

      {/* JSON-LD -------------------------------------------------- */}
      {jsonLdNode}
    </section>
  );
}
