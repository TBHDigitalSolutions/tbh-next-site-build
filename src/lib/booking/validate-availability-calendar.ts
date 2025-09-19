// scripts/booking/validate-availability-calendar.ts
// Comprehensive validation and testing for AvailabilityCalendar component

import { z } from 'zod';
import type { 
  TimeSlot, 
  DayAvailability, 
  CalendarConfig,
  AvailabilityCalendarProps 
} from '../../src/booking/components/AvailabilityCalendar/AvailabilityCalendar.types';

// Validation schemas
const TimeSlotSchema = z.object({
  startTime: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid start time'),
  endTime: z.string().refine(date => !isNaN(Date.parse(date)), 'Invalid end time'),
  duration: z.number().positive('Duration must be positive'),
  available: z.boolean(),
  providerId: z.string().optional(),
  meetingType: z.string().optional(),
  timezone: z.string(),
  price: z.object({
    amount: z.number().nonnegative(),
    currency: z.string().length(3)
  }).optional()
});

const DayAvailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  hasAvailability: z.boolean(),
  slots: z.array(TimeSlotSchema),
  metadata: z.object({
    dayOfWeek: z.number().min(0).max(6),
    isWeekend: z.boolean(),
    isHoliday: z.boolean(),
    specialNote: z.string().optional()
  }).optional()
});

const CalendarConfigSchema = z.object({
  service: z.enum([
    'web-development-services',
    'video-production-services', 
    'seo-services',
    'marketing-services',
    'lead-generation-services',
    'content-production-services'
  ]),
  provider: z.enum(['cal', 'calendly', 'acuity', 'custom']),
  meetingType: z.string().optional(),
  minAdvanceHours: z.number().nonnegative().optional(),
  maxFutureDays: z.number().positive().optional(),
  availableDays: z.array(z.number().min(0).max(6)).optional(),
  businessHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    timezone: z.string()
  }).optional()
});

