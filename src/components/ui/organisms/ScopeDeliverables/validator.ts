// src/components/ui/organisms/ScopeDeliverables/validator.ts
import { z } from 'zod';
import type { ScopeData, ScopeValidationResult } from './ScopeDeliverables.types';

/**
 * Zod schema for validating scope data
 */
export const ScopeDataSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  subtitle: z.string().trim().min(1).max(500).optional(),
  includes: z.array(
    z.string()
      .trim()
      .min(1, 'Include items cannot be empty')
      .max(300, 'Include items should be under 300 characters')
  ).min(1, 'At least one include item is required'),
  deliverables: z.array(
    z.string()
      .trim()
      .min(1, 'Deliverable items cannot be empty')
      .max(300, 'Deliverable items should be under 300 characters')
  ).min(1, 'At least one deliverable is required'),
  addons: z.array(
    z.string()
      .trim()
      .min(1, 'Addon items cannot be empty')
      .max(300, 'Addon items should be under 300 characters')
  ).optional(),
});

/**
 * Validation with detailed error reporting
 */
export function validateScopeDataWithZod(data: unknown): ScopeValidationResult & { data?: ScopeData } {
  try {
    const validatedData = ScopeDataSchema.parse(data);
    
    // Additional business logic validations
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for optimal content length
    if (validatedData.includes.length > 10) {
      warnings.push('Consider grouping scope items if there are more than 10');
      suggestions.push('Break down scope items into logical categories');
    }

    if (validatedData.deliverables.length > 15) {
      warnings.push('Large number of deliverables may overwhelm users');
      suggestions.push('Consider grouping deliverables by project phase');
    }

    // Check for duplicate items
    const allItems = [
      ...validatedData.includes,
      ...validatedData.deliverables,
      ...(validatedData.addons || [])
    ];
    const duplicates = allItems.filter((item, index) => allItems.indexOf(item) !== index);
    
    if (duplicates.length > 0) {
      warnings.push(`Duplicate items found: ${duplicates.join(', ')}`);
      suggestions.push('Remove or rephrase duplicate items for clarity');
    }

    // Check for overly technical language
    const technicalTerms = ['API', 'SDK', 'JSON', 'XML', 'REST', 'GraphQL', 'OAuth'];
    const hasTechnical = allItems.some(item => 
      technicalTerms.some(term => item.toUpperCase().includes(term))
    );
    
    if (hasTechnical) {
      suggestions.push('Consider adding explanations for technical terms for broader audience understanding');
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      suggestions,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const path = err.path.join('.');
        return `${path}: ${err.message}`;
      });

      return {
        isValid: false,
        errors,
        warnings: [],
        suggestions: ['Please check your data format and try again'],
      };
    }

    return {
      isValid: false,
      errors: ['Unknown validation error occurred'],
      warnings: [],
      suggestions: ['Please check your data format and try again'],
    };
  }
}

/**
 * Schema for validating scope deliverables props
 */
export const ScopeDeliverablesPropsSchema = z.object({
  scope: ScopeDataSchema,
  id: z.string().optional(),
  className: z.string().optional(),
  testId: z.string().optional(),
  isLoading: z.boolean().optional(),
  showWhenEmpty: z.boolean().optional(),
  icons: z.object({
    includes: z.string().optional(),
    deliverables: z.string().optional(),
    addons: z.string().optional(),
  }).optional(),
  onItemClick: z.function().optional(),
});

/**
 * Runtime type guard using Zod schema
 */
export function isScopeData(data: unknown): data is ScopeData {
  try {
    ScopeDataSchema.parse(data);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe parser that returns either valid data or null
 */
export function safeParseScopeData(data: unknown): ScopeData | null {
  try {
    return ScopeDataSchema.parse(data);
  } catch {
    return null;
  }
}

/**
 * Validates and sanitizes scope data for production use
 */
export function validateAndSanitizeScopeData(data: unknown): {
  isValid: boolean;
  data: ScopeData | null;
  errors: string[];
  sanitized: boolean;
} {
  const result = validateScopeDataWithZod(data);
  
  if (result.isValid && result.data) {
    return {
      isValid: true,
      data: result.data,
      errors: [],
      sanitized: false,
    };
  }

  // Attempt to sanitize and re-validate
  if (typeof data === 'object' && data !== null) {
    const sanitized = sanitizeScopeDataForValidation(data);
    const revalidated = validateScopeDataWithZod(sanitized);
    
    if (revalidated.isValid && revalidated.data) {
      return {
        isValid: true,
        data: revalidated.data,
        errors: result.errors,
        sanitized: true,
      };
    }
  }

  return {
    isValid: false,
    data: null,
    errors: result.errors,
    sanitized: false,
  };
}

/**
 * Sanitizes potentially malformed data for validation
 */
function sanitizeScopeDataForValidation(data: any): unknown {
  if (!data || typeof data !== 'object') {
    return {
      includes: [],
      deliverables: [],
    };
  }

  const sanitized: any = {
    includes: [],
    deliverables: [],
  };

  // Sanitize title
  if (typeof data.title === 'string' && data.title.trim()) {
    sanitized.title = data.title.trim().slice(0, 200);
  }

  // Sanitize subtitle
  if (typeof data.subtitle === 'string' && data.subtitle.trim()) {
    sanitized.subtitle = data.subtitle.trim().slice(0, 500);
  }

  // Sanitize includes array
  if (Array.isArray(data.includes)) {
    sanitized.includes = data.includes
      .filter(item => typeof item === 'string' && item.trim())
      .map(item => item.trim().slice(0, 300))
      .slice(0, 20); // Limit to 20 items
  } else if (typeof data.includes === 'string') {
    // Handle case where includes is a single string
    sanitized.includes = [data.includes.trim().slice(0, 300)];
  }

  // Sanitize deliverables array
  if (Array.isArray(data.deliverables)) {
    sanitized.deliverables = data.deliverables
      .filter(item => typeof item === 'string' && item.trim())
      .map(item => item.trim().slice(0, 300))
      .slice(0, 20); // Limit to 20 items
  } else if (typeof data.deliverables === 'string') {
    // Handle case where deliverables is a single string
    sanitized.deliverables = [data.deliverables.trim().slice(0, 300)];
  }

  // Sanitize addons array
  if (Array.isArray(data.addons) && data.addons.length > 0) {
    sanitized.addons = data.addons
      .filter(item => typeof item === 'string' && item.trim())
      .map(item => item.trim().slice(0, 300))
      .slice(0, 15); // Limit to 15 items
  }

  // Ensure minimum requirements
  if (sanitized.includes.length === 0) {
    sanitized.includes = ['Scope details to be defined'];
  }

  if (sanitized.deliverables.length === 0) {
    sanitized.deliverables = ['Deliverables to be defined'];
  }

  return sanitized;
}

/**
 * Development-time validator for catching issues early
 */
export function devValidateScopeData(data: unknown, componentName: string = 'ScopeDeliverables'): void {
  if (process.env.NODE_ENV !== 'development') return;

  const result = validateScopeDataWithZod(data);
  
  if (!result.isValid) {
    console.group(`🚨 ${componentName} Validation Errors`);
    result.errors.forEach(error => console.error('❌', error));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group(`⚠️ ${componentName} Validation Warnings`);
    result.warnings.forEach(warning => console.warn('⚠️', warning));
    console.groupEnd();
  }

  if (result.suggestions.length > 0) {
    console.group(`💡 ${componentName} Suggestions`);
    result.suggestions.forEach(suggestion => console.info('💡', suggestion));
    console.groupEnd();
  }
}