// src/mock/bundles.ts
// Mock data for Bundle card/grid components

import type { Money } from "@/packages/lib/types";

export type MockBundle = {
  id: string;
  name: string;
  summary?: string;
  bullets?: string[];        // highlights
  includes?: string[];       // list of included packages (labels)
  price?: Money;             // canonical price
  priceLabel?: string;       // fallback when price absent
  badge?: string;
  href?: string;
  popular?: boolean;
};

export const MOCK_BUNDLES: MockBundle[] = [
  {
    id: "starter-web-plus",
    name: "Starter Web Plus",
    summary: "Modern site + basic care plan.",
    bullets: ["Responsive pages", "Contact flows", "Basic analytics"],
    includes: ["Website Essentials", "Care Plan Basic"],
    price: { oneTime: 8500, monthly: 500, currency: "USD" }, // hybrid
    badge: "Popular",
    href: "/bundles/starter-web-plus",
    popular: true,
  },
  {
    id: "content-growth",
    name: "Content Growth",
    summary: "Publishing engine for steady demand capture.",
    bullets: ["Editorial calendar", "4 articles/mo", "SEO review"],
    includes: ["Content Operations", "On-Page SEO"],
    price: { monthly: 2500, currency: "USD" }, // monthly only
    href: "/bundles/content-growth",
  },
  {
    id: "brand-film-kit",
    name: "Brand Film Kit",
    summary: "Flagship brand film delivered end-to-end.",
    bullets: ["Treatment & script", "1 shoot day", "Master edit"],
    includes: ["Brand Film Production"],
    price: { oneTime: 12500, currency: "USD" }, // one-time only
    href: "/bundles/brand-film-kit",
  },
  {
    id: "enterprise-foundation",
    name: "Enterprise Foundation",
    summary: "Core web, analytics, and governance to scale confidently.",
    bullets: ["Infra & SSO ready", "Dashboards", "Ops playbooks"],
    includes: ["Enterprise Web", "Analytics Pro", "Ops Handbook"],
    // No price → fallback label
    priceLabel: "Contact for pricing",
    href: "/bundles/enterprise-foundation",
  },
];

/* -------------------------------------------------------------------------- */
/* Optional: adapters for components                                          */
/* -------------------------------------------------------------------------- */

/** Basic adapter for a BundleCard prop shape */
export function asBundleCards() {
  return MOCK_BUNDLES.map(b => ({
    id: b.id,
    name: b.name,
    description: b.summary,
    bullets: b.bullets,
    price: b.price,
    priceLabel: b.price ? undefined : (b.priceLabel ?? "Contact for pricing"),
    badge: b.badge ?? (b.popular ? "Popular" : undefined),
    href: b.href,
    popular: b.popular,
    includes: b.includes,
  }));
}

/** Minimal adapter for a grid/list of bundles */
export function asBundleList() {
  return MOCK_BUNDLES.map(b => ({
    id: b.id,
    title: b.name,
    summary: b.summary,
    price: b.price,
    priceLabel: b.price ? undefined : (b.priceLabel ?? "Contact for pricing"),
    href: b.href,
    badge: b.badge,
  }));
}
