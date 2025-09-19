// src/booking/sections/BookingSection/BookingSection.types.ts
// Types for BookingSection orchestrator component

import type { ReactNode } from "react";
import type { CanonicalService } from "@/shared/services/types";
import type {
  BookingVariant,
  CalendarProviderConfig,
  IntakeFormSpec,
  Prefill,
} from "@/booking/lib/types";

// Base props for all booking results
export interface BookingResult {
  id: string;
  service: CanonicalService;
  provider: string;
  meetingType: string;
  startTime: string;
  endTime: string;
  duration: number;
  timezone: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
  };
  location?: {
    type: "video" | "phone" | "in-person";
    details: Record<string, any>;
  };
  status: "confirmed" | "pending" | "cancelled";
  referenceNumber?: string;
  notes?: string;
}

// Booking error interface
export interface BookingError {
  code: string;
  message: string;
  details?: Record<string, any>;
  retry?: boolean;
  fallbackAction?: {
    label: string;
    href: string;
  };
}

// Progress step for multi-step flows
export interface BookingStep {
  id: string;
  label: string;
  description?: string;
  isComplete: boolean;
  isCurrent: boolean;
  isClickable?: boolean;
}

// Analytics context for tracking
export interface BookingAnalyticsContext {
  context?: string; // e.g., 'booking_modal' | 'booking_page'
  source?: string; // referrer context
  campaign?: string;
  [key: string]: any;
}

// Core section props that orchestrate different booking experiences
export interface BookingSectionProps {
  /** The booking experience variant to render */
  variant: BookingVariant;
  
  /** Service being booked (determines defaults and configurations) */
  service?: CanonicalService;
  
  /** Calendar/provider configuration for embed and calendar variants */
  calendar?: CalendarProviderConfig;
  
  /** Form specification for form variant */
  intake?: IntakeFormSpec;
  
  /** Pre-fill data for forms and embeds */
  prefill?: Prefill;
  
  /** Navigation URLs */
  successHref?: string;
  cancelHref?: string;
  
  /** Analytics context */
  analyticsContext?: string;
  
  /** Called when booking is successfully completed */
  onSuccess?: (result: BookingResult) => void;
  
  /** Called when an error occurs during booking */
  onError?: (error: BookingError) => void;
  
  /** Called when user cancels/exits the booking flow */
  onCancel?: () => void;
  
  /** Show progress indicator for multi-step flows */
  showProgress?: boolean;
  
  /** Custom progress steps (optional, falls back to defaults) */
  progressSteps?: BookingStep[];
  
  /** Enable debug mode (development only) */
  debug?: boolean;
  
  /** Custom class name for styling */
  className?: string;
  
  /** Disable the entire section */
  disabled?: boolean;
  
  /** Loading state override */
  loading?: boolean;
  
  /** Custom loading component */
  LoadingComponent?: () => ReactNode;
  
  /** Custom error component */
  ErrorComponent?: (props: { error: BookingError; retry: () => void }) => ReactNode;
  
  /** Test ID for QA */
  "data-testid"?: string;
}

// Props for the wrapper/container
export interface BookingSectionWrapperProps {
  /** Child components to render */
  children: ReactNode;
  
  /** Analytics context */
  analyticsContext?: BookingAnalyticsContext;
  
  /** Class name for styling */
  className?: string;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: BookingError;
  
  /** Disable interactions */
  disabled?: boolean;
  
  /** Test ID */
  "data-testid"?: string;
}

// Internal state for the orchestrator
export interface BookingSectionState {
  currentVariant: BookingVariant;
  isLoading: boolean;
  error?: BookingError;
  result?: BookingResult;
  currentStep?: string;
  retryCount: number;
  hasInitialized: boolean;
}

// Configuration options for different variants
export interface BookingVariantConfig {
  variant: BookingVariant;
  component: ReactNode;
  props: Record<string, any>;
  fallbackVariant?: BookingVariant;
  requirements?: {
    calendar?: boolean;
    intake?: boolean;
    prefill?: boolean;
  };
}

// Hook return type for useBookingSection
export interface UseBookingSectionReturn {
  state: BookingSectionState;
  actions: {
    setVariant: (variant: BookingVariant) => void;
    retry: () => void;
    reset: () => void;
    handleSuccess: (result: BookingResult) => void;
    handleError: (error: BookingError) => void;
  };
  computed: {
    canRender: boolean;
    shouldShowFallback: boolean;
    currentConfig?: BookingVariantConfig;
    analyticsData: BookingAnalyticsContext;
  };
}