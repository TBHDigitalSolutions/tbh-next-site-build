// ===================================================================
// /src/components/portfolio/PortfolioModal/PortfolioModal.types.ts
// ===================================================================

/** Supported media kinds for the modal. */
export type PMediaType = "image" | "video" | "interactive" | "pdf";

/** Normalized media contract. */
export interface PMedia {
  type: PMediaType;
  src: string;
  poster?: string;  // for videos
  alt?: string;     // for images
  title?: string;   // for interactive frames, etc.
}

/** Metric shown in the footer. */
export interface PMetric {
  label: string;
  value: string; // always coerced to string by adapter/validator
}

/** Normalized project for this modal. */
export interface PortfolioModalProject {
  id: string;
  title: string;
  description?: string;
  client?: string;
  href?: string;
  tags?: string[];
  metrics?: PMetric[];
  media: PMedia;
}

/**
 * Presentational props consumed by PortfolioModal.tsx.
 * Matches your current component API to avoid refactors.
 */
export interface PortfolioModalProps {
  project: PortfolioModalProject;
  index?: number;
  total?: number;
  isOpen: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  className?: string;
}
