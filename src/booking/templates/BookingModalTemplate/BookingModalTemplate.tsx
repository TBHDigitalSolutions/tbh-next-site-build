// src/booking/templates/BookingModalTemplate/BookingModalTemplate.tsx
"use client";

/**
 * BookingModalTemplate - Modal overlay booking experience
 * 
 * This template provides a modal overlay for booking experiences with:
 * - Full accessibility (focus trap, ARIA, keyboard navigation)
 * - Responsive design with mobile-first approach
 * - Customizable animations and styling
 * - Progress tracking and analytics
 * - Error handling and loading states
 * - Unsaved changes protection
 */

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";

// Internal imports
import type {
  BookingModalTemplateProps,
  BookingModalInternalState,
  BookingModalFocusTargets,
} from "./BookingModalTemplate.types";

// Sections
import { Suspense, lazy } from "react";
const BookingSection = lazy(() => import("@/booking/sections/BookingSection"));

// Analytics
import { 
  trackBookingOpenModal, 
  trackBookingCloseModal, 
  trackBookingError 
} from "@/booking/lib/metrics";

// Styles
import styles from "./BookingModalTemplate.module.css";

// ============================================================================
// Focus Management Utilities
// ============================================================================

const FOCUSABLE_ELEMENTS = [
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  'a[href]',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ');

function getFocusableElements(container: HTMLElement): BookingModalFocusTargets {
  const elements = Array.from(container.querySelectorAll(FOCUSABLE_ELEMENTS)) as HTMLElement[];
  
  return {
    all: elements,
    first: elements[0],
    last: elements[elements.length - 1],
    initial: elements.find(el => el.getAttribute('data-autofocus') === 'true') || elements[0],
  };
}

// ============================================================================
// Default Components
// ============================================================================

function DefaultLoadingComponent() {
  return (
    <div className={styles.loading} role="status" aria-label="Loading booking form">
      <div className={styles.loadingSpinner} />
      <div className={styles.loadingText}>Loading booking form...</div>
    </div>
  );
}

function DefaultErrorComponent({ 
  error, 
  retry 
}: { 
  error: string; 
  retry?: () => void; 
}) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorIcon}>⚠️</div>
      <h3 className={styles.errorTitle}>Booking Unavailable</h3>
      <p className={styles.errorMessage}>{error}</p>
      {retry && (
        <div className={styles.errorActions}>
          <button className={styles.errorButton} onClick={retry} type="button">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className={styles.loading}>
      <div className={clsx(styles.skeleton, styles.skeletonTitle)} />
      <div className={clsx(styles.skeleton, styles.skeletonSubtitle)} />
      <div className={clsx(styles.skeleton, styles.skeletonContent)} />
    </div>
  );
}

// ============================================================================
// Unsaved Changes Warning Component
// ============================================================================

