// src/mock/addons.ts
// Mock data for Add-on components (Grid, Carousel, Card)

import type { Money } from "@/packages/lib/types";

/** Minimal shape most Add-on UIs can consume directly */
export type MockAddOn = {
  id: string;
  name: string;
  description?: string;
  bullets?: string[];
  price?: Money;            // canonical (SSOT)
  priceLabel?: string;      // fallback when price is absent
  badge?: string;           // e.g., "Popular"
  href?: string;
  category?: string;        // for filters
  popular?: boolean;
};

export const MOCK_ADDONS: MockAddOn[] = [
  {
    id: "seo-keyword-boost",
    name: "Keyword Boost",
    description: "Expand your ranking footprint with long-tail clusters.",
    bullets: ["10–15 long-tail clusters", "On-page insertions", "SERP QA pass"],
    price: { monthly: 900, currency: "USD" },
    badge: "Popular",
    category: "SEO",
    href: "/addons/seo-keyword-boost",
    popular: true,
  },
  {
    id: "video-snippet-kit",
    name: "Social Snippet Kit",
    description: "Cutdowns for social — captions, ratios, and hooks included.",
    bullets: ["6x short edits", "Subtitles + branding", "Hook variants"],
    price: { oneTime: 1800, currency: "USD" },
    category: "Video",
    href: "/addons/video-snippet-kit",
  },
  {
    id: "web-speed-pack",
    name: "Web Speed Pack",
    description: "PageSpeed uplift with image, script, and server tweaks.",
    bullets: ["Core Web Vitals audit", "Optimizations applied", "Before/after report"],
    price: { monthly: 300, oneTime: 1200, currency: "USD" }, // hybrid
    category: "Web",
    href: "/addons/web-speed-pack",
  },
  {
    id: "analytics-pro-setup",
    name: "Analytics Pro Setup",
    description: "Advanced events and dashboards for performance tracking.",
    bullets: ["GA4 + tags", "Custom events", "Executive dashboard"],
    // No price → will render fallback label
    priceLabel: "Contact for pricing",
    category: "Analytics",
    href: "/addons/analytics-pro-setup",
  },
];

/* -------------------------------------------------------------------------- */
/* Optional: adapters for components                                          */
/* -------------------------------------------------------------------------- */

/** Adapter for AddOnsGrid when using its `addOns` prop (very close already). */
export function asAddOns(): Array<{
  slug: string; name: string; description?: string; price?: Money;
  category?: string; popular?: boolean;
}> {
  return MOCK_ADDONS.map(a => ({
    slug: a.id,
    name: a.name,
    description: a.description,
    price: a.price,
    category: a.category,
    popular: a.popular,
  }));
}

/** Adapter for AddOnCard if you want to map directly */
export function asAddOnCardItems() {
  return MOCK_ADDONS.map(a => ({
    id: a.id,
    title: a.name,
    description: a.description,
    bullets: a.bullets,
    price: a.price,
    priceLabel: a.price ? undefined : (a.priceLabel ?? "Contact for pricing"),
    badge: a.badge ?? (a.popular ? "Popular" : undefined),
    href: a.href,
    category: a.category,
    popular: a.popular,
  }));
}
