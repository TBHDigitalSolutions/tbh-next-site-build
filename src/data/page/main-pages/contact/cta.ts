// src/data/page/main-pages/contact/cta.ts
// Final CTA near the bottom of the page. Pure data only.

import type { ContactCTA } from "@/data/page/main-pages/contact/types";

export const contactCTA = {
  title: "Ready to start?",
  subtitle:
    "Tell us about your goals and constraints—get a pragmatic plan and clear next steps.",
  primaryCta: { label: "Book a Consultation", href: "/contact/book" },
  secondaryCta: {
    label: "Email Us",
    href: "mailto:info@tbhdigitalsolutions.com",
  },
} satisfies ContactCTA;

export default contactCTA;
