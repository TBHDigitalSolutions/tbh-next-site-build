// src/booking/hooks/useBookingFlow.ts
// Manages booking flow state, form progression, and provider interactions

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { 
  trackBookingFunnel, 
  createPerformanceTracker,
  createAnalyticsContext 
} from "../lib/metrics";
import { ERROR_CODES, TIMEOUTS } from "../lib/constants";
import { getUserTimezone, generateId } from "../lib/utils";
import type { 
  BookingSectionProps, 
  BookingVariant, 
  BookingProvider,
  BookingResult,
  BookingError,
  CanonicalService 
} from "../lib/types";

// Flow state management
export type BookingFlowStep = 
  | "initial"
  | "selecting" 
  | "form"
  | "calendar"
  | "confirming"
  | "submitting"
  | "success"
  | "error";

export interface BookingFlowState {
  step: BookingFlowStep;
  variant: BookingVariant;
  service?: CanonicalService;
  provider?: BookingProvider;
  isLoading: boolean;
  error?: BookingError;
  result?: BookingResult;
  formData: Record<string, any>;
  timeSpent: number;
  sessionId: string;
}

export interface UseBookingFlowOptions {
  /** Initial booking section props */
  initialProps: BookingSectionProps;
  /** Callback when booking is successfully completed */
  onSuccess?: (result: BookingResult) => void;
  /** Callback when booking encounters an error */
  onError?: (error: BookingError) => void;
  /** Callback when user abandons the flow */
  onAbandon?: (step: BookingFlowStep, timeSpent: number) => void;
  /** Enable automatic abandonment tracking */
  trackAbandonment?: boolean;
  /** Abandonment timeout in milliseconds */
  abandonmentTimeout?: number;
}

