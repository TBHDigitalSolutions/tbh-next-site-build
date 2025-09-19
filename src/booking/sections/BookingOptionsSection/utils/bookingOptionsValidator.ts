// src/booking/sections/BookingOptionsSection/utils/bookingOptionsValidator.ts
// Validation utilities for BookingOptionsSection component props and state

import { z } from "zod";
import { CANONICAL_SERVICES } from "@/shared/services/constants";
import type { 
  BookingOptionsSectionProps,
  BookingOption,
  OptionsLayoutConfig,
  SelectionState,
  ProviderOptionData,
  Price,
  Badge,
  Tag,
  OptionActions
} from "../BookingOptionsSection.types";

// ============================================================================
// Zod Schemas
// ============================================================================

// Currency and pricing schemas
const currencyCodeSchema = z.string().min(3).max(3);

const priceSchema = z.object({
  amount: z.number().min(0, "Price amount must be non-negative"),
  currency: currencyCodeSchema,
  formatted: z.string().optional(),
  cadence: z.enum(["one_time", "per_hour", "per_month", "per_year"]).optional(),
  compareAt: z.object({
    amount: z.number().min(0),
    currency: currencyCodeSchema,
    formatted: z.string().optional(),
  }).optional(),
});

// Badge schema
const badgeSchema = z.object({
  label: z.string().min(1, "Badge label is required"),
  tone: z.enum(["brand", "success", "info", "warning", "danger", "neutral"]).optional(),
});

// Tag schema
const tagSchema = z.object({
  label: z.string().min(1, "Tag label is required"),
  tone: z.enum(["brand", "success", "info", "warning", "neutral"]).optional(),
});

// Provider data schemas
const providerOptionDataSchema = z.object({
  cal: z.object({
    eventTypeId: z.string().min(1),
    bookingUrl: z.string().url().optional(),
  }).optional(),
  calendly: z.object({
    eventUuid: z.string().min(1),
    bookingUrl: z.string().url().optional(),
  }).optional(),
  acuity: z.object({
    appointmentTypeId: z.union([z.string(), z.number()]),
    bookingUrl: z.string().url().optional(),
  }).optional(),
  custom: z.record(z.unknown()).optional(),
});

// Option actions schema
const optionActionsSchema = z.object({
  primary: z.object({
    label: z.string().min(1, "Primary action label is required"),
    href: z.string().optional(),
    onClick: z.function().optional(),
    trackName: z.string().optional(),
    disabledReason: z.string().optional(),
  }).optional().refine(
    (action) => !action || action.href || action.onClick,
    "Primary action must have either href or onClick"
  ),
  secondary: z.array(z.object({
    label: z.string().min(1, "Secondary action label is required"),
    href: z.string().optional(),
    onClick: z.function().optional(),
    trackName: z.string().optional(),
  }).refine(
    (action) => action.href || action.onClick,
    "Secondary action must have either href or onClick"
  )).optional(),
});

