// Public prop & item types for ServicesAndCapabilitiesExpandable

import type * as React from "react";

/** Individual expandable row (formerly L3/L4 inline) */
export type ExpandableItem = {
  id: string;
  title: string;
  /** short, one-line teaser that appears at the right of the header */
  summary?: string;
  /** details content: either a paragraph string or bullet list */
  details?: string | string[];
  /** optional CTA rendered in the panel footer */
  cta?: { label: string; href: string };
  /** small badge at the header (e.g., "API", "Security") */
  tag?: string;
};

/** Pillar card (deliverables) item */
export type Pillar = {
  id: string;
  title: string;
  description?: string;
  deliverables?: string[];
  /** string key mapped to your icon system or a custom React node */
  icon?: string | React.ReactNode;
};

/** Simple inline bullet link */
export type InlineBullet = {
  label: string;
  href?: string;
};

/** Main component props */
export type ServicesAndCapabilitiesExpandableProps = {
  title?: string;
  /** intro/lede sentence under the section title */
  intro?: string;

  pillars?: Pillar[];
  bullets?: InlineBullet[];

  /** merged L3/L4 inline content */
  expandable?: ExpandableItem[];

  /** open the first N rows on mount (0 = none) */
  defaultOpen?: number;

  /** analytics namespace for this block (e.g., "web:applications:capabilities") */
  analyticsId?: string;

  /** optional passthrough styling */
  className?: string;
};

/* ------------------------------------------------------------------ */
/* Legacy / page-data helper types (narrow – only what's needed here) */
/* ------------------------------------------------------------------ */

/**
 * Minimal legacy "capabilities" block that we commonly find in L2/L3 page data.
 * This is intentionally permissive so the adapter can accept varied shapes.
 */
export type LegacyCapabilitiesBlock = {
  title?: string;
  description?: string;
  // canonical fields:
  pillars?: Array<{
    id?: string;
    title?: string;
    description?: string;
    deliverables?: string[] | string;
    icon?: string | React.ReactNode;
  }>;
  bullets?: Array<{ label?: string; href?: string } | string>;

  // new combined content:
  expandable?: Array<{
    id?: string;
    title?: string;
    summary?: string;
    details?: string | string[];
    cta?: { label?: string; href?: string };
    tag?: string;
  }>;

  // occasionally seen aliases:
  intro?: string;
};

/** The broader page block some data files pass down (very permissive). */
export type AnyCapabilitiesLike =
  | LegacyCapabilitiesBlock
  | {
      /** Some pages wrap capabilities under `capabilities: {...}` */
      capabilities?: LegacyCapabilitiesBlock;
      /** Optional header fields duplicated at the parent level */
      title?: string;
      description?: string;
      intro?: string;
    };

/** Input accepted by adapters.normalizeProps (matches the orchestrator’s SectionProps). */
export type NormalizableInput =
  | ServicesAndCapabilitiesExpandableProps
  | { block?: unknown; className?: string; analyticsId?: string }
  | AnyCapabilitiesLike;