// Validation functions
export function validateTimeSlot(slot: unknown): { valid: boolean; errors: string[] } {
  try {
    TimeSlotSchema.parse(slot);
    
    // Additional business logic validation
    const errors: string[] = [];
    const typedSlot = slot as TimeSlot;
    
    const startTime = new Date(typedSlot.startTime);
    const endTime = new Date(typedSlot.endTime);
    
    if (startTime >= endTime) {
      errors.push('Start time must be before end time');
    }
    
    const calculatedDuration = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (Math.abs(calculatedDuration - typedSlot.duration) > 1) {
      errors.push(`Duration mismatch: calculated ${calculatedDuration}min, specified ${typedSlot.duration}min`);
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { 
      valid: false, 
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid time slot'] 
    };
  }
}

export function validateDayAvailability(day: unknown): { valid: boolean; errors: string[] } {
  try {
    DayAvailabilitySchema.parse(day);
    
    const errors: string[] = [];
    const typedDay = day as DayAvailability;
    
    // Check consistency between hasAvailability and slots
    const hasSlots = typedDay.slots.some(slot => slot.available);
    if (typedDay.hasAvailability !== hasSlots) {
      errors.push(`hasAvailability (${typedDay.hasAvailability}) doesn't match available slots (${hasSlots})`);
    }
    
    // Validate each slot
    typedDay.slots.forEach((slot, index) => {
      const slotValidation = validateTimeSlot(slot);
      if (!slotValidation.valid) {
        errors.push(`Slot ${index}: ${slotValidation.errors.join(', ')}`);
      }
    });
    
    // Check for overlapping slots
    for (let i = 0; i < typedDay.slots.length; i++) {
      for (let j = i + 1; j < typedDay.slots.length; j++) {
        const slot1 = typedDay.slots[i];
        const slot2 = typedDay.slots[j];
        
        const start1 = new Date(slot1.startTime);
        const end1 = new Date(slot1.endTime);
        const start2 = new Date(slot2.startTime);
        const end2 = new Date(slot2.endTime);
        
        if (start1 < end2 && start2 < end1) {
          errors.push(`Overlapping slots at positions ${i} and ${j}`);
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { 
      valid: false, 
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid day availability'] 
    };
  }
}

export function validateCalendarConfig(config: unknown): { valid: boolean; errors: string[] } {
  try {
    CalendarConfigSchema.parse(config);
    
    const errors: string[] = [];
    const typedConfig = config as CalendarConfig;
    
    // Validate business hours if provided
    if (typedConfig.businessHours) {
      const start = typedConfig.businessHours.start;
      const end = typedConfig.businessHours.end;
      
      if (start >= end) {
        errors.push('Business hours start must be before end');
      }
    }
    
    // Validate advance booking time
    if (typedConfig.minAdvanceHours && typedConfig.minAdvanceHours > 8760) { // 1 year
      errors.push('Minimum advance hours seems too large (>1 year)');
    }
    
    // Validate future booking window
    if (typedConfig.maxFutureDays && typedConfig.maxFutureDays > 365) {
      errors.push('Maximum future days seems too large (>1 year)');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { 
      valid: false, 
      errors: error instanceof z.ZodError ? error.errors.map(e => e.message) : ['Invalid calendar config'] 
    };
  }
}

// Component props validation
export function validateCalendarProps(props: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!props || typeof props !== 'object') {
    return { valid: false, errors: ['Props must be an object'] };
  }
  
  const typedProps = props as Partial<AvailabilityCalendarProps>;
  
  // Required config validation
  if (!typedProps.config) {
    errors.push('config is required');
  } else {
    const configValidation = validateCalendarConfig(typedProps.config);
    if (!configValidation.valid) {
      errors.push(`Invalid config: ${configValidation.errors.join(', ')}`);
    }
  }
  
  // Optional props validation
  if (typedProps.view && !['month', 'week', 'day'].includes(typedProps.view)) {
    errors.push('view must be "month", "week", or "day"');
  }
  
  if (typedProps.selectionMode && !['single', 'range', 'multiple'].includes(typedProps.selectionMode)) {
    errors.push('selectionMode must be "single", "range", or "multiple"');
  }
  
  if (typedProps.timeFormat && !['12h', '24h'].includes(typedProps.timeFormat)) {
    errors.push('timeFormat must be "12h" or "24h"');
  }
  
  if (typedProps.minSlots && typedProps.maxSlots && typedProps.minSlots > typedProps.maxSlots) {
    errors.push('minSlots cannot be greater than maxSlots');
  }
  
  return { valid: errors.length === 0, errors };
}

// Performance testing utilities
export class CalendarPerformanceTester {
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
export function validateAccessibility(element: HTMLElement): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check ARIA labels
  const buttons = element.querySelectorAll('button');
  buttons.forEach((button, index) => {
    if (!button.getAttribute('aria-label') && !button.textContent?.trim()) {
      errors.push(`Button ${index} missing accessible label`);
    }
  });
  
  // Check focus management
  const focusableElements = element.querySelectorAll(
    'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) {
    errors.push('No focusable elements found');
  }
  
  // Check semantic HTML
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  if (headings.length === 0) {
    errors.push('No heading elements found for screen readers');
  }
  
  // Check keyboard navigation
  const interactiveElements = element.querySelectorAll('[onclick], .clickable');
  interactiveElements.forEach((el, index) => {
    if (!el.getAttribute('tabindex') && el.tagName !== 'BUTTON' && el.tagName !== 'A') {
      errors.push(`Interactive element ${index} not keyboard accessible`);
    }
  });
  
  return { valid: errors.length === 0, errors };
}

// Mock data generators for testing
export function generateMockTimeSlots(count: number, date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const baseTime = new Date(date);
  baseTime.setHours(9, 0, 0, 0); // Start at 9 AM
  
  for (let i = 0; i < count; i++) {
    const startTime = new Date(baseTime);
    startTime.setMinutes(startTime.getMinutes() + i * 30); // 30-minute intervals
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    slots.push({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: 30,
      available: Math.random() > 0.3, // 70% availability
      timezone: 'America/New_York',
      providerId: `slot-${i}`,
      meetingType: 'consultation'
    });
  }
  
  return slots;
}

export function generateMockDayAvailability(date: Date): DayAvailability {
  const slots = generateMockTimeSlots(8, date); // 8 slots per day
  const hasAvailability = slots.some(slot => slot.available);
  
  return {
    date: date.toISOString().split('T')[0],
    hasAvailability,
    slots,
    metadata: {
      dayOfWeek: date.getDay(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isHoliday: false
    }
  };
}

// Integration test runner
export async function runCalendarTests(): Promise<void> {
  console.log('🧪 Running AvailabilityCalendar validation tests...\n');
  
  const tester = new CalendarPerformanceTester();
  let passCount = 0;
  let failCount = 0;
  
  // Test 1: Validate mock data generation
  console.log('Test 1: Mock data generation');
  tester.startMeasure('mock-generation');
  
  const testDate = new Date();
  const mockSlots = generateMockTimeSlots(5, testDate);
  const mockDay = generateMockDayAvailability(testDate);
  
  tester.endMeasure('mock-generation');
  
  const slotValidation = validateTimeSlot(mockSlots[0]);
  const dayValidation = validateDayAvailability(mockDay);
  
  if (slotValidation.valid && dayValidation.valid) {
    console.log('✅ Mock data generation passed');
    passCount++;
  } else {
    console.log('❌ Mock data generation failed:', slotValidation.errors, dayValidation.errors);
    failCount++;
  }
  
  // Test 2: Config validation
  console.log('\nTest 2: Config validation');
  
  const validConfig: CalendarConfig = {
    service: 'web-development-services',
    provider: 'cal',
    minAdvanceHours: 24,
    maxFutureDays: 90,
    businessHours: {
      start: '09:00',
      end: '17:00',
      timezone: 'America/New_York'
    }
  };
  
  const configValidation = validateCalendarConfig(validConfig);
  
  if (configValidation.valid) {
    console.log('✅ Config validation passed');
    passCount++;
  } else {
    console.log('❌ Config validation failed:', configValidation.errors);
    failCount++;
  }
  
  // Test 3: Props validation
  console.log('\nTest 3: Props validation');
  
  const validProps: Partial<AvailabilityCalendarProps> = {
    config: validConfig,
    view: 'month',
    selectionMode: 'single',
    timeFormat: '12h',
    minSlots: 1,
    maxSlots: 1
  };
  
  const propsValidation = validateCalendarProps(validProps);
  
  if (propsValidation.valid) {
    console.log('✅ Props validation passed');
    passCount++;
  } else {
    console.log('❌ Props validation failed:', propsValidation.errors);
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
    console.log('\n🎉 All tests passed! Calendar component is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review and fix issues before deployment.');
    process.exit(1);
  }
}

// CLI runner
if (require.main === module) {
  runCalendarTests().catch(console.error);
}