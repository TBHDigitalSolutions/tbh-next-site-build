// src/packages/sections/PackageDetailExtras/RequirementsBlock/RequirementsBlock.tsx
import * as React from "react";
import styles from "./RequirementsBlock.module.css";

export interface RequirementsBlockProps {
  /** Section title (defaults to "Requirements") */
  title?: string;
  /** Bullet list of access/integrations, e.g., "CRM admin access", "GA4", "DNS" */
  items: string[];
  /** Optional short caption beneath the title (e.g., “What we need to get started”) */
  caption?: string;
  className?: string;
  id?: string;
}

/**
 * RequirementsBlock
 * - Renders a standardized block header (title + divider + optional caption)
 * - Shows a clean bullet list using your unified tokens
 * - Designed to live inside PackageDetailExtras
 */
export function RequirementsBlock({
  title = "Requirements",
  items,
  caption,
  className,
  id,
}: RequirementsBlockProps) {
  if (!items || items.length === 0) return null;

  const headingId = React.useId();

  return (
    <section
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      id={id}
      data-component="RequirementsBlock"
      aria-labelledby={headingId}
    >
      <header className={styles.blockHeader}>
        <h3 id={headingId} className={styles.h3}>{title}</h3>
        <div className={styles.rule} aria-hidden="true" />
        {caption ? <p className={styles.caption}>{caption}</p> : null}
      </header>

      <ul className={styles.list} role="list">
        {items.map((req, i) => (
          <li className={styles.item} key={`${i}-${req}`}>
            <span className={styles.tick} aria-hidden="true">✓</span>
            <span className={styles.label}>{req}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default RequirementsBlock;
