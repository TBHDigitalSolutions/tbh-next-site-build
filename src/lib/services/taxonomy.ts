// src/lib/services/taxonomy.ts
/**
 * Services Taxonomy Utilities — Production Ready
 * ==============================================
 * Runtime helpers for querying the services tree and building navigation.
 * Used by all service page templates and route handlers.
 * Updated to support canonical *-services hub structure including marketing-services.
 */

import type { AnyServiceNode } from "@/types/servicesTaxonomy.types";
import { servicesTree } from "@/data/taxonomy/servicesTree";

/* ================================================================
 * Canonical Hub Structure
 * ================================================================ */

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

/* ================================================================
 * Reserved Slugs (collision guards)
 * ================================================================ */
const RESERVED_SUB_SLUGS = new Set<string>(["packages"]);

/* ================================================================
 * Hub Resolution Helpers
 * ================================================================ */

function canonicalHub(hubSlug: string): string {
  return HUB_ALIAS_TO_CANONICAL[hubSlug] ?? hubSlug;
}

export function isCanonicalHub(hubSlug: string): boolean {
  return CANONICAL_HUBS.has(hubSlug);
}

export function getCanonicalHubs(): string[] {
  return Array.from(CANONICAL_HUBS);
}

export function resolveHubSlug(hubSlug: string): string {
  return canonicalHub(hubSlug);
}

/* ================================================================
 * Internal Helpers
 * ================================================================ */

/** Throw with actionable error message if node not found */
function assertFound<T>(value: T | null | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value as T;
}

/** Iterative DFS to find a path (ancestors trail) to a node matching predicate */
function findPath(
  root: AnyServiceNode,
  predicate: (node: AnyServiceNode) => boolean
): AnyServiceNode[] | null {
  const stack: Array<{ node: AnyServiceNode; trail: AnyServiceNode[] }> = [
    { node: root, trail: [] },
  ];

  while (stack.length > 0) {
    const { node, trail } = stack.pop()!;
    const nextTrail = [...trail, node];

    if (predicate(node)) return nextTrail;

    const children = (node.children ?? []) as AnyServiceNode[];
    // reverse to preserve left→right traversal order in UI
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push({ node: children[i], trail: nextTrail });
    }
  }

  return null;
}

/** Find node by id anywhere in the tree */
function findNodeById(id: string): AnyServiceNode | null {
  const path = findPath(servicesTree as AnyServiceNode, (n) => n.id === id);
  return path ? (path[path.length - 1] as AnyServiceNode) : null;
}

/** Find node by slug anywhere in the tree */
function findNodeBySlug(slug: string): AnyServiceNode | null {
  const path = findPath(servicesTree as AnyServiceNode, (n) => n.slug === slug);
  return path ? (path[path.length - 1] as AnyServiceNode) : null;
}

/* ================================================================
 * Node Getters - Updated for canonical hub support
 * ================================================================ */

/** Root services node */
export function getRootNode(): AnyServiceNode {
  return servicesTree as AnyServiceNode;
}

/** Hub by slug - supports both canonical and alias resolution */
export function getHubNode(hubSlug: string): AnyServiceNode {
  const canonical = canonicalHub(hubSlug);
  const hub = (servicesTree.children ?? []).find((child) => child.slug === canonical);
  return assertFound(hub as AnyServiceNode, `Hub not found: ${hubSlug} (canonical: ${canonical})`);
}

/** SubHub by hub + subHub slugs */
export function getSubHubNode(hubSlug: string, subHubSlug: string): AnyServiceNode {
  const hub = getHubNode(hubSlug);
  const subHub = (hub.children ?? []).find((child) => child.slug === subHubSlug);
  return assertFound(subHub as AnyServiceNode, `SubHub not found: ${hubSlug}/${subHubSlug}`);
}

/**
 * Service by hub + service slugs (direct child only).
 * NOTE: For services inside subhubs, use getServiceNodeDeep.
 */
export function getServiceNode(hubSlug: string, serviceSlug: string): AnyServiceNode {
  const hub = getHubNode(hubSlug);
  const service = (hub.children ?? []).find((child) => child.slug === serviceSlug);
  return assertFound(service as AnyServiceNode, `Service not found: ${hubSlug}/${serviceSlug}`);
}

