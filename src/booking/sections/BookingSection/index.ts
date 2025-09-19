// src/booking/sections/BookingSection/index.ts
// Barrel export for BookingSection orchestrator

// Main component
export { default as BookingSection } from "./BookingSection";
export { default } from "./BookingSection";

// Types
export type {
  BookingSectionProps,
  BookingResult,
  BookingError,
  BookingStep,
  BookingSectionState,
  BookingSectionWrapperProps,
  BookingVariantConfig,
  UseBookingSectionReturn,
  BookingAnalyticsContext,
} from "./BookingSection.types";

// Validation utilities
export {
  validateBookingSectionProps,
  validateBookingResult,
  validateBookingError,
  validateVariantConfiguration,
  validateInDevelopment,
  debugBookingSectionProps,
} from "./utils/bookingSectionValidator";