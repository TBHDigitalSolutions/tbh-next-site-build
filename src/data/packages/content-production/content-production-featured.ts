// /src/data/packages/content-production/content-production-featured.ts
import type { ServicePackageCard } from "../_types/packages.types";

// Represent curated items as virtual ServicePackageCards (adapters can map to cards)
export const FEATURED_PACKAGES: ServicePackageCard[] = [
  {
    id: "content-brand-starter",
    name: "Brand Content Starter",
    badge: "Most Popular",
    price: { oneTime: 2500, monthly: 3500, currency: "USD" },
    summary:
      "Establish consistent voice and a dependable monthly publishing cadence.",
    bullets: [
      "Brand voice development & guidelines",
      "20 pieces of monthly content",
      "Basic graphic design (10 pieces/month)",
      "Content calendar & publishing",
      "Monthly performance reporting",
    ],
  },
  {
    id: "content-social-growth-pack",
    name: "Social Media Growth Pack",
    badge: "Best Value",
    price: { oneTime: 1500, monthly: 4500, currency: "USD" },
    summary:
      "Scalable social program that actually ships and learns.",
    bullets: [
      "40 posts/month across platforms",
      "Pro design templates",
      "Hashtag & optimization workflow",
      "Community management (2h/day)",
      "Monthly analytics & optimization",
    ],
  },
  {
    id: "content-complete-system",
    name: "Complete Content System",
    badge: "Enterprise",
    price: { oneTime: 5000, monthly: 8500, currency: "USD" },
    summary:
      "End-to-end production across channels with strategy, design, and video.",
    bullets: [
      "Unlimited written content",
      "Photography direction",
      "4 videos/month",
      "Multi-platform optimization",
      "Dedicated strategist; advanced analytics",
    ],
  },
  // Optional 4th
  {
    id: "content-editorial-starter",
    name: "Editorial Strategy Starter",
    price: { oneTime: 4500, currency: "USD" },
    summary: "Low-friction entry that leads to production retainers.",
    bullets: [],
  },
];