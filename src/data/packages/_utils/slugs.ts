// ============================================================================
// /src/data/packages/_utils/slugs.ts
// ----------------------------------------------------------------------------
// Canonical service slugs + friendly names/descriptions and normalization
// helpers. Also exports general-purpose slug helpers used across the domain.
// ============================================================================

import type { ServiceSlug } from "../_types/primitives";

/** Canonical service slugs used across the Packages domain. */
export const SERVICE_SLUGS: readonly ServiceSlug[] = [
  "content",
  "leadgen",
  "marketing",
  "seo",
  "webdev",
  "video",
] as const;

/** Human-friendly display names per service. */
export const SERVICE_NAMES: Record<ServiceSlug, string> = {
  content: "Content Production",
  leadgen: "Lead Generation",
  marketing: "Marketing Services",
  seo: "SEO Services",
  webdev: "Web Development",
  video: "Video Production",
} as const;

/** Short descriptions per service (used in hubs/SEO). */
export const SERVICE_DESCRIPTIONS: Record<ServiceSlug, string> = {
  content:
    "Strategic content creation that builds authority and drives engagement.",
  leadgen:
    "Systematic lead acquisition and conversion optimization across channels.",
  marketing:
    "Performance marketing with full-funnel planning and measurement.",
  seo:
    "Technical and content SEO to maximize organic visibility and demand.",
  webdev:
    "Conversion-focused websites and applications with modern stacks.",
  video:
    "Professional video production for awareness, education, and sales.",
} as const;

/** Synonyms and common variants → canonical slug. Extend as needed. */
const SYNONYMS = new Map<string, ServiceSlug>([
  ["lead-gen", "leadgen"],
  ["lead generation", "leadgen"],
  ["demand-gen", "leadgen"],
  ["web", "webdev"],
  ["web-dev", "webdev"],
  ["website", "webdev"],
  ["search", "seo"],
  ["search-engine-optimization", "seo"],
  ["content-marketing", "content"],
  ["marketing-services", "marketing"],
]);

/** Type guard for ServiceSlug. */
export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === "string" &&
    (SERVICE_SLUGS as readonly string[]).includes(value);
}

/**
 * Normalize arbitrary text to a canonical service slug when possible.
 * - Trims, lowercases
 * - Maps known synonyms to canon
 * - Returns the original input (lowercased) when not recognized
 */
export function normalizeServiceSlug(input: string): ServiceSlug | string {
  const s = String(input ?? "").trim().toLowerCase();
  if (isServiceSlug(s)) return s;
  return SYNONYMS.get(s) ?? s;
}

/**
 * Coerce arbitrary text to a canonical ServiceSlug, or throw when unknown.
 * Use when you need a guaranteed valid `ServiceSlug`.
 */
export function coerceServiceSlug(input: string, label = "service"): ServiceSlug {
  const norm = normalizeServiceSlug(input);
  if (isServiceSlug(norm)) return norm;
  throw new Error(
    `Unknown ${label} slug "${input}". Expected one of: ${SERVICE_SLUGS.join(
      ", ",
    )}`,
  );
}

/** Get a human-friendly service name; falls back to Title Case. */
export function getServiceName(slug: string): string {
  const s = normalizeServiceSlug(slug);
  if (isServiceSlug(s)) return SERVICE_NAMES[s];
  return toTitleCase(s);
}

/** Get a service description with safe fallback. */
export function getServiceDescription(slug: string): string {
  const s = normalizeServiceSlug(slug);
  if (isServiceSlug(s)) return SERVICE_DESCRIPTIONS[s];
  return `Professional ${getServiceName(s)} services`;
}

/** Title-case helper for fallback names. */
function toTitleCase(text: string): string {
  return String(text ?? "")
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ---------------------------------------------------------------------------
// General slug helpers (service-agnostic)
// ---------------------------------------------------------------------------

/**
 * Slugify an id/name:
 * - lowercases
 * - replaces non-alphanumeric with hyphens
 * - collapses repeats
 * - trims leading/trailing hyphens
 */
export function slugifyId(id: string): string {
  return String(id ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Return the provided `slug` when truthy, otherwise slugify the given `id`.
 * Useful in adapters to guarantee a route-safe slug.
 */
export function coerceSlug(id: string, slug?: string): string {
  return slug && slug.length ? slug : slugifyId(id);
}
