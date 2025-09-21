Booking Domain Supplemental Guidance
Official Title: Booking Domain Supplemental Guidance for Developers, Writers, and Stakeholders
Domain: Booking
File Name: booking-domain-supplemental-guidance_Guidance_2025-09-15.md
Main Part: booking-domain-supplemental-guidance
Qualifier: Guidance
Date: 2025-09-15

Spotlight Comments:
Comprehensive guide tailored for developers, writers, and stakeholders to support the Booking domain implementation.
Covers environment setup, provider integration, accessibility, analytics, and rollout strategies, aligned with Portfolio’s architecture.
Includes a one-page QA checklist and cross-references to ensure consistency with canonical service naming and data contracts.

Summary:
The Booking Domain Supplemental Guidance for Developers, Writers, and Stakeholders provides a detailed resource to support the implementation of the Booking domain, complementing the primary project plan. It addresses the needs of developers (environment setup, provider integration, analytics, and error handling), writers (microcopy, consent language, and SEO guidelines), and stakeholders (success criteria, risks, and rollout plans). The guide ensures alignment with the Portfolio domain’s architecture, emphasizing canonical service naming, strict data contracts, accessibility (WCAG 2.1 AA), and performance budgets, while outlining a phased rollout strategy and a comprehensive QA checklist.
This document is designed to prevent last-minute issues by providing actionable guidance for all involved teams. It includes environment configuration details, provider-specific notes (Cal.com/Calendly), data privacy rules, analytics taxonomy, and testing protocols, ensuring the Booking domain integrates seamlessly with the App Router and maintains consistency with existing systems. The guidance also offers future-proofing ideas and a one-page checklist for tracking implementation progress.

---

Love it. Here’s the “everything-else” pack teams usually need but don’t have in one place. It’s scoped to your **Booking** domain, written for **developers, writers, and stakeholders**, and designed to prevent last-minute surprises.

---

# Booking Domain — Supplemental Guidance (for Devs, Writers, Stakeholders)

## 1) Audience snapshots (who needs what)

* **Developers**

  * Contracts (what props/data are guaranteed), env/config matrix, provider behavior (Cal.com/Calendly), SSR/CSR boundaries, a11y specifics, analytics taxonomy, error/edge cases, test & rollout plan.
* **Writers/Content**

  * Canonical tone & microcopy, legal/consent language, email templates, empty/error states copy, FAQ structure, SEO schema guidelines, localized phrasing (timezones, date formats).
* **Stakeholders**

  * Success criteria, risks, dependencies, feature flags/phased rollouts, analytics KPI definitions, compliance posture, support/ops plan.

---

## 2) Environment & configuration (single source of truth)

Create a **Booking Config** table (internal doc) listing all keys, owners, and lifecycles:

* **Provider keys & IDs**

  * `BOOKING_PROVIDER` (“cal”, “calendly”, “custom”)
  * `BOOKING_CAL_TEAM` / `BOOKING_CAL_EVENT` (per service)
  * `BOOKING_CALENDLY_ORG` / `BOOKING_CALENDLY_EVENT` (per service)
* **Feature flags**

  * `booking.modal.enabled` (default: true)
  * `booking.form.enabled` (default: true)
  * `booking.calendar.enabled` (default: true)
* **Security**

  * reCAPTCHA/site key (if form variant)
  * Rate-limit thresholds
* **Telemetry**

  * Analytics write key, consent gating toggle
* **Email / notifications**

  * Transactional provider (e.g., Resend/SES) API key, sender domains
* **Legal & policy**

  * Links/IDs for GDPR + cancellation policies (content-controlled)

> Keep these in `.env` / platform secrets; **never** in the repo.

---

## 3) Provider integration notes (Cal.com / Calendly / Custom)

* **SSR vs CSR**: provider embeds are **client-only**; templates remain server components; the section/component doing the embed is marked `"use client"`.
* **Prefill**: pass `name`, `email`, `timezone`, `notes`, and `utm/ref` as query params to the provider when supported.
* **Resilience**:

  * If provider JS fails to load in 3–5s: show inline fallback (link to provider-hosted booking page) with a “Try opening in a new tab” CTA.
  * If provider is down: render the **form variant** as a failover (collect intent and send confirmation email + ops alert).
