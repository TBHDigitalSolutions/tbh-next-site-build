Booking Domain Project Plan
Official Title: Booking Domain End-to-End Project Plan
Domain: Booking
File Name: booking-domain-project-plan_Plan_2025-09-15.md
Main Part: booking-domain-project-plan
Qualifier: Plan
Date: 2025-09-15

Spotlight Comments:
Outlines a comprehensive plan for implementing a production-ready Booking domain, mirroring Portfolio’s architecture.
Defines hybrid modal and page UX, with clear data contracts and canonical service naming.
Includes scaffold commands, a QA checklist, and cross-references to Portfolio’s structure for consistency.

Summary:
The Booking Domain End-to-End Project Plan provides a detailed blueprint for building a production-ready Booking domain, integrating seamlessly with the App Router, a source module (/src/booking), and a data layer (/src/data/booking). It outlines a hybrid UX strategy using both modal pop-ups and a full booking page, with thin App Router pages (/app/book, /(modals)/book) that fetch data via a façade, normalize it with adapters, and render templates (BookingHubTemplate, BookingModalTemplate). The plan enforces strict separation of domain logic (/src/booking/lib) and UI-specific logic, mirroring Portfolio’s architecture, and ensures compliance with canonical service naming, SEO, accessibility, and performance standards.
This document serves as a guide for developers to implement the Booking domain, providing directory structures, scaffold commands, type contracts, and a QA checklist to ensure consistency and scalability. It cross-references Portfolio’s implementation for alignment, offering actionable steps

---

Awesome—here’s a complete, production-ready plan to stand up a **Booking** domain that supports both **modal pop-ups** and a full **booking page**, wired cleanly to your App Router, source module, and data layer. I’ve based the blueprint on the same architecture, rules, and contracts we established for Portfolio, so it drops in without surprises.

---

# Booking Domain — End-to-End Project Plan

## 1) UX Strategy: When to use a **Modal** vs a **Page**

**Use the modal** when the user is already within a service flow and you want to keep them in context (e.g., from a CTA on a service page, portfolio item, pricing card).
**Use the page** for SEO, shareable links, and when you need richer content (explanations, FAQs, prep notes, multi-step options). The recommendation is a **hybrid**: route `/book` always exists; service CTAs can open a modal overlay that’s *also* route-driven so deep links and back/forward work.&#x20;

**Rules of thumb**

* Default CTA `href="/book?topic=<service>&ref=<path>"`.
* If user arrives from a service page, prefer an intercepted/parallel route that renders as a modal over the current page.
* If the user lands directly on `/book`, show the full booking page.&#x20;

---

## 2) App Router Architecture (routes, modals, parity)

**Goal:** Thin pages that fetch from `/src/data/booking`, adapt via `/src/booking/lib/adapters`, and render **templates**. Keep the same bands as Portfolio (Hero → Search/Filters (optional) → Booking UI → CTA).&#x20;

### Routes (recommended)

```
/app
├─ /book
│  └─ page.tsx                         # Full booking page (SSR)
├─ /(modals)
│  └─ /book
│     └─ page.tsx                      # Intercepted/parallel route used as modal overlay
└─ /services/[hub]/[service]/page.tsx  # Service pages that can open /book as a modal
```

* **/book/page.tsx**: server component; owns SEO/JSON-LD; renders `<BookingHubTemplate />`.
* **/(modals)/book/page.tsx**: renders `<BookingModalTemplate />`; opened from CTAs with `router.push('/book?...')` while preserving the underlying page state.
* **Parity**: Keep the same band naming and toggles you used for portfolio templates so service pages feel consistent.&#x20;

---

## 3) Source Module (Booking) — directory + responsibilities

Model this on the portfolio module (templates → sections → components → lib SSOT).&#x20;

```
/src/booking
├─ templates
│  ├─ BookingHubTemplate/
│  │  ├─ index.ts
│  │  ├─ BookingHubTemplate.tsx        # Page layout: hero, optional filters, booking shell, CTA
│  │  ├─ BookingHubTemplate.types.ts   # Props contract (typed)
│  │  └─ BookingHubTemplate.module.css
│  └─ BookingModalTemplate/
│     ├─ index.ts
│     ├─ BookingModalTemplate.tsx      # Modal layout (focus trap, small copy, form/embed)
│     ├─ BookingModalTemplate.types.ts
│     └─ BookingModalTemplate.module.css
├─ sections
│  └─ BookingSection/
│     ├─ index.ts
│     ├─ BookingSection.tsx            # Orchestrates “variant”: "embed" | "form" | "calendar"
│     ├─ BookingSection.types.ts
│     ├─ BookingSection.module.css
│     └─ utils/bookingSectionValidator.ts
├─ components
│  ├─ SchedulerEmbed/                   # Cal.com/Calendly wrappers (SSR-safe + client portals)
│  ├─ BookingForm/                      # In-house intake (name, email, timezone, goals)
│  ├─ AvailabilityCalendar/             # Optional inline calendar UI
│  ├─ TimezonePicker/
│  ├─ ConsentAndPolicies/               # GDPR/consent checkboxes
│  ├─ Confirmation/
│  └─ common (ModalShell, Buttons, etc.)
├─ lib
│  ├─ types.ts                          # Canonical booking types (BookingIntent, Slot, IntakeField, etc.)
│  ├─ adapters.ts                       # adaptHubConfig, adaptModalConfig, toBookingSectionProps(...)
│  ├─ validators.ts                     # primitive domain validators (not component props)
│  ├─ registry.ts                       # variant → renderer map; service → calendar mapping
│  └─ metrics.ts                        # analytics event names, funnel helpers
└─ index.ts                             # Barrel: export templates, section, core types/adapters
```

