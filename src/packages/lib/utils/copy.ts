/**
 * Copy utilities (values + a11y helpers)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Central place for UI copy tokens that multiple surfaces share:
 *   - CTA labels (used by cards, detail bands, sections)
 *   - Price base-note text (used by PriceActionsBand)
 *   - A11y label helpers for consistent aria-label strings
 *
 * Design rules
 * -----------------------------------------------------------------------------
 * - Pure values + tiny string helpers (no React).
 * - Keep wording here so adapters/mappers can reference a single source.
 * - If you localize, swap implementations here without touching callers.
 */

/* =============================================================================
 * CTA labels
 * ============================================================================= */

export const CTA = {
  VIEW_DETAILS: "View details",
  BOOK_A_CALL: "Book a call",
  REQUEST_PROPOSAL: "Request proposal",
} as const;

/** Back-compat alias some codebases prefer. */
export const CTA_LABEL = CTA;

/* =============================================================================
 * Price base-note (microcopy)
 * ============================================================================= */

export const BASE_NOTE = {
  proposal: "Base price — request proposal",
  final: "Base price — final after scope",
} as const;

/* =============================================================================
 * Badge token
 * =============================================================================
 * NOTE: prefer styling/casing via CSS in the UI. Keep this as a neutral token.
 */
export const BADGE = "STARTING AT" as const;

/* =============================================================================
 * Accessibility helpers
 * ============================================================================= */

function _clean(title?: string | null) {
  const t = (title ?? "").trim();
  return t.length ? ` ${t}` : "";
}

/** “View details for {Title}” */
export function ariaViewDetailsFor(title?: string | null) {
  return `View details for${_clean(title)}`;
}

/** “Book a call about {Title}” */
export function ariaBookCallAbout(title?: string | null) {
  return `Book a call about${_clean(title)}`;
}

/** “Request proposal for {Title}” */
export function ariaRequestProposalFor(title?: string | null) {
  return `Request proposal for${_clean(title)}`;
}

/* =============================================================================
 * Default export (legacy convenience)
 * ============================================================================= */

const copy = {
  CTA,
  CTA_LABEL,
  BASE_NOTE,
  BADGE,
  ariaViewDetailsFor,
  ariaBookCallAbout,
  ariaRequestProposalFor,
};

export default copy;
