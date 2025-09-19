// dataLoaders.ts

// Canonical hubs are the *-services slugs
const CANONICAL_HUBS = new Set([
  "seo-services",
  "web-development-services",
  "video-production-services",
  "lead-generation-services",
  "content-production-services",
  "marketing-services",
]);

// Map common aliases/short forms -> canonical *-services slugs
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

function canonicalHub(hub: string): string {
  return HUB_ALIAS_TO_CANONICAL[hub] ?? hub;
}

export function isCanonicalHub(hub: string): boolean {
  return CANONICAL_HUBS.has(hub);
}

export function getCanonicalHubs(): string[] {
  return Array.from(CANONICAL_HUBS);
}

export async function loadPageData(
  level: "hub" | "service" | "subservice",
  hub: string,
  service?: string,
  sub?: string
) {
  const canonicalHubSlug = canonicalHub(hub);
  const segs = ["@/data/page/services-pages", canonicalHubSlug, service, sub].filter(Boolean).join("/");
  try {
    const mod = await import(`${segs}/index`);
    return mod.default ?? mod;
  } catch {
    return null;
  }
}

export function resolveHubAlias(hubSlug: string): string {
  return canonicalHub(hubSlug);
}

export function validateHubSlug(hubSlug: string): { isValid: boolean; canonical: string | null } {
  const canonical = canonicalHub(hubSlug);
  return {
    isValid: CANONICAL_HUBS.has(canonical),
    canonical: CANONICAL_HUBS.has(canonical) ? canonical : null,
  };
}