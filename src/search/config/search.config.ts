// ===================================================================
// /src/search/config/search.config.ts
// ===================================================================
// Production-ready search configuration for TBH Digital Solutions

import type { SearchType } from '../core/types';

/**
 * Core search engine configuration
 */
export const SEARCH_CONFIG = {
  // ===============================
  // INDEXING CONFIGURATION
  // ===============================
  
  // Fields to index for full-text search (searchable)
  indexFields: [
    "title",           // Primary content title
    "summary",         // Description/excerpt
    "tags",            // Keywords and categories
    "serviceKey",      // Service area (video, web, seo, etc.)
    "category",        // Content category
    "hub",             // Parent service hub
    "meta.keywords",   // Additional SEO keywords
    "meta.excerpt"     // Short description variants
  ] as const,
  
  // Fields to store for result display (retrievable)
  storeFields: [
    "id",              // Unique identifier
    "type",            // Content type (hub, service, portfolio, etc.)
    "title",           // Display title
    "summary",         // Display description
    "path",            // Navigation URL
    "serviceKey",      // Service area filter
    "category",        // Category filter
    "hub",             // Parent hub
    "tags",            // Display tags
    "date",            // Publish/update date
    "weight",          // Ranking weight
    "featured",        // Featured flag
    "meta"             // Additional metadata
  ] as const,

  // ===============================
  // RELEVANCE BOOSTING
  // ===============================
  
  // Field-level relevance boosts
  boost: {
    title: 3.0,        // Title matches are most important
    "meta.keywords": 2.5, // SEO keywords are highly relevant
    serviceKey: 2.0,   // Service area matching
    tags: 1.8,         // Tag matching
    summary: 1.2,      // Description relevance
    category: 1.5,     // Category relevance
    hub: 1.3,          // Hub association
    "meta.excerpt": 1.0 // Additional descriptions
  },

  // ===============================
  // SEARCH BEHAVIOR
  // ===============================
  
  fuzzy: 0.2,          // Typo tolerance (0.0 = exact, 1.0 = very fuzzy)
  prefix: true,        // Enable partial word matching
  limit: 50,           // Maximum results per query
  minQueryLength: 2,   // Minimum characters before searching
  
  // Auto-suggest configuration
  suggestions: {
    enabled: true,
    minLength: 3,      // Minimum chars for suggestions
    maxSuggestions: 8  // Max suggestions to show
  },

  // ===============================
  // FEATURE FLAGS
  // ===============================
  
  features: {
    USE_API: false,           // Phase 1: client-side search
    ENABLE_ANALYTICS: true,   // Track search queries and clicks
    HIGHLIGHT_TERMS: true,    // Highlight matched terms in results
    KEYBOARD_NAV: true,       // Arrow key navigation
    INFINITE_SCROLL: false,   // Load more results on scroll
    VOICE_SEARCH: false,      // Speech-to-text input
    SEARCH_HISTORY: true,     // Remember recent searches
    AUTO_COMPLETE: true,      // Show query completions
    SPELL_CHECK: true,        // Suggest spelling corrections
    FACETED_SEARCH: true      // Multiple filter categories
  },

  // ===============================
  // PERFORMANCE SETTINGS
  // ===============================
  
  performance: {
    debounceMs: 200,          // Input debounce delay
    cacheResults: true,       // Cache search results
    cacheTtlMs: 300000,       // Cache TTL (5 minutes)
    maxCacheSize: 100,        // Max cached queries
    lazyLoad: true,           // Lazy load search index
    preload: ['hub', 'package'] // Preload high-priority types
  }
} as const;

/**
 * Content type weights for ranking
 * Higher values = better ranking position
 */
export const CONTENT_WEIGHTS: Record<SearchType | string, number> = {
  // ===============================
  // CORE CONTENT TYPES
  // ===============================
  
  // Services hierarchy (high business value)
  hub: 4.0,              // L1: Video Production, Web Development
  service: 3.0,          // L2: Applications, Ecommerce, Website
  subservice: 2.0,       // L3: API, Auth, Dashboards
  
  // Business conversion content
  package: 5.0,          // Growth packages (highest intent)
  "case-study": 3.5,     // Social proof content
  
  // Portfolio and showcases
  portfolio: 2.5,        // Project showcases
  
  // Supporting content
  content: 1.5,          // Blog posts, resources
  tool: 2.0,             // Interactive tools
  page: 1.0,             // Static pages
  
  // ===============================
  // QUALITY MODIFIERS
  // ===============================
  
  // Content quality boosts
  featured: 2.0,         // Featured content
  recent: 1.5,           // Published within 30 days
  popular: 1.3,          // High engagement content
  premium: 1.8,          // Premium/paid content
  
  // Recency decay factors
  fresh: 1.5,            // < 7 days old
  current: 1.2,          // < 30 days old
  relevant: 1.0,         // < 90 days old
  archived: 0.8          // > 90 days old
};

