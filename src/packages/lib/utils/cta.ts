/**
 * CTA helpers (routes + builders)
 * =============================================================================
 * Purpose
 * -----------------------------------------------------------------------------
 * Provide tiny, typed builders for CTA objects used by cards, sections, and
 * detail pages. Centralizing this logic keeps the “which CTA where?” policy in
 * one place and ensures consistent a11y labels.
 *
 * Design rules
 * -----------------------------------------------------------------------------
 * - Pure TypeScript (no React).
 * - Consume UI-only CTA types and (optionally) runtime Package type.
 * - Do not import components; only shapes/strings.
 */

import type { Cta, CtaPair, PackageRuntime } from "@/packages/lib/types";
import { CTA as CTA_LABEL, ariaBookCallAbout, ariaRequestProposalFor, ariaViewDetailsFor } from "./copy";

/* =============================================================================
 * Routes
 * ============================================================================= */

export const ROUTES = {
  /** Canonical route for a package detail page. */
  package: (slug: string) => `/packages/${encodeURIComponent(String(slug).trim())}`,
  /** Global routes used across surfaces. */
  book: "/book",
  contact: "/contact",
} as const;

/* =============================================================================
 * Builders
 * ============================================================================= */

/**
 * Card CTAs:
 * - Primary   → View details (/packages/[slug])
 * - Secondary → Book a call (/book)
 */
export function cardCtas(
  input: { slug: string; title?: string | null } | string,
  overrides?: Partial<CtaPair>
): CtaPair {
  const slug = typeof input === "string" ? input : input.slug;
  const title = typeof input === "string" ? input : input.title ?? input.slug;
  const href = ROUTES.package(slug);

  const primary: Cta = {
    label: CTA_LABEL.VIEW_DETAILS,
    href,
    ariaLabel: ariaViewDetailsFor(title),
    dataCta: "primary",
  };

  const secondary: Cta = {
    label: CTA_LABEL.BOOK_A_CALL,
    href: ROUTES.book,
    ariaLabel: ariaBookCallAbout(title),
    dataCta: "secondary",
  };

  return {
    primary: { ...primary, ...(overrides?.primary ?? {}) },
    secondary: { ...secondary, ...(overrides?.secondary ?? {}) },
  };
}

/**
 * Detail section CTAs (PriceActionsBand or CTA bar):
 * - Primary   → Request proposal (/contact)
 * - Secondary → Book a call (/book)
 */
export function sectionCtas(
  title?: string | null,
  overrides?: Partial<CtaPair>
): CtaPair {
  const primary: Cta = {
    label: CTA_LABEL.REQUEST_PROPOSAL,
    href: ROUTES.contact,
    ariaLabel: ariaRequestProposalFor(title ?? undefined),
    dataCta: "primary",
  };

  const secondary: Cta = {
    label: CTA_LABEL.BOOK_A_CALL,
    href: ROUTES.book,
    ariaLabel: ariaBookCallAbout(title ?? undefined),
    dataCta: "secondary",
  };

  return {
    primary: { ...primary, ...(overrides?.primary ?? {}) },
    secondary: { ...secondary, ...(overrides?.secondary ?? {}) },
  };
}

/**
 * Convenience: derive CTAs from a runtime package object.
 * - Cards: call with `{ surface: "card" }`
 * - Details: call with `{ surface: "detail" }`
 */
export function ctasForPackage(
  pkg: Pick<PackageRuntime, "slug" | "name">,
  opts: { surface: "card" | "detail"; overrides?: Partial<CtaPair> }
): CtaPair {
  return opts.surface === "card"
    ? cardCtas({ slug: pkg.slug, title: pkg.name }, opts.overrides)
    : sectionCtas(pkg.name, opts.overrides);
}
