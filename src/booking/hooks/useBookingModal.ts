// src/booking/hooks/useBookingModal.ts
// Modal state management and interaction logic for booking modals

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  chooseBookingMode, 
  detectBookingContext,
  checkReducedMotionPreference,
  getCurrentViewportWidth,
  detectAccessibilityMode 
} from "../lib/bookingPolicy";
import { trackBookingFunnel, createAnalyticsContext } from "../lib/metrics";
import { QUERY_KEYS, FALLBACKS } from "../lib/constants";
import { toCanonicalService, buildQuery } from "../lib/utils";
import type { 
  BookingMode, 
  BookingModeOptions, 
  BookingContext 
} from "../lib/bookingPolicy";
import type { CanonicalService, BookingVariant } from "../lib/types";

// Modal state interface
export interface BookingModalState {
  isOpen: boolean;
  mode: BookingMode;
  service?: CanonicalService;
  source?: string;
  context?: string;
  prefillData?: Record<string, any>;
  fallbackUrl?: string;
  error?: string;
  isLoading: boolean;
}

// Modal configuration options
export interface UseBookingModalOptions {
  /** Default service for the modal */
  defaultService?: CanonicalService;
  /** Analytics context */
  analyticsContext?: string;
  /** Enable automatic URL parameter handling */
  handleUrlParams?: boolean;
  /** Enable automatic modal decision making */
  autoDecideMode?: boolean;
  /** Force specific mode (overrides decision logic) */
  forceMode?: BookingMode;
  /** Callback when modal opens */
  onModalOpen?: (context: BookingContext) => void;
  /** Callback when modal closes */
  onModalClose?: (reason: string) => void;
  /** Callback when mode changes */
  onModeChange?: (mode: BookingMode, reason: string) => void;
}

// Modal action options
export interface OpenModalOptions {
  service?: CanonicalService;
  source?: string;
  context?: string;
  variant?: BookingVariant;
  prefill?: Record<string, any>;
  forceMode?: BookingMode;
}

