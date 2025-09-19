// src/booking/components/BookingConfirmation/index.ts
// Barrel export for BookingConfirmation component

export { default as BookingConfirmation } from "./BookingConfirmation";
export type * from "./BookingConfirmation.types";

// Re-export commonly used types for convenience
export type {
  BookingConfirmationProps,
  ConfirmedBooking,
  BookingActions,
  PreparationInfo,
  FollowUpInfo,
  CustomerInfo,
  MeetingLocation,
  BookingStatus,
  BookingPricing,
} from "./BookingConfirmation.types";