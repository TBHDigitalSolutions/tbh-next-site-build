Booking-Lib—Authoring Guide-src-booking-lib.md

Perfect — here’s a **hands-on authoring guide** to create the Booking domain’s `lib` layer. It tells you **what each file owns**, the **APIs it must expose**, **dependencies**, **client/server boundaries**, **edge cases**, and **quick test checklists**. You’ll end with a consistent, production-ready `src/booking/lib/*` that matches the architecture we’ve been using.

---

# Booking Lib — Authoring Guide

Target structure:

```
src/booking/lib
├─ adapters.ts      # Data → Template/Section props (normalize + map)
├─ constants.ts     # Domain constants (defaults, query keys, error codes)
├─ metrics.ts       # Analytics helpers (fire standardized events)
├─ registry.ts      # Variant/provider registries
├─ types.ts         # Core types shared across templates/sections
├─ utils.ts         # Pure utilities (no React, no DOM)
└─ validators.ts    # Zod schemas for domain props (not UI-level)
```

## Global guardrails

* **No React imports** anywhere in `lib/*`. This keeps lib SSR/Node-safe and tree-shakeable.
* **No imports from `/src/booking/templates/*` or `sections/*`** (one-way dependency: UI depends on lib, not vice versa).
* **Canonical services**: Import from your SSOT
  `import { CanonicalService, ServiceType } from '@/shared/services/types';`
  `import { normalizeServiceSlug } from '@/shared/services/utils';`
* **Zod** for schemas in `validators.ts`. Only `validators.ts` imports `zod`.
* **Naming**: Named exports only.

---

## 1) `types.ts` — Core booking types

### Purpose

Define **stable contracts** shared by templates and sections: booking variants, calendar configs, intake forms, and the props shapes adapters will produce.

### Must export

```ts
// Variant selection in BookingSection
export type BookingVariant = "embed" | "form" | "calendar";

// Provider identifiers and config
export type BookingProvider = "cal" | "calendly" | "custom";

export interface CalendarProviderConfig {
  provider: BookingProvider;
  /** Canonical service slug this config belongs to */
  service: CanonicalService;
  /** Provider-specific identifiers */
  eventTypeId?: string;        // cal.com event type
  organization?: string;       // calendly org
  eventSlug?: string;          // calendly event slug
  /** Optional fallback URL (provider-hosted booking page) */
  fallbackHref?: string;
  /** Additional provider params (prefill, locale, etc.) */
  params?: Record<string, string | number | boolean | undefined>;
}

export interface IntakeField {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox";
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  helpText?: string;
  /** RegExp string or simple keyword like 'email' for built-in validation */
  validate?: string;
}

export interface IntakeFormSpec {
  service: CanonicalService;
  fields: IntakeField[];
  consent: {
    privacyPolicyHref: string;
    termsHref?: string;
    marketingOptIn?: boolean; // show marketing checkbox
  };
}

export interface Prefill {
  name?: string;
  email?: string;
  timezone?: string;
  notes?: string;
  ref?: string; // source path or campaign ref
  // Allow service to be preselected via query (?topic=…)
  topic?: string;
}

export interface BookingSectionProps {
  variant: BookingVariant;
  service?: CanonicalService;
  calendar?: CalendarProviderConfig;
  intake?: IntakeFormSpec;
  /** Pre-populate form/embed when possible */
  prefill?: Prefill;
  /** Navigation URLs */
  successHref?: string;
  cancelHref?: string;
  /** Analytics */
  analyticsContext?: string; // e.g., 'booking_modal' | 'booking_page'
}

export interface BookingHubTemplateProps {
  meta?: {
    title?: string;
    subtitle?: string;
  };
  features?: {
    showFAQ?: boolean;
    showPolicies?: boolean;
    showCTA?: boolean;
  };
  hero?: {
    headline?: string;
    subheadline?: string;
    primaryCTA?: { text: string; href: string };
  };
  booking: BookingSectionProps;
  analytics?: {
    context?: string;
  };
}

export interface BookingModalTemplateProps {
  booking: BookingSectionProps;
  analytics?: {
    context?: string;
  };
}
```

