"use client";

import * as React from "react";
import cls from "./PackageGrid.module.css";
import PackageCard, { type PackageCardProps, type Price } from "../PackageCard";

export type PackageGridItem = Omit<PackageCardProps, "className" | "id" | "analyticsCategory"> & {
  /** Optional manual sort weight; higher appears earlier in recommended sort */
  weight?: number;
};

export type PackageGridProps = {
  items: PackageGridItem[];
  /** Min card width used to compute responsive columns */
  minCardWidthPx?: number; // default 280
  /** Slugs to highlight (e.g., featured). Order also influences recommended sort. */
  featuredSlugs?: string[];
  /** Enable search box */
  showSearch?: boolean;
  /** Enable sort dropdown */
  showSort?: boolean;
  /** Initial sort */
  defaultSort?: "recommended" | "name" | "priceAsc" | "priceDesc";
  /** Include an ItemList JSON-LD script */
  jsonLd?: boolean;
  /** Root className & id passthrough */
  className?: string;
  id?: string;
};

function normPriceNumber(price: Price | undefined, pref: "monthly" | "oneTime") {
  if (!price) return Number.POSITIVE_INFINITY;
  const primary = price[pref];
  const secondary = pref === "monthly" ? price.oneTime : price.monthly;
  if (typeof primary === "number") return primary;
  if (typeof secondary === "number") return secondary + (pref === "monthly" ? 0 : 0); // simple fallback
  return Number.POSITIVE_INFINITY;
}

function sortItems(items: PackageGridItem[], mode: PackageGridProps["defaultSort"], featuredSlugs?: string[]) {
  const featuredIndex = new Map<string, number>();
  (featuredSlugs ?? []).forEach((slug, i) => featuredIndex.set(slug, i));

  const byName = (a: PackageGridItem, b: PackageGridItem) => a.name.localeCompare(b.name);

  switch (mode) {
    case "name":
      return [...items].sort(byName);
    case "priceAsc":
      return [...items].sort((a, b) => normPriceNumber(a.price, "monthly") - normPriceNumber(b.price, "monthly"));
    case "priceDesc":
      return [...items].sort((a, b) => normPriceNumber(b.price, "monthly") - normPriceNumber(a.price, "monthly"));
    case "recommended":
    default:
      return [...items].sort((a, b) => {
        const fa = featuredIndex.has(a.slug) ? -1000 - (featuredIndex.get(a.slug) || 0) : 0;
        const fb = featuredIndex.has(b.slug) ? -1000 - (featuredIndex.get(b.slug) || 0) : 0;
        const wa = a.weight ?? 0;
        const wb = b.weight ?? 0;
        if (fa !== fb) return fa - fb;
        if (wa !== wb) return wb - wa; // higher weight first
        return byName(a, b);
      });
  }
}

function toJsonLd(items: PackageGridItem[]) {
  const listItems = items.map((it, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: it.primaryCta?.href ?? it.detailsHref ?? `/packages/${it.slug}`,
    name: it.name,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: listItems,
  } as const;
}

export default function PackageGrid({
  items,
  minCardWidthPx = 280,
  featuredSlugs,
  showSearch = true,
  showSort = true,
  defaultSort = "recommended",
  jsonLd = false,
  className,
  id,
}: PackageGridProps) {
  const [query, setQuery] = React.useState("");
  const [sortMode, setSortMode] = React.useState<NonNullable<PackageGridProps["defaultSort"]>>(defaultSort);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      it.name.toLowerCase().includes(q) ||
      it.slug.toLowerCase().includes(q) ||
      it.description.toLowerCase().includes(q) ||
      (it.features ?? []).some(f => f.toLowerCase().includes(q))
    );
  }, [items, query]);

  const sorted = React.useMemo(() => sortItems(filtered, sortMode, featuredSlugs), [filtered, sortMode, featuredSlugs]);

  const gridStyle = React.useMemo(() => ({
    gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidthPx}px, 1fr))`,
  }) as React.CSSProperties, [minCardWidthPx]);

  return (
    <section className={[cls.root, className].filter(Boolean).join(" ")} id={id}>
      {(showSearch || showSort) && (
        <div className={cls.toolbar}>
          <div className={cls.count} aria-live="polite">{sorted.length} package{sorted.length === 1 ? "" : "s"}</div>
          {showSearch && (
            <div className={cls.search}>
              <svg className={cls.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <label className={cls.srOnly} htmlFor="pkg-grid-search">Search packages</label>
              <input
                id="pkg-grid-search"
                className={cls.searchInput}
                type="search"
                placeholder="Search packages"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
          {showSort && (
            <div>
              <label className={cls.srOnly} htmlFor="pkg-grid-sort">Sort</label>
              <select
                id="pkg-grid-sort"
                className={cls.select}
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as any)}
              >
                <option value="recommended">Recommended</option>
                <option value="name">Name (A–Z)</option>
                <option value="priceAsc">Price (low → high)</option>
                <option value="priceDesc">Price (high → low)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toJsonLd(sorted)) }} />
      )}

      <div className={cls.grid} style={gridStyle}>
        {sorted.map((it) => (
          <PackageCard
            key={it.slug}
            {...it}
            highlight={it.highlight || (featuredSlugs ?? []).includes(it.slug)}
          />
        ))}
      </div>
    </section>
  );
}