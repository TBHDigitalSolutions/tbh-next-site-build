// src/packages/registry/lead-generation-packages/lead-routing-distribution/details.ts

import type { PackageDetailOverviewProps } from "@/packages/sections/PackageDetailOverview";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import type { PackageCardProps } from "@/packages/components/PackageCard";
import { sectionCtas } from "@/packages/lib/cta";
import { base } from "./base";
import { leadRoutingDistributionCard } from "./card";

/** Build a single-column “What’s included” table from grouped bullets */
const includesTable: PackageIncludesTableProps = {
  caption: "What’s included",
  columns: [{ id: "pkg", label: base.name }],
  rows: base.includes.flatMap((group) =>
    group.items.map((item, i) => ({
      id: `${group.title.toLowerCase().replace(/\s+/g, "-")}-${i}`,
      label: `${group.title} — ${item}`,
      values: { pkg: true }, // checkmark in the single column
    })),
  ),
};

/** Pinned card in compact (rail) variant */
const pinnedPackageCard: PackageCardProps = {
  ...leadRoutingDistributionCard,
  variant: "rail",
};

/** Standardized CTAs for detail pages */
const { primary: ctaPrimary, secondary: ctaSecondary } = sectionCtas();

/** Detail Overview (Super Card) registry entry */
export const leadRoutingDistributionDetail: PackageDetailOverviewProps = {
  /* Headline & meta */
  id: `${base.slug}-overview`,
  title: base.name,
  valueProp: base.summary,
  description: base.description, // NEW: longer blurb for TitleBlock (optional)
  icp: base.icp,
  service: base.service,
  tags: base.tags,

  /* Canonical price ONLY (renderer derives “Starting at …”) */
  packagePrice: base.price,

  /* CTAs (policy) */
  ctaPrimary,
  ctaSecondary,

  /* Outcomes */
  outcomes: base.outcomes,

  /* What’s included (single-column table) */
  includesTable,

  /* Sticky right rail */
  pinnedPackageCard,

  /* Notes (plain text; no JSX in .ts files) */
  notes: base.notes,

  /* Styling hooks (optional) */
  className: undefined,
  style: undefined,
};
