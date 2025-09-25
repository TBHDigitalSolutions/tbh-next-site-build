// src/packages/components/PackagesToolbar/PackagesToolbar.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./PackagesToolbar.module.css";

/**
 * (Light) integration with your search UI component.
 * We keep typing permissive to avoid tight coupling.
 */
import type { ComponentProps } from "react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SearchBar: React.ComponentType<Partial<ComponentProps<"input">> & {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}> = (await import("@/search/ui/SearchBar").catch(() => ({ default: undefined as any }))).default ?? ((
  props: any,
) => {
  // Safe fallback if search/ui/SearchBar is unavailable:
  const { value, onChange, placeholder, className, inputProps } = props || {};
  return (
    <input
      className={clsx(styles.searchInput, className)}
      type="search"
      placeholder={placeholder ?? "Search packages"}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      {...(inputProps ?? {})}
    />
  );
});

/* ------------------------------------------------------------------------- */
/* Types                                                                     */
/* ------------------------------------------------------------------------- */

export type PackagesToolbarProps = {
  query: string;
  onQueryChange: (v: string) => void;

  type: "all" | "bundles" | "packages" | "addons";
  onTypeChange: (v: PackagesToolbarProps["type"]) => void;

  service?: string; // "content" | "seo" | ...
  onServiceChange: (v?: string) => void;

  sort: "recommended" | "az" | "price-asc" | "price-desc";
  onSortChange: (v: PackagesToolbarProps["sort"]) => void;

  /** Optional service options to render in the Service select */
  serviceOptions?: Array<{ value: string; label: string }>;
  /**
   * Optional counts by type for chips: { all, bundles, packages, addons }
   * purely cosmetic; not required.
   */
  countsByType?: Partial<Record<PackagesToolbarProps["type"], number>>;

  /** Optional UX toggles */
  showTypeFilter?: boolean;
  showServiceFilter?: boolean;
  showSort?: boolean;
  showSearch?: boolean;

  /** Visuals */
  className?: string;
  id?: string;
  compact?: boolean;

  /** A11y labels (for i18n) */
  labels?: {
    searchPlaceholder?: string;
    searchAriaLabel?: string;
    typeAll?: string;
    typeBundles?: string;
    typePackages?: string;
    typeAddons?: string;
    serviceLabel?: string;
    sortLabel?: string;
  };
};

/* ------------------------------------------------------------------------- */
/* Component                                                                  */
/* ------------------------------------------------------------------------- */

export default function PackagesToolbar({
  query,
  onQueryChange,
  type,
  onTypeChange,
  service,
  onServiceChange,
  sort,
  onSortChange,

  serviceOptions = [{ value: "all", label: "All services" }],
  countsByType,

  showTypeFilter = true,
  showServiceFilter = true,
  showSort = true,
  showSearch = true,

  className,
  id,
  compact = false,

  labels = {},
}: PackagesToolbarProps) {
  const {
    searchPlaceholder = "Search packages, bundles, add-ons",
    searchAriaLabel = "Search packages",
    typeAll = "All",
    typeBundles = "Bundles",
    typePackages = "Packages",
    typeAddons = "Add-ons",
    serviceLabel = "Service",
    sortLabel = "Sort",
  } = labels;

  // Ensure "all" option is present exactly once.
  const mergedServices = React.useMemo(() => {
    const hasAll = serviceOptions.some((o) => o.value === "all");
    return hasAll ? serviceOptions : [{ value: "all", label: "All services" }, ...serviceOptions];
  }, [serviceOptions]);

  // Render a single filter chip button
  const TypeChip = (props: {
    value: PackagesToolbarProps["type"];
    label: string;
    count?: number;
    "data-testid"?: string;
  }) => {
    const active = type === props.value;
    return (
      <button
        type="button"
        className={clsx(styles.typeChip, active && styles.typeChipActive)}
        aria-pressed={active}
        onClick={() => onTypeChange(props.value)}
        data-type={props.value}
        data-testid={props["data-testid"]}
      >
        <span className={styles.typeChipLabel}>{props.label}</span>
        {typeof props.count === "number" ? (
          <span className={styles.typeChipCount} aria-hidden="true">
            {props.count}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <section
      className={clsx(styles.wrap, compact && styles.compact, className)}
      id={id}
      role="search"
      aria-label="Packages toolbar"
    >
      {/* Row 1: Search + Type chips */}
      <div className={styles.row}>
        {showSearch && (
          <div className={styles.search}>
            <SearchBar
              value={query}
              onChange={onQueryChange}
              placeholder={searchPlaceholder}
              className={styles.searchInput}
              inputProps={{ "aria-label": searchAriaLabel }}
            />
          </div>
        )}

        {showTypeFilter && (
          <div className={styles.types} role="group" aria-label="Filter by type">
            <TypeChip
              value="all"
              label={typeAll}
              count={countsByType?.all}
              data-testid="toolbar-type-all"
            />
            <TypeChip
              value="bundles"
              label={typeBundles}
              count={countsByType?.bundles}
              data-testid="toolbar-type-bundles"
            />
            <TypeChip
              value="packages"
              label={typePackages}
              count={countsByType?.packages}
              data-testid="toolbar-type-packages"
            />
            <TypeChip
              value="addons"
              label={typeAddons}
              count={countsByType?.addons}
              data-testid="toolbar-type-addons"
            />
          </div>
        )}
      </div>

      {/* Row 2: Service + Sort */}
      {(showServiceFilter || showSort) && (
        <div className={styles.row}>
          {showServiceFilter && (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{serviceLabel}</span>
              <select
                className={styles.select}
                value={service ?? "all"}
                onChange={(e) => onServiceChange(e.target.value === "all" ? undefined : e.target.value)}
                aria-label={serviceLabel}
              >
                {mergedServices.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {showSort && (
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{sortLabel}</span>
              <select
                className={styles.select}
                value={sort}
                onChange={(e) => onSortChange(e.target.value as PackagesToolbarProps["sort"])}
                aria-label={sortLabel}
              >
                <option value="recommended">Recommended</option>
                <option value="az">A → Z</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
              </select>
            </label>
          )}
        </div>
      )}
    </section>
  );
}