**Why this split?** Same SSOT and import directionality as Portfolio (App → templates → sections → components; lib is shared primitives), so responsibilities don’t overlap.&#x20;

---

## 4) Data Layer for Booking (SSOT + canonical services)

Keep booking data in one domain folder, normalized to **canonical “\*-services”** slugs; provide a simple façade for pages.&#x20;

```
/src/data/booking
├─ index.ts                 # façade: getBookingHub(), getCalendarForService(), getIntakeForService(), searchSlots()
├─ _types/index.ts          # BookingDataset, CalendarProviderConfig, IntakeFormSpec, etc.
├─ _utils/
│  ├─ normalization.ts      # Coerce inputs to strict types
│  └─ search.ts             # (optional) local search/filtering for slots/types
├─ _validators/
│  ├─ schema.ts
│  └─ booking.validate.ts
├─ calendars/               # Provider configs per service (Cal.com/Calendly keys, event types)
│  ├─ web-development-services.ts
│  ├─ video-production-services.ts
│  └─ ... (all canonical services)
├─ intake/
│  ├─ web-development-services.ts      # Intake question sets per hub
│  └─ ...
└─ policies/
   ├─ gdpr.md
   └─ cancellation.md
```

**Canonical slugs & legacy aliases**
All service keys in `calendars/*` and `intake/*` **must** use canonical slugs (normalize any legacy aliases at the edge). Reuse your global rules and helpers to enforce this across domains.&#x20;

---

## 5) Contracts (types) & adapters (what crosses boundaries)

Define once in `/src/booking/lib/types.ts`, then reuse in templates/sections:

* `CanonicalService` (import from shared SSOT) + `BookingVariant = "embed" | "form" | "calendar"`.
* **Template props**

  * `BookingHubTemplateProps`: `{ meta, features, hero, booking: BookingSectionProps, analytics }`
  * `BookingModalTemplateProps`: `{ booking: BookingSectionProps, analytics }`
* **Section props**

  * `BookingSectionProps`: `{ variant, service?: CanonicalService, calendar?: CalendarConfig, intake?: IntakeFormSpec, prefill?: Prefill, successHref?, cancelHref? }`

**Adapters in `/src/booking/lib/adapters.ts`**

* `adaptHubConfig(raw)` → `BookingHubTemplateProps`
* `adaptModalConfig(raw)` → `BookingModalTemplateProps`
* `toBookingSectionProps(raw)` → `BookingSectionProps` (tolerant; coerce `service` with `normalizeServiceSlug()`; fill provider defaults).&#x20;

**Validation policy**

