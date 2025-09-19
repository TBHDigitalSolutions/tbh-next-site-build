// src/components/sections/section-layouts/ServiceCardsGrid/ServiceCardsGrid.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  canonicalPath,
  getNodeByIdOrSlug,
  type AnyServiceNode,
} from "@/lib/services/taxonomy";
import AutoGridSection from "@/components/sections/section-layouts/AutoGridSection/AutoGridSection";
import "./ServiceCardsGrid.css";

/**
 * Service card item input
 * - Back-compat: accepts explicit href
 * - Canonical support: accepts a taxonomy node OR an id/slug to resolve URL
 */
export type ServiceCardsGridItem = {
  title: string;
  description?: string;
  /** If provided, used as-is (backward compatible). */
  href?: string;

  /** Optional taxonomy inputs to compute canonical URL when href is not provided. */
  node?: AnyServiceNode;
  idOrSlug?: string;

  /** Optional UI flourishes */
  eyebrow?: string;
  icon?: React.ReactNode; // icon node (emoji, svg, etc.)
  badge?: string;
  ctaLabel?: string; // defaults to "Learn more"
};

/** Component props */
export type ServiceCardsGridProps = {
  title?: string;
  description?: string;
  items: ServiceCardsGridItem[];
  /** Grid columns (CSS var) - defaults to 3 */
  columns?: number;
  /** Visual density variant (optional hook for CSS) */
  variant?: "default" | "compact" | "featured";
  /** Disable prefetch to reduce idle network usage on dense grids */
  prefetch?: boolean;
};

/** Resolve the canonical href for a card item */
function resolveHref(item: ServiceCardsGridItem): string {
  // 1) Explicit href wins (back-compat)
  if (item.href) return item.href;

  // 2) If we have a node, derive from taxonomy
  if (item.node) return canonicalPath(item.node);

  // 3) If we have an id/slug, look up the node then derive canonical
  if (item.idOrSlug) {
    const node = getNodeByIdOrSlug(item.idOrSlug);
    if (node) return canonicalPath(node);
  }

  // 4) Safe fallback to root services (should be rare)
  return "/services";
}

export default function ServiceCardsGrid({
  title,
  description,
  items,
  columns = 3,
  variant = "default",
  prefetch = false,
}: ServiceCardsGridProps) {
  if (!items || items.length === 0) return null;

  // Precompute hrefs (stable array)
  const normalized = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        _href: resolveHref(it),
      })),
    [items]
  );

  return (
    <AutoGridSection
      title={title}
      description={description}
      className={`service-cards-grid ${variant}`}
      style={{ ["--columns" as any]: String(columns) }}
    >
      {normalized.map((item, i) => (
        <Link
          key={item._href || item.title || i}
          href={item._href}
          className="scg-card"
          prefetch={prefetch}
          aria-label={item.title}
        >
          <article className="scg-card__inner">
            {/* Optional icon slot */}
            {item.icon ? <div className="scg-card__icon">{item.icon}</div> : null}

            {/* Copy block */}
            <div className="scg-card__body">
              {item.eyebrow ? (
                <p className="scg-card__eyebrow">{item.eyebrow}</p>
              ) : null}
              <h3 className="scg-card__title">{item.title}</h3>
              {item.description ? (
                <p className="scg-card__desc">{item.description}</p>
              ) : null}
            </div>

            {/* Right-aligned affordances */}
            <div className="scg-card__meta">
              {item.badge ? <span className="scg-card__badge">{item.badge}</span> : null}
              <span className="scg-card__cta">
                {item.ctaLabel ?? "Learn more"} →
              </span>
            </div>
          </article>
        </Link>
      ))}
    </AutoGridSection>
  );
}
