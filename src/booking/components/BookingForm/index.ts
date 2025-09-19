// src/booking/components/BookingForm/index.ts
// Barrel export for BookingForm component

export { default as BookingForm } from "./BookingForm";
export type * from "./BookingForm.types";

// Re-export commonly used types for convenience
export type {
  BookingFormProps,
  FormData,
  FormField,
  FormConfig,
  FormState,
  FormErrors,
  ValidationResult,
  FieldRendererProps,
  SubmissionConfig,
  ValidationConfig,
  UIConfig,
} from "./BookingForm.types";