### Dependencies

```ts
import { CanonicalService, ServiceType } from "@/shared/services/types";
```

### Quick tests

* Can import these types in templates/sections without circular deps.
* `BookingSectionProps` stays **UI-agnostic** (no React types).

---

## 2) `constants.ts` — Domain constants

### Purpose

Single place for defaults, query param keys, error codes, analytics event names.

### Must export

```ts
export const DEFAULT_BOOKING_VARIANT = "embed" as const;

export const QUERY_KEYS = {
  topic: "topic",
  ref: "ref",
  name: "name",
  email: "email",
  tz: "tz",
  notes: "notes",
} as const;

export const ERROR_CODES = {
  PROVIDER_LOAD_FAILED: "provider_load_failed",
  INVALID_SERVICE: "invalid_service",
  RATE_LIMITED: "rate_limited",
} as const;

export const ANALYTICS_EVENTS = {
  VIEW: "booking_view",
  OPEN_MODAL: "booking_open_modal",
  SUBMIT: "booking_submit",
  SUCCESS: "booking_success",
  ERROR: "booking_error",
  CLOSE_MODAL: "booking_close_modal",
} as const;

export const FALLBACKS = {
  /** default success URL if not provided by consumer */
  successHref: "/thank-you",
  /** default cancel/back URL */
  cancelHref: "/",
} as const;
```

### Quick tests

* Events cover all transitions we care about.
* `QUERY_KEYS` used consistently in adapters.

---

## 3) `utils.ts` — Pure utilities

### Purpose

Everything helper-y that’s safe on server and client: canonical normalization, coercers, safe merges, param builders.

### Must export (examples)

```ts
import { normalizeServiceSlug } from "@/shared/services/utils";
import type { CanonicalService } from "@/shared/services/types";

export function toCanonicalService(input?: string): CanonicalService | undefined {
  if (!input) return undefined;
  try { return normalizeServiceSlug(input); } catch { return undefined; }
}

export function coerceString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export function coerceBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") return ["true", "1", "yes", "on"].includes(v.toLowerCase());
  return undefined;
}

export function isNonEmptyArray<T>(a: unknown): a is T[] {
  return Array.isArray(a) && a.length > 0;
}

export function buildQuery(params: Record<string, unknown>) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    sp.set(k, String(v));
  });
  return sp.toString();
}

/** Safe shallow merge without mutating inputs */
export function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...(a as any), ...(b as any) };
}
```

### Quick tests

* `toCanonicalService("web-development")` returns `"web-development-services"`.
* `buildQuery({ a: 1, b: undefined })` → `"a=1"`.

---

## 4) `validators.ts` — Domain validation schemas

### Purpose

Zod schemas for **domain props** (not UI peculiarities). Use in dev to fail fast; keep runtime light in prod (optional guard).

### Must export (examples)

```ts
import { z } from "zod";
import { CANONICAL_SERVICES } from "@/shared/services/constants";

export const canonicalServiceSchema = z.enum(CANONICAL_SERVICES as unknown as [string, ...string[]]);

export const intakeFieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(["text", "email", "textarea", "select", "checkbox"]),
  required: z.boolean().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  validate: z.string().optional(),
});

export const intakeFormSpecSchema = z.object({
  service: canonicalServiceSchema,
  fields: z.array(intakeFieldSchema).min(1),
  consent: z.object({
    privacyPolicyHref: z.string().url(),
    termsHref: z.string().url().optional(),
    marketingOptIn: z.boolean().optional(),
  }),
});

export const calendarProviderConfigSchema = z.object({
  provider: z.enum(["cal", "calendly", "custom"]),
  service: canonicalServiceSchema,
  eventTypeId: z.string().optional(),
  organization: z.string().optional(),
  eventSlug: z.string().optional(),
  fallbackHref: z.string().url().optional(),
  params: z.record(z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export const bookingSectionPropsSchema = z.object({
  variant: z.enum(["embed", "form", "calendar"]),
  service: canonicalServiceSchema.optional(),
  calendar: calendarProviderConfigSchema.optional(),
  intake: intakeFormSpecSchema.optional(),
  prefill: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    timezone: z.string().optional(),
    notes: z.string().optional(),
    ref: z.string().optional(),
    topic: z.string().optional(),
  }).optional(),
  successHref: z.string().optional(),
  cancelHref: z.string().optional(),
  analyticsContext: z.string().optional(),
});
```

