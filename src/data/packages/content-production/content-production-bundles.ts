// src/data/packages/content-production/content-production-bundles.ts

import type { PackageBundle } from "../_types/packages.types";

// These are cross-sell “kits” composed of ServicePackage IDs.
export const CONTENT_BUNDLES: PackageBundle[] = [
  {
    id: "bundle-content-starter",
    name: "Small Business Content Starter",
    components: [
      "content-design-essential",
      "content-copy-essential",
      "content-publish-basic-cms",
    ],
    price: { monthly: 5800, currency: "USD" },
    compareAt: { monthly: 6800, currency: "USD" }, // for savings UX
  },
  {
    id: "bundle-content-growth",
    name: "Growth Business Content System",
    components: [
      "content-design-professional",
      "content-copy-professional",
      "content-publish-professional",
      "content-video-social-pack",
    ],
    price: { monthly: 13500, currency: "USD" },
    compareAt: { monthly: 16000, currency: "USD" },
  },
  {
    id: "bundle-content-enterprise",
    name: "Enterprise Content Powerhouse",
    components: [
      "content-design-enterprise",
      "content-copy-enterprise",
      "content-publish-enterprise",
      "content-video-training-system",
      "content-sales-enterprise",
    ],
    price: { oneTime: 12500, monthly: 38500, currency: "USD" },
    compareAt: { oneTime: 17500, monthly: 46500, currency: "USD" },
  },
  // Industry-specific examples (target prices)
  {
    id: "bundle-content-ecommerce",
    name: "E-commerce Content Bundle",
    components: [
      "content-design-professional",
      "content-pack-ecommerce",         // curated; add if you decide to author it
      "content-photo-product-starter",
      "content-video-social-pack",
    ],
    price: { monthly: 12500, currency: "USD" },
  },
  {
    id: "bundle-content-b2b-pro",
    name: "B2B Professional Services Bundle",
    components: [
      "content-copy-enterprise",
      "content-sales-professional",
      "content-photo-corporate",
      "content-presentation-executive",
    ],
    price: { oneTime: 8500, monthly: 12000, currency: "USD" },
  },
  {
    id: "bundle-content-startup-launch",
    name: "Startup Content Launch Bundle",
    components: [
      "content-brand-essentials",
      "content-copy-essential",
      "content-publish-basic-cms",
      "content-presentation-starter",
    ],
    price: { oneTime: 9500, monthly: 4300, currency: "USD" },
  },
];