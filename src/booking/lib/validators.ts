// src/booking/lib/validators.ts
// Domain validation schemas using Zod
// Keep runtime light in prod - only validate in development

import { z } from "zod";
import { CANONICAL_SERVICES } from "@/shared/services/constants";
import { VALIDATION } from "./constants";

// Canonical service validation
export const canonicalServiceSchema = z.enum(
  CANONICAL_SERVICES as unknown as [string, ...string[]]
);

// Booking variant validation
export const bookingVariantSchema = z.enum(["embed", "form", "calendar"]);

// Provider validation
export const bookingProviderSchema = z.enum(["cal", "calendly", "custom"]);

// Intake field validation
export const intakeFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["text", "email", "textarea", "select", "checkbox"]),
  required: z.boolean().optional(),
  options: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      })
    )
    .optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  validate: z.string().optional(),
});

// Intake form specification validation
export const intakeFormSpecSchema = z.object({
  service: canonicalServiceSchema,
  fields: z.array(intakeFieldSchema).min(1, "At least one field is required"),
  consent: z.object({
    privacyPolicyHref: z.string().url("Privacy policy must be a valid URL"),
    termsHref: z.string().url("Terms must be a valid URL").optional(),
    marketingOptIn: z.boolean().optional(),
  }),
});

// Calendar provider configuration validation
export const calendarProviderConfigSchema = z.object({
  provider: bookingProviderSchema,
  service: canonicalServiceSchema,
  eventTypeId: z.string().optional(),
  organization: z.string().optional(),
  eventSlug: z.string().optional(),
  fallbackHref: z.string().url("Fallback URL must be valid").optional(),
  params: z
    .record(z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

// Prefill data validation
export const prefillSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.minNameLength, `Name must be at least ${VALIDATION.minNameLength} characters`)
    .max(VALIDATION.maxNameLength, `Name must be no more than ${VALIDATION.maxNameLength} characters`)
    .optional(),
  email: z
    .string()
    .email("Must be a valid email address")
    .optional(),
  timezone: z.string().optional(),
  notes: z
    .string()
    .max(VALIDATION.maxNotesLength, `Notes must be no more than ${VALIDATION.maxNotesLength} characters`)
    .optional(),
  ref: z.string().optional(),
  topic: z.string().optional(),
});

// Core booking section props validation
export const bookingSectionPropsSchema = z.object({
  variant: bookingVariantSchema,
  service: canonicalServiceSchema.optional(),
  calendar: calendarProviderConfigSchema.optional(),
  intake: intakeFormSpecSchema.optional(),
  prefill: prefillSchema.optional(),
  successHref: z.string().url("Success URL must be valid").optional(),
  cancelHref: z.string().url("Cancel URL must be valid").optional(),
  analyticsContext: z.string().optional(),
});

// Hub template props validation
export const bookingHubTemplatePropsSchema = z.object({
  meta: z
    .object({
      title: z.string().optional(),
      subtitle: z.string().optional(),
    })
    .optional(),
  features: z
    .object({
      showFAQ: z.boolean().optional(),
      showPolicies: z.boolean().optional(),
      showCTA: z.boolean().optional(),
    })
    .optional(),
  hero: z
    .object({
      headline: z.string().optional(),
      subheadline: z.string().optional(),
      primaryCTA: z
        .object({
          text: z.string().min(1),
          href: z.string().url(),
        })
        .optional(),
    })
    .optional(),
  booking: bookingSectionPropsSchema,
  analytics: z
    .object({
      context: z.string().optional(),
    })
    .optional(),
});

// Modal template props validation
export const bookingModalTemplatePropsSchema = z.object({
  booking: bookingSectionPropsSchema,
  analytics: z
    .object({
      context: z.string().optional(),
    })
    .optional(),
});

// Analytics context validation
export const analyticsContextSchema = z.object({
  context: z.string().optional(),
  service: canonicalServiceSchema.optional(),
  variant: bookingVariantSchema.optional(),
  source: z.string().optional(),
});

// Booking result validation
export const bookingResultSchema = z.object({
  provider: bookingProviderSchema,
  service: canonicalServiceSchema,
  eventId: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  timezone: z.string().optional(),
  attendeeEmail: z.string().email().optional(),
});

// Booking error validation
export const bookingErrorSchema = z.object({
  code: z.string().min(1, "Error code is required"),
  message: z.string().min(1, "Error message is required"),
  provider: bookingProviderSchema.optional(),
  service: canonicalServiceSchema.optional(),
  context: z.string().optional(),
});

// URL search params validation for modal routes
export const bookingQueryParamsSchema = z.object({
  topic: z.string().optional(),
  ref: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  tz: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
});

// Provider-specific configuration schemas
export const calProviderConfigSchema = z.object({
  eventTypeId: z.string().min(1, "Cal.com event type ID is required"),
  theme: z.enum(["auto", "light", "dark"]).optional(),
  layout: z.enum(["month_view", "week_view"]).optional(),
  hideEventTypeDetails: z.boolean().optional(),
});

export const calendlyProviderConfigSchema = z.object({
  organization: z.string().min(1, "Calendly organization is required"),
  eventSlug: z.string().min(1, "Calendly event slug is required"),
  hideEventTypeDetails: z.boolean().optional(),
  hideLandingPageDetails: z.boolean().optional(),
  primaryColor: z.string().optional(),
  textColor: z.string().optional(),
});

// Validation helper functions
export function validateInDevelopment<T>(schema: z.ZodSchema<T>, data: unknown): T {
  if (process.env.NODE_ENV === "development") {
    return schema.parse(data);
  }
  return data as T;
}

export function safeValidate<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ["Unknown validation error"] };
  }
}

// Type guards using schemas
export function isValidBookingSectionProps(data: unknown): data is z.infer<typeof bookingSectionPropsSchema> {
  return bookingSectionPropsSchema.safeParse(data).success;
}

export function isValidCanonicalService(service: string): service is z.infer<typeof canonicalServiceSchema> {
  return canonicalServiceSchema.safeParse(service).success;
}

export function isValidBookingVariant(variant: string): variant is z.infer<typeof bookingVariantSchema> {
  return bookingVariantSchema.safeParse(variant).success;
}

export function isValidBookingProvider(provider: string): provider is z.infer<typeof bookingProviderSchema> {
  return bookingProviderSchema.safeParse(provider).success;
}

// Runtime validation helpers
export function assertValidService(service: unknown): asserts service is z.infer<typeof canonicalServiceSchema> {
  canonicalServiceSchema.parse(service);
}

export function assertValidBookingSectionProps(props: unknown): asserts props is z.infer<typeof bookingSectionPropsSchema> {
  bookingSectionPropsSchema.parse(props);
}