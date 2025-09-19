// src/data/booking/configs/booking-hub.ts
// Booking Hub content/config (token-aware, minimal and portable)

export type CanonicalService =
  | 'content-production-services'
  | 'lead-generation-services'
  | 'marketing-services'
  | 'seo-services'
  | 'video-production-services'
  | 'web-development-services';

export interface BookingHubConfig {
  title: string;
  description?: string;
  services: CanonicalService[];
  defaultService: CanonicalService;
  showServiceCards: boolean;
  showTestimonials: boolean;
  showFAQ: boolean;
  analyticsEnabled: boolean;
}

export const BOOKING_HUB_CONFIG: BookingHubConfig = {
  title: 'Schedule Your Consultation',
  description:
    'Pick a service and a time that works for you. We’ll align on goals and the best next step in 30–45 minutes.',
  services: [
    'web-development-services',
    'video-production-services',
    'seo-services',
    'marketing-services',
    'lead-generation-services',
    'content-production-services',
  ],
  defaultService: 'web-development-services',
  showServiceCards: true,
  showTestimonials: true,
  showFAQ: true,
  analyticsEnabled: true,
};

type MeetingTypeKey = 'consultation' | 'discovery' | 'strategy' | 'review' | 'support';

export interface MeetingTypeConfig {
  title: string;
  description: string;
  // prefer durations at the data layer; providers may ignore custom durations
  duration: number; // minutes
  // theme: use CSS tokens so we don't hardcode palette
  tokenColorVar?: string; // e.g. 'var(--brand-blue)'
  icon?: string; // simple emoji or icon token
}

export const MEETING_TYPES: Record<MeetingTypeKey, MeetingTypeConfig> = {
  consultation: {
    title: 'Initial Consultation',
    description: 'Free 30-min call to explore your goals and constraints.',
    duration: 30,
    tokenColorVar: 'var(--brand-blue)',
    icon: '💬',
  },
  discovery: {
    title: 'Discovery Call',
    description: 'Deeper dive into requirements, scope, and success metrics.',
    duration: 60,
    tokenColorVar: 'var(--success)',
    icon: '🔍',
  },
  strategy: {
    title: 'Strategy Session',
    description: 'Structured workshop to outline plan, roadmap, and KPIs.',
    duration: 90,
    tokenColorVar: 'var(--purple-500, #8B5CF6)',
    icon: '🎯',
  },
  review: {
    title: 'Project Review',
    description: 'Checkpoint or post-delivery review.',
    duration: 30,
    tokenColorVar: 'var(--warning)',
    icon: '📋',
  },
  support: {
    title: 'Support Session',
    description: 'Technical assistance for existing engagements.',
    duration: 30,
    tokenColorVar: 'var(--text-secondary)',
    icon: '🛠️',
  },
};

export interface ServiceDisplayConfig {
  title: string;
  shortTitle: string;
  blurb: string;
  icon?: string;
  // palette via CSS tokens to align with unified theme
  tokenColorVar?: string;
  // meeting types this service commonly offers
  meetingTypes: MeetingTypeKey[];
  // suggested durations to show in UI for this service
  durations: number[];
  // lists use order to sort on the hub
  priority: number;
  featured: boolean;
}

export const SERVICE_DISPLAY: Record<CanonicalService, ServiceDisplayConfig> = {
  'web-development-services': {
    title: 'Web Development',
    shortTitle: 'Web Dev',
    blurb: 'Custom sites, apps, and storefronts built for speed and scale.',
    icon: '🌐',
    tokenColorVar: 'var(--brand-blue)',
    meetingTypes: ['consultation', 'discovery', 'strategy', 'review'],
    durations: [30, 60, 90],
    priority: 1,
    featured: true,
  },
  'video-production-services': {
    title: 'Video Production',
    shortTitle: 'Video',
    blurb: 'Concept → shoot → edit. Polished video for ads, product, and brand.',
    icon: '🎥',
    tokenColorVar: 'var(--danger)',
    meetingTypes: ['consultation', 'discovery', 'review'],
    durations: [30, 60],
    priority: 2,
    featured: true,
  },
  'seo-services': {
    title: 'SEO',
    shortTitle: 'SEO',
    blurb: 'Technical SEO, content strategy, and growth-oriented roadmaps.',
    icon: '📈',
    tokenColorVar: 'var(--success)',
    meetingTypes: ['consultation', 'discovery', 'review'],
    durations: [30, 45, 60],
    priority: 3,
    featured: true,
  },
  'marketing-services': {
    title: 'Digital Marketing',
    shortTitle: 'Marketing',
    blurb: 'Acquisition, retention, automation, and analytics under one roof.',
    icon: '📊',
    tokenColorVar: 'var(--purple-500, #8B5CF6)',
    meetingTypes: ['consultation', 'discovery', 'strategy', 'review'],
    durations: [30, 60],
    priority: 4,
    featured: true,
  },
  'lead-generation-services': {
    title: 'Lead Generation',
    shortTitle: 'Lead Gen',
    blurb: 'Outbound, inbound, and funnel ops tuned to your ICP.',
    icon: '🎯',
    tokenColorVar: 'var(--warning)',
    meetingTypes: ['consultation', 'discovery', 'review'],
    durations: [30, 45],
    priority: 5,
    featured: false,
  },
  'content-production-services': {
    title: 'Content Production',
    shortTitle: 'Content',
    blurb: 'Copy, design, and media that ship with brand consistency.',
    icon: '✏️',
    tokenColorVar: 'var(--pink-500, #EC4899)',
    meetingTypes: ['consultation', 'discovery', 'review'],
    durations: [30, 60],
    priority: 6,
    featured: false,
  },
};

export default BOOKING_HUB_CONFIG;
