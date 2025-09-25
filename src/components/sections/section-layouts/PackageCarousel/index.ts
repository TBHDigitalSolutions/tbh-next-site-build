// src/components/sections/section-layouts/PackageCarousel/index.ts
// Thin barrel for the section-level PackageCarousel + compatibility re-exports.
// We intentionally re-export PackageCard/AddOnsGrid from the packages domain
// to avoid duplicate components drifting out of sync.

export { default } from "./PackageCarousel";
export { default as PackageCarousel } from "./PackageCarousel";

export { default as PackageComparisonCard } from "./PackageComparisonCard";

// ⬇️ Re-export stable, domain-owned components (single source of truth)
export { default as PackageCard } from "@/packages/components/PackageCard";
export type { PackageCardProps } from "@/packages/components/PackageCard";

export { default as AddOnsGrid } from "@/packages/components/AddOnsGrid";


// Helper utilities
export * from "./helpers";

// Adapter utilities
export * from "./adapters/featuredDataAdapter";

// Re-exports for convenience
export type {
  ServiceSlug,
  DomainPackage,
} from "./helpers";

export type {
  FeaturedCard,
} from "./adapters/featuredDataAdapter";