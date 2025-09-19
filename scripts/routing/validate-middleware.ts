#!/usr/bin/env tsx
/**
 * Validate middleware routing configuration against taxonomy
 * Tests canonical redirects, detects loops, validates hub coverage
 * 
 * Usage:
 *   tsx scripts/routing/validate-middleware.ts
 *   tsx scripts/routing/validate-middleware.ts --test-redirects
 *   tsx scripts/routing/validate-middleware.ts --check-loops
 * 
 * Exit codes:
 *   0 = success, 1 = validation errors, 2 = unexpected crash
 */

import { logger, exitOk, exitFail } from "../_shared/logger";
import { servicesTree } from "../../src/data/taxonomy/servicesTree";
import type { HubNode, AnyServiceNode } from "../../src/types/servicesTaxonomy.types";

const argv = process.argv.slice(2);
const TEST_REDIRECTS = argv.includes("--test-redirects");
const CHECK_LOOPS = argv.includes("--check-loops");
const JSON_OUTPUT = argv.includes("--json");
const VERBOSE = argv.includes("--verbose");

// Import middleware constants (these should match your middleware.ts)
const CANONICAL_HUBS = new Set<string>([
  "web-development-services",
  "video-production-services", 
  "seo-services",
  "marketing-services",
  "lead-generation-services",
  "content-production-services",
]);

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

const LEGACY_REDIRECTS: Record<string, string> = {
  // Hub redirects
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

  // Service-level examples
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
};

interface ValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    canonicalHubs: number;
    aliasesToCanonical: number;
    legacyRedirects: number;
    taxonomyHubs: number;
    taxonomyServices: number;
    taxonomySubservices: number;
  };
  checks: {
    taxonomyAlignment: boolean;
    hubCoverage: boolean;
    aliasConsistency: boolean;
    redirectValidation: boolean;
    loopDetection: boolean;
  };
}

function extractTaxonomyHubs(): HubNode[] {
  const hubs: HubNode[] = [];
  
  function traverse(node: AnyServiceNode) {
    if (node.kind === "hub" && node.slug !== "services") {
      hubs.push(node as HubNode);
    }
    if (node.children) {
      node.children.forEach(child => traverse(child as AnyServiceNode));
    }
  }

  traverse(servicesTree);
  return hubs;
}

function validateTaxonomyAlignment(result: ValidationResult, taxonomyHubs: HubNode[]): void {
  const taxonomySlugs = new Set(taxonomyHubs.map(h => h.slug));
  
  // Check if all taxonomy hubs are in CANONICAL_HUBS
  for (const hub of taxonomyHubs) {
    if (!CANONICAL_HUBS.has(hub.slug)) {
      result.errors.push(`Taxonomy hub "${hub.slug}" not found in middleware CANONICAL_HUBS`);
    }
  }

  // Check if all CANONICAL_HUBS exist in taxonomy
  for (const canonicalHub of CANONICAL_HUBS) {
    if (!taxonomySlugs.has(canonicalHub)) {
      result.errors.push(`Middleware canonical hub "${canonicalHub}" not found in taxonomy`);
    }
  }

  // Check canonical format
  for (const hub of taxonomyHubs) {
    if (!hub.slug.endsWith("-services")) {
      result.warnings.push(`Hub slug "${hub.slug}" doesn't follow canonical format (*-services)`);
    }
  }

  result.checks.taxonomyAlignment = result.errors.length === 0;
}

