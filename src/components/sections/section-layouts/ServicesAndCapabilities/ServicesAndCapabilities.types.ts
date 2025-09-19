// src/components/sections/section-layouts/ServicesAndCapabilities/ServicesAndCapabilities.types.ts
import type { ReactNode } from "react";

/** A single “pillar” card (icon + title + desc + up to a few bullets) */
export type Pillar = {
  id: string;
  title: string;
  description: string;
  icon?: string | ReactNode;
  deliverables?: string[];
};

/** A navigational bullet (rendered in a 3×3 grid of link cards) */
export type Bullet = {
  label: string;
  href: string;
};

/** A simple service card (title/desc/link) */
export type ServiceCardItem = {
  id: string;
  title: string;
  description?: string;
  href: string;
  icon?: string | ReactNode;
};

/** CTA row under the grid */
export type ServicesAndCapabilitiesCTAs = {
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string };
};

/** Public props used by the component directly */
export type ServicesAndCapabilitiesProps = {
  title?: string;
  description?: string;
  chips?: string[];             // kept for backward compat (ignored if bullets present)
  pillars?: Pillar[];           // render pillars grid if present
  bullets?: Bullet[];           // render 3×3 bullet grid if present
  cards?: ServiceCardItem[];    // NEW: render cards below bullets/pillars when provided
  ctas?: ServicesAndCapabilitiesCTAs;
  className?: string;
};

/** Optional legacy/templated shape the template may pass { block: {...} } */
export type WithBlock =
  | ServicesAndCapabilitiesProps
  | { block: ServicesAndCapabilitiesProps };