/** Deep service lookup: hub → (optional subhub) → service */
export function getServiceNodeDeep(hubSlug: string, serviceSlug: string): AnyServiceNode {
  const hub = getHubNode(hubSlug);

  // 1) direct service under hub
  const direct = (hub.children ?? []).find(
    (child) => child.kind === "service" && child.slug === serviceSlug
  );
  if (direct) return direct as AnyServiceNode;

  // 2) service under any subhub
  for (const node of hub.children ?? []) {
    if (node.kind === "subhub") {
      const svc = (node.children ?? []).find(
        (c) => c.kind === "service" && c.slug === serviceSlug
      );
      if (svc) return svc as AnyServiceNode;
    }
  }

  throw new Error(`Service not found: ${hubSlug}/${serviceSlug}`);
}

/** SubService by hub + service + sub slugs (direct child only) */
export function getSubServiceNode(
  hubSlug: string,
  serviceSlug: string,
  subServiceSlug: string
): AnyServiceNode {
  const service = getServiceNode(hubSlug, serviceSlug);
  const subService = (service.children ?? []).find((child) => child.slug === subServiceSlug);
  return assertFound(
    subService as AnyServiceNode,
    `SubService not found: ${hubSlug}/${serviceSlug}/${subServiceSlug}`
  );
}

/** Deep subservice lookup under services (supports subhubs) */
export function getSubServiceNodeDeep(
  hubSlug: string,
  serviceSlug: string,
  subServiceSlug: string
): AnyServiceNode {
  const service = getServiceNodeDeep(hubSlug, serviceSlug);
  const subService = (service.children ?? []).find(
    (child) => child.kind === "subservice" && child.slug === subServiceSlug
  );
  return assertFound(
    subService as AnyServiceNode,
    `SubService not found: ${hubSlug}/${serviceSlug}/${subServiceSlug}`
  );
}

/** Flexible: find any node by ID or slug */
export function getNodeByIdOrSlug(idOrSlug: string): AnyServiceNode | null {
  const byId = findNodeById(idOrSlug);
  if (byId) return byId;
  return findNodeBySlug(idOrSlug);
}

/* ================================================================
 * Marketing Services Specific Helpers
 * ================================================================ */

/** Get marketing-services hub node specifically */
export function getMarketingServicesHub(): AnyServiceNode {
  return getHubNode("marketing-services");
}

/** Get all marketing services (digital-advertising, content-creative, etc.) */
export function getMarketingServices(): AnyServiceNode[] {
  const hub = getMarketingServicesHub();
  return ((hub.children ?? []) as AnyServiceNode[]).filter((c) => c.kind === "service");
}

/** Get specific marketing service by slug */
export function getMarketingService(serviceSlug: string): AnyServiceNode {
  return getServiceNode("marketing-services", serviceSlug);
}

/** Validate that marketing-services taxonomy includes required services */
export function validateMarketingServicesTaxonomy(): { isValid: boolean; errors: string[]; missing: string[] } {
  const errors: string[] = [];
  const requiredServices = [
    "digital-advertising",
    "content-creative", 
    "martech-automation",
    "analytics-optimization",
    "pr-communications",
    "strategy-consulting"
  ];

  try {
    const hub = getMarketingServicesHub();
    const services = getMarketingServices();
    const existingSlugs = services.map(s => s.slug);
    const missing = requiredServices.filter(slug => !existingSlugs.includes(slug));
    
    if (missing.length > 0) {
      errors.push(`Missing required marketing services: ${missing.join(", ")}`);
    }

    return { isValid: errors.length === 0, errors, missing };
  } catch (error) {
    errors.push(`Marketing services hub not found: ${error}`);
    return { isValid: false, errors, missing: requiredServices };
  }
}

/* ================================================================
 * Children & Lists
 * ================================================================ */

export function listChildren(nodeIdOrSlug: string): AnyServiceNode[] {
  const node = getNodeByIdOrSlug(nodeIdOrSlug);
  return (node?.children as AnyServiceNode[]) ?? [];
}

export function getNodesByKind(
  kind: "hub" | "subhub" | "service" | "subservice"
): AnyServiceNode[] {
  const results: AnyServiceNode[] = [];
  const stack: AnyServiceNode[] = [servicesTree as AnyServiceNode];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node.kind === kind) results.push(node);
    const children = (node.children ?? []) as AnyServiceNode[];
    stack.push(...children);
  }

  return results;
}

export function getAllHubs(): AnyServiceNode[] {
  return (servicesTree.children ?? []) as AnyServiceNode[];
}

export function getAllSubHubs(): AnyServiceNode[] {
  return getNodesByKind("subhub");
}

/** Only direct services under a hub (exclude subhubs) */
export function getServicesInHub(hubSlug: string): AnyServiceNode[] {
  const hub = getHubNode(hubSlug);
  return ((hub.children ?? []) as AnyServiceNode[]).filter((c) => c.kind === "service");
}

