// src/packages/sections/PackageDetailOverview/parts/IncludesFromGroups/IncludesFromGroups.tsx
"use client";

import * as React from "react";
import styles from "./IncludesFromGroups.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";

export type IncludesGroup = { title: string; items: string[] };

export type IncludesFromGroupsProps = {
  /** The package name used as the single column label */
  packageName: string;

  /** Authoring-friendly grouped bullets (from base.ts) */
  groups?: IncludesGroup[];

  /** Optional deliverables list; renders only if provided and non-empty */
  deliverables?: string[];
  /** Heading for the deliverables block (default: "Deliverables") */
  deliverablesTitle?: string;

  /** Section heading (falls back to caption) */
  title?: string;

  /** Table caption (shown for a11y; defaults to "What’s included") */
  caption?: string;

  /** Show a divider under the heading (default true when title/caption present) */
  showDivider?: boolean;

  /** Compact spacing option */
  compact?: boolean;

  /** Hooks */
  id?: string;
  "data-testid"?: string;
  className?: string;
  style?: React.CSSProperties;

  /** Aria label for the section wrapper */
  ariaLabel?: string;
};

export default function IncludesFromGroups({
  packageName,
  groups,
  deliverables,
  deliverablesTitle = "Deliverables",
  title,
  caption = "What’s included",
  showDivider = true,
  compact = false,
  id,
  "data-testid": testId = "includes-from-groups",
  className,
  style,
  ariaLabel,
}: IncludesFromGroupsProps) {
  // Build the includes table from authoring-friendly groups
  const table: PackageIncludesTableProps | null = React.useMemo(() => {
    if (!groups?.length) return null;

    const rows =
      groups.flatMap((group) =>
        (group.items ?? []).map((item, i) => ({
          id: `${group.title.toLowerCase().replace(/\s+/g, "-")}-${i}`,
          label: `${group.title} — ${item}`,
          values: { pkg: true }, // single column gets a checkmark
        })),
      ) ?? [];

    if (!rows.length) return null;

    return {
      caption,
      columns: [{ id: "pkg", label: packageName || "Package" }],
      rows,
    };
  }, [groups, caption, packageName]);

  const hasDeliverables = (deliverables?.filter(Boolean).length ?? 0) > 0;
  const hasTable = !!table;

  // If neither includes nor deliverables exist, render nothing
  if (!hasTable && !hasDeliverables) return null;

  const headingText = title ?? caption;

  return (
    <section
      id={id}
      className={[styles.wrap, compact ? styles.compact : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label={ariaLabel ?? (headingText || "Included items")}
      data-testid={testId}
    >
      {/* Top heading + divider (optional) */}
      {headingText ? (
        <>
          <h2 className={styles.heading}>{headingText}</h2>
          {showDivider ? <Divider /> : null}
        </>
      ) : null}

      {/* Includes table (if present) */}
      {hasTable ? <PackageIncludesTable {...table} /> : null}

      {/* Deliverables (optional, only shows if provided) */}
      {hasDeliverables ? (
        <div
          className={styles.deliverables}
          aria-label="Deliverables"
          data-testid={`${testId}-deliverables`}
        >
          {/* Add spacing + optional divider when both sections are present */}
          {(hasTable || headingText) ? <Divider /> : null}
          <h3 className={styles.deliverablesHeading}>{deliverablesTitle}</h3>
          <ul className={styles.deliverablesList}>
            {deliverables!.filter(Boolean).map((d, i) => (
              <li key={`deliverable-${i}`}>{d}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