* **lib/validators.ts** for domain primitives,
* \**sections/utils/*Validator.ts** for UI-specific props,
* **/src/data/booking/\_validators/** for raw data. (Same split as Portfolio).&#x20;

---

## 6) App Pages → Template Wiring (examples to follow, no code here)

* `/app/book/page.tsx`:

  1. `getBookingHub()` → 2) `adaptHubConfig()` → 3) `<BookingHubTemplate />` with parity bands (Hero/Copy → BookingSection → CTA).
* `/app/(modals)/book/page.tsx`:

  1. read query (topic/ref) → 2) `getCalendarForService(normalizeServiceSlug(topic))` & `getIntakeForService(...)` → 3) `toBookingSectionProps()` → `<BookingModalTemplate />`.
* Service pages: trigger modal via navigation to `/book?topic=<service>&ref=<path>`.&#x20;

---

## 7) Canonical “\*-services” compliance (hard rules)

* All booking data keys and directories must use canonical slugs; normalize legacy inputs at the adapter boundary.
* Barrels export **canonical names first**, with optional `@deprecated` legacy re-exports for backward compatibility, mirroring the global rules.&#x20;

---

## 8) Analytics, SEO, A11y, and Perf

* **Analytics**: fire standardized funnel events from templates/section via `booking/lib/metrics.ts` (e.g., `booking_view`, `booking_submit`, `booking_success`, `booking_error`, `booking_open_modal`, `booking_close_modal`), including `context` and `service` tags.
* **SEO**: the *page* owns metadata + JSON-LD (`ContactPage` or `Reservation` depending on flow). The *modal route* can omit metadata or keep it minimal.&#x20;
* **A11y**: modal uses focus trap, ARIA labels, ESC to close, page scroll lock; forms labelled; one H1 per page.
* **Perf**: scheduler embeds are dynamically imported in client components; prefer light wrappers around providers; prefill with query params to minimize user typing.&#x20;

---

## 9) Ideal Directory Trees (scaffold)

### App Router

```
/app/book/page.tsx
/app/(modals)/book/page.tsx
```

### Source module

```
/src/booking/...    # (see full tree in §3)
```

### Data

```
/src/data/booking
├─ index.ts
├─ _types/index.ts
├─ _utils/{normalization.ts, search.ts}
├─ _validators/{schema.ts, booking.validate.ts}
├─ calendars/{web-development-services.ts, ...}
├─ intake/{web-development-services.ts, ...}
└─ policies/{gdpr.md, cancellation.md}
```

**Scaffold commands (paths relative to repo root)**

```bash
# App
mkdir -p app/book app/(modals)/book
touch app/book/page.tsx app/(modals)/book/page.tsx

# Source module
mkdir -p src/booking/{templates/BookingHubTemplate,templates/BookingModalTemplate,sections/BookingSection/components,components,lib}
touch src/booking/templates/BookingHubTemplate/{index.ts,BookingHubTemplate.tsx,BookingHubTemplate.types.ts,BookingHubTemplate.module.css}
touch src/booking/templates/BookingModalTemplate/{index.ts,BookingModalTemplate.tsx,BookingModalTemplate.types.ts,BookingModalTemplate.module.css}
touch src/booking/sections/BookingSection/{index.ts,BookingSection.tsx,BookingSection.types.ts,BookingSection.module.css}
mkdir -p src/booking/sections/BookingSection/utils && touch src/booking/sections/BookingSection/utils/bookingSectionValidator.ts
touch src/booking/lib/{types.ts,adapters.ts,validators.ts,registry.ts,metrics.ts}
touch src/booking/index.ts

# Data
mkdir -p src/data/booking/{_types,_utils,_validators,calendars,intake,policies}
touch src/data/booking/index.ts
touch src/data/booking/_types/index.ts
touch src/data/booking/_utils/{normalization.ts,search.ts}
touch src/data/booking/_validators/{schema.ts,booking.validate.ts}
# Canonical service files (one per service)
for s in web-development-services video-production-services seo-services marketing-services lead-generation-services content-production-services; do
  touch "src/data/booking/calendars/$s.ts"
  touch "src/data/booking/intake/$s.ts"
done
touch src/data/booking/policies/{gdpr.md,cancellation.md}
```

(Ensure your TS path aliases are set for `@/booking/*` and `@/data/*` as in the architecture guides.)&#x20;

---

## 10) Authoring & Governance

* Follow the **Domain Implementation Template** for adding new domains or extending booking variants (keeps structure, contracts, and guardrails identical across the codebase).&#x20;
* Keep `/src/data` as the **SSOT**; app pages never hardcode service lists—always derive from data/taxonomy and canonical helpers.
* Enforce canonical services naming for any new booking data with the global rules (aliases normalized at adapters).&#x20;

---

## 11) QA / Readiness Checklist

**Routing & UX**

* [ ] `/book` renders booking page with correct hero/copy/CTA.
* [ ] From a service page, clicking “Book” opens the modal route `(modals)/book` over the current page; back button restores previous view.
* [ ] Query prefill (`topic`, `ref`) sets default service, calendar type, and intake fields.&#x20;

**Data & Contracts**

* [ ] All `calendars/*` and `intake/*` files named by **canonical service**.
* [ ] `index.ts` façade exposes `getBookingHub`, `getCalendarForService`, `getIntakeForService`, `searchSlots`.
* [ ] Adapters return strictly typed template/section props; validators run in dev.

**Templates & Sections**

* [ ] Hub/Modal templates match Portfolio parity (bands, toggles); no fetching inside templates.
* [ ] `BookingSection` switches variants: `"embed" | "form" | "calendar"`; client boundaries only where necessary.

**Compliance**

* [ ] Canonical “\*-services” naming enforced; legacy aliases normalize at boundary.
* [ ] Barrels export canonical first; legacy re-exports are marked `@deprecated`.&#x20;

**A11y/SEO/Perf**

* [ ] Modal has focus trap, labelled controls, ESC to close; page has single H1.
* [ ] JSON-LD present on `/book`; meta tags complete.
* [ ] Dynamic import heavy embeds; lazy media; no client code in pages.&#x20;

---

## 12) Where this plan comes from (cross-refs)

* **Booking + Modal strategy & CTA usage** (hybrid flow, route-driven modals).&#x20;
* **/src/data official guide** (SSOT, façade pattern, mirroring App Router).&#x20;
* **Domain Implementation Template** (thin pages, strong templates, adapters).&#x20;
* **Generic domain structure template** (templates/sections/components/lib responsibilities).&#x20;
* **Canonical “\*-services” global rules** (names, exports, legacy aliases).&#x20;
* **Project Overview** (routing parity, SEO, workflows, SSOTs).&#x20;

If you want, I can also generate starter **type stubs** and minimal **index.ts façades** for `/src/data/booking` so you can paste them in and start authoring immediately.
