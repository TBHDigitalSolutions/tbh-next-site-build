// /src/data/packages/_utils/slugs.ts
// Canonical service slugs, names, descriptions, and helpers.

import type { ServiceSlug } from "../_types/packages.types";

export const SERVICE_SLUGS: readonly ServiceSlug[] = [
  "content",
  "leadgen",
  "marketing",
  "seo",
  "webdev",
  "video",
] as const;

export const SERVICE_NAMES: Record<ServiceSlug, string> = {
  content: "Content Production",
  leadgen: "Lead Generation",
  marketing: "Marketing Services",
  seo: "SEO Services",
  webdev: "Web Development",
  video: "Video Production",
} as const;

export const SERVICE_DESCRIPTIONS: Record<ServiceSlug, string> = {
  content: "Strategic content creation that builds authority and drives engagement",
  leadgen: "Systematic lead generation and conversion optimization",
  marketing: "Performance marketing across major channels",
  seo: "Technical and content SEO for maximum organic visibility",
  webdev: "Custom websites and applications built for conversion",
  video: "Professional video production for marketing and sales",
} as const;

/** Common synonyms → canonical slug normalization. */
const SYNONYMS = new Map<string, ServiceSlug>([
  ["lead-gen", "leadgen"],
  ["lead generation", "leadgen"],
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
  return typeof value === "string" && (SERVICE_SLUGS as readonly string[]).includes(value);
}

/** Normalize arbitrary text to a canonical service slug when possible. */
export function normalizeServiceSlug(input: string): ServiceSlug | string {
  const s = input.trim().toLowerCase();
  if (isServiceSlug(s)) return s;
  return SYNONYMS.get(s) ?? s;
}

/** Get a human-friendly service name; fall back to Title Case. */
export function getServiceName(slug: string): string {
  const s = normalizeServiceSlug(slug);
  if (isServiceSlug(s)) return SERVICE_NAMES[s];
  return s
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** Get a service description with safe fallback. */
export function getServiceDescription(slug: string): string {
  const s = normalizeServiceSlug(slug);
  if (isServiceSlug(s)) return SERVICE_DESCRIPTIONS[s];
  return `Professional ${getServiceName(s)} services`;
}