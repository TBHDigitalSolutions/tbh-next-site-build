// src/booking/lib/utils.ts - Additional utilities needed for AvailabilityCalendar

// Get user's timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

// Format duration from minutes to human readable
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

// Convert time between timezones
export function convertTimezone(dateTime: string, fromTimezone: string, toTimezone: string): string {
  try {
    const date = new Date(dateTime);
    
    // Create formatter for target timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: toTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    const hour = parts.find(p => p.type === 'hour')?.value || '';
    const minute = parts.find(p => p.type === 'minute')?.value || '';
    const second = parts.find(p => p.type === 'second')?.value || '';
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}`;
  } catch (error) {
    console.warn('Timezone conversion failed:', error);
    return dateTime;
  }
}

// Check if a date is a weekend
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

// Check if a date is a holiday (basic implementation)
export function isHoliday(date: Date): boolean {
  // This is a basic implementation - in production you'd want a more comprehensive holiday checker
  const month = date.getMonth();
  const day = date.getDate();
  
  // Common US holidays (simplified)
  const holidays = [
    { month: 0, day: 1 },   // New Year's Day
    { month: 6, day: 4 },   // Independence Day
    { month: 11, day: 25 }, // Christmas Day
  ];
  
  return holidays.some(holiday => holiday.month === month && holiday.day === day);
}

// Generate a date range
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Format date for display
export function formatDisplayDate(date: Date | string, format: 'short' | 'long' | 'numeric' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'short', day: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    numeric: { month: 'numeric', day: 'numeric', year: 'numeric' }
  }[format];
  
  return dateObj.toLocaleDateString('en-US', options);
}

// Check if time slot conflicts with business hours
export function isWithinBusinessHours(slot: string, businessHours: { start: string; end: string; timezone: string }): boolean {
  try {
    const slotDate = new Date(slot);
    const slotTime = slotDate.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: businessHours.timezone 
    });
    
    return slotTime >= businessHours.start && slotTime <= businessHours.end;
  } catch {
    return true; // Default to allowing if parsing fails
  }
}

// Validate time slot structure
export function validateTimeSlot(slot: any): slot is { startTime: string; endTime: string; duration: number; available: boolean; timezone: string } {
  return (
    typeof slot === 'object' &&
    slot !== null &&
    typeof slot.startTime === 'string' &&
    typeof slot.endTime === 'string' &&
    typeof slot.duration === 'number' &&
    typeof slot.available === 'boolean' &&
    typeof slot.timezone === 'string' &&
    !isNaN(new Date(slot.startTime).getTime()) &&
    !isNaN(new Date(slot.endTime).getTime())
  );
}

// Calculate slot duration from start and end times
export function calculateSlotDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Convert to minutes
}

// Group slots by date
export function groupSlotsByDate(slots: Array<{ startTime: string; endTime: string; [key: string]: any }>): Record<string, typeof slots> {
  return slots.reduce((groups, slot) => {
    const date = new Date(slot.startTime).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {} as Record<string, typeof slots>);
}

// Sort slots by time
export function sortSlotsByTime<T extends { startTime: string }>(slots: T[]): T[] {
  return [...slots].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// Check for slot conflicts
export function hasSlotConflict(slot1: { startTime: string; endTime: string }, slot2: { startTime: string; endTime: string }): boolean {
  const start1 = new Date(slot1.startTime);
  const end1 = new Date(slot1.endTime);
  const start2 = new Date(slot2.startTime);
  const end2 = new Date(slot2.endTime);
  
  return start1 < end2 && start2 < end1;
}

// Generate time slots for a given day
export function generateTimeSlots(
  date: Date,
  startHour: number,
  endHour: number,
  duration: number,
  timezone: string = 'UTC'
): Array<{ startTime: string; endTime: string; duration: number; timezone: string }> {
  const slots = [];
  const baseDate = new Date(date);
  baseDate.setHours(startHour, 0, 0, 0);
  
  while (baseDate.getHours() < endHour) {
    const startTime = new Date(baseDate);
    const endTime = new Date(baseDate);
    endTime.setMinutes(endTime.getMinutes() + duration);
    
    // Don't create slots that go past end hour
    if (endTime.getHours() <= endHour) {
      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
        timezone
      });
    }
    
    baseDate.setMinutes(baseDate.getMinutes() + duration);
  }
  
  return slots;
}