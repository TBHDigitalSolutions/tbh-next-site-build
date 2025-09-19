// src/data/page/services-pages/marketing-services/pr-communications/index.ts

// --- Central data pools (adjust paths if your aliases differ) ---
import marketingTestimonials from "@/data/testimonials/marketing-services/marketing-services-testimonials";
import { marketingPackages } from "@/data/packages/marketing-services/marketing-packages";
import { marketingAddons } from "@/data/packages/marketing-services/marketing-addons";
import { marketingFeatured } from "@/data/packages/marketing-services/marketing-featured";
import { marketingServicesItems } from "@/data/portfolio/marketing-services/marketing-services-items";
import { marketingServicesFeatured } from "@/data/portfolio/marketing-services/marketing-services-featured";
import { marketingCases } from "@/data/caseStudies/marketing-services/marketing-services-cases";

// --- Shared selectors for central data sources ---
import { selectPortfolio, selectTestimonials, selectPackages } from "@/data/selectors";

// Use selectors to get filtered data for this specific service
const portfolioItems = selectPortfolio({ 
  hub: "marketing-services", 
  service: "pr-communications", 
  featured: true, 
  limit: 9 
});

const testimonials = selectTestimonials({ 
  hub: "marketing-services", 
  service: "pr-communications", 
  limit: 3 
});

const packages = selectPackages({ 
  hub: "marketing-services", 
  service: "pr-communications", 
  featured: true 
});

