// src/packages/sections/PackageDetailOverview/parts/PainPointsBlock/PainPointsBlock.tsx
import * as React from "react";
import styles from "./PainPointsBlock.module.css";

type PainPointItem = string | { label: string; icon?: React.ReactNode };

export interface PainPointsBlockProps {
  title?: string;            // defaults to "Pain points"
  subtitle?: string;         // optional short subheading
  items: PainPointItem[];    // 3–8 recommended
  className?: string;
  id?: string;
}

/**
 * PainPointsBlock
 * Accessible list of common challenges this package addresses.
 * - Mobile: single column
 * - ≥1024px: two balanced columns
 * - Uses semantic <ul>/<li> with icon bullets
 */
export function PainPointsBlock({
  title = "Pain points",
  subtitle,
  items,
  className,
  id,
}: PainPointsBlockProps) {
  if (!items || items.length === 0) return null;

  const normalized = items.map((it) =>
    typeof it === "string" ? { label: it } : it
  );

  // Link header to list for a11y
  const headingId = React.useId();
  const sectionId = id;

  return (
    <section
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      id={sectionId}
      aria-labelledby={headingId}
    >
      <header className={styles.header}>
        <h2 id={headingId} className={styles.h2}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <ul className={styles.list} role="list">
        {normalized.map((item, idx) => {
          const key = (item as any).id ?? `${idx}-${item.label ?? item}`;
          return (
            <li key={key} className={styles.item}>
              <span aria-hidden="true" className={styles.icon}>
                {/* default caution/issue glyph; currentColor so themes work */}
                {(item.icon ?? (
                  <svg
                    viewBox="0 0 20 20"
                    width="16"
                    height="16"
                    className={styles.iconSvg}
                  >
                    <path
                      d="M10.98 2.86l6.76 11.71c.58 1.01-.15 2.28-1.31 2.28H3.57c-1.16 0-1.89-1.27-1.31-2.28L9.02 2.86c.58-1 2.02-1 2.6 0z"
                      fill="currentColor"
                      opacity=".12"
                    />
                    <path
                      d="M10 6.25v5.5M10 14.25h.01"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                )) as React.ReactNode}
              </span>
              <span className={styles.label}>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default PainPointsBlock;
