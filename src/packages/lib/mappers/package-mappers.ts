// src/packages/lib/mappers/package-mappers.ts
/**
 * Package mappers (master)
 * =============================================================================
 * What this file is
 * -----------------------------------------------------------------------------
 * A single, framework-agnostic module that covers:
 *
 *  1) Authoring-time normalization helpers:
 *     - Light alias/shape normalization for MDX frontmatter objects, in case
 *       they're used directly somewhere upstream. Most pipelines should prefer
 *       `frontmatterToPackage(...)` from `mdx-frontmatter-schema`, which is
 *       stricter and safer. Still, the lightweight normalizer is kept here for
 *       convenience/compat with legacy call sites.
 *
 *  2) Runtime → UI mapping:
 *     - Pure functions that convert a validated **runtime package** to
 *       component props for cards, detail overview (phases 1–5), includes
 *       table fallbacks, pinned rail card, and CTA policy.
 *
 *  3) Collection transforms:
 *     - Pure utilities to search, filter, sort, paginate, compute stats, and
 *       immutably update package "bundles" (small, portable view-model used in
 *       list/grid contexts).
 *
 * Design rules
 * -----------------------------------------------------------------------------
 * - **No React**. This module must stay framework-agnostic.
 * - **No schema duplication**. Runtime types come from `package-schema.ts`.
 *   Authoring types come from `mdx-frontmatter-schema.ts`.
 * - **Pure functions only**. No I/O, no globals, no process.env checks here.
 * - **No rendering decisions** like price formatting or band variants:
 *     - price formatting lives in `utils/pricing` (not imported here)
 *     - copy/CTA wordsmithing lives in UX copy policy; this file only applies
 *       the *policy* (which CTA to use where), not the English text.
 *
 * Usage (typical)
 * -----------------------------------------------------------------------------
 *   import { parsePackage } from "@/packages/lib/package-schema";
 *   import {
 *     buildPackageCardProps,
 *     buildPackageDetailOverviewProps,
 *   } from "@/packages/lib/mappers/package-mappers";
 *
 *   const pkg = parsePackage(jsonFromRegistry);
 *   const card = buildPackageCardProps(pkg);
 *   const detail = buildPackageDetailOverviewProps(pkg);
 *
 * Authoring note
 * -----------------------------------------------------------------------------
 * Most pipelines should validate MDX frontmatter with
 * `PackageMarkdownSchema` and then transform using
 * `frontmatterToPackage(...)` (which we export from mdx-frontmatter-schema).
 * The `normalizePackage(...)` provided here is a **lightweight alias fixer**
 * kept for legacy helpers; prefer the canonical transform when possible.
 */

import type { PackageSchemaType as PackageMetadata } from "@/packages/lib/package-schema";
import type { MdxFrontmatter as PackageMarkdown } from "@/packages/lib/mdx-frontmatter-schema";

/* =============================================================================
 * Section 0 — Local UI prop types (keep minimal & stable)
 * =============================================================================
 * We define the props our mappers return so this library remains independent
 * from component files. If your components already expose public prop types,
 * feel free to replace these with imports from your design system.
 */

/** Canonical money (runtime). Formatting happens in UI utilities/components. */
export type Money = NonNullable<PackageMetadata["price"]>;

/** CTA shape for card/detail surfaces. */
export type Cta = {
  label: string;
  href: string;
  ariaLabel?: string;
  dataCta?: "primary" | "secondary";
};

/** Table-like “What’s included” view model for a simple renderer. */
export type PackageIncludesTableProps = {
  caption?: string;
  columns: Array<{ id: string; label: string }>;
  rows: Array<{ id: string; label: string; values: Record<string, boolean | string> }>;
};

/** Minimal card props view model used by grid/list cards. */
export type PackageCardProps = {
  // identity / routing
  id: string;
  slug: string;
  href: string;
  testId?: string;

  // display
  name: string;
  description?: string; // use runtime "summary" by default
  features?: string[];
  image?: { src: string; alt: string };

  // taxonomy / badges
  service: PackageMetadata["service"];
  tier?: string;
  badge?: string;
  tags?: string[];

  // price (canonical, no formatting done here)
  price: Money;

  // CTAs
  primaryCta: Cta;
  secondaryCta: Cta;

  // small print beneath card, not the price band fine print
  footnote?: string;

  // presentation hints
  variant?: "default" | "rail" | "pinned-compact";
  highlight?: boolean;
  isLoading?: boolean;

  // analytics
  analyticsCategory?: string;
};