function UnsavedChangesWarning({
  isOpen,
  message = "You have unsaved changes. Are you sure you want to close?",
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.unsavedWarning} role="dialog" aria-modal="true">
      <div className={styles.unsavedWarningDialog}>
        <h3 className={styles.unsavedWarningTitle}>Unsaved Changes</h3>
        <p className={styles.unsavedWarningMessage}>{message}</p>
        <div className={styles.unsavedWarningActions}>
          <button
            className={clsx(styles.unsavedWarningButton, styles.secondary)}
            onClick={onCancel}
            type="button"
          >
            Continue Editing
          </button>
          <button
            className={clsx(styles.unsavedWarningButton, styles.primary)}
            onClick={onConfirm}
            type="button"
          >
            Close Without Saving
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Template Component
// ============================================================================

const BookingModalTemplate: React.FC<BookingModalTemplateProps> = ({
  isOpen,
  booking,
  size = "md",
  closeBehavior = {
    allowBackdropClose: true,
    allowEscClose: true,
    showCloseButton: true,
    confirmUnsavedChanges: true,
  },
  animation = {
    variant: "fade",
    duration: 200,
    easing: "ease-out",
    respectReducedMotion: true,
  },
  backdrop = {
    opacity: 0.5,
    blur: 4,
  },
  header = {
    title: "Schedule your session",
    variant: "default",
    showProgress: false,
  },
  footer = {
    variant: "minimal",
    showBranding: true,
  },
  context,
  analytics,
  accessibility = {
    focusTrap: true,
    ariaLabel: "Booking modal",
  },
  service,
  onClose,
  onSuccess,
  onError,
  loading = false,
  error,
  LoadingComponent = DefaultLoadingComponent,
  ErrorComponent = DefaultErrorComponent,
  className,
  "data-testid": testId = "booking-modal-template",
  children,
  portalTarget,
  zIndex = 1000,
}) => {
  // ========================================================================
  // State & Refs
  // ========================================================================
  
  const [internalState, setInternalState] = useState<BookingModalInternalState>({
    isOpen: false,
    isLoading: loading,
    error,
    currentStep: undefined,
    interactionCount: 0,
    openedAt: undefined,
    hasUnsavedChanges: false,
    isClient: false,
    previousFocus: undefined,
    previousScrollPosition: undefined,
    previousBodyOverflow: undefined,
  });

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [pendingClose, setPendingClose] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const focusTargetsRef = useRef<BookingModalFocusTargets>({ all: [] });
  const openTimeRef = useRef<number>(0);

  // ========================================================================
  // Effects
  // ========================================================================

  // Client-side hydration
  useEffect(() => {
    setInternalState(prev => ({ ...prev, isClient: true }));
    
    // Find portal target
    if (!portalTarget && typeof document !== "undefined") {
      // Default portal target setup can be added here
    }
  }, [portalTarget]);

  // Sync external open state
  useEffect(() => {
    if (isOpen !== internalState.isOpen) {
      if (isOpen) {
        handleModalOpen();
      } else {
        handleModalClose("external");
      }
    }
  }, [isOpen]);

  // Sync external loading/error state
  useEffect(() => {
    setInternalState(prev => ({
      ...prev,
      isLoading: loading,
      error,
    }));
  }, [loading, error]);

  // Body scroll lock
  useEffect(() => {
    if (internalState.isOpen && typeof document !== "undefined") {
      const originalOverflow = document.body.style.overflow;
      const originalScrollY = window.scrollY;
      
      setInternalState(prev => ({
        ...prev,
        previousBodyOverflow: originalOverflow,
        previousScrollPosition: { x: window.scrollX, y: originalScrollY },
      }));
      
      document.body.style.overflow = "hidden";
      
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [internalState.isOpen]);

  // Focus management
  useEffect(() => {
    if (internalState.isOpen && internalState.isClient && modalRef.current) {
      // Store previous focus
      const activeElement = document.activeElement as HTMLElement;
      setInternalState(prev => ({ ...prev, previousFocus: activeElement }));

      // Initialize focus
      setTimeout(() => {
        if (accessibility.focusTrap && modalRef.current) {
          focusTargetsRef.current = getFocusableElements(modalRef.current);
          
          const initialFocus = accessibility.initialFocus
            ? modalRef.current.querySelector(accessibility.initialFocus) as HTMLElement
            : focusTargetsRef.current.initial;
            
          if (initialFocus) {
            initialFocus.focus();
          } else {
            modalRef.current.focus();
          }
        }
      }, 50);
    }
  }, [internalState.isOpen, internalState.isClient, accessibility]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (internalState.previousFocus && typeof document !== "undefined") {
        try {
          internalState.previousFocus.focus();
        } catch (e) {
          // Focus restoration failed, focus body instead
          document.body.focus();
        }
      }
    };
  }, []);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleModalOpen = useCallback(() => {
    const now = Date.now();
    openTimeRef.current = now;
    
    setInternalState(prev => ({
      ...prev,
      isOpen: true,
      openedAt: now,
      interactionCount: 0,
      hasUnsavedChanges: false,
    }));

    // Analytics
    trackBookingOpenModal({
      context: analytics?.context || "booking_modal",
      service,
      source: context?.source,
      timestamp: now,
      ...analytics?.properties,
    });

    analytics?.onModalOpen?.(context || {});
  }, [analytics, service, context]);

  const handleModalClose = useCallback((reason = "user_action") => {
    // Check for unsaved changes
    if (
      closeBehavior.confirmUnsavedChanges && 
      internalState.hasUnsavedChanges && 
      reason !== "force"
    ) {
      setShowUnsavedWarning(true);
      setPendingClose(reason);
      return;
    }

    const timeSpent = openTimeRef.current ? Date.now() - openTimeRef.current : 0;
    
    setInternalState(prev => ({
      ...prev,
      isOpen: false,
      currentStep: undefined,
      hasUnsavedChanges: false,
    }));

    // Analytics
    trackBookingCloseModal({
      context: analytics?.context || "booking_modal",
      service,
      reason,
      timeSpent,
      interactionCount: internalState.interactionCount,
      timestamp: Date.now(),
      ...analytics?.properties,
    });

    analytics?.onModalClose?.(reason, timeSpent);
    onClose(reason);

    // Restore focus
    if (internalState.previousFocus) {
      setTimeout(() => {
        try {
          internalState.previousFocus?.focus();
        } catch (e) {
          // Focus restoration failed
        }
      }, 100);
    }
  }, [
    closeBehavior.confirmUnsavedChanges,
    internalState.hasUnsavedChanges,
    internalState.interactionCount,
    internalState.previousFocus,
    analytics,
    service,
    onClose,
  ]);

  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeBehavior.allowBackdropClose) {
      handleModalClose("backdrop_click");
    }
  }, [closeBehavior.allowBackdropClose, handleModalClose]);

  const handleEscapeKey = useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Escape" && closeBehavior.allowEscClose) {
      event.preventDefault();
      handleModalClose("escape_key");
    }
  }, [closeBehavior.allowEscClose, handleModalClose]);

  const handleFocusTrap = useCallback((event: React.KeyboardEvent) => {
    if (!accessibility.focusTrap || event.key !== "Tab") return;

    const { first, last } = focusTargetsRef.current;
    if (!first || !last) return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      // Tab
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }, [accessibility.focusTrap]);

  const handleContentClick = useCallback((event: React.MouseEvent) => {
    // Prevent backdrop close when clicking on content
    event.stopPropagation();
    
    // Track interaction
    setInternalState(prev => ({
      ...prev,
      interactionCount: prev.interactionCount + 1,
    }));
  }, []);

  const handleBookingSuccess = useCallback((result: any) => {
    analytics?.onBookingComplete?.(result);
    onSuccess?.(result);
    handleModalClose("booking_success");
  }, [analytics, onSuccess, handleModalClose]);

  const handleBookingError = useCallback((error: any) => {
    trackBookingError({
      context: analytics?.context || "booking_modal",
      service,
      code: error.code || "UNKNOWN_ERROR",
      message: error.message || "An error occurred",
      timestamp: Date.now(),
      ...analytics?.properties,
    });

    analytics?.onBookingError?.(error);
    onError?.(error);
  }, [analytics, service, onError]);

  const handleUnsavedChanges = useCallback((hasChanges: boolean) => {
    setInternalState(prev => ({ ...prev, hasUnsavedChanges: hasChanges }));
  }, []);

  const handleConfirmClose = useCallback(() => {
    setShowUnsavedWarning(false);
    if (pendingClose) {
      handleModalClose(pendingClose);
      setPendingClose(null);
    }
  }, [pendingClose, handleModalClose]);

  const handleCancelClose = useCallback(() => {
    setShowUnsavedWarning(false);
    setPendingClose(null);
  }, []);

  // ========================================================================
  // Computed Values
  // ========================================================================

  const shouldShow = internalState.isOpen && internalState.isClient;
  
  const modalProps = useMemo(() => ({
    role: "dialog" as const,
    "aria-modal": true as const,
    "aria-labelledby": accessibility.ariaLabelledBy || "booking-modal-title",
    "aria-describedby": accessibility.ariaDescribedBy || "booking-modal-description",
    "aria-label": accessibility.ariaLabel,
    tabIndex: -1,
    "data-focus-trapped": accessibility.focusTrap ? "true" : "false",
    "data-testid": testId,
  }), [accessibility, testId]);

  const animationClass = useMemo(() => {
    if (animation.respectReducedMotion && typeof window !== "undefined") {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (prefersReducedMotion) return "";
    }
    return animation.variant || "fade";
  }, [animation]);

  // ========================================================================
  // Render Content
  // ========================================================================

  const renderHeader = () => {
    if (header.hidden) return null;

    return (
      <div className={clsx(styles.header, styles[header.variant || "default"])}>
        <div className={styles.headerContent}>
          {!header.content ? (
            <div className={styles.headerText}>
              {header.title && (
                <h2 id="booking-modal-title" className={styles.title}>
                  {header.title}
                </h2>
              )}
              {header.subtitle && (
                <p id="booking-modal-description" className={styles.subtitle}>
                  {header.subtitle}
                </p>
              )}
            </div>
          ) : (
            header.content
          )}
          
          {closeBehavior.showCloseButton && (
            <button
              className={styles.closeButton}
              onClick={() => handleModalClose("close_button")}
              aria-label="Close booking form"
              type="button"
            >
              {closeBehavior.closeButtonIcon || "✕"}
            </button>
          )}
        </div>

        {header.showProgress && (
          <div className={styles.progress}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: "33%" }} // This would be dynamic based on step
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    if (internalState.isLoading) {
      return LoadingComponent ? <LoadingComponent /> : <LoadingSkeleton />;
    }

    if (internalState.error) {
      return ErrorComponent ? (
        <ErrorComponent 
          error={internalState.error}
          retry={() => setInternalState(prev => ({ ...prev, error: undefined }))}
        />
      ) : (
        <DefaultErrorComponent 
          error={internalState.error}
          retry={() => setInternalState(prev => ({ ...prev, error: undefined }))}
        />
      );
    }

    return (
      <Suspense fallback={<LoadingSkeleton />}>
        <BookingSection
          {...booking}
          onSuccess={handleBookingSuccess}
          onError={handleBookingError}
          onUnsavedChanges={handleUnsavedChanges}
        />
      </Suspense>
    );
  };

  const renderFooter = () => {
    if (footer.hidden) return null;

    return (
      <div className={clsx(styles.footer, styles[footer.variant || "default"])}>
        {footer.content || (
          footer.showBranding && (
            <a 
              href="https://tbhdigital.com" 
              className={styles.footerBranding}
              target="_blank"
              rel="noopener noreferrer"
            >
              Powered by TBH Digital
            </a>
          )
        )}
      </div>
    );
  };

  // ========================================================================
  // Main Render
  // ========================================================================

  if (!shouldShow) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className={clsx(
        styles.modalOverlay,
        {
          [styles.open]: shouldShow,
          [styles[animationClass]]: animationClass,
          [styles.blurHeavy]: backdrop.blur && backdrop.blur > 6,
          [styles.blurLight]: backdrop.blur && backdrop.blur < 3,
          [styles.noBlur]: backdrop.blur === 0,
          [styles.darkBackdrop]: backdrop.opacity && backdrop.opacity > 0.6,
          [styles.lightBackdrop]: backdrop.opacity && backdrop.opacity < 0.4,
        }
      )}
      style={{ 
        zIndex,
        "--modal-duration": `${animation.duration}ms`,
        "--modal-easing": animation.easing,
        backgroundColor: backdrop.color 
          ? backdrop.color 
          : `rgba(0, 0, 0, ${backdrop.opacity || 0.5})`,
      } as React.CSSProperties}
      onClick={handleBackdropClick}
      onKeyDown={(e) => {
        handleEscapeKey(e);
        handleFocusTrap(e);
      }}
    >
      <div
        ref={modalRef}
        className={clsx(
          styles.modal,
          styles[size],
          {
            [styles.static]: !animationClass,
          },
          className
        )}
        {...modalProps}
        onClick={handleContentClick}
        data-interacting={internalState.interactionCount > 0}
        data-loading={internalState.isLoading}
        data-error={!!internalState.error}
      >
        {/* Header */}
        {renderHeader()}

        {/* Content */}
        <div className={styles.content}>
          <div className={clsx(
            styles.contentInner,
            {
              [styles.compact]: size === "sm",
              [styles.spacious]: size === "xl" || size === "full",
            }
          )}>
            {renderContent()}
            {children}
          </div>
        </div>

        {/* Footer */}
        {renderFooter()}

        {/* Unsaved Changes Warning */}
        <UnsavedChangesWarning
          isOpen={showUnsavedWarning}
          message={closeBehavior.unsavedChangesMessage}
          onConfirm={handleConfirmClose}
          onCancel={handleCancelClose}
        />
      </div>

      {/* Screen reader announcements */}
      <div
        className={styles.srOnly}
        aria-live="polite"
        aria-atomic="true"
        id="modal-announcements"
      />
    </div>
  );

  // Portal rendering
  if (typeof document !== "undefined") {
    const target = portalTarget || document.body;
    return createPortal(modalContent, target);
  }

  return null;
};

BookingModalTemplate.displayName = "BookingModalTemplate";

export default BookingModalTemplate;