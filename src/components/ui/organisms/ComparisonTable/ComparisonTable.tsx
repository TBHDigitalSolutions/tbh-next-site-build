// src/components/ui/organisms/ComparisonTable/ComparisonTable.tsx
"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./ComparisonTable.module.css";

// ✅ Use the shared contract instead of re-defining types here
import type {
  ComparisonColumn,
  ComparisonCell,
  ComparisonRow,
  ComparisonTableProps,
} from "./ComparisonTable.types";

/**
 * ComparisonTable — Generic table engine
 * ------------------------------------------------------------
 * Props are column/row/cell oriented so any domain can adapt its
 * data (via a wrapper/adapter) without changing this component.
 *
 * Typical usage:
 *   <ComparisonTable
 *     title="Compare Plans"
 *     subtitle="What’s included"
 *     columns={[
 *       { id: "starter", label: "Starter" },
 *       { id: "pro", label: "Professional", highlight: true, note: "Most popular" },
 *       { id: "enterprise", label: "Enterprise" }
 *     ]}
 *     rows={[
 *       {
 *         id: "feat-1",
 *         label: "Editing rounds",
 *         tooltip: "Number of revision cycles",
 *         group: "Production",
 *         cells: [
 *           { columnId: "starter", value: 1 },
 *           { columnId: "pro", value: 3 },
 *           { columnId: "enterprise", value: "Unlimited" }
 *         ]
 *       },
 *     ]}
 *   />
 */

/* ============================
   Helpers
============================ */

function renderCellValue(
  value: boolean | string | number | null | undefined
): { display: string; boolClass?: "yes" | "no" } {
  if (typeof value === "boolean") {
    return { display: value ? "✓" : "—", boolClass: value ? "yes" : "no" };
  }
  if (typeof value === "number") {
    return { display: String(value) };
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return { display: trimmed.length ? trimmed : "—" };
  }
  return { display: "—" };
}

function groupRows(rows: ComparisonRow[]) {
  const map = new Map<string, ComparisonRow[]>();
  for (const r of rows) {
    const key = r.group ?? "Features";
    const list = map.get(key);
    if (list) list.push(r);
    else map.set(key, [r]);
  }
  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    items,
  }));
}

function hasBooleanValues(rows: ComparisonRow[]) {
  return rows.some((r) => r.cells.some((c) => typeof c.value === "boolean"));
}

/* ============================
   Component
============================ */

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  columns,
  rows,
  title = "Detailed Feature Comparison",
  subtitle,
  stickyHeader = true,
  dense = false,
  showLegends = true,
  className,
}) => {
  if (!Array.isArray(columns) || columns.length === 0) return null;
  if (!Array.isArray(rows) || rows.length === 0) return null;

  const groups = React.useMemo(() => groupRows(rows), [rows]);
  const showLegend = showLegends && hasBooleanValues(rows);

  return (
    <section className={clsx(styles.wrapper, className)}>
      {(title || subtitle) && (
        <header className={styles.header}>
          {title && <h3 className={styles.title}>{title}</h3>}
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
      )}

      {showLegend && (
        <div className={styles.legend} aria-hidden="true">
          <span className={clsx(styles.legendItem, styles.yes)}>✓ Included</span>
          <span className={clsx(styles.legendItem, styles.no)}>— Not included</span>
        </div>
      )}

      {groups.map((group, gIdx) => (
        <div key={`${group.category}-${gIdx}`} className={styles.group}>
          <h4 className={styles.groupTitle}>{group.category}</h4>

          {/* Desktop/tablet table */}
          <div className={styles.tableScroll}>
            <table
              className={clsx(styles.table, stickyHeader && styles.sticky, dense && styles.dense)}
              aria-label={`${group.category} comparison`}
            >
              <thead>
                <tr>
                  <th className={styles.featureCol} scope="col">
                    Feature
                  </th>
                  {columns.map((col) => (
                    <th
                      key={`th-${col.id}`}
                      scope="col"
                      className={clsx(
                        styles.tierCol,
                        col.highlight && styles.highlightCol
                      )}
                    >
                      <div className={styles.tierHeadCell}>
                        <span className={styles.tierName}>{col.label}</span>
                        {col.note && <span className={styles.badge}>{col.note}</span>}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {group.items.map((row) => (
                  <tr key={row.id}>
                    <th className={styles.featureName} scope="row">
                      <span>{row.label}</span>
                      {row.tooltip && <em className={styles.help}>{row.tooltip}</em>}
                      {row.footnote && (
                        <em className={styles.footnote}>{row.footnote}</em>
                      )}
                    </th>

                    {columns.map((col) => {
                      const cell = row.cells.find((c: ComparisonCell) => c.columnId === col.id);
                      const { display, boolClass } = renderCellValue(cell?.value);
                      return (
                        <td
                          key={`cell-${row.id}-${col.id}`}
                          className={clsx(
                            styles.valueCell,
                            boolClass && styles[boolClass],
                            col.highlight && styles.highlightCol
                          )}
                          /* A11y: include the value in the label */
                          aria-label={`${col.label} – ${row.label}: ${display}`}
                        >
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked list per row */}
          <div className={styles.mobileList} aria-hidden>
            {group.items.map((row) => (
              <div key={`m-${row.id}`} className={styles.mobileFeature}>
                <div className={styles.mobileFeatureHead}>
                  <span className={styles.mobileFeatureName}>{row.label}</span>
                  {row.tooltip && <em className={styles.help}>{row.tooltip}</em>}
                  {row.footnote && (
                    <em className={styles.footnote}>{row.footnote}</em>
                  )}
                </div>

                <ul className={styles.mobileFeatureVals}>
                  {columns.map((col) => {
                    const cell = row.cells.find((c: ComparisonCell) => c.columnId === col.id);
                    const { display, boolClass } = renderCellValue(cell?.value);
                    return (
                      <li
                        key={`m-cell-${row.id}-${col.id}`}
                        className={clsx(
                          styles.mobileVal,
                          boolClass && styles[boolClass],
                          col.highlight && styles.highlightCol
                        )}
                      >
                        <span className={styles.mobileTier}>{col.label}</span>
                        <span className={styles.mobileValue}>{display}</span>
                        {col.note && <span className={styles.badge}>{col.note}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default ComparisonTable;
export { ComparisonTable };
