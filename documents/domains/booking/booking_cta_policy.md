Official Title: Booking CTA Policy (Modal vs Page)
Domain: Services, User Experience
File Name: booking-cta-policy_InternalGuide_2025-09-11.md
Main Part: booking-cta-policy
Qualifier: InternalGuide
Date: 2025-09-11
Spotlight Comments:

Defines when to use modal vs /book page for CTAs based on context, viewport, and accessibility.
Includes TypeScript helper and Next.js component usage for consistent implementation.
Cross-references services-page-blueprint.md for integration with Hub/Service pages.

Summary: The Booking CTA Policy document provides a detailed decision framework for determining when to use a modal or route to a dedicated /book page for booking CTAs across Hub, Service, Sub-Hub, Sub-Service, and Packages Catalog pages. It includes a decision matrix based on context, viewport size (768px breakpoint), accessibility needs, and user flow, along with a TypeScript helper function and Next.js component example to standardize implementation. The policy ensures low-friction booking for engaged users while prioritizing accessibility, SEO, and shareability, with clear rules for modal behavior, analytics, and fallback routing.

---

# Booking CTA Policy (Modal vs Page)

This document outlines the policy for determining when to use a modal versus routing to a dedicated `/book` page for booking CTAs across service-related pages. It provides a decision matrix, implementation patterns, and accessibility requirements to ensure a consistent, user-friendly booking funnel.

## TL;DR Decision Matrix

| Context                                                                                    | Viewport                     | Use                              | Why                                                                                       |
|--------------------------------------------------------------------------------------------|------------------------------|----------------------------------|-------------------------------------------------------------------------------------------|
| User is within Services (Hub / Service / Sub-service) and you want fast conversion          | **≥ 768px** (tablet/desktop) | **Modal**                        | Keeps context, lowers friction, faster path to book                                       |
| Same as above                                                                              | **< 768px** (small phones)   | **Route to `/book`**             | Modals on small screens increase cognitive load; page gives breathing room & shareability |
| Multiple meeting types, prep steps, or long copy needed                                    | Any                          | **Route to `/book`**             | Users need full screen, options, and scannability                                         |
| Entry from search/social/email/deep link                                                   | Any                          | **Route to `/book`**             | SEO, shareability, and complete instructions matter                                       |
| User has assistive tech (screen reader), or `prefers-reduced-motion`                       | Any                          | **Route to `/book`** (preferred) | Avoids potential modal traps and heavy animations                                         |
| Network is slow / modal failed to load                                                     | Any                          | **Route to `/book`** (fallback)  | Reliability > polish                                                                      |

**Breakpoint:** Use `md` = **768px** as the cut line for modal vs page.

## Where to Apply (by Page Level)

- **L1 Hub (`/services/[hub]`)**  
  - Primary: **Route to `/book`**  
  - Secondary (optional): Modal for returning visitors on **≥ 768px** if analytics show deep scrolling.  
- **L2 Service — Leaf (no children)**  
  - Primary: **Modal** on **≥ 768px**  
  - Fallbacks: Route to `/book` on **< 768px**, A11y, or multi-meeting flows.  
- **L2 Service — Mini-hub (has children)**  
  - Primary: **Route to `/book`** (users are still choosing).  
  - Optional: Modal for **≥ 768px** in final CTA if page engagement is high.  
- **L3 Sub-service**  
  - Primary: **Modal** on **≥ 768px** (user intent is specific).  
  - Fallbacks: Route to `/book` on **< 768px**, A11y, or complex flows.  
- **Packages Catalog (`/services/[hub]/[service]/packages`)**  
  - Primary: **Route to `/book`** (users often share this link; FAQs live here).  
  - Optional: Modal on **≥ 768px** for “Quick book” tiles.

## Accessibility & UX Rules

- **Modal Requirements** (when used):  
  - Focus trap, `aria-modal="true"`, `role="dialog"`, ESC to close, click-outside to close.  
  - `aria-labelledby` and `aria-describedby` linked to visible title/summary.  
  - Respect `prefers-reduced-motion`; disable fancy transitions.  
  - Prevent background scroll; return focus to invoking CTA on close.  
- **Page (`/book`) Requirements**:  
  - Canonical, indexable, clear headings, scannable steps.  
  - Show all meeting types and prep instructions.  
  - Friendly error states (iframe blocked, network) with visible contact alternative.

## Analytics & Routing Notes

- **UTM & Context Pass-through**: Append `?src={pageId}&utm_medium=cta&utm_campaign=services` to `/book` for attribution.  
- **Modal Tracking**: Track `modal_open`, `modal_submit`, `modal_close` events; A/B test modal vs page on L2 leaf services.  
- **Graceful Fallback**: If modal chunk fails, immediately route to `/book` with the same params.

## Implementation Pattern

Add a helper to decide behavior at click-time:

```ts
// bookingPolicy.ts
export type BookingMode = "modal" | "page";

export function chooseBookingMode(opts: {
  inServicesHierarchy: boolean;  // true on /services/**
  isLeafService: boolean;        // L2 leaf or L3
  hasMultipleMeetingTypes: boolean;
  prefersReducedMotion: boolean;
  a11yMode?: boolean;            // SR mode / high-contrast, etc.
  viewportWidth: number;         // window.innerWidth at click
}): BookingMode {
  // Hard redirects
  if (opts.hasMultipleMeetingTypes || opts.prefersReducedMotion || opts.a11yMode) return "page";

  // Hierarchy-aware
  if (opts.inServicesHierarchy) {
    if (opts.viewportWidth >= 768) {
      // L2 leaf or L3 → modal; L2 mini-hub → page
      return opts.isLeafService ? "modal" : "page";
    }
    return "page"; // small screens
  }

  return "page";
}
```

In your `<CTASection />`:

```tsx
// CTASection.tsx
import { chooseBookingMode } from "@/lib/bookingPolicy";
import { openBookingModal } from "@/components/booking/modal";
import Link from "next/link";

function CTASection({ context }: { context: {
  inServicesHierarchy: boolean;
  isLeafService: boolean;
  hasMultipleMeetingTypes: boolean;
}}) {
  const onBook = (e: React.MouseEvent) => {
    const mode = chooseBookingMode({
      ...context,
      prefersReducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
      a11yMode: false, // wire to your global a11y flag if available
      viewportWidth: window.innerWidth,
    });

    if (mode === "modal") {
      e.preventDefault();
      openBookingModal({ source: "cta-section" });
    }
    // else allow link to navigate to /book
  };

  const href = "/book?src=cta-section&from=services";

  return (
    <div className="cta-section">
      <Link href={href} onClick={onBook} className="btn btn-primary">
        Book a Call
      </Link>
      <Link href="/contact" className="btn btn-secondary">Contact Us</Link>
    </div>
  );
}
```

## Copy Guidance

- **Modal CTA Labels**: “Book a quick call”, “Schedule intro call”  
- **Page CTA Labels**: “See all booking options”, “Go to scheduling page”  
- **Empty/Blocked States**: “Having trouble? Visit our full booking page” → link to `/book`

## QA Checklist

- [ ] Modal: focus trap, ESC, return focus, background scroll locked  
- [ ] Small screens: CTAs route to `/book`  
- [ ] Screen readers / reduced motion: route to `/book`  
- [ ] Multi-meeting-type services: route to `/book`  
- [ ] Event tracking in place (open/close/submit)  
- [ ] UTM/context params appended to `/book` links  
- [ ] Fallback to `/book` if modal fails to load