// src/data/booking/_utils/search.ts
// Booking search and filtering utilities
// Provides advanced search capabilities for booking data

import type {
  BookingResult,
  BookingSearchParams,
  BookingSearchResult,
  CanonicalService,
  BookingProvider,
  MeetingType,
} from '../_types';

// ============================================================================
// Search Configuration
// ============================================================================

interface SearchConfig {
  fuzzyThreshold: number;
  maxResults: number;
  sortBy: keyof BookingResult | 'relevance';
  sortOrder: 'asc' | 'desc';
  enableHighlighting: boolean;
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  fuzzyThreshold: 0.6,
  maxResults: 50,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  enableHighlighting: false,
};

// ============================================================================
// Main Search Function
// ============================================================================

export async function searchBookings(
  bookings: BookingResult[],
  params: BookingSearchParams,
  config: Partial<SearchConfig> = {}
): Promise<BookingSearchResult> {
  const searchConfig = { ...DEFAULT_SEARCH_CONFIG, ...config };
  
  let filteredBookings = [...bookings];

  // Apply filters
  if (params.service) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.service === params.service
    );
  }

  if (params.provider) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.provider === params.provider
    );
  }

  if (params.meetingType) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.meetingType === params.meetingType
    );
  }

  if (params.duration) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.duration === params.duration
    );
  }

  if (params.timezone) {
    filteredBookings = filteredBookings.filter(booking => 
      booking.timezone === params.timezone ||
      booking.customer.timezone === params.timezone
    );
  }

  // Date range filtering
  if (params.dateRange) {
    const startDate = new Date(params.dateRange.start);
    const endDate = new Date(params.dateRange.end);
    
    filteredBookings = filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.startTime);
      return bookingDate >= startDate && bookingDate <= endDate;
    });
  }

  // Sort results
  filteredBookings = sortBookings(filteredBookings, searchConfig.sortBy, searchConfig.sortOrder);

  // Limit results
  if (searchConfig.maxResults > 0) {
    filteredBookings = filteredBookings.slice(0, searchConfig.maxResults);
  }

  // Generate search result metadata
  const filters = generateFilters(bookings);

  return {
    bookings: filteredBookings,
    total: filteredBookings.length,
    filters,
  };
}

// ============================================================================
// Text Search Functions
// ============================================================================

