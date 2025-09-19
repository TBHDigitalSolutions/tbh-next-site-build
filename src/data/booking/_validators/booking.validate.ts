// src/data/booking/_validators/booking.validate.ts
// Booking validation functions and middleware
// Production-ready validation with comprehensive error handling

import { z } from 'zod';
import type {
  BookingResult,
  CustomerInfo,
  ProviderConfig,
  ValidationResult,
  BookingError,
} from '../_types';
import {
  customerInfoSchema,
  bookingResultSchema,
  validateCustomerInfo,
  validateBookingResult,
  validateProviderConfig,
  sanitizeCustomerInput,
  sanitizeNotes,
} from '../_utils/validation';

// ============================================================================
// Validation Middleware
// ============================================================================

export class BookingValidator {
  private static instance: BookingValidator;
  
  public static getInstance(): BookingValidator {
    if (!BookingValidator.instance) {
      BookingValidator.instance = new BookingValidator();
    }
    return BookingValidator.instance;
  }
  
  // Validate and sanitize booking data before processing
  public async validateBookingData(data: unknown): Promise<ValidationResult<BookingResult>> {
    try {
      // First pass: basic schema validation
      const schemaValidation = validateBookingResult(data);
      if (!schemaValidation.success) {
        return schemaValidation;
      }
      
      const booking = schemaValidation.data!;
      
      // Second pass: sanitize customer input
      const sanitizedBooking: BookingResult = {
        ...booking,
        customer: {
          ...booking.customer,
          name: sanitizeCustomerInput(booking.customer.name),
          company: booking.customer.company ? sanitizeCustomerInput(booking.customer.company) : undefined,
          notes: booking.customer.notes ? sanitizeNotes(booking.customer.notes) : undefined,
        },
      };
      
      // Third pass: business logic validation
      const businessValidation = await this.validateBusinessRules(sanitizedBooking);
      if (!businessValidation.success) {
        return businessValidation;
      }
      
      return {
        success: true,
        data: sanitizedBooking,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Booking validation failed',
          details: { general: [error instanceof Error ? error.message : 'Unknown error'] },
        },
      };
    }
  }
  
  // Validate customer information with enhanced checks
  public async validateCustomerData(data: unknown): Promise<ValidationResult<CustomerInfo>> {
    const validation = validateCustomerInfo(data);
    
    if (!validation.success) {
      return validation;
    }
    
    const customer = validation.data!;
    
    // Enhanced validation for business context
    const enhancedValidation = await this.validateCustomerBusinessRules(customer);
    if (!enhancedValidation.success) {
      return enhancedValidation;
    }
    
    // Sanitize input
    const sanitizedCustomer: CustomerInfo = {
      ...customer,
      name: sanitizeCustomerInput(customer.name),
      company: customer.company ? sanitizeCustomerInput(customer.company) : undefined,
      notes: customer.notes ? sanitizeNotes(customer.notes) : undefined,
    };
    
    return {
      success: true,
      data: sanitizedCustomer,
    };
  }
  
  // Validate provider configuration
  public validateProvider(config: unknown): ValidationResult<ProviderConfig> {
    return validateProviderConfig(config);
  }
  
  // Private validation methods
  private async validateBusinessRules(booking: BookingResult): Promise<ValidationResult<BookingResult>> {
    const errors: Record<string, string[]> = {};
    
    // Validate booking timing
    const now = new Date();
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    
    // Must be in the future (with 15-minute buffer)
    const minimumStartTime = new Date(now.getTime() + 15 * 60 * 1000);
    if (startTime < minimumStartTime) {
      errors.startTime = ['Booking must be at least 15 minutes in the future'];
    }
    
    // Must be within business hours (9 AM - 6 PM, Mon-Fri)
    const startHour = startTime.getHours();
    const startDay = startTime.getDay();
    
    if (startDay === 0 || startDay === 6) {
      errors.startTime = ['Bookings are only available Monday through Friday'];
    }
    
    if (startHour < 9 || startHour >= 18) {
      errors.startTime = ['Bookings are only available between 9 AM and 6 PM'];
    }
    
    // Validate duration for service type
    const validDurations = this.getValidDurationsForService(booking.service);
    if (!validDurations.includes(booking.duration)) {
      errors.duration = [`Invalid duration for ${booking.service}. Valid durations: ${validDurations.join(', ')} minutes`];
    }
    
    // Validate meeting type compatibility
    const validMeetingTypes = this.getValidMeetingTypesForService(booking.service);
    if (!validMeetingTypes.includes(booking.meetingType)) {
      errors.meetingType = [`Invalid meeting type for ${booking.service}`];
    }
    
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        error: {
          message: 'Business rules validation failed',
          details: errors,
        },
      };
    }
    
    return { success: true, data: booking };
  }
  
  private async validateCustomerBusinessRules(customer: CustomerInfo): Promise<ValidationResult<CustomerInfo>> {
    const errors: Record<string, string[]> = {};
    
    // Enhanced email validation
    if (await this.isDisposableEmail(customer.email)) {
      errors.email = ['Please use a business email address'];
    }
    
    // Name validation (no numbers, reasonable length)
    if (!/^[a-zA-Z\s\-'\.]+$/.test(customer.name)) {
      errors.name = ['Name contains invalid characters'];
    }
    
    if (customer.name.length < 2) {
      errors.name = ['Name is too short'];
    }
    
    // Phone validation if provided
    if (customer.phone && !this.isValidPhoneNumber(customer.phone)) {
      errors.phone = ['Please provide a valid phone number'];
    }
    
    // Company name validation if provided
    if (customer.company && customer.company.length < 2) {
      errors.company = ['Company name is too short'];
    }
    
    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        error: {
          message: 'Customer validation failed',
          details: errors,
        },
      };
    }
    
    return { success: true, data: customer };
  }
  
  private getValidDurationsForService(service: BookingResult['service']): number[] {
    const serviceDurations = {
      'web-development-services': [30, 60, 90],
      'video-production-services': [30, 60],
      'seo-services': [30, 45, 60],
      'marketing-services': [30, 60],
      'lead-generation-services': [30, 45],
      'content-production-services': [30, 60],
    };
    
    return serviceDurations[service] || [30, 60];
  }
  
  private getValidMeetingTypesForService(service: BookingResult['service']): BookingResult['meetingType'][] {
    const serviceMeetingTypes = {
      'web-development-services': ['consultation', 'discovery', 'strategy', 'review'],
      'video-production-services': ['consultation', 'discovery', 'strategy'],
      'seo-services': ['consultation', 'discovery', 'strategy', 'review'],
      'marketing-services': ['consultation', 'discovery', 'strategy', 'review'],
      'lead-generation-services': ['consultation', 'discovery', 'strategy'],
      'content-production-services': ['consultation', 'discovery', 'strategy', 'review'],
    };
    
    return serviceMeetingTypes[service] || ['consultation'];
  }
  
  private async isDisposableEmail(email: string): Promise<boolean> {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return true;
    
    const disposableDomains = [
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com',
      'tempmail.org',
      'throwaway.email',
      'yopmail.com',
      'temp-mail.org',
    ];
    
    return disposableDomains.includes(domain);
  }
  
  private isValidPhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // US phone numbers should be 10 or 11 digits
    if (digits.length === 10 || digits.length === 11) {
      return true;
    }
    
    return false;
  }
}

