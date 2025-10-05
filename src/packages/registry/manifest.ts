/**
 * AUTO-GENERATED manifest of all packages.
 * Each item is the validated default export of a per-package loader.
 * Regenerate with: npx tsx scripts/packages/generate-registry-manifest.ts
 */
/* eslint-disable */
import lead_generation_lead_routing_distribution from "@/packages/registry/lead-generation-packages/lead-routing-distribution/index";
// ...more imports

export const REGISTRY = [
  lead_generation_lead_routing_distribution,
  // ...more entries
] as const;

export type RegistryItem = (typeof REGISTRY)[number];
export const SLUGS = REGISTRY.map((p) => p.slug);
