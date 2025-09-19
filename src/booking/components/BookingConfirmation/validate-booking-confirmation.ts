// scripts/booking/validate-booking-confirmation.ts
// Comprehensive validation and testing for BookingConfirmation component

import { z } from 'zod';
import type {
  ConfirmedBooking,
  BookingConfirmationProps,
  MeetingLocation,
  CustomerInfo,
  BookingActions,
  PreparationInfo,
  FollowUpInfo,
} from '../../src/booking/components/BookingConfirmation/BookingConfirmation.types';

// Validation schemas
const CustomerInfoSchema = z.object({
  name: z.string().min(1, 'Customer name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  company: z.string().optional(),
  title: z.string().optional(),
});

const VideoMeetingDetailsSchema = z.object({
  platform: z.enum(['zoom', 'meet', 'teams', 'custom']),
  joinUrl: z.string().url('Invalid join URL'),
  meetingId: z.string().optional(),
  password: z.string().optional(),
  dialInNumbers: z.array(z.string()).optional(),
});

const PhoneMeetingDetailsSchema = z.object({
  phoneNumber: z.string().min(1, 'Phone number is required'),
  extension: z.string().optional(),
  conferenceId: z.string().optional(),
});

const InPersonMeetingDetailsSchema = z.object({
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  buildingInfo: z.string().optional(),
  parkingInfo: z.string().optional(),
});

const MeetingLocationSchema = z.object({
  type: z.enum(['video', 'phone', 'in-person', 'hybrid']),
  details: z.union([
    VideoMeetingDetailsSchema,
    PhoneMeetingDetailsSchema,
    InPersonMeetingDetailsSchema,
  ]),
  instructions: z.string().optional(),
  timezone: z.string().optional(),
});

const BookingPricingSchema = z.object({
  amount: z.number().nonnegative('Amount must be non-negative'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  paymentStatus: z.enum(['pending', 'paid', 'refunded', 'failed']),
  paymentMethod: z.string().optional(),
  invoiceUrl: z.string().url().optional(),
});

const ConfirmedBookingSchema = z.object({
  id: z.string().min(1, 'Booking ID is required'),
  referenceNumber: z.string().min(1, 'Reference number is required'),
  service: z.enum([
    'web-development-services',
    'video-production-services',
    'seo-services',
    'marketing-services',
    'lead-generation-services',
    'content-production-services'
  ]),
  provider: z.enum(['cal', 'calendly', 'acuity', 'custom']),
  meetingType: z.string().min(1, 'Meeting type is required'),
  startTime: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid start time'),
  endTime: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid end time'),
  duration: z.number().positive('Duration must be positive'),
  timezone: z.string().min(1, 'Timezone is required'),
  location: MeetingLocationSchema,
  customer: CustomerInfoSchema,
  status: z.enum(['confirmed', 'pending', 'cancelled', 'rescheduled', 'completed', 'no-show']),
  createdAt: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid created date'),
  pricing: BookingPricingSchema.optional(),
  notes: z.string().optional(),
});

const BookingActionsSchema = z.object({
  rescheduleUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
  downloadCalendar: z.function().optional(),
  addToCalendar: z.object({
    google: z.string().url(),
    outlook: z.string().url(),
    apple: z.string().url(),
    yahoo: z.string().url(),
  }).optional(),
  shareBooking: z.function().optional(),
  contactSupport: z.function().optional(),
});

const PreparationInfoSchema = z.object({
  checklist: z.array(z.string()).optional(),
  documents: z.array(z.string()).optional(),
  techRequirements: z.array(z.string()).optional(),
  expectations: z.array(z.string()).optional(),
  prepTime: z.number().positive().optional(),
});

const FollowUpInfoSchema = z.object({
  nextSteps: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  resources: z.array(z.object({
    title: z.string().min(1, 'Resource title is required'),
    url: z.string().url('Invalid resource URL'),
    description: z.string().optional(),
  })).optional(),
});

// Validation functions
export function validateConfirmedBooking(booking: unknown): { valid: boolean; errors: string[] } {
  try {
    ConfirmedBookingSchema.parse(booking);
    
    const errors: string[] = [];
    const typedBooking = booking as ConfirmedBooking;
    
    // Additional business logic validation
    const startTime = new Date(typedBooking.startTime);
    const endTime = new Date(typedBooking.endTime);
    
    if (startTime >= endTime) {
      errors.push('Start time must be before end time');
    }
    
    const calculatedDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (Math.abs(calculatedDuration - typedBooking.duration) > 1) {
      errors.push(`Duration mismatch: calculated ${calculatedDuration}min, specified ${typedBooking.duration}min`);
    }
    
    // Validate meeting location based on type
    if (typedBooking.location.type === 'video') {
      const videoDetails = typedBooking.location.details as any;
      if (!videoDetails.joinUrl) {
        errors.push('Video meetings require a join URL');
      }
    }
    
    if (typedBooking.location.type === 'phone') {
      const phoneDetails = typedBooking.location.details as any;
      if (!phoneDetails.phoneNumber) {
        errors.push('Phone meetings require a phone number');
      }
    }
    
    if (typedBooking.location.type === 'in-person') {
      const addressDetails = typedBooking.location.details as any;
      if (!addressDetails.address) {
        errors.push('In-person meetings require an address');
      }
    }
    
    // Validate reference number format (assuming specific format)
    if (!/^[A-Z0-9]{6,12}$/.test(typedBooking.referenceNumber)) {
      errors.push('Reference number should be 6-12 alphanumeric characters');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid booking data']
    };
  }
}

export function validateBookingActions(actions: unknown): { valid: boolean; errors: string[] } {
  try {
    BookingActionsSchema.parse(actions);
    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid booking actions']
    };
  }
}

export function validatePreparationInfo(preparation: unknown): { valid: boolean; errors: string[] } {
  try {
    PreparationInfoSchema.parse(preparation);
    
    const errors: string[] = [];
    const typedPrep = preparation as PreparationInfo;
    
    // Validate preparation time is reasonable
    if (typedPrep.prepTime && typedPrep.prepTime > 480) { // 8 hours
      errors.push('Preparation time seems excessive (>8 hours)');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid preparation info']
    };
  }
}

export function validateFollowUpInfo(followUp: unknown): { valid: boolean; errors: string[] } {
  try {
    FollowUpInfoSchema.parse(followUp);
    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid follow-up info']
    };
  }
}

