// src/packages/components/PackagesToolbar/PackagesToolbar.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./PackagesToolbar.module.css";
import SearchBarSafe from "./SearchBarSafe";

/* ------------------------------------------------------------------------- */
/* Types                                                                     */
/* ------------------------------------------------------------------------- */

export type PackagesToolbarProps = {
  /** Controlled search query */
  query: string;
  onQueryChange: (v: string) => void;

  /** Type chip filter */
  type: "all" | "bundles" | "packages" | "addons";
  onTypeChange: (v: PackagesToolbarProps["type"]) => void;

  /** Service select (service slug or undefined for 'all') */
  service?: string;
  onServiceChange: (v?: string) => void;

  /** Sort select */
  sort: "recommended" | "az" | "price-asc" | "price-desc";
  onSortChange: (v: PackagesToolbarProps["sort"]) => void;

  /** Optional lists for UI */
  serviceOptions?: Array<{ value: string; label: string }>;
  countsByType?: Partial<Record<PackagesToolbarProps["type"], number>>;

  /** Feature toggles */
  showTypeFilter?: boolean;
  showServiceFilter?: boolean;
  showSort?: boolean;
  showSearch?: boolean;

  /** Visual/A11y */
  className?: string;
  id?: string;
  compact?: boolean;
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
/* Component                                                                 */
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
  // Safe labels (i18n-friendly)
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

  // Ensure a single 'all' option exists
  const mergedServices = React.useMemo(() => {
    const hasAll = serviceOptions.some((o) => o.value === "all");
    const withAll = hasAll ? serviceOptions : [{ value: "all", label: "All services" }, ...serviceOptions];
    // De-dupe any accidental repeats of 'all'
    const seen = new Set<string>();
    return withAll.filter((o) => (seen.has(o.value) ? false : (seen.add(o.value), true)));
  }, [serviceOptions]);

  // Normalize counts (purely cosmetic)
  const counts = React.useMemo(
    () => ({
      all: countsByType?.all ?? 0,
      bundles: countsByType?.bundles ?? 0,
      packages: countsByType?.packages ?? 0,
      addons: countsByType?.addons ?? 0,
    }),
    [countsByType],
  );

  // Single chip button
  function TypeChip({
    value,
    label,
    count,
    testId,
  }: {
    value: PackagesToolbarProps["type"];
    label: string;
    count?: number;
    testId?: string;
  }) {
    const active = type === value;
    return (
      <button
        type="button"
        className={clsx(styles.typeChip, active && styles.typeChipActive)}
        aria-pressed={active}
        onClick={() => onTypeChange(value)}
        data-type={value}
        data-testid={testId}
      >
        <span className={styles.typeChipLabel}>{label}</span>
        {typeof count === "number" ? (
          <span className={styles.typeChipCount} aria-hidden="true">
            {count}
          </span>
        ) : null}
      </button>
    );
  }

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
            <SearchBarSafe
              value={query}
              onChange={onQueryChange}
              placeholder={searchPlaceholder}
              className={styles.searchBar}
              inputClassName={styles.searchInput}
            />
            <span className={styles.srOnly} aria-live="polite">
              {searchAriaLabel}
            </span>
          </div>
        )}

        {showTypeFilter && (
          <div className={styles.types} role="group" aria-label="Filter by type">
            <TypeChip value="all" label={typeAll} count={counts.all} testId="toolbar-type-all" />
            <TypeChip value="bundles" label={typeBundles} count={counts.bundles} testId="toolbar-type-bundles" />
            <TypeChip value="packages" label={typePackages} count={counts.packages} testId="toolbar-type-packages" />
            <TypeChip value="addons" label={typeAddons} count={counts.addons} testId="toolbar-type-addons" />
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