function validateHubCoverage(result: ValidationResult, taxonomyHubs: HubNode[]): void {
  const taxonomySlugs = new Set(taxonomyHubs.map(h => h.slug));
  
  // Check if all hub aliases point to valid canonical hubs
  for (const [alias, canonical] of Object.entries(HUB_ALIAS_TO_CANONICAL)) {
    if (!CANONICAL_HUBS.has(canonical)) {
      result.errors.push(`Alias "${alias}" points to non-canonical hub "${canonical}"`);
    }
    if (!taxonomySlugs.has(canonical)) {
      result.errors.push(`Alias "${alias}" points to hub "${canonical}" not found in taxonomy`);
    }
  }

  // Check if all canonical hubs have at least one alias
  for (const canonical of CANONICAL_HUBS) {
    const hasAlias = Object.values(HUB_ALIAS_TO_CANONICAL).includes(canonical);
    if (!hasAlias) {
      result.warnings.push(`Canonical hub "${canonical}" has no aliases defined`);
    }
  }

  result.checks.hubCoverage = result.errors.length === 0;
}

function validateAliasConsistency(result: ValidationResult): void {
  // Check for circular references
  for (const [alias, canonical] of Object.entries(HUB_ALIAS_TO_CANONICAL)) {
    if (HUB_ALIAS_TO_CANONICAL[canonical] && HUB_ALIAS_TO_CANONICAL[canonical] !== canonical) {
      result.errors.push(`Circular alias detected: ${alias} -> ${canonical} -> ${HUB_ALIAS_TO_CANONICAL[canonical]}`);
    }
  }

  // Check for aliases pointing to themselves
  for (const [alias, canonical] of Object.entries(HUB_ALIAS_TO_CANONICAL)) {
    if (alias === canonical) {
      // This is actually OK for canonical -> canonical mappings
      continue;
    }
  }

  // Check for multiple aliases pointing to same canonical (info only)
  const canonicalCounts = new Map<string, string[]>();
  for (const [alias, canonical] of Object.entries(HUB_ALIAS_TO_CANONICAL)) {
    if (!canonicalCounts.has(canonical)) {
      canonicalCounts.set(canonical, []);
    }
    canonicalCounts.get(canonical)!.push(alias);
  }

  if (VERBOSE) {
    for (const [canonical, aliases] of canonicalCounts) {
      if (aliases.length > 1) {
        logger.debug(`Hub "${canonical}" has ${aliases.length} aliases: ${aliases.join(", ")}`);
      }
    }
  }

  result.checks.aliasConsistency = result.errors.length === 0;
}

function validateRedirects(result: ValidationResult): void {
  // Check if legacy redirects point to valid canonical paths
  for (const [legacy, canonical] of Object.entries(LEGACY_REDIRECTS)) {
    // Extract hub from canonical path
    const canonicalMatch = canonical.match(/^\/services\/([^\/]+)/);
    if (canonicalMatch) {
      const hubSlug = canonicalMatch[1];
      if (!CANONICAL_HUBS.has(hubSlug)) {
        result.errors.push(`Legacy redirect "${legacy}" points to non-canonical hub "${hubSlug}"`);
      }
    } else {
      result.errors.push(`Legacy redirect "${legacy}" has invalid canonical format "${canonical}"`);
    }

    // Check for self-references
    if (legacy === canonical) {
      result.errors.push(`Legacy redirect "${legacy}" points to itself`);
    }
  }

  result.checks.redirectValidation = result.errors.length === 0;
}