/** Minimal overview props for the package detail super-card (phases 1–5). */
export type PackageDetailOverviewProps = {
  // headline / meta
  id: string;
  title: string;
  valueProp: string;
  description?: string;
  icp?: string;
  service: PackageMetadata["service"];
  tags?: string[];

  // pricing band inputs (formatting/variant elsewhere)
  packagePrice: Money;
  priceBand?: PackageMetadata["priceBand"];

  // CTAs
  ctaPrimary: Cta;
  ctaSecondary: Cta;

  // phase 2 (why) & phase 3 (what)
  features?: string[];
  outcomes: string[];
  includesGroups?: PackageMetadata["includes"];
  includesTable?: PackageIncludesTableProps;

  // sticky rail card on detail page
  pinnedPackageCard: PackageCardProps;

  // phase 4 (trust/extras) + optional notes
  extras: {
    timeline?: PackageMetadata["timeline"];
    ethics?: PackageMetadata["ethics"];
    requirements?: PackageMetadata["requirements"];
    // harmless pass-throughs if present on content:
    limits?: string[];
    timelineBlocks?: unknown;
  };
  notes?: string;

  // optional style hooks for the container
  className?: string;
  style?: React.CSSProperties;
};

/* =============================================================================
 * Section 1 — Lightweight authoring normalizer (optional)
 * =============================================================================
 * Prefer: `frontmatterToPackage(...)` from mdx-frontmatter-schema for a robust,
 * validated transform. Keep this alias fixer for legacy interoperability.
 */

/**
 * normalizePackage
 * -----------------------------------------------------------------------------
 * Normalizes author-facing MDX frontmatter to be closer to runtime shape by:
 *  - flattening `includes` from `includesGroups` when needed
 *  - unifying `faqs` key variants (`q/a` vs `question/answer`)
 *  - unifying cross-sell / add-on field names
 *
 * ⚠️ This does NOT replace `frontmatterToPackage` and does NOT validate against
 * the runtime `PackageSchema`. Use it only when you must massage frontmatter
 * quickly; otherwise, run your content through the canonical transform.
 */
export function normalizePackage(input: PackageMarkdown): Partial<PackageMetadata> {
  const includes = (input as any).includes || (input as any).includesGroups || [];

  const faqs = (input.faqs || []).map((faq) => ({
    id: faq.id,
    question: faq.question || faq.q,
    answer: faq.answer || faq.a,
  }));

  const relatedSlugs = (input as any).crossSell || (input as any).relatedSlugs || [];
  const addOnRecommendations =
    (input as any).addOns || (input as any).addOnRecommendations || [];

  // Return a *partial* runtime-ish shape (not validated).
  return {
    ...(input as any),
    includes,
    faqs,
    relatedSlugs,
    addOnRecommendations,
    // strip aliases when present (harmless if missing)
    includesTable: (input as any).includesTable,
    notes: (input as any).notes,
  };
}

/* =============================================================================
 * Section 2 — Small pure helpers used by mappers
 * ============================================================================= */

/**
 * idify
 * -----------------------------------------------------------------------------
 * Stable, URL/ID-safe slugifier for keys/test IDs:
 * - lowers, removes non-alphanumerics, collapses to "-"
 * - trims leading/trailing "-"
 */
