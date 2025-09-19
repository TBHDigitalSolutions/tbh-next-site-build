// src/components/global/Breadcrumbs/Breadcrumbs.tsx
"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import {
  buildBreadcrumbs as buildBreadcrumbsFromNode,
  canonicalPath,
  type AnyServiceNode,
} from "@/lib/services/taxonomy";
import "./Breadcrumbs.css";

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  /** Explicit breadcrumb items (wins over node if provided) */
  items?: BreadcrumbItem[];

  /** Optionally derive items from a taxonomy node using canonical paths */
  node?: AnyServiceNode;

  /** UI/behavior */
  className?: string;
  ariaLabel?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
  homeLabel?: string;
  maxItems?: number; // when exceeded, collapses middle
  prefetch?: boolean; // Next.js prefetch; default false
}

/**
 * Breadcrumbs
 * - Backward compatible with explicit `items`.
 * - If `node` is provided and `items` are not, it will derive canonical breadcrumbs via taxonomy.
 * - Adds Home, truncation, custom separators, and disables prefetch by default for efficiency.
 */
const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  node,
  className = "",
  ariaLabel = "Breadcrumb navigation",
  separator = <ChevronRight className="breadcrumbs-separator" />,
  showHome = true,
  homeLabel = "Home",
  maxItems = 5,
  prefetch = false,
}) => {
  // 1) Resolve items: explicit items win; otherwise derive from node (canonical)
  const baseItems: BreadcrumbItem[] = useMemo(() => {
    if (items && items.length > 0) return items;

    if (node) {
      // Use taxonomy to produce [{label, href}] with canonical paths
      const derived = buildBreadcrumbsFromNode(node).map(({ label, href }, idx, arr) => ({
        label,
        href: href || canonicalPath(node), // safety fallback
        current: idx === arr.length - 1,
      }));
      return derived;
    }

    return [];
  }, [items, node]);

  if (!baseItems.length) return null;

  // 2) Optionally prepend Home (if not already present)
  const withHome = useMemo(() => {
    const needsHome = showHome && !baseItems.some((i) => i.href === "/");
    return needsHome ? [{ label: homeLabel, href: "/" }, ...baseItems] : baseItems;
  }, [baseItems, showHome, homeLabel]);

  // 3) Truncate middle if too many
  const displayItems: BreadcrumbItem[] = useMemo(() => {
    if (withHome.length <= maxItems) return withHome;

    // Keep first and last two, collapse the middle
    const first = withHome[0];
    const tail = withHome.slice(-2);
    return [
      first,
      { label: "...", href: "#", current: false },
      ...tail.map((t, i, arr) => ({ ...t, current: i === arr.length - 1 })),
    ];
  }, [withHome, maxItems]);

  return (
    <nav className={`breadcrumbs ${className}`} aria-label={ariaLabel}>
      <ol className="breadcrumbs-list">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isTruncated = item.label === "...";

          return (
            <li key={`${item.href}-${index}`} className="breadcrumbs-item">
              {isTruncated ? (
                <span className="breadcrumbs-truncated" aria-hidden="true">
                  {item.label}
                </span>
              ) : isLast ? (
                <span className="breadcrumbs-current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className="breadcrumbs-link"
                    prefetch={prefetch}
                  >
                    {item.label}
                  </Link>
                  {separator}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