* **Cross-service mapping**: one service → one event type ID; store mapping in `/src/booking/lib/registry.ts` and `/src/data/booking/calendars/*`.

---

## 4) Data & privacy (PII handling)

* **Minimize**: collect only needed fields for scheduling and qualification (name, email, timezone, broad goal).
* **Retention**: define how long raw form submissions are stored; redact optional free-text in logs.
* **Consent**:

  * Explicit checkbox for terms/privacy; separate marketing opt-in.
  * Double opt-in optional flag (marketing only).
* **Access**: limit who can view intake data (role-based).
* **Audit**: log consent version at time of submit.

---

## 5) Accessibility (WCAG 2.1 AA)

* **Modal**

  * Focus trap; ESC to close; restore focus to trigger; aria-label/aria-modal; prevent background scroll.
* **Forms**

  * Label every input; show inline errors near fields; hit target sizes ≥ 44px; keyboard navigable controls.
* **Contrast & motion**

  * Contrast ≥ 4.5:1; provide “reduce motion” for transitions (respect `prefers-reduced-motion`).
* **Calendar**

  * Keyboard nav (arrow keys) and screen reader labels for dates/times.

---

## 6) UX microcopy & content (writers)

* **Hero (page)**: promise + what happens next + time expectation (“Book a 30-min strategy session. We confirm instantly.”)
* **Modal title**: “Schedule your session” (short, action-oriented).
* **Error copy**: human + actionable (“We couldn’t load the scheduler. Open booking in a new tab or email us at …”).
* **Consent**: plain English summary + link to full policy.
* **Confirmation**:

  * On-page + email copy; include calendar file/links, reschedule/cancel link, preparation checklist.
* **FAQ**: duration, location (video link), reschedule policy, what to prepare, who should attend.

---

## 7) SEO & Schema

* **/book page**: `ContactPage` or `Reservation` JSON-LD (whichever is closer to your reality). Include `provider`, `areaServed`, and `offers` if relevant (free consult).
* **Noindex for modal route**: keep modal route minimal metadata / noindex to avoid duplicate content.
* **URL design**: support `?topic=<service>&ref=<path or source>`; canonical links to `/book`.

---

## 8) Analytics taxonomy (events & props)

Use a simple, consistent schema (fire from client components once UI is interactable):

* `booking_view` — `{ context, route, service, variant }`
* `booking_open_modal` — `{ route, service, source }`
* `booking_submit` — `{ service, variant, fields_present[], has_marketing_opt_in }`
* `booking_success` — `{ service, variant, provider, slot_iso, timezone }`
* `booking_error` — `{ service, variant, provider, code, message }`
* `booking_close_modal` — `{ route, service, reason }`

**KPIs**: view→open→submit→success conversion; drop-off by field; provider load error rate; modal open rate by page.

---

## 9) Error, empty, and edge states (must design)

* **Provider load fail**: display fallback card with “Open booking in new tab” + “Email us” link.
* **No slots**: show message, allow “Join waitlist” (optional form/email).
* **Rate-limit hit**: swap submit with cooldown message.
* **Invalid service**: normalize via alias map; if still invalid, show generic booking flow.
* **Network failure** (form): keep user input in memory; show retry; never lose typed content.

---

## 10) Security & abuse prevention

* **Bot defense**: reCAPTCHA/Turnstile on form submit; shadow-ban suspicious IPs (server-side).
* **Rate limits**: IP + email + route throttles (e.g., 10 attempts / 10 minutes).
* **Link hygiene**: sanitize `ref`/UTM; whitelist destinations for any external links.
* **Email verification** (optional): verification link or magic link to confirm email before creating a booking.

---

## 11) Notifications & calendar artifacts

* **Confirmation email**: send immediately; include ICS attachment **and** Google/Outlook add-to-calendar links.
* **Reminders**: 24h + 1h default (provider-side if possible).
* **Internal alerts**: Slack/Email on new booking (include service, time, ref).
* **Reschedule/cancel**: provider link in all messages; respect cancellation policy.

