// src/packages/lib/mappers/to-overview.ts
import type { Package, Money, IncludeGroup, IncludesTable, PriceBand } from "../package-types";

/**
 * Props shape for a typical Package Detail Overview section.
 * Keep UI-agnostic: components can pick/rename as needed.
 */
export type PackageDetailOverviewProps = {
  id: string;
  slug: string;
  title: string;
  service: Package["service"];
  tier?: string;
  tags?: string[];
  badges?: string[];

  summary?: string;
  description?: string;
  image?: { src: string; alt: string };

  /** Pricing SSOT (band/labels are derived in the UI). */
  price?: Money;
  /** Detail-only author copy for the band. */
  priceBand?: PriceBand;

  /** Narrative */
  purposeHtml?: string;

  /** Why */
  painPoints?: string[];
  icp?: string;
  outcomes: string[];

  /** What */
  features?: Array<string | { label: string; icon?: string }>;
  includes?: IncludeGroup[];
  includesTable?: IncludesTable;
  deliverables?: string[];
};

export function toOverview(pkg: Package): PackageDetailOverviewProps {
  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.name,
    service: pkg.service,
    tier: pkg.tier,
    tags: pkg.tags,
    badges: pkg.badges,
    summary: pkg.summary,
    description: pkg.description,
    image: pkg.image,

    price: pkg.price,
    priceBand: pkg.priceBand, // detail-only usage downstream

    purposeHtml: pkg.purposeHtml,

    painPoints: pkg.painPoints,
    icp: pkg.icp,
    outcomes: pkg.outcomes ?? [],

    features: pkg.features,
    includes: pkg.includes,
    includesTable: pkg.includesTable,
    deliverables: pkg.deliverables,
  };
}
