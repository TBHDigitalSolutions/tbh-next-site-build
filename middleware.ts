// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Canonical hub slugs under /services/{hub}
 * Keep in sync with src/data/taxonomy/servicesTree.ts
 * Canonical = the six "*-services" slugs.
 */
const CANONICAL_HUBS = new Set<string>([
  "web-development-services",
  "video-production-services",
  "seo-services",
  "marketing-services",
  "lead-generation-services",
  "content-production-services",
]);

/**
 * Hub alias map → canonical hub slug.
 * Keys are matched case-insensitively.
 */
const HUB_ALIAS_TO_CANONICAL: Record<string, string> = {
  // Web Development
  "web": "web-development-services",
  "webdev": "web-development-services",
  "web-development": "web-development-services",
  "web-development-services": "web-development-services",

  // Video Production
  "video": "video-production-services",
  "video-production": "video-production-services",
  "video-production-services": "video-production-services",

  // SEO
  "seo": "seo-services",
  "seo-services": "seo-services",

  // Marketing
  "marketing": "marketing-services",
  "marketing-services": "marketing-services",

  // Lead Generation
  "leadgen": "lead-generation-services",
  "lead-gen": "lead-generation-services",
  "lead-generation": "lead-generation-services",
  "lead-generation-services": "lead-generation-services",

  // Content Production
  "content": "content-production-services",
  "content-production": "content-production-services",
  "content-production-services": "content-production-services",
};

/**
 * Exact legacy redirects (pin known historical paths).
 * Applied before generic alias rules.
 * NOTE: use lowercase keys; we normalize incoming paths.
 */
const LEGACY_REDIRECTS: Record<string, string> = {
  // Hubs → canonical (*-services)
  "/services/web-development": "/services/web-development-services",
  "/services/video-production": "/services/video-production-services",
  "/services/seo": "/services/seo-services",
  "/services/content-production": "/services/content-production-services",
  "/services/lead-generation": "/services/lead-generation-services",
  "/services/marketing": "/services/marketing-services",
  "/services/web": "/services/web-development-services",
  "/services/webdev": "/services/web-development-services",
  "/services/video": "/services/video-production-services",
  "/services/leadgen": "/services/lead-generation-services",
  "/services/lead-gen": "/services/lead-generation-services",
  "/services/content": "/services/content-production-services",

  // Service-level legacy examples (kept from your list)
  "/services/seo/technical": "/services/seo-services/technical",
  "/services/seo/marketing": "/services/seo-services/marketing",
  "/services/seo/ai-seo": "/services/seo-services/ai-seo",
  "/services/web/website": "/services/web-development-services/website",
  "/services/web/ecommerce": "/services/web-development-services/ecommerce",
  "/services/webdev/website": "/services/web-development-services/website",
  "/services/webdev/ecommerce": "/services/web-development-services/ecommerce",
  "/services/content/creation": "/services/content-production-services/creation",
  "/services/content/strategy": "/services/content-production-services/strategy",
  "/services/video/pre-production": "/services/video-production-services/pre-production",
  "/services/video/production": "/services/video-production-services/production",
  "/services/video/post-production": "/services/video-production-services/post-production",
  "/services/leadgen/offer-strategy": "/services/lead-generation-services/offer-strategy",
  "/services/leadgen/landing-pages": "/services/lead-generation-services/landing-pages",
  "/services/marketing/paid-search": "/services/marketing-services/paid-search",
  "/services/marketing/paid-social": "/services/marketing-services/paid-social",

  // Mis-leveled editorial strategy example
  "/services/content-production/editorial-strategy":
    "/services/content-production-services/writing-editorial/editorial-strategy",
};