### Quick tests

* Invalid service throws in dev.
* Optional props accepted; required props enforced.

---

## 5) `registry.ts` — Registries & lookups

### Purpose

Central maps so the section/template can resolve **which component/provider config** to use from a **service** or **variant**. No React imports; just data/functions.

### Must export

```ts
import type { BookingVariant, CalendarProviderConfig } from "./types";
import type { CanonicalService } from "@/shared/services/types";

/** Which variant to render by default per service (override in props if needed) */
export const DEFAULT_VARIANT_BY_SERVICE: Record<CanonicalService, BookingVariant> = {
  "web-development-services": "form",
  "video-production-services": "embed",
  "seo-services": "calendar",
  "marketing-services": "form",
  "lead-generation-services": "form",
  "content-production-services": "form",
};

/** Provider configuration by service (filled by data layer at runtime or static map) */
export type CalendarRegistry = Partial<Record<CanonicalService, CalendarProviderConfig>>;
export const CALENDAR_BY_SERVICE: CalendarRegistry = {}; // populated by adapters from /src/data/booking

/** Slot to plug analytics context defaults, per surface */
export const ANALYTICS_CONTEXT = {
  PAGE: "booking_page",
  MODAL: "booking_modal",
} as const;
```

> Keep it **pure**. If you need to load dynamic data from `/src/data/booking`, do it in **adapters** and then **pass** into templates/sections as props.

### Quick tests

* `DEFAULT_VARIANT_BY_SERVICE` covers all canonical services.
* No React or DOM APIs imported.

---

## 6) `adapters.ts` — Data → Template/Section props

### Purpose

Transform any raw data (query params, data façade responses) into **strict** `BookingHubTemplateProps`, `BookingModalTemplateProps`, and `BookingSectionProps`.

### Must export