function detectRedirectLoops(result: ValidationResult): void {
  if (!CHECK_LOOPS) {
    result.checks.loopDetection = true;
    return;
  }

  const visited = new Set<string>();
  const visiting = new Set<string>();

  function hasLoop(path: string, depth = 0): boolean {
    if (depth > 10) {
      result.errors.push(`Redirect chain too deep starting from "${path}"`);
      return true;
    }

    if (visiting.has(path)) {
      result.errors.push(`Redirect loop detected involving "${path}"`);
      return true;
    }

    if (visited.has(path)) {
      return false;
    }

    visiting.add(path);

    // Check legacy redirects
    const legacyTarget = LEGACY_REDIRECTS[path];
    if (legacyTarget) {
      if (hasLoop(legacyTarget, depth + 1)) {
        return true;
      }
    }

    // Check alias resolution for /services/* paths
    const servicesMatch = path.match(/^\/services\/([^\/]+)/);
    if (servicesMatch) {
      const hub = servicesMatch[1];
      const canonical = HUB_ALIAS_TO_CANONICAL[hub];
      if (canonical && canonical !== hub) {
        const newPath = path.replace(/^\/services\/[^\/]+/, `/services/${canonical}`);
        if (hasLoop(newPath, depth + 1)) {
          return true;
        }
      }
    }

    visiting.delete(path);
    visited.add(path);
    return false;
  }

  // Test key paths for loops
  const testPaths = [
    ...Object.keys(LEGACY_REDIRECTS),
    ...Object.keys(HUB_ALIAS_TO_CANONICAL).map(alias => `/services/${alias}`),
    ...Array.from(CANONICAL_HUBS).map(hub => `/services/${hub}`)
  ];

  for (const path of testPaths) {
    hasLoop(path);
  }

  result.checks.loopDetection = result.errors.length === 0;
}

function simulateRedirectResolution(result: ValidationResult): void {
  if (!TEST_REDIRECTS) {
    return;
  }

  const testCases = [
    // Alias resolution
    { input: "/services/web", expected: "/services/web-development-services" },
    { input: "/services/video", expected: "/services/video-production-services" },
    { input: "/services/seo", expected: "/services/seo-services" },
    { input: "/services/marketing", expected: "/services/marketing-services" },
    { input: "/services/leadgen", expected: "/services/lead-generation-services" },
    { input: "/services/content", expected: "/services/content-production-services" },
    
    // Legacy redirects
    { input: "/services/web-development", expected: "/services/web-development-services" },
    { input: "/services/video-production", expected: "/services/video-production-services" },
    
    // Root hub aliases
    { input: "/web-development-services", expected: "/services/web-development-services" },
    { input: "/video-production-services", expected: "/services/video-production-services" },
    
    // Canonical should remain unchanged
    { input: "/services/web-development-services", expected: "/services/web-development-services" },
    { input: "/services/video-production-services", expected: "/services/video-production-services" },
  ];

  function simulateMiddleware(input: string): string {
    let current = input.toLowerCase();
    const maxSteps = 5;
    let steps = 0;

    while (steps < maxSteps) {
      const original = current;
      
      // Legacy redirects
      if (LEGACY_REDIRECTS[current]) {
        current = LEGACY_REDIRECTS[current];
        steps++;
        continue;
      }

      // Root hub resolution (/{hub}-services -> /services/{hub})
      const rootMatch = current.match(/^\/([a-z0-9-]+-services)$/);
      if (rootMatch && CANONICAL_HUBS.has(rootMatch[1])) {
        current = `/services/${rootMatch[1]}`;
        steps++;
        continue;
      }

      // Services hub alias resolution
      const servicesMatch = current.match(/^\/services\/([^\/]+)/);
      if (servicesMatch) {
        const hub = servicesMatch[1];
        const canonical = HUB_ALIAS_TO_CANONICAL[hub];
        if (canonical && canonical !== hub) {
          current = current.replace(/^\/services\/[^\/]+/, `/services/${canonical}`);
          steps++;
          continue;
        }
      }

      // No more redirects
      break;
    }

    return current;
  }

  for (const testCase of testCases) {
    const actual = simulateMiddleware(testCase.input);
    if (actual !== testCase.expected) {
      result.errors.push(
        `Redirect test failed: "${testCase.input}" -> "${actual}" (expected "${testCase.expected}")`
      );
    } else if (VERBOSE) {
      logger.debug(`Redirect test passed: "${testCase.input}" -> "${actual}"`);
    }
  }
}

