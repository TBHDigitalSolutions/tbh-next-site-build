/** src/packages/lib/registry/mappers.ts
 * Registry mappers — bridges validated content → UI props.
 * =============================================================================
 * Responsibilities
 * -----------------------------------------------------------------------------
 * - Enforce CTA policy (cards vs. detail pages).
 * - Map PackageMetadata → PackageCardProps / PackageDetailOverviewProps.
 * - Build derived "What’s included" tables when author forgot to author one.
 * - Keep fine print / price-band logic **separate** from SSOT price (pricing.ts).
 *
 * Design constraints
 * -----------------------------------------------------------------------------
 * - **No band variant decisions here**. Detail/card surfaces infer variants
 *   from the canonical price shape or via `bandPropsFor(...)` closer to the UI.
 * - **No business copy here**. CTA wording, base note text, etc. live in copy.ts.
 * - **No price math here**. Formatting/labels live in pricing.ts.
 *
 * Safety
 * -----------------------------------------------------------------------------
 * - Inputs are already validated at build time (MDX → JSON → Zod → PackageMetadata).
 * - Regardless, we still guard against optional/empty arrays and nullish fields
 *   to prevent React runtime warnings and to keep DOM/a11y clean.
 */

import type { PackageMetadata } from "@/types/package";
import type { PackageCardProps } from "@/packages/components/PackageCard/PackageCard";
import type { PackageDetailOverviewProps } from "@/packages/sections/PackageDetailOverview";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";

import {
  CTA,
  ariaBookCallAbout,
  ariaRequestProposalFor,
  ariaViewDetailsFor,
} from "@/packages/lib/copy";

/* =============================================================================
 * Small pure helpers (no side-effects)
 * ============================================================================= */

/**
 * Stable, URL/ID-safe slugifier for row IDs, keys, and test IDs.
 * - Lowercases
 * - Replaces non-alphanumerics with "-"
 * - Trims leading/trailing "-"
 */
