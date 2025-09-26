// ============================================================================
// /src/data/packages/_utils/ids.ts
// ----------------------------------------------------------------------------
// Safe ID/slug generation + validation helpers for the Packages domain.
// - Kebab-case normalization with diacritics stripping
// - Service-prefixed ID builders (packages, add-ons, featured)
// - Assertions for data hygiene (kebab, uniqueness, service prefix)
// - Small mapping utilities for building ID maps
// ============================================================================

import type { ServiceSlug, Tier } from "../_types/primitives";
import { SERVICE_SLUGS } from "./slugs";

/** Normalize a string to kebab-case with ASCII letters/numbers and single hyphens. */
export function kebab(input: string): string {
  if (!input) return "";
  // Normalize diacritics (e.g., "Café" → "Cafe"), then sanitize
  const normalized = input.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  return normalized
    .toLowerCase()
    .replace(/&/g, " and ")       // treat ampersand as word
    .replace(/[^a-z0-9\s-]/g, "") // remove punctuation/symbols
    .replace(/\s+/g, "-")         // spaces → hyphen
    .replace(/-+/g, "-")          // collapse hyphens
    .replace(/^-|-$/g, "");       // trim leading/trailing hyphens
}

/** True when a string is strictly kebab-case (a-z0-9 with single hyphens). */
export function isKebabCase(id: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
}

/** Ensure a non-empty kebab-case id from freeform input; throws when empty after normalization. */
export function ensureKebab(input: string, label = "id"): string {
  const out = kebab(String(input ?? ""));
  if (!out) throw new Error(`Missing ${label}: could not derive a kebab-case value from "${input}"`);
  return out;
}

/** Assert an id is kebab-case; throws with a readable message when invalid. */
export function assertId(id: string, label = "id"): void {
  if (!id || !isKebabCase(id)) {
    throw new Error(`Invalid ${label}: "${id}". Use kebab-case (a-z0-9 and hyphens).`);
  }
}

/** Generate a stable package id from service and tier (e.g., "seo-professional"). */
export function makePackageId(service: ServiceSlug, tier: Tier | string): string {
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

/** Generate a bundle id from a display name (e.g., "Local Lead Capture" → "local-lead-capture"). */
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

/** Assert an id has the given service prefix (e.g., "content-*"); throws when not. */
export function assertServicePrefix(id: string, service: ServiceSlug, label = "id"): void {
  assertId(id, label);
  if (!id.startsWith(`${service}-`)) {
    throw new Error(`Invalid ${label}: "${id}". Expected to start with "${service}-".`);
  }
}

/** Extract the service slug prefix from an id when present, else null. */
export function extractServiceFromId(id: string): ServiceSlug | null {
  const idx = id.indexOf("-");
  const prefix = (idx === -1 ? id : id.slice(0, idx)) as ServiceSlug;
  return (SERVICE_SLUGS as readonly string[]).includes(prefix) ? prefix : null;
}

/** Build a service-prefixed id from a name; if name already has a service prefix, leave it. */
export function safeIdFromName(name: string, fallbackService?: ServiceSlug): string {
  const base = ensureKebab(name, "name");
  const maybeService = extractServiceFromId(base);
  if (maybeService) return base;
  if (!fallbackService) return base;
  return `${fallbackService}-${base}`;
}

/** Convert an array of items with `id` into a fast lookup map (throws on duplicates). */
export function toIdMap<T extends { id: string }>(arr: readonly T[], kind = "records"): Record<string, T> {
  const map = Object.create(null) as Record<string, T>;
  for (const item of arr) {
    assertId(item.id, `${kind} id`);
    if (map[item.id]) {
      throw new Error(`Duplicate ${kind} id detected: "${item.id}"`);
    }
    map[item.id] = item;
  }
  return map;
}

/** Assert no duplicate ids exist in an array of items with `id`. */
export function assertNoDuplicateIds<T extends { id: string }>(arr: readonly T[], kind = "records"): void {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const it of arr) {
    assertId(it.id, `${kind} id`);
    if (seen.has(it.id)) dupes.push(it.id);
    seen.add(it.id);
  }
  if (dupes.length) {
    const sample = Array.from(new Set(dupes)).slice(0, 10).join(", ");
    throw new Error(`Duplicate ${kind} ids (${dupes.length}) detected: ${sample}${dupes.length > 10 ? " …" : ""}`);
  }
}