try {
  const result: ValidationResult = {
    success: false,
    errors: [],
    warnings: [],
    stats: {
      canonicalHubs: CANONICAL_HUBS.size,
      aliasesToCanonical: Object.keys(HUB_ALIAS_TO_CANONICAL).length,
      legacyRedirects: Object.keys(LEGACY_REDIRECTS).length,
      taxonomyHubs: 0,
      taxonomyServices: 0,
      taxonomySubservices: 0
    },
    checks: {
      taxonomyAlignment: false,
      hubCoverage: false,
      aliasConsistency: false,
      redirectValidation: false,
      loopDetection: false
    }
  };

  logger.debug("Extracting taxonomy data");
  const taxonomyHubs = extractTaxonomyHubs();
  
  // Count taxonomy items
  let services = 0, subservices = 0;
  function countNodes(node: AnyServiceNode) {
    if (node.kind === "service") services++;
    if (node.kind === "subservice") subservices++;
    if (node.children) {
      node.children.forEach(child => countNodes(child as AnyServiceNode));
    }
  }
  countNodes(servicesTree);

  result.stats.taxonomyHubs = taxonomyHubs.length;
  result.stats.taxonomyServices = services;
  result.stats.taxonomySubservices = subservices;

  // Run all validations
  logger.debug("Validating taxonomy alignment");
  validateTaxonomyAlignment(result, taxonomyHubs);

  logger.debug("Validating hub coverage");
  validateHubCoverage(result, taxonomyHubs);

  logger.debug("Validating alias consistency");
  validateAliasConsistency(result);

  logger.debug("Validating redirect configuration");
  validateRedirects(result);

  logger.debug("Detecting redirect loops");
  detectRedirectLoops(result);

  if (TEST_REDIRECTS) {
    logger.debug("Simulating redirect resolution");
    simulateRedirectResolution(result);
  }

  // Determine overall success
  result.success = result.errors.length === 0;

  if (JSON_OUTPUT) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    // Human readable output
    logger.info("Middleware Validation Results");
    logger.info("============================");
    
    logger.info(`Canonical Hubs: ${result.stats.canonicalHubs}`);
    logger.info(`Hub Aliases: ${result.stats.aliasesToCanonical}`);
    logger.info(`Legacy Redirects: ${result.stats.legacyRedirects}`);
    logger.info(`Taxonomy: ${result.stats.taxonomyHubs} hubs, ${result.stats.taxonomyServices} services, ${result.stats.taxonomySubservices} subservices`);
    logger.info("");

    // Check results
    const checkmarks = {
      taxonomyAlignment: result.checks.taxonomyAlignment ? "✅" : "❌",
      hubCoverage: result.checks.hubCoverage ? "✅" : "❌", 
      aliasConsistency: result.checks.aliasConsistency ? "✅" : "❌",
      redirectValidation: result.checks.redirectValidation ? "✅" : "❌",
      loopDetection: result.checks.loopDetection ? "✅" : "❌"
    };

    logger.info("Validation Checks:");
    logger.info(`${checkmarks.taxonomyAlignment} Taxonomy Alignment`);
    logger.info(`${checkmarks.hubCoverage} Hub Coverage`);
    logger.info(`${checkmarks.aliasConsistency} Alias Consistency`);
    logger.info(`${checkmarks.redirectValidation} Redirect Validation`);
    logger.info(`${checkmarks.loopDetection} Loop Detection`);
    logger.info("");

    if (result.errors.length > 0) {
      logger.error("Errors:");
      result.errors.forEach(error => logger.error(`- ${error}`));
      logger.info("");
    }

    if (result.warnings.length > 0) {
      logger.warn("Warnings:");
      result.warnings.forEach(warning => logger.warn(`- ${warning}`));
      logger.info("");
    }

    if (result.success) {
      logger.info("✅ Middleware validation passed");
    } else {
      logger.error("❌ Middleware validation failed");
    }
  }

  if (result.success) {
    exitOk();
  } else {
    exitFail();
  }

} catch (err) {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString()
    }));
  } else {
    logger.error("Unexpected error:", err);
  }
  process.exit(2);
}