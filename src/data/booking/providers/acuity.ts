// /src/data/booking/providers/acuity.ts
// Acuity embeds use ownerId + appointmentType. Duration cannot be overridden via query.
// Docs: https://help.acuityscheduling.com/hc/en-us/articles/115002206851

import type { ProviderAdapter, ProviderSessionUrlParams } from '@/booking/lib/types';

const OWNER_ID = process.env.BOOKING_ACUITY_OWNER_ID ?? '';
if (!OWNER_ID) {
  // It's OK to leave this as '', the UI can handle disabled providers if needed.
  // You can also throw in non-prod if you prefer strictness.
}

type ServiceSlug =
  | 'content-production-services'
  | 'lead-generation-services'
  | 'marketing-services'
  | 'seo-services'
  | 'video-production-services'
  | 'web-development-services';

// Map your service slugs to Acuity Appointment Type IDs
const APPOINTMENT_TYPE_BY_SERVICE: Record<ServiceSlug, string> = {
  'content-production-services': process.env.BOOKING_ACUITY_TYPE_CONTENT ?? '00000001',
  'lead-generation-services': process.env.BOOKING_ACUITY_TYPE_LEADGEN ?? '00000002',
  'marketing-services': process.env.BOOKING_ACUITY_TYPE_MARKETING ?? '00000003',
  'seo-services': process.env.BOOKING_ACUITY_TYPE_SEO ?? '00000004',
  'video-production-services': process.env.BOOKING_ACUITY_TYPE_VIDEO ?? '00000005',
  'web-development-services': process.env.BOOKING_ACUITY_TYPE_WEBDEV ?? '00000006',
};

function buildAcuityUrl({ serviceSlug, timezone, ref }: ProviderSessionUrlParams): string {
  const appointmentType = (serviceSlug && APPOINTMENT_TYPE_BY_SERVICE[serviceSlug as ServiceSlug]) || '';
  const base = 'https://secure.acuityscheduling.com/schedule.php';
  const qs = new URLSearchParams({
    owner: OWNER_ID,
    ...(appointmentType ? { appointmentType } : {}),
    ...(timezone ? { timezone } : {}),
    ...(ref ? { campaign: ref } : {}), // campaign is commonly used for tracking
  });
  return `${base}?${qs.toString()}`;
}

export const acuityAdapter: ProviderAdapter = {
  name: 'acuity',
  isEnabled: Boolean(OWNER_ID),
  getEmbed(params) {
    const src = buildAcuityUrl(params);
    return { type: 'iframe', src };
  },
  // Availability API would require Acuity API credentials; omitted by default.
};
