// src/packages/components/PackagePricingMatrix/PackagePricingMatrix.tsx 
import * as React from "react";
import styles from "./PackagePricingMatrix.module.css";
import PriceLabel, { type Money } from "@/components/ui/molecules/PriceLabel";

export type CellMoney = { money: Money; note?: string };
export type CellValue =
  | boolean
  | "limit"
  | "add-on"
  | string
  | number
  | CellMoney;

export type MatrixColumn = { id: string; label: string; note?: string };
export type MatrixRow = {
  id: string;
  label: string;
  note?: string;
  values: Record<string, CellValue>;
};

export type MatrixGroup = {
  id: string;
  label: string;
  note?: string;
  rows: MatrixRow[];
};

export type PackagePricingMatrixProps = {
  columns: MatrixColumn[];
  groups: MatrixGroup[];
  caption?: string;
  footnotes?: React.ReactNode;
  className?: string;
};

const Check = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M16.7 5.7a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 10.1a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.3a1 1 0 0 1 1.9 0z"
    />
  </svg>
);
const X = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 0 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4z"
    />
  </svg>
);
const Minus = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M4 10.5a.5.5 0 0 1 .5-.5h11a.5.5 0 1 1 0 1h-11a.5.5 0 0 1-.5-.5z"
    />
  </svg>
);
const Plus = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M10 4a.75.75 0 0 1 .75.75V9.25h4.5a.75.75 0 1 1 0 1.5h-4.5v4.5a.75.75 0 1 1-1.5 0v-4.5H4.25a.75.75 0 1 1 0-1.5h4.5V4.75A.75.75 0 0 1 10 4z"
    />
  </svg>
);

function renderCell(v: CellValue): React.ReactNode {
  if (typeof v === "boolean") {
    return v ? (
      <span className={`${styles.icon} ${styles.yes}`}><Check /></span>
    ) : (
      <span className={`${styles.icon} ${styles.no}`}><X /></span>
    );
  }
  if (v === "limit") {
    return (
      <span className={`${styles.pill} ${styles.limited}`}>
        <Minus className={styles.inlineIcon} />
        Limit
      </span>
    );
  }
  if (v === "add-on") {
    return (
      <span className={`${styles.pill} ${styles.addon}`}>
        <Plus className={styles.inlineIcon} />
        Add-on
      </span>
    );
  }
  if (typeof v === "number") return <span className={styles.text}>{v}</span>;
  if (typeof v === "string") return <span className={styles.text}>{v}</span>;
  // money cell
  const cm = v as CellMoney;
  return (
    <div className={styles.moneyCell}>
      <PriceLabel price={cm.money} />
      {cm.note ? <div className={styles.moneyNote}>{cm.note}</div> : null}
    </div>
  );
}

export default function PackagePricingMatrix({
  columns,
  groups,
  caption,
  footnotes,
  className,
}: PackagePricingMatrixProps) {
  if (!columns?.length || !groups?.length) return null;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(" ")}>
      <table className={styles.table}>
        {caption ? <caption className={styles.caption}>{caption}</caption> : null}
        <thead>
          <tr>
            <th className={styles.hFeature} scope="col">Item</th>
            {columns.map((c) => (
              <th key={c.id} className={styles.hTier} scope="col">
                <div className={styles.thInner}>
                  <span className={styles.tierLabel}>{c.label}</span>
                  {c.note ? <span className={styles.tierNote}>{c.note}</span> : null}
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => (
            <React.Fragment key={group.id}>
              <tr className={styles.groupRow}>
                <th className={styles.groupHeader} colSpan={columns.length + 1} scope="rowgroup">
                  <div className={styles.groupHeaderInner}>
                    <span className={styles.groupLabel}>{group.label}</span>
                    {group.note ? <span className={styles.groupNote}>{group.note}</span> : null}
                  </div>
                </th>
              </tr>

              {group.rows.map((row) => (
                <tr key={row.id}>
                  <th scope="row" className={styles.itemCell}>
                    <div className={styles.itemInner}>
                      <span className={styles.itemLabel}>{row.label}</span>
                      {row.note ? <span className={styles.itemNote}>{row.note}</span> : null}
                    </div>
                  </th>
                  {columns.map((c) => (
                    <td key={c.id} className={styles.valCell}>
                      {renderCell(row.values[c.id])}
                    </td>
                  ))}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {footnotes ? <div className={styles.footnotes}>{footnotes}</div> : null}
    </div>
  );
}
