// src/booking/hooks/index.ts
// Barrel export for booking hooks - public API

// Main booking hooks
export { 
  useBookingFlow,
  type UseBookingFlowOptions,
  type BookingFlowState,
  type BookingFlowStep 
} from "./useBookingFlow";

export { 
  useBookingAnalytics,
  type UseBookingAnalyticsOptions,
  type BookingEventData,
  type ConversionEventData,
  type ErrorEventData 
} from "./useBookingAnalytics";

export { 
  useBookingModal,
  type UseBookingModalOptions,
  type BookingModalState,
  type OpenModalOptions 
} from "./useBookingModal";

// Re-export related types from lib for convenience
export type { 
  BookingVariant,
  BookingProvider,
  CanonicalService,
  BookingSectionProps,
  BookingResult,
  BookingError 
} from "../lib/types";

export type { 
  BookingMode,
  BookingModeOptions,
  BookingContext 
} from "../lib/bookingPolicy";