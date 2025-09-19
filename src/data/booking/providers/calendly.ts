// /src/data/booking/providers/calendly.ts
// Calendly event types have fixed durations; passing ?duration is not honored.
// Useful params: timezone, utm_campaign (ref), month/date for preselecting.

import type { ProviderAdapter, ProviderSessionUrlParams } from '@/booking/lib/types';

const ORG = process.env.BOOKING_CALENDLY_ORG ?? 'your-org-or-user';

type ServiceSlug =
  | 'content-production-services'
  | 'lead-generation-services'
  | 'marketing-services'
  | 'seo-services'
  | 'video-production-services'
  | 'web-development-services';

// Map service slug → calendly event slug (after /{ORG}/...)
const EVENT_SLUG_BY_SERVICE: Record<ServiceSlug, string> = {
  'content-production-services': process.env.BOOKING_CALENDLY_EVENT_CONTENT ?? 'content-intro-call',
  'lead-generation-services': process.env.BOOKING_CALENDLY_EVENT_LEADGEN ?? 'leadgen-intro-call',
  'marketing-services': process.env.BOOKING_CALENDLY_EVENT_MARKETING ?? 'marketing-intro-call',
  'seo-services': process.env.BOOKING_CALENDLY_EVENT_SEO ?? 'seo-intro-call',
  'video-production-services': process.env.BOOKING_CALENDLY_EVENT_VIDEO ?? 'video-intro-call',
  'web-development-services': process.env.BOOKING_CALENDLY_EVENT_WEBDEV ?? 'webdev-intro-call',
};

function buildCalendlyUrl({ serviceSlug, timezone, ref, date }: ProviderSessionUrlParams): string {
  const eventSlug =
    (serviceSlug && EVENT_SLUG_BY_SERVICE[serviceSlug as ServiceSlug]) || 'intro-call';
  const base = `https://calendly.com/${ORG}/${eventSlug}`;
  const qs = new URLSearchParams({
    ...(timezone ? { timezone } : {}),
    ...(ref ? { utm_campaign: ref } : {}),
    ...(date ? { date } : {}), // YYYY-MM-DD (preselects date)
    // You can add 'hide_event_type_details=1' if you want a cleaner embed:
    // hide_event_type_details=1
  });
  const query = qs.toString();
  return query ? `${base}?${query}` : base;
}

export const calendlyAdapter: ProviderAdapter = {
  name: 'calendly',
  isEnabled: true,
  getEmbed(params) {
    const src = buildCalendlyUrl(params);
    return { type: 'iframe', src };
  },
  // Calendly availability fetch would require API; not included by default.
};
