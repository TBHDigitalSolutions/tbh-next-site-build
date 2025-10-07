// src/packages/components/AddOnsGrid/AddOnsGrid.tsx
"use client";

/**
 * AddOnsGrid
 * ----------
 * Responsive grid for add-on packages with optional search, category filters,
 * and selection toggles. Presentation-only; price formatting is delegated to
 * the AddOnCard → PriceLabel atom which uses helpers from @/packages/lib/pricing.
 *
 * Alignments:
 *  - Canonical Money type imported from @/packages/lib/types
 *  - Falls back to mock data from `src/mock` if no data is provided
 *  - No imports from "@/data/packages/_types/currency"
 *  - Passes `price?: Money` or `priceLabel` through to AddOnCard (no formatting here)
 */

import * as React from "react";
import cls from "./AddOnsGrid.module.css";
import AddOnCard from "@/packages/components/AddOnCard/AddOnCard";
import type { Money } from "@/packages/lib/types";

// Mock data fallbacks
import { asAddOnCardItems, asAddOns } from "@/mock";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type Price = Money;

export type AddOn = {
  slug: string;
  name: string;
  description?: string;
  price?: Price; // optional by design
  category?: string;
  popular?: boolean;
};

export type AddOnCardItem = {
  id: string;
  title: string;
  description?: string;
  bullets?: string[];
  price?: Price;          // canonical
  priceLabel?: string;    // fallback when price is absent
  badge?: string;
  href?: string;
  category?: string;
  popular?: boolean;
};

export type LegacyCarouselItem = {
  id: string;
  name: string;
  description?: string;
  startingAt?: string | number;
  href?: string;
  category?: string;
  popular?: boolean;
};

export type AddOnsGridProps = {
  // Prefer passing `items` already adapted; otherwise pass `addOns` or `legacyItems`
  items?: AddOnCardItem[];
  addOns?: AddOn[];
  legacyItems?: LegacyCarouselItem[];

  /* Optional header */
  title?: string;
  subtitle?: string;

  /* Selection (controlled or uncontrolled) */
  selectedSlugs?: string[];
  defaultSelectedSlugs?: string[];
  onChangeSelected?: (slugs: string[]) => void;
  onAdd?: (addOnId: string) => void;
  onRemove?: (addOnId: string) => void;

  /* Filters / search */
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  initialCategory?: string | "All";

  /* Layout */
  minCardWidthPx?: number; // default 260
  className?: string;
  id?: string;
  testId?: string;

  /* States / copy */
  isLoading?: boolean;
  emptyMessage?: string;

  /* CTA labels for the selection buttons */
  ctaAddLabel?: string;    // default "Add"
  ctaRemoveLabel?: string; // default "Remove"
};

/* -------------------------------------------------------------------------- */
/* Adapters                                                                   */
/* -------------------------------------------------------------------------- */

const FALLBACK_LABEL = "Contact for pricing";

// SSOT AddOn → card item
export function adaptAddOnToCardItem(a: AddOn): AddOnCardItem {
  return {
    id: a.slug,
    title: a.name,
    description: a.description,
    price: a.price,
    priceLabel: a.price ? undefined : FALLBACK_LABEL,
    badge: a.popular ? "Popular" : undefined,
    href: undefined,
    category: a.category,
    popular: a.popular,
  };
}

