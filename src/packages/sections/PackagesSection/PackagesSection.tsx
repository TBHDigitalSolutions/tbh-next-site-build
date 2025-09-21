"use client";

import * as React from "react";
import styles from "./PackagesSection.module.css";
import PackageGrid, { type PackageGridItem } from "../../components/PackageGrid";
import type { PackageBundle } from "../../lib/types";
import { toPackageGridItems } from "../../lib/adapters";
import { getAllServices, normalizeServiceSlug, type ServiceSlug } from "../../lib/registry";

export type PackagesSectionProps = {
  /** Optional raw SSOT bundles. If provided and `items` is omitted, bundles will be adapted into grid items. */
  bundles?: PackageBundle[];
  /** Pre-mapped grid items. Takes precedence over `bundles` when provided. */
  items?: PackageGridItem[];
  /** Featured slugs to highlight + weight in recommended sort. */
  featuredSlugs?: string[];
  /** Render service filter chips (works best when `bundles` is provided). */
  showServiceFilter?: boolean;
  /** Filter by this service initially. */
  initialService?: ServiceSlug | string;
  /** Pass-through controls to PackageGrid */
  showSearch?: boolean;
  showSort?: boolean;
  defaultSort?: "recommended" | "name" | "priceAsc" | "priceDesc";
  minCardWidthPx?: number;
  jsonLd?: boolean;
  /** Section chrome */
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;
};

function buildServiceOptions(bundles: PackageBundle[]) {
  const present = new Map<string, number>();
  for (const b of bundles) for (const s of (b.services ?? [])) {
    const k = normalizeServiceSlug(s);
    present.set(k, (present.get(k) ?? 0) + 1);
  }
  // Include only services that appear in bundles, keep registry order
  const registry = getAllServices();
  const filtered = registry.filter((svc) => present.has(svc.slug));
  return filtered.map((svc) => ({ slug: svc.slug, name: svc.name, count: present.get(svc.slug)! }));
}

export default function PackagesSection({
  bundles = [],
  items,
  featuredSlugs,
  showServiceFilter = false,
  initialService,
  showSearch = true,
  showSort = true,
  defaultSort = "recommended",
  minCardWidthPx = 300,
  jsonLd = true,
  title = "Packages",
  subtitle,
  className,
  id,
}: PackagesSectionProps) {
  const hasItems = Array.isArray(items) && items.length > 0;
  const [service, setService] = React.useState<string | "all">(() => (initialService ? String(normalizeServiceSlug(initialService)) : "all"));

  // If we have bundles, filter by service (when enabled)
  const filteredBundles = React.useMemo(() => {
    if (!bundles.length) return bundles;
    if (!showServiceFilter || service === "all") return bundles;
    const target = String(normalizeServiceSlug(service));
    return bundles.filter((b) => (b.services ?? []).map((s) => normalizeServiceSlug(s)).includes(target));
  }, [bundles, showServiceFilter, service]);

  // Map to grid items if caller didn't provide items
  const computedItems: PackageGridItem[] = React.useMemo(() => {
    if (hasItems) return items as PackageGridItem[];
    const adapted = toPackageGridItems(filteredBundles, { featuredSlugs });
    // Structural compatibility: adapter returns the same shape as PackageGridItem
    return adapted as unknown as PackageGridItem[];
  }, [hasItems, items, filteredBundles, featuredSlugs]);

  // Service options derived from bundles (stable ordering from registry)
  const serviceOptions = React.useMemo(() => (showServiceFilter ? buildServiceOptions(bundles) : []), [showServiceFilter, bundles]);

  if (!computedItems.length) return null;

  return (
    <section className={[styles.section, className].filter(Boolean).join(" ")} aria-labelledby="packages-section-title" id={id}>
      <header className={styles.header}>
        <h2 id="packages-section-title" className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </header>

      {(showServiceFilter && serviceOptions.length > 0) && (
        <div className={styles.toolbar} role="group" aria-label="Filter by service">
          <span className={styles.srOnly} id="service-filter-label">Service filter</span>
          <div className={styles.filters} aria-labelledby="service-filter-label">
            <button type="button" className={styles.chip} aria-pressed={service === "all"} onClick={() => setService("all")}>All</button>
            {serviceOptions.map((opt) => (
              <button
                key={opt.slug}
                type="button"
                className={styles.chip}
                aria-pressed={service === opt.slug}
                onClick={() => setService(opt.slug)}
              >
                {opt.name} ({opt.count})
              </button>
            ))}
          </div>
        </div>
      )}

      <PackageGrid
        items={computedItems}
        featuredSlugs={featuredSlugs}
        minCardWidthPx={minCardWidthPx}
        showSearch={showSearch}
        showSort={showSort}
        defaultSort={defaultSort}
        jsonLd={jsonLd}
      />
    </section>
  );
}

export type { PackagesSectionProps };