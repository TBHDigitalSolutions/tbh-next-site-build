// src/booking/sections/BookingSection/utils/bookingSectionValidator.ts
// Validation utilities for BookingSection component props and state

import { z } from "zod";
import { CANONICAL_SERVICES } from "@/shared/services/constants";
import type { 
  BookingSectionProps, 
  BookingResult, 
  BookingError,
  BookingStep,
  BookingSectionState 
} from "../BookingSection.types";

// ============================================================================
// Zod Schemas
// ============================================================================

// Canonical service schema
const canonicalServiceSchema = z.enum(
  CANONICAL_SERVICES as unknown as [string, ...string[]]
);

// Booking variant schema
const bookingVariantSchema = z.enum(["embed", "form", "calendar"]);

// Booking provider schema
const bookingProviderSchema = z.enum(["cal", "calendly", "custom"]);

// Calendar provider config schema
const calendarProviderConfigSchema = z.object({
  provider: bookingProviderSchema,
  service: canonicalServiceSchema,
  eventTypeId: z.string().optional(),
  organization: z.string().optional(),
  eventSlug: z.string().optional(),
  fallbackHref: z.string().url("Fallback URL must be valid").optional(),
  params: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

// Intake field schema
const intakeFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "email", "textarea", "select", "checkbox"]),
  required: z.boolean().optional(),
  options: z.array(z.object({
    label: z.string().min(1),
    value: z.string().min(1),
  })).optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  validate: z.string().optional(),
});

// Intake form spec schema
const intakeFormSpecSchema = z.object({
  service: canonicalServiceSchema,
  fields: z.array(intakeFieldSchema).min(1, "At least one field is required"),
  consent: z.object({
    privacyPolicyHref: z.string().url("Privacy policy must be a valid URL"),
    termsHref: z.string().url("Terms URL must be valid").optional(),
    marketingOptIn: z.boolean().optional(),
  }),
});

// Prefill schema
const prefillSchema = z.object({
  name: z.string().max(100, "Name must be under 100 characters").optional(),
  email: z.string().email("Must be a valid email address").optional(),
  timezone: z.string().optional(),
  notes: z.string().max(1000, "Notes must be under 1000 characters").optional(),
  ref: z.string().optional(),
  topic: z.string().optional(),
});

// Booking result schema
const bookingResultSchema = z.object({
  id: z.string().min(1, "Booking ID is required"),
  service: canonicalServiceSchema,
  provider: z.string().min(1, "Provider is required"),
  meetingType: z.string().min(1, "Meeting type is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  duration: z.number().positive("Duration must be positive"),
  timezone: z.string().min(1, "Timezone is required"),
  customer: z.object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional(),
    company: z.string().optional(),
  }),
  location: z.object({
    type: z.enum(["video", "phone", "in-person"]),
    details: z.record(z.any()),
  }).optional(),
  status: z.enum(["confirmed", "pending", "cancelled"]),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

// Booking error schema
const bookingErrorSchema = z.object({
  code: z.string().min(1, "Error code is required"),
  message: z.string().min(1, "Error message is required"),
  details: z.record(z.any()).optional(),
  retry: z.boolean().optional(),
  fallbackAction: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }).optional(),
});

// Main BookingSection props schema
const bookingSectionPropsSchema = z.object({
  variant: bookingVariantSchema,
  service: canonicalServiceSchema.optional(),
  calendar: calendarProviderConfigSchema.optional(),
  intake: intakeFormSpecSchema.optional(),
  prefill: prefillSchema.optional(),
  successHref: z.string().url("Success URL must be valid").optional(),
  cancelHref: z.string().url("Cancel URL must be valid").optional(),
  analyticsContext: z.string().optional(),
  onSuccess: z.function().optional(),
  onError: z.function().optional(),
  onCancel: z.function().optional(),
  showProgress: z.boolean().optional(),
  progressSteps: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    description: z.string().optional(),
    isComplete: z.boolean(),
    isCurrent: z.boolean(),
    isClickable: z.boolean().optional(),
  })).optional(),
  debug: z.boolean().optional(),
  className: z.string().optional(),
  disabled: z.boolean().optional(),
  loading: z.boolean().optional(),
  LoadingComponent: z.function().optional(),
  ErrorComponent: z.function().optional(),
  "data-testid": z.string().optional(),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates BookingSection props
 */
