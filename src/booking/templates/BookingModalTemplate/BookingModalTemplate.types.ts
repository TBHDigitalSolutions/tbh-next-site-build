// src/booking/templates/BookingModalTemplate/BookingModalTemplate.types.ts
// Types for BookingModalTemplate - modal overlay booking experience

import type { ReactNode } from "react";
import type { CanonicalService } from "@/shared/services/types";
import type { BookingSectionProps } from "@/booking/sections/BookingSection";

// ============================================================================
// Modal-specific Types
// ============================================================================

/**
 * Modal size variants
 */
export type BookingModalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Modal close behavior configuration
 */
export interface BookingModalCloseBehavior {
  /** Allow closing by clicking backdrop */
  allowBackdropClose?: boolean;
  /** Allow closing with ESC key */
  allowEscClose?: boolean;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Custom close button icon */
  closeButtonIcon?: ReactNode;
  /** Confirm before closing if form has unsaved changes */
  confirmUnsavedChanges?: boolean;
  /** Custom confirmation message */
  unsavedChangesMessage?: string;
}

/**
 * Modal animation configuration
 */
export interface BookingModalAnimation {
  /** Animation variant */
  variant?: "fade" | "slide" | "scale" | "none";
  /** Animation duration in ms */
  duration?: number;
  /** Animation easing function */
  easing?: string;
  /** Respect user's reduced motion preference */
  respectReducedMotion?: boolean;
}

/**
 * Modal backdrop configuration
 */
export interface BookingModalBackdrop {
  /** Backdrop opacity (0-1) */
  opacity?: number;
  /** Backdrop blur amount */
  blur?: number;
  /** Custom backdrop color */
  color?: string;
  /** Disable backdrop (no overlay) */
  disabled?: boolean;
}

/**
 * Modal header configuration
 */
export interface BookingModalHeader {
  /** Header title */
  title?: string;
  /** Header subtitle */
  subtitle?: string;
  /** Custom header content */
  content?: ReactNode;
  /** Hide the header completely */
  hidden?: boolean;
  /** Header styling variant */
  variant?: "default" | "minimal" | "prominent";
  /** Show progress indicator in header */
  showProgress?: boolean;
}

/**
 * Modal footer configuration
 */
export interface BookingModalFooter {
  /** Footer content */
  content?: ReactNode;
  /** Hide the footer completely */
  hidden?: boolean;
  /** Footer styling variant */
  variant?: "default" | "minimal" | "actions";
  /** Show powered by branding */
  showBranding?: boolean;
}

/**
 * Modal context for tracking and analytics
 */
export interface BookingModalContext {
  /** Source page or component that opened the modal */
  source?: string;
  /** Campaign or utm parameters */
  campaign?: string;
  /** User intent or goal */
  intent?: string;
  /** Referrer information */
  referrer?: string;
  /** Custom context data */
  data?: Record<string, unknown>;
}

/**
 * Modal analytics configuration
 */
export interface BookingModalAnalytics {
  /** Analytics context identifier */
  context?: string;
  /** Track modal interactions automatically */
  autoTrack?: boolean;
  /** Custom event handlers */
  onModalOpen?: (context: BookingModalContext) => void;
  onModalClose?: (reason: string, timeSpent: number) => void;
  onBookingStart?: (service?: CanonicalService) => void;
  onBookingComplete?: (result: any) => void;
  onBookingError?: (error: any) => void;
  /** Custom tracking properties */
  properties?: Record<string, unknown>;
}

/**
 * Modal accessibility configuration
 */
export interface BookingModalAccessibility {
  /** ARIA label for the modal */
  ariaLabel?: string;
  /** ARIA labelledby reference */
  ariaLabelledBy?: string;
  /** ARIA describedby reference */
  ariaDescribedBy?: string;
  /** Initial focus target selector */
  initialFocus?: string;
  /** Return focus target selector */
  returnFocus?: string;
  /** Enable focus trap */
  focusTrap?: boolean;
  /** Custom focus trap options */
  focusTrapOptions?: Record<string, unknown>;
}

/**
 * Modal state management
 */
export interface BookingModalState {
  /** Modal open/closed state */
  isOpen: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error?: string;
  /** Current step or phase */
  currentStep?: string;
  /** User interaction count */
  interactionCount: number;
  /** Time modal was opened */
  openedAt?: number;
  /** Unsaved changes flag */
  hasUnsavedChanges: boolean;
}

// ============================================================================
// Main Template Props
// ============================================================================

/**
 * Props for BookingModalTemplate - modal overlay booking experience
 */
export interface BookingModalTemplateProps {
  /** Modal open/closed state */
  isOpen: boolean;

  /** Main booking section props (required) */
  booking: BookingSectionProps;

