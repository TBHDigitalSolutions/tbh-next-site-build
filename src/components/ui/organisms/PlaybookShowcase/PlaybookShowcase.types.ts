// src/components/ui/organisms/PlaybookShowcase/PlaybookShowcase.types.ts

/**
 * Type definitions for PlaybookShowcase organism
 * Used for displaying resource playbooks and guides in service sections
 */

export interface PlaybookItem {
  /** Unique identifier */
  id: string;
  /** Playbook title */
  title: string;
  /** Brief description */
  description: string;
  /** Category/topic area */
  category: string;
  /** Difficulty level */
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  /** Tags for filtering */
  tags?: string[];
  /** Steps or sections within the playbook */
  steps?: Array<{ id: string; title: string; description?: string }>;
  /** Key metrics or outcomes */
  metrics?: Record<string, string>;
  /** Thumbnail/cover image */
  cover?: string;
  /** Link to full playbook */
  href?: string;
  /** Download URL if different from href */
  downloadUrl?: string;
  /** Estimated read time */
  readTime?: string;
  /** Whether this is featured content */
  featured?: boolean;
  /** File type if downloadable */
  fileType?: 'pdf' | 'doc' | 'guide' | 'checklist';
  /** Download size if applicable */
  fileSize?: string;
}

export type PlaybookDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface PlaybookCategory {
  /** Category identifier */
  id: string;
  /** Display name */
  name: string;
  /** Category description */
  description?: string;
  /** Number of playbooks */
  count: number;
}

export interface PlaybookShowcaseProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Playbook items to display */
  playbooks: PlaybookItem[];
  /** Available categories (derived from playbooks if not provided) */
  categories?: string[];
  /** Available difficulty levels (derived from playbooks if not provided) */
  difficulties?: PlaybookDifficulty[];
  /** Default category filter */
  defaultCategory?: string;
  /** Default difficulty filter */
  defaultDifficulty?: PlaybookDifficulty;
  /** Card display variant */
  cardVariant?: "compact" | "detailed";
  /** Grid columns */
  columns?: 2 | 3 | 4;
  /** Additional CSS classes */
  className?: string;
  /** Maximum items to display */
  maxItems?: number;
  /** Enable featured playbook highlighting */
  showFeatured?: boolean;
  /** Call-to-action configuration */
  cta?: {
    label: string;
    href: string;
  };
  /** Event handlers */
  onDownload?: (playbook: PlaybookItem) => void;
  onPreview?: (playbook: PlaybookItem) => void;
  onClick?: (playbook: PlaybookItem) => void;
}

// Service page integration types
export type PlaybookInput = 
  | PlaybookItem[]
  | { playbooks?: PlaybookItem[] }
  | { resources?: PlaybookItem[] }
  | { guides?: PlaybookItem[] }
  | null
  | undefined;

export interface PlaybookSection {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Playbook data */
  data: PlaybookInput;
  /** Display configuration */
  cardVariant?: PlaybookShowcaseProps['cardVariant'];
  columns?: PlaybookShowcaseProps['columns'];
  showFeatured?: boolean;
  maxItems?: number;
  defaultCategory?: string;
  defaultDifficulty?: PlaybookDifficulty;
}

// Service-specific playbook sections
export type WebDevPlaybookSection = PlaybookSection;
export type VideoPlaybookSection = PlaybookSection;
export type MarketingPlaybookSection = PlaybookSection;
export type SEOPlaybookSection = PlaybookSection;
export type LeadGenPlaybookSection = PlaybookSection;
export type ContentPlaybookSection = PlaybookSection;