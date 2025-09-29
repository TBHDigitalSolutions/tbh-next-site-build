// src/packages/lib/registry/mappers.ts
/**
 * Registry mappers — single source of truth for:
 * - CTA policy for cards & detail pages
 * - Card props (default/rail/pinned-compact)
 * - Detail overview props (band inputs, pinned card, includes table)
 * - Safe footnote normalization
 *
 * No summary → tagline fallback. Band copy only comes from `priceBand`.
 */

import type { PackageAuthoringBase } from "./types";
import type { PackageCardProps } from "@/packages/components/PackageCard/PackageCard";
import type { PackageDetailOverviewProps } from "@/packages/sections/PackageDetailOverview";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";

import { resolveBandVariant, defaultBaseNote } from "@/packages/lib/band";
import {
  CTA,
  ariaBookCallAbout,
  ariaRequestProposalFor,
  ariaViewDetailsFor,
} from "@/packages/lib/copy";

/* ==========================================================================
   Helpers
   ========================================================================== */

/** Join footnote variants safely to avoid [object Object] */
export function normalizeFootnote(input?: unknown): string | undefined {
  if (typeof input === "string") return input.trim() || undefined;
  if (typeof input === "number") return String(input);
  if (Array.isArray(input)) return input.filter(Boolean).join(" • ") || undefined;
  return undefined;
}

/** Build the 1-col "What’s included" table used on details pages */
export function buildIncludesTable(
  base: Pick<PackageAuthoringBase, "name" | "includes">
): PackageIncludesTableProps {
  const caption = "What’s included";
  const columnId = "pkg";

  return {
    caption,
    columns: [{ id: columnId, label: base.name }],
    rows: (base.includes ?? []).flatMap((group) =>
      (group.items ?? []).map((item, i) => ({
        id: `${String(group.title ?? "group").toLowerCase().replace(/\s+/g, "-")}-${i}`,
        label: `${group.title} — ${item}`,
        values: { [columnId]: true },
      }))
    ),
  };
}

/* ==========================================================================
   CTA policy (centralized)
   ========================================================================== */

type Cta = {
  label: string;
  href: string;
  /** Optional a11y label; renderer can map this to aria-label */
  ariaLabel?: string;
  /** Optional analytics tag; renderer can spread as data-cta */
  dataCta?: "primary" | "secondary";
};
type CtaPair = { primary: Cta; secondary: Cta };

/** Cards: Primary = View details; Secondary = Book a call */
export function buildCardCtas(nameOrSlug: string, slug: string): {
  primaryCta: Cta;
  secondaryCta: Cta;
} {
  const href = `/packages/${encodeURIComponent(slug)}`;

  const primaryCta: Cta = {
    label: CTA.VIEW_DETAILS,
    href,
    ariaLabel: ariaViewDetailsFor(nameOrSlug),
    dataCta: "primary",
  };

  const secondaryCta: Cta = {
    label: CTA.BOOK_A_CALL,
    href: "/book",
    ariaLabel: ariaBookCallAbout(nameOrSlug),
    dataCta: "secondary",
  };

  return { primaryCta, secondaryCta };
}

/** Detail pages: Primary = Request proposal; Secondary = Book a call */
export function buildDetailCtas(name?: string): CtaPair {
  return {
    primary: {
      label: CTA.REQUEST_PROPOSAL,
      href: "/contact",
      ariaLabel: ariaRequestProposalFor(name),
      dataCta: "primary",
    },
    secondary: {
      label: CTA.BOOK_A_CALL,
      href: "/book",
      ariaLabel: ariaBookCallAbout(name),
      dataCta: "secondary",
    },
  };
}

/* ==========================================================================
   Card mappers
   ========================================================================== */

type CardVariant = "default" | "rail" | "pinned-compact";

/**
 * Build PackageCard props from authoring base.
 * - Uses card CTA policy
 * - Trims features to top 5
 * - Normalizes footnote
 */
