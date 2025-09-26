// src/data/packages/content-production/content-production-addons.ts
import type { AddOn } from "../_types/packages.types";

export const ADDONS_CATALOG: Record<string, AddOn> = {
  // Brand & Strategy
  "content-brand-identity-kit": {
    id: "content-brand-identity-kit",
    name: "Brand Identity Starter Kit",
    price: { oneTime: 4500, currency: "USD" },
    bullets: [
      "Logo design and brand guidelines",
      "Business card and letterhead design",
      "Brand color palette and typography",
      "Basic brand asset library",
    ],
  },
  "content-audit-strategy": {
    id: "content-audit-strategy",
    name: "Content Audit & Strategy Package",
    price: { oneTime: 2500, currency: "USD" },
    bullets: [
      "Complete content audit (current assets)",
      "Competitive content analysis",
      "6-month content strategy roadmap",
      "Editorial calendar template setup",
    ],
  },

  // Photography & Video
  "content-professional-photography": {
    id: "content-professional-photography",
    name: "Professional Photography Package",
    price: { oneTime: 3500, currency: "USD" },
    bullets: [
      "Full-day product or corporate photography",
      "50+ edited high-resolution images",
      "Usage rights and licensing",
      "Multiple format optimization",
    ],
  },
  "content-video-production": {
    id: "content-video-production",
    name: "Video Content Production Add-On",
    price: { monthly: 4500, currency: "USD" },
    bullets: [
      "4 videos/month (2–5 minutes each)",
      "Scripting & storyboarding",
      "Pro filming & editing",
      "Multi-platform optimization",
    ],
  },

  // Social Media (tiers)
  "content-social-starter": {
    id: "content-social-starter",
    name: "Social Starter",
    price: { monthly: 2500, currency: "USD" },
    bullets: ["3 platforms, 12 posts/month", "Engagement monitoring"],
  },
  "content-social-growth": {
    id: "content-social-growth",
    name: "Social Growth",
    price: { monthly: 4500, currency: "USD" },
    bullets: ["4 platforms, 30 posts/month", "Community management"],
  },
  "content-social-authority": {
    id: "content-social-authority",
    name: "Social Authority",
    price: { monthly: 8500, currency: "USD" },
    bullets: ["Unlimited platforms, 60+ posts/month", "Influencer outreach"],
  },

  // Podcast & Audio
  "content-podcast-starter": {
    id: "content-podcast-starter",
    name: "Podcast Starter Kit",
    price: { oneTime: 4000, monthly: 1500, currency: "USD" },
    bullets: ["Branding, hosting setup", "2 episodes/month (editing included)"],
  },
  "content-podcast-growth": {
    id: "content-podcast-growth",
    name: "Podcast Growth Pack",
    price: { monthly: 3500, currency: "USD" },
    bullets: ["Weekly production", "Distribution + guest outreach"],
  },
  "content-audio-branded-series": {
    id: "content-audio-branded-series",
    name: "Branded Audio Series",
    price: { oneTime: 7500, currency: "USD" },
    bullets: ["6-episode scripted series"],
  },

  // Accelerators & Compliance
  "content-accelerator-rapid": {
    id: "content-accelerator-rapid",
    name: "Rapid Content Creation Pack",
    priceNote: "+50% of base package rate",
    bullets: ["48-hour turnaround, priority queue"],
  },
  "content-accelerator-repurpose": {
    id: "content-accelerator-repurpose",
    name: "Content Repurposing System",
    price: { oneTime: 3500, monthly: 1500, currency: "USD" },
    bullets: [
      "Audit, multi-format adaptation, library organization",
    ],
  },
  "content-accelerator-brand-compliance": {
    id: "content-accelerator-brand-compliance",
    name: "Brand Consistency Monitoring",
    price: { monthly: 2500, currency: "USD" },
    bullets: ["Guideline enforcement, approval workflows, reporting"],
  },
};
export type AddOnId = keyof typeof ADDONS_CATALOG;