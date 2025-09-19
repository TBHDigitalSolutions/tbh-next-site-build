"use client";

// src/booking/components/BookingProgress/BookingProgress.tsx
// Production-ready booking progress component

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { trackBookingProgressEvent } from "../../lib/metrics";
import { 
  calculateCompletionPercentage,
  calculateTimeRemaining,
  formatTime,
  validateNavigation,
  createProgressEventData,
  saveProgressToStorage,
} from "./lib/utils";
import styles from "./BookingProgress.module.css";
import type {
  BookingProgressProps,
  ProgressStep,
  ProgressState,
  StepStatus,
  ProgressAnalytics,
  NavigationResult,
} from "./BookingProgress.types";

// Icon components - replace with your icon library in production
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
  </svg>
);

const SkipIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M11.354 4.646a.5.5 0 0 0-.708 0l-6 6a.5.5 0 0 0 .708.708l6-6a.5.5 0 0 0 0-.708z"/>
  </svg>
);

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className={styles.loadingSpinner}>
    <path d="M10 3a7 7 0 1 0 7 7h-2a5 5 0 1 1-5-5V3z"/>
  </svg>
);

// Default props
const DEFAULT_PROPS = {
  variant: "horizontal" as const,
  position: "top" as const,
  showStepNumbers: true,
  showDescriptions: true,
  showEstimatedTime: false,
  showPercentage: true,
  enableNavigation: false,
  allowSkipping: false,
  animation: "fade" as const,
  showTimeRemaining: false,
  compactMobile: true,
  loading: false,
  disabled: false,
};

