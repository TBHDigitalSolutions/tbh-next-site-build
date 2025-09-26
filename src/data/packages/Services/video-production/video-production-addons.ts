// /src/data/packages/video-production/video-production-addons.ts
// Video Production add-ons - a la carte enhancements that bolt onto any tier

import type { AddOn } from "../_types/packages.types";

export const videoProductionAddOns: AddOn[] = [
  {
    id: "video-social-content-pack",
    service: "video",
    name: "Social Media Content Pack", 
    description: "Comprehensive social media video content optimized for maximum platform engagement.",
    deliverables: [
      { label: "10 × 30-second social media posts", detail: "Platform-optimized engaging content" },
      { label: "5 × 1-minute feature videos", detail: "Longer-form social content" },
      { label: "30 × 15-second vertical reels", detail: "Instagram, TikTok, YouTube Shorts ready" },
      { label: "Platform-specific cutdowns", detail: "16:9, 9:16, 1:1 aspect ratios" },
      { label: "Custom thumbnails & caption templates", detail: "Engagement-optimized assets" }
    ],
    billing: "monthly",
    price: { monthly: 4500 },
    pairsBestWith: ["Essential", "Professional"],
    popular: true
  },
  {
    id: "video-ads-campaign-pack",
    service: "video",
    name: "Video Ads Campaign Package", 
    description: "Performance-optimized video ads designed for testing and scaling paid campaigns.",
    deliverables: [
      { label: "6 × 15-30s ad variations", detail: "Different hooks and call-to-actions" },
      { label: "Multi-platform ad formatting", detail: "Facebook, Instagram, TikTok, LinkedIn, YouTube" },
      { label: "A/B testing variations", detail: "Headline swaps and thumbnail alternates" },
      { label: "Ad compliance formatting", detail: "Platform guideline adherence" }
    ],
    billing: "one-time",
    price: { setup: 5500 },
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "video-ecommerce-product-kit",
    service: "video",
    name: "E-Commerce Product Video Kit", 
    description: "Conversion-focused product videos designed specifically for online retailers.",
    deliverables: [
      { label: "3 × 60-second product demo videos", detail: "Detailed product demonstrations" },
      { label: "6 × 30-second lifestyle cutdowns", detail: "Social media and advertising versions" },
      { label: "10 × 15-second ad teasers", detail: "Quick conversion-focused clips" },
      { label: "360° product showcase videos", detail: "Interactive product views" },
      { label: "Marketplace optimization", detail: "Amazon, Shopify, Walmart formats" }
    ],
    billing: "one-time",
    price: { setup: 6000 },
    dependencies: ["Per product line"],
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "video-event-content-pack",
    service: "video",
    name: "Event Content Package",
    description: "Comprehensive event documentation and promotion package for maximum ROI.",
    deliverables: [
      { label: "Event highlight reel", detail: "2-3 minute recap video" },
      { label: "Speaker/session edits", detail: "Up to 5 sessions, 5-10 minutes each" },
      { label: "Social media snippets", detail: "10 clips from key event moments" },
      { label: "Attendee testimonial videos", detail: "3-5 interviews with participants" },
      { label: "Branded motion graphics", detail: "Event-specific titles and graphics" }
    ],
    billing: "one-time",
    price: { setup: 7500 },
    dependencies: ["Event filming costs billed separately"],
    pairsBestWith: ["Professional", "Enterprise"],
    popular: true
  },
  {
    id: "video-thought-leadership-series",
    service: "video",
    name: "Thought Leadership Series",
    description: "Executive positioning content for authority building and industry recognition.",
    deliverables: [
      { label: "6 × 2-3 minute expert insight videos", detail: "Batch-filmed for efficiency" },
      { label: "12 × social pull-out clips", detail: "15-30 second highlights" },
      { label: "Branded intros/outros", detail: "Professional series branding" },
      { label: "YouTube/LinkedIn optimization", detail: "Thumbnails and metadata support" }
    ],
    billing: "one-time",
    price: { setup: 5000 },
    dependencies: ["Per 6-episode series"],
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "video-training-modules",
    service: "video",
    name: "Training & Onboarding Module Pack",
    description: "Professional training content for employee, partner, or customer education.",
    deliverables: [
      { label: "5 × 3-5 minute training modules", detail: "Structured educational content" },
      { label: "Animated graphics & callouts", detail: "Step-by-step visual guides" },
      { label: "Voiceover narration included", detail: "Professional voice talent" },
      { label: "LMS-compatible formats", detail: "SCORM, MP4, and streaming ready" }
    ],
    billing: "one-time",
    price: { setup: 6500 },
    dependencies: ["Per training series"],
    pairsBestWith: ["Professional", "Enterprise"]
  }
];

export default videoProductionAddOns;