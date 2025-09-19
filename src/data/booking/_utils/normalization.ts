// src/data/booking/_utils/normalization.ts
// Booking data normalization utilities
// Standardizes data from different providers into common format

import type {
  BookingResult,
  CustomerInfo,
  MeetingLocation,
  CanonicalService,
  BookingProvider,
} from '../_types';

// ============================================================================
// Provider Response Normalization
// ============================================================================

interface CalComResponse {
  id: string;
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Array<{
    name: string;
    email: string;
    timeZone: string;
  }>;
  location?: {
    type: string;
    link?: string;
  };
  metadata?: Record<string, unknown>;
}

interface CalendlyResponse {
  resource: {
    uri: string;
    name: string;
    email: string;
    status: string;
    start_time: string;
    end_time: string;
    event_type: {
      name: string;
      duration: number;
    };
    location?: {
      type: string;
      location?: string;
      join_url?: string;
    };
  };
}

interface AcuityResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  datetime: string;
  endTime: string;
  duration: number;
  appointmentType: string;
  location: string;
  notes: string;
  timezone: string;
}

// ============================================================================
// Normalization Functions
// ============================================================================

export function normalizeCalComBooking(
  response: CalComResponse,
  service: CanonicalService
): BookingResult {
  const attendee = response.attendees[0];
  
  return {
    id: response.id,
    referenceNumber: response.uid,
    service,
    provider: 'cal',
    meetingType: inferMeetingType(response.title),
    startTime: response.startTime,
    endTime: response.endTime,
    duration: calculateDuration(response.startTime, response.endTime),
    timezone: attendee?.timeZone || 'UTC',
    location: normalizeCalComLocation(response.location),
    customer: {
      name: attendee?.name || '',
      email: attendee?.email || '',
      timezone: attendee?.timeZone || 'UTC',
    },
    status: 'confirmed',
    metadata: {
      source: 'page',
      sessionId: generateSessionId(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeCalendlyBooking(
  response: CalendlyResponse,
  service: CanonicalService
): BookingResult {
  const { resource } = response;
  
  return {
    id: extractIdFromUri(resource.uri),
    referenceNumber: resource.uri,
    service,
    provider: 'calendly',
    meetingType: inferMeetingType(resource.event_type.name),
    startTime: resource.start_time,
    endTime: resource.end_time,
    duration: resource.event_type.duration,
    timezone: 'UTC', // Calendly uses UTC by default
    location: normalizeCalendlyLocation(resource.location),
    customer: {
      name: resource.name,
      email: resource.email,
      timezone: 'UTC',
    },
    status: mapCalendlyStatus(resource.status),
    metadata: {
      source: 'page',
      sessionId: generateSessionId(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeAcuityBooking(
  response: AcuityResponse,
  service: CanonicalService
): BookingResult {
  return {
    id: response.id.toString(),
    referenceNumber: `ACU-${response.id}`,
    service,
    provider: 'acuity',
    meetingType: inferMeetingType(response.appointmentType),
    startTime: response.datetime,
    endTime: response.endTime,
    duration: response.duration,
    timezone: response.timezone,
    location: normalizeAcuityLocation(response.location),
    customer: {
      name: `${response.firstName} ${response.lastName}`,
      email: response.email,
      phone: response.phone,
      notes: response.notes,
      timezone: response.timezone,
    },
    status: 'confirmed',
    metadata: {
      source: 'page',
      sessionId: generateSessionId(),
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// Location Normalization
// ============================================================================

function normalizeCalComLocation(location?: CalComResponse['location']): MeetingLocation {
  if (!location) {
    return {
      type: 'video',
      details: { platform: 'Google Meet' }
    };
  }

  switch (location.type) {
    case 'integrations:zoom':
      return {
        type: 'video',
        details: {
          platform: 'Zoom',
          url: location.link,
        }
      };
    case 'integrations:google:meet':
      return {
        type: 'video',
        details: {
          platform: 'Google Meet',
          url: location.link,
        }
      };
    case 'phone':
      return {
        type: 'phone',
        details: {}
      };
    default:
      return {
        type: 'video',
        details: {
          platform: 'Video Call',
          url: location.link,
        }
      };
  }
}

function normalizeCalendlyLocation(location?: CalendlyResponse['resource']['location']): MeetingLocation {
  if (!location) {
    return {
      type: 'video',
      details: { platform: 'Video Call' }
    };
  }

  switch (location.type) {
    case 'zoom':
    case 'gotomeeting':
    case 'webex':
      return {
        type: 'video',
        details: {
          platform: location.type,
          url: location.join_url,
        }
      };
    case 'phone':
      return {
        type: 'phone',
        details: {
          phone: location.location,
        }
      };
    case 'physical':
      return {
        type: 'in-person',
        details: {
          address: location.location,
        }
      };
    default:
      return {
        type: 'video',
        details: {
          platform: 'Video Call',
          url: location.join_url,
        }
      };
  }
}

function normalizeAcuityLocation(location: string): MeetingLocation {
  if (location.includes('zoom.us') || location.includes('meet.google.com')) {
    return {
      type: 'video',
      details: {
        platform: location.includes('zoom.us') ? 'Zoom' : 'Google Meet',
        url: location,
      }
    };
  }

  if (location.includes('phone') || /\+?\d+/.test(location)) {
    return {
      type: 'phone',
      details: {
        phone: location,
      }
    };
  }

  return {
    type: 'in-person',
    details: {
      address: location,
    }
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function inferMeetingType(title: string): BookingResult['meetingType'] {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.includes('discovery') || lowerTitle.includes('intro')) {
    return 'discovery';
  }
  if (lowerTitle.includes('strategy') || lowerTitle.includes('planning')) {
    return 'strategy';
  }
  if (lowerTitle.includes('review') || lowerTitle.includes('feedback')) {
    return 'review';
  }
  if (lowerTitle.includes('support') || lowerTitle.includes('help')) {
    return 'support';
  }
  
  return 'consultation';
}

function calculateDuration(startTime: string, endTime: string): number {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

function extractIdFromUri(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1];
}

function mapCalendlyStatus(status: string): BookingResult['status'] {
  switch (status) {
    case 'active':
      return 'confirmed';
    case 'canceled':
      return 'cancelled';
    default:
      return 'pending';
  }
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Customer Info Normalization
// ============================================================================

export function normalizeCustomerInfo(data: Record<string, unknown>): CustomerInfo {
  const name = [data.firstName, data.lastName].filter(Boolean).join(' ') || 
               String(data.name || data.fullName || '');
  
  return {
    name: name.trim(),
    email: String(data.email || ''),
    phone: data.phone ? String(data.phone) : undefined,
    company: data.company ? String(data.company) : undefined,
    role: data.role || data.jobTitle ? String(data.role || data.jobTitle) : undefined,
    timezone: String(data.timezone || data.timeZone || 'UTC'),
    notes: data.notes || data.message ? String(data.notes || data.message) : undefined,
    referralSource: data.referralSource ? String(data.referralSource) : undefined,
  };
}

// ============================================================================
// Service Mapping
// ============================================================================

export function mapServiceToCanonical(providerService: string): CanonicalService {
  const serviceMap: Record<string, CanonicalService> = {
    'web-dev': 'web-development-services',
    'website': 'web-development-services',
    'development': 'web-development-services',
    'video': 'video-production-services',
    'production': 'video-production-services',
    'seo': 'seo-services',
    'search': 'seo-services',
    'marketing': 'marketing-services',
    'digital-marketing': 'marketing-services',
    'leads': 'lead-generation-services',
    'lead-gen': 'lead-generation-services',
    'content': 'content-production-services',
    'copywriting': 'content-production-services',
  };

  const normalized = providerService.toLowerCase().replace(/[^a-z-]/g, '');
  return serviceMap[normalized] || 'web-development-services';
}

export { type CalComResponse, type CalendlyResponse, type AcuityResponse };