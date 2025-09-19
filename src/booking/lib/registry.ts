// src/booking/lib/registry.ts
// Registries & lookups for variants, providers, and service mappings
// No React imports - keep this pure data/functions

import type { BookingVariant, CalendarProviderConfig } from "./types";
import type { CanonicalService } from "@/shared/services/types";

// Default variant to render per service (can be overridden in props)
export const DEFAULT_VARIANT_BY_SERVICE: Record<CanonicalService, BookingVariant> = {
  "web-development-services": "form",
  "video-production-services": "embed", 
  "seo-services": "calendar",
  "marketing-services": "form",
  "lead-generation-services": "form",
  "content-production-services": "form",
};

// Provider configuration registry (populated by adapters from data layer)
export type CalendarRegistry = Partial<Record<CanonicalService, CalendarProviderConfig>>;

// Runtime calendar registry - populated by data layer at startup or on-demand
export const CALENDAR_BY_SERVICE: CalendarRegistry = {
  // This will be populated by adapters from /src/data/booking/calendars/*
  // Example structure:
  // "web-development-services": {
  //   provider: "cal",
  //   service: "web-development-services",
  //   eventTypeId: "web-dev-consultation",
  //   fallbackHref: "https://cal.com/tbh-digital/web-dev"
  // }
};

// Analytics context defaults per surface
export const ANALYTICS_CONTEXT = {
  PAGE: "booking_page",
  MODAL: "booking_modal",
  EMBED: "booking_embed",
  SERVICE_CTA: "service_cta",
} as const;

// Meeting type defaults per service
export const DEFAULT_MEETING_TYPES: Record<CanonicalService, Array<{
  id: string;
  label: string;
  duration: number;
  description?: string;
}>> = {
  "web-development-services": [
    {
      id: "web-dev-consultation",
      label: "Web Development Consultation",
      duration: 30,
      description: "Discuss your website project needs and requirements"
    },
    {
      id: "web-dev-strategy",
      label: "Web Strategy Session",
      duration: 60,
      description: "In-depth planning for complex web projects"
    }
  ],
  "video-production-services": [
    {
      id: "video-discovery",
      label: "Video Production Discovery",
      duration: 30,
      description: "Explore your video content goals and production needs"
    },
    {
      id: "video-planning",
      label: "Video Planning Session",
      duration: 45,
      description: "Detailed planning for video production workflow"
    }
  ],
  "seo-services": [
    {
      id: "seo-audit",
      label: "SEO Audit Consultation",
      duration: 30,
      description: "Review your current SEO status and opportunities"
    },
    {
      id: "seo-strategy",
      label: "SEO Strategy Session",
      duration: 60,
      description: "Develop comprehensive SEO strategy and roadmap"
    }
  ],
  "marketing-services": [
    {
      id: "marketing-consultation",
      label: "Marketing Consultation",
      duration: 30,
      description: "Discuss your marketing goals and challenges"
    },
    {
      id: "marketing-strategy",
      label: "Marketing Strategy Session",
      duration: 60,
      description: "Create comprehensive marketing strategy and plan"
    }
  ],
  "lead-generation-services": [
    {
      id: "lead-gen-consultation",
      label: "Lead Generation Consultation",
      duration: 30,
      description: "Analyze your lead generation needs and opportunities"
    },
    {
      id: "lead-gen-planning",
      label: "Lead Generation Planning",
      duration: 45,
      description: "Design effective lead generation systems and funnels"
    }
  ],
  "content-production-services": [
    {
      id: "content-consultation",
      label: "Content Strategy Consultation",
      duration: 30,
      description: "Plan your content production and distribution strategy"
    },
    {
      id: "content-planning",
      label: "Content Planning Session",
      duration: 45,
      description: "Develop comprehensive content calendar and workflows"
    }
  ],
};