/**
 * Service area weights for contextual search
 */
export const SERVICE_WEIGHTS: Record<string, number> = {
  "video": 1.0,          // Video production services
  "web": 1.2,            // Web development (high demand)
  "seo": 1.1,            // SEO services
  "marketing": 1.0,      // Marketing automation
  "content": 0.9,        // Content production
  "leadgen": 1.1,        // Lead generation
  "design": 0.8,         // Design services
  "consulting": 0.7      // Consulting services
};

/**
 * Search result limits by context
 */
export const RESULT_LIMITS = {
  global: 50,            // Global search max results
  scoped: 30,            // Page-scoped search
  suggestions: 8,        // Auto-suggest results
  recent: 5,             // Recent searches to show
  related: 6             // Related content suggestions
} as const;

/**
 * Analytics event configuration
 */
export const ANALYTICS_CONFIG = {
  enabled: SEARCH_CONFIG.features.ENABLE_ANALYTICS,
  
  // Events to track
  events: {
    SEARCH_QUERY: 'search_query',
    RESULT_CLICK: 'search_result_click',
    NO_RESULTS: 'search_no_results',
    FILTER_APPLIED: 'search_filter_applied',
    SUGGESTION_CLICK: 'search_suggestion_click'
  },
  
  // Data to capture
  trackData: {
    query: true,           // Search query text
    resultCount: true,     // Number of results
    clickPosition: true,   // Position of clicked result
    filters: true,         // Applied filters
    sessionId: true,       // User session
    timestamp: true        // Query timestamp
  }
} as const;

/**
 * UI display configuration
 */
export const UI_CONFIG = {
  // Result card display
  resultCard: {
    showThumbnail: true,
    showDate: true,
    showTags: true,
    showType: true,
    maxTitleLength: 60,
    maxSummaryLength: 150,
    maxTagsShown: 3
  },
  
  // Filter display
  filters: {
    showTypeFilter: true,
    showServiceFilter: true,
    showDateFilter: true,
    showFeaturedOnly: true,
    collapsible: true
  },
  
  // Search input
  input: {
    placeholder: "Search services, portfolio, packages...",
    showClearButton: true,
    showSearchIcon: true,
    showLoadingIndicator: true
  }
} as const;

/**
 * Type guards and validation
 */
export const isValidSearchType = (type: string): type is SearchType => {
  const validTypes: SearchType[] = [
    'hub', 'service', 'subservice', 
    'portfolio', 'package', 'case-study', 
    'content', 'tool'
  ];
  return validTypes.includes(type as SearchType);
};

export const isValidServiceKey = (key: string): boolean => {
  const validKeys = Object.keys(SERVICE_WEIGHTS);
  return validKeys.includes(key);
};

/**
 * Environment-specific overrides
 */
export const getEnvironmentConfig = () => {
  const isDev = process.env.NODE_ENV === 'development';
  const isProd = process.env.NODE_ENV === 'production';
  
  return {
    ...SEARCH_CONFIG,
    features: {
      ...SEARCH_CONFIG.features,
      // Enable API in production if environment variable is set
      USE_API: isProd && process.env.NEXT_PUBLIC_SEARCH_API === 'true',
      // Disable analytics in development
      ENABLE_ANALYTICS: isProd && SEARCH_CONFIG.features.ENABLE_ANALYTICS,
      // Enable debug logging in development
      DEBUG_LOGGING: isDev
    },
    performance: {
      ...SEARCH_CONFIG.performance,
      // Faster debounce in development
      debounceMs: isDev ? 100 : SEARCH_CONFIG.performance.debounceMs,
      // Shorter cache in development
      cacheTtlMs: isDev ? 60000 : SEARCH_CONFIG.performance.cacheTtlMs
    }
  };
};