export function useBookingFlow(options: UseBookingFlowOptions) {
  const {
    initialProps,
    onSuccess,
    onError,
    onAbandon,
    trackAbandonment = true,
    abandonmentTimeout = 300000, // 5 minutes
  } = options;

  // Core state
  const [state, setState] = useState<BookingFlowState>(() => ({
    step: "initial",
    variant: initialProps.variant,
    service: initialProps.service,
    provider: initialProps.calendar?.provider,
    isLoading: false,
    formData: initialProps.prefill || {},
    timeSpent: 0,
    sessionId: generateId("flow"),
  }));

  // Refs for tracking
  const startTimeRef = useRef<number>(Date.now());
  const performanceTracker = useRef(createPerformanceTracker());
  const abandonmentTimerRef = useRef<NodeJS.Timeout>();
  const isActiveRef = useRef(true);

  // Analytics context
  const analyticsContext = createAnalyticsContext({
    service: state.service,
    variant: state.variant,
    source: initialProps.analyticsContext,
    sessionId: state.sessionId,
  });

  // Update time spent
  useEffect(() => {
    const interval = setInterval(() => {
      if (isActiveRef.current && state.step !== "success" && state.step !== "error") {
        setState(prev => ({
          ...prev,
          timeSpent: Date.now() - startTimeRef.current,
        }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.step]);

  // Abandonment tracking
  useEffect(() => {
    if (!trackAbandonment) return;

    const resetTimer = () => {
      if (abandonmentTimerRef.current) {
        clearTimeout(abandonmentTimerRef.current);
      }
      
      if (state.step !== "success" && state.step !== "error") {
        abandonmentTimerRef.current = setTimeout(() => {
          handleAbandon("timeout");
        }, abandonmentTimeout);
      }
    };

    resetTimer();

    // Reset timer on user activity
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    const resetOnActivity = () => resetTimer();
    
    events.forEach(event => {
      document.addEventListener(event, resetOnActivity, true);
    });

    return () => {
      if (abandonmentTimerRef.current) {
        clearTimeout(abandonmentTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, resetOnActivity, true);
      });
    };
  }, [state.step, trackAbandonment, abandonmentTimeout]);

  // Page unload abandonment tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state.step !== "success" && state.step !== "error") {
        handleAbandon("page_unload", false); // Don't trigger callbacks on unload
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.step]);

  // Flow control functions
  const updateState = useCallback((updates: Partial<BookingFlowState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setStep = useCallback((step: BookingFlowStep) => {
    setState(prev => ({ ...prev, step }));
    
    // Track step progression
    trackBookingFunnel.formProgress({
      ...analyticsContext,
      step: getStepNumber(step),
      stepName: step,
      direction: "forward",
      timeSpent: Date.now() - startTimeRef.current,
    });

    // Performance marks
    performanceTracker.current.mark(step);
  }, [analyticsContext]);

  const setVariant = useCallback((variant: BookingVariant) => {
    updateState({ variant });
    
    trackBookingFunnel.formProgress({
      ...analyticsContext,
      variant,
      action: "variant_change",
    });
  }, [analyticsContext, updateState]);

  const setProvider = useCallback((provider: BookingProvider) => {
    updateState({ provider });
    
    trackBookingFunnel.providerLoad({
      ...analyticsContext,
      provider,
    });
  }, [analyticsContext, updateState]);

  const updateFormData = useCallback((data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    updateState({ isLoading });
  }, [updateState]);

  const handleSuccess = useCallback((result: BookingResult) => {
    isActiveRef.current = false;
    const totalTime = Date.now() - startTimeRef.current;
    
    updateState({
      step: "success",
      result,
      isLoading: false,
      error: undefined,
      timeSpent: totalTime,
    });

    // Track success
    trackBookingFunnel.success({
      ...analyticsContext,
      provider: result.provider,
      eventId: result.eventId,
      scheduledAt: result.scheduledAt,
      timezone: result.timezone,
      totalTime,
      conversionTime: totalTime,
    });

    // Performance measurement
    performanceTracker.current.mark("success");
    performanceTracker.current.measure("booking_completion", "initial", "success");

    onSuccess?.(result);
  }, [analyticsContext, updateState, onSuccess]);

  const handleError = useCallback((error: BookingError) => {
    const totalTime = Date.now() - startTimeRef.current;
    
    updateState({
      step: "error",
      error,
      isLoading: false,
      timeSpent: totalTime,
    });

    // Track error
    trackBookingFunnel.error({
      ...analyticsContext,
      code: error.code,
      message: error.message,
      provider: error.provider,
      step: state.step,
      timeSpent: totalTime,
    });

    onError?.(error);
  }, [analyticsContext, updateState, onError, state.step]);

  const handleAbandon = useCallback((reason: string, triggerCallback = true) => {
    if (state.step === "success" || state.step === "error") return;

    isActiveRef.current = false;
    const totalTime = Date.now() - startTimeRef.current;
    
    // Calculate completion percentage
    const stepNumber = getStepNumber(state.step);
    const totalSteps = 6; // approximate total steps in flow
    const completionPercentage = Math.round((stepNumber / totalSteps) * 100);

    trackBookingFunnel.abandon({
      ...analyticsContext,
      step: state.step,
      timeSpent: totalTime,
      completionPercentage,
      reason,
    });

    if (triggerCallback) {
      onAbandon?.(state.step, totalTime);
    }
  }, [analyticsContext, state.step, onAbandon]);

  const restart = useCallback(() => {
    setState(prev => ({
      ...prev,
      step: "initial",
      isLoading: false,
      error: undefined,
      result: undefined,
      formData: initialProps.prefill || {},
      timeSpent: 0,
      sessionId: generateId("flow"),
    }));

    startTimeRef.current = Date.now();
    performanceTracker.current = createPerformanceTracker();
    isActiveRef.current = true;

    trackBookingFunnel.start({
      ...analyticsContext,
      action: "restart",
    });
  }, [analyticsContext, initialProps.prefill]);

  const goBack = useCallback(() => {
    const currentStepNumber = getStepNumber(state.step);
    if (currentStepNumber > 0) {
      const previousStep = getStepFromNumber(currentStepNumber - 1);
      setStep(previousStep);
      
      trackBookingFunnel.formProgress({
        ...analyticsContext,
        step: currentStepNumber - 1,
        stepName: previousStep,
        direction: "backward",
      });
    }
  }, [state.step, analyticsContext, setStep]);

  // Provider-specific handlers
  const handleProviderLoad = useCallback((provider: BookingProvider, loadTime?: number) => {
    trackBookingFunnel.providerLoad({
      ...analyticsContext,
      provider,
      loadTime,
      success: true,
    });
  }, [analyticsContext]);

  const handleProviderError = useCallback((provider: BookingProvider, error: string) => {
    const bookingError: BookingError = {
      code: ERROR_CODES.PROVIDER_LOAD_FAILED,
      message: error,
      provider,
      service: state.service,
      context: state.step,
    };
    
    handleError(bookingError);
  }, [state.service, state.step, handleError]);

  // Form submission handler
  const submitBooking = useCallback(async (additionalData?: Record<string, any>) => {
    setLoading(true);
    setStep("submitting");

    const submissionData = {
      ...state.formData,
      ...additionalData,
      service: state.service,
      provider: state.provider,
      variant: state.variant,
      timezone: getUserTimezone(),
      sessionId: state.sessionId,
    };

    try {
      trackBookingFunnel.submit({
        ...analyticsContext,
        fieldsPresent: Object.keys(submissionData),
        provider: state.provider,
      });

      // Here you would integrate with your actual booking API
      // For now, simulate success
      const result: BookingResult = {
        provider: state.provider || "custom",
        service: state.service || "web-development-services",
        eventId: generateId("event"),
        scheduledAt: new Date().toISOString(),
        timezone: getUserTimezone(),
        attendeeEmail: submissionData.email,
      };

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      handleSuccess(result);
    } catch (error) {
      const bookingError: BookingError = {
        code: ERROR_CODES.NETWORK_ERROR,
        message: error instanceof Error ? error.message : "Submission failed",
        provider: state.provider,
        service: state.service,
        context: "submitting",
      };
      
      handleError(bookingError);
    }
  }, [
    state.formData, 
    state.service, 
    state.provider, 
    state.variant, 
    state.sessionId,
    analyticsContext,
    setLoading,
    setStep,
    handleSuccess,
    handleError
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abandonmentTimerRef.current) {
        clearTimeout(abandonmentTimerRef.current);
      }
    };
  }, []);

  return {
    // State
    state,
    
    // Flow control
    setStep,
    setVariant,
    setProvider,
    updateFormData,
    setLoading,
    
    // Actions
    submitBooking,
    restart,
    goBack,
    
    // Handlers
    handleSuccess,
    handleError,
    handleAbandon,
    handleProviderLoad,
    handleProviderError,
    
    // Computed values
    canGoBack: getStepNumber(state.step) > 0,
    progress: Math.round((getStepNumber(state.step) / 6) * 100),
    isComplete: state.step === "success",
    hasError: state.step === "error",
  };
}

// Helper functions
function getStepNumber(step: BookingFlowStep): number {
  const steps: BookingFlowStep[] = ["initial", "selecting", "form", "calendar", "confirming", "submitting", "success", "error"];
  return steps.indexOf(step);
}

function getStepFromNumber(stepNumber: number): BookingFlowStep {
  const steps: BookingFlowStep[] = ["initial", "selecting", "form", "calendar", "confirming", "submitting", "success", "error"];
  return steps[stepNumber] || "initial";
}