export function getSubHubsInHub(hubSlug: string): AnyServiceNode[] {
  const hub = getHubNode(hubSlug);
  return ((hub.children ?? []) as AnyServiceNode[]).filter((child) => child.kind === "subhub");
}

/* ================================================================
 * Navigation Helpers
 * ================================================================ */

/**
 * Build canonical URL path for any node.
 * - Hub:        /services/{hub}
 * - Service:    /services/{hub}/{service}
 * - SubService: /services/{hub}/{service}/{sub}
 * - Deeper:     join all ancestor slugs (rare)
 */
export function canonicalPath(node: AnyServiceNode): string {
  // Root services page
  if (node === servicesTree || node.id === servicesTree.id) return "/services";

  const fullPath = findPath(servicesTree as AnyServiceNode, (n) => n.id === node.id);
  if (!fullPath) {
    return `/services/${String(node.slug)}`; // best-effort
  }

  // Remove root from lineage
  const lineage = fullPath[0] === (servicesTree as AnyServiceNode) ? fullPath.slice(1) : fullPath;
  const leaf = lineage[lineage.length - 1]!;
  const ancestors = lineage.slice(0, -1);

  if (ancestors.length === 0) {
    return `/services/${leaf.slug}`;
  } else if (ancestors.length === 1) {
    return `/services/${ancestors[0]!.slug}/${leaf.slug}`;
  } else if (ancestors.length === 2) {
    return `/services/${ancestors[0]!.slug}/${ancestors[1]!.slug}/${leaf.slug}`;
  }

  return `/services/${ancestors.map((a) => a.slug).join("/")}/${leaf.slug}`;
}

/** Breadcrumb objects for a node (omits the hidden root) */
export function buildBreadcrumbs(node: AnyServiceNode): Array<{ label: string; href: string }> {
  const path =
    findPath(servicesTree as AnyServiceNode, (n) => n.id === node.id) ??
    ([servicesTree as AnyServiceNode, node] as AnyServiceNode[]);

  const lineage = path[0] === (servicesTree as AnyServiceNode) ? path.slice(1) : path;

  return lineage.map((n) => ({
    label: n.title,
    href: canonicalPath(n),
  }));
}

/** Parent and siblings */
export function getParentNode(node: AnyServiceNode): AnyServiceNode | null {
  if (node === servicesTree || node.id === servicesTree.id) return null;
  const path = findPath(servicesTree as AnyServiceNode, (n) => n.id === node.id);
  return path && path.length > 1 ? (path[path.length - 2] as AnyServiceNode) : null;
}

export function getSiblings(node: AnyServiceNode): AnyServiceNode[] {
  const parent = getParentNode(node);
  if (!parent) return [];
  return ((parent.children ?? []) as AnyServiceNode[]).filter((s) => s.id !== node.id);
}

/* ================================================================
 * Static Site Generation Helpers - Updated for canonical hubs
 * ================================================================ */

/** All hub params - returns canonical hub slugs */
export function getAllHubParams(): Array<{ hub: string }> {
  return (servicesTree.children ?? []).map((hub) => ({ hub: String(hub.slug) }));
}

/** All subhub params */
export function getAllSubHubParams(): Array<{ hub: string; subhub: string }> {
  const params: Array<{ hub: string; subhub: string }> = [];

  for (const hub of servicesTree.children ?? []) {
    for (const sub of hub.children ?? []) {
      if (sub.kind === "subhub") {
        params.push({ hub: String(hub.slug), subhub: String(sub.slug) });
      }
    }
  }

  return params;
}

/** All service params (includes services under subhubs) */
export function getAllServiceParams(): Array<{ hub: string; service: string }> {
  const params: Array<{ hub: string; service: string }> = [];

  for (const hub of servicesTree.children ?? []) {
    for (const node of hub.children ?? []) {
      if (node.kind === "service") {
        params.push({ hub: String(hub.slug), service: String(node.slug) });
      } else if (node.kind === "subhub") {
        for (const svc of node.children ?? []) {
          if (svc.kind === "service") {
            params.push({ hub: String(hub.slug), service: String(svc.slug) });
          }
        }
      }
    }
  }

  return params;
}

