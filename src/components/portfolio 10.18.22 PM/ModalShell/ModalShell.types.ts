// ===================================================================
// /src/components/portfolio/ModalShell/ModalShell.types.ts
// ===================================================================

import type React from "react";

export type ModalShellSize = "default" | "large" | "fullscreen";

export interface ModalShellProps {
  /** Whether the modal is shown */
  isOpen: boolean;

  /** Close callback (ESC, backdrop, or close button) */
  onClose: () => void;

  /** Modal content */
  children: React.ReactNode;

  /** Optional extra class on the backdrop container */
  className?: string;

  /** Size variant that maps to CSS classes */
  size?: ModalShellSize;

  /** ARIA: id of the element labeling the dialog */
  "aria-labelledby"?: string;

  /** ARIA: id of the element describing the dialog */
  "aria-describedby"?: string;

  /** Prevent closing when user clicks the backdrop */
  preventCloseOnBackdropClick?: boolean;

  /** Close on ESC key (default: true) */
  closeOnEscape?: boolean;

  /**
   * Optional portal target. Defaults to `document.body`.
   * You can pass a specific container (e.g., a top-level overlay div).
   */
  container?: HTMLElement | null;

  /**
   * Optional ref to the element to receive focus when the modal opens.
   * Takes precedence over `initialFocusSelector` and auto-detection.
   */
  initialFocusRef?: React.RefObject<HTMLElement>;

  /**
   * Optional CSS selector for the element to receive focus when the modal opens.
   * Used if `initialFocusRef` is not provided or not resolvable.
   */
  initialFocusSelector?: string;
}
