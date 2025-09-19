"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./ExpandableBulletItem.module.css";
import type { ExpandableItem } from "../types";

// Swap for your design-system Link if needed:
import Link from "@/components/ui/atoms/Link";

export type ExpandableBulletItemProps = {
  item: ExpandableItem;
  index: number;
  isOpen: boolean;
  /** Called when the header is toggled */
  onToggle: (index: number) => void;
  /** Keyboard handler from parent (handles roving focus, Home/End, etc.) */
  onHeaderKeyDown: (e: React.KeyboardEvent, index: number) => void;

  /** Ref setter so parent can manage roving focus */
  setHeaderRef?: (index: number, el: HTMLButtonElement | null) => void;

  /** Heading level tag for the item title (defaults to h3 in parent) */
  itemHeadingAs?: keyof JSX.IntrinsicElements;

  /** If true, render a small anchor div with id=item.id above the row for #hash linking */
  withAnchor?: boolean;

  /** Optional namespace for analytics hooks */
  analyticsId?: string;

  /** Optional className passthrough */
  className?: string;
};

function buildId(prefix: string, id: string, suffix: string) {
  return `${prefix}-${id}-${suffix}`;
}

export default function ExpandableBulletItem({
  item,
  index,
  isOpen,
  onToggle,
  onHeaderKeyDown,
  setHeaderRef,
  itemHeadingAs = "h3",
  withAnchor = false,
  analyticsId,
  className,
}: ExpandableBulletItemProps) {
  const safeId = item.id || String(index);
  const btnId = buildId("expb", safeId, "btn");
  const panelId = buildId("expb", safeId, "panel");
  const HeadingTag = itemHeadingAs;

  return (
    <li
      className={clsx(styles.item, className)}
      role="listitem"
      data-analytics-id={analyticsId}
    >
      {withAnchor && <div id={safeId} className={styles.anchor} aria-hidden="true" />}

      <HeadingTag className={styles.heading}>
        <button
          ref={(el) => setHeaderRef?.(index, el)}
          id={btnId}
          className={clsx(styles.headerBtn, isOpen && styles.open)}
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={() => onToggle(index)}
          onKeyDown={(e) => onHeaderKeyDown(e, index)}
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
}

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
