// src/packages/components/AddOnsGrid/AddOnsGrid.tsx
"use client";

import * as React from "react";
import cls from "./AddOnsGrid.module.css";
import AddOnCard from "@/packages/components/AddOnCard/AddOnCard";
import {
  toCombinedPrice,
  toStartingPrice,
  formatCurrency,
} from "@/data/packages/_types/currency";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

// Canonical Money (SSOT)
export type Price = { oneTime?: number; monthly?: number; currency?: string };

// Domain add-on (SSOT-ish)
export type AddOn = {
  slug: string;
  name: string;
  description?: string;
  price?: Price; // optional by design
  category?: string;
  popular?: boolean;
};

// Card item expected by AddOnCard
export type AddOnCardItem = {
  id: string;
  title: string;
  description?: string;
  bullets?: string[];
  priceLabel: string; // "from $X,XXX" | "$X,XXX one-time" | "$X,XXX/mo" | "Contact for pricing"
  badge?: string;
  href?: string;
  category?: string;
  popular?: boolean;
};

// Legacy carousel item support (back-compat)
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
  /* Data inputs (prefer passing `items` after adapting externally) */
  items?: AddOnCardItem[];
  addOns?: AddOn[];                // raw domain add-ons (adapter runs internally)
  legacyItems?: LegacyCarouselItem[]; // deprecated; mapped internally for compatibility

  /* Optional header */
  title?: string;
  subtitle?: string;

  /* Selection (controlled or uncontrolled) */
  selectedSlugs?: string[];             // controlled
  defaultSelectedSlugs?: string[];      // uncontrolled initial
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
  ctaAddLabel?: string;       // default "Add"
  ctaRemoveLabel?: string;    // default "Remove"
};

/* -------------------------------------------------------------------------- */
/* Adapters                                                                   */
/* -------------------------------------------------------------------------- */

// Convert SSOT add-on → card item (used when `addOns` prop is provided)
export function adaptAddOnToCardItem(a: AddOn): AddOnCardItem {
  return {
    id: a.slug,
    title: a.name,
    description: a.description,
    priceLabel: toCombinedPrice(a.price), // tolerant: "Contact for pricing" when empty
    badge: a.popular ? "Popular" : undefined,
    href: undefined, // provide if you have deep links for add-ons
    category: a.category,
    popular: a.popular,
  };
}

// Convert legacy carousel items → card items (for back-compat)
function adaptLegacyToCardItem(x: LegacyCarouselItem): AddOnCardItem {
  let priceLabel = "Contact for pricing";
  if (typeof x.startingAt === "number") {
    priceLabel = toStartingPrice(x.startingAt);
  } else if (typeof x.startingAt === "string" && x.startingAt.trim()) {
    // Keep existing label if it already contains currency text
    priceLabel = x.startingAt.startsWith("$") ? `from ${x.startingAt}` : `from ${x.startingAt}`;
  }
  return {
    id: x.id,
    title: x.name,
    description: x.description,
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

  // Keep internal in sync if consumer controls it
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
/* Component                                                                   */
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
  // 1) Normalize source → card items
  const cardItems = React.useMemo<AddOnCardItem[]>(() => {
    if (items && items.length) return items;
    if (addOns && addOns.length) return addOns.map(adaptAddOnToCardItem);
    if (legacyItems && legacyItems.length) return legacyItems.map(adaptLegacyToCardItem);
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
          priceLabel: "Contact for pricing",
        }))
      : filtered;

  // 5) Grid style
  const gridStyle = React.useMemo(
    () => ({ gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidthPx}px, 1fr))` }) as React.CSSProperties,
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
      {/* Header / toolbar */}
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
                  title={it.title}
                  description={it.description}
                  bullets={it.bullets}
                  priceLabel={it.priceLabel}
                  badge={it.badge ?? (it.popular ? "Popular" : undefined)}
                  href={it.href}
                />

                {/* Optional selection controls */}
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

      {/* SR-only live region for loading */}
      {isLoading && (
        <div className={cls.visuallyHidden} aria-live="polite" aria-atomic="true">
          Loading add-on services…
        </div>
      )}
    </section>
  );
}
