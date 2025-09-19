// src/components/sections/section-layouts/PackageCarousel/index.ts

// Main components
export { default as PackageCarousel } from "./PackageCarousel";
export { default as PackageCard } from "./PackageCard";
export { default as PackageComparisonCard } from "./PackageComparisonCard";
export { default as AddOnsGrid } from "./AddOnsGrid";

// Type exports
export type { PackageCarouselProps } from "./PackageCarousel";
export type { PackageCardProps } from "./PackageCard";
export type { PackageComparisonCardProps } from "./PackageComparisonCard";
export type { AddOnsGridProps, AddOnItem } from "./AddOnsGrid";

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