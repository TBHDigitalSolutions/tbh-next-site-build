// src/packages/sections/PackageDetailOverview/parts/PurposeBlock/PurposeBlock.tsx
import * as React from "react";
import styles from "./PurposeBlock.module.css";

export interface PurposeBlockProps {
  /** Heading shown above the narrative block. */
  title?: string; // defaults to "Purpose"
  /** Optional short subheading. */
  subtitle?: string;
  /**
   * Pre-rendered HTML from build (preferred).
   * Provide sanitized HTML (MDX → HTML) in the external JSON.
   */
  html?: string | null;
  /** Plain text fallback (rendered inside <p>). */
  text?: string | null;
  /** Optional DOM id and extra className for layout wrappers. */
  id?: string;
  className?: string;
}

/**
 * PurposeBlock
 * A concise narrative describing what success looks like.
 * - Renders sanitized HTML (preferred) or a plain text paragraph fallback.
 * - Centered header; body constrained for readability.
 * - No external data fetching — purely presentational.
 */
export function PurposeBlock({
  title = "Purpose",
  subtitle,
  html,
  text,
  id,
  className,
}: PurposeBlockProps) {
  const safeHtml = (html ?? "").trim();
  const hasHtml = safeHtml.length > 0;
  const hasText = !!text && String(text).trim().length > 0;

  if (!hasHtml && !hasText) return null;

  const headingId = React.useId();

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
    >
      <header className={styles.header}>
        <h2 id={headingId} className={styles.h2}>
          {title}
        </h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </header>

      <div className={styles.body}>
        {hasHtml ? (
          // HTML is expected to be sanitized by the build step (MDX → HTML).
          <div
            className={styles.rich}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <p className={styles.paragraph}>{text}</p>
        )}
      </div>
    </section>
  );
}

export default PurposeBlock;
