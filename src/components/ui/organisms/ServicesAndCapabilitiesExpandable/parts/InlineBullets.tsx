"use client";

import * as React from "react";
import clsx from "clsx";
import styles from "./InlineBullets.module.css";
import type { ReactNode } from "react";

// If you prefer your design system Link, swap this import:
import Link from "@/components/ui/atoms/Link";

export type InlineBullet = {
  label: string;
  href?: string;
  title?: string;        // tooltip / accessible title
  icon?: ReactNode;      // optional leading icon
  onClick?: () => void;  // for non-navigation actions
  target?: "_blank" | "_self";
  rel?: string;
  "data-tracking-id"?: string;
};

export type InlineBulletsProps = {
  items: InlineBullet[];
  columns?: 2 | 3 | 4;     // desktop column count (auto stacks on small screens)
  dense?: boolean;         // tighter spacing
  align?: "left" | "center";
  analyticsId?: string;    // optional analytics namespace
  ariaLabel?: string;
  className?: string;
};

export default function InlineBullets({
  items,
  columns = 3,
  dense = false,
  align = "left",
  analyticsId,
  ariaLabel,
  className,
}: InlineBulletsProps) {
  if (!items?.length) return null;

  const clampedCols = Math.min(4, Math.max(2, columns));

  return (
    <nav
      className={clsx(
        styles.wrapper,
        styles[`cols${clampedCols}`],
        dense && styles.dense,
        align === "center" && styles.center,
        className
      )}
      aria-label={ariaLabel}
      data-component="InlineBullets"
      data-analytics-id={analyticsId}
    >
      <ul className={styles.grid} role="list">
        {items.map((item, idx) => {
          const key = `${item.label}-${idx}`;
          const content = (
            <>
              <span className={styles.bulletIcon} aria-hidden="true">
                {item.icon ?? <span className={styles.dot} />}
              </span>
              <span className={styles.label}>{item.label}</span>
            </>
          );

          // Link variant (preferred when href is present)
          if (item.href) {
            // If your Link expects props differently, adjust here.
            return (
              <li key={key} className={styles.item} role="listitem">
                <Link
                  href={item.href}
                  className={styles.link}
                  title={item.title ?? item.label}
                  target={item.target}
                  rel={item.rel}
                  data-tracking-id={item["data-tracking-id"]}
                >
                  {content}
                </Link>
              </li>
            );
          }

          // Button/action variant (no href)
          return (
            <li key={key} className={styles.item} role="listitem">
              <button
                type="button"
                className={clsx(styles.link, styles.buttonLike)}
                title={item.title ?? item.label}
                onClick={item.onClick}
                data-tracking-id={item["data-tracking-id"]}
              >
                {content}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
