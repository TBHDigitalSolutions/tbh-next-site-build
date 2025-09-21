// src/data/page/main-pages/contact/trust-signals.ts
// “Trusted by…” social-proof data (ratings/badges/partner logos). Pure data only.

import type { TrustSignalsSection } from "@/data/page/main-pages/contact/types";

export const trustSignals = {
  title: "Trusted by teams like yours",
  items: [
    {
      id: "google-reviews",
      type: "rating", // "rating" | "badge" | "logo"
      label: "Google Reviews",
      value: "5.0",
      scale: 5,
      count: 48,
      logoSrc: "/images/trust/google.svg", // optional; your component should gracefully handle missing assets
      href: "https://www.google.com/search?q=TBH+Digital+Solutions+reviews",
    },
    {
      id: "clutch-top-b2b",
      type: "badge",
      label: "Clutch Top B2B",
      year: 2024,
      logoSrc: "/images/trust/clutch.svg",
      href: "https://clutch.co",
    },
    {
      id: "shopify-partner",
      type: "logo",
      label: "Shopify Partner",
      logoSrc: "/images/trust/shopify-partner.svg",
      href: "https://www.shopify.com/partners",
    },
    {
      id: "meta-badged",
      type: "logo",
      label: "Meta Business Partner",
      logoSrc: "/images/trust/meta-partner.svg",
      href: "https://www.facebook.com/business/marketing-partners",
    },
  ],
} satisfies TrustSignalsSection;

export default trustSignals;
