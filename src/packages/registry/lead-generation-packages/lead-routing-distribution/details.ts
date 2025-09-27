// src/packages/registry/lead-generation-packages/lead-routing-distribution/details.ts
import type { PackageDetailOverviewProps } from "@/packages/sections/PackageDetailOverview";
import type { PackageIncludesTableProps } from "@/packages/components/PackageIncludesTable/PackageIncludesTable";
import type { PackageCardProps } from "@/packages/components/PackageCard";
import { sectionCtas } from "@/packages/lib/cta";
import { base } from "./base";
import { leadRoutingDistributionCard } from "./card";

// What's included (grouped bullets)
const includesTable: PackageIncludesTableProps = {
  sections: base.includes.map(g => ({ title: g.title, items: g.items })),
};

const pinnedPackageCard: PackageCardProps = {
  ...leadRoutingDistributionCard,
  variant: "rail",
};

const { primary: ctaPrimary, secondary: ctaSecondary } = sectionCtas();

/** Detail Overview (Super Card) */
export const leadRoutingDistributionDetail: PackageDetailOverviewProps = {
  // headline & meta
  id: `${base.slug}-overview`,
  title: base.name,
  valueProp: base.summary,
  icp: base.icp,
  service: base.service,
  tags: base.tags,

  // canonical price ONLY (renderer derives “Starting at …”)
  price: base.price,

  // CTAs (policy)
  ctaPrimary,
  ctaSecondary,

  // outcomes
  outcomes: base.outcomes,

  // what's included
  includesTable,

  // sticky right rail
  pinnedPackageCard,

  // notes below table
  notes: base.notes ? <p>{base.notes}</p> : undefined,
};