// ============================================================================
// Validation Helper Functions
// ============================================================================

export async function validateBooking(data: unknown): Promise<ValidationResult<BookingResult>> {
  const validator = BookingValidator.getInstance();
  return validator.validateBookingData(data);
}

export async function validateCustomer(data: unknown): Promise<ValidationResult<CustomerInfo>> {
  const validator = BookingValidator.getInstance();
  return validator.validateCustomerData(data);
}

export function validateProvider(config: unknown): ValidationResult<ProviderConfig> {
  const validator = BookingValidator.getInstance();
  return validator.validateProvider(config);
}

// ============================================================================
// Error Creation Helpers
// ============================================================================

export function createBookingError(
  code: string,
  message: string,
  provider?: BookingResult['provider'],
  service?: BookingResult['service'],
  details?: Record<string, unknown>
): BookingError {
  return {
    code,
    message,
    provider,
    service,
    details,
    timestamp: new Date().toISOString(),
  };
}

export function createValidationError(
  field: string,
  message: string,
  value?: unknown
): BookingError {
  return createBookingError(
    'VALIDATION_ERROR',
    message,
    undefined,
    undefined,
    { field, value }
  );
}

// ============================================================================
// Validation Middleware for Express/Next.js
// ============================================================================

export function validateBookingMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      const validation = await validateBooking(req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          error: validation.error,
          code: 'VALIDATION_FAILED',
        });
      }
      
      req.validatedBooking = validation.data;
      next();
    } catch (error) {
      return res.status(500).json({
        error: { message: 'Validation middleware error' },
        code: 'MIDDLEWARE_ERROR',
      });
    }
  };
}

export function validateCustomerMiddleware() {
  return async (req: any, res: any, next: any) => {
    try {
      const validation = await validateCustomer(req.body.customer || req.body);
      
      if (!validation.success) {
        return res.status(400).json({
          error: validation.error,
          code: 'CUSTOMER_VALIDATION_FAILED',
        });
      }
      
      req.validatedCustomer = validation.data;
      next();
    } catch (error) {
      return res.status(500).json({
        error: { message: 'Customer validation middleware error' },
        code: 'MIDDLEWARE_ERROR',
      });
    }
  };
}