export default {
  kind: "service",
  slug: "pr-communications",

  /* ============================================================
     1) HERO
  ============================================================ */
  hero: {
    content: {
      eyebrow: "Marketing",
      title: "PR & Communications",
      subtitle:
        "Clear narrative, consistent messaging, and placements that matter. We ship announcements, bylines, and comms systems that compound brand trust.",
      primaryCta: { label: "Request PR strategy call", href: "/contact" },
      secondaryCta: { label: "See resources", href: "#resources" },
    },
    badges: ["Narrative Design", "Media Relations", "Crisis Comms", "Thought Leadership"],
  },

  /* ============================================================
     2) SEARCH (domain-specific search banner)
  ============================================================ */
  search: {
    placeholder: "Search press kits, announcement playbooks, and case studies…",
    index: "services",
    filters: { hub: "marketing-services", service: "pr-communications" },
  },

  /* ============================================================
     3) OVERVIEW INTRO (TwoColumnSection / Video)
  ============================================================ */
  twoColVideo: {
    variant: "text",
    title: "Own your story—then scale it",
    description:
      "We define a crisp narrative, build a newsroom foundation, and run a disciplined comms cadence: proactive announcements, reactive commentary, and executive visibility.",
    bullets: [
      "Positioning & message hierarchy",
      "Media list + outreach systems",
      "Executive thought leadership program",
    ],
    cta: { label: "Plan a 60-day PR sprint", href: "/book" },
  },

  /* ============================================================
     4) Services & Capabilities + Expandable Bullets (combined)
  ============================================================ */
  servicesAndCapabilitiesExpandable: {
    title: "What's included",
    description:
      "From narrative and messaging to press operations and executive comms.",
    pillars: [
      {
        id: "narrative",
        title: "Narrative & Messaging",
        description:
          "Positioning, proof, and soundbites that land across channels.",
        deliverables: [
          "Narrative doc (category, POV, hooks)",
          "Message map & objection handling",
          "Boilerplates & core claims",
        ],
      },
      {
        id: "press-ops",
        title: "Press Ops & Newsroom",
        description:
          "A repeatable engine for announcements and coverage.",
        deliverables: [
          "Media list & segmentation",
          "Newsroom/press kit setup",
          "Announcements runbook & calendar",
        ],
      },
      {
        id: "thought-leadership",
        title: "Executive Visibility",
        description:
          "Ghostwritten bylines, talks, and commentary that build authority.",
        deliverables: [
          "Angle bank & byline pipeline",
          "Speaker topics & outreach",
          "Social amplification system",
        ],
      },
      {
        id: "issues",
        title: "Issues & Crisis Communications",
        description:
          "Preparedness and response that protect trust when it counts.",
        deliverables: [
          "Risk inventory & scenarios",
          "Holding statements & Q&A",
          "War-room workflow & post-mortems",
        ],
      },
    ],
    // Quick links (non-expandable)
    bullets: [
      { label: "Press Kit", href: "#press-kit" },
      { label: "Media List & Outreach", href: "#media-outreach" },
      { label: "Announcements Runbook", href: "#announcements" },
      { label: "Executive Bylines", href: "#bylines" },
      { label: "Crisis Playbook", href: "#crisis" },
    ],
    // Expandable recognizers (formerly L3/L4 inline)
    expandable: [
      {
        id: "press-kit",
        title: "Press Kit & Newsroom",
        summary:
          "A single place for logos, boilerplate, bios, and brand guidelines—kept current.",
        details: [
          "Central newsroom page & asset library",
          "Logo/brand usage, bios, boilerplate",
          "Update workflow & ownership",
        ],
        cta: { label: "See newsroom blueprint", href: "/playbooks/newsroom-blueprint" },
        tag: "Foundations",
      },
      {
        id: "media-outreach",
        title: "Media List & Outreach System",
        summary:
          "Right reporters, right angles, right cadence—tracked and measurable.",
        details: [
          "Beat-aligned list & contact hygiene",
          "Personalized angles & outreach sequences",
          "Response handling & coverage tracking",
        ],
        tag: "Operations",
      },
      {
        id: "announcements",
        title: "Announcements & Launch Communications",
        summary:
          "From funding to features: plan, assets, and timing across PR + owned channels.",
        details: [
          "Announcement brief & approvals",
          "Press release & media notes",
          "Owned channel rollout (site, email, social)",
        ],
        tag: "Launch",
      },
      {
        id: "bylines",
        title: "Executive Bylines & Thought Leadership",
        summary:
          "Ghostwritten pieces with editorial standards—and a reliable publication pipeline.",
        details: [
          "Angle bank & outlet targeting",
          "Research/interview → draft → placement",
          "Repurposing for talks & social",
        ],
        tag: "Authority",
      },
      {
        id: "crisis",
        title: "Crisis & Issues Management",
        summary:
          "Pre-approved statements, escalation paths, and spokespeople ready.",
        details: [
          "Scenario planning & monitoring",
          "Holding statements & Q&A docs",
          "War-room comms & post-incident analysis",
        ],
        tag: "Risk",
      },
    ],
    defaultOpen: 1,
    analyticsId: "svc-pr-communications",
  },

  /* ============================================================
     5) Portfolio (visual examples ONLY) - Using selector data
     Choose variant: "web" | "video" | "demo"
  ============================================================ */
  portfolio: {
    variant: "web",
    title: "Selected PR & Communications Work",
    subtitle: "Newsrooms, announcement assets, and executive content systems.",
    items: portfolioItems?.length
      ? portfolioItems
      : (marketingServicesFeatured?.length
        ? marketingServicesFeatured
        : marketingServicesItems), // fallback chain
  },

  /* ============================================================
     6) Module Carousel (Resources & Case Studies) — includes CASE STUDIES
  ============================================================ */
  modules: {
    title: "Resources & Case Studies",
    subtitle: "Playbooks, templates, and deep dives.",
    items: [
      // Case studies (long-form)
      ...marketingCases.map((c: any) => ({
        title: c.title,
        description: c.summary,
        href: c.href || c.url || "/work",
        kind: "case-study",
        meta: c.metrics,
      })),
      // Practical resources
      {
        title: "Announcement Runbook",
        description: "A step-by-step checklist for PR launches and product news.",
        href: "/playbooks/announcement-runbook",
        kind: "playbook",
      },
      {
        title: "Crisis Comms Playbook",
        description: "Roles, templates, and escalation paths—before you need them.",
        href: "/playbooks/crisis-communications",
        kind: "playbook",
      },
      {
        title: "Press Kit Template",
        description: "A newsroom structure and assets list that reporters love.",
        href: "/playbooks/press-kit-template",
        kind: "template",
      },
    ],
  },

  /* ============================================================
     7) Pricing + Comparison
     (Starting prices; final after scope consultation)
  ============================================================ */
  pricing: {
    title: "Plans & Pricing",
    tiers: [
      {
        id: "foundation",
        name: "Foundation",
        price: 3000,
        period: "monthly",
        features: [
          "Narrative & message map",
          "Press kit & newsroom",
          "Monthly outreach",
        ],
        cta: { label: "Start", href: "/contact" },
        popular: true,
      },
      {
        id: "momentum",
        name: "Momentum",
        price: 5500,
        period: "monthly",
        features: [
          "Announcements program",
          "Executive bylines",
          "Bi-weekly outreach & reporting",
        ],
        cta: { label: "Scale", href: "/contact" },
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: "Custom",
        features: [
          "Always-on press office",
          "Issues/crisis readiness",
          "Spokesperson training",
        ],
        cta: { label: "Discuss", href: "/contact" },
      },
    ],
    comparison: {
      columns: ["Foundation", "Momentum", "Enterprise"],
      rows: [
        { label: "Narrative & Messaging", values: ["✓", "✓", "✓"] },
        { label: "Press Kit / Newsroom", values: ["✓", "✓", "✓"] },
        { label: "Announcements Program", values: ["—", "✓", "✓"] },
        { label: "Executive Thought Leadership", values: ["—", "✓", "✓"] },
        { label: "Issues/Crisis Readiness", values: ["—", "—", "✓"] },
      ],
    },
    disclaimer:
      "Pricing shown are starting points. Final pricing is determined after a scope consultation.",
  },

  /* ============================================================
     8) Packages & Add-Ons - Using selector data
  ============================================================ */
  packages: {
    title: "Packages & Add-Ons",
    subtitle: "Bundle common needs or add focused enhancements.",
    featured: packages?.featured ?? marketingFeatured ?? [],
    items: packages?.items ?? [
      ...(marketingPackages ?? []),
      ...(marketingAddons ?? []),
    ],
    cta: {
      label: "See full catalog",
      href: "/services/marketing-services/pr-communications/packages",
    },
  },

  /* ============================================================
     9) Testimonials - Using selector data
  ============================================================ */
  testimonials: {
    title: "What clients say",
    subtitle: "Clarity, consistency, and coverage that moves the needle.",
    data: testimonials?.length ? testimonials : marketingTestimonials ?? [],
  },

  /* ============================================================
     10) FAQs (buying/implementation objections only)
  ============================================================ */
  faqs: {
    title: "PR & Communications — FAQs",
    items: [
      {
        question: "Do you guarantee media placements?",
        answer:
          "We don't sell links or guarantee coverage. We build newsworthy angles, target the right outlets, and run a consistent outreach program that earns credible placements.",
      },
      {
        question: "Can you work with our internal team or agency?",
        answer:
          "Yes. We often operate as the strategy and operations layer, collaborating with internal comms or a creative partner.",
      },
      {
        question: "How do you measure PR impact?",
        answer:
          "We combine qualitative indicators (tier, headline quality, sentiment) with quantitative metrics (referral traffic, assisted conversions, branded search lift) tied to your goals.",
      },
    ],
  },

  /* ============================================================
     11) Final CTA
  ============================================================ */
  cta: {
    title: "Ready to scale a credible PR engine?",
    primaryCta: { label: "Book a consult", href: "/book" },
    secondaryCta: { label: "Request PR strategy call", href: "/contact" },
  },
} as const;