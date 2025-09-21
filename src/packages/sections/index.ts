// src/packages/sections/index.ts
/**
 * Packages — Sections Barrel
 * Exposes typed, tree-shakeable section components.
 */

export { default as GrowthPackagesSection } from "./GrowthPackagesSection";
export type {
  GrowthPackagesSectionProps,
  GrowthPackage,
} from "./GrowthPackagesSection";

export { default as PackagesSection } from "./PackagesSection";
export type { PackagesSectionProps } from "./PackagesSection";
