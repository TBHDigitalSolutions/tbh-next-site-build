Perfect—let’s lock down the providers layer. Below are **production-ready scripts** for all four files (including a light “reviewed & improved” `cal-com.ts` and `index.ts`) that follow the unified `ProviderAdapter` contract we’ve been using.

They’re safe on the server (no window refs), env-driven, and opinionated about query params (`timezone`, `ref`, optional `duration` where supported). I also added minimal per-service slug maps so authors can override event/type IDs without touching UI code.

---

# `/src/data/booking/providers/acuity.ts`

```ts
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
```

---

# `/src/data/booking/providers/calendly.ts`

```ts
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
```

---

# `/src/data/booking/providers/cal-com.ts` (reviewed & ready)

```ts
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
```

**Quick review notes for your existing `cal-com.ts`:**

* ✅ Ensure the base is `https://cal.com/${ORG}/${event}` (or your self-hosted origin).
* ✅ Accept `timezone`, `duration?`, `ref?`, `date?` as query params.
* ✅ Don’t hardcode event slugs—source from env map like above.
* ✅ Export as `calcomAdapter` with `{ name: 'calcom', isEnabled: true, getEmbed }`.

---

# `/src/data/booking/providers/index.ts`

```ts
// /src/data/booking/providers/index.ts
// Central registry with type-safe getProvider()

import type { ProviderAdapter } from '@/booking/lib/types';
import { calcomAdapter } from './cal-com';
import { calendlyAdapter } from './calendly';
import { acuityAdapter } from './acuity';

// Keep order deterministic but rely on explicit keys for lookups.
export const PROVIDERS = {
  calcom: calcomAdapter,
  calendly: calendlyAdapter,
  acuity: acuityAdapter,
} as const;

export type ProviderKey = keyof typeof PROVIDERS;

export function getProvider(name: ProviderKey): ProviderAdapter {
  const p = PROVIDERS[name];
  if (!p) {
    // Fallback: return a disabled stub to avoid crashes
    return {
      name: name as ProviderAdapter['name'],
      isEnabled: false,
      getEmbed() {
        return { type: 'iframe', src: 'about:blank' };
      },
    };
  }
  return p;
}

// Utility: pick a safe, enabled provider (used by domain config defaults)
export function getFirstEnabledProvider(): ProviderAdapter {
  const entry = Object.values(PROVIDERS).find((p) => p.isEnabled);
  return (
    entry ?? {
      name: 'calcom',
      isEnabled: false,
      getEmbed() {
        return { type: 'iframe', src: 'about:blank' };
      },
    }
  );
}

export function listEnabledProviders(): ProviderAdapter[] {
  return Object.values(PROVIDERS).filter((p) => p.isEnabled);
}
```

---

## How this snaps into your existing flow

* Your **Booking config** picks `defaultProvider: 'calcom' | 'calendly' | 'acuity'`.
* `SchedulerEmbed` (or your template) does:

  ```ts
  import { getProvider } from '@/data/booking/providers';
  const adapter = getProvider(activeProviderName);
  const embed = adapter.getEmbed({ serviceSlug, timezone, duration, ref, date });
  // render <iframe src={embed.src} ... />
  ```
* Service slugs → event/type IDs are **data/ops** concerns now (env-based maps), so UI never changes when event IDs change.

---

## Env vars to set (copy & tweak)

```
# Cal.com
BOOKING_CALCOM_ORG=your-org
BOOKING_CALCOM_EVENT_CONTENT=content/intro
BOOKING_CALCOM_EVENT_LEADGEN=leadgen/intro
BOOKING_CALCOM_EVENT_MARKETING=marketing/intro
BOOKING_CALCOM_EVENT_SEO=seo/intro
BOOKING_CALCOM_EVENT_VIDEO=video/intro
BOOKING_CALCOM_EVENT_WEBDEV=webdev/intro

# Calendly
BOOKING_CALENDLY_ORG=your-org-or-user
BOOKING_CALENDLY_EVENT_CONTENT=content-intro-call
BOOKING_CALENDLY_EVENT_LEADGEN=leadgen-intro-call
BOOKING_CALENDLY_EVENT_MARKETING=marketing-intro-call
BOOKING_CALENDLY_EVENT_SEO=seo-intro-call
BOOKING_CALENDLY_EVENT_VIDEO=video-intro-call
BOOKING_CALENDLY_EVENT_WEBDEV=webdev-intro-call

# Acuity
BOOKING_ACUITY_OWNER_ID=12345678
BOOKING_ACUITY_TYPE_CONTENT=00000001
BOOKING_ACUITY_TYPE_LEADGEN=00000002
BOOKING_ACUITY_TYPE_MARKETING=00000003
BOOKING_ACUITY_TYPE_SEO=00000004
BOOKING_ACUITY_TYPE_VIDEO=00000005
BOOKING_ACUITY_TYPE_WEBDEV=00000006
```

---

If you want, I can also drop a **tiny `SchedulerEmbed.tsx`** (fully responsive iframe + a11y) and a **domain-level smoke test** you can run in a route to confirm each provider resolves a non-blank URL.