// Provider capability matrix
export const PROVIDER_CAPABILITIES = {
  cal: {
    supports: ["embed", "redirect", "prefill", "themes"],
    embedTypes: ["inline", "popup", "floating"],
    maxEmbedHeight: 800,
    prefillFields: ["name", "email", "timezone", "notes"],
    customization: ["theme", "layout", "branding"],
  },
  calendly: {
    supports: ["embed", "redirect", "prefill"],
    embedTypes: ["inline", "popup"],
    maxEmbedHeight: 700,
    prefillFields: ["name", "email"],
    customization: ["primaryColor", "textColor", "hideDetails"],
  },
  custom: {
    supports: ["form", "redirect"],
    embedTypes: ["inline"],
    maxEmbedHeight: 600,
    prefillFields: ["name", "email", "timezone", "notes", "service"],
    customization: ["theme", "validation", "fields"],
  },
} as const;

// Service-specific booking configurations
export const SERVICE_BOOKING_CONFIGS = {
  "web-development-services": {
    preferredVariant: "form",
    requiresIntake: true,
    intakeFields: ["name", "email", "website", "budget", "timeline", "requirements"],
    meetingDurations: [30, 60],
    followUpEnabled: true,
  },
  "video-production-services": {
    preferredVariant: "embed",
    requiresIntake: true,
    intakeFields: ["name", "email", "company", "videoType", "budget", "timeline"],
    meetingDurations: [30, 45, 60],
    followUpEnabled: true,
  },
  "seo-services": {
    preferredVariant: "calendar",
    requiresIntake: true,
    intakeFields: ["name", "email", "website", "currentTraffic", "goals"],
    meetingDurations: [30, 60],
    followUpEnabled: true,
  },
  "marketing-services": {
    preferredVariant: "form",
    requiresIntake: true,
    intakeFields: ["name", "email", "company", "industry", "budget", "channels"],
    meetingDurations: [30, 60],
    followUpEnabled: true,
  },
  "lead-generation-services": {
    preferredVariant: "form",
    requiresIntake: true,
    intakeFields: ["name", "email", "company", "targetAudience", "budget", "currentMethods"],
    meetingDurations: [30, 45],
    followUpEnabled: true,
  },
  "content-production-services": {
    preferredVariant: "form",
    requiresIntake: true,
    intakeFields: ["name", "email", "company", "contentTypes", "frequency", "budget"],
    meetingDurations: [30, 45],
    followUpEnabled: true,
  },
} as const;

// Utility functions for registry lookups
export function getDefaultVariantForService(service: CanonicalService): BookingVariant {
  return DEFAULT_VARIANT_BY_SERVICE[service] || "embed";
}

export function getCalendarConfigForService(service: CanonicalService): CalendarProviderConfig | undefined {
  return CALENDAR_BY_SERVICE[service];
}

export function getMeetingTypesForService(service: CanonicalService) {
  return DEFAULT_MEETING_TYPES[service] || [];
}

export function getServiceBookingConfig(service: CanonicalService) {
  return SERVICE_BOOKING_CONFIGS[service];
}

export function supportsProvider(provider: keyof typeof PROVIDER_CAPABILITIES, feature: string): boolean {
  return PROVIDER_CAPABILITIES[provider]?.supports.includes(feature) || false;
}

export function getProviderMaxHeight(provider: keyof typeof PROVIDER_CAPABILITIES): number {
  return PROVIDER_CAPABILITIES[provider]?.maxEmbedHeight || 600;
}

// Registry population functions (called by data layer)
export function populateCalendarRegistry(configs: CalendarRegistry): void {
  Object.assign(CALENDAR_BY_SERVICE, configs);
}

export function addCalendarConfig(service: CanonicalService, config: CalendarProviderConfig): void {
  CALENDAR_BY_SERVICE[service] = config;
}

export function clearCalendarRegistry(): void {
  Object.keys(CALENDAR_BY_SERVICE).forEach(key => {
    delete CALENDAR_BY_SERVICE[key as CanonicalService];
  });
}