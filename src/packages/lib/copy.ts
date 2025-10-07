// src/packages/lib/copy.ts
/**
 * Centralized UI labels / microcopy (no routes, no business logic).
 * -----------------------------------------------------------------------------
 * - Keep this file tiny and framework-agnostic (safe for RSC/SSG).
 * - Components & mappers import labels from here; routes live elsewhere.
 * - Use `as const` + Object.freeze for immutability & strong typing.
 *
 * i18n note:
 * If/when you add translations, replace the string literals with a
 * translation-layer lookup (while preserving the exported names).
 */

/** CTA button labels (used by cards & detail pages) */
export const CTA = Object.freeze({
  VIEW_DETAILS: "View details",
  BOOK_A_CALL: "Book a call",
  REQUEST_PROPOSAL: "Request proposal",
}) as const;

/** Type helpers for CTA usage */
export type CtaKey = keyof typeof CTA;
export type CtaLabel = (typeof CTA)[CtaKey];

/**
 * Base-note policy copy for the detail **PriceActionsBand**.
 * Cards do not render base-note text—detail only.
 */
export const BASE_NOTE_TEXT = Object.freeze({
  proposal: "Base price — request proposal",
  final: "Base price — final after scope",
}) as const;

export type BaseNoteKey = keyof typeof BASE_NOTE_TEXT;
export type BaseNoteText = (typeof BASE_NOTE_TEXT)[BaseNoteKey];

/** “Starting at” badge/label text shown adjacent to price figures */
export const PRICE_BADGE = "Starting at" as const;
export type PriceBadge = typeof PRICE_BADGE;

/** Optional default aria fragments (kept minimal; routes/verbs belong in callers) */
export const ARIA = Object.freeze({
  STARTING_AT: "Starting at",
}) as const;
export type AriaKey = keyof typeof ARIA;
export type AriaText = (typeof ARIA)[AriaKey];