// ===================================================================
// /src/search/config/synonyms.ts
// ===================================================================
// Business-specific synonyms and terminology mappings

/**
 * Synonym mappings for business terminology
 * Key: canonical term, Value: array of alternative terms
 */
export const BUSINESS_SYNONYMS: Record<string, string[]> = {
  // ===============================
  // WEB DEVELOPMENT TERMS
  // ===============================
  "web development": [
    "web dev", "website development", "web design",
    "website design", "site development", "web programming",
    "frontend development", "backend development", "full stack"
  ],
  
  "application": [
    "app", "web app", "software", "platform", 
    "system", "solution", "portal", "dashboard"
  ],
  
  "ecommerce": [
    "e-commerce", "online store", "web store", "shopping cart",
    "retail platform", "online shop", "commerce site"
  ],
  
  "api": [
    "application programming interface", "web service",
    "endpoint", "integration", "web api", "rest api"
  ],
  
  "database": [
    "db", "data storage", "data model", "backend",
    "server", "cloud storage", "data management"
  ],

  // ===============================
  // VIDEO PRODUCTION TERMS
  // ===============================
  "video production": [
    "video", "film production", "video creation",
    "cinematography", "video marketing", "brand video"
  ],
  
  "brand film": [
    "brand video", "company video", "corporate video",
    "promotional video", "marketing video", "brand story"
  ],
  
  "animation": [
    "motion graphics", "animated video", "2d animation",
    "3d animation", "explainer video", "animated content"
  ],
  
  "post production": [
    "post-production", "editing", "video editing",
    "color grading", "audio mixing", "visual effects"
  ],

  // ===============================
  // SEO & MARKETING TERMS
  // ===============================
  "seo": [
    "search engine optimization", "search optimization",
    "organic search", "google ranking", "search ranking",
    "search visibility", "organic traffic"
  ],
  
  "keyword research": [
    "keyword analysis", "search term research",
    "keyword planning", "search research", "keyword strategy"
  ],
  
  "content marketing": [
    "content strategy", "content creation", "blog writing",
    "thought leadership", "content production", "editorial"
  ],
  
  "lead generation": [
    "lead gen", "b2b leads", "prospect generation",
    "customer acquisition", "sales leads", "pipeline"
  ],
  
  "marketing automation": [
    "automation", "email automation", "workflow automation",
    "drip campaigns", "nurture sequences", "marketing workflows"
  ],

  // ===============================
  // BUSINESS TERMS
  // ===============================
  "growth package": [
    "growth bundle", "service package", "business package",
    "marketing package", "digital package", "service bundle"
  ],
  
  "case study": [
    "success story", "client story", "project showcase",
    "customer success", "portfolio piece", "case example"
  ],
  
  "consultation": [
    "consulting", "advisory", "strategy session",
    "discovery call", "planning session", "audit"
  ],
  
  "strategy": [
    "strategic planning", "business strategy", "growth strategy",
    "marketing strategy", "digital strategy", "planning"
  ],

  // ===============================
  // TECHNOLOGY TERMS
  // ===============================
  "cms": [
    "content management system", "content management",
    "website management", "content platform"
  ],
  
  "crm": [
    "customer relationship management", "customer management",
    "sales management", "contact management"
  ],
  
  "analytics": [
    "data analytics", "web analytics", "performance tracking",
    "metrics", "reporting", "data analysis", "insights"
  ],
  
  "integration": [
    "system integration", "third party integration",
    "api integration", "platform connection", "workflow integration"
  ],

  // ===============================
  // INDUSTRY TERMS
  // ===============================
  "b2b": [
    "business to business", "business-to-business",
    "enterprise", "commercial", "corporate"
  ],
  
  "saas": [
    "software as a service", "cloud software",
    "subscription software", "web software"
  ],
  
  "startup": [
    "new business", "entrepreneur", "early stage",
    "emerging company", "venture"
  ],
  
  "enterprise": [
    "large business", "corporation", "big company",
    "corporate", "organization"
  ]
};

/**
 * Service-specific keyword mappings
 */
