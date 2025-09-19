// =============================================================================
// Navigation Helpers for Consistent URL Generation
// =============================================================================
//
// This file centralizes all service-related URL builders.
// Use these helpers instead of string concatenation so your
// navigation, breadcrumbs, redirects, and canonical paths stay consistent.
//
// Example:
//   ServiceUrlBuilder.hub("seo-services")
//     → "/services/seo-services"
//
//   ServiceUrlBuilder.service("seo-services", "technical")
//     → "/services/seo-services/technical"
//
//   ServiceUrlBuilder.subService("web-development-services", "website", "templates")
//     → "/services/web-development-services/website/templates"
// =============================================================================
// src/lib/navigation/serviceUrls.ts
// =============================================================================
// Navigation Helpers for Consistent URL Generation (Services + Packages)
// =============================================================================
//
// Centralized URL builders for hubs, services, sub-services, and packages.
// Updated to support canonical *-services hub structure.
// =============================================================================

// Canonical hubs are the *-services slugs
const CANONICAL_HUBS = new Set([
  "seo-services",
  "web-development-services",
  "video-production-services",
  "lead-generation-services",
  "content-production-services",
  "marketing-services",
]);

// Map common aliases/short forms → canonical *-services slugs
const HUB_ALIAS_TO_CANONICAL: Record<string, string> = {
  // SEO
  "seo": "seo-services",
  "seo-services": "seo-services",

  // Web Development
  "web": "web-development-services",
  "webdev": "web-development-services",
  "web-development": "web-development-services",
  "web-development-services": "web-development-services",

  // Video Production
  "video": "video-production-services",
  "video-production": "video-production-services",
  "video-production-services": "video-production-services",

  // Lead Generation
  "leadgen": "lead-generation-services",
  "lead-gen": "lead-generation-services",
  "lead-generation": "lead-generation-services",
  "lead-generation-services": "lead-generation-services",

  // Content Production
  "content": "content-production-services",
  "content-production": "content-production-services",
  "content-production-services": "content-production-services",

  // Marketing
  "marketing": "marketing-services",
  "marketing-services": "marketing-services",
};

function canonicalHub(hubSlug: string): string {
  return HUB_ALIAS_TO_CANONICAL[hubSlug] ?? hubSlug;
}

export class ServiceUrlBuilder {
  /** Hub-level path: `/services/{hub}` - automatically converts to canonical */
  static hub(hubSlug: string): string {
    const canonical = canonicalHub(hubSlug);
    return `/services/${canonical}`;
  }

  /** Service-level path: `/services/{hub}/{service}` - automatically converts to canonical */
  static service(hubSlug: string, serviceSlug: string): string {
    const canonical = canonicalHub(hubSlug);
    return `/services/${canonical}/${serviceSlug}`;
  }

  /** Sub-service-level path: `/services/{hub}/{service}/{sub}` - automatically converts to canonical */
  static subService(hubSlug: string, serviceSlug: string, subSlug: string): string {
    const canonical = canonicalHub(hubSlug);
    return `/services/${canonical}/${serviceSlug}/${subSlug}`;
  }

  /** Service Packages Catalog: `/services/{hub}/{service}/packages` */
  static packages(hubSlug: string, serviceSlug: string): string {
    const canonical = canonicalHub(hubSlug);
    return `/services/${canonical}/${serviceSlug}/packages`;
  }

  /** Specific Package inside Catalog: `/services/{hub}/{service}/packages/{packageSlug}` */
  static package(hubSlug: string, serviceSlug: string, packageSlug: string): string {
    const canonical = canonicalHub(hubSlug);
    return `/services/${canonical}/${serviceSlug}/packages/${packageSlug}`;
  }

  /** Add-ons section within Packages Catalog: `/services/{hub}/{service}/packages#addons` */
  static addOns(hubSlug: string, serviceSlug: string): string {
    const canonical = canonicalHub(hubSlug);
    return `/services/${canonical}/${serviceSlug}/packages#addons`;
  }

  /** Arbitrary depth builder: `/services/{hub}/{...segments}` - automatically converts to canonical */
  static path(hubSlug: string, ...segments: string[]): string {
    const canonical = canonicalHub(hubSlug);
    const clean = segments.filter(Boolean).join("/");
    return clean ? `/services/${canonical}/${clean}` : `/services/${canonical}`;
  }

  /** Convert array of slugs into canonical services path */
  static fromSlugs(slugs: string[]): string {
    if (!slugs.length) return "/services";
    const [hubSlug, ...rest] = slugs;
    const canonical = canonicalHub(hubSlug);
    return rest.length ? `/services/${canonical}/${rest.join("/")}` : `/services/${canonical}`;
  }

  /** Normalize a path to avoid duplicate/trailing slashes */
  static normalize(path: string): string {
    let p = path.replace(/\/{2,}/g, "/");
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p;
  }

  /** Check if a hub slug is canonical */
  static isCanonicalHub(hubSlug: string): boolean {
    return CANONICAL_HUBS.has(hubSlug);
  }

  /** Get canonical hub slug from any variant */
  static getCanonicalHub(hubSlug: string): string {
    return canonicalHub(hubSlug);
  }

  /** Get all canonical hub slugs */
  static getCanonicalHubs(): string[] {
    return Array.from(CANONICAL_HUBS);
  }

  /** Validate and suggest canonical format */
  static validateHub(hubSlug: string): { isValid: boolean; canonical: string; needsRedirect: boolean } {
    const canonical = canonicalHub(hubSlug);
    const isValid = CANONICAL_HUBS.has(canonical);
    const needsRedirect = hubSlug !== canonical && isValid;
    
    return {
      isValid,
      canonical,
      needsRedirect,
    };
  }
}