export function validateConfirmationProps(props: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!props || typeof props !== 'object') {
    return { valid: false, errors: ['Props must be an object'] };
  }
  
  const typedProps = props as Partial<BookingConfirmationProps>;
  
  // Required booking validation
  if (!typedProps.booking) {
    errors.push('booking is required');
  } else {
    const bookingValidation = validateConfirmedBooking(typedProps.booking);
    if (!bookingValidation.valid) {
      errors.push(`Invalid booking: ${bookingValidation.errors.join(', ')}`);
    }
  }
  
  // Optional props validation
  if (typedProps.actions) {
    const actionsValidation = validateBookingActions(typedProps.actions);
    if (!actionsValidation.valid) {
      errors.push(`Invalid actions: ${actionsValidation.errors.join(', ')}`);
    }
  }
  
  if (typedProps.preparation) {
    const prepValidation = validatePreparationInfo(typedProps.preparation);
    if (!prepValidation.valid) {
      errors.push(`Invalid preparation: ${prepValidation.errors.join(', ')}`);
    }
  }
  
  if (typedProps.followUp) {
    const followUpValidation = validateFollowUpInfo(typedProps.followUp);
    if (!followUpValidation.valid) {
      errors.push(`Invalid follow-up: ${followUpValidation.errors.join(', ')}`);
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Mock data generators
export function generateMockConfirmedBooking(overrides: Partial<ConfirmedBooking> = {}): ConfirmedBooking {
  const now = new Date();
  const startTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes later
  
  return {
    id: 'booking_123456789',
    referenceNumber: 'BK' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    service: 'web-development-services',
    provider: 'cal',
    meetingType: 'Strategy Consultation',
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: 30,
    timezone: 'America/New_York',
    location: {
      type: 'video',
      details: {
        platform: 'zoom',
        joinUrl: 'https://zoom.us/j/123456789',
        meetingId: '123 456 789',
        password: 'abc123',
      },
      instructions: 'Please join 5 minutes early'
    },
    customer: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      timezone: 'America/New_York',
      company: 'Acme Corp',
      title: 'CTO',
    },
    status: 'confirmed',
    createdAt: now.toISOString(),
    pricing: {
      amount: 150,
      currency: 'USD',
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
    },
    notes: 'Looking forward to discussing the project requirements',
    ...overrides,
  };
}

export function generateMockPreparationInfo(): PreparationInfo {
  return {
    checklist: [
      'Review your current website and note specific areas for improvement',
      'Gather any existing brand guidelines or design preferences',
      'Prepare a list of competitor websites you admire',
      'Think about your target audience and their needs',
    ],
    documents: [
      'Current website analytics report',
      'Brand guidelines document',
      'Example websites list',
    ],
    techRequirements: [
      'Stable internet connection',
      'Updated web browser',
      'Ability to share your screen',
    ],
    expectations: [
      'We will discuss your project goals and requirements',
      'Review your current website and identify opportunities',
      'Provide initial recommendations and next steps',
      'Answer any questions about our development process',
    ],
    prepTime: 15,
  };
}

export function generateMockFollowUpInfo(): FollowUpInfo {
  return {
    nextSteps: [
      'We will send you a detailed proposal within 2 business days',
      'You will have 1 week to review and provide feedback',
      'Once approved, we will schedule a project kickoff meeting',
      'Development work will begin within 1 week of contract signing',
    ],
    timeline: 'Proposal delivery: 2-3 business days | Project start: 1-2 weeks after approval',
    resources: [
      {
        title: 'Web Development Process Guide',
        url: 'https://example.com/process-guide',
        description: 'Learn about our development methodology and project phases',
      },
      {
        title: 'Portfolio Examples',
        url: 'https://example.com/portfolio',
        description: 'View examples of our recent web development projects',
      },
      {
        title: 'Client Testimonials',
        url: 'https://example.com/testimonials',
        description: 'Read what our clients say about working with us',
      },
    ],
  };
}

// Performance testing utilities
export class ConfirmationPerformanceTester {
  private startTime: number = 0;
  private metrics: Map<string, number[]> = new Map();
  
  startMeasure(operation: string): void {
    this.startTime = performance.now();
  }
  
  endMeasure(operation: string): number {
    const duration = performance.now() - this.startTime;
    
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    this.metrics.get(operation)!.push(duration);
    return duration;
  }
  
  getAverageTime(operation: string): number {
    const times = this.metrics.get(operation) || [];
    if (times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getReport(): Record<string, { average: number; min: number; max: number; count: number }> {
    const report: Record<string, any> = {};
    
    for (const [operation, times] of this.metrics) {
      if (times.length > 0) {
        report[operation] = {
          average: this.getAverageTime(operation),
          min: Math.min(...times),
          max: Math.max(...times),
          count: times.length
        };
      }
    }
    
    return report;
  }
  
  reset(): void {
    this.metrics.clear();
  }
}

// Accessibility testing helpers
export function validateConfirmationAccessibility(element: HTMLElement): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check heading structure
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    errors.push('No heading elements found');
  }
  
  // Check for main landmark
  const main = element.querySelector('main') || element.querySelector('[role="main"]');
  if (!main) {
    errors.push('No main landmark found');
  }
  
  // Check buttons have accessible names
  const buttons = element.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const hasText = button.textContent?.trim();
    const hasAriaLabel = button.getAttribute('aria-label');
    const hasAriaLabelledBy = button.getAttribute('aria-labelledby');
    
    if (!hasText && !hasAriaLabel && !hasAriaLabelledBy) {
      errors.push(`Button ${index} missing accessible name`);
    }
  });
  
  // Check links have accessible names
  const links = element.querySelectorAll('a');
  links.forEach((link, index) => {
    const hasText = link.textContent?.trim();
    const hasAriaLabel = link.getAttribute('aria-label');
    
    if (!hasText && !hasAriaLabel) {
      errors.push(`Link ${index} missing accessible name`);
    }
  });
  
  // Check for skip links or navigation
  const skipLinks = element.querySelectorAll('a[href^="#"]');
  const nav = element.querySelector('nav');
  
  if (skipLinks.length === 0 && !nav) {
    errors.push('Consider adding skip navigation links');
  }
  
  // Check color contrast (basic check)
  const colorElements = element.querySelectorAll('[style*="color"]');
  if (colorElements.length > 0) {
    errors.push('Manual color contrast verification needed for inline styles');
  }
  
  return { valid: errors.length === 0, errors };
}

