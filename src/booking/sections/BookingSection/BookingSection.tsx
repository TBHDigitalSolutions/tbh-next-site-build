// src/booking/sections/BookingSection/BookingSection.tsx
"use client";

/**
 * BookingSection - Main orchestrator component
 * 
 * This component is responsible for:
 * - Switching between different booking variants (embed, form, calendar)
 * - Managing booking flow state and error handling
 * - Providing consistent loading and error states
 * - Coordinating analytics and callbacks
 * 
 * Architecture: This is the main section orchestrator that templates use
 * to render different booking experiences based on variant and configuration.
 */

import React, { 
  useCallback, 
  useEffect, 
  useMemo, 
  useRef, 
  useState 
} from "react";
import clsx from "clsx";

// Internal imports
import type { 
  BookingSectionProps, 
  BookingResult, 
  BookingError, 
  BookingSectionState,
  BookingStep 
} from "./BookingSection.types";
import { 
  validateBookingSectionProps, 
  validateVariantConfiguration,
  debugBookingSectionProps 
} from "./utils/bookingSectionValidator";

// Component imports (lazy loaded for performance)
import { lazy, Suspense } from "react";

// Lib imports
import { DEFAULT_VARIANT_BY_SERVICE } from "@/booking/lib/registry";
import { trackBookingView, trackBookingError } from "@/booking/lib/metrics";
import { getUserTimezone } from "@/booking/lib/utils";

// Styles
import styles from "./BookingSection.module.css";

// ============================================================================
// Lazy Component Imports
// ============================================================================

const SchedulerEmbed = lazy(() => import("@/booking/components/SchedulerEmbed"));
const BookingForm = lazy(() => import("@/booking/components/BookingForm"));
const AvailabilityCalendar = lazy(() => import("@/booking/components/AvailabilityCalendar"));
const BookingProgress = lazy(() => import("@/booking/components/BookingProgress"));

// ============================================================================
// Default Props & Constants
// ============================================================================

const DEFAULT_PROGRESS_STEPS: BookingStep[] = [
  {
    id: "select",
    label: "Select Service",
    description: "Choose your service type",
    isComplete: false,
    isCurrent: true,
    isClickable: false,
  },
  {
    id: "schedule",
    label: "Pick Time",
    description: "Select date and time",
    isComplete: false,
    isCurrent: false,
    isClickable: false,
  },
  {
    id: "details",
    label: "Your Details", 
    description: "Provide contact information",
    isComplete: false,
    isCurrent: false,
    isClickable: false,
  },
  {
    id: "confirm",
    label: "Confirm",
    description: "Review and confirm booking",
    isComplete: false,
    isCurrent: false,
    isClickable: false,
  },
];

// ============================================================================
// Loading Components
// ============================================================================

function DefaultLoadingComponent() {
  return (
    <div className={styles.loading} role="status" aria-label="Loading booking form">
      <div className={styles.loadingSpinner} />
      <div className={styles.loadingText}>
        Loading booking form...
      </div>
    </div>
  );
}

