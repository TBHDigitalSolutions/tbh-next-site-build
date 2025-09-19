import type { Project } from "@/data/portfolio";

/**
 * Content Production → canonical item list
 * Target: 6+ items (3 featured). Use unique, stable IDs.
 * Thumbnails are required for grid displays.
 */
export const contentProductionItems: Project[] = [
  {
    id: "atlas-blog-engine",
    title: "Atlas Blog Engine (12-Month Program)",
    description:
      "SEO-mapped editorial calendar, briefs, drafting, and on-page optimization. Weekly cadence with pillar/cluster architecture.",
    category: "content-production",
    client: "Atlas Workspaces",
    featured: true,
    priority: 1,
    tags: ["blog", "editorial-calendar", "seo-content", "pillar-cluster"],
    media: {
      type: "image",
      src: "/portfolio/content/atlas-blog-engine-cover.jpg",
      thumbnail: "/portfolio/content/atlas-blog-engine-thumb.jpg",
      alt: "Atlas blog engine content plan overview"
    },
    href: "/case-studies/atlas-blog-engine",
    metrics: [
      { label: "Organic Sessions (YoY)", value: "+186%" },
      { label: "Top-10 Keywords", value: "+312" },
      { label: "Publishing Cadence", value: "4 posts/mo" }
    ]
  },

  {
    id: "lumen-social-pack",
    title: "Lumen Social Content Pack",
    description:
      "Monthly short-form content system (scripts, b-roll pulls, captions, hooks) for TikTok/IG/YT Shorts. Creator toolkits + brand guardrails.",
    category: "content-production",
    client: "Lumen Labs",
    featured: true,
    priority: 2,
    tags: ["short-form", "social", "ugc-toolkit", "scripts"],
    media: {
      type: "video",
      src: "/media/content/lumen-reel.mp4",
      poster: "/portfolio/content/lumen-reel-poster.jpg",
      thumbnail: "/portfolio/content/lumen-reel-thumb.jpg",
      alt: "Lumen short-form highlights"
    },
    href: "/case-studies/lumen-social-pack",
    metrics: [
      { label: "Watch-Through Rate", value: "38%" },
      { label: "Follower Growth (90d)", value: "+24k" },
      { label: "Monthly Assets", value: "45+" }
    ]
  },

  {
    id: "haven-product-photography",
    title: "Haven Product Photography System",
    description:
      "Studio + lifestyle pipeline: lighting recipes, scene guides, PSD/RAW handoff, and export presets for PDP, marketplace, and ads.",
    category: "content-production",
    client: "Haven Home",
    featured: true,
    priority: 3,
    tags: ["photography", "pdp", "marketplace", "brand-guidelines"],
    media: {
      type: "image",
      src: "/portfolio/content/haven-product-grid.jpg",
      thumbnail: "/portfolio/content/haven-product-grid-thumb.jpg",
      alt: "Haven product photography grid"
    },
    href: "/case-studies/haven-product-photography",
    metrics: [
      { label: "Time-to-Publish", value: "-42%" },
      { label: "Asset Acceptance (MP)", value: "99%" }
    ]
  },

  {
    id: "aurora-brand-story-kit",
    title: "Aurora Brand Story Kit",
    description:
      "Foundational copy blocks (mission, POV, value props), tone-of-voice matrix, CTA library, and on-brand examples for teams.",
    category: "content-production",
    client: "Aurora Finance",
    tags: ["copywriting", "brand-voice", "cta-library", "enablement"],
    media: {
      type: "pdf",
      src: "/portfolio/content/aurora-story-kit.pdf",
      thumbnail: "/portfolio/content/aurora-story-kit-thumb.jpg",
      alt: "Aurora brand story kit PDF"
    },
    href: "/case-studies/aurora-brand-story-kit",
    metrics: [
      { label: "Time to First Draft", value: "-55%" },
      { label: "Approval Rounds", value: "-2 cycles" }
    ],
    priority: 6
  },

  {
    id: "northpeak-howto-series",
    title: "NorthPeak ‘How-To’ Knowledge Series",
    description:
      "Documentation-grade tutorials: outlines, step screenshots, and GIFs. Published to docs + blog with glossary and schema.",
    category: "content-production",
    client: "NorthPeak",
    tags: ["documentation", "tutorials", "schema", "knowledge-base"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/northpeak-knowledge",
      thumbnail: "/portfolio/content/northpeak-knowledge-thumb.jpg",
      title: "NorthPeak Knowledge Base"
    },
    href: "/case-studies/northpeak-howto-series",
    metrics: [
      { label: "Support Tickets", value: "-29%" },
      { label: "Avg. Time on Page", value: "5:12" }
    ],
    priority: 7
  },

  {
    id: "evergreen-email-content-bank",
    title: "Evergreen Email Content Bank",
    description:
      "Reusable email content blocks (hooks, bodies, PS, banners) tagged by journey stage and persona. Figma + HTML partials.",
    category: "content-production",
    client: "Evergreen",
    tags: ["email", "content-library", "personas", "figma-to-html"],
    media: {
      type: "image",
      src: "/portfolio/content/evergreen-email-library.jpg",
      thumbnail: "/portfolio/content/evergreen-email-library-thumb.jpg",
      alt: "Evergreen email content library"
    },
    href: "/case-studies/evergreen-email-bank",
    metrics: [
      { label: "Production Time", value: "-47%" },
      { label: "CTR (avg.)", value: "+22%" }
    ],
    priority: 8
  }
];
