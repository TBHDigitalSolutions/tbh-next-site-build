// src/booking/components/BookingConfirmation/BookingConfirmation.types.ts
// Types for the booking confirmation component

import type { CanonicalService, BookingProvider } from "../../lib/types";

// Confirmed booking data
export interface ConfirmedBooking {
  /** Unique booking identifier */
  id: string;
  /** Booking reference number for customer */
  referenceNumber: string;
  /** Service that was booked */
  service: CanonicalService;
  /** Provider used for booking */
  provider: BookingProvider;
  /** Meeting type booked */
  meetingType: string;
  /** Scheduled start time (ISO string) */
  startTime: string;
  /** Scheduled end time (ISO string) */
  endTime: string;
  /** Duration in minutes */
  duration: number;
  /** Timezone for the meeting */
  timezone: string;
  /** Meeting location details */
  location: MeetingLocation;
  /** Customer information */
  customer: CustomerInfo;
  /** Booking status */
  status: BookingStatus;
  /** When booking was created */
  createdAt: string;
  /** Optional pricing information */
  pricing?: BookingPricing;
  /** Provider-specific data */
  providerData?: ProviderBookingData;
  /** Optional notes or special instructions */
  notes?: string;
}

// Meeting location information
export interface MeetingLocation {
  /** Type of meeting */
  type: "video" | "phone" | "in-person" | "hybrid";
  /** Platform-specific details */
  details: VideoMeetingDetails | PhoneMeetingDetails | InPersonMeetingDetails;
  /** Instructions for joining */
  instructions?: string;
  /** Timezone for in-person meetings */
  timezone?: string;
}

export interface VideoMeetingDetails {
  platform: "zoom" | "meet" | "teams" | "custom";
  joinUrl: string;
  meetingId?: string;
  password?: string;
  dialInNumbers?: string[];
}

export interface PhoneMeetingDetails {
  phoneNumber: string;
  extension?: string;
  conferenceId?: string;
}

export interface InPersonMeetingDetails {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  buildingInfo?: string;
  parkingInfo?: string;
}

// Customer information
export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  timezone: string;
  company?: string;
  title?: string;
}

// Booking status
export type BookingStatus = 
  | "confirmed" 
  | "pending" 
  | "cancelled" 
  | "rescheduled" 
  | "completed" 
  | "no-show";

// Pricing information
export interface BookingPricing {
  amount: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "refunded" | "failed";
  paymentMethod?: string;
  invoiceUrl?: string;
}

// Provider-specific booking data
export interface ProviderBookingData {
  cal?: {
    bookingUid: string;
    eventTypeId: string;
    rescheduleUrl: string;
    cancelUrl: string;
  };
  calendly?: {
    eventUuid: string;
    rescheduleUrl: string;
    cancelUrl: string;
  };
  acuity?: {
    appointmentId: string;
    rescheduleUrl: string;
    cancelUrl: string;
  };
  custom?: {
    [key: string]: any;
  };
}

// Actions available for the booking
export interface BookingActions {
  /** URL to reschedule the booking */
  rescheduleUrl?: string;
  /** URL to cancel the booking */
  cancelUrl?: string;
  /** Download calendar file */
  downloadCalendar?: () => void;
  /** Add to specific calendar service */
  addToCalendar?: {
    google: string;
    outlook: string;
    apple: string;
    yahoo: string;
  };
  /** Share booking details */
  shareBooking?: () => void;
  /** Contact support */
  contactSupport?: () => void;
}

// Preparation information
export interface PreparationInfo {
  /** Items to prepare before the meeting */
  checklist?: string[];
  /** Documents to bring or review */
  documents?: string[];
  /** Technical requirements */
  techRequirements?: string[];
  /** What to expect during the meeting */
  expectations?: string[];
  /** Estimated preparation time */
  prepTime?: number; // minutes
}