function idify(s: string, fallback = "id"): string {
  const base = (s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

/**
 * normalizeFootnote
 * -----------------------------------------------------------------------------
 * Normalizes free-form notes/fine print to a small string:
 *  - string → trimmed or undefined
 *  - number → toString
 *  - array  → " • " joined
 *  - other  → undefined
 */
export function normalizeFootnote(input?: unknown): string | undefined {
  if (input == null) return undefined;
  if (typeof input === "string") return input.trim() || undefined;
  if (typeof input === "number") return String(input);
  if (Array.isArray(input)) return input.filter(Boolean).join(" • ") || undefined;
  return undefined;
}

/**
 * coerceLabel
 * -----------------------------------------------------------------------------
 * Extracts a human label from `string | {label: string}` items; empty otherwise.
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
 * Section 3 — CTA policy (labels & builder functions)
 * =============================================================================
 * Keep the *policy* (which CTA appears where) here. If your product has a
 * centralized copy system, import labels there instead of hardcoding here.
 */

export const CTA = {
  VIEW_DETAILS: "View details",
  BOOK_A_CALL: "Book a call",
  REQUEST_PROPOSAL: "Request proposal",
} as const;

export function ariaViewDetailsFor(nameOrSlug?: string) {
  return nameOrSlug ? `View details for ${nameOrSlug}` : "View details";
}
export function ariaBookCallAbout(nameOrSlug?: string) {
  return nameOrSlug ? `Book a call about ${nameOrSlug}` : "Book a call";
}
export function ariaRequestProposalFor(nameOrSlug?: string) {
  return nameOrSlug ? `Request a proposal for ${nameOrSlug}` : "Request a proposal";
}

/**
 * Card surfaces:
 *  - Primary   → View details (/packages/[slug])
 *  - Secondary → Book a call (/book)
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
 *  - Primary   → Request proposal (/contact)
 *  - Secondary → Book a call (/book)
 */
export function buildDetailCtas(name?: string): { primary: Cta; secondary: Cta } {
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
 * Section 4 — Includes adapters (groups ⇄ table)
 * ============================================================================= */

/**
 * buildIncludesTableFromGroups
 * -----------------------------------------------------------------------------
 * Builds a simple 1-column table as a fallback when authors provided groups but
 * no `includesTable`. Uses package name as the single column header.
 */
export function buildIncludesTableFromGroups(
  base: Pick<PackageMetadata, "name" | "includes">
): PackageIncludesTableProps {
  const columnId = "pkg";
  return {
    caption: "What’s included",
    columns: [{ id: columnId, label: base.name }],
    rows: (base.includes ?? []).flatMap((group) =>
      (group.items ?? []).map((item, i) => ({
        id: `${idify(group.title, "group")}-${i}`,
        label: `${group.title} — ${coerceLabel(item)}`,
        values: { [columnId]: true },
      }))
    ),
  };
}

/**
 * mapIncludesTable
 * -----------------------------------------------------------------------------
 * Small adapter that returns the authored `includesTable` if present and valid,
 * applying a default caption fallback when needed.
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
 * Section 5 — Card mappers
 * ============================================================================= */

export type CardVariant = "default" | "rail" | "pinned-compact";

/**
 * buildPackageCardProps
 * -----------------------------------------------------------------------------
 * Maps a validated runtime package to a compact card view model.
 * Rules:
 *  - Features: prefer authored `.features`; fallback to first 5 items from
 *    grouped includes.
 *  - Price: pass canonical `price` unchanged (format downstream).
 *  - Small print: normalize via `normalizeFootnote`.
 *  - CTAs: enforced by card policy (view details/book a call).
 */
export function buildPackageCardProps(
  base: PackageMetadata,
  opts?: { variant?: CardVariant; highlight?: boolean }
): PackageCardProps {
  const { variant = "default", highlight = false } = opts ?? {};

  // Fallback features from includes (first 5)
  const fromIncludes =
    (base.includes?.flatMap((g) => (g.items ?? []).map((it) => coerceLabel(it))) ?? []).filter(Boolean);

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

    // display
    name: base.name,
    description: base.summary,
    features,
    image: base.image ?? undefined,

    // taxonomy / badges
    service: base.service,
    tier: base.tier ?? undefined,
    badge: base.badges?.[0],
    tags: base.tags,

    // price as-is
    price: base.price,

    // CTAs (policy)
    primaryCta,
    secondaryCta,

    // fine print (not the band finePrint)
    footnote: normalizeFootnote(base.notes),

    // presentation
    variant,
    highlight,
    isLoading: false,

    // analytics
    analyticsCategory: "packages",
  };
}

/**
 * buildPinnedCardForDetail
 * -----------------------------------------------------------------------------
 * A rail/pinned card used on the detail page that **switches to detail CTAs**
 * (Request proposal / Book a call) instead of the card CTAs.
 */
export function buildPinnedCardForDetail(base: PackageMetadata): PackageCardProps {
  const card = buildPackageCardProps(base, { variant: "rail" });
  const { primary, secondary } = buildDetailCtas(base.name);
  return { ...card, primaryCta: primary, secondaryCta: secondary };
}

/* =============================================================================
 * Section 6 — Detail overview mapper (phases 1–5)
 * ============================================================================= */

/**
 * buildPackageDetailOverviewProps
 * -----------------------------------------------------------------------------
 * Super-card props for the package detail page:
 *  - Phase 1: title/valueProp/description/ICP
 *  - Price + priceBand passthrough (format/variant elsewhere)
 *  - CTA policy for detail surface
 *  - Phase 2–3: features, outcomes, includes (groups preferred; table fallback)
 *  - Right rail pinned card (detail CTA policy)
 *  - Phase 4 extras (timeline/ethics/requirements) + notes
 */
export function buildPackageDetailOverviewProps(
  base: PackageMetadata
): PackageDetailOverviewProps {
  const { primary: ctaPrimary, secondary: ctaSecondary } = buildDetailCtas(base.name);

  const hasGroups = Array.isArray(base.includes) && base.includes.length > 0;

  // Prefer groups; if absent, use authored table
  const adaptedTable = !hasGroups ? mapIncludesTable(base) : undefined;

  // Ultimate fallback: synthesize 1-column table from groups (if any)
  const derivedTable =
    !hasGroups && !adaptedTable
      ? buildIncludesTableFromGroups({ name: base.name, includes: base.includes })
      : undefined;

  return {
    // headline
    id: `${base.slug}-overview`,
    title: base.name,
    valueProp: base.summary,
    description: base.description,
    icp: base.icp,
    service: base.service,
    tags: base.tags,

    // price payloads
    packagePrice: base.price,
    priceBand: base.priceBand,

    // CTAs (detail policy)
    ctaPrimary,
    ctaSecondary,

    // phase 2–3
    features: Array.isArray(base.features)
      ? base.features.map(coerceLabel).filter(Boolean)
      : undefined,
    outcomes: base.outcomes,
    includesGroups: hasGroups ? base.includes : undefined,
    includesTable: hasGroups ? undefined : (adaptedTable ?? derivedTable),

    // right rail
    pinnedPackageCard: buildPinnedCardForDetail(base),

    // extras (phase 4)
    notes: normalizeFootnote(base.notes),
    extras: {
      timeline: base.timeline,
      ethics: base.ethics,
      requirements: base.requirements,
      // harmless passthroughs if present on content:
      ...(base as any).limits && { limits: (base as any).limits },
      ...(base as any).timelineBlocks && { timelineBlocks: (base as any).timelineBlocks },
    },

    // style hooks (optional)
    className: undefined,
    style: undefined,
  };
}

/* =============================================================================
 * Section 7 — Convenience wrappers (sugar)
 * ============================================================================= */

export const buildDefaultCard = (b: PackageMetadata) =>
  buildPackageCardProps(b, { variant: "default" });

export const buildRailCard = (b: PackageMetadata) =>
  buildPackageCardProps(b, { variant: "rail" });

export const buildPinnedCompactCard = (b: PackageMetadata) =>
  buildPackageCardProps(b, { variant: "pinned-compact" });

/* =============================================================================
 * Section 8 — Collections: Bundle transforms & utilities
 * =============================================================================
 * These are production-ready, stateless utilities for searching/filtering/sorting
 * lists of simple bundle objects (portable view model). They’re intentionally
 * independent of the larger PackageMetadata schema to keep grids fast/light.
 */

/** Minimal price shape for bundles. */
export type Price = {
  monthly?: number | null;
  oneTime?: number | null;
  currency?: "USD" | (string & {});
  /** Optional fast-path if some feeds provide pre-computed yearly. */
  yearly?: number | null;
};

/** Lightweight bundle used in catalog/list grids and scripts. */
export type PackageBundle = {
  slug: string;
  name: string;
  description?: string;
  price: Price;
  services?: string[];
  /** Sections used to compute derived "feature count" and searches. */
  includes?: Array<{ section: string; items: string[] }>;
  /** Grid feature: show as "most popular". */
  isMostPopular?: boolean;
  /** Optional related add-ons for quick X-sell UIs. */
  addOnSlugs?: string[];
};

/** Slug normalizer for service names (stable & portable). */
export function normalizeServiceSlug(s: string): string {
  return (s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
}

/* ---- Price helpers ------------------------------------------------------- */

export function effectiveMonthly(price?: Price): number | undefined {
  if (!price) return undefined;
  const m = price.monthly;
  return typeof m === "number" && m >= 0 ? m : undefined;
}

export function effectiveSetup(price?: Price): number | undefined {
  if (!price) return undefined;
  const s = price.oneTime;
  return typeof s === "number" && s >= 0 ? s : undefined;
}

export function computeYearly(price: Price, annualDiscountPercent?: number): number | undefined {
  if (typeof price.yearly === "number") return price.yearly;
  if (price.monthly == null) return undefined;
  const base = (price.monthly as number) * 12;
  if (!annualDiscountPercent || annualDiscountPercent <= 0) return Math.round(base);
  return Math.round(base * (1 - annualDiscountPercent / 100));
}

/* ---- Collections & indices ---------------------------------------------- */

export function indexBySlug<T extends { slug: string }>(items: T[]): Record<string, T> {
  return items.reduce<Record<string, T>>((acc, it) => {
    acc[it.slug] = it;
    return acc;
  }, {});
}

export function mapBySlug<T extends { slug: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((it) => [it.slug, it] as const));
}

export function ensureUniqueBySlug<T extends { slug: string }>(items: T[]) {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const unique: T[] = [];
  for (const it of items) {
    if (seen.has(it.slug)) {
      duplicates.push(it.slug);
      continue;
    }
    seen.add(it.slug);
    unique.push(it);
  }
  return { items: unique, duplicates };
}

/* ---- Feature helpers ----------------------------------------------------- */

export function flattenIncludes(bundle: PackageBundle): string[] {
  return (bundle.includes ?? []).flatMap((s) => s.items ?? []);
}

export function featureCount(bundle: PackageBundle): number {
  return flattenIncludes(bundle).length;
}

export function dedupeFeatures(bundle: PackageBundle): PackageBundle {
  const next = { ...bundle } as PackageBundle;
  next.includes = (bundle.includes ?? []).map((sec) => ({
    section: sec.section,
    items: Array.from(new Set((sec.items ?? []).map((s) => s.trim()).filter(Boolean))),
  }));
  return next;
}

/* ---- Search, filter, sort ------------------------------------------------ */

export type BundleTransform = (bundles: PackageBundle[]) => PackageBundle[];

export function pipeBundles(...ops: BundleTransform[]): BundleTransform {
  return (bundles) => ops.reduce((acc, op) => op(acc), bundles);
}

export function searchBundles(query: string): BundleTransform {
  const q = query.trim().toLowerCase();
  if (!q) return (xs) => xs;
  const terms = q.split(/\s+/).filter(Boolean);
  return (bundles) =>
    bundles.filter((b) => {
      const hay = [b.name, b.slug, b.description, ...flattenIncludes(b)].join("\n").toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
}

export function filterByService(
  services: string | string[],
  mode: "any" | "all" = "any"
): BundleTransform {
  const targets = (Array.isArray(services) ? services : [services]).map(normalizeServiceSlug);
  return (bundles) =>
    bundles.filter((b) => {
      const own = (b.services ?? []).map(normalizeServiceSlug);
      if (own.length === 0) return false;
      if (mode === "all") return targets.every((t) => own.includes(t));
      return targets.some((t) => own.includes(t));
    });
}

export function filterByMonthlyPrice(min?: number, max?: number): BundleTransform {
  const hasMin = typeof min === "number";
  const hasMax = typeof max === "number";
  return (bundles) =>
    bundles.filter((b) => {
      const m = effectiveMonthly(b.price);
      if (m == null) return false;
      if (hasMin && m < (min as number)) return false;
      if (hasMax && m > (max as number)) return false;
      return true;
    });
}

export function filterByFeatureCount(minFeatures: number): BundleTransform {
  return (bundles) => bundles.filter((b) => featureCount(b) >= minFeatures);
}

export type SortMode =
  | "name"
  | "monthlyAsc"
  | "monthlyDesc"
  | "setupAsc"
  | "setupDesc"
  | "mostPopularFirst"
  | "featuredThenName";

export function sortBundles(mode: SortMode, featuredSlugs?: string[]): BundleTransform {
  const featuredIndex = new Map<string, number>();
  (featuredSlugs ?? []).forEach((s, i) => featuredIndex.set(s, i));

  return (bundles) => {
    const byName = (a: PackageBundle, b: PackageBundle) => a.name.localeCompare(b.name);
    const byMonthly = (a: PackageBundle, b: PackageBundle) =>
      (effectiveMonthly(a.price) ?? Number.POSITIVE_INFINITY) -
      (effectiveMonthly(b.price) ?? Number.POSITIVE_INFINITY);
    const bySetup = (a: PackageBundle, b: PackageBundle) =>
      (effectiveSetup(a.price) ?? Number.POSITIVE_INFINITY) -
      (effectiveSetup(b.price) ?? Number.POSITIVE_INFINITY);

    const sorted = [...bundles];
    switch (mode) {
      case "name":
        return sorted.sort(byName);
      case "monthlyAsc":
        return sorted.sort(byMonthly);
      case "monthlyDesc":
        return sorted.sort((a, b) => -byMonthly(a, b));
      case "setupAsc":
        return sorted.sort(bySetup);
      case "setupDesc":
        return sorted.sort((a, b) => -bySetup(a, b));
      case "mostPopularFirst":
        return sorted.sort(
          (a, b) => (b.isMostPopular ? 1 : 0) - (a.isMostPopular ? 1 : 0) || byName(a, b)
        );
      case "featuredThenName":
      default:
        return sorted.sort((a, b) => {
          const fa = featuredIndex.has(a.slug) ? -1000 - (featuredIndex.get(a.slug) ?? 0) : 0;
          const fb = featuredIndex.has(b.slug) ? -1000 - (featuredIndex.get(b.slug) ?? 0) : 0;
          if (fa !== fb) return fa - fb;
          return byName(a, b);
        });
    }
  };
}

/* ---- Pagination & slicing ------------------------------------------------ */

export function limit(n: number): BundleTransform {
  return (bundles) => bundles.slice(0, Math.max(0, n));
}

export function paginate(page: number, pageSize: number): BundleTransform {
  const p = Math.max(1, Math.floor(page));
  const size = Math.max(1, Math.floor(pageSize));
  const start = (p - 1) * size;
  return (bundles) => bundles.slice(start, start + size);
}

/* ---- Stats & summaries --------------------------------------------------- */

export type BundleStats = {
  total: number;
  withMonthly: number;
  withSetup: number;
  avgMonthly?: number;
  minMonthly?: number;
  maxMonthly?: number;
  services: Record<string, number>; // service slug → count
};

export function computeStats(bundles: PackageBundle[]): BundleStats {
  const mVals: number[] = [];
  const services: Record<string, number> = {};
  let withMonthly = 0,
    withSetup = 0;

  for (const b of bundles) {
    const m = effectiveMonthly(b.price);
    if (m != null) {
      mVals.push(m);
      withMonthly++;
    }
    if (effectiveSetup(b.price) != null) withSetup++;

    for (const s of b.services ?? []) {
      const k = normalizeServiceSlug(s);
      services[k] = (services[k] ?? 0) + 1;
    }
  }

  mVals.sort((a, b) => a - b);
  const avg = mVals.length
    ? Math.round(mVals.reduce((a, c) => a + c, 0) / mVals.length)
    : undefined;

  return {
    total: bundles.length,
    withMonthly,
    withSetup,
    avgMonthly: avg,
    minMonthly: mVals[0],
    maxMonthly: mVals[mVals.length - 1],
    services,
  };
}

/* ---- High-level selectors ------------------------------------------------ */

export function topNForService(
  bundles: PackageBundle[],
  serviceSlug: string,
  n = 3,
  opts: { featuredSlugs?: string[]; sort?: SortMode } = {}
): PackageBundle[] {
  const filtered = filterByService(serviceSlug)(bundles);
  const sorter = sortBundles(opts.sort ?? "featuredThenName", opts.featuredSlugs);
  return pipeBundles(sorter, limit(n))(filtered);
}

export function pickBySlugs(bundles: PackageBundle[], slugs: string[]): PackageBundle[] {
  const order = new Map<string, number>();
  slugs.forEach((s, i) => order.set(s, i));
  return bundles
    .filter((b) => order.has(b.slug))
    .sort((a, b) => (order.get(a.slug)! - order.get(b.slug)!));
}

/* ---- Immutable update helpers ------------------------------------------- */

export function withUpdatedPrice(bundle: PackageBundle, price: Partial<Price>): PackageBundle {
  return { ...bundle, price: { ...bundle.price, ...price } } as PackageBundle;
}

export function withAddedFeatures(
  bundle: PackageBundle,
  section: string,
  items: string[]
): PackageBundle {
  const next = { ...bundle } as PackageBundle;
  const includes = next.includes ?? [];
  const idx = includes.findIndex((s) => s.section === section);
  if (idx === -1) {
    next.includes = [...includes, { section, items }];
  } else {
    const existing = includes[idx];
    next.includes = [
      ...includes.slice(0, idx),
      { section: existing.section, items: [...existing.items, ...items] },
      ...includes.slice(idx + 1),
    ];
  }
  return next;
}

export function withoutAddOn(bundle: PackageBundle, addOnSlug: string): PackageBundle {
  const next = { ...bundle } as PackageBundle;
  next.addOnSlugs = (bundle.addOnSlugs ?? []).filter((s) => s !== addOnSlug);
  return next;
}

/* =============================================================================
 * End of file
 * =============================================================================
 */
