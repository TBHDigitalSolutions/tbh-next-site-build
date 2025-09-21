// src/packages/components/index.ts
/**
 * Packages Domain — Components Barrel
 * Re-exports production-ready UI building blocks.
 * All exports are named (tree-shake friendly).
 */

export { default as GrowthPackagesCTA } from "./GrowthPackagesCTA";

// Add-ons picker
export { default as AddOnsGrid } from "./AddOnsGrid";
export type {
  AddOn,
  AddOnsGridProps,
  Price as AddOnsGridPrice,
} from "./AddOnsGrid";

// Package card
export { default as PackageCard } from "./PackageCard";
export type {
  PackageCardProps,
  Price as PackageCardPrice,
} from "./PackageCard";

// Package grid
export { default as PackageGrid } from "./PackageGrid";
export type {
  PackageGridProps,
  PackageGridItem,
} from "./PackageGrid";

// Includes table
export { default as PackageIncludesTable } from "./PackageIncludesTable";
export type {
  PackageIncludesTableProps,
  PackageInclude,
} from "./PackageIncludesTable";

// Price block
export { default as PriceBlock } from "./PriceBlock";
export type {
  PriceBlockProps,
  Price as PriceBlockPrice,
} from "./PriceBlock";

// Optional: surface Growth type used by sections/components
export type { GrowthPackage } from "../lib/bridge-growth";
