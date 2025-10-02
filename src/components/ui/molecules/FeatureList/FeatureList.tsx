// src/components/ui/molecules/FeatureList/FeatureList.tsx
"use client";

/**
 * FeatureList
 * =============================================================================
 * Purpose
 * -------
 * Render a compact, icon-led list used by “Highlights” and “What’s included”.
 * Supports tri-state inclusions (included, limited, add-on, excluded).
 *
 * Robustness
 * ----------
 * 1) Stable React keys
 *    Some callers normalize from strings and do not pass `id`. We therefore
 *    accept optional `id` and derive a **safe key** fallback from index + label.
 *
 * 2) Rules of Hooks compliance
 *    We do NOT call `useId()` inside `.map()`. We create one list-scoped id via
 *    `useId()` and derive predictable tooltip ids: `${listId}-tip-${idx}`.
 *
 * Accessibility
 * -------------
 * - Semantic <ul> with optional `ariaLabel`.
 * - Info button uses `aria-describedby` → per-row tooltip id.
 * - Button `aria-label` uses readable label when available.
 */

import * as React from "react";
import styles from "./FeatureList.module.css";

/* ---------------------------------- Types --------------------------------- */

/** Tri-state support for inclusions beyond simple booleans */
export type FeatureState = boolean | "limit" | "add-on";

/** A single feature row. `id` is optional; a safe key fallback is derived. */
export type FeatureItem = {
  /** Optional stable id; if omitted, a safe key fallback is derived. */
  id?: string;
  /** Main text; accepts ReactNode for light formatting (e.g., <strong/>) */
  label: React.ReactNode;
  /** Included? true | false | "limit" | "add-on" */
  included?: FeatureState;
  /** Small secondary note that appears after the label */
  note?: string;
  /** Tooltip text (appears on hover/focus of the ⓘ button) */
  tooltip?: string;
  /** Optional override icon (otherwise determined by `included`) */
  icon?: React.ReactNode;
};

export type FeatureListProps = {
  items: FeatureItem[];
  /** Hide excluded items by default; set true to render them with a muted style */
  showExcluded?: boolean;
  /** Visual density */
  size?: "sm" | "md";
  /** Horizontal alignment of the whole list (grid item alignment) */
  align?: "start" | "center" | "end";
  /** Text alignment for labels/notes (does not affect the icon column) */
  textAlign?: "left" | "center" | "right";
  /** ARIA label for the whole list */
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
};

/* --------------------------------- Icons ---------------------------------- */

const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M16.7 5.7a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 10.1a1 1 0 1 1 1.4-1.4l3.3 3.3 6.8-6.3a1 1 0 0 1 1.9 0z" fill="currentColor" />
  </svg>
);

const MinusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M4 10.5a.5.5 0 0 1 .5-.5h11a.5.5 0 1 1 0 1h-11a.5.5 0 0 1-.5-.5z" fill="currentColor" />
  </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M10 4a.75.75 0 0 1 .75.75V9.25h4.5a.75.75 0 1 1 0 1.5h-4.5v4.5a.75.75 0 1 1-1.5 0v-4.5H4.25a.75.75 0 1 1 0-1.5h4.5V4.75A.75.75 0 0 1 10 4z" fill="currentColor" />
  </svg>
);

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 0 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4z" fill="currentColor" />
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
    <path d="M10 2a8 8 0 1 0 .001 16.001A8 8 0 0 0 10 2zm.75 11.25a.75.75 0 1 1-1.5 0V9.5a.75.75 0 1 1 1.5 0v3.75zM10 7.25a.875.875 0 1 1 0-1.75.875.875 0 0 1 0 1.75z" fill="currentColor" />
  </svg>
);

/* -------------------------------- Helpers -------------------------------- */

function stateClass(state: FeatureState | undefined): string {
  if (state === true) return styles.included;
  if (state === "limit") return styles.limited;
  if (state === "add-on") return styles.addon;
  if (state === false) return styles.excluded;
  return styles.included;
}

function defaultIconForState(state: FeatureState | undefined): React.ReactNode {
  if (state === true || state === undefined) return <CheckIcon className={styles.icon} />;
  if (state === "limit") return <MinusIcon className={styles.icon} />;
  if (state === "add-on") return <PlusIcon className={styles.icon} />;
  return <XIcon className={styles.icon} />;
}

/* ------------------------------- Component -------------------------------- */

const FeatureList: React.FC<FeatureListProps> = ({
  items,
  showExcluded = false,
  size = "md",
  align = "start",
  textAlign = "left",
  ariaLabel,
  className,
  style,
}) => {
  // List-scoped id to derive deterministic tooltip ids per row (SSR-safe).
  const listInstanceId = React.useId();

  const visible = React.useMemo(
    () => (showExcluded ? items : items.filter((it) => it.included !== false)),
    [items, showExcluded]
  );

  return (
    <ul
      className={[styles.root, size === "sm" ? styles.sm : styles.md, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label={ariaLabel}
      data-align={align}
      data-text={textAlign}
    >
      {visible.map((item, idx) => {
        const state = item.included;
        const liClass = [styles.item, stateClass(state)].join(" ");

        const labelText = typeof item.label === "string" ? item.label : undefined;

        // ---- KEY FIX: safe, stable key fallback when `id` is not provided ----
        const keySafe = item.id ?? (labelText ? `${idx}-${labelText}` : `row-${idx}`);

        // Derive tooltip id from the list-scoped id + row index (Rules of Hooks safe)
        const tooltipId = `${listInstanceId}-tip-${idx}`;

        return (
          <li key={keySafe} className={liClass}>
            <span className={styles.iconWrap}>
              {item.icon ?? defaultIconForState(state)}
            </span>

            <span className={styles.content}>
              <span className={styles.label}>
                {item.label}
                {item.tooltip ? (
                  <span className={styles.hasTooltip}>
                    <button
                      type="button"
                      className={styles.infoBtn}
                      aria-describedby={tooltipId}
                      aria-label={labelText ? `More info about ${labelText}` : "More info"}
                      title={item.tooltip}
                    >
                      <InfoIcon className={styles.infoIcon} />
                    </button>
                    <span id={tooltipId} role="tooltip" className={styles.tooltip}>
                      {item.tooltip}
                    </span>
                  </span>
                ) : null}
              </span>

              {item.note ? <span className={styles.note}>{item.note}</span> : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default FeatureList;