  /** Modal size variant */
  size?: BookingModalSize;

  /** Modal close behavior */
  closeBehavior?: BookingModalCloseBehavior;

  /** Modal animations */
  animation?: BookingModalAnimation;

  /** Modal backdrop */
  backdrop?: BookingModalBackdrop;

  /** Modal header configuration */
  header?: BookingModalHeader;

  /** Modal footer configuration */
  footer?: BookingModalFooter;

  /** Modal context for tracking */
  context?: BookingModalContext;

  /** Analytics configuration */
  analytics?: BookingModalAnalytics;

  /** Accessibility configuration */
  accessibility?: BookingModalAccessibility;

  /** Service context (helps with defaults) */
  service?: CanonicalService;

  /** Event handlers */
  onClose: (reason?: string) => void;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;

  /** Loading and error states */
  loading?: boolean;
  error?: string;

  /** Custom components */
  LoadingComponent?: () => ReactNode;
  ErrorComponent?: (props: { error: string; retry?: () => void }) => ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Test ID for QA */
  "data-testid"?: string;

  /** Children for custom content injection */
  children?: ReactNode;

  /** Portal target (defaults to document.body) */
  portalTarget?: Element | null;

  /** Z-index for modal stacking */
  zIndex?: number;
}

// ============================================================================
// Internal Types
// ============================================================================

/**
 * Internal modal component state
 */
export interface BookingModalInternalState extends BookingModalState {
  /** Client-side hydration state */
  isClient: boolean;
  /** Focus management state */
  previousFocus?: Element;
  /** Scroll position before modal opened */
  previousScrollPosition?: { x: number; y: number };
  /** Body overflow style before modal */
  previousBodyOverflow?: string;
}

/**
 * Modal event payload for analytics
 */
export interface BookingModalEvent {
  event: string;
  modalId?: string;
  service?: CanonicalService;
  source?: string;
  duration?: number;
  interaction_count?: number;
  step?: string;
  timestamp: number;
  properties?: Record<string, unknown>;
}

/**
 * Modal validation result
 */
export interface BookingModalValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Focus trap targets
 */
export interface BookingModalFocusTargets {
  /** All focusable elements in modal */
  all: HTMLElement[];
  /** First focusable element */
  first?: HTMLElement;
  /** Last focusable element */
  last?: HTMLElement;
  /** Initially focused element */
  initial?: HTMLElement;
}

// ============================================================================
// Hook Types
// ============================================================================

/**
 * Hook for managing modal state and behavior
 */
export interface UseBookingModalReturn {
  /** Current modal state */
  state: BookingModalInternalState;
  
  /** Actions */
  actions: {
    open: () => void;
    close: (reason?: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    markUnsavedChanges: (hasChanges: boolean) => void;
    updateStep: (step: string) => void;
  };

  /** Event handlers for modal container */
  handlers: {
    onBackdropClick: (event: React.MouseEvent) => void;
    onEscapeKey: (event: React.KeyboardEvent) => void;
    onModalClick: (event: React.MouseEvent) => void;
  };

  /** Accessibility props */
  a11yProps: {
    role: string;
    "aria-modal": boolean;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
    tabIndex: number;
  };

  /** Focus management */
  focusManagement: {
    initializeFocus: () => void;
    restoreFocus: () => void;
    trapFocus: (event: React.KeyboardEvent) => void;
  };

  /** Computed values */
  computed: {
    shouldShow: boolean;
    timeSpent: number;
    canClose: boolean;
  };
}

/**
 * Configuration for useBookingModal hook
 */
export interface UseBookingModalConfig extends BookingModalTemplateProps {
  /** Enable automatic analytics tracking */
  enableAnalytics?: boolean;
  /** Enable automatic focus management */
  enableFocusManagement?: boolean;
  /** Enable automatic scroll lock */
  enableScrollLock?: boolean;
}

// ============================================================================
// Validation and Utility Types
// ============================================================================

/**
 * Modal size configuration mapping
 */
export interface BookingModalSizeConfig {
  sm: { width: string; height: string; margin: string };
  md: { width: string; height: string; margin: string };
  lg: { width: string; height: string; margin: string };
  xl: { width: string; height: string; margin: string };
  full: { width: string; height: string; margin: string };
}

/**
 * Animation keyframes configuration
 */
export interface BookingModalAnimationConfig {
  fade: { enter: string; exit: string };
  slide: { enter: string; exit: string };
  scale: { enter: string; exit: string };
}

/**
 * Default values for modal configuration
 */
export interface BookingModalDefaults {
  size: BookingModalSize;
  animation: BookingModalAnimation;
  closeBehavior: BookingModalCloseBehavior;
  backdrop: BookingModalBackdrop;
  accessibility: BookingModalAccessibility;
}