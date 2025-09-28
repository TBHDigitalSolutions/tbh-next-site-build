// src/packages/sections/PackageDetailOverview/parts/OutcomesBlock/OutcomesBlock.tsx
"use client";

import * as React from "react";
import styles from "./OutcomesBlock.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";
import { OutcomeList, type OutcomeItem } from "@/components/ui/molecules/OutcomeList";

export type OutcomesBlockProps = {
  /** Array of simple strings or OutcomeList items */
  outcomes?: Array<string | OutcomeItem>;
  /** Optional heading shown above the list */
  title?: string;
  /** Grid columns for the list (defaults to 3 on desktop) */
  columns?: 2 | 3 | 4;
  /** Size token forwarded to OutcomeList (defaults to "sm") */
  size?: "sm" | "md" | "lg";
  /** Visual variant forwarded to OutcomeList (defaults to "check") */
  variant?: "check" | "bullet" | "dot";
  /** Render a divider under the heading (default true when title is provided) */
  showDivider?: boolean;
  /** Compact spacing if needed */
  compact?: boolean;
  /** Optional ids / testing / styling hooks */
  id?: string;
  "data-testid"?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Aria label for the section wrapper (defaults to "Expected outcomes") */
  ariaLabel?: string;
};

function normalizeOutcomes(items: OutcomesBlockProps["outcomes"]): OutcomeItem[] {
  return (items ?? []).map((o, i) =>
    typeof o === "string" ? { id: `o-${i}`, label: o } : { id: o.id ?? `o-${i}`, label: o.label }
  );
}

function OutcomesBlock({
  outcomes = [],
  title,
  columns = 3,
  size = "sm",
  variant = "check",
  showDivider = true,
  compact = false,
  id,
  "data-testid": testId = "outcomes-block",
  className,
  style,
  ariaLabel,
}: OutcomesBlockProps) {
  const items = React.useMemo(() => normalizeOutcomes(outcomes), [outcomes]);
  if (items.length === 0) return null;

  return (
    <section
      id={id}
      className={[styles.wrap, compact ? styles.compact : "", className].filter(Boolean).join(" ")}
      style={style}
      aria-label={ariaLabel ?? "Expected outcomes"}
      data-testid={testId}
    >
      {title ? (
        <>
          <h2 className={styles.heading}>{title}</h2>
          {showDivider ? <Divider /> : null}
        </>
      ) : null}

      <OutcomeList
        items={items}
        layout="grid"
        columns={columns}
        size={size}
        variant={variant}
      />
    </section>
  );
}

export default React.memo(OutcomesBlock);
