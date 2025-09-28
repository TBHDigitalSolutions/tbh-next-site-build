// src/packages/registry/lead-generation-packages/lead-routing-distribution/card.ts
import type { PackageCardProps } from "@/packages/components/PackageCard/PackageCard";
import { cardCtas } from "@/packages/lib/cta";
import { base } from "./base";

/** UI registry: Package Card for Lead Routing & Distribution */
export const leadRoutingDistributionCard: PackageCardProps = {
  // identity / routing
  id: base.id, // no double prefix
  slug: base.slug,
  href: `/packages/${base.slug}`,
  testId: `card-${base.slug}`,

  // naming / content
  name: base.name,
  description: base.summary,

  // top 5 features (resilient to authoring changes)
  features: (base.includes?.flatMap((g) => g.items) ?? []).slice(0, 5),

  // service / tier context
  service: base.service,
  tier: base.tier,
  popular: false,
  badge: base.badges?.[0],

  // art
  image: base.image,

  // canonical price
  price: base.price,

  // taxonomy
  tags: base.tags,

  // CTAs (policy)
  ...(() => {
    const { primary, secondary } = cardCtas(base.slug);
    return { primaryCta: primary, secondaryCta: secondary };
  })(),

  // small print
  footnote: base.notes,

  // presentation / analytics
  variant: "default",
  highlight: false,
  isLoading: false,
  analyticsCategory: "packages",
};

export const leadRoutingDistributionCardRail: PackageCardProps = {
  ...leadRoutingDistributionCard,
  variant: "rail",
};