"use client";

import * as React from "react";
import styles from "./OutcomesBlock.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";
import { OutcomeList, type OutcomeItem } from "@/components/ui/molecules/OutcomeList";

export type OutcomesBlockProps = {
  /** Array of simple strings or OutcomeList items */
  outcomes?: Array<string | OutcomeItem>;

  /** Optional heading shown above the list (ignored when hideHeading is true) */
  title?: string;

  /** When true, suppress the local title + divider and render only the list grid */
  hideHeading?: boolean;

  /** Grid columns for the list (defaults to 2; use CSS/container queries to bump on xl) */
  columns?: 2 | 3 | 4;

  /** Size token forwarded to OutcomeList (defaults to "sm") */
  size?: "sm" | "md" | "lg";

  /** Visual variant forwarded to OutcomeList (defaults to "check") */
  variant?: "check" | "bullet" | "dot";

  /** Render a divider under the heading (default true when a title is provided and hideHeading is false) */
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
    typeof o === "string"
      ? { id: `o-${i}`, label: o }
      : { id: o.id ?? `o-${i}`, label: o.label }
  );
}

function OutcomesBlock({
  outcomes = [],
  title,
  hideHeading = false,
  columns = 2,               // default to 2; scale up via container/parent CSS at xl
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

  const shouldShowHeader = !!title && !hideHeading;

  return (
    <section
      id={id}
      className={[styles.wrap, compact ? styles.compact : "", className].filter(Boolean).join(" ")}
      style={style}
      aria-label={ariaLabel ?? "Expected outcomes"}
      data-testid={testId}
      data-component="outcomes-block"
    >
      {shouldShowHeader ? (
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
