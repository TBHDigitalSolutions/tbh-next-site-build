// src/data/packages/CrossService/index.ts
// SSOT for Growth (cross-service) bundles. Each file in this folder
// must default-export a PackageBundle. This index composes them and
// guarantees a slug for routing.

import type { PackageBundle } from "../_types/packages.types";

import digitalTransformationStarter from "./digital-transformation-starter";
import ecommerceAccelerator from "./ecommerce-accelerator";
import eventLaunchDomination from "./event-launch-domination";
import localBusinessGrowth from "./local-business-growth";
import thoughtLeadershipAuthority from "./thought-leadership-authority";

export type CrossServicePackage = PackageBundle;

// Ensure slug exists for each bundle
function withSlug(b: PackageBundle): PackageBundle {
  return { slug: (b as any).slug ?? b.id, ...b };
}

export const CROSS_SERVICE_BUNDLES: CrossServicePackage[] = [
  localBusinessGrowth,
  digitalTransformationStarter,
  ecommerceAccelerator,
  thoughtLeadershipAuthority,
  eventLaunchDomination,
].map(withSlug);

// Handy maps + helpers limited to the cross-service slice
export const CROSS_SERVICE_BY_SLUG: Record<string, CrossServicePackage> =
  Object.fromEntries(CROSS_SERVICE_BUNDLES.map((b) => [b.slug!, b]));

export function getCrossServiceBundleBySlug(slug: string): CrossServicePackage | undefined {
  return CROSS_SERVICE_BY_SLUG[slug];
}

export function searchCrossServiceBundles(query: string): CrossServicePackage[] {
  const q = (query ?? "").toLowerCase().trim();
  if (!q) return [...CROSS_SERVICE_BUNDLES];

  return CROSS_SERVICE_BUNDLES.filter((b) => {
    const title = (b as any).name ?? (b as any).title;
    const haystack = [
      typeof title === "string" ? title : "",
      b.subtitle ?? "",
      b.summary ?? "",
      ...(b.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}

// Optional: curated rail (order matters)
export const CROSS_SERVICE_FEATURED_SLUGS: string[] = [
  "local-business-growth",
  "ecommerce-accelerator",
  "digital-transformation-starter",
];

export default CROSS_SERVICE_BUNDLES;