/** All subservice params (excludes reserved slugs like "packages") */
export function getAllSubServiceParams(): Array<{ hub: string; service: string; sub: string }> {
  const params: Array<{ hub: string; service: string; sub: string }> = [];

  for (const hub of servicesTree.children ?? []) {
    for (const node of hub.children ?? []) {
      // Gather service nodes whether direct or inside a subhub
      const serviceNodes =
        node.kind === "service"
          ? [node]
          : node.kind === "subhub"
          ? ((node.children ?? []).filter((c) => c.kind === "service") as AnyServiceNode[])
          : [];

      for (const svc of serviceNodes) {
        for (const sub of svc.children ?? []) {
          if (sub.kind === "subservice" && !RESERVED_SUB_SLUGS.has(String(sub.slug))) {
            params.push({
              hub: String(hub.slug),
              service: String(svc.slug),
              sub: String(sub.slug),
            });
          }
        }
      }
    }
  }

  return params;
}

/* ================================================================
 * Validation & Development Helpers - Updated for canonical structure
 * ================================================================ */

export function validateTaxonomy(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate canonical hub structure
  const canonicalHubValidation = validateCanonicalHubStructure();
  errors.push(...canonicalHubValidation.errors);

  // Validate marketing services specifically
  const marketingValidation = validateMarketingServicesTaxonomy();
  errors.push(...marketingValidation.errors);

  function validateNode(node: AnyServiceNode, path: string[] = []): void {
    const currentPath = [...path, node.slug].join("/");

    // Required fields
    if (!node.id) errors.push(`Missing id: ${currentPath}`);
    if (!node.title) errors.push(`Missing title: ${currentPath}`);
    if (!node.slug) errors.push(`Missing slug: ${currentPath}`);
    if (!node.kind) errors.push(`Missing kind: ${currentPath}`);

    // Kind sanity
    if (!["hub", "subhub", "service", "subservice"].includes(node.kind)) {
      errors.push(`Invalid kind "${node.kind}": ${currentPath}`);
    }

    // ❗ reserved sub-service slug to avoid collision with /packages route
    if (node.kind === "subservice" && RESERVED_SUB_SLUGS.has(String(node.slug))) {
      errors.push(
        `Reserved sub-service slug "${node.slug}" at ${currentPath}. Use a different slug.`
      );
    }

    // Recurse
    if (node.children) {
      for (const child of node.children as AnyServiceNode[]) {
        validateNode(child, [...path, node.slug]);
      }
    }
  }

  validateNode(servicesTree as AnyServiceNode);
  return { isValid: errors.length === 0, errors };
}

export function validateCanonicalHubStructure(): { isValid: boolean; errors: string[]; missing: string[] } {
  const errors: string[] = [];
  const requiredHubs = Array.from(CANONICAL_HUBS);
  
  const existingHubs = getAllHubs();
  const existingSlugs = existingHubs.map(h => h.slug);
  const missing = requiredHubs.filter(slug => !existingSlugs.includes(slug));
  
  if (missing.length > 0) {
    errors.push(`Missing required canonical hubs: ${missing.join(", ")}`);
  }
  
  return { isValid: errors.length === 0, errors, missing };
}

/** Debug helper (dev only) */
export function debugTaxonomy(): void {
  if (process.env.NODE_ENV !== "development") return;

  const validation = validateTaxonomy();
  const canonicalValidation = validateCanonicalHubStructure();
  const marketingValidation = validateMarketingServicesTaxonomy();

  console.group("[Taxonomy] Debug Info");
  console.log("Root:", servicesTree);
  console.log("Validation:", validation);
  console.log("Canonical Hubs:", canonicalValidation);
  console.log("Marketing Services:", marketingValidation);
  console.log("Total nodes:", countAllNodes());
  console.log("Hubs:", getAllHubs().length);
  console.log("SubHubs:", getAllSubHubs().length);
  console.log("All Services:", getNodesByKind("service").length);
  console.log("All SubServices:", getNodesByKind("subservice").length);
  console.groupEnd();
}

/** Count total nodes for stats */
function countAllNodes(): number {
  let count = 0;
  const stack: AnyServiceNode[] = [servicesTree as AnyServiceNode];

  while (stack.length > 0) {
    const node = stack.pop()!;
    count++;
    const children = (node.children ?? []) as AnyServiceNode[];
    stack.push(...children);
  }

  return count;
}

/** Public stats */
export function getTaxonomyStats(): {
  totalNodes: number;
  hubs: number;
  subHubs: number;
  services: number;
  subServices: number;
  canonicalHubs: string[];
  marketingServices: number;
} {
  const marketingServices = getMarketingServices();
  
  return {
    totalNodes: countAllNodes(),
    hubs: getAllHubs().length,
    subHubs: getAllSubHubs().length,
    services: getNodesByKind("service").length,
    subServices: getNodesByKind("subservice").length,
    canonicalHubs: getCanonicalHubs(),
    marketingServices: marketingServices.length,
  };
}

/* ================================================================
 * Exports
 * ================================================================ */

export type { AnyServiceNode };