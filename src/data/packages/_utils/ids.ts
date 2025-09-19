// /src/data/packages/_utils/ids.ts
// Safe ID generation for packages/add-ons with kebab-case sanitation

import type { ServiceSlug, Tier } from "../_types/packages.types";

/**
 * Convert string to kebab-case
 */
export function kebab(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars except spaces and hyphens
    .replace(/\s+/g, "-")         // Replace spaces with hyphens
    .replace(/-+/g, "-")          // Collapse multiple hyphens
    .replace(/^-|-$/g, "");       // Remove leading/trailing hyphens
}

/**
 * Generate package ID from service and tier
 */
export function makePackageId(service: ServiceSlug, tier: Tier): string {
  return `${service}-${kebab(tier)}`;
}

/**
 * Generate add-on ID from service and name
 */
export function makeAddOnId(service: ServiceSlug, name: string): string {
  return `${service}-${kebab(name)}`;
}

/**
 * Generate featured card ID from service and key
 */
export function makeFeaturedId(service: ServiceSlug, key: string): string {
  return `${service}-featured-${kebab(key)}`;
}

/**
 * Generate bundle ID from name
 */
export function makeBundleId(name: string): string {
  return kebab(name);
}

/**
 * Validate ID format (kebab-case with service prefix)
 */
export function isValidPackageId(id: string, service?: ServiceSlug): boolean {
  const kebabPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  
  if (!kebabPattern.test(id)) {
    return false;
  }
  
  if (service && !id.startsWith(`${service}-`)) {
    return false;
  }
  
  return true;
}

/**
 * Extract service from package ID
 */
export function extractServiceFromId(id: string): ServiceSlug | null {
  const parts = id.split("-");
  const potentialService = parts[0];
  
  // Import here to avoid circular dependency
  const services: ServiceSlug[] = ["content", "leadgen", "marketing", "seo", "webdev", "video"];
  
  if (services.includes(potentialService as ServiceSlug)) {
    return potentialService as ServiceSlug;
  }
  
  return null;
}