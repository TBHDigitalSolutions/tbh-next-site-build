// ===================================================================
// /src/search/core/types.ts
// ===================================================================
// Core type definitions for the search system

export type SearchType = 
  | "hub"           // L1: Video Production, Web Development
  | "service"       // L2: Applications, Ecommerce, Website
  | "subservice"    // L3: API, Auth, Dashboards
  | "portfolio"     // Project showcases
  | "package"       // Growth packages/bundles
  | "case-study"    // Client success stories
  | "content"       // Blog, resources
  | "tool";         // Interactive tools

export interface SearchDoc {
  id: string;                    // unique identifier
  type: SearchType;              // content type
  title: string;                 // primary display text
  summary?: string;              // description/excerpt
  path: string;                  // navigation URL
  serviceKey?: string;           // "video" | "web" | "seo" | "marketing" | "content" | "leadgen"
  hub?: string;                  // parent hub (for services)
  category?: string;             // portfolio category, package type
  tags?: string[];               // searchable keywords
  date?: string;                 // publish/update date (ISO format)
  weight?: number;               // ranking boost (0-10)
  featured?: boolean;            // priority flag
  meta?: Record<string, any>;    // additional context
}

export interface SearchFilters {
  types?: SearchType[];          // filter by content type
  serviceKey?: string;           // filter by service area
  category?: string;             // filter by category
  query?: string;                // search query
  featured?: boolean;            // show only featured content
  dateRange?: {                  // date filtering
    from?: string;
    to?: string;
  };
}

export interface SearchResult extends SearchDoc {
  score?: number;                // relevance score
  highlights?: {                 // highlighted text snippets
    title?: string;
    summary?: string;
    tags?: string[];
  };
  matchedTerms?: string[];       // terms that matched
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
  filters: SearchFilters;
  processingTime?: number;
  suggestions?: string[];
}

// Service key type guard
export const VALID_SERVICE_KEYS = [
  'video', 'web', 'seo', 'marketing', 'content', 'leadgen'
] as const;

export type ServiceKey = typeof VALID_SERVICE_KEYS[number];

export const isValidServiceKey = (key: string): key is ServiceKey => {
  return VALID_SERVICE_KEYS.includes(key as ServiceKey);
};

// Search type validation
export const VALID_SEARCH_TYPES: SearchType[] = [
  'hub', 'service', 'subservice', 
  'portfolio', 'package', 'case-study', 
  'content', 'tool'
];

export const isValidSearchType = (type: string): type is SearchType => {
  return VALID_SEARCH_TYPES.includes(type as SearchType);
};