// src/booking/sections/BookingFAQSection/BookingFAQSection.types.ts
// Types for the Booking FAQ Section (production-ready)

import type { CanonicalService, BookingProvider } from "../../lib/types";

/**
 * A single FAQ entry.
 * Supports rich content, links, categories, helpfulness, and provider/service scoping.
 */
export interface BookingFAQItem {
  /** Unique, stable id used for keys/anchor links/analytics */
  id: string;
  /** Question text (plain string shown in the accordion button / summary) */
  question: string;
  /** Answer as plain string OR pre-rendered React node for richer content */
  answer: string | React.ReactNode;
  /** Optional short blurb shown in lists/search results */
  excerpt?: string;
  /** Optional tags used for filtering and search ranking */
  tags?: string[];
  /** Optional category to group this item in the UI */
  category?: string;
  /** Optional ordering within its category or the whole list */
  order?: number;
  /** Optional deep link to canonical resource (docs, policy, ToS, etc.) */
  canonicalUrl?: string;

  /** Scope the FAQ to a specific service (e.g., "web-development-services") */
  service?: CanonicalService;
  /** Scope the FAQ to a specific booking provider if answer varies */
  provider?: BookingProvider;

  /** Whether this item should render expanded by default */
  defaultExpanded?: boolean;

  /** Optional schema.org microdata override for this FAQ item */
  schemaOrg?: {
    /** Override the top-level type (defaults to "Question" with "acceptedAnswer") */
    type?: "Question";
    /** Additional microdata key/values for advanced SEO setups */
    meta?: Record<string, string>;
  };

  /** Optional metadata for experimentation and analytics dimensions */
  meta?: Record<string, string | number | boolean>;
}

/**
 * Display and UX preferences for the FAQ section.
 */
export interface BookingFAQDisplay {
  /** Render as accordion (expand/collapse). Defaults to true. */
  accordion?: boolean;
  /** Allow more than one item to be expanded at the same time. Defaults to true. */
  allowMultipleOpen?: boolean;
  /** Show a search input that filters questions and tags. Defaults to true. */
  showSearch?: boolean;
  /** Show category tabs/chips. Defaults to true if there are categories. */
  showCategories?: boolean;
  /** Text for the search input placeholder. */
  searchPlaceholder?: string;
  /** Max items to display initially before "Show more" control appears. */
  initialVisibleCount?: number;
  /** Accessible label for the FAQ region landmark */
  ariaLabel?: string;
  /** Heading text shown above the FAQ list; omit to hide the heading */
  heading?: string | React.ReactNode;
  /** Subheading/description rendered under the heading */
  subheading?: string | React.ReactNode;
}

/**
 * Theming options for the FAQ section.
 * Uses semantic tokens to map onto your design system (CSS variables or Tailwind theme).
 */
export interface BookingFAQTheme {
  /** Accent color for highlights (chips, focus rings, active borders) */
  accentColor?: string;
  /** Background color for containers/cards */
  backgroundColor?: string;
  /** Text color for headings and primary content */
  textColor?: string;
  /** Border color for cards and dividers */
  borderColor?: string;
  /** Radius token for containers and chips */
  borderRadius?: string;
  /** Font families for heading/body if needed */
  fontFamilyHeading?: string;
  fontFamilyBody?: string;
}

/**
 * Analytics payload fired from the FAQ section.
 */
export interface BookingFAQAnalyticsEvent {
  /** Name of the event (e.g., "faq_view", "faq_toggle", "faq_search", "faq_vote") */
  event: "faq_view" | "faq_toggle" | "faq_search" | "faq_vote" | "faq_link_click";
  /** Arbitrary properties bag for your analytics pipeline */
  properties: Record<string, string | number | boolean | null | undefined>;
}

/**
 * Voting result for "Was this helpful?"
 */
export type HelpfulnessVote = "up" | "down";

/**
 * Sorting options applied to filtered FAQs.
 */
export type BookingFAQSort =
  | "default" // keep provided order or category order
  | "alphabetical"
  | "relevance"; // based on search match score (if component implements scoring)

/**
 * Programmatic controls exposed by the section (if used with refs).
 */
export interface BookingFAQSectionRef {
  /** Imperatively focus the search input (if present) */
  focusSearch: () => void;
  /** Clear search query and reset filters */
  resetFilters: () => void;
  /** Expand all items (if accordion and allowMultipleOpen) */
  expandAll: () => void;
  /** Collapse all items (if accordion) */
  collapseAll: () => void;
}

/**
 * Props for the Booking FAQ Section component.
 */
export interface BookingFAQSectionProps {
  /** List of FAQ items to render */
  items: BookingFAQItem[];

  /** Optional list of category order; items with unknown categories appear last */
  categoryOrder?: string[];

  /** Display preferences (accordion, search, chips, etc.) */
  display?: BookingFAQDisplay;

  /** Theming tokens for style systems */
  theme?: BookingFAQTheme;

  /** Initial search query applied on mount (useful for deep links) */
  initialQuery?: string;

  /** Initial selected category; must match one of the FAQ item categories */
  initialCategory?: string;

  /** Filter by service and/or provider at render-time */
  filterBy?: {
    service?: CanonicalService;
    provider?: BookingProvider;
    tags?: string[];
  };

  /** Sorting to apply after filtering (default: "default") */
  sort?: BookingFAQSort;

  /** Enable "Was this helpful?" voting UI */
  enableVoting?: boolean;

  /** Whether to render schema.org FAQPage structured data */
  enableStructuredData?: boolean;

  /** Optional maximum height for the list with internal scrolling */
  maxHeight?: number | string;

  /** Extra CSS class for the root container */
  className?: string;

  /** Callback fired when a user toggles an item (open/close) */
  onToggleItem?: (payload: { id: string; open: boolean; index: number }) => void;

  /** Callback fired when a user searches; provides the raw query string */
  onSearch?: (payload: { query: string }) => void;

  /** Callback fired when a category is selected/changed */
  onCategoryChange?: (payload: { category?: string }) => void;

  /** Callback fired when a user votes on helpfulness */
  onVote?: (payload: { id: string; vote: HelpfulnessVote }) => void;

  /** Callback fired when a link inside an answer is clicked (if instrumented) */
  onAnswerLinkClick?: (payload: { id: string; href: string }) => void;

  /** Analytics hook; invoked for all user-visible events originating from this section */
  onTrack?: (event: BookingFAQAnalyticsEvent) => void;

  /** Ref handle for imperative methods (optional) */
  innerRef?: React.Ref<BookingFAQSectionRef>;
}

/**
 * Internal component state (exported for testing and advanced composition).
 */
export interface BookingFAQSectionState {
  /** Current free-text search query */
  query: string;
  /** Active category filter (if any) */
  category?: string;
  /** Expanded/open state keyed by FAQ id */
  open: Record<string, boolean>;
  /** Computed, filtered list of items (post-search, post-category filter) */
  visibleItems: BookingFAQItem[];
  /** Whether the list is truncated by initialVisibleCount */
  truncated: boolean;
}

/**
 * Result object returned by the internal search/filter pipeline
 * (exported to facilitate unit tests of the filtering logic).
 */
export interface BookingFAQFilterResult {
  /** Final ordered items to render */
  items: BookingFAQItem[];
  /** Optional map of item -> relevance score (if using "relevance" sort) */
  scores?: Record<string, number>;
  /** Distinct categories present after filtering */
  categories: string[];
}
