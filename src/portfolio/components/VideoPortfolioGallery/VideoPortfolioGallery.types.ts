// src/components/ui/organisms/VideoPortfolioGallery/VideoPortfolioGallery.types.ts

/**
 * Type definitions for the VideoPortfolioGallery organism.
 * Refactored to remove search functionality and focus on video display.
 * Search is now handled by the global search system.
 */

export type VideoCTALink = {
  /** CTA button/anchor label shown on a card or in the lightbox */
  label: string;
  /** Destination (internal route or external URL) */
  href: string;
};

export interface VideoItem {
  /** MUST be unique per item to avoid React key warnings */
  id: string;
  /** Display title */
  title: string;
  /** Thumbnail image path or URL (used in the grid and as <video> poster) */
  thumbnail: string;

  /**
   * Primary video source:
   *  - For local playback use an MP4/WEBM that browsers can decode (H.264/AAC recommended).
   *  - Can also be a YouTube/Vimeo URL; the gallery/lightbox will normalize to an embed URL.
   */
  src: string;

  /**
   * Optional explicit embed URL (e.g., https://www.youtube.com/embed/ID
   * or https://player.vimeo.com/video/ID). If present, this takes precedence
   * over `src` for iframe playback.
   */
  embedUrl?: string;

  /** Optional metadata shown on the card and/or in the lightbox */
  duration?: string;       // e.g. "3:24"
  tags?: string[];         // used by global search
  client?: string;         // client / brand label
  description?: string;    // supporting copy
  cta?: VideoCTALink;      // deep link to case study, external page, etc.
  
  /** Extended properties to match portfolio data structure */
  category?: string;       // Category for additional filtering
  metrics?: Record<string, string | number | { label: string; value: string | number }>; // Performance metrics data
  featured?: boolean;      // Whether this is a featured video
}

/** How clicking a card should behave */
export type ClickBehavior = "lightbox" | "inline" | "newtab";

export interface VideoPortfolioGalleryProps {
  /** Section title (defaults to "Video Portfolio") */
  title?: string;
  /** Optional subtitle under the title */
  subtitle?: string;

  /** Pre-filtered items to render in the grid (filtering handled by parent) */
  items: VideoItem[];

  /** Number of columns in the grid (defaults to 3) */
  columns?: 1 | 2 | 3 | 4;

  /** Maximum number of items to display (for highlight sections) */
  maxItems?: number;

  /**
   * Built-in lightbox (modal) support.
   * - If you plan to manage your own modal externally, set this to false.
   * - Used only when `clickBehavior` is "lightbox".
   * (default: true)
   */
  lightbox?: boolean;

  /**
   * How clicking a card behaves:
   * - "lightbox": open the built-in modal player
   * - "inline":   swap the thumbnail for a player within the card
   * - "newtab":   open best playable URL in a new tab/window
   * (default: "lightbox")
   */
  clickBehavior?: ClickBehavior;

  /**
   * Target for "newtab" behavior.
   * (default: "_blank")
   */
  externalTarget?: "_blank" | "_self";

  /**
   * Optional click handler if you want to control playback outside the gallery.
   * If provided, the gallery will call this when a card is clicked.
   * Typically used when `lightbox` is false.
   */
  onItemClick?: (item: VideoItem, index: number) => void;

  /**
   * Optional modal open handler for analytics tracking
   */
  onModalOpen?: (item: VideoItem, index: number) => void;

  /** Extra className to pass to the section wrapper */
  className?: string;

  /** Variant for different display contexts */
  variant?: "default" | "grid" | "highlights";

  /** Show section header (title/subtitle) */
  showHeader?: boolean;

  /** Loading state */
  loading?: boolean;

  /** Empty state message */
  emptyMessage?: string;
}