```ts
import { DEFAULT_BOOKING_VARIANT, FALLBACKS, QUERY_KEYS } from "./constants";
import { toCanonicalService, coerceString, merge } from "./utils";
import { bookingSectionPropsSchema } from "./validators";
import type { BookingHubTemplateProps, BookingModalTemplateProps, BookingSectionProps, CalendarProviderConfig } from "./types";
import type { CanonicalService } from "@/shared/services/types";

/** Hub page adapter */
export function adaptHubConfig(raw: any): BookingHubTemplateProps {
  const variant = (raw?.booking?.variant ?? DEFAULT_BOOKING_VARIANT) as BookingHubTemplateProps["booking"]["variant"];
  const service = toCanonicalService(raw?.booking?.service);

  const booking: BookingSectionProps = {
    variant,
    service,
    calendar: sanitizeCalendar(raw?.booking?.calendar, service),
    intake: sanitizeIntake(raw?.booking?.intake, service),
    prefill: sanitizePrefill(raw?.booking?.prefill),
    successHref: coerceString(raw?.booking?.successHref) ?? FALLBACKS.successHref,
    cancelHref: coerceString(raw?.booking?.cancelHref) ?? FALLBACKS.cancelHref,
    analyticsContext: coerceString(raw?.analytics?.context) ?? "booking_page",
  };

  // Dev-only validation
  if (process.env.NODE_ENV === "development") {
    bookingSectionPropsSchema.parse(booking);
  }

  return {
    meta: raw?.meta,
    features: raw?.features,
    hero: raw?.hero,
    booking,
    analytics: { context: booking.analyticsContext },
  };
}

/** Modal route adapter (driven by query params most of the time) */
export function adaptModalConfig(raw: { query?: URLSearchParams; data?: any }): BookingModalTemplateProps {
  const q = raw.query;
  const topic = q?.get(QUERY_KEYS.topic) ?? raw?.data?.topic;
  const service = toCanonicalService(topic);

  const booking: BookingSectionProps = {
    variant: (raw?.data?.variant ?? DEFAULT_BOOKING_VARIANT),
    service,
    calendar: sanitizeCalendar(raw?.data?.calendar, service),
    intake: sanitizeIntake(raw?.data?.intake, service),
    prefill: {
      name: q?.get(QUERY_KEYS.name) ?? raw?.data?.prefill?.name,
      email: q?.get(QUERY_KEYS.email) ?? raw?.data?.prefill?.email,
      timezone: q?.get(QUERY_KEYS.tz) ?? raw?.data?.prefill?.timezone,
      notes: q?.get(QUERY_KEYS.notes) ?? raw?.data?.prefill?.notes,
      ref: q?.get(QUERY_KEYS.ref) ?? raw?.data?.prefill?.ref,
      topic: topic ?? raw?.data?.prefill?.topic,
    },
    successHref: coerceString(raw?.data?.successHref) ?? FALLBACKS.successHref,
    cancelHref: coerceString(raw?.data?.cancelHref) ?? FALLBACKS.cancelHref,
    analyticsContext: "booking_modal",
  };

  if (process.env.NODE_ENV === "development") {
    bookingSectionPropsSchema.parse(booking);
  }

  return { booking, analytics: { context: "booking_modal" } };
}

/** Lower-level helper for direct section usage */
export function toBookingSectionProps(raw: any): BookingSectionProps {
  const service = toCanonicalService(raw?.service);
  const props: BookingSectionProps = {
    variant: (raw?.variant ?? DEFAULT_BOOKING_VARIANT),
    service,
    calendar: sanitizeCalendar(raw?.calendar, service),
    intake: sanitizeIntake(raw?.intake, service),
    prefill: sanitizePrefill(raw?.prefill),
    successHref: coerceString(raw?.successHref) ?? FALLBACKS.successHref,
    cancelHref: coerceString(raw?.cancelHref) ?? FALLBACKS.cancelHref,
    analyticsContext: coerceString(raw?.analyticsContext),
  };

  if (process.env.NODE_ENV === "development") {
    bookingSectionPropsSchema.parse(props);
  }
  return props;
}

// --- local sanitizers (keep private) ---
function sanitizeCalendar(c: any, service?: CanonicalService): CalendarProviderConfig | undefined {
  if (!c || typeof c !== "object") return undefined;
  const provider = c.provider === "calendly" || c.provider === "cal" ? c.provider : "custom";
  const conf: CalendarProviderConfig = {
    provider,
    service: service ?? toCanonicalService(c.service)!,
    eventTypeId: coerceString(c.eventTypeId),
    organization: coerceString(c.organization),
    eventSlug: coerceString(c.eventSlug),
    fallbackHref: coerceString(c.fallbackHref),
    params: c.params && typeof c.params === "object" ? c.params : undefined,
  };
  return conf;
}
function sanitizeIntake(i: any, service?: CanonicalService) {
  if (!i || typeof i !== "object") return undefined;
  return {
    service: service ?? toCanonicalService(i.service)!,
    fields: Array.isArray(i.fields) ? i.fields : [],
    consent: i.consent ?? { privacyPolicyHref: "/privacy" },
  };
}
function sanitizePrefill(p: any) {
  if (!p || typeof p !== "object") return undefined;
  return {
    name: coerceString(p.name),
    email: coerceString(p.email),
    timezone: coerceString(p.timezone),
    notes: coerceString(p.notes),
    ref: coerceString(p.ref),
    topic: coerceString(p.topic),
  };
}
```

### Quick tests

* Passing only `?topic=web-development` produces canonical `service: "web-development-services"`.
* Missing calendar/intake yields defined but optional props; schema passes in dev.

---

## 7) `metrics.ts` — Analytics helpers

### Purpose

Small façade to fire standardized events with consistent payload keys. No analytics SDK dependency here—just call a **global dispatcher** you own (e.g., `window.analytics?.track` or a callback injected by the app).

### Must export

