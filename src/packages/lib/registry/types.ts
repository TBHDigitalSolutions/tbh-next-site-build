// src/packages/lib/registry/types.ts
// src/packages/lib/registry/types.ts
import type { Money } from "@/packages/lib/pricing";

/* -------------------------------- Services ------------------------------- */

export type Service =
  | "webdev"
  | "seo"
  | "marketing"
  | "leadgen"
  | "content"
  | "video";

/* ----------------------------- Content blocks ---------------------------- */

export type IncludesGroup = { title: string; items: string[] };

/**
 * Optional fallback “table-like” includes shape. Kept intentionally loose to
 * avoid coupling registry types to UI components. Mappers can adapt as needed.
 */
export type IncludesTableLike = {
  title?: string;
  caption?: string;
  columns?: string[];               // e.g., ["Feature", "Included"]
  rows: Array<string[] | { cells: string[] }>;
};

/** Detail-only band copy (do NOT derive from summary) */
export type PriceBandCopy = {
  tagline?: string;                  // detail only; never fall back to summary
  baseNote?: "proposal" | "final";   // optional override (policy decides default)
  finePrint?: string;                // detail only; e.g., “3-month minimum”
};

/** Flexible FAQ item (authoring-friendly) */
export type PackageFaq = {
  id?: string | number;
  q?: string;
  a?: string;
  question?: string;
  answer?: string;
};

/** Timeline (modern & legacy) */
export type TimelineItem = { title: string; note?: string; id?: string };
export type LegacyTimeline = { setup?: string; launch?: string; ongoing?: string };

/** Minimal SEO block */
export type SeoMeta = { title?: string; description?: string };

/* ------------------------------- Base shape ------------------------------ */
/**
 * Canonical authoring shape (SSOT) used by registry entries (base.ts).
 * - UI-agnostic (no JSX, no component types)
 * - All “derived strings” (e.g., “Starting at …”) are computed in UI from `price`
 */
export type PackageAuthoringBase = {
  /* Identity & taxonomy */
  id: string;                        // e.g., "leadgen-routing-distribution"
  slug: string;                      // e.g., "lead-routing-distribution"
  service: Service;
  name: string;
  tier?: string | null;              // e.g., "Essential"
  tags?: string[];
  badges?: string[];                 // e.g., ["Popular"]

  /* Media (optional) */
  image?: { src: string; alt?: string } | null;

  /* Phase 1 (Hero) */
  summary?: string;                  // 1–2 sentence value prop (card + detail)
  description?: string;              // longer body copy (detail hero)
  icp?: string;                      // audience fit (1 sentence)

  /* Phase 2 (Why) */
  painPoints?: string[];             // bullets for PainPointsBlock
  purpose?: string;                  // short paragraph
  purposeHtml?: string;              // optional compiled HTML alternative
  outcomes?: string[];               // KPI bullets (3–6 recommended)

  /* Phase 3 (What) */
  features?: string[];               // highlights; UI may derive from includes if missing
  includes: IncludesGroup[];         // primary path for “What’s included”
  includesTable?: IncludesTableLike; // optional fallback table shape

  /* Price (SSOT) */
  price: Money;                      // { monthly?: number; oneTime?: number; currency: "USD" }
  priceBand?: PriceBandCopy;         // detail-only band copy

  /* Phase 4 (Details & Trust) */
  deliverables?: string[];
  requirements?: string[];           // for RequirementsBlock
  timelineBlocks?: TimelineItem[];   // modern timeline
  timeline?: LegacyTimeline;         // legacy; components can normalize either
  ethics?: string[];                 // ethical guardrails / limits
  limits?: string[];                 // practical out-of-scope items

  /* Phase 5 (Next) */
  faqs?: PackageFaq[];
  addOnRecommendations?: string[];   // slugs
  relatedSlugs?: string[];           // slugs

  /* Notes & SEO */
  notes?: string | string[] | null;  // small print near includes (not band finePrint)
  seo?: SeoMeta;
};

/** Back-compat alias if some modules import PackageBase */
export type PackageBase = PackageAuthoringBase;
