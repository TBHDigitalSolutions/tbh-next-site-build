import * as React from "react";
import styles from "./OutcomeList.module.css";

export type OutcomeItem = {
  id: string;
  label: React.ReactNode;    // short outcome text
  note?: string;             // optional, lighter secondary text
  emphasis?: boolean;        // bold style for key outcomes
  icon?: React.ReactNode;    // override icon per-item
};

export type OutcomeListProps = {
  items: OutcomeItem[];
  /** Visual density */
  size?: "sm" | "md";
  /** Layout style */
  layout?: "list" | "inline" | "grid";
  /** Grid columns (when layout="grid") */
  columns?: 1 | 2 | 3;
  /** Default icon for items (can be overridden per item) */
  variant?: "dot" | "check" | "arrow";
  /** Accessibility label for the <ul> */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

/* ---- Small inline SVGs (no external deps) ---- */

const DotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 8 8" aria-hidden="true" {...props}>
    <circle cx="4" cy="4" r="3" fill="currentColor" />
  </svg>
);

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M16.7 5.7a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 10.1a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.3a1 1 0 0 1 1.9 0z" fill="currentColor"/>
  </svg>
);

const ArrowIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M3.5 10a.75.75 0 0 1 .75-.75h9.69l-2.72-2.72a.75.75 0 1 1 1.06-1.06l4.06 4.06a.75.75 0 0 1 0 1.06l-4.06 4.06a.75.75 0 0 1-1.06-1.06l2.72-2.72H4.25A.75.75 0 0 1 3.5 10z" fill="currentColor"/>
  </svg>
);

function defaultIcon(variant: NonNullable<OutcomeListProps["variant"]>) {
  if (variant === "check") return <CheckIcon className={styles.icon} />;
  if (variant === "arrow") return <ArrowIcon className={styles.icon} />;
  return <DotIcon className={styles.icon} />; // dot
}

export const OutcomeList: React.FC<OutcomeListProps> = ({
  items,
  size = "md",
  layout = "list",
  columns = 2,
  variant = "dot",
  ariaLabel,
  className,
  style
}) => {
  const layoutClass =
    layout === "inline"
      ? styles.inline
      : layout === "grid"
      ? [styles.grid, columns === 1 ? styles.cols1 : columns === 3 ? styles.cols3 : styles.cols2].join(" ")
      : styles.list;

  return (
    <ul
      className={[styles.root, styles[size], layoutClass, className].filter(Boolean).join(" ")}
      style={style}
      aria-label={ariaLabel}
    >
      {items.map(item => {
        const labelText = typeof item.label === "string" ? item.label : undefined;
        return (
          <li key={item.id} className={styles.item}>
            <span className={styles.iconWrap} aria-hidden="true">
              {item.icon ?? defaultIcon(variant)}
            </span>
            <span className={styles.content}>
              <span className={[styles.label, item.emphasis ? styles.emphasis : ""].join(" ")}>
                {item.label}
              </span>
              {item.note ? (
                <span className={styles.note} aria-label={labelText ? `${labelText}: ${item.note}` : undefined}>
                  {item.note}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default OutcomeList;
