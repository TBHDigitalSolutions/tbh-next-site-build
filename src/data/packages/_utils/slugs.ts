// /src/data/packages/_utils/slugs.ts
// Canonical service slugs + guards

import type { ServiceSlug } from "../_types/packages.types";

export const SERVICE_SLUGS: readonly ServiceSlug[] = [
  "content",
  "leadgen", 
  "marketing",
  "seo",
  "webdev",
  "video"
] as const;

export const SERVICE_NAMES: Record<ServiceSlug, string> = {
  content: "Content Production",
  leadgen: "Lead Generation", 
  marketing: "Marketing Services",
  seo: "SEO Services",
  webdev: "Web Development",
  video: "Video Production"
} as const;

export const SERVICE_DESCRIPTIONS: Record<ServiceSlug, string> = {
  content: "Strategic content creation that builds authority and drives engagement",
  leadgen: "Systematic lead generation and conversion optimization",
  marketing: "Performance marketing across all major channels", 
  seo: "Technical and content SEO for maximum organic visibility",
  webdev: "Custom websites and applications built for conversion",
  video: "Professional video production for marketing and sales"
} as const;

/**
 * Type guard to check if a string is a valid ServiceSlug
 */
export function isServiceSlug(value: unknown): value is ServiceSlug {
  return typeof value === "string" && SERVICE_SLUGS.includes(value as ServiceSlug);
}

/**
 * Get service name from slug with fallback
 */
export function getServiceName(slug: string): string {
  if (isServiceSlug(slug)) {
    return SERVICE_NAMES[slug];
  }
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

/**
 * Get service description from slug with fallback
 */
export function getServiceDescription(slug: string): string {
  if (isServiceSlug(slug)) {
    return SERVICE_DESCRIPTIONS[slug];
  }
  return `Professional ${slug} services`;
}