export default function BookingProgress(props: BookingProgressProps) {
  const {
    flowType,
    steps: initialSteps,
    currentStep: externalCurrentStep,
    variant = DEFAULT_PROPS.variant,
    position = DEFAULT_PROPS.position,
    showStepNumbers = DEFAULT_PROPS.showStepNumbers,
    showDescriptions = DEFAULT_PROPS.showDescriptions,
    showEstimatedTime = DEFAULT_PROPS.showEstimatedTime,
    showPercentage = DEFAULT_PROPS.showPercentage,
    enableNavigation = DEFAULT_PROPS.enableNavigation,
    allowSkipping = DEFAULT_PROPS.allowSkipping,
    animation = DEFAULT_PROPS.animation,
    className = "",
    service,
    provider,
    onStepClick,
    onNavigate,
    onTrack,
    loading = DEFAULT_PROPS.loading,
    disabled = DEFAULT_PROPS.disabled,
    customStepRenderer,
    showTimeRemaining = DEFAULT_PROPS.showTimeRemaining,
    compactMobile = DEFAULT_PROPS.compactMobile,
  } = props;

  // Internal state
  const [state, setState] = useState<ProgressState>(() => ({
    currentStep: externalCurrentStep,
    steps: [...initialSteps],
    completionPercentage: calculateCompletionPercentage(initialSteps),
    startTime: Date.now(),
    stepStartTime: Date.now(),
    navigationHistory: [externalCurrentStep],
    canNavigate: enableNavigation,
    loading: false,
  }));

  // Refs for tracking and accessibility
  const announceRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(externalCurrentStep);
  const progressRef = useRef<HTMLDivElement>(null);

  // Sync external current step with internal state
  useEffect(() => {
    if (externalCurrentStep !== state.currentStep) {
      setState(prev => ({
        ...prev,
        currentStep: externalCurrentStep,
        stepStartTime: Date.now(),
        navigationHistory: [...prev.navigationHistory, externalCurrentStep],
      }));
    }
  }, [externalCurrentStep, state.currentStep]);

  // Update steps when props change
  useEffect(() => {
    setState(prev => ({ 
      ...prev, 
      steps: [...initialSteps],
      completionPercentage: calculateCompletionPercentage(initialSteps),
    }));
  }, [initialSteps]);

  // Track step changes and handle accessibility announcements
  useEffect(() => {
    if (prevStepRef.current !== state.currentStep) {
      const currentStepData = state.steps[state.currentStep];
      
      // Track step entry
      const eventData = createProgressEventData(
        "step_enter",
        state.currentStep,
        currentStepData?.id || `step-${state.currentStep}`,
        {
          flowType,
          service,
          provider,
          totalSteps: state.steps.length,
          completionPercentage: state.completionPercentage,
        }
      );

      trackBookingProgressEvent(eventData);

      onTrack?.("booking_progress_step_enter", {
        step: state.currentStep,
        step_id: currentStepData?.id,
        flow_type: flowType,
        service,
        provider,
        completion_percentage: state.completionPercentage,
      });

      // Announce step change to screen readers
      if (announceRef.current && currentStepData) {
        announceRef.current.textContent = `Step ${state.currentStep + 1} of ${state.steps.length}: ${currentStepData.label}`;
      }

      // Save progress to storage
      if (typeof window !== 'undefined') {
        saveProgressToStorage(flowType, state.steps, state.currentStep, state.startTime, service);
      }

      prevStepRef.current = state.currentStep;
    }
  }, [state.currentStep, state.steps, state.completionPercentage, flowType, service, provider, onTrack, state.startTime]);

  // Calculate time remaining
  const timeRemaining = useMemo(() => {
    if (!showTimeRemaining) return undefined;
    return calculateTimeRemaining(state.steps, state.currentStep);
  }, [state.steps, state.currentStep, showTimeRemaining]);

  // Handle step click
  const handleStepClick = useCallback((stepIndex: number, step: ProgressStep) => {
    if (disabled || loading) return;

    // Check if step is clickable
    if (!step.clickable && !enableNavigation) return;

    // Validate navigation
    const navigationResult = validateNavigation(state.currentStep, stepIndex, state.steps);
    if (!navigationResult.success) {
      console.warn('Navigation blocked:', navigationResult.error);
      return;
    }

    // Check if navigation is allowed via callback
    if (onNavigate) {
      const canNavigate = onNavigate(state.currentStep, stepIndex);
      if (!canNavigate) return;
    }

    // Track navigation attempt
    const eventData = createProgressEventData(
      "navigation_attempt",
      stepIndex,
      step.id,
      {
        flowType,
        service,
        provider,
        totalSteps: state.steps.length,
        completionPercentage: state.completionPercentage,
      },
      { from_step: state.currentStep, to_step: stepIndex }
    );

    trackBookingProgressEvent(eventData);

    // Update current step
    setState(prev => ({
      ...prev,
      currentStep: stepIndex,
      stepStartTime: Date.now(),
      navigationHistory: [...prev.navigationHistory, stepIndex],
    }));

    onStepClick?.(stepIndex, step);
  }, [disabled, loading, enableNavigation, onNavigate, state.currentStep, state.steps, state.completionPercentage, flowType, service, provider, onStepClick]);

  // Skip current step
  const skipCurrentStep = useCallback(() => {
    if (!allowSkipping || disabled || loading) return;

    const currentStepData = state.steps[state.currentStep];
    if (!currentStepData?.optional) return;

    setState(prev => {
      const newSteps = [...prev.steps];
      newSteps[state.currentStep] = { ...newSteps[state.currentStep], status: 'skipped' };
      
      return {
        ...prev,
        steps: newSteps,
        completionPercentage: calculateCompletionPercentage(newSteps),
      };
    });

    // Track step skip
    const eventData = createProgressEventData(
      "step_skip",
      state.currentStep,
      currentStepData.id,
      {
        flowType,
        service,
        provider,
        totalSteps: state.steps.length,
        completionPercentage: state.completionPercentage,
      }
    );

    trackBookingProgressEvent(eventData);

    onTrack?.("booking_progress_step_skip", {
      step: state.currentStep,
      step_id: currentStepData.id,
      flow_type: flowType,
    });
  }, [allowSkipping, disabled, loading, state.currentStep, state.steps, flowType, service, provider, state.completionPercentage, onTrack]);

  // Navigate to next step
  const goToNextStep = useCallback(() => {
    if (state.currentStep < state.steps.length - 1) {
      handleStepClick(state.currentStep + 1, state.steps[state.currentStep + 1]);
    }
  }, [state.currentStep, state.steps, handleStepClick]);

  // Navigate to previous step
  const goToPreviousStep = useCallback(() => {
    if (state.currentStep > 0) {
      handleStepClick(state.currentStep - 1, state.steps[state.currentStep - 1]);
    }
  }, [state.currentStep, state.steps, handleStepClick]);

  // Get step icon based on status and settings
  const getStepIcon = useCallback((step: ProgressStep, index: number): React.ReactNode => {
    if (step.icon) {
      if (typeof step.icon === 'string') {
        return <span className={styles.customIcon}>{step.icon}</span>;
      }
      const IconComponent = step.icon;
      return <IconComponent />;
    }

    switch (step.status) {
      case 'completed':
        return <CheckIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'skipped':
        return <SkipIcon />;
      default:
        return showStepNumbers ? (
          <span className={styles.stepNumber}>{index + 1}</span>
        ) : (
          <span className={styles.stepNumber}>•</span>
        );
    }
  }, [showStepNumbers]);

  // Render individual step
  const renderStep = useCallback((step: ProgressStep, index: number): React.ReactNode => {
    const isActive = index === state.currentStep;
    const isClickable = (step.clickable || enableNavigation) && !disabled && !loading;

    // Use custom renderer if provided
    if (customStepRenderer) {
      return customStepRenderer(step, index, isActive);
    }

    return (
      <div
        key={step.id}
        className={`
          ${styles.step}
          ${styles[variant]}
          ${isClickable ? styles.clickable : ""}
          ${animation !== "none" ? styles[animation] : ""}
          ${step.className || ""}
        `.trim()}
        onClick={() => isClickable && handleStepClick(index, step)}
        onKeyDown={(e) => {
          if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleStepClick(index, step);
          }
        }}
        tabIndex={isClickable ? 0 : -1}
        role={isClickable ? "button" : undefined}
        aria-label={`Step ${index + 1}: ${step.label}${step.status ? ` (${step.status})` : ""}`}
        aria-current={isActive ? "step" : undefined}
        aria-describedby={step.description ? `step-${index}-desc` : undefined}
      >
        <div className={`${styles.stepIcon} ${styles[step.status]}`}>
          {state.loading && isActive ? (
            <LoadingSpinner />
          ) : (
            getStepIcon(step, index)
          )}
        </div>

        <div className={`${styles.stepContent} ${variant === 'vertical' ? styles.vertical : ""}`}>
          <h3 className={styles.stepLabel}>{step.label}</h3>
          
          {showDescriptions && step.description && (
            <p id={`step-${index}-desc`} className={styles.stepDescription}>{step.description}</p>
          )}

          {step.errorMessage && (
            <p className={styles.errorMessage} role="alert">{step.errorMessage}</p>
          )}

          <div className={styles.stepMeta}>
            {showEstimatedTime && step.estimatedTime && (
              <span className={styles.estimatedTime}>
                <ClockIcon />
                {formatTime(step.estimatedTime)}
              </span>
            )}
            
            {step.optional && (
              <span className={styles.optional}>Optional</span>
            )}
          </div>
        </div>
      </div>
    );
  }, [
    state.currentStep,
    state.loading,
    variant,
    enableNavigation,
    disabled,
    loading,
    animation,
    customStepRenderer,
    handleStepClick,
    getStepIcon,
    showDescriptions,
    showEstimatedTime,
  ]);

  // Render circular progress variant
  const renderCircularProgress = useCallback(() => {
    const circumference = 2 * Math.PI * 70; // radius = 70
    const strokeDashoffset = circumference - (state.completionPercentage / 100) * circumference;

    return (
      <div className={styles.circularProgress}>
        <svg className={styles.circularSvg} viewBox="0 0 160 160" role="img" aria-label={`${Math.round(state.completionPercentage)}% complete`}>
          <circle
            className={styles.circularBackground}
            cx="80"
            cy="80"
            r="70"
          />
          <circle
            className={styles.circularForeground}
            cx="80"
            cy="80"
            r="70"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className={styles.circularContent}>
          <div className={styles.circularPercentage}>
            {Math.round(state.completionPercentage)}%
          </div>
          <div className={styles.circularLabel}>
            Step {state.currentStep + 1} of {state.steps.length}
          </div>
        </div>
      </div>
    );
  }, [state.completionPercentage, state.currentStep, state.steps.length]);

  // Render horizontal or vertical progress
  const renderLinearProgress = useCallback(() => {
    const progressPercentage = state.steps.length > 0 
      ? ((state.currentStep) / (state.steps.length - 1)) * 100 
      : 0;

    return (
      <div className={`${styles.stepsContainer} ${styles[variant]}`}>
        {variant !== 'compact' && (
          <div className={`${styles.progressLine} ${styles[variant]}`} role="presentation">
            <div 
              className={styles.progressLineFill}
              style={{ 
                [variant === 'vertical' ? 'height' : 'width']: `${Math.max(progressPercentage, 0)}%` 
              }}
            />
          </div>
        )}
        
        {state.steps.map((step, index) => renderStep(step, index))}
      </div>
    );
  }, [state.steps, state.currentStep, variant, renderStep]);

  // Get flow title based on type
  const getFlowTitle = useCallback(() => {
    switch (flowType) {
      case 'simple': return 'Booking Progress';
      case 'detailed': return 'Complete Your Booking';
      case 'consultation': return 'Schedule Consultation';
      case 'quote': return 'Request Quote';
      case 'custom': return 'Progress';
      default: return 'Progress';
    }
  }, [flowType]);

  // Main render method
  const progressClasses = `
    ${styles.progress}
    ${styles[variant]}
    ${position ? styles[position] : ""}
    ${loading ? styles.loading : ""}
    ${disabled ? styles.disabled : ""}
    ${compactMobile ? styles.compactMobile : ""}
    ${className}
  `.trim();

  return (
    <div 
      ref={progressRef}
      className={progressClasses} 
      role="progressbar" 
      aria-valuenow={state.completionPercentage} 
      aria-valuemin={0} 
      aria-valuemax={100}
      aria-label={`${getFlowTitle()}: ${Math.round(state.completionPercentage)}% complete`}
    >
      {/* Screen reader announcements */}
      <div 
        ref={announceRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Progress header */}
      {(variant === 'detailed' || showPercentage || showTimeRemaining) && (
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {getFlowTitle()}
            </h2>
            <p className={styles.subtitle}>
              Step {state.currentStep + 1} of {state.steps.length}
            </p>
          </div>

          <div className={styles.progressInfo}>
            {showPercentage && (
              <span className={styles.percentage}>
                {Math.round(state.completionPercentage)}%
              </span>
            )}
            
            {showTimeRemaining && timeRemaining && (
              <span className={styles.timeRemaining}>
                <ClockIcon />
                {formatTime(timeRemaining)} remaining
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress visualization */}
      {variant === 'circular' ? renderCircularProgress() : renderLinearProgress()}

      {/* Navigation controls */}
      {enableNavigation && !loading && (
        <div className={styles.navigation}>
          <button
            className={styles.navButton}
            onClick={goToPreviousStep}
            disabled={state.currentStep === 0}
            aria-label="Go to previous step"
          >
            <ArrowLeftIcon />
            Previous
          </button>

          <div className={styles.stepIndicators}>
            {state.steps.map((_, index) => (
              <div
                key={index}
                className={`
                  ${styles.stepDot}
                  ${index === state.currentStep ? styles.current : ""}
                  ${index < state.currentStep ? styles.completed : ""}
                `.trim()}
                aria-label={`Step ${index + 1}${index === state.currentStep ? ' (current)' : index < state.currentStep ? ' (completed)' : ''}`}
              />
            ))}
          </div>

          {allowSkipping && state.steps[state.currentStep]?.optional ? (
            <button
              className={styles.navButton}
              onClick={skipCurrentStep}
              aria-label="Skip this optional step"
            >
              Skip
              <ArrowRightIcon />
            </button>
          ) : (
            <button
              className={`${styles.navButton} ${styles.primary}`}
              onClick={goToNextStep}
              disabled={state.currentStep === state.steps.length - 1}
              aria-label="Go to next step"
            >
              Next
              <ArrowRightIcon />
            </button>
          )}
        </div>
      )}

      {/* Error state */}
      {state.error && (
        <div className={styles.errorState} role="alert">
          <h4 className={styles.errorTitle}>Progress Error</h4>
          <p className={styles.errorDescription}>{state.error}</p>
        </div>
      )}
    </div>
  );
}