export const SERVICE_KEYWORDS: Record<string, string[]> = {
  "video": [
    "video production", "film", "cinematography", "animation",
    "brand video", "promotional video", "marketing video",
    "explainer video", "product video", "testimonial video"
  ],
  
  "web": [
    "web development", "website", "web design", "application",
    "ecommerce", "online store", "web app", "portal",
    "responsive design", "mobile optimization"
  ],
  
  "seo": [
    "search engine optimization", "organic search", "ranking",
    "keyword research", "content optimization", "technical seo",
    "local seo", "link building", "search visibility"
  ],
  
  "marketing": [
    "digital marketing", "marketing automation", "email marketing",
    "lead generation", "conversion optimization", "analytics",
    "campaign management", "marketing strategy"
  ],
  
  "content": [
    "content marketing", "content creation", "blog writing",
    "copywriting", "content strategy", "editorial",
    "thought leadership", "brand messaging"
  ],
  
  "leadgen": [
    "lead generation", "prospect generation", "b2b leads",
    "sales leads", "lead qualification", "lead nurturing",
    "conversion optimization", "landing pages"
  ]
};

/**
 * Common misspellings and variations
 */
export const SPELLING_CORRECTIONS: Record<string, string> = {
  // Common business term misspellings
  "websight": "website",
  "webdev": "web development",
  "ecomerce": "ecommerce",
  "leadgen": "lead generation",
  "automaion": "automation",
  "analtyics": "analytics",
  
  // Technology misspellings
  "databse": "database",
  "intergration": "integration",
  "optmization": "optimization",
  "responive": "responsive",
  
  // Service misspellings
  "video prodution": "video production",
  "markting": "marketing",
  "consultng": "consulting"
};

/**
 * Contextual synonyms based on search context
 */
export const CONTEXTUAL_SYNONYMS: Record<string, Record<string, string[]>> = {
  "portfolio": {
    "project": ["case study", "work sample", "example", "showcase"],
    "client": ["customer", "business", "company", "brand"]
  },
  
  "services": {
    "solution": ["service", "offering", "capability", "expertise"],
    "process": ["workflow", "methodology", "approach", "strategy"]
  },
  
  "packages": {
    "bundle": ["package", "plan", "offering", "solution"],
    "pricing": ["cost", "investment", "rate", "fee"]
  }
};

/**
 * Utility functions for synonym processing
 */
export class SynonymProcessor {
  private static synonymMap: Map<string, Set<string>> = new Map();
  
  static {
    // Build reverse mapping for efficient lookup
    this.buildSynonymMap();
  }
  
  private static buildSynonymMap(): void {
    Object.entries(BUSINESS_SYNONYMS).forEach(([canonical, synonyms]) => {
      // Add canonical term
      const allTerms = new Set([canonical, ...synonyms]);
      
      // Map each term to all related terms
      allTerms.forEach(term => {
        this.synonymMap.set(term.toLowerCase(), allTerms);
      });
    });
  }
  
  /**
   * Get all synonyms for a given term
   */
  static getSynonyms(term: string): string[] {
    const synonyms = this.synonymMap.get(term.toLowerCase());
    return synonyms ? Array.from(synonyms) : [term];
  }
  
  /**
   * Expand a query with synonyms
   */
  static expandQuery(query: string): string {
    const words = query.toLowerCase().split(/\s+/);
    const expandedWords = new Set<string>();
    
    words.forEach(word => {
      const synonyms = this.getSynonyms(word);
      synonyms.forEach(synonym => expandedWords.add(synonym));
    });
    
    return Array.from(expandedWords).join(" ");
  }
  
  /**
   * Apply spelling corrections
   */
  static correctSpelling(query: string): string {
    let corrected = query.toLowerCase();
    
    Object.entries(SPELLING_CORRECTIONS).forEach(([wrong, right]) => {
      corrected = corrected.replace(new RegExp(wrong, 'gi'), right);
    });
    
    return corrected;
  }
  
  /**
   * Get service-specific keywords
   */
  static getServiceKeywords(serviceKey: string): string[] {
    return SERVICE_KEYWORDS[serviceKey] || [];
  }
  
  /**
   * Get contextual synonyms
   */
  static getContextualSynonyms(
    context: keyof typeof CONTEXTUAL_SYNONYMS,
    term: string
  ): string[] {
    const contextMap = CONTEXTUAL_SYNONYMS[context];
    return contextMap?.[term.toLowerCase()] || [term];
  }
}

/**
 * Export for easy importing
 */
export default {
  BUSINESS_SYNONYMS,
  SERVICE_KEYWORDS,
  SPELLING_CORRECTIONS,
  CONTEXTUAL_SYNONYMS,
  SynonymProcessor
};