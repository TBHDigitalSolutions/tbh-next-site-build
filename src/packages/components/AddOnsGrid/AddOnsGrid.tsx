"use client";

import * as React from "react";
import cls from "./AddOnsGrid.module.css";

export type Price = { oneTime?: number; monthly?: number; currency?: "USD" };

export type AddOn = {
  slug: string;
  name: string;
  description: string;
  price?: Price; // optional in SSOT
  category?: string;
};

export type AddOnsGridProps = {
  /** Full list of add-ons from SSOT */
  addOns: AddOn[];
  /** Selected slugs (controlled). If omitted, component manages its own state. */
  selectedSlugs?: string[];
  /** Controlled selection change handler. */
  onChangeSelected?: (slugs: string[]) => void;
  /** Per-item hooks for analytics or side effects. */
  onAdd?: (addOn: AddOn) => void;
  onRemove?: (addOn: AddOn) => void;
  /** UI toggles */
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  /** Optional: start on a specific category */
  initialCategory?: string;
  /** Minimum card width in the grid; defaults to 260px. */
  minCardWidthPx?: number;
  /** Button labels */
  ctaAddLabel?: string;
  ctaRemoveLabel?: string;
  /** Render when no items after filters */
  emptyState?: React.ReactNode;
  /** Extra className on root */
  className?: string;
  /** Optional id for aria relationships */
  id?: string;
};

function formatMoney(v?: number, currency: string = "USD") {
  if (v === undefined) return undefined;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  } catch {
    return `$${v}`;
  }
}

function priceLabel(p?: Price): string {
  if (!p || (p.oneTime == null && p.monthly == null)) return "Custom";
  const parts: string[] = [];
  if (p.oneTime != null) parts.push(`Setup ${formatMoney(p.oneTime, p.currency)}`);
  if (p.monthly != null) parts.push(`${formatMoney(p.monthly, p.currency)}/mo`);
  return parts.join(" • ");
}

function useControlledSelection(initial: string[] | undefined, controlled: string[] | undefined, onChange?: (s: string[]) => void) {
  const [internal, setInternal] = React.useState<Set<string>>(new Set(initial ?? controlled ?? []));
  const isControlled = controlled !== undefined;
  const set = React.useMemo(() => (isControlled ? new Set(controlled) : internal), [isControlled, controlled, internal]);

  const update = React.useCallback(
    (next: Set<string>) => {
      if (isControlled) {
        onChange?.(Array.from(next));
      } else {
        setInternal(new Set(next));
        onChange?.(Array.from(next));
      }
    },
    [isControlled, onChange]
  );

  const toggle = React.useCallback(
    (slug: string) => {
      const next = new Set(set);
      if (next.has(slug)) next.delete(slug); else next.add(slug);
      update(next);
    },
    [set, update]
  );

  return { selected: set, toggle } as const;
}

export default function AddOnsGrid({
  addOns,
  selectedSlugs,
  onChangeSelected,
  onAdd,
  onRemove,
  showSearch = true,
  showCategoryFilter = true,
  initialCategory,
  minCardWidthPx = 260,
  ctaAddLabel = "Add",
  ctaRemoveLabel = "Remove",
  emptyState,
  className,
  id,
}: AddOnsGridProps) {
  const { selected, toggle } = useControlledSelection(undefined, selectedSlugs, onChangeSelected);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string | "All">(initialCategory ?? "All");

  const categories = React.useMemo(() => {
    const set = new Set<string>();
    for (const a of addOns) if (a.category) set.add(a.category);
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))] as const;
  }, [addOns]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return addOns.filter((a) => {
      if (category !== "All" && (a.category ?? "") !== category) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.slug.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [addOns, category, query]);

  const onToggle = React.useCallback(
    (addon: AddOn) => {
      const wasSelected = selected.has(addon.slug);
      toggle(addon.slug);
      // Optional analytics hook
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", wasSelected ? "addon_remove" : "addon_add", {
          addon_slug: addon.slug,
          addon_name: addon.name,
          addon_category: addon.category ?? null,
        });
      }
      if (wasSelected) onRemove?.(addon); else onAdd?.(addon);
    },
    [selected, toggle, onAdd, onRemove]
  );

  const gridStyle = React.useMemo(() => ({
    gridTemplateColumns: `repeat(auto-fill, minmax(${minCardWidthPx}px, 1fr))`,
  }) as React.CSSProperties, [minCardWidthPx]);

  const empty = (
    <div className={cls.empty} role="status" aria-live="polite">
      {emptyState ?? "No add-ons match your filters."}
    </div>
  );

  return (
    <section className={[cls.root, className].filter(Boolean).join(" ")} id={id}>
      {(showSearch || showCategoryFilter) && (
        <div className={cls.toolbar}>
          {showSearch && (
            <div className={cls.search}>
              <svg className={cls.searchIcon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                className={cls.searchInput}
                type="search"
                placeholder="Search add-ons"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search add-ons"
              />
            </div>
          )}
          {showCategoryFilter && (
            <div className={cls.chips} role="toolbar" aria-label="Filter by category">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cls.chip}
                  aria-pressed={category === c}
                  onClick={() => setCategory(c as any)}
                >
                  {c}
                  <span aria-hidden>· {c === "All" ? addOns.length : addOns.filter(a => (a.category ?? "") === c).length}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={cls.grid} style={gridStyle}>
        {filtered.length === 0 ? (
          empty
        ) : (
          filtered.map((a) => {
            const selectedFlag = selected.has(a.slug);
            const label = selectedFlag ? ctaRemoveLabel : ctaAddLabel;
            return (
              <article key={a.slug} className={cls.card} data-selected={selectedFlag} aria-labelledby={`addon-${a.slug}-title`}>
                <header className={cls.header}>
                  <h3 id={`addon-${a.slug}-title`} className={cls.title}>{a.name}</h3>
                  {a.category && <span className={cls.category}>{a.category}</span>}
                </header>
                <div className={cls.body}>{a.description}</div>
                <div className={cls.priceRow}>
                  <span className={cls.priceChip}>{priceLabel(a.price)}</span>
                </div>
                <div className={cls.actions}>
                  <button
                    type="button"
                    className={cls.btn}
                    aria-pressed={selectedFlag}
                    aria-label={`${label} ${a.name}`}
                    onClick={() => onToggle(a)}
                  >
                    {label}
                  </button>
                  {selectedFlag && (
                    <button
                      type="button"
                      className={[cls.btn, cls.btnSecondary].join(" ")}
                      onClick={() => onToggle(a)}
                    >
                      Deselect
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}