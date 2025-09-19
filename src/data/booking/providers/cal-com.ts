// /src/data/booking/providers/cal-com.ts
// Cal.com supports org handles + event types. Many deployments accept ?timezone and ?duration.
// Confirm duration support in your plan; otherwise UI can still show allowed durations via calendars data.

import type { ProviderAdapter, ProviderSessionUrlParams } from '@/booking/lib/types';

const ORG = process.env.BOOKING_CALCOM_ORG ?? 'your-org';

type ServiceSlug =
  | 'content-production-services'
  | 'lead-generation-services'
  | 'marketing-services'
  | 'seo-services'
  | 'video-production-services'
  | 'web-development-services';

// Map service slug → cal.com event type
const EVENT_SLUG_BY_SERVICE: Record<ServiceSlug, string> = {
  'content-production-services': process.env.BOOKING_CALCOM_EVENT_CONTENT ?? 'content/intro',
  'lead-generation-services': process.env.BOOKING_CALCOM_EVENT_LEADGEN ?? 'leadgen/intro',
  'marketing-services': process.env.BOOKING_CALCOM_EVENT_MARKETING ?? 'marketing/intro',
  'seo-services': process.env.BOOKING_CALCOM_EVENT_SEO ?? 'seo/intro',
  'video-production-services': process.env.BOOKING_CALCOM_EVENT_VIDEO ?? 'video/intro',
  'web-development-services': process.env.BOOKING_CALCOM_EVENT_WEBDEV ?? 'webdev/intro',
};

function buildCalComUrl({ serviceSlug, duration, timezone, ref, date }: ProviderSessionUrlParams): string {
  const event = (serviceSlug && EVENT_SLUG_BY_SERVICE[serviceSlug as ServiceSlug]) || 'intro';
  const base = `https://cal.com/${ORG}/${event}`;
  const qs = new URLSearchParams({
    ...(timezone ? { timezone } : {}),
    ...(duration ? { duration: String(duration) } : {}),
    ...(ref ? { ref } : {}),
    ...(date ? { date } : {}), // YYYY-MM-DD
  });
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

export const calcomAdapter: ProviderAdapter = {
  name: 'calcom',
  isEnabled: true,
  getEmbed(params) {
    const src = buildCalComUrl(params);
    return { type: 'iframe', src };
  },
  // Availability can be implemented with the Cal.com API if desired.
};
