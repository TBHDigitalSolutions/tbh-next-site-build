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
export { default } from "./GrowthPackagesCTA";
// Cards & Frames
export { default as PackageCard } from "./PackageCard";
export type { PackageCardProps } from "./PackageCard";

export { default as PackageCardFrame } from "./PackageCardFrame";
export type {
  PackageCardFrameProps,
  PackageCardFrameVariant,
  PackageCardFramePadding,
  PackageCardFrameHeight,
} from "./PackageCardFrame";

export { default as AddOnCard } from "./AddOnCard";
export type { AddOnCardProps } from "./AddOnCard";

export { default as AddOnCardFrame } from "./AddOnCardFrame";
export type {
  AddOnCardFrameProps,
  AddOnCardFrameVariant,
  AddOnCardFramePadding,
  AddOnCardFrameHeight,
} from "./AddOnCardFrame";

export { default as BundleCard } from "./BundleCard";
export type { BundleCardProps } from "./BundleCard";

export { default as BundleCardFrame } from "./BundleCardFrame";
export type {
  BundleCardFrameProps,
  BundleCardFrameVariant,
  BundleCardFramePadding,
  BundleCardFrameHeight,
} from "./BundleCardFrame";

// Carousels & Rails
export { default as PackagesCarousel } from "./PackagesCarousel";
export type { PackagesCarouselProps } from "./PackagesCarousel";

export { default as AddOnCarousel } from "./AddOnCarousel";
export type { AddOnCarouselProps } from "./AddOnCarousel";

export { default as RelatedItemsRail } from "./RelatedItemsRail";
export type { RelatedItemsRailProps } from "./RelatedItemsRail";

// Grids & Toolbars
export { default as PackageGrid } from "./PackageGrid";
export type { PackageGridItem } from "./PackageGrid";

export { default as AddOnsGrid } from "./AddOnsGrid";
export type { AddOnCardItem, AddOn } from "./AddOnsGrid";

export { default as PackagesToolbar } from "./PackagesToolbar";
export type { PackagesToolbarProps } from "./PackagesToolbar";

// Pricing & Tables
export { default as PriceBlock } from "./PriceBlock";
export type { PriceBlockProps } from "./PriceBlock";

export { default as PackageIncludesTable } from "./PackageIncludesTable";
export type {
  PackageIncludesTableProps,
  Column as IncludesColumn,
  Row as IncludesRow,
  IncludeValue,
} from "./PackageIncludesTable";

export { default as PackagePricingMatrix } from "./PackagePricingMatrix";
export type {
  PackagePricingMatrixProps,
  MatrixColumn,
  MatrixRow,
  MatrixGroup,
  CellValue,
  CellMoney,
} from "./PackagePricingMatrix";

// CTAs / Misc
export { default as GrowthPackagesCTA } from "./GrowthPackagesCTA";
export type { GrowthPackagesCTAProps } from "./GrowthPackagesCTA";
