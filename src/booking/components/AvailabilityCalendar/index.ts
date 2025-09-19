// src/booking/components/AvailabilityCalendar/index.ts
// Barrel export for AvailabilityCalendar component

export { default as AvailabilityCalendar } from "./AvailabilityCalendar";
export type * from "./AvailabilityCalendar.types";

// Re-export commonly used types for convenience
export type {
  AvailabilityCalendarProps,
  TimeSlot,
  DayAvailability,
  CalendarView,
  CalendarConfig,
  SelectionMode,
  TimeFormat,
  LoadingState,
} from "./AvailabilityCalendar.types";