export function validateBookingSectionProps(
  props: unknown
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    bookingSectionPropsSchema.parse(props);
    
    // Additional business logic validation
    const typedProps = props as BookingSectionProps;
    
    // Variant-specific validation
    if (typedProps.variant === "embed" && !typedProps.calendar) {
      errors.push("Calendar configuration is required for embed variant");
    }
    
    if (typedProps.variant === "form" && !typedProps.intake) {
      errors.push("Intake form specification is required for form variant");
    }
    
    if (typedProps.variant === "calendar" && !typedProps.calendar) {
      errors.push("Calendar configuration is required for calendar variant");
    }
    
    // Service compatibility warnings
    if (typedProps.service && typedProps.calendar?.service) {
      if (typedProps.service !== typedProps.calendar.service) {
        warnings.push("Service mismatch between props.service and calendar.service");
      }
    }
    
    if (typedProps.service && typedProps.intake?.service) {
      if (typedProps.service !== typedProps.intake.service) {
        warnings.push("Service mismatch between props.service and intake.service");
      }
    }
    
    return { isValid: errors.length === 0, errors, warnings };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
        warnings,
      };
    }
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
      warnings,
    };
  }
}

/**
 * Validates booking result data
 */
export function validateBookingResult(
  result: unknown
): { isValid: boolean; errors: string[] } {
  try {
    bookingResultSchema.parse(result);
    
    // Additional validation
    const typedResult = result as BookingResult;
    const errors: string[] = [];
    
    // Date validation
    const startTime = new Date(typedResult.startTime);
    const endTime = new Date(typedResult.endTime);
    
    if (isNaN(startTime.getTime())) {
      errors.push("Invalid start time format");
    }
    
    if (isNaN(endTime.getTime())) {
      errors.push("Invalid end time format");
    }
    
    if (startTime >= endTime) {
      errors.push("End time must be after start time");
    }
    
    // Duration consistency check
    if (startTime.getTime() && endTime.getTime()) {
      const calculatedDuration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
      if (Math.abs(calculatedDuration - typedResult.duration) > 1) {
        errors.push("Duration doesn't match start/end times");
      }
    }
    
    return { isValid: errors.length === 0, errors };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        isValid: false,
        errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
    };
  }
}

/**
 * Validates booking error data
 */
export function validateBookingError(
  error: unknown
): { isValid: boolean; errors: string[] } {
  try {
    bookingErrorSchema.parse(error);
    return { isValid: true, errors: [] };
  } catch (validationError) {
    if (validationError instanceof z.ZodError) {
      return {
        isValid: false,
        errors: validationError.errors.map(e => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return {
      isValid: false,
      errors: [validationError instanceof Error ? validationError.message : "Unknown validation error"],
    };
  }
}

/**
 * Development-only validation helper
 */
export function validateInDevelopment<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  componentName = "BookingSection"
): T {
  if (process.env.NODE_ENV === "development") {
    try {
      return schema.parse(data);
    } catch (error) {
      console.warn(`${componentName} validation failed:`, error);
      throw error;
    }
  }
  return data as T;
}

/**
 * Check if a variant configuration is valid
 */
export function validateVariantConfiguration(
  variant: string,
  props: BookingSectionProps
): { canRender: boolean; missingRequirements: string[]; suggestions: string[] } {
  const missingRequirements: string[] = [];
  const suggestions: string[] = [];

  switch (variant) {
    case "embed":
      if (!props.calendar) {
        missingRequirements.push("calendar configuration");
        suggestions.push("Add calendar provider config or switch to 'form' variant");
      }
      break;
      
    case "form":
      if (!props.intake) {
        missingRequirements.push("intake form specification");
        suggestions.push("Add intake form config or switch to 'embed' variant");
      }
      break;
      
    case "calendar":
      if (!props.calendar) {
        missingRequirements.push("calendar configuration");
        suggestions.push("Add calendar provider config or switch to 'form' variant");
      }
      break;
      
    default:
      missingRequirements.push(`unknown variant '${variant}'`);
      suggestions.push("Use 'embed', 'form', or 'calendar'");
  }

  return {
    canRender: missingRequirements.length === 0,
    missingRequirements,
    suggestions,
  };
}

/**
 * Debug utility for development
 */
export function debugBookingSectionProps(props: BookingSectionProps, label = "BookingSection"): void {
  if (process.env.NODE_ENV !== "development") return;

  console.group(`🔍 ${label} Props Debug`);
  console.log("Variant:", props.variant);
  console.log("Service:", props.service || "not specified");
  console.log("Has Calendar:", !!props.calendar);
  console.log("Has Intake:", !!props.intake);
  console.log("Has Prefill:", !!props.prefill);
  
  const validation = validateBookingSectionProps(props);
  if (!validation.isValid) {
    console.warn("❌ Validation Errors:", validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn("⚠️ Warnings:", validation.warnings);
  }
  
  const variantCheck = validateVariantConfiguration(props.variant, props);
  if (!variantCheck.canRender) {
    console.warn("❌ Cannot Render:", variantCheck.missingRequirements);
    console.log("💡 Suggestions:", variantCheck.suggestions);
  }
  
  console.groupEnd();
}