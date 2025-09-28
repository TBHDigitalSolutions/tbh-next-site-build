// src/packages/sections/PackageDetailOverview/parts/TitleBlock/TitleBlock.tsx
"use client";

import * as React from "react";
import styles from "./TitleBlock.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";

export type TitleBlockProps = {
  /** Optional id applied to the heading for aria-labelledby links */
  id?: string;

  /** Semantic heading level (defaults to h2 to avoid duplicate h1 with the Hero) */
  as?: "h1" | "h2" | "h3";

  /** Required title text (or rich node) */
  title: React.ReactNode;

  /** 1–2 sentence value proposition (optional) */
  valueProp?: React.ReactNode;

  /** Audience line (renders as: “For: …” when provided) */
  icp?: string;

  /** Show a divider beneath the heading (brand rule) */
  showDivider?: boolean; // default: true

  /** Align content within the block */
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
  icp,
  showDivider = true,
  align = "start",
  className,
  style,
  "data-testid": testId,
}: TitleBlockProps) {
  const Heading = as as keyof JSX.IntrinsicElements;

  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;

  return (
    <header
      className={[styles.wrap, alignClass, className].filter(Boolean).join(" ")}
      style={style}
      data-testid={testId ?? "title-block"}
    >
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>

      {showDivider && <Divider className={styles.divider} />}

      {valueProp ? <p className={styles.valueProp}>{valueProp}</p> : null}

      {icp ? (
        <p className={styles.icp}>
          <strong>For:</strong> {icp}
        </p>
      ) : null}
    </header>
  );
}
