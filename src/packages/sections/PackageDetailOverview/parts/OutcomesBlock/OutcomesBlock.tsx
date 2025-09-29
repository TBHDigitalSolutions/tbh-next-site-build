"use client";

import * as React from "react";
import styles from "./OutcomesBlock.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";
/* ⬇️ Correct: default component import + typed re-export */
import OutcomeList, { type OutcomeItem } from "@/components/ui/molecules/OutcomeList";

export type OutcomesBlockProps = {
  outcomes?: Array<string | OutcomeItem>;
  title?: string;
  hideHeading?: boolean;
  columns?: 1 | 2 | 3;
  size?: "sm" | "md";
  variant?: "check" | "bullet" | "dot" | "arrow";
  showDivider?: boolean;
  compact?: boolean;
  id?: string;
  "data-testid"?: string;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
};

function normalizeOutcomes(items: OutcomesBlockProps["outcomes"]): OutcomeItem[] {
  return (items ?? []).map((o, i) =>
    typeof o === "string"
      ? { id: `o-${i}`, label: o }
      : { id: o.id ?? `o-${i}`, label: o.label, note: o.note, emphasis: o.emphasis, icon: o.icon }
  );
}

function OutcomesBlock({
  outcomes = [],
  title,
  hideHeading = false,
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
        variant={variant === "bullet" ? "dot" : variant}
        align="start"
        textAlign="left"
        ariaLabel="Expected outcomes"
      />
    </section>
  );
}

export default React.memo(OutcomesBlock);