// Follow-up information
export interface FollowUpInfo {
  /** What happens after the meeting */
  nextSteps?: string[];
  /** Timeline for follow-up */
  timeline?: string;
  /** Additional resources */
  resources?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
}

// Main component props
export interface BookingConfirmationProps {
  /** Confirmed booking details */
  booking: ConfirmedBooking;
  /** Available actions for this booking */
  actions?: BookingActions;
  /** Preparation information */
  preparation?: PreparationInfo;
  /** Follow-up information */
  followUp?: FollowUpInfo;
  /** Show detailed information */
  showDetails?: boolean;
  /** Show preparation checklist */
  showPreparation?: boolean;
  /** Show follow-up information */
  showFollowUp?: boolean;
  /** Show calendar integration options */
  showCalendarIntegration?: boolean;
  /** Show share options */
  showShareOptions?: boolean;
  /** Custom success message */
  successMessage?: string;
  /** Additional CSS class */
  className?: string;
  /** Callback when action is taken */
  onAction?: (action: string, data?: any) => void;
  /** Callback for analytics tracking */
  onTrack?: (event: string, properties: Record<string, any>) => void;
  /** Print-friendly mode */
  printMode?: boolean;
  /** Loading state for actions */
  actionsLoading?: boolean;
  /** Disable actions */
  actionsDisabled?: boolean;
}

// Display preferences
export interface DisplayPreferences {
  /** Date format preference */
  dateFormat: "short" | "long" | "relative";
  /** Time format preference */
  timeFormat: "12h" | "24h";
  /** Show timezone in times */
  showTimezone: boolean;
  /** Currency format */
  currencyFormat?: string;
  /** Language/locale */
  locale?: string;
}

// Theme customization
export interface ConfirmationTheme {
  /** Primary color for branding */
  primaryColor?: string;
  /** Success color */
  successColor?: string;
  /** Background color */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Border radius */
  borderRadius?: string;
  /** Font family */
  fontFamily?: string;
}

// Component state
export interface ConfirmationState {
  /** Whether details are expanded */
  detailsExpanded: boolean;
  /** Whether preparation is expanded */
  preparationExpanded: boolean;
  /** Whether follow-up is expanded */
  followUpExpanded: boolean;
  /** Currently loading action */
  loadingAction?: string;
  /** Error message if any */
  error?: string;
  /** Copy status for share functionality */
  copyStatus?: "idle" | "copied" | "error";
}

// Calendar file formats
export type CalendarFormat = "ics" | "google" | "outlook" | "apple" | "yahoo";

// Share methods
export type ShareMethod = "link" | "email" | "sms" | "print" | "calendar";

// Notification preferences
export interface NotificationPreferences {
  /** Email notifications enabled */
  email: boolean;
  /** SMS notifications enabled */
  sms: boolean;
  /** In-app notifications enabled */
  inApp: boolean;
  /** Reminder timing preferences */
  reminders: {
    /** Send reminder 24 hours before */
    day: boolean;
    /** Send reminder 1 hour before */
    hour: boolean;
    /** Send reminder 15 minutes before */
    minutes: boolean;
  };
}

// Accessibility props
export interface AccessibilityProps {
  /** Screen reader description */
  ariaLabel?: string;
  /** Additional screen reader description */
  ariaDescription?: string;
  /** Skip to action links */
  skipToActions?: boolean;
  /** High contrast mode */
  highContrast?: boolean;
  /** Large text mode */
  largeText?: boolean;
}

// Analytics event data
export interface ConfirmationAnalytics {
  /** Booking ID for tracking */
  bookingId: string;
  /** Service type */
  service: CanonicalService;
  /** Provider used */
  provider: BookingProvider;
  /** Confirmation view time */
  viewTime: number;
  /** Actions taken */
  actionsTaken: string[];
  /** Calendar integrations used */
  calendarIntegrations: CalendarFormat[];
  /** Share methods used */
  shareMethods: ShareMethod[];
}