// Legacy carousel → card item (best-effort)
function adaptLegacyToCardItem(x: LegacyCarouselItem): AddOnCardItem {
  let price: Price | undefined;
  let priceLabel: string | undefined = FALLBACK_LABEL;

  if (typeof x.startingAt === "number") {
    price = undefined;
    priceLabel = `From $${x.startingAt.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  } else if (typeof x.startingAt === "string" && x.startingAt.trim()) {
    const s = x.startingAt.trim();
    price = undefined;
    priceLabel = s.startsWith("$") ? `From ${s}` : `From $${s}`;
  }

  return {
    id: x.id,
    title: x.name,
    description: x.description,
    price,
    priceLabel,
    href: x.href,
    category: x.category,
    popular: x.popular,
  };
}

/* -------------------------------------------------------------------------- */
/* Internal utils                                                             */
/* -------------------------------------------------------------------------- */

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function useControlledSet(
  controlled?: string[],
  defaultValue?: string[],
  onChange?: (next: string[]) => void,
) {
  const controlledMode = Array.isArray(controlled);
  const [internal, setInternal] = React.useState<Set<string>>(
    () => new Set(controlled ?? defaultValue ?? []),
  );

  React.useEffect(() => {
    if (controlledMode) setInternal(new Set(controlled));
  }, [controlledMode, controlled]);

  const update = React.useCallback(
    (next: Set<string>) => {
      if (!controlledMode) setInternal(next);
      onChange?.(Array.from(next));
    },
    [controlledMode, onChange],
  );

  const toggle = React.useCallback(
    (id: string) => {
      const next = new Set(internal);
      next.has(id) ? next.delete(id) : next.add(id);
      update(next);
    },
    [internal, update],
  );

  return { selected: internal, toggle };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AddOnsGrid({
  items,
  addOns,
  legacyItems,

  title = "Add-On Services",
  subtitle = "Enhance your package with targeted capabilities",

  selectedSlugs,
  defaultSelectedSlugs,
  onChangeSelected,
  onAdd,
  onRemove,

  showSearch = true,
  showCategoryFilter = true,
  initialCategory = "All",

  minCardWidthPx = 260,
  className,
  id,
  testId = "addons-grid",

  isLoading = false,
  emptyMessage = "No add-ons available at this time.",

  ctaAddLabel = "Add",
  ctaRemoveLabel = "Remove",
}: AddOnsGridProps) {
  // 1) Normalize source → card items (with mock fallbacks)
  const cardItems = React.useMemo<AddOnCardItem[]>(() => {
    // already-adapted items (preferred)
    if (items?.length) return items;

    // domain addOns
    if (addOns?.length) return addOns.map(adaptAddOnToCardItem);

    // legacy items
    if (legacyItems?.length) return legacyItems.map(adaptLegacyToCardItem);

    // mock fallbacks: adapted first, then raw addOns adapted
    const mockItems = typeof asAddOnCardItems === "function" ? asAddOnCardItems() : [];
    if (mockItems.length) return mockItems;

    const mockAddOns = typeof asAddOns === "function" ? asAddOns() : [];
    if (mockAddOns.length) return mockAddOns.map(adaptAddOnToCardItem);

    return [];
  }, [items, addOns, legacyItems]);

  // 2) Selection (by card item id)
  const { selected, toggle } = useControlledSet(
    selectedSlugs,
    defaultSelectedSlugs,
    onChangeSelected,
  );

  const handleToggle = React.useCallback(
    (id: string) => {
      const wasSelected = selected.has(id);
      toggle(id);

      // analytics (best-effort)
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", wasSelected ? "addon_remove" : "addon_add", { addon_id: id });
      }

      if (wasSelected) onRemove?.(id);
      else onAdd?.(id);
    },
    [selected, toggle, onAdd, onRemove],
  );

  // 3) Search + categories
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | "All">(initialCategory);

  const categories = React.useMemo(() => {
    const s = new Set<string>();
    for (const it of cardItems) if (it.category) s.add(it.category);
    return ["All", ...Array.from(s).sort((a, b) => a.localeCompare(b))] as const;
  }, [cardItems]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return cardItems.filter((it) => {
      if (category !== "All" && (it.category ?? "") !== category) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.id.toLowerCase().includes(q) ||
        (it.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [cardItems, category, query]);

  // 4) Loading placeholders
  const displayItems: AddOnCardItem[] =
    isLoading && filtered.length === 0
      ? Array.from({ length: 3 }, (_, i) => ({
          id: `loading-${i}`,
          title: "Loading…",
          description: "Loading add-on information…",
          priceLabel: FALLBACK_LABEL,
        }))
      : filtered;

  // 5) Grid style
  const gridStyle = React.useMemo(
    () =>
      ({
        gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidthPx}px, 1fr))`,
      }) as React.CSSProperties,
    [minCardWidthPx],
  );

  // Early exit (hide section entirely) if no data and not loading
  if (!isLoading && cardItems.length === 0) {
    return null;
  }

  return (
    <section
      className={cx(cls.root, className)}
      id={id}
      data-testid={testId}
      aria-busy={isLoading || undefined}
    >
      {(title || subtitle || showSearch || showCategoryFilter) && (
        <header className={cls.toolbar}>
          {(title || subtitle) && (
            <div className={cls.headerText}>
              {title && <h3 className={cls.headerTitle}>{title}</h3>}
              {subtitle && <p className={cls.headerSubtitle}>{subtitle}</p>}
            </div>
          )}

          {(showSearch || showCategoryFilter) && (
            <div className={cls.controls}>
              {showSearch && (
                <label className={cls.search}>
                  <span className={cls.visuallyHidden}>Search add-ons</span>
                  <input
                    className={cls.searchInput}
                    type="search"
                    placeholder="Search add-ons"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search add-ons"
                  />
                </label>
              )}

              {showCategoryFilter && categories.length > 1 && (
                <div className={cls.chips} role="toolbar" aria-label="Filter by category">
                  {categories.map((c) => {
                    const count =
                      c === "All"
                        ? cardItems.length
                        : cardItems.filter((x) => (x.category ?? "") === c).length;
                    return (
                      <button
                        key={c}
                        type="button"
                        className={cx(cls.chip, category === c && cls.chipActive)}
                        aria-pressed={category === c}
                        onClick={() => setCategory(c as any)}
                      >
                        {c} <span className={cls.chipCount}>· {count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </header>
      )}

      {/* Grid */}
      <div className={cls.grid} style={gridStyle} role="region" aria-label="Available add-on services">
        {displayItems.length === 0 && !isLoading ? (
          <div className={cls.empty} role="status" aria-live="polite">
            {emptyMessage}
          </div>
        ) : (
          displayItems.map((it) => {
            const selectedFlag = selected.has(it.id);

            return (
              <div key={it.id} className={cx(cls.cell)} data-selected={selectedFlag}>
                <AddOnCard
                  id={it.id}
                  name={it.title}
                  description={it.description}
                  bullets={it.bullets}
                  price={it.price}
                  priceLabel={it.priceLabel}
                  badge={it.badge ?? (it.popular ? "Popular" : undefined)}
                  href={it.href}
                  variant="default"
                />

                {(onAdd || onRemove || selectedSlugs || defaultSelectedSlugs) && (
                  <div className={cls.actions}>
                    <button
                      type="button"
                      className={cx(cls.btn, selectedFlag && cls.btnSelected)}
                      aria-pressed={selectedFlag}
                      aria-label={`${selectedFlag ? ctaRemoveLabel : ctaAddLabel} ${it.title}`}
                      onClick={() => handleToggle(it.id)}
                    >
                      {selectedFlag ? ctaRemoveLabel : ctaAddLabel}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {isLoading && (
        <div className={cls.visuallyHidden} aria-live="polite" aria-atomic="true">
          Loading add-on services…
        </div>
      )}
    </section>
  );
}