---

## 12) Internationalization, timezones, locale

* **Timezone**: auto-detect; user can change; persist in URL (`tz=`) and local storage.
* **Locale**: copy and date formats localize; long-form dates with month name (avoid ambiguity).
* **DST**: rely on provider when possible; if custom calendar, use a robust TZ library and always store **UTC**.

---

## 13) Performance budgets

* **Modal TTI**: < 1500ms on mid-tier device; defer provider script; show skeleton immediately.
* **Page LCP**: < 2.5s; hero image optimized; avoid layout shifts.
* **Bundle**: dynamically import scheduler; keep initial JS < 150KB where possible.

---

## 14) Testing & QA playbook

**Unit / integration**

* Adapters normalize legacy → canonical service slugs.
* Fallback when provider not configured for a service.

**E2E (happy paths)**

* Page booking: choose service → pick slot → confirm → receive email.
* Modal booking from service page: open modal, submit, navigate back, page state intact.
* Prefill via URL (topic, name, email, tz).

**E2E (edge paths)**

* Provider offline → fallback form flow works.
* No slots → waitlist form visible.
* Rapid submits → rate limit message.

**Accessibility checks**

* Keyboard flow; focus trap; screen reader labels.

**Analytics verification**

* Events fire with correct props in each flow.

---

## 15) Rollout & comms plan

* **Phase 1 (internal)**: enable page `/book`; log-only analytics; QA in staging.
* **Phase 2 (soft launch)**: enable modal on 1–2 service pages; monitor provider load errors and conversion.
* **Phase 3 (full)**: enable modal on all CTAs; publish site-wide “Book” links; announce.
* **Comms**: release note to sales/CS; internal FAQ (reschedule policy, where bookings show up).
* **Rollback**: feature flag to disable modal (fall back to page link).

---

## 16) Success criteria (stakeholders)

* ≥ 3% page→submit conversion on `/book`; ≥ 60% submit→success (provider confirmation).
* Modal open rate ≥ 8% on service/portfolio pages; < 2% provider load error rate.
* < 1% a11y violations on automated audits; 0 PII in client logs.
* Time to schedule < 90 seconds median (from modal open to confirmation).

---

## 17) Ownership & runbook

* **Owner**: Booking domain lead (eng) + content owner (CX/marketing).
* **On-call**: Who handles provider outages and failover toggles.
* **Runbook**:

  * If provider latency > threshold: auto-switch to form fallback.
  * If email bounces spike: check sender reputation; switch provider.
  * Weekly: verify links, slots, and policy copy.

---

## 18) Future-proofing / roadmap ideas

* **Smart routing**: remember last chosen service; suggest nearest available time by timezone.
* **Multi-guest booking**: additional attendee emails.
* **CRM sync**: post-booking webhook → pipeline stage creation.
* **Self-serve reschedule** (if custom flow) with tokenized links.

---

### One-page checklist (paste into your issue/PR)

* [ ] Env/config table completed; secrets set.
* [ ] Data façade + canonical service files authored; validators pass.
* [ ] Templates (page & modal) match parity; no fetching inside templates.
* [ ] Section supports `"embed" | "form" | "calendar"` variants; a11y complete.
* [ ] Modal route wired; back/forward behavior correct; scroll lock + focus trap.
* [ ] Provider prefill works; fallback link & form implemented.
* [ ] Analytics events implemented and verified.
* [ ] SEO: JSON-LD on `/book`; modal route noindex.
* [ ] Security: captcha/rate-limit; sanitized inputs; consent recorded.
* [ ] Emails: confirmation + ICS + reminders; internal alerts.
* [ ] i18n/timezone UI tested; DST safe.
* [ ] Performance budgets met; skeletons in place.
* [ ] QA suite green; rollout toggles defined; runbook documented.

If you want, I can convert this into a **Confluence/Notion page** structure or a **GitHub issue template** so each booking enhancement opens with the right checkboxes and owners.
