// src/packages/lib/registry/mappers.ts
// src/packages/lib/registry/mappers.ts
/**
 * Registry mappers — single source of truth for:
 * - CTA policy for cards & detail pages
 * - Card props (default/rail/pinned-compact)
 * - Detail overview props (band inputs, pinned card, includes groups/table)
 * - Safe footnote normalization
 *
 * Notes:
 * - No summary → tagline fallback. Band copy only comes from `priceBand`.
 * - Do not pass band `variant`; the detail component resolves it from price.
 */

import type {
  PackageAuthoringBase,
  IncludesTableLike,
} from "./types";
import type { PackageCardProps } from "@/packages/components/PackageCard/PackageCard";
import type { PackageDetailOverviewProps } from "@/packages/sections/PackageDetailOverview";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";

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

/** Tiny slug/id helper for local row ids */
function idify(s: string, fallback = "row"): string {
  const base = (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return base || fallback;
}

/** Build a 1-column "What’s included" table from include groups (fallback) */
export function buildIncludesTableFromGroups(
  base: Pick<PackageAuthoringBase, "name" | "includes">
): PackageIncludesTableProps {
  const caption = "What’s included";
  const columnId = "pkg";

  return {
    caption,
    columns: [{ id: columnId, label: base.name }],
    rows: (base.includes ?? []).flatMap((group) =>
      (group.items ?? []).map((item, i) => ({
        id: `${idify(group.title, "group")}-${i}`,
        label: `${group.title} — ${item}`,
        values: { [columnId]: true },
      }))
    ),
  };
}

/**
 * Adapt a loose IncludesTableLike (authoring-friendly) into PackageIncludesTableProps.
 * If no columns are given, uses a single column labeled with the package name.
 * Row convention: first cell is the feature label; subsequent cells map to columns.
 */
export function mapIncludesTableLike(
  pkgName: string,
  t?: IncludesTableLike
): PackageIncludesTableProps | undefined {
  if (!t || !Array.isArray(t.rows) || t.rows.length === 0) return undefined;

  const colLabels = Array.isArray(t.columns) && t.columns.length > 0 ? t.columns : [pkgName];
  const columns = colLabels.map((label, i) => ({
    id: `c${i}-${idify(label, `c${i}`)}`,
    label,
  }));

  const rows = t.rows
    .map((r, i) => {
      const cells = Array.isArray(r) ? r : r?.cells;
      if (!cells || cells.length === 0) return null;

      const label = String(cells[0]).trim();
      if (!label) return null;

      const values: Record<string, boolean> = {};
      // Map presence/truthiness from cells → columns (starting at cell index 1)
      for (let j = 1; j < cells.length && j <= columns.length; j++) {
        const raw = cells[j];
        const truthy =
          raw === true ||
          (typeof raw === "string" && raw.trim() !== "" && raw.toLowerCase() !== "false" && raw !== "0") ||
          (typeof raw === "number" && raw > 0);
        if (truthy) values[columns[j - 1].id] = true;
      }

      return {
        id: `row-${i}-${idify(label, "row")}`,
        label,
        values,
      };
    })
    .filter(Boolean) as PackageIncludesTableProps["rows"];

  return {
    caption: t.caption ?? "What’s included",
    columns,
    rows,
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
 * - Prefers authored `features`; falls back to top 5 includes
 * - Normalizes footnote
 */
export function buildPackageCardProps(
  base: PackageAuthoringBase,
  opts?: { variant?: CardVariant; highlight?: boolean }
): PackageCardProps {
  const { variant = "default", highlight = false } = opts ?? {};
  const fromIncludes = (base.includes?.flatMap((g) => g.items) ?? []).slice(0, 5);
  const features = (base.features && base.features.length > 0 ? base.features : fromIncludes).slice(0, 5);
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

  // Prefer includes groups; only fall back to a table if no groups provided
  const hasGroups = Array.isArray(base.includes) && base.includes.length > 0;

  // If author supplied a loose includesTable shape and no groups, adapt it
  const adaptedTable = !hasGroups ? mapIncludesTableLike(base.name, (base as any).includesTable) : undefined;

  // Otherwise, build a simple 1-column presence table as ultimate fallback
  const derivedTable =
    !hasGroups && !adaptedTable ? buildIncludesTableFromGroups({ name: base.name, includes: base.includes }) : undefined;

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

    /* PriceActionsBand inputs (detail component applies defaults/variant) */
    priceBand: base.priceBand,

    /* CTAs (policy) */
    ctaPrimary,
    ctaSecondary,

    /* Highlights & outcomes */
    features: base.features,
    outcomes: base.outcomes,

    /* What’s included */
    includesGroups: hasGroups ? base.includes : undefined,
    includesTable: hasGroups ? undefined : (adaptedTable ?? derivedTable),

    /* Sticky right rail */
    pinnedPackageCard,

    /* Notes (plain text; small print under includes table) */
    notes: normalizeFootnote(base.notes),

    /* Extras (below grid) */
    extras: {
      timelineBlocks: (base as any).timelineBlocks,
      timeline: base.timeline,
      ethics: base.ethics,
      limits: (base as any).limits,
    },

    /* Styling hooks */
    className: undefined,
    style: undefined,
  };
}

/* ==========================================================================
   Convenience wrappers per common surfaces
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
   - Do NOT import legacy helpers (price.ts / cta.ts). Use copy.ts + policy here.
   - No fallback of band.tagline to summary.
   - Cards never pass band finePrint/baseNote; detail overview may pass priceBand.
   - CTA copy/targets are centralized (consistent labels & ARIA).
   ========================================================================== */
