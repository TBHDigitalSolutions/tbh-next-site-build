// src/data/selectors.ts
import { portfolioSelectors } from "./portfolio";
import { packageSelectors } from "./packages";
import { caseStudySelectors } from "./caseStudies";
import { testimonialSelectors } from "./testimonials";
import { moduleSelectors } from "./modules";

/** Default result caps per content type */
const DEFAULTS = {
  portfolio: 3,
  packages: 3,
  caseStudies: 3,
  testimonials: 5,
  modules: 4,
} as const;

/** Narrowly typed options for all selectors */
export interface SelectorOptions {
  /** L1 hub slug (e.g., "web-development-services") */
  hub: string;
  /** L2 service slug (optional) */
  service?: string;
  /** L3 subservice slug (optional) */
  sub?: string;
  /** Max number of items to return */
  limit?: number;
  /** If supported, prefer featured content (true by default when applicable) */
  featured?: boolean;
}

/** Normalize a tag/slug for consistent matching */
function norm(v?: string): string | undefined {
  if (!v) return undefined;
  const s = String(v).trim();
  return s ? s.toLowerCase() : undefined;
}

/** Build tag array (hub → service → sub), removing empties and normalizing */
function makeTags({ hub, service, sub }: SelectorOptions): string[] {
  return [norm(hub), norm(service), norm(sub)].filter(Boolean) as string[];
}

/** Guard: require hub for all selectors */
function assertHub(opts: SelectorOptions): void {
  if (!norm(opts.hub)) {
    throw new Error("[selectors] `hub` is required");
  }
}

/**
 * Portfolio selector
 * - Returns featured items by default (if available), otherwise all.
 */
export function selectPortfolio(opts: SelectorOptions) {
  assertHub(opts);
  const tags = makeTags(opts);
  const limit = Number.isFinite(opts.limit) ? Number(opts.limit) : DEFAULTS.portfolio;
  const featured = opts.featured ?? true;
  return featured
    ? portfolioSelectors.getFeatured(tags, limit)
    : portfolioSelectors.getAll(tags, limit);
}

/**
 * Packages selector
 * - Returns featured packages by default (if available), otherwise all.
 */
export function selectPackages(opts: SelectorOptions) {
  assertHub(opts);
  const tags = makeTags(opts);
  const limit = Number.isFinite(opts.limit) ? Number(opts.limit) : DEFAULTS.packages;
  const featured = opts.featured ?? true;
  return featured
    ? packageSelectors.getFeatured(tags, limit)
    : packageSelectors.getAll(tags, limit);
}

/**
 * Case studies selector
 * - Always tag-scoped; no featured toggle supported here.
 */
export function selectCaseStudies(opts: SelectorOptions) {
  assertHub(opts);
  const tags = makeTags(opts);
  const limit = Number.isFinite(opts.limit) ? Number(opts.limit) : DEFAULTS.caseStudies;
  return caseStudySelectors.getByTags(tags, limit);
}

/**
 * Testimonials selector
 * - Tag-scoped; defaults to 5 items for social proof.
 */
export function selectTestimonials(opts: SelectorOptions) {
  assertHub(opts);
  const tags = makeTags(opts);
  const limit = Number.isFinite(opts.limit) ? Number(opts.limit) : DEFAULTS.testimonials;
  return testimonialSelectors.getByTags(tags, limit);
}

/**
 * Module carousel selector
 * - Supplies resources/tools/case studies rail for a given context.
 * - Note: Case studies for the rail are delivered via this module layer.
 */
export function selectModules(opts: SelectorOptions) {
  assertHub(opts);
  const hub = norm(opts.hub)!;
  const service = norm(opts.service);
  const sub = norm(opts.sub);
  const limit = Number.isFinite(opts.limit) ? Number(opts.limit) : DEFAULTS.modules;
  return moduleSelectors.getForContext(hub, service, sub, limit);
}
