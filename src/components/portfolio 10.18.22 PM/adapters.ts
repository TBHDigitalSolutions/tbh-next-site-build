// ===================================================================
// /src/components/portfolio/adapters.ts
// ===================================================================
// Orchestrator adapters for portfolio components.
//
// Goals:
// - Keep components presentational (no data imports).
// - Provide small, fast search for the hub, without pulling from src/data.
// - Use local component types/guards from ./types (not from src/data).
// ===================================================================

import {
  validateProjectsForComponent,
  isCategorySlug,
  type Project,
  type CategorySlug,
} from "./types";

import type {
  CategoryMeta,
  CategoryHighlight,
  PortfolioHubClientProps,
  HubSearchConfig,
  HubUIConfig,
} from "./PortfolioHubClient.types";

// -------------------------------
// Normalizers / Guards
// -------------------------------

/**
 * Create a CategoryMeta from arbitrary input (tolerant).
 * Validation is intentionally lightweight here; heavy validation belongs in data layer.
 */
export function toCategoryMeta(raw: any): CategoryMeta {
  const slug: CategorySlug = isCategorySlug(raw?.slug) ? raw.slug : "web-development";
  const title: string = typeof raw?.title === "string" && raw.title.trim()
    ? raw.title.trim()
    : slugToTitle(slug);
  const description: string | undefined =
    typeof raw?.description === "string" ? raw.description : undefined;

  return { slug, title, description };
}

/**
 * Create a CategoryHighlight from raw section input.
 */
export function toCategoryHighlight(raw: any, limit?: number): CategoryHighlight {
  const category = toCategoryMeta(raw?.category ?? raw);
  const itemsRaw: unknown[] = Array.isArray(raw?.highlights)
    ? raw.highlights
    : Array.isArray(raw?.items)
    ? raw.items
    : [];

  const items: Project[] = validateProjectsForComponent(itemsRaw);
  const highlights = typeof limit === "number" ? items.slice(0, Math.max(0, limit)) : items;

  return { category, highlights };
}

/**
 * Build many category highlights at once.
 */
export function buildCategoryHighlights(
  sections: any[],
  opts?: { perCategoryLimit?: number }
): CategoryHighlight[] {
  const limit = opts?.perCategoryLimit;
  return (sections || []).map((s) => toCategoryHighlight(s, limit));
}

// -------------------------------
// Search (tiny, UI-only; not data-layer)
// -------------------------------

/**
 * Case-insensitive includes.
 */
const icIncludes = (haystack: string | undefined, needle: string) =>
  !!haystack && haystack.toLowerCase().includes(needle);

/**
 * A fast, permissive global search over a Project[].
 * - title, description, client
 * - tags[] (any)
 * - media.type
 */
export function performGlobalSearch(
  items: Project[],
  query: string,
  cfg?: HubSearchConfig
): Project[] {
  const q = (query || "").trim().toLowerCase();
  const minChars = cfg?.minChars ?? 1;
  if (q.length < minChars) return [];

  const results = (items || []).filter((p) => {
    if (icIncludes(p.title, q)) return true;
    if (icIncludes(p.description, q)) return true;
    if (icIncludes(p.client, q)) return true;
    if (Array.isArray(p.tags) && p.tags.some((t) => icIncludes(t, q))) return true;
    if (icIncludes(p.media?.type as string, q)) return true;
    return false;
  });

  const max = cfg?.maxResults;
  return typeof max === "number" && max > 0 ? results.slice(0, max) : results;
}

// -------------------------------
// Hub props assembler
// -------------------------------

/**
 * Assemble fully-typed props for PortfolioHubClient from page-layer data.
 * Use this in the page/template (not inside the component) so the component
 * stays presentational-only.
 */
export function makePortfolioHubClientProps(args: {
  allItems: unknown[];
  categorySections: any[]; // { category: { slug, title, description? }, highlights: Project[] } | compatible
  searchConfig?: HubSearchConfig;
  ui?: HubUIConfig;
  className?: string;
}): PortfolioHubClientProps {
  const allItems = validateProjectsForComponent(args.allItems || []);

  const categoryHighlights = buildCategoryHighlights(args.categorySections);

  return {
    allItems,
    categoryHighlights,
    searchConfig: args.searchConfig ?? {
      placeholder: "Try: ecommerce, product demo, local SEO, Shopify…",
      hint: "Start typing to search across all projects.",
      minChars: 1,
    },
    ui: {
      gridColumns: args.ui?.gridColumns ?? 3,
      showSearch: args.ui?.showSearch ?? true,
    },
    className: args.className ?? "",
  };
}

// -------------------------------
// Utils
// -------------------------------

function slugToTitle(slug: CategorySlug): string {
  // naive titleizer that respects your canonical slugs
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
