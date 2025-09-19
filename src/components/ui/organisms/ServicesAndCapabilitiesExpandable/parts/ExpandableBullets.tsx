"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./ExpandableBullets.module.css";
import type { ExpandableItem } from "../types";

// If you have a DS Link component, swap this import:
import Link from "@/components/ui/atoms/Link";

export type ExpandableBulletsProps = {
  items: ExpandableItem[];
  /** Open the first N items on mount (0 = none) */
  defaultOpen?: number;
  /** If false, behaves like single-select (closes others when one opens). Defaults to true. */
  allowMultiple?: boolean;
  /** Optional compact spacing */
  dense?: boolean;
  /** Optional heading level override for item titles (defaults to h3) */
  itemHeadingAs?: keyof JSX.IntrinsicElements;
  /** Analytics namespace applied to wrapper */
  analyticsId?: string;
  className?: string;
  /** Optional callback when an item is toggled */
  onToggle?(id: string, isOpen: boolean, index: number): void;
};

/** Utility to build deterministic IDs */
function buildId(prefix: string, id: string, suffix: string) {
  return `${prefix}-${id}-${suffix}`;
}

export default function ExpandableBullets({
  items,
  defaultOpen = 0,
  allowMultiple = true,
  dense = false,
  itemHeadingAs = "h3",
  analyticsId,
  className,
  onToggle,
}: ExpandableBulletsProps) {
  const [openSet, setOpenSet] = React.useState<Set<number>>(() => {
    const s = new Set<number>();
    for (let i = 0; i < Math.min(defaultOpen, items.length); i++) s.add(i);
    return s;
  });

  const headersRef = React.useRef<Array<HTMLButtonElement | null>>([]);

  if (!items?.length) return null;

  const toggleIndex = (index: number) => {
    setOpenSet(prev => {
      const next = new Set(prev);
      const isOpen = next.has(index);

      if (allowMultiple) {
        isOpen ? next.delete(index) : next.add(index);
      } else {
        next.clear();
        if (!isOpen) next.add(index);
      }

      onToggle?.(items[index].id, !isOpen, index);
      return next;
    });
  };

  const focusHeader = (index: number) => {
    const el = headersRef.current[index];
    if (el) el.focus();
  };

  const onHeaderKeyDown = (e: React.KeyboardEvent, index: number) => {
    const key = e.key;
    const last = items.length - 1;

    switch (key) {
      case "ArrowDown":
        e.preventDefault();
        focusHeader(index === last ? 0 : index + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusHeader(index === 0 ? last : index - 1);
        break;
      case "Home":
        e.preventDefault();
        focusHeader(0);
        break;
      case "End":
        e.preventDefault();
        focusHeader(last);
        break;
      case " ":
      case "Enter":
        e.preventDefault();
        toggleIndex(index);
        break;
      default:
        break;
    }
  };

  const HeadingTag = itemHeadingAs;

  return (
    <div
      className={clsx(styles.wrapper, dense && styles.dense, className)}
      data-component="ExpandableBullets"
      data-analytics-id={analyticsId}
    >
      <ul className={styles.list} role="list">
        {items.map((item, i) => {
          const isOpen = openSet.has(i);
          const btnId = buildId("expb", item.id || String(i), "btn");
          const panelId = buildId("expb", item.id || String(i), "panel");

          return (
            <li key={item.id || i} className={styles.item} role="listitem">
              <HeadingTag className={styles.heading}>
                <button
                  ref={el => (headersRef.current[i] = el)}
                  id={btnId}
                  className={clsx(styles.headerBtn, isOpen && styles.open)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleIndex(i)}
                  onKeyDown={(e) => onHeaderKeyDown(e, i)}
                  type="button"
                >
                  <span className={styles.headerMain}>
                    {item.tag && (
                      <span className={styles.tag} aria-hidden="true">
                        {item.tag}
                      </span>
                    )}
                    <span className={styles.title}>{item.title}</span>
                  </span>

                  <span className={styles.headerAside}>
                    {item.summary && <span className={styles.summary}>{item.summary}</span>}
                    <Chevron isOpen={isOpen} />
                  </span>
                </button>
              </HeadingTag>

              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className={clsx(styles.panel, isOpen && styles.panelOpen)}
              >
                <div className={styles.panelInner}>
                  {renderDetails(item.details)}

                  {item.cta && (
                    <div className={styles.ctaRow}>
                      <Link href={item.cta.href} className={styles.ctaLink}>
                        {item.cta.label}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Renders details as paragraph(s) or bullet list */
function renderDetails(details?: string | string[]) {
  if (!details) return null;

  if (Array.isArray(details)) {
    return (
      <ul className={styles.detailList}>
        {details.map((d, idx) => (
          <li key={idx} className={styles.detailItem}>
            {d}
          </li>
        ))}
      </ul>
    );
  }

  return <p className={styles.detailParagraph}>{details}</p>;
}

/** Simple chevron icon that rotates on open */
function Chevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5.5 7.5l4.5 4.5 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