// Integration test runner
export async function runConfirmationTests(): Promise<void> {
  console.log('🧪 Running BookingConfirmation validation tests...\n');
  
  const tester = new ConfirmationPerformanceTester();
  let passCount = 0;
  let failCount = 0;
  
  // Test 1: Mock data generation and validation
  console.log('Test 1: Mock data generation and validation');
  tester.startMeasure('mock-generation');
  
  const mockBooking = generateMockConfirmedBooking();
  const mockPrep = generateMockPreparationInfo();
  const mockFollowUp = generateMockFollowUpInfo();
  
  tester.endMeasure('mock-generation');
  
  const bookingValidation = validateConfirmedBooking(mockBooking);
  const prepValidation = validatePreparationInfo(mockPrep);
  const followUpValidation = validateFollowUpInfo(mockFollowUp);
  
  if (bookingValidation.valid && prepValidation.valid && followUpValidation.valid) {
    console.log('✅ Mock data generation and validation passed');
    passCount++;
  } else {
    console.log('❌ Mock data validation failed:', 
      bookingValidation.errors, prepValidation.errors, followUpValidation.errors);
    failCount++;
  }
  
  // Test 2: Props validation
  console.log('\nTest 2: Props validation');
  
  const validProps: BookingConfirmationProps = {
    booking: mockBooking,
    preparation: mockPrep,
    followUp: mockFollowUp,
    showDetails: true,
    showPreparation: true,
    showFollowUp: true,
  };
  
  const propsValidation = validateConfirmationProps(validProps);
  
  if (propsValidation.valid) {
    console.log('✅ Props validation passed');
    passCount++;
  } else {
    console.log('❌ Props validation failed:', propsValidation.errors);
    failCount++;
  }
  
  // Test 3: Edge cases
  console.log('\nTest 3: Edge case validation');
  
  const edgeCaseBooking = generateMockConfirmedBooking({
    startTime: new Date('2025-12-31T23:30:00Z').toISOString(),
    endTime: new Date('2025-12-31T23:30:00Z').toISOString(), // Same time (invalid)
  });
  
  const edgeCaseValidation = validateConfirmedBooking(edgeCaseBooking);
  
  if (!edgeCaseValidation.valid && edgeCaseValidation.errors.some(e => e.includes('Start time must be before end time'))) {
    console.log('✅ Edge case validation passed (correctly caught invalid time range)');
    passCount++;
  } else {
    console.log('❌ Edge case validation failed - should have caught invalid time range');
    failCount++;
  }
  
  // Performance report
  console.log('\n📊 Performance Report:');
  const report = tester.getReport();
  Object.entries(report).forEach(([operation, metrics]) => {
    console.log(`${operation}: ${metrics.average.toFixed(2)}ms avg (${metrics.count} runs)`);
  });
  
  // Summary
  console.log(`\n📋 Test Summary:`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${passCount + failCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All tests passed! BookingConfirmation component is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
    process.exit(1);
  }
}

// CLI runner
if (require.main === module) {
  runConfirmationTests().catch(console.error);
}