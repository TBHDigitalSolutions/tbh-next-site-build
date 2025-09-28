// src/packages/sections/PackageDetailOverview/parts/TitleBlock/TitleBlock.tsx
// src/packages/sections/PackageDetailOverview/parts/TitleBlock/TitleBlock.tsx
"use client";

import * as React from "react";
import styles from "./TitleBlock.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";

export type TitleBlockProps = {
  /** Optional id applied to the heading and referenced by aria-labelledby on the wrapper */
  id?: string;

  /** Semantic heading level (defaults to h2 to avoid duplicate h1 with the page hero) */
  as?: "h1" | "h2" | "h3";

  /** Main title (plain text or rich node) */
  title: React.ReactNode;

  /** Short value proposition (1–2 sentences, optional) */
  valueProp?: React.ReactNode;

  /** Longer descriptive paragraph (optional) */
  description?: React.ReactNode;

  /** ICP body text (audience); when present we render the “Ideal for” block */
  icp?: React.ReactNode;

  /**
   * Optional ICP header label and an optional extra line/paragraph
   * to elaborate on the audience fit beneath the ICP line.
   */
  icpTitle?: string;                // default: "Ideal for"
  icpDescription?: React.ReactNode; // optional second paragraph

  /** Show a divider beneath the title (brand rule) */
  showDivider?: boolean; // default: true

  /** Horizontal alignment for all inner content */
  align?: "start" | "center" | "end"; // default: "start"

  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
};

export default function TitleBlock({
  id,
  as = "h2",
  title,
  valueProp,
  description,
  icp,
  icpTitle = "Ideal for",
  icpDescription,
  showDivider = true,
  align = "start",
  className,
  style,
  "data-testid": testId = "title-block",
}: TitleBlockProps) {
  const Heading = as as keyof JSX.IntrinsicElements;
  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;

  const headingId = id ? `${id}__title` : undefined;

  return (
    <header
      className={[styles.wrap, alignClass, className].filter(Boolean).join(" ")}
      style={style}
      aria-labelledby={headingId}
      data-testid={testId}
    >
      <Heading id={headingId} className={styles.title}>
        {title}
      </Heading>

      {showDivider && <Divider className={styles.divider} />}

      {valueProp ? <p className={styles.valueProp}>{valueProp}</p> : null}

      {description ? <p className={styles.description}>{description}</p> : null}

      {/* ICP block: header + divider + body (+ optional extra description) */}
      {(icp || icpDescription) ? (
        <section className={styles.block} aria-labelledby={id ? `${id}__icp` : undefined}>
          <h3 className={styles.blockTitle} id={id ? `${id}__icp` : undefined}>
            {icpTitle}
          </h3>
          <Divider className={styles.blockDivider} />
          {icp ? <p className={styles.icp}>{icp}</p> : null}
          {icpDescription ? <p className={styles.icpDesc}>{icpDescription}</p> : null}
        </section>
      ) : null}
    </header>
  );
}
