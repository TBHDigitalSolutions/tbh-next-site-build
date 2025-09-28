// src/packages/sections/PackageDetailOverview/parts/MetaRow/MetaRow.tsx
"use client";

import * as React from "react";
import styles from "./MetaRow.module.css";
import { ServiceChip, type ServiceSlug } from "@/components/ui/molecules/ServiceChip";
import TagChips from "@/components/ui/molecules/TagChips";

export type MetaRowProps = {
  /** Optional service chip (e.g., "leadgen", "seo") */
  service?: ServiceSlug;
  /** Optional taxonomy tags shown as chips */
  tags?: string[];

  /** Hide/show the entire row (useful when the hero already shows chips) */
  show?: boolean; // default: true

  /** Visual alignment within its container */
  align?: "start" | "center" | "end";

  className?: string;
  /** Test hook / analytics */
  "data-testid"?: string;
};

export default function MetaRow({
  service,
  tags,
  show = true,
  align = "start",
  className,
  "data-testid": testId,
}: MetaRowProps) {
  if (!show) return null;

  const hasService = Boolean(service);
  const hasTags = Boolean(tags?.length);
  if (!hasService && !hasTags) return null;

  const alignClass =
    align === "center" ? styles.alignCenter : align === "end" ? styles.alignEnd : styles.alignStart;

  return (
    <div
      className={[styles.wrap, alignClass, className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Package metadata"
      data-testid={testId ?? "meta-row"}
    >
      {hasService ? <ServiceChip service={service!} size="sm" /> : null}
      {hasTags ? <TagChips tags={tags!} /> : null}
    </div>
  );
}
