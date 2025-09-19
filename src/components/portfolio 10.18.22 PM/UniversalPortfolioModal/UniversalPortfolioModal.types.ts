// ===================================================================
// /src/components/portfolio/UniversalPortfolioModal/UniversalPortfolioModal.types.ts
// ===================================================================

/**
 * Media types supported by the portfolio modal + media viewers.
 */
export type ModalMediaType = "image" | "video" | "interactive" | "pdf";

/**
 * Normalized media contract required by media viewers.
 */
export interface ModalMedia {
  type: ModalMediaType;
  src: string;
  poster?: string; // video poster
  alt?: string;    // image alt
}

/**
 * Metric displayed in the modal footer.
 */
export interface ModalMetric {
  label: string;
  value: string; // coerced to string in adapters/validator
}

/**
 * Domain-wide normalized project shape for the modal.
 * (Tolerant adapter maps arbitrary input to this.)
 */
export interface ModalProject {
  id: string;
  title: string;
  description?: string;
  client?: string;
  href?: string;
  tags?: string[];
  metrics?: ModalMetric[];
  media: ModalMedia;
}

/**
 * Props consumed by UniversalPortfolioModal.tsx.
 * (We keep this here so other files can import it without creating cycles.)
 */
export interface UniversalPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;

  project: ModalProject;

  index?: number;
  total?: number;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;

  onMediaLoad?: (project: ModalProject) => void;
  onMediaError?: (project: ModalProject, error: string) => void;
}
