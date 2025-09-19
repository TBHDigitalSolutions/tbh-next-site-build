// src/booking/sections/BookingOptionsSection/index.ts
// Barrel export for BookingOptionsSection

// Main component
export { default as BookingOptionsSection } from "./BookingOptionsSection";
export { default } from "./BookingOptionsSection";

// Types
export type {
  BookingOptionsSectionProps,
  BookingOption,
  BookingOptionsSectionState,
  OptionsLayout,
  OptionsLayoutConfig,
  OptionSelectionMode,
  SelectionState,
  OptionsA11y,
  OptionsTheme,
  OptionsLoadingState,
  OptionsAnalytics,
  ProviderOptionData,
  OptionActions,
  Price,
  Badge,
  Tag,
  CurrencyCode,
  BookingOptionsDerived,
  UseBookingOptionsReturn,
  UseBookingOptionsConfig,
} from "./BookingOptionsSection.types";

// Validation utilities
export {
  validateBookingOptionsSectionProps,
  validateBookingOption,
  validateProviderOptionData,
  validateSelectionState,
  validateInDevelopment,
  debugBookingOptionsProps,
  createMockBookingOption,
} from "./utils/bookingOptionsValidator";