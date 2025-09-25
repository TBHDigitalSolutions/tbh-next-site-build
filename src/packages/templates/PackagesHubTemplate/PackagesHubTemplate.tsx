// src/packages/templates/PackagesHubTemplate/PackagesHubTemplate.tsx
// src/packages/templates/PackagesHubTemplate/PackagesHubTemplate.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./PackagesHubTemplate.module.css";

import type { PackageBundle } from "@/packages/lib/types";
import { toPackageCard } from "@/packages/lib/adapters";
import { emitItemListJsonLd } from "@/packages/lib/jsonld";

// Domain UI
import PackageCard from "@/packages/components/PackageCard";
import GrowthPackagesCTA from "@/packages/components/GrowthPackagesCTA";
import { PackagesToolbar } from "@/packages/components/PackagesToolbar";

// Sections
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";

type SortKey = "recommended" | "alphabetical" | "priceAsc" | "priceDesc";

export type PackagesHubTemplateProps = {
  title?: string;
  subtitle?: string;
  /** Bundles from facade (`@/data/packages`). */
  bundles: PackageBundle[];
  /** Curated slugs to boost in "Recommended" sort. */
  featuredSlugs?: string[];
  /** UI toggles */
  showSearch?: boolean;
  showServiceFilter?: boolean;
  showSort?: boolean;
  /** Initial sort key */
  defaultSort?: SortKey;
  /** Grid card min width */
  minCardWidthPx?: number;
  /** Emit ItemList JSON-LD when true */
  jsonLd?: boolean;
  /** Empty state message */
  emptyMessage?: string;
};

type Indexed = {
  slug: string;
  title: string;
  summary: string;
  services: string[];
  includedServices: string[];
  tags: string[];
  /** Derived PackageCard props for rendering */
  card: ReturnType<typeof toPackageCard>;
  /** For price sorts (prefer monthly; fallback oneTime) */
  priceForSort?: number;
};

export function PackagesHubTemplate({
  title = "Integrated Growth Packages",
  subtitle = "Proven playbooks bundled into simple plans — faster time to value, repeatable results.",
  bundles,
  featuredSlugs = [],
  showSearch = true,
  showServiceFilter = true,
  showSort = true,
  defaultSort = "recommended",
  minCardWidthPx = 300,
  jsonLd = true,
  emptyMessage = "No packages match your filters.",
}: PackagesHubTemplateProps) {
  // Toolbar state (owned here)
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

  // Build render + search/index layer once.
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

  // Service options for toolbar
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

    // 1) Type filter — today we only render bundles; keep hook for future mixed catalog
    const byType = index; // if you later mix packages/add-ons, narrow here by `type`

    // 2) Service filter (accept explicit `services` and lenient match on `includedServices`/`tags`)
    const byService =
      !service || service === "all"
        ? byType
        : byType.filter((it) => {
            const hitExplicit = it.services.some((s) => s?.toLowerCase() === service.toLowerCase());
            if (hitExplicit) return true;
            const hay = [...it.includedServices, ...it.tags].map((x) => String(x).toLowerCase());
            return hay.some((x) => x.includes(service.toLowerCase()));
          });

    // 3) Query
    const byQuery = qNorm
      ? byService.filter((it) =>
          [it.title, it.summary, it.tags.join(" "), it.services.join(" ")]
            .join(" ")
            .toLowerCase()
            .includes(qNorm),
        )
      : byService;

    // 4) Sort
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

  const gridStyle = React.useMemo(
    () => ({ gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidthPx}px, 1fr))` }) as React.CSSProperties,
    [minCardWidthPx],
  );

  return (
    <section className={styles.wrap}>
      {/* Hero (section-level) */}
      <ServiceHero
        title={title}
        subtitle={subtitle}
        primaryCta={{ label: "Book a call", href: "/book" }}
        secondaryCta={{ label: "All services", href: "/services" }}
      />

      {/* Toolbar (search + filters + sort) */}
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
          countsByType={{
            all: index.length,
            bundles: index.length, // today we render bundles only; adjust when mixing
            packages: 0,
            addons: 0,
          }}
        />
      </div>

      {/* Grid */}
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

      {/* CTA rail */}
      <div className={styles.ctaBand}>
        <GrowthPackagesCTA />
      </div>

      {/* JSON-LD */}
      {jsonLd &&
        emitItemListJsonLd(
          filtered.map((it) => ({ name: it.title, url: it.card.detailsHref ?? `/packages/${it.slug}` })),
        )}
    </section>
  );
}

// Keep default export too so either import style works.
export default PackagesHubTemplate;