// Booking option schema
const bookingOptionSchema = z.object({
  id: z.string().min(1, "Option ID is required"),
  service: z.enum(CANONICAL_SERVICES as unknown as [string, ...string[]]),
  provider: z.enum(["cal", "calendly", "custom"]),
  meetingTypeKey: z.string().optional(),
  title: z.string().min(1, "Option title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  media: z.unknown().optional(),
  badges: z.array(badgeSchema).optional(),
  tags: z.array(tagSchema).optional(),
  ribbon: z.string().optional(),
  durationMinutes: z.number().positive("Duration must be positive").optional(),
  price: priceSchema.optional(),
  availabilityHint: z.string().optional(),
  hasNearTermAvailability: z.boolean().optional(),
  disabled: z.boolean().optional(),
  disabledReason: z.string().optional(),
  actions: optionActionsSchema.optional(),
  providerData: providerOptionDataSchema.optional(),
  meta: z.record(z.unknown()).optional(),
});

// Layout configuration schema
const optionsLayoutConfigSchema = z.object({
  layout: z.enum(["grid", "list", "carousel"]).optional(),
  columns: z.object({
    base: z.enum([1, 2]).optional(),
    md: z.enum([1, 2, 3]).optional(),
    lg: z.enum([2, 3, 4]).optional(),
  }).optional(),
  maxVisible: z.number().positive().optional(),
  density: z.enum(["compact", "comfortable", "spacious"]).optional(),
  carousel: z.object({
    showArrows: z.boolean().optional(),
    showDots: z.boolean().optional(),
    snap: z.enum(["start", "center", "end"]).optional(),
    itemMinWidthPx: z.number().positive().optional(),
  }).optional(),
});

// Selection state schema
const selectionStateSchema = z.object({
  selectedIds: z.array(z.string()),
  maxSelect: z.number().positive().optional(),
  minSelect: z.number().nonnegative().optional(),
}).refine(
  (state) => !state.minSelect || !state.maxSelect || state.minSelect <= state.maxSelect,
  "minSelect must be less than or equal to maxSelect"
);

// Main props schema
const bookingOptionsSectionPropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  options: z.array(bookingOptionSchema).min(1, "At least one option is required"),
  selectionMode: z.enum(["none", "single", "multiple"]).optional(),
  selection: selectionStateSchema.optional(),
  service: z.enum(CANONICAL_SERVICES as unknown as [string, ...string[]]).optional(),
  provider: z.enum(["cal", "calendly", "custom"]).optional(),
  layout: optionsLayoutConfigSchema.optional(),
  theme: z.object({
    radius: z.enum(["sm", "md", "lg", "xl"]).optional(),
    emphasis: z.enum(["subtle", "elevated", "outlined"]).optional(),
    tone: z.enum(["brand", "neutral"]).optional(),
  }).optional(),
  a11y: z.object({
    ariaLabel: z.string().optional(),
    roleHint: z.enum(["list", "listbox", "grid"]).optional(),
    attributes: z.record(z.string()).optional(),
  }).optional(),
  state: z.object({
    loading: z.boolean().optional(),
    skeletonCount: z.number().positive().optional(),
    error: z.string().optional(),
    onRetry: z.function().optional(),
  }).optional(),
  sectionActions: z.object({
    primary: z.object({
      label: z.string().min(1),
      href: z.string().optional(),
      onClick: z.function().optional(),
      trackName: z.string().optional(),
      disabledReason: z.string().optional(),
    }).optional(),
    secondary: z.array(z.object({
      label: z.string().min(1),
      href: z.string().optional(),
      onClick: z.function().optional(),
      trackName: z.string().optional(),
    })).optional(),
  }).optional(),
  onSelect: z.function().optional(),
  onOptionPrimaryAction: z.function().optional(),
  onOptionSecondaryAction: z.function().optional(),
  analytics: z.object({
    context: z.string().optional(),
    onTrackEvent: z.function().optional(),
  }).optional(),
  className: z.string().optional(),
  renderOptionHeader: z.function().optional(),
  renderOptionFooter: z.function().optional(),
  renderEmptyState: z.function().optional(),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates BookingOptionsSection props
 */
export function validateBookingOptionsSectionProps(
  props: unknown
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    bookingOptionsSectionPropsSchema.parse(props);
    
    // Additional business logic validation
    const typedProps = props as BookingOptionsSectionProps;
    
    // Selection mode validation
    if (typedProps.selectionMode !== "none" && !typedProps.onSelect) {
      warnings.push("onSelect callback is recommended when selectionMode is not 'none'");
    }
    
    // Selection state consistency
    if (typedProps.selection && typedProps.selectionMode === "none") {
      warnings.push("selection prop provided but selectionMode is 'none'");
    }
    
    if (typedProps.selection && typedProps.selectionMode === "single" && 
        typedProps.selection.selectedIds.length > 1) {
      errors.push("Cannot have multiple selectedIds when selectionMode is 'single'");
    }
    
    // Option validation
    const optionIds = typedProps.options.map(option => option.id);
    const duplicateIds = optionIds.filter((id, index) => optionIds.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      errors.push(`Duplicate option IDs found: ${duplicateIds.join(", ")}`);
    }
    
    // Service consistency
    if (typedProps.service) {
      const mismatchedOptions = typedProps.options.filter(option => 
        option.service !== typedProps.service
      );
      if (mismatchedOptions.length > 0) {
        warnings.push(
          `${mismatchedOptions.length} options have different service than section service`
        );
      }
    }
    
    // Disabled options without primary actions
    const disabledWithoutActions = typedProps.options.filter(option =>
      option.disabled && !option.actions?.primary
    );
    if (disabledWithoutActions.length > 0) {
      warnings.push(
        `${disabledWithoutActions.length} disabled options have no primary action`
      );
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
 * Validates a single booking option
 */
export function validateBookingOption(
  option: unknown
): { isValid: boolean; errors: string[] } {
  try {
    bookingOptionSchema.parse(option);
    
    // Additional validation
    const typedOption = option as BookingOption;
    const errors: string[] = [];
    
    // Price consistency
    if (typedOption.price?.compareAt) {
      if (typedOption.price.compareAt.amount <= typedOption.price.amount) {
        errors.push("compareAt price should be higher than regular price");
      }
      if (typedOption.price.compareAt.currency !== typedOption.price.currency) {
        errors.push("compareAt currency should match regular price currency");
      }
    }
    
    // Duration validation
    if (typedOption.durationMinutes && typedOption.durationMinutes % 5 !== 0) {
      errors.push("Duration should be in 5-minute increments");
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
 * Validates provider-specific option data
 */
export function validateProviderOptionData(
  providerData: unknown,
  provider: string
): { isValid: boolean; errors: string[] } {
  if (!providerData) return { isValid: true, errors: [] };
  
  try {
    providerOptionDataSchema.parse(providerData);
    
    const typedData = providerData as ProviderOptionData;
    const errors: string[] = [];
    
    // Provider-specific validation
    switch (provider) {
      case "cal":
        if (!typedData.cal?.eventTypeId) {
          errors.push("Cal.com provider requires eventTypeId");
        }
        break;
      case "calendly":
        if (!typedData.calendly?.eventUuid) {
          errors.push("Calendly provider requires eventUuid");
        }
        break;
      case "custom":
        if (!typedData.custom) {
          errors.push("Custom provider requires custom configuration");
        }
        break;
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
 * Development-only validation helper
 */
export function validateInDevelopment<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  componentName = "BookingOptionsSection"
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
 * Check if selection state is valid for the given mode and options
 */
export function validateSelectionState(
  selectionMode: string,
  selection: SelectionState | undefined,
  optionIds: string[]
): { isValid: boolean; errors: string[]; suggestions: string[] } {
  const errors: string[] = [];
  const suggestions: string[] = [];

  if (selectionMode === "none") {
    if (selection && selection.selectedIds.length > 0) {
      errors.push("Cannot have selected items when selectionMode is 'none'");
      suggestions.push("Clear selectedIds or change selectionMode");
    }
    return { isValid: errors.length === 0, errors, suggestions };
  }

  if (!selection) {
    suggestions.push("Consider providing selection state for better UX");
    return { isValid: true, errors, suggestions };
  }

  // Check that selected IDs exist in options
  const invalidIds = selection.selectedIds.filter(id => !optionIds.includes(id));
  if (invalidIds.length > 0) {
    errors.push(`Selected IDs not found in options: ${invalidIds.join(", ")}`);
  }

  // Mode-specific validation
  switch (selectionMode) {
    case "single":
      if (selection.selectedIds.length > 1) {
        errors.push("Single selection mode allows only one selected item");
        suggestions.push("Use only first selected item or change to multiple mode");
      }
      break;

    case "multiple":
      if (selection.maxSelect && selection.selectedIds.length > selection.maxSelect) {
        errors.push(`Too many selected items (${selection.selectedIds.length} > ${selection.maxSelect})`);
      }
      if (selection.minSelect && selection.selectedIds.length < selection.minSelect) {
        errors.push(`Too few selected items (${selection.selectedIds.length} < ${selection.minSelect})`);
      }
      break;
  }

  return { isValid: errors.length === 0, errors, suggestions };
}

/**
 * Debug utility for development
 */
export function debugBookingOptionsProps(
  props: BookingOptionsSectionProps, 
  label = "BookingOptionsSection"
): void {
  if (process.env.NODE_ENV !== "development") return;

  console.group(`🔍 ${label} Props Debug`);
  console.log("Options Count:", props.options.length);
  console.log("Selection Mode:", props.selectionMode || "none");
  console.log("Layout:", props.layout?.layout || "grid");
  console.log("Has Section Actions:", !!props.sectionActions);
  
  const validation = validateBookingOptionsSectionProps(props);
  if (!validation.isValid) {
    console.warn("❌ Validation Errors:", validation.errors);
  }
  if (validation.warnings.length > 0) {
    console.warn("⚠️ Warnings:", validation.warnings);
  }

  // Validate each option
  props.options.forEach((option, index) => {
    const optionValidation = validateBookingOption(option);
    if (!optionValidation.isValid) {
      console.warn(`❌ Option ${index} (${option.id}) Errors:`, optionValidation.errors);
    }
  });

  // Selection validation
  if (props.selection || props.selectionMode !== "none") {
    const selectionValidation = validateSelectionState(
      props.selectionMode || "none",
      props.selection,
      props.options.map(o => o.id)
    );
    if (!selectionValidation.isValid) {
      console.warn("❌ Selection Validation Errors:", selectionValidation.errors);
    }
    if (selectionValidation.suggestions.length > 0) {
      console.log("💡 Selection Suggestions:", selectionValidation.suggestions);
    }
  }

  console.groupEnd();
}

/**
 * Generate mock booking option for testing
 */
export function createMockBookingOption(
  overrides: Partial<BookingOption> = {}
): BookingOption {
  const id = overrides.id || `option-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    service: "web-development-services",
    provider: "cal",
    title: `Mock Option ${id}`,
    subtitle: "This is a mock booking option for testing",
    description: "A longer description of what this booking option includes.",
    durationMinutes: 30,
    price: {
      amount: 150,
      currency: "USD",
      formatted: "$150",
      cadence: "one_time",
    },
    badges: [{ label: "Popular", tone: "brand" }],
    tags: [{ label: "30 min", tone: "neutral" }],
    hasNearTermAvailability: true,
    actions: {
      primary: {
        label: "Book Now",
        onClick: (optionId: string) => console.log(`Booking ${optionId}`),
      },
    },
    providerData: {
      cal: {
        eventTypeId: "mock-event-type-id",
      },
    },
    ...overrides,
  };
}