export function useBookingModal(options: UseBookingModalOptions = {}) {
  const {
    defaultService,
    analyticsContext = "booking_modal",
    handleUrlParams = true,
    autoDecideMode = true,
    forceMode,
    onModalOpen,
    onModalClose,
    onModeChange,
  } = options;

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management
  const [state, setState] = useState<BookingModalState>({
    isOpen: false,
    mode: "page",
    isLoading: false,
  });

  // Refs for tracking
  const openTimeRef = useRef<number>(0);
  const interactionCountRef = useRef<number>(0);
  const modalDecisionRef = useRef<{ mode: BookingMode; reason: string } | null>(null);

  // Analytics context
  const baseAnalyticsContext = createAnalyticsContext({
    service: state.service,
    context: analyticsContext,
    source: state.source,
  });

  // URL parameter handling
  useEffect(() => {
    if (!handleUrlParams) return;

    const topic = searchParams?.get(QUERY_KEYS.topic);
    const source = searchParams?.get(QUERY_KEYS.source);
    const ref = searchParams?.get(QUERY_KEYS.ref);

    if (topic || source || ref) {
      const service = toCanonicalService(topic || "");
      const prefillData = {
        name: searchParams?.get(QUERY_KEYS.name),
        email: searchParams?.get(QUERY_KEYS.email),
        timezone: searchParams?.get(QUERY_KEYS.tz),
        notes: searchParams?.get(QUERY_KEYS.notes),
        ref,
      };

      setState(prev => ({
        ...prev,
        service,
        source,
        prefillData,
      }));
    }
  }, [searchParams, handleUrlParams]);

  // Modal decision logic
  const decideBookingMode = useCallback((
    context: BookingContext,
    overrides?: Partial<BookingModeOptions>
  ): { mode: BookingMode; reason: string; fallbackUrl: string } => {
    if (forceMode) {
      return {
        mode: forceMode,
        reason: "Forced mode override",
        fallbackUrl: buildFallbackUrl(context),
      };
    }

    const detectedContext = detectBookingContext(context.pathname || window.location.pathname);
    const modeOptions: BookingModeOptions = {
      inServicesHierarchy: detectedContext.pathname?.startsWith("/services") || false,
      isLeafService: detectedContext.level === "L3" || 
                     (detectedContext.level === "L2" && !detectedContext.pathname?.includes("/packages")),
      hasMultipleMeetingTypes: false, // This would come from service data
      prefersReducedMotion: checkReducedMotionPreference(),
      a11yMode: detectAccessibilityMode(),
      viewportWidth: getCurrentViewportWidth(),
      ...overrides,
    };

    const { mode, reason } = chooseBookingMode(modeOptions);
    
    return {
      mode,
      reason,
      fallbackUrl: buildFallbackUrl(context),
    };
  }, [forceMode]);

  // Open modal with decision logic
  const openModal = useCallback((openOptions: OpenModalOptions = {}) => {
    const context: BookingContext = {
      pathname: window.location.pathname,
      service: openOptions.service || state.service || defaultService,
      source: openOptions.source || state.source,
      context: openOptions.context || analyticsContext,
    };

    let finalMode: BookingMode;
    let reason: string;
    let fallbackUrl: string;

    if (openOptions.forceMode) {
      finalMode = openOptions.forceMode;
      reason = "Forced mode in open options";
      fallbackUrl = buildFallbackUrl(context);
    } else if (autoDecideMode) {
      const decision = decideBookingMode(context);
      finalMode = decision.mode;
      reason = decision.reason;
      fallbackUrl = decision.fallbackUrl;
    } else {
      finalMode = "modal";
      reason = "Default modal mode";
      fallbackUrl = buildFallbackUrl(context);
    }

    // Store decision for analytics
    modalDecisionRef.current = { mode: finalMode, reason };

    if (finalMode === "page") {
      // Navigate to page instead of opening modal
      const queryParams = buildQuery({
        [QUERY_KEYS.topic]: context.service,
        [QUERY_KEYS.source]: context.source,
        [QUERY_KEYS.ref]: context.context,
        ...openOptions.prefill,
      });
      
      const url = queryParams ? `${fallbackUrl}?${queryParams}` : fallbackUrl;
      router.push(url);
      
      // Track navigation
      trackBookingFunnel.start({
        ...baseAnalyticsContext,
        mode: "page",
        decision_reason: reason,
        navigation_type: "push",
      });

      return;
    }

    // Open modal
    openTimeRef.current = Date.now();
    interactionCountRef.current = 0;

    setState(prev => ({
      ...prev,
      isOpen: true,
      mode: finalMode,
      service: context.service,
      source: context.source,
      context: context.context,
      prefillData: openOptions.prefill,
      fallbackUrl,
      error: undefined,
      isLoading: false,
    }));

    // Track modal open
    trackBookingFunnel.modalOpen({
      ...baseAnalyticsContext,
      mode: finalMode,
      decision_reason: reason,
      service: context.service,
      source: context.source,
    });

    // Callback
    onModalOpen?.(context);
    onModeChange?.(finalMode, reason);

    // Prevent body scroll
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
  }, [
    state.service,
    state.source,
    defaultService,
    analyticsContext,
    autoDecideMode,
    decideBookingMode,
    router,
    baseAnalyticsContext,
    onModalOpen,
    onModeChange,
  ]);

  // Close modal
  const closeModal = useCallback((reason = "user_action") => {
    if (!state.isOpen) return;

    const sessionTime = Date.now() - openTimeRef.current;
    
    setState(prev => ({
      ...prev,
      isOpen: false,
      error: undefined,
      isLoading: false,
    }));

    // Track modal close
    trackBookingFunnel.modalClose({
      ...baseAnalyticsContext,
      reason,
      session_time_ms: sessionTime,
      interaction_count: interactionCountRef.current,
      modal_decision: modalDecisionRef.current,
    });

    // Callback
    onModalClose?.(reason);

    // Restore body scroll
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }

    // Clean up refs
    openTimeRef.current = 0;
    interactionCountRef.current = 0;
    modalDecisionRef.current = null;
  }, [state.isOpen, baseAnalyticsContext, onModalClose]);

  // Handle escape key
  useEffect(() => {
    if (!state.isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal("escape_key");
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [state.isOpen, closeModal]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      closeModal("backdrop_click");
    }
  }, [closeModal]);

  // Prevent modal content clicks from closing
  const handleContentClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    interactionCountRef.current += 1;
  }, []);

  // Navigation fallback
  const navigateToPage = useCallback((additionalParams?: Record<string, any>) => {
    const queryParams = buildQuery({
      [QUERY_KEYS.topic]: state.service,
      [QUERY_KEYS.source]: state.source,
      [QUERY_KEYS.ref]: state.context,
      ...state.prefillData,
      ...additionalParams,
    });

    const url = state.fallbackUrl || FALLBACKS.successHref;
    const finalUrl = queryParams ? `${url}?${queryParams}` : url;
    
    // Close modal first
    closeModal("navigation_fallback");
    
    // Navigate
    router.push(finalUrl);

    // Track fallback navigation
    trackBookingFunnel.start({
      ...baseAnalyticsContext,
      mode: "page",
      navigation_type: "fallback",
      original_mode: state.mode,
    });
  }, [
    state.service,
    state.source,
    state.context,
    state.prefillData,
    state.fallbackUrl,
    state.mode,
    router,
    baseAnalyticsContext,
    closeModal,
  ]);

  // Error handling
  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      error,
      isLoading: false,
    }));

    // Track error
    trackBookingFunnel.error({
      ...baseAnalyticsContext,
      code: "modal_error",
      message: error,
      context: "modal_state",
    });
  }, [baseAnalyticsContext]);

  // Loading state
  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }));
  }, []);

  // Update modal data
  const updateModalData = useCallback((updates: Partial<Pick<BookingModalState, "service" | "source" | "context" | "prefillData">>) => {
    setState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Force mode change (for testing/debugging)
  const changeMode = useCallback((newMode: BookingMode, reason = "manual_override") => {
    if (newMode === state.mode) return;

    setState(prev => ({
      ...prev,
      mode: newMode,
    }));

    modalDecisionRef.current = { mode: newMode, reason };
    onModeChange?.(newMode, reason);

    // If changing to page mode while modal is open, navigate instead
    if (newMode === "page" && state.isOpen) {
      navigateToPage();
    }
  }, [state.mode, state.isOpen, navigateToPage, onModeChange]);

  // Accessibility helpers
  const getModalProps = useCallback(() => ({
    role: "dialog" as const,
    "aria-modal": true as const,
    "aria-labelledby": "booking-modal-title",
    "aria-describedby": "booking-modal-description",
    tabIndex: -1,
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal("escape_key");
      }
    },
  }), [closeModal]);

  return {
    // State
    state,
    
    // Actions
    openModal,
    closeModal,
    navigateToPage,
    setError,
    setLoading,
    updateModalData,
    changeMode,

    // Event handlers
    handleBackdropClick,
    handleContentClick,

    // Utilities
    decideBookingMode,
    getModalProps,
    
    // Analytics context for manual tracking
    analyticsContext: baseAnalyticsContext,
    
    // Computed values
    isModalMode: state.mode === "modal",
    isPageMode: state.mode === "page",
    canOpen: !state.isOpen && !state.isLoading,
    sessionTime: state.isOpen ? Date.now() - openTimeRef.current : 0,
  };
}

// Helper function to build fallback URLs
function buildFallbackUrl(context: BookingContext): string {
  const baseUrl = "/book";
  const params = new URLSearchParams();
  
  if (context.service) {
    params.set(QUERY_KEYS.topic, context.service);
  }
  
  if (context.source) {
    params.set(QUERY_KEYS.source, context.source);
  }
  
  if (context.context) {
    params.set(QUERY_KEYS.ref, context.context);
  }
  
  const queryString = params.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}