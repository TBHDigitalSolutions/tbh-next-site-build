// ===================================================================
// /src/components/portfolio/PortfolioHubClient.types.ts
// ===================================================================
// Authoring-friendly public props for PortfolioHubClient.
// NOTE: Import shared/presentational types from the local component
// types barrel to avoid components → data imports.
// ===================================================================

import type {
  Project,
  CategorySlug,
} from "./types";

// Category metadata shown in the hub sections header
export interface CategoryMeta {
  slug: CategorySlug;
  title: string;
  description?: string;
}

// A single category block on the hub, with featured/highlighted items
export interface CategoryHighlight {
  category: CategoryMeta;
  highlights: Project[];
}

// Optional UX config for the hub’s global search
export interface HubSearchConfig {
  placeholder?: string;
  hint?: string;
  minChars?: number;       // default 1
  maxResults?: number;     // default: unlimited
}

// Optional UI flags for the hub layout
export interface HubUIConfig {
  gridColumns?: 2 | 3 | 4; // default 3
  showSearch?: boolean;    // default true
}

// Optional analytics callback hooks
export interface HubAnalyticsHandlers {
  onViewAllClick?: (category: CategorySlug) => void;
  onItemOpen?: (payload: { category?: CategorySlug; projectId: string }) => void;
  onSearch?: (payload: { query: string; results: number }) => void;
}

// Final props consumed by PortfolioHubClient
export interface PortfolioHubClientProps extends Partial<HubAnalyticsHandlers> {
  /** All items (already selected by the page layer). */
  allItems: Project[];

  /** Category highlight sections to render. */
  categoryHighlights: CategoryHighlight[];

  /** Optional search & UI config. */
  searchConfig?: HubSearchConfig;
  ui?: HubUIConfig;

  /** Optional CSS class on the top-level hub wrapper (if used by parent). */
  className?: string;
}
