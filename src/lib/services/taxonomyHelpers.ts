// src/lib/services/taxonomyHelpers.ts

import { getNode } from '@/data/taxonomy/servicesTree'
import { resolveHubSlug } from './taxonomy'

type ChildNode = { slug: string; title?: string };

/**
 * Derive human-friendly bullets from children of a (hub/service/sub) node.
 * - Returns [] if node or children are missing.
 * - Uses child's `title` when present, otherwise prettifies its `slug`.
 * - Now supports canonical hub resolution for marketing-services and other *-services hubs.
 */
export function deriveBulletsFromChildren(
  hub: string,
  service?: string,
  sub?: string
): string[] {
  // Resolve to canonical hub slug if needed
  const canonicalHub = resolveHubSlug(hub);
  
  const node = getNode(canonicalHub, service, sub) as { children?: ChildNode[] } | null
  if (!node || !Array.isArray(node.children)) return []
  return node.children.map((child) => child.title ?? slugToTitle(child.slug))
}

/**
 * Get bullets specifically for marketing services
 */
export function getMarketingServicesBullets(): string[] {
  return deriveBulletsFromChildren("marketing-services");
}

/**
 * Get bullets for a specific marketing service
 */
export function getMarketingServiceBullets(serviceSlug: string): string[] {
  return deriveBulletsFromChildren("marketing-services", serviceSlug);
}

/**
 * Get all canonical hub bullets (useful for navigation)
 */
export function getAllCanonicalHubBullets(): Record<string, string[]> {
  const canonicalHubs = [
    "seo-services",
    "web-development-services", 
    "video-production-services",
    "lead-generation-services",
    "content-production-services",
    "marketing-services",
  ];

  return canonicalHubs.reduce((acc, hub) => {
    acc[hub] = deriveBulletsFromChildren(hub);
    return acc;
  }, {} as Record<string, string[]>);
}

/** "ai-search-optimization" -> "Ai Search Optimization" */
export function slugToTitle(slug: string): string {
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Convert service slug to human-friendly title for marketing services specifically */
export function marketingServiceSlugToTitle(slug: string): string {
  const titleMap: Record<string, string> = {
    "digital-advertising": "Digital Advertising",
    "content-creative": "Content & Creative", 
    "martech-automation": "Martech & Automation",
    "analytics-optimization": "Analytics & Optimization",
    "pr-communications": "PR & Communications",
    "strategy-consulting": "Strategy & Consulting",
  };
  
  return titleMap[slug] ?? slugToTitle(slug);
}

/** Get marketing service metadata for navigation/display */
export function getMarketingServiceMeta(slug: string): { 
  title: string; 
  description?: string; 
  href: string;
} {
  const descriptions: Record<string, string> = {
    "digital-advertising": "Full-funnel paid media programs across search, social, and programmatic",
    "content-creative": "Performance creative, editorial systems, and multi-channel distribution",
    "martech-automation": "CRM, CDP, and marketing automation that actually talk to each other",
    "analytics-optimization": "Trustworthy tracking, clear reporting, and disciplined experimentation",
    "pr-communications": "Clear narrative, consistent messaging, and placements that matter",
    "strategy-consulting": "Clarity on where to play and how to win with disciplined execution",
  };

  return {
    title: marketingServiceSlugToTitle(slug),
    description: descriptions[slug],
    href: `/services/marketing-services/${slug}`,
  };
}

/** Validate that a hub/service/sub path exists in taxonomy */
export function validateTaxonomyPath(
  hub: string, 
  service?: string, 
  sub?: string
): { exists: boolean; canonicalHub: string; error?: string } {
  try {
    const canonicalHub = resolveHubSlug(hub);
    const node = getNode(canonicalHub, service, sub);
    return {
      exists: !!node,
      canonicalHub,
    };
  } catch (error) {
    return {
      exists: false,
      canonicalHub: resolveHubSlug(hub),
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/** Get canonical path for any hub/service/sub combination */
export function buildCanonicalTaxonomyPath(
  hub: string,
  service?: string,
  sub?: string
): string {
  const canonicalHub = resolveHubSlug(hub);
  const segments = ['/services', canonicalHub, service, sub].filter(Boolean);
  return segments.join('/');
}