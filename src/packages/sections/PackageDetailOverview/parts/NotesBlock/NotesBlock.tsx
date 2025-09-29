// src/packages/sections/PackageDetailOverview/parts/NotesBlock/NotesBlock.tsx
// src/packages/sections/PackageDetailOverview/parts/NotesBlock/NotesBlock.tsx
"use client";

import * as React from "react";
import styles from "./NotesBlock.module.css";
import Divider from "@/components/ui/atoms/Divider/Divider";

export type NotesBlockProps = {
  /** Optional title above the notes; defaults to "Notes" when notes exist */
  title?: string;
  /** Notes content; string or richer React nodes */
  notes?: React.ReactNode;
  /** Whether to render a Divider under the heading (default: true when title present) */
  showDivider?: boolean;
  /** Denser spacing */
  compact?: boolean;

  /* Hooks / a11y */
  id?: string;
  "data-testid"?: string;
  ariaLabel?: string;

  className?: string;
  style?: React.CSSProperties;
  /** Children render after `notes` (useful for extra small print) */
  children?: React.ReactNode;
};

export default function NotesBlock({
  title,
  notes,
  showDivider,
  compact = false,
  id,
  "data-testid": testId = "notes-block",
  ariaLabel,
  className,
  style,
  children,
}: NotesBlockProps) {
  const hasNotes =
    notes !== undefined &&
    notes !== null &&
    !(typeof notes === "string" && notes.trim().length === 0);

  if (!hasNotes && !children) return null;

  const computedTitle = title ?? (hasNotes ? "Notes" : undefined);
  const shouldShowDivider = computedTitle ? showDivider ?? true : false;

  // Render string notes as paragraphs (split on blank lines), else render node(s)
  const renderNotes = () => {
    if (typeof notes !== "string") return notes;

    const chunks = notes
      .split(/\n{2,}/g)
      .map((s) => s.trim())
      .filter(Boolean);

    return chunks.map((para, i) => (
      <p key={`note-${i}`} className={styles.text}>
        {para}
      </p>
    ));
  };

  return (
    <section
      id={id}
      data-testid={testId}
      className={[styles.wrap, compact ? styles.compact : "", className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-label={ariaLabel ?? "Additional notes"}
    >
      {computedTitle ? <h2 className={styles.heading}>{computedTitle}</h2> : null}
      {shouldShowDivider ? <Divider /> : null}

      <div className={styles.content}>
        {hasNotes ? renderNotes() : null}
        {children}
      </div>
    </section>
  );
}