export function buildPackageCardProps(
  base: PackageAuthoringBase,
  opts?: { variant?: CardVariant; highlight?: boolean }
): PackageCardProps {
  const { variant = "default", highlight = false } = opts ?? {};
  const features = (base.includes?.flatMap((g) => g.items) ?? []).slice(0, 5);
  const { primaryCta, secondaryCta } = buildCardCtas(base.name ?? base.slug, base.slug);

  return {
    // identity / routing
    id: base.id,
    slug: base.slug,
    href: `/packages/${base.slug}`,
    testId: `card-${base.slug}`,

    // naming / content
    name: base.name,
    description: base.summary,

    // features (top 5)
    features,

    // art (optional)
    image: base.image ?? undefined,

    // taxonomy / context
    service: base.service,
    tier: base.tier ?? undefined,
    badge: base.badges?.[0],
    tags: base.tags,

    // canonical price (band on cards handles badge-left + inline/chips)
    price: base.price,

    // CTAs (policy)
    primaryCta,
    secondaryCta,

    // small print (not the band finePrint)
    footnote: normalizeFootnote(base.notes),

    // presentation / analytics
    variant,
    highlight,
    isLoading: false,
    analyticsCategory: "packages",
  };
}

/**
 * Build a pinned card for detail rails.
 * - Same visuals as rail card
 * - BUT primary CTA switches to Request proposal (detail policy)
 */
export function buildPinnedCardForDetail(base: PackageAuthoringBase): PackageCardProps {
  const card = buildPackageCardProps(base, { variant: "rail" });
  const { primary, secondary } = buildDetailCtas(base.name);

  return {
    ...card,
    primaryCta: primary,
    secondaryCta: secondary,
  };
}

/* ==========================================================================
   Detail overview mapper (super-card)
   ========================================================================== */

export function buildPackageDetailOverviewProps(
  base: PackageAuthoringBase
): PackageDetailOverviewProps {
  const { primary: ctaPrimary, secondary: ctaSecondary } = buildDetailCtas(base.name);

  // Band copy — never derive tagline from summary
  const bandVariant = resolveBandVariant("detail", base.price);
  const baseNote = defaultBaseNote(base.price);
  const tagline = base.priceBand?.tagline; // explicit only
  const finePrint = base.priceBand?.finePrint;

  // Includes table for the “What’s included” section
  const includesTable = buildIncludesTable(base);

  // Pinned card for the right rail with detail CTA policy
  const pinnedPackageCard = buildPinnedCardForDetail(base);

  return {
    /* Headline & meta */
    id: `${base.slug}-overview`,
    title: base.name,
    valueProp: base.summary,
    description: base.description,
    icp: (base as any).icp, // optional in authoring; keep flexible
    service: base.service,
    tags: base.tags,

    /* Canonical price ONLY (the component renders the band) */
    packagePrice: base.price,

    /* PriceActionsBand inputs (consumed by the overview component) */
    priceBand: {
      variant: bandVariant,
      baseNote,  // detail policy: proposal for hybrid/monthly; final for one-time
      tagline,   // detail-only, optional
      finePrint, // detail-only, optional
    },

    /* CTAs (policy) */
    ctaPrimary,
    ctaSecondary,

    /* Outcomes */
    outcomes: base.outcomes,

    /* What’s included (one-column table) */
    includesTable,

    /* Sticky right rail */
    pinnedPackageCard,

    /* Notes (plain text; small print under includes table) */
    notes: normalizeFootnote(base.notes),

    /* Styling hooks */
    className: undefined,
    style: undefined,
  };
}

/* ==========================================================================
   Convenience wrappers per common surfaces (optional)
   ========================================================================== */

export function buildDefaultCard(base: PackageAuthoringBase): PackageCardProps {
  return buildPackageCardProps(base, { variant: "default" });
}
export function buildRailCard(base: PackageAuthoringBase): PackageCardProps {
  return buildPackageCardProps(base, { variant: "rail" });
}
export function buildPinnedCompactCard(base: PackageAuthoringBase): PackageCardProps {
  return buildPackageCardProps(base, { variant: "pinned-compact" });
}

/* ==========================================================================
   Notes
   - No imports from the (deleted) price.ts.
   - No fallback of band.tagline to summary.
   - Cards never pass band finePrint/baseNote; detail overview does.
   - CTA copy/targets are centralized (consistent labels & ARIA).
   ========================================================================== */
