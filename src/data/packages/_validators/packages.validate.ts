// /src/data/packages/_validators/packages.validate.ts
// Runtime checks (ids, pricing, refs) - dev-only assertions

import type { Package, AddOn, FeaturedCard, IntegratedBundle } from "../_types/packages.types";
import { isValidPackageId, extractServiceFromId } from "../_utils/ids";

export interface ValidationError {
  type: "error" | "warning";
  message: string;
  context?: string;
}

/**
 * Validate that featured cards reference existing packages
 */
export function validateFeaturedRefs(
  packages: Package[], 
  featured: FeaturedCard[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const packageIds = new Set(packages.map(p => p.id));
  
  featured.forEach(card => {
    if (!packageIds.has(card.packageId)) {
      errors.push({
        type: "error",
        message: `Featured card "${card.id}" references missing packageId "${card.packageId}"`,
        context: `service: ${card.service}`
      });
    }
  });
  
  return errors;
}

/**
 * Validate pricing contains only numbers
 */
export function validatePricingNumbers(item: Package | AddOn): ValidationError[] {
  const errors: ValidationError[] = [];
  const { setup, monthly } = item.price || {};
  
  if (setup !== undefined && (typeof setup !== "number" || setup < 0)) {
    errors.push({
      type: "error",
      message: `${item.id}: setup price must be a positive number, got ${typeof setup}: ${setup}`,
      context: `service: ${item.service}`
    });
  }
  
  if (monthly !== undefined && (typeof monthly !== "number" || monthly < 0)) {
    errors.push({
      type: "error", 
      message: `${item.id}: monthly price must be a positive number, got ${typeof monthly}: ${monthly}`,
      context: `service: ${item.service}`
    });
  }
  
  // Warn if no pricing set
  if (!setup && !monthly) {
    errors.push({
      type: "warning",
      message: `${item.id}: no pricing set (setup or monthly)`,
      context: `service: ${item.service}`
    });
  }
  
  return errors;
}

/**
 * Validate unique IDs across collections
 */
export function validateUniqueIds(
  packages: Package[], 
  addOns: AddOn[], 
  featured: FeaturedCard[],
  bundles: IntegratedBundle[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];
  const allIds = new Set<string>();
  
  // Check packages
  packages.forEach(pkg => {
    if (allIds.has(pkg.id)) {
      errors.push({
        type: "error",
        message: `Duplicate package ID: ${pkg.id}`,
        context: `service: ${pkg.service}`
      });
    }
    allIds.add(pkg.id);
  });
  
  // Check add-ons
  addOns.forEach(addon => {
    if (allIds.has(addon.id)) {
      errors.push({
        type: "error",
        message: `Duplicate add-on ID: ${addon.id}`,
        context: `service: ${addon.service}`
      });
    }
    allIds.add(addon.id);
  });
  
  // Check featured (separate namespace, but check for internal dupes)
  const featuredIds = new Set<string>();
  featured.forEach(card => {
    if (featuredIds.has(card.id)) {
      errors.push({
        type: "error",
        message: `Duplicate featured card ID: ${card.id}`,
        context: `service: ${card.service}`
      });
    }
    featuredIds.add(card.id);
  });
  
  // Check bundles
  const bundleIds = new Set<string>();
  bundles.forEach(bundle => {
    if (bundleIds.has(bundle.id)) {
      errors.push({
        type: "error",
        message: `Duplicate bundle ID: ${bundle.id}`
      });
    }
    bundleIds.add(bundle.id);
  });
  
  return errors;
}

/**
 * Validate ID format follows conventions
 */
export function validateIdFormats(items: (Package | AddOn | FeaturedCard)[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  items.forEach(item => {
    const service = extractServiceFromId(item.id);
    
    if (!service) {
      errors.push({
        type: "error",
        message: `Invalid ID format: ${item.id} (should start with service slug)`,
        context: `expected service: ${item.service}`
      });
    } else if (service !== item.service) {
      errors.push({
        type: "error",
        message: `ID service mismatch: ${item.id} starts with "${service}" but service is "${item.service}"`,
        context: `item: ${item.id}`
      });
    }
    
    if (!isValidPackageId(item.id)) {
      errors.push({
        type: "error",
        message: `Invalid ID format: ${item.id} (must be kebab-case)`,
        context: `service: ${item.service}`
      });
    }
  });
  
  return errors;
}

/**
 * Validate that each service has exactly 3 featured cards
 */
export function validateFeaturedCount(featured: FeaturedCard[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const serviceGroups = new Map<string, number>();
  
  featured.forEach(card => {
    const count = serviceGroups.get(card.service) || 0;
    serviceGroups.set(card.service, count + 1);
  });
  
  serviceGroups.forEach((count, service) => {
    if (count !== 3) {
      errors.push({
        type: "error",
        message: `Service "${service}" has ${count} featured cards, expected exactly 3`,
        context: `service: ${service}`
      });
    }
  });
  
  return errors;
}

/**
 * Validate that packages have required tiers
 */
export function validateTierCoverage(packages: Package[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const requiredTiers = ["Essential", "Professional", "Enterprise"];
  const serviceGroups = new Map<string, Set<string>>();
  
  packages.forEach(pkg => {
    if (!serviceGroups.has(pkg.service)) {
      serviceGroups.set(pkg.service, new Set());
    }
    serviceGroups.get(pkg.service)!.add(pkg.tier);
  });
  
  serviceGroups.forEach((tiers, service) => {
    requiredTiers.forEach(tier => {
      if (!tiers.has(tier)) {
        errors.push({
          type: "warning",
          message: `Service "${service}" missing ${tier} tier`,
          context: `service: ${service}`
        });
      }
    });
  });
  
  return errors;
}

/**
 * Run all validations and return consolidated results
 */
export function validateAll(
  packages: Package[],
  addOns: AddOn[],
  featured: FeaturedCard[],
  bundles: IntegratedBundle[] = []
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Collect all validation errors
  errors.push(...validateUniqueIds(packages, addOns, featured, bundles));
  errors.push(...validateIdFormats([...packages, ...addOns, ...featured]));
  errors.push(...validateFeaturedRefs(packages, featured));
  errors.push(...validateFeaturedCount(featured));
  errors.push(...validateTierCoverage(packages));
  
  // Validate pricing for all items
  [...packages, ...addOns].forEach(item => {
    errors.push(...validatePricingNumbers(item));
  });
  
  return errors;
}

/**
 * Log validation results to console (dev-only)
 */
export function logValidationResults(errors: ValidationError[]): void {
  if (errors.length === 0) {
    console.log("✅ Package validation passed");
    return;
  }
  
  const errorCount = errors.filter(e => e.type === "error").length;
  const warningCount = errors.filter(e => e.type === "warning").length;
  
  console.log(`\n📦 Package Validation Results:`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Warnings: ${warningCount}\n`);
  
  errors.forEach(error => {
    const icon = error.type === "error" ? "❌" : "⚠️";
    console.log(`${icon} ${error.message}`);
    if (error.context) {
      console.log(`   Context: ${error.context}`);
    }
  });
  
  if (errorCount > 0) {
    console.log(`\n💡 Fix errors before deploying to production`);
  }
}