function DefaultErrorComponent({ 
  error, 
  retry 
}: { 
  error: BookingError; 
  retry: () => void; 
}) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorIcon}>
        ⚠️
      </div>
      <h3 className={styles.errorTitle}>
        Booking Unavailable
      </h3>
      <p className={styles.errorMessage}>
        {error.message || "We're having trouble loading the booking form. Please try again."}
      </p>
      <div className={styles.errorActions}>
        <button 
          className={styles.retryButton}
          onClick={retry}
          type="button"
        >
          Try Again
        </button>
        {error.fallbackAction && (
          <a 
            href={error.fallbackAction.href}
            className={styles.fallbackButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            {error.fallbackAction.label}
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

const BookingSection: React.FC<BookingSectionProps> = ({
  variant,
  service,
  calendar,
  intake,
  prefill,
  successHref = "/booking/success",
  cancelHref = "/",
  analyticsContext = "booking_section",
  onSuccess,
  onError,
  onCancel,
  showProgress = false,
  progressSteps = DEFAULT_PROGRESS_STEPS,
  debug = false,
  className,
  disabled = false,
  loading: externalLoading = false,
  LoadingComponent = DefaultLoadingComponent,
  ErrorComponent = DefaultErrorComponent,
  "data-testid": testId = "booking-section",
}) => {
  // ========================================================================
  // State & Refs
  // ========================================================================
  
  const [state, setState] = useState<BookingSectionState>({
    currentVariant: variant,
    isLoading: externalLoading,
    error: undefined,
    result: undefined,
    currentStep: showProgress ? progressSteps[0]?.id : undefined,
    retryCount: 0,
    hasInitialized: false,
  });

  const sectionRef = useRef<HTMLElement>(null);
  const hasTrackedView = useRef(false);

  // ========================================================================
  // Validation & Setup
  // ========================================================================

  // Validate props in development
  useEffect(() => {
    if (debug) {
      debugBookingSectionProps({ 
        variant, service, calendar, intake, prefill, 
        successHref, cancelHref, analyticsContext 
      });
    }
    
    if (process.env.NODE_ENV === "development") {
      const validation = validateBookingSectionProps({
        variant, service, calendar, intake, prefill,
        successHref, cancelHref, analyticsContext
      });
      
      if (!validation.isValid) {
        console.warn("BookingSection validation failed:", validation.errors);
      }
      
      if (validation.warnings.length > 0) {
        console.warn("BookingSection warnings:", validation.warnings);
      }
    }
  }, [variant, service, calendar, intake, prefill, debug, analyticsContext]);

  // ========================================================================
  // Computed Values
  // ========================================================================

  // Determine the effective variant to render
  const effectiveVariant = useMemo(() => {
    const variantConfig = validateVariantConfiguration(variant, {
      variant, service, calendar, intake, prefill,
      successHref, cancelHref, analyticsContext
    });

    if (variantConfig.canRender) {
      return variant;
    }

    // Try to fall back to a working variant
    if (service && DEFAULT_VARIANT_BY_SERVICE[service]) {
      const fallbackVariant = DEFAULT_VARIANT_BY_SERVICE[service];
      const fallbackConfig = validateVariantConfiguration(fallbackVariant, {
        variant: fallbackVariant, service, calendar, intake, prefill,
        successHref, cancelHref, analyticsContext
      });
      
      if (fallbackConfig.canRender) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `Falling back from '${variant}' to '${fallbackVariant}' variant`,
            { missing: variantConfig.missingRequirements }
          );
        }
        return fallbackVariant;
      }
    }

    // Last resort fallback
    return "form";
  }, [variant, service, calendar, intake, prefill, successHref, cancelHref, analyticsContext]);

  // Check if we can render the current configuration
  const canRender = useMemo(() => {
    const config = validateVariantConfiguration(effectiveVariant, {
      variant: effectiveVariant, service, calendar, intake, prefill,
      successHref, cancelHref, analyticsContext
    });
    return config.canRender;
  }, [effectiveVariant, service, calendar, intake, prefill, successHref, cancelHref, analyticsContext]);

  // ========================================================================
  // Analytics
  // ========================================================================

  // Track view event
  useEffect(() => {
    if (!hasTrackedView.current && canRender) {
      trackBookingView({
        context: analyticsContext,
        service,
        variant: effectiveVariant,
        timestamp: Date.now(),
      });
      hasTrackedView.current = true;
    }
  }, [analyticsContext, service, effectiveVariant, canRender]);

  // ========================================================================
  // Event Handlers
  // ========================================================================

  const handleSuccess = useCallback((result: BookingResult) => {
    setState(prev => ({
      ...prev,
      result,
      isLoading: false,
      error: undefined,
    }));

    onSuccess?.(result);

    // Navigate to success page if provided
    if (successHref && typeof window !== "undefined") {
      window.location.href = successHref;
    }
  }, [onSuccess, successHref]);

  const handleError = useCallback((error: BookingError) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
      retryCount: prev.retryCount + 1,
    }));

    // Track error event
    trackBookingError({
      context: analyticsContext,
      service,
      variant: effectiveVariant,
      code: error.code,
      message: error.message,
      timestamp: Date.now(),
    });

    onError?.(error);
  }, [onError, analyticsContext, service, effectiveVariant]);

  const handleCancel = useCallback(() => {
    onCancel?.();
    
    // Navigate to cancel page if provided
    if (cancelHref && typeof window !== "undefined") {
      window.location.href = cancelHref;
    }
  }, [onCancel, cancelHref]);

  const handleRetry = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: undefined,
      isLoading: false,
    }));
  }, []);

  const handleStepChange = useCallback((stepId: string) => {
    setState(prev => ({
      ...prev,
      currentStep: stepId,
    }));
  }, []);

  // ========================================================================
  // Render Variant Component
  // ========================================================================

  const renderVariantComponent = useCallback(() => {
    const commonProps = {
      service,
      prefill,
      onSuccess: handleSuccess,
      onError: handleError,
      onCancel: handleCancel,
      disabled,
      "data-testid": `${testId}-${effectiveVariant}`,
    };

    switch (effectiveVariant) {
      case "embed":
        if (!calendar) {
          handleError({
            code: "CONFIG_ERROR",
            message: "Calendar configuration is required for embed variant",
            retry: true,
          });
          return null;
        }
        
        return (
          <SchedulerEmbed
            provider={calendar.provider}
            config={calendar}
            {...commonProps}
          />
        );

      case "form":
        return (
          <BookingForm
            intake={intake}
            {...commonProps}
          />
        );

      case "calendar":
        if (!calendar) {
          handleError({
            code: "CONFIG_ERROR", 
            message: "Calendar configuration is required for calendar variant",
            retry: true,
          });
          return null;
        }
        
        return (
          <AvailabilityCalendar
            config={calendar}
            onStepChange={handleStepChange}
            {...commonProps}
          />
        );

      default:
        handleError({
          code: "INVALID_VARIANT",
          message: `Unknown booking variant: ${effectiveVariant}`,
          retry: false,
        });
        return null;
    }
  }, [
    effectiveVariant,
    service,
    calendar,
    intake,
    prefill,
    handleSuccess,
    handleError,
    handleCancel,
    disabled,
    testId,
    handleStepChange,
  ]);

  // ========================================================================
  // Loading States
  // ========================================================================

  const isLoading = externalLoading || state.isLoading;
  const hasError = !!state.error && !isLoading;

  // ========================================================================
  // Render
  // ========================================================================

  return (
    <section
      ref={sectionRef}
      className={clsx(
        styles.section,
        {
          [styles.disabled]: disabled,
        },
        className
      )}
      data-variant={effectiveVariant}
      data-debug={debug}
      data-testid={testId}
      aria-live="polite"
      aria-label="Booking section"
    >
      <div className={styles.container}>
        {/* Progress Indicator */}
        {showProgress && !hasError && (
          <div className={styles.progress} role="progressbar">
            <Suspense fallback={null}>
              <BookingProgress
                steps={progressSteps}
                currentStep={state.currentStep}
                variant="horizontal"
                size="medium"
              />
            </Suspense>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <LoadingComponent />
        )}

        {/* Error State */}
        {hasError && state.error && (
          <ErrorComponent 
            error={state.error} 
            retry={handleRetry}
          />
        )}

        {/* Main Content */}
        {!isLoading && !hasError && canRender && (
          <div 
            className={styles.variantContainer}
            data-variant={effectiveVariant}
          >
            <Suspense fallback={<LoadingComponent />}>
              {renderVariantComponent()}
            </Suspense>
          </div>
        )}

        {/* Fallback when cannot render */}
        {!isLoading && !hasError && !canRender && (
          <ErrorComponent
            error={{
              code: "CONFIG_ERROR",
              message: "Unable to render booking form with current configuration",
              retry: true,
              fallbackAction: {
                label: "Contact Us Directly",
                href: "/contact",
              },
            }}
            retry={handleRetry}
          />
        )}
      </div>
    </section>
  );
};

export default BookingSection;