export function searchBookingsByText(
  bookings: BookingResult[],
  query: string,
  config: Partial<SearchConfig> = {}
): BookingResult[] {
  const searchConfig = { ...DEFAULT_SEARCH_CONFIG, ...config };
  
  if (!query || query.trim().length === 0) {
    return bookings;
  }

  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return bookings
    .map(booking => ({
      booking,
      score: calculateBookingScore(booking, searchTerms, searchConfig.fuzzyThreshold),
    }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, searchConfig.maxResults)
    .map(result => result.booking);
}

function calculateBookingScore(
  booking: BookingResult,
  searchTerms: string[],
  threshold: number
): number {
  const searchableText = [
    booking.customer.name,
    booking.customer.email,
    booking.customer.company || '',
    booking.meetingType,
    booking.service,
    booking.referenceNumber,
    booking.customer.notes || '',
  ].join(' ').toLowerCase();

  let totalScore = 0;

  for (const term of searchTerms) {
    // Exact match
    if (searchableText.includes(term)) {
      totalScore += 10;
      continue;
    }

    // Fuzzy match
    const fuzzyScore = calculateFuzzyScore(searchableText, term);
    if (fuzzyScore >= threshold) {
      totalScore += fuzzyScore * 5;
    }
  }

  return totalScore;
}

function calculateFuzzyScore(text: string, term: string): number {
  if (text.includes(term)) return 1;
  
  // Simple fuzzy matching based on character overlap
  const textChars = new Set(text);
  const termChars = new Set(term);
  
  let overlap = 0;
  for (const char of termChars) {
    if (textChars.has(char)) overlap++;
  }
  
  return overlap / Math.max(termChars.size, 1);
}

// ============================================================================
// Sorting Functions
// ============================================================================

function sortBookings(
  bookings: BookingResult[],
  sortBy: keyof BookingResult | 'relevance',
  sortOrder: 'asc' | 'desc'
): BookingResult[] {
  return bookings.sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'relevance':
        // For relevance, maintain current order (already sorted by score)
        return 0;
      
      case 'startTime':
      case 'endTime':
      case 'createdAt':
      case 'updatedAt':
        aValue = new Date(a[sortBy]).getTime();
        bValue = new Date(b[sortBy]).getTime();
        break;
      
      case 'duration':
        aValue = a.duration;
        bValue = b.duration;
        break;
      
      case 'customer':
        aValue = a.customer.name.toLowerCase();
        bValue = b.customer.name.toLowerCase();
        break;
      
      default:
        aValue = String(a[sortBy as keyof BookingResult]).toLowerCase();
        bValue = String(b[sortBy as keyof BookingResult]).toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// Filter Generation
// ============================================================================

function generateFilters(bookings: BookingResult[]): BookingSearchResult['filters'] {
  const services = new Set<CanonicalService>();
  const providers = new Set<BookingProvider>();
  const meetingTypes = new Set<MeetingType>();
  let earliest = '';
  let latest = '';

  for (const booking of bookings) {
    services.add(booking.service);
    providers.add(booking.provider);
    meetingTypes.add(booking.meetingType);
    
    if (!earliest || booking.startTime < earliest) {
      earliest = booking.startTime;
    }
    if (!latest || booking.startTime > latest) {
      latest = booking.startTime;
    }
  }

  return {
    services: Array.from(services),
    providers: Array.from(providers),
    meetingTypes: Array.from(meetingTypes),
    dateRange: {
      earliest: earliest || new Date().toISOString(),
      latest: latest || new Date().toISOString(),
    },
  };
}

// ============================================================================
// Advanced Search Functions
// ============================================================================

export function searchByCustomer(
  bookings: BookingResult[],
  customerQuery: string
): BookingResult[] {
  const query = customerQuery.toLowerCase().trim();
  
  return bookings.filter(booking => {
    const { customer } = booking;
    
    return (
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      (customer.company && customer.company.toLowerCase().includes(query)) ||
      (customer.phone && customer.phone.includes(query))
    );
  });
}

export function searchByDateRange(
  bookings: BookingResult[],
  startDate: string,
  endDate: string
): BookingResult[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return bookings.filter(booking => {
    const bookingDate = new Date(booking.startTime);
    return bookingDate >= start && bookingDate <= end;
  });
}

export function searchByStatus(
  bookings: BookingResult[],
  status: BookingResult['status']
): BookingResult[] {
  return bookings.filter(booking => booking.status === status);
}

export function searchByReferenceNumber(
  bookings: BookingResult[],
  referenceNumber: string
): BookingResult | null {
  const booking = bookings.find(b => 
    b.referenceNumber === referenceNumber ||
    b.id === referenceNumber
  );
  
  return booking || null;
}

// ============================================================================
// Aggregation Functions
// ============================================================================

export function aggregateBookingsByService(
  bookings: BookingResult[]
): Record<CanonicalService, number> {
  const aggregation = {} as Record<CanonicalService, number>;
  
  for (const booking of bookings) {
    aggregation[booking.service] = (aggregation[booking.service] || 0) + 1;
  }
  
  return aggregation;
}

export function aggregateBookingsByProvider(
  bookings: BookingResult[]
): Record<BookingProvider, number> {
  const aggregation = {} as Record<BookingProvider, number>;
  
  for (const booking of bookings) {
    aggregation[booking.provider] = (aggregation[booking.provider] || 0) + 1;
  }
  
  return aggregation;
}

export function aggregateBookingsByMeetingType(
  bookings: BookingResult[]
): Record<MeetingType, number> {
  const aggregation = {} as Record<MeetingType, number>;
  
  for (const booking of bookings) {
    aggregation[booking.meetingType] = (aggregation[booking.meetingType] || 0) + 1;
  }
  
  return aggregation;
}

export function aggregateBookingsByMonth(
  bookings: BookingResult[]
): Record<string, number> {
  const aggregation: Record<string, number> = {};
  
  for (const booking of bookings) {
    const date = new Date(booking.startTime);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    aggregation[monthKey] = (aggregation[monthKey] || 0) + 1;
  }
  
  return aggregation;
}

// ============================================================================
// Export Search Utilities
// ============================================================================

export {
  type SearchConfig,
  DEFAULT_SEARCH_CONFIG,
};
