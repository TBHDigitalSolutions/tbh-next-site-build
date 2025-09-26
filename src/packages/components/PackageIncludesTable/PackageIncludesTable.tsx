import * as React from "react";
import styles from "./PackageIncludesTable.module.css";

export type IncludeValue = boolean | "limit" | "add-on" | string | number;

export type Column = { id: string; label: string; note?: string };
export type Row = {
  id: string;
  label: string;
  note?: string;
  /** key is Column.id */
  values: Record<string, IncludeValue>;
};

export type PackageIncludesTableProps = {
  columns: Column[];
  rows: Row[];
  /** Optional caption above the table (recommended for a11y) */
  caption?: string;
  /** Show legend explaining icons/pills */
  legend?: boolean;
  className?: string;
  id?: string;
};

const IconCheck = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M16.7 5.7a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 10.1a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.3a1 1 0 0 1 1.9 0z"/>
  </svg>
);

const IconX = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 0 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4z"/>
  </svg>
);

const IconMinus = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M4 10.5a.5.5 0 0 1 .5-.5h11a.5.5 0 1 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
  </svg>
);

const IconPlus = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M10 4a.75.75 0 0 1 .75.75V9.25h4.5a.75.75 0 1 1 0 1.5h-4.5v4.5a.75.75 0 1 1-1.5 0v-4.5H4.25a.75.75 0 1 1 0-1.5h4.5V4.75A.75.75 0 0 1 10 4z"/>
  </svg>
);

function renderValue(v: IncludeValue) {
  if (v === true)   return <span className={`${styles.icon} ${styles.yes}`}><IconCheck/></span>;
  if (v === false)  return <span className={`${styles.icon} ${styles.no}`}><IconX/></span>;
  if (v === "limit") return (
    <span className={`${styles.pill} ${styles.limited}`} title="Limited">
      <IconMinus className={styles.inlineIcon}/><span>Limit</span>
    </span>
  );
  if (v === "add-on") return (
    <span className={`${styles.pill} ${styles.addon}`} title="Available as add-on">
      <IconPlus className={styles.inlineIcon}/><span>Add-on</span>
    </span>
  );
  return <span className={styles.text}>{String(v)}</span>;
}

export default function PackageIncludesTable({
  columns,
  rows,
  caption,
  legend = true,
  className,
  id,
}: PackageIncludesTableProps) {
  if (!columns?.length || !rows?.length) return null;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")} id={id}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            <th className={styles.hFeature} scope="col">Feature</th>
            {columns.map(col => (
              <th key={col.id} className={styles.hTier} scope="col">
                <div className={styles.thInner}>
                  <span className={styles.tierLabel}>{col.label}</span>
                  {col.note ? <span className={styles.tierNote}>{col.note}</span> : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <th scope="row" className={styles.featureCell}>
                <div className={styles.featureInner}>
                  <span className={styles.featureLabel}>{row.label}</span>
                  {row.note ? <span className={styles.featureNote}>{row.note}</span> : null}
                </div>
              </th>
              {columns.map((col) => (
                <td key={col.id} className={styles.valueCell}>
                  {renderValue(row.values[col.id] as IncludeValue)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {legend && (
        <div className={styles.legend} aria-label="Legend">
          <span className={styles.legendItem}>
            <span className={`${styles.legendIcon} ${styles.yes}`}><IconCheck/></span> Included
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendIcon} ${styles.no}`}><IconX/></span> Not included
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendIcon} ${styles.limited}`}><IconMinus/></span> Limited
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.legendIcon} ${styles.addon}`}><IconPlus/></span> Add-on
          </span>
        </div>
      )}
    </div>
  );
}