function idify(s: string, fallback = "row"): string {
  const base = (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

/**
 * Normalize a "notes" style value to a single small-print string.
 * - Strings → trimmed string (or undefined if empty)
 * - Numbers → stringified
 * - Arrays  → " • " joined
 * - Other   → undefined
 */
export function normalizeFootnote(input?: unknown): string | undefined {
  if (input == null) return undefined;
  if (typeof input === "string") return input.trim() || undefined;
  if (typeof input === "number") return String(input);
  if (Array.isArray(input)) return input.filter(Boolean).join(" • ") || undefined;
  return undefined;
}

/**
 * Extract a human label out of a string | { label: string }.
 * Returns empty string for anything else (caller typically filters empties).
 */
function coerceLabel(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object" && "label" in item) {
    const v = (item as any).label;
    return typeof v === "string" ? v : "";
  }
  return "";
}

/* =============================================================================
 * Includes builders / adapters
 * ============================================================================= */

/**
 * Build a simple, 1-column "What’s included" table from include groups.
 * Useful as a fallback when authors provided groups but not a table.
 */
export function buildIncludesTableFromGroups(
  base: Pick<PackageMetadata, "name" | "includes">
): PackageIncludesTableProps {
  const columnId = "pkg";
  return {
    caption: "What’s included",
    columns: [{ id: columnId, label: base.name }],
    rows: (base.includes ?? []).flatMap((group) =>
      (group.items ?? []).map((item, i) => {
        const label = coerceLabel(item);
        return {
          id: `${idify(group.title, "group")}-${i}`,
          label: `${group.title} — ${label}`,
          values: { [columnId]: true },
        };
      })
    ),
  };
}

/**
 * Adapt the schema-authored `includesTable` into PackageIncludesTableProps.
 * We assume it already conforms to the generated type; this function mostly
 * preserves caption/columns/rows with a default caption fallback.
 */
export function mapIncludesTable(pkg: PackageMetadata): PackageIncludesTableProps | undefined {
  const t = pkg.includesTable;
  if (!t || !Array.isArray(t.rows) || t.rows.length === 0) return undefined;
  return {
    caption: t.caption ?? "What’s included",
    columns: t.columns,
    rows: t.rows,
  };
}

/* =============================================================================
 * CTA policy (centralized)
 * ============================================================================= */

type Cta = {
  label: string;
  href: string;
  /** Optional a11y label; renderer spreads to aria-label when present. */
  ariaLabel?: string;
  /** Optional analytics tag; renderer may spread as data-cta */
  dataCta?: "primary" | "secondary";
};

type CtaPair = { primary: Cta; secondary: Cta };

/**
 * Card surfaces:
 * - Primary CTA → View details (routes to /packages/[slug])
 * - Secondary   → Book a call
 */
export function buildCardCtas(nameOrSlug: string, slug: string): {
  primaryCta: Cta;
  secondaryCta: Cta;
} {
  const href = `/packages/${encodeURIComponent(slug)}`;

  return {
    primaryCta: {
      label: CTA.VIEW_DETAILS,
      href,
      ariaLabel: ariaViewDetailsFor(nameOrSlug),
      dataCta: "primary",
    },
    secondaryCta: {
      label: CTA.BOOK_A_CALL,
      href: "/book",
      ariaLabel: ariaBookCallAbout(nameOrSlug),
      dataCta: "secondary",
    },
  };
}

/**
 * Detail surfaces:
 * - Primary CTA → Request proposal
 * - Secondary   → Book a call
 */
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

/* =============================================================================
 * Card mappers
 * ============================================================================= */

type CardVariant = "default" | "rail" | "pinned-compact";

/**
 * Build `PackageCardProps` from validated content.
 *
 * Rules:
 * - Features: prefer authored `features`; fallback to the first 5 include items.
 * - Small print: normalize via `normalizeFootnote`.
 * - CTA: enforced by card policy (View details / Book a call).
 * - Price: pass canonical `price` as-is (formatting happens downstream).
 */
export function buildPackageCardProps(
  base: PackageMetadata,
  opts?: { variant?: CardVariant; highlight?: boolean }
): PackageCardProps {
  const { variant = "default", highlight = false } = opts ?? {};

  // Fallback features (first 5 from grouped includes)
  const fromIncludes = (base.includes?.flatMap((g) =>
    (g.items ?? []).map((it) => coerceLabel(it))
  ) ?? []).filter(Boolean);

  const features = (
    Array.isArray(base.features) && base.features.length > 0
      ? base.features.map(coerceLabel)
      : fromIncludes
  )
    .filter(Boolean)
    .slice(0, 5);

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

    // canonical price (downstream band/component does formatting)
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
 * Build a pinned/rail card for the detail page right rail.
 * Same visuals as a rail card, but CTA policy switches to detail (Request proposal).
 */
export function buildPinnedCardForDetail(base: PackageMetadata): PackageCardProps {
  const card = buildPackageCardProps(base, { variant: "rail" });
  const { primary, secondary } = buildDetailCtas(base.name);
  return {
    ...card,
    primaryCta: primary,
    secondaryCta: secondary,
  };
}

/* =============================================================================
 * Detail overview mapper (super-card that feeds phases 1–5)
 * ============================================================================= */

/**
 * Map PackageMetadata → PackageDetailOverviewProps
 *
 * Scope:
 * - Phase 1 inputs (title, summary/valueProp, long description, ICP)
 * - Pricing (canonical) and priceBand (microcopy) passthrough
 * - CTA policy (detail)
 * - Phase 2–3 content: features, outcomes, includes (groups/table)
 * - Right-rail pinned card with detail CTAs
 * - Phase 4 extras + notes
 *
 * Out-of-scope:
 * - Band variant resolution (done at the detail surface via price shape).
 * - Price formatting/labels (pricing.ts).
 */
export function buildPackageDetailOverviewProps(
  base: PackageMetadata
): PackageDetailOverviewProps {
  const { primary: ctaPrimary, secondary: ctaSecondary } = buildDetailCtas(base.name);

  const hasGroups = Array.isArray(base.includes) && base.includes.length > 0;

  // Prefer authoring groups; fall back to authored table only when groups are absent.
  const adaptedTable = !hasGroups ? mapIncludesTable(base) : undefined;

  // As ultimate fallback, synthesize a 1-col table from groups
  const derivedTable =
    !hasGroups && !adaptedTable
      ? buildIncludesTableFromGroups({ name: base.name, includes: base.includes })
      : undefined;

  // Pinned/rail card adopts detail CTA policy
  const pinnedPackageCard = buildPinnedCardForDetail(base);

  return {
    /* Headline & meta */
    id: `${base.slug}-overview`,
    title: base.name,
    valueProp: base.summary,
    description: base.description,
    icp: base.icp,
    service: base.service,
    tags: base.tags,

    /* Canonical price + band microcopy (detail component decides variant/defaults) */
    packagePrice: base.price,
    priceBand: base.priceBand,

    /* CTAs (detail policy) */
    ctaPrimary,
    ctaSecondary,

    /* Phase 2 (Why) + Phase 3 (What) */
    features: Array.isArray(base.features)
      ? base.features.map(coerceLabel).filter(Boolean)
      : undefined,
    outcomes: base.outcomes,

    /* What’s included (groups preferred; table is fallback) */
    includesGroups: hasGroups ? base.includes : undefined,
    includesTable: hasGroups ? undefined : (adaptedTable ?? derivedTable),

    /* Right sticky rail card */
    pinnedPackageCard,

    /* Phase 4 — Details & Trust (extra bundles + notes) */
    notes: normalizeFootnote(base.notes),
    // Keep this shape permissive; PackageDetailExtras is resilient to missing keys.
    extras: {
      timeline: base.timeline,
      ethics: base.ethics,
      requirements: base.requirements,
      // If your content includes these, pass them through (harmless if undefined):
      ...(base as any).limits && { limits: (base as any).limits },
      ...(base as any).timelineBlocks && { timelineBlocks: (base as any).timelineBlocks },
    } as any,

    /* Styling hooks (optional in most use-cases) */
    className: undefined,
    style: undefined,
  };
}

/* =============================================================================
 * Convenience wrappers (handy in call sites)
 * ============================================================================= */

export const buildDefaultCard = (b: PackageMetadata) =>
  buildPackageCardProps(b, { variant: "default" });

export const buildRailCard = (b: PackageMetadata) =>
  buildPackageCardProps(b, { variant: "rail" });

export const buildPinnedCompactCard = (b: PackageMetadata) =>
  buildPackageCardProps(b, { variant: "pinned-compact" });

/* =============================================================================
 * End of file
 * =============================================================================
 */
