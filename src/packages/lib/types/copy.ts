// src/packages/lib/copy.ts
/**
 * Centralized UI copy for pricing & CTAs.
 * - Single source of truth for labels used across cards, bands, and detail pages
 * - Token/locale agnostic (style casing in CSS if you prefer)
 * - Exposes small ARIA helpers for consistent accessibility text
 */

/* --------------------------------- Labels -------------------------------- */

export const CTA = {
  VIEW_DETAILS: "View details",
  BOOK_A_CALL: "Book a call",
  REQUEST_PROPOSAL: "Request proposal",
} as const;

export type CtaKey = keyof typeof CTA;

export const BASE_NOTE = {
  proposal: "Base price — request proposal",
  final: "Base price — final after scope",
} as const;

export type BaseNoteKey = keyof typeof BASE_NOTE;

/**
 * Badge label shown next to/above prices.
 * NOTE: If you want locale-friendly casing, set this to "Starting at"
 * and rely on CSS (`text-transform: uppercase`). Keeping it uppercase here
 * matches current screenshots/design comps.
 */
export const BADGE = "STARTING AT" as const;

/* --------------------------- Accessibility helpers ----------------------- */

/** Guard to keep ARIA labels clean even if title is empty/nullish. */
function _clean(title?: string | null) {
  const t = (title ?? "").trim();
  return t.length ? ` ${t}` : "";
}

/** ARIA label helpers (used when components don’t pass a custom aria-label) */
export function ariaViewDetailsFor(title?: string | null) {
  return `View details for${_clean(title)}`;
}
export function ariaBookCallAbout(title?: string | null) {
  return `Book a call about${_clean(title)}`;
}
export function ariaRequestProposalFor(title?: string | null) {
  return `Request proposal for${_clean(title)}`;
}

/** Resolve base-note copy from key (tiny convenience wrapper). */
export function baseNoteText(key: BaseNoteKey) {
  return BASE_NOTE[key];
}

/* ------------------------------ Default export --------------------------- */
/** Provide a default export to support legacy `import copy from ...` usage. */
const copy = {
  CTA,
  BASE_NOTE,
  BADGE,
  ariaViewDetailsFor,
  ariaBookCallAbout,
  ariaRequestProposalFor,
  baseNoteText,
};

export default copy;
