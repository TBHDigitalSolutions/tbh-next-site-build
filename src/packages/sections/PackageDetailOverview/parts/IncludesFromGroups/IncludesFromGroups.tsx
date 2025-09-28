// src/packages/sections/PackageDetailOverview/parts/IncludesFromGroups/IncludesFromGroups.tsx
// src/packages/sections/PackageDetailOverview/parts/IncludesFromGroups/IncludesFromGroups.tsx
"use client";

import * as React from "react";
import styles from "./IncludesFromGroups.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";

/** lightweight classnames helper (avoids external dep) */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type IncludesItem =
  | string
  | {
      label: string;
      /** Small, muted qualifier e.g. "add-on", "limited" */
      note?: string;
    };

export type IncludesGroup = {
  title: string;
  items: IncludesItem[];
};

export type IncludesFromGroupsProps = {
  /** Optional section heading (defaults to "What’s included") */
  title?: string;
  /** Optional caption (rendered under the section heading) */
  caption?: string;
  /** For single-package pages this component is the default includes renderer */
  packageName?: string;
  /** Authoring-friendly grouped bullets (single source of truth from base.ts) */
  groups: IncludesGroup[];

  /** Visual style */
  variant?: "cards" | "list";
  /** Explicit column count for the cards variant (desktop). If omitted we auto-fit. */
  cols?: 1 | 2 | 3;
  /** Cap the number of auto-fit columns without forcing a fixed count. */
  maxCols?: 2 | 3;

  /** Tighter vertical rhythm for dense lists */
  dense?: boolean;
  /** Show leading check icons on bullets (default true) */
  showIcons?: boolean;

  /** Optional small print under the grid/list */
  footnote?: React.ReactNode;
  /** Optional divider below the header */
  showDivider?: boolean;

  /** Optional "Deliverables" band (occasionally used) */
  deliverablesTitle?: string;
  deliverables?: Array<string | React.ReactNode>;

  /** Header alignment: start (default) or center */
  headerAlign?: "start" | "center";

  /** A11y + DOM plumbing */
  id?: string;
  "data-testid"?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

function normalizeItem(item: IncludesItem): { label: string; note?: string } {
  if (typeof item === "string") return { label: item };
  return { label: item.label, note: item.note };
}

export default function IncludesFromGroups({
  title = "What’s included",
  caption,
  packageName,
  groups,
  variant = "cards",               // ← default to CARDS for single-package details
  cols,
  maxCols = 2,                      // ← default clamp to 2 columns, per spec
  dense = false,
  showIcons = true,
  footnote,
  showDivider = true,
  deliverablesTitle = "Deliverables",
  deliverables,
  headerAlign = "start",
  id,
  "data-testid": testId = "includes-from-groups",
  className,
  style,
  ariaLabel,
}: IncludesFromGroupsProps) {
  const cleanGroups = React.useMemo(
    () =>
      (groups ?? [])
        .map((g) => ({
          title: g.title?.trim(),
          items: (g.items ?? []).map(normalizeItem).filter((i) => i.label?.trim()),
        }))
        .filter((g) => g.title && g.items.length > 0),
    [groups]
  );

  const hasGroups = cleanGroups.length > 0;
  const hasDeliverables = !!deliverables?.length;
  if (!hasGroups && !hasDeliverables) return null;

  const sectionLabel = ariaLabel || title;

  const gridClass = cx(
    styles.grid,
    variant === "cards" && styles.gridAuto,
    variant === "cards" && cols === 2 && styles.cols2,
    variant === "cards" && cols === 3 && styles.cols3,
    variant === "cards" && maxCols === 2 && styles.maxCols2,
    variant === "cards" && maxCols === 3 && styles.maxCols3
  );

  const centerHeader = headerAlign === "center";

  return (
    <section
      id={id}
      aria-label={sectionLabel}
      data-testid={testId}
      className={cx(styles.wrap, dense && styles.dense, className)}
      style={style}
    >
      {(title || caption) && (
        <header className={styles.header}>
          {title ? (
            <h2 className={cx(styles.heading, centerHeader && styles.center)}>{title}</h2>
          ) : null}
          {caption ? <p className={cx(styles.caption, centerHeader && styles.center)}>{caption}</p> : null}
        </header>
      )}

      {showDivider && (title || caption) ? (
        <Divider className={cx(styles.headerDivider, centerHeader && styles.center)} />
      ) : null}

      {/* Cards or List */}
      {hasGroups && (
        <div
          className={cx(
            variant === "cards" ? gridClass : styles.listWrap,
            showIcons ? undefined : styles.noIcons
          )}
        >
          {cleanGroups.map((group, idx) =>
            variant === "cards" ? (
              <article key={idx} className={styles.card}>
                <h3 className={styles.cardTitle}>{group.title}</h3>
                <hr className={styles.cardDivider} aria-hidden="true" />
                <ul className={styles.bullets}>
                  {group.items.map((it, i) => (
                    <li key={i} className={styles.bullet}>
                      {showIcons ? (
                        <span className={styles.icon} aria-hidden="true">
                          {/* inline SVG check */}
                          <svg viewBox="0 0 20 20" width="16" height="16" role="img" aria-label="" focusable="false">
                            <path
                              d="M7.6 13.2 4.8 10.4a1 1 0 1 0-1.4 1.4l3.8 3.8a1 1 0 0 0 1.4 0l7-7a1 1 0 1 0-1.4-1.4l-6.6 6.4Z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                      ) : null}
                      <span className={styles.text}>
                        {it.label}
                        {it.note ? <span className={styles.note}> — {it.note}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ) : (
              <section key={idx} className={styles.listGroup}>
                <h3 className={styles.listTitle}>{group.title}</h3>
                <ul className={styles.list}>
                  {group.items.map((it, i) => (
                    <li key={i} className={styles.listItem}>
                      {showIcons ? (
                        <span className={styles.icon} aria-hidden="true">
                          <svg viewBox="0 0 20 20" width="16" height="16" role="img" aria-label="" focusable="false">
                            <path
                              d="M7.6 13.2 4.8 10.4a1 1 0 1 0-1.4 1.4l3.8 3.8a1 1 0 0 0 1.4 0l7-7a1 1 0 1 0-1.4-1.4l-6.6 6.4Z"
                              fill="currentColor"
                            />
                          </svg>
                        </span>
                      ) : null}
                      <span className={styles.text}>
                        {it.label}
                        {it.note ? <span className={styles.note}> — {it.note}</span> : null}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )
          )}
        </div>
      )}

      {hasDeliverables ? (
        <div className={styles.deliverables}>
          {showDivider ? <Divider /> : null}
          <h3 className={styles.deliverablesHeading}>{deliverablesTitle}</h3>
          <ul className={styles.deliverablesList}>
            {deliverables!.filter(Boolean).map((d, i) => (
              <li key={`deliverable-${i}`}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
    </section>
  );
}
