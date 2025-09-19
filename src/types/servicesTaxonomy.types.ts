/**
 * servicesTaxonomy.types.ts
 * Site-wide taxonomy for Services hierarchy (Hub → SubHub → Service → SubService).
 * Includes light SEO + breadcrumb types and minimal runtime guards.
 */

import type { RoutePath, Slug, ServiceHeroData } from "./servicesTemplate.types";

/* ============================================================
 * Canonical Hub Slugs (Level 1)
 * ========================================================== */

/**
 * Known top-level HUB slugs used across the site.
 * (These must match your /services/[hub] routes exactly.)
 */
export type KnownHubSlug =
  | "web-development-services"
  | "video-production-services"
  | "seo-services"
  | "marketing-services"
  | "lead-generation-services"
  | "content-production-services";

/**
 * Accept known hub slugs or any future-typed hub slug (keeps union open).
 */
export type HubSlug = KnownHubSlug | (string & { readonly __brand?: "HubSlug" });

/**
 * Generic service-level slug (L2/L3). Keep flexible, but brand the type.
 * Use `Slug` from servicesTemplate.types if you prefer stricter control.
 */
export type ServiceSlug = Slug | (string & { readonly __brand?: "ServiceSlug" });

/* ============================================================
 * Base Node
 * ========================================================== */

export interface TaxonomyNodeBase {
  /** Stable id used for lookups (can mirror path or a UUID-like string) */
  id: string;

  /** Human-readable name for the node (cards, headings, etc.) */
  title: string;

  /** Route-friendly slug (for hubs use HubSlug; for others, ServiceSlug) */
  slug: HubSlug | ServiceSlug;

  /** Absolute route path for this node, e.g. `/services/web-development-services/applications` */
  path: RoutePath;

  /** Optional shorter label used in nav/breadcrumbs; falls back to `title` */
  label?: string;

  /** Each node corresponds to a page; carry simplified hero data */
  hero: ServiceHeroData;

  /** Optional short description for listing cards, sitemaps, etc. */
  summary?: string;

  /** Lightweight SEO/meta */
  seo?: {
    title?: string;
    description?: string;
    canonical?: RoutePath | string;
  };
}

/* ============================================================
 * Concrete Node Shapes
 * ========================================================== */

export interface HubNode extends TaxonomyNodeBase {
  kind: "hub";
  /** Hub slugs are the canonical L1 set */
  slug: HubSlug;
  children?: Array<SubHubNode | ServiceNode>;
}

export interface SubHubNode extends TaxonomyNodeBase {
  kind: "subhub";
  /** Parent is always a hub node id */
  parentId: HubNode["id"];
  /** Sub-hub slug is service-like (L2), not a hub slug */
  slug: ServiceSlug;
  children?: Array<ServiceNode | SubServiceNode>;
}

export interface ServiceNode extends TaxonomyNodeBase {
  kind: "service";
  /** Parent can be a hub (L1 → L2) or a sub-hub (L2A → L2B) */
  parentId: HubNode["id"] | SubHubNode["id"];
  slug: ServiceSlug;
  children?: Array<SubServiceNode>;
}

export interface SubServiceNode extends TaxonomyNodeBase {
  kind: "subservice";
  /** Parent can be a service or sub-hub depending on your tree */
  parentId: ServiceNode["id"] | SubHubNode["id"];
  slug: ServiceSlug;
}

/** Union for any node in the Services tree */
export type AnyServiceNode = HubNode | SubHubNode | ServiceNode | SubServiceNode;

/* ============================================================
 * Breadcrumbs & Navigation
 * ========================================================== */

export interface Crumb {
  title: string;
  path: RoutePath;
}

export type Breadcrumbs = Crumb[];

/* ============================================================
 * Type Guards
 * ========================================================== */

export const isHub = (n: AnyServiceNode): n is HubNode => n.kind === "hub";
export const isSubHub = (n: AnyServiceNode): n is SubHubNode => n.kind === "subhub";
export const isService = (n: AnyServiceNode): n is ServiceNode => n.kind === "service";
export const isSubService = (n: AnyServiceNode): n is SubServiceNode => n.kind === "subservice";

/** True if node has no children (leaf) */
export const isLeaf = (n: AnyServiceNode): boolean =>
  !("children" in n) || !Array.isArray((n as any).children) || (n as any).children.length === 0;

/* ============================================================
 * Minimal Runtime Guards (optional but handy)
 * ========================================================== */

export function hasHero(data: Partial<TaxonomyNodeBase>): data is Pick<TaxonomyNodeBase, "hero"> {
  return typeof data === "object" && data != null && typeof (data as any).hero === "object";
}

/**
 * Build breadcrumb array from ordered nodes, e.g. [hub, subhub, service, subservice]
 */
export function toBreadcrumbs(nodes: Array<Pick<TaxonomyNodeBase, "title" | "path">>): Breadcrumbs {
  return nodes.map(({ title, path }) => ({ title, path }));
}

/* ============================================================
 * Convenience Types
 * ========================================================== */

/** Discriminated union tags if you need to switch on node kind externally */
export type NodeKind = AnyServiceNode["kind"];

/** Map kinds to node interfaces (useful for generic helpers) */
export interface KindToNode {
  hub: HubNode;
  subhub: SubHubNode;
  service: ServiceNode;
  subservice: SubServiceNode;
}
