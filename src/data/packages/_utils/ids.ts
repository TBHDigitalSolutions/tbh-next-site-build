// /src/data/packages/_utils/ids.ts
// Safe ID/slug generation helpers for data records (packages, add-ons, featured, bundles).
// Keep this file runtime-only and framework-agnostic.

import type { ServiceSlug, Tier } from "../_types/packages.types";
import { SERVICE_SLUGS } from "./slugs";

/** Normalize a string to kebab-case with ASCII letters/numbers and single hyphens. */
export function kebab(input: string): string {
  // Normalize diacritics (e.g., "Café" → "Cafe") then strip non-word chars, keep spaces/hyphens
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");

  return normalized
    .toLowerCase()
    .replace(/&/g, " and ") // treat ampersand as word
    .replace(/[^a-z0-9\s-]/g, "") // remove punctuation/symbols
    .replace(/\s+/g, "-") // spaces → hyphen
    .replace(/-+/g, "-") // collapse hyphens
    .replace(/^-|-$/g, ""); // trim hyphens
}

/** True when a string is strictly kebab-case (a-z0-9 with single hyphens). */
export function isKebabCase(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

/** Generate a stable package id from service and tier (e.g., "seo-professional"). */
export function makePackageId(service: ServiceSlug, tier: Tier): string {
  return `${service}-${kebab(tier)}`;
}

/** Generate a stable add-on id from service and human name (e.g., "video-ugc-kit"). */
export function makeAddOnId(service: ServiceSlug, name: string): string {
  return `${service}-${kebab(name)}`;
}

/** Generate a featured-card id from service and key (e.g., "seo-featured-top-pick"). */
export function makeFeaturedId(service: ServiceSlug, key: string): string {
  const base = kebab(key).replace(/(^featured-)|(-featured$)/g, "");
  return `${service}-featured-${base}`;
}

/** Generate a bundle id from a name (e.g., "Local Lead Capture" → "local-lead-capture"). */
export function makeBundleId(name: string): string {
  return kebab(name);
}

/**
 * Validate a kebab-case id. When a service is provided, enforce service prefix.
 * Example: isValidPackageId("seo-professional", "seo") → true
 */
export function isValidPackageId(id: string, service?: ServiceSlug): boolean {
  if (!isKebabCase(id)) return false;
  if (service && !id.startsWith(`${service}-`)) return false;
  return true;
}

/** Extract the service slug prefix from an id when present, else null. */
export function extractServiceFromId(id: string): ServiceSlug | null {
  const idx = id.indexOf("-");
  const prefix = (idx === -1 ? id : id.slice(0, idx)) as ServiceSlug;
  return (SERVICE_SLUGS as readonly string[]).includes(prefix) ? prefix : null;
}