/** Collapse multiple slashes and trim a trailing slash (except root) */
function normalizePath(pathname: string): string {
  let p = pathname.replace(/\/{2,}/g, "/");
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/**
 * Resolve hub aliases to canonical paths; return redirect target or null.
 *
 * Supported patterns:
 *  - /services/{alias}[/*] → /services/{canonical}[/*]
 *  - /{alias}-services[/*] → /services/{canonical}[/*]
 *  - /{alias}[/*] → /services/{canonical}[/*]
 */
function resolveAliasRedirect(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const lower = parts.map((p) => p.toLowerCase());

  // A) /services/{alias}[/*]
  if (lower[0] === "services" && lower.length >= 2) {
    const alias = lower[1];
    const canonical = HUB_ALIAS_TO_CANONICAL[alias];
    if (canonical && canonical !== alias) {
      const remainder = parts.slice(2).join("/");
      return "/services/" + canonical + (remainder ? "/" + remainder : "");
    }
    return null;
  }

  // B) /{alias}-services[/*] → /services/{canonical}[/*]
  const first = lower[0];
  if (first.endsWith("-services")) {
    const canonical = HUB_ALIAS_TO_CANONICAL[first];
    if (canonical) {
      const remainder = parts.slice(1).join("/");
      return "/services/" + canonical + (remainder ? "/" + remainder : "");
    }
  }

  // C) /{alias}[/*] → /services/{canonical}[/*]
  const aliasOnly = HUB_ALIAS_TO_CANONICAL[first];
  if (aliasOnly) {
    const remainder = parts.slice(1).join("/");
    return "/services/" + aliasOnly + (remainder ? "/" + remainder : "");
  }

  return null;
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const originalPath = url.pathname;
  const lowerPath = originalPath.toLowerCase();
  const pathname = normalizePath(lowerPath);

  // 1) Exact legacy redirects
  const exact = LEGACY_REDIRECTS[pathname];
  if (exact) {
    const target = new URL(exact, url);
    target.search = url.search;
    target.hash = url.hash;
    return NextResponse.redirect(target, 301);
  }

  // 2) Legacy prefix redirects (preserve deep remainder)
  for (const [legacy, canonical] of Object.entries(LEGACY_REDIRECTS)) {
    if (pathname.startsWith(legacy + "/")) {
      const remainder = pathname.slice(legacy.length);
      const target = new URL(canonical + remainder, url);
      target.search = url.search;
      target.hash = url.hash;
      return NextResponse.redirect(target, 301);
    }
  }

  // 3) Generic alias → canonical
  const aliasTarget = resolveAliasRedirect(pathname);
  if (aliasTarget && aliasTarget !== pathname) {
    const target = new URL(aliasTarget, url);
    target.search = url.search;
    target.hash = url.hash;
    return NextResponse.redirect(target, 301);
  }

  // 4) Ensure canonical hub segment if path is /services/{hub}
  if (pathname.startsWith("/services/")) {
    const segs = pathname.split("/").filter(Boolean);
    const hub = segs[1];
    if (hub && !CANONICAL_HUBS.has(hub)) {
      const canonical = HUB_ALIAS_TO_CANONICAL[hub];
      if (canonical) {
        const remainder = segs.slice(2).join("/");
        const targetPath = "/services/" + canonical + (remainder ? "/" + remainder : "");
        if (targetPath !== pathname) {
          const target = new URL(targetPath, url);
          target.search = url.search;
          target.hash = url.hash;
          return NextResponse.redirect(target, 301);
        }
      }
    }
  }

  // 5) Final normalization for duplicate slashes / trailing slash
  const normalizedOriginal = normalizePath(originalPath);
  if (normalizedOriginal !== originalPath) {
    const target = new URL(normalizedOriginal || "/", url);
    target.search = url.search;
    target.hash = url.hash;
    return NextResponse.redirect(target, 308);
  }

  return NextResponse.next();
}

/**
 * Matchers:
 * - All /services/* routes
 * - Root-level hub prefixes (six “*-services” entry points)
 * - Common alias roots like /web, /leadgen, /content, etc.
 */
export const config = {
  matcher: [
    "/services/:path*",

    // Root-level hub prefixes (six “*-services” entry points)
    "/web-development-services/:path*",
    "/video-production-services/:path*",
    "/seo-services/:path*",
    "/marketing-services/:path*",
    "/lead-generation-services/:path*",
    "/content-production-services/:path*",

    // Shorthand aliases at root
    "/seo/:path*",
    "/web/:path*",
    "/webdev/:path*",
    "/video/:path*",
    "/leadgen/:path*",
    "/lead-gen/:path*",
    "/content/:path*",
    "/marketing/:path*",
  ],
};
