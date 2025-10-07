// src/packages/lib/cta.ts

/**
 * Centralized routes & CTA helpers
 * --------------------------------
 * Usage:
 *   import { ROUTES, CTA_LABEL, cardCtas, sectionCtas } from "@/packages/lib/cta";
 *
 *   const { primary, secondary } = cardCtas(slug);
 *   // primary  -> { label: "View details",    href: `/packages/${slug}` }
 *   // secondary-> { label: "Book a call",     href: "/book" }
 *
 *   const { primary, secondary } = sectionCtas();
 *   // primary  -> { label: "Request proposal", href: "/contact" }
 *   // secondary-> { label: "Book a call",      href: "/book" }
 */

export const ROUTES = {
  /** Canonical route for a package detail page */
  package: (slug: string) =>
    `/packages/${encodeURIComponent(String(slug).trim())}`,
  /** Global routes */
  book: "/book",
  contact: "/contact",
} as const;

export const CTA_LABEL = {
  VIEW_DETAILS: "View details",
  BOOK_A_CALL: "Book a call",
  REQUEST_PROPOSAL: "Request proposal",
} as const;

export type CtaLabel = typeof CTA_LABEL[keyof typeof CTA_LABEL];

/**
 * CTA object shape used across cards/sections.
 * Keep `label` aligned with CTA_LABEL to prevent copy drift.
 */
export type Cta = Readonly<{
  label: CtaLabel;
  href: string;
  /** Optional ariaLabel override for a11y (button/link components may compose their own) */
  ariaLabel?: string;
}>;

export type CtaPair = Readonly<{ primary: Cta; secondary: Cta }>;

/** Shallow-merge helper for optional overrides */
function mergeCta(base: Cta, override?: Partial<Cta>): Cta {
  return {
    ...base,
    ...(override || {}),
  };
}

/**
 * Cards (grid/browse): Primary = "View details", Secondary = "Book a call"
 * Optionally pass `overrides` to customize label/href for a specific instance.
 */
export function cardCtas(
  slug: string,
  overrides?: Partial<CtaPair>
): CtaPair {
  const safeHref = slug ? ROUTES.package(slug) : "#";

  const primary: Cta = {
    label: CTA_LABEL.VIEW_DETAILS,
    href: safeHref,
  };
  const secondary: Cta = {
    label: CTA_LABEL.BOOK_A_CALL,
    href: ROUTES.book,
  };

  return {
    primary: mergeCta(primary, overrides?.primary),
    secondary: mergeCta(secondary, overrides?.secondary),
  };
}

/**
 * Detail/Landing CTA band (CTASection):
 * Primary = "Request proposal", Secondary = "Book a call"
 */
export function sectionCtas(overrides?: Partial<CtaPair>): CtaPair {
  const primary: Cta = {
    label: CTA_LABEL.REQUEST_PROPOSAL,
    href: ROUTES.contact,
  };
  const secondary: Cta = {
    label: CTA_LABEL.BOOK_A_CALL,
    href: ROUTES.book,
  };

  return {
    primary: mergeCta(primary, overrides?.primary),
    secondary: mergeCta(secondary, overrides?.secondary),
  };
}