```ts
import { ANALYTICS_EVENTS } from "./constants";
import type { CanonicalService } from "@/shared/services/types";
import type { BookingVariant } from "./types";

type Ctx = { context?: string; service?: CanonicalService; variant?: BookingVariant; [k: string]: any };

// Pluggable dispatcher set by the app layer (client-only)
let dispatcher: ((event: string, payload: Record<string, any>) => void) | null = null;

export function setBookingAnalyticsDispatcher(fn: (e: string, p: Record<string, any>) => void) {
  dispatcher = fn;
}

function emit(event: string, payload: Record<string, any>) {
  try { dispatcher?.(event, payload); } catch { /* swallow */ }
}

export const trackBookingView = (ctx: Ctx) => emit(ANALYTICS_EVENTS.VIEW, ctx);
export const trackBookingOpenModal = (ctx: Ctx) => emit(ANALYTICS_EVENTS.OPEN_MODAL, ctx);
export const trackBookingSubmit = (ctx: Ctx & { fields_present?: string[]; marketing_opt_in?: boolean }) =>
  emit(ANALYTICS_EVENTS.SUBMIT, ctx);
export const trackBookingSuccess = (ctx: Ctx & { provider?: string; slot_iso?: string; timezone?: string }) =>
  emit(ANALYTICS_EVENTS.SUCCESS, ctx);
export const trackBookingError = (ctx: Ctx & { provider?: string; code?: string; message?: string }) =>
  emit(ANALYTICS_EVENTS.ERROR, ctx);
export const trackBookingCloseModal = (ctx: Ctx & { reason?: string }) =>
  emit(ANALYTICS_EVENTS.CLOSE_MODAL, ctx);
```

### Quick tests

* Dispatcher can be set once in a client root; events fire without throwing when dispatcher is null.

---

## 8) **Scaffold & verify** (commands + checks)

### Create files

```bash
mkdir -p src/booking/lib
touch src/booking/lib/{types.ts,constants.ts,utils.ts,validators.ts,registry.ts,adapters.ts,metrics.ts}
```

### Lint & type checks

* Ensure **no React** in `lib/*`.
* Ensure **no imports from templates/sections/data** inside `lib/*`.
* Run `tsc --noEmit` to catch type leaks.

### Unit tests (suggested)

* `adapters.spec.ts`: canonicalization (`web-development` → `web-development-services`), optional props, query prefill.
* `validators.spec.ts`: invalid service, invalid email, empty intake fields.
* `utils.spec.ts`: query builder, coercers.
* `metrics.spec.ts`: dispatcher lifecycles.

---

## 9) Integration points (what consumes lib)

* **Templates** import `BookingHubTemplateProps` / `BookingModalTemplateProps` and **receive** shaped props from pages (via adapters).
* **Sections** import `BookingSectionProps` and render the correct variant (embed/form/calendar), relying on `registry.ts` defaults only if props omit a value.
* **App Router pages** call your **data façade** (e.g., `/src/data/booking/index.ts`) → pass output into `adapters.ts` functions → render templates.

---

## 10) Common pitfalls (avoid these)

* **Mixing concerns**: don’t validate UI styling in lib; keep lib for domain props only.
* **Coupling to a provider SDK**: lib can describe provider config; runtime embedding belongs in **components**.
* **Defaulting service incorrectly**: if `topic` is missing/invalid, keep `service` undefined and let UI show a picker (don’t guess).
* **Circular imports**: templates ↔ lib; avoid by keeping lib completely React-free.
* **Forgetting legacy aliases**: always canonicalize slugs at adapter boundaries using the SSOT.

---

## 11) Ready-to-ship checklist

* [ ] All lib files created and exported **named** symbols only.
* [ ] Types compile; adapters validated in dev via Zod.
* [ ] Registry covers **every** canonical service with a default variant.
* [ ] Metrics dispatcher settable; no runtime errors if not set.
* [ ] No imports from templates/sections/data within lib.
* [ ] Unit tests green; `tsc --noEmit` clean.

---

That’s everything you need to author the `lib` layer cleanly. If you want, I can also generate a minimal **/src/data/booking/index.ts façade** and a **couple of stub calendar/intake files** to make the first end-to-end render work immediately.
