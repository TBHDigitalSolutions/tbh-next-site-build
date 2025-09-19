// src/data/page/services-pages/marketing-services/strategy-consulting/index.ts

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
  service: "strategy-consulting", 
  featured: true, 
  limit: 9 
});

const testimonials = selectTestimonials({ 
  hub: "marketing-services", 
  service: "strategy-consulting", 
  limit: 3 
});

const packages = selectPackages({ 
  hub: "marketing-services", 
  service: "strategy-consulting", 
  featured: true 
});

export default {
  kind: "service",
  slug: "strategy-consulting",

  /* ============================================================
     1) HERO
  ============================================================ */
  hero: {
    content: {
      eyebrow: "Marketing",
      title: "Strategy & Consulting",
      subtitle:
        "Clarity on where to play and how to win. We align ICP, narrative, channels, and measurement—then guide execution with disciplined rituals.",
      primaryCta: { label: "Book a strategy consult", href: "/contact" },
      secondaryCta: { label: "See resources", href: "#resources" },
    },
    badges: ["GTM Strategy", "Positioning", "Experimentation", "Attribution"],
  },

  /* ============================================================
     2) SEARCH (domain-specific search banner)
  ============================================================ */
  search: {
    placeholder: "Search playbooks, GTM frameworks, and case studies…",
    index: "services",
    filters: { hub: "marketing-services", service: "strategy-consulting" },
  },

  /* ============================================================
     3) OVERVIEW INTRO (TwoColumnSection / Video)
  ============================================================ */
  twoColVideo: {
    variant: "text",
    title: "Strategy that ships, not slides that sit",
    description:
      "We define ICP and message hierarchy, prioritize channels, and set a measurement plan. Then we work the plan—weekly—to compound results.",
    bullets: [
      "Clear ICP & narrative",
      "Channel & motion prioritization",
      "Roadmap with measurable objectives",
    ],
    cta: { label: "Start a 6-week GTM sprint", href: "/book" },
  },

  /* ============================================================
     4) Services & Capabilities + Expandable Bullets (combined)
  ============================================================ */
  servicesAndCapabilitiesExpandable: {
    title: "What's included",
    description:
      "From market clarity to operating cadence—built to guide execution.",
    pillars: [
      {
        id: "icp-narrative",
        title: "ICP & Narrative",
        description: "Who we serve, what they need, and why we're different.",
        deliverables: [
          "ICP & segment prioritization",
          "Message hierarchy & proof",
          "Value props by segment",
        ],
      },
      {
        id: "gtm-architecture",
        title: "GTM Architecture",
        description: "Choose motions and channels that match your reality.",
        deliverables: [
          "Motion/channel model",
          "Route-to-market & resourcing",
          "12-week roadmap & milestones",
        ],
      },
      {
        id: "ops-cadence",
        title: "Operating Cadence",
        description: "Rituals that move work forward and surface learnings.",
        deliverables: [
          "Weekly growth standup",
          "Experiment backlog & rituals",
          "Quarterly review & reset",
        ],
      },
      {
        id: "measurement",
        title: "Measurement & Attribution",
        description: "Decide fast with trusted data and crisp definitions.",
        deliverables: [
          "North-star & ladder metrics",
          "Attribution approach & UTMs",
          "Role-based dashboards",
        ],
      },
    ],
    // Quick links (non-expandable)
    bullets: [
      { label: "GTM Sprint", href: "#gtm-sprint" },
      { label: "Positioning Workshop", href: "#positioning" },
      { label: "Experiment Program", href: "#experimentation" },
      { label: "Attribution & Reporting", href: "#attribution" },
      { label: "Quarterly Planning", href: "#qbr" },
    ],
    // Expandable recognizers (formerly L3/L4 inline)
    expandable: [
      {
        id: "gtm-sprint",
        title: "6-Week GTM Sprint",
        summary:
          "Fast path to clarity and action: ICP, narrative, channels, and a 90-day plan.",
        details: [
          "Week 1–2: Research interviews & synthesis",
          "Week 3–4: Narrative, motions, and channel picks",
          "Week 5–6: Roadmap, metrics, and kick-off",
        ],
        cta: { label: "Plan a sprint", href: "/book" },
        tag: "GTM",
      },
      {
        id: "positioning",
        title: "Positioning & Narrative Workshop",
        summary:
          "Sharpen the story; align teams on claims, proof, and objection handling.",
        details: [
          "Jobs-to-be-done and alternatives",
          "Message map & soundbites",
          "Outcome-proof library",
        ],
        tag: "Positioning",
      },
      {
        id: "experimentation",
        title: "Experimentation Program",
        summary:
          "Rituals and tooling to ideate, run, and learn—without chaos.",
        details: [
          "Backlog & scoring model",
          "Run cadence & QA standards",
          "Learning archive & roll-outs",
        ],
        tag: "Growth",
      },
      {
        id: "attribution",
        title: "Attribution & Reporting",
        summary:
          "Right-sized approach: last-touch, modeled, or hybrid with finance alignment.",
        details: [
          "UTM standards & cost/rev syncs",
          "Role-based dashboards",
          "KPI guardrails & alerts",
        ],
        tag: "Analytics",
      },
      {
        id: "qbr",
        title: "Quarterly Planning & Review",
        summary:
          "Reset focus and budgets based on what moved the metric last quarter.",
        details: [
          "Scorecard & post-mortems",
          "Roadmap refresh & resourcing",
          "Exec readout & approvals",
        ],
        tag: "Ops",
      },
    ],
    defaultOpen: 1,
    analyticsId: "svc-strategy-consulting",
  },

  /* ============================================================
     5) Portfolio (visual examples ONLY) - Using selector data
     Choose variant: "web" | "video" | "demo"
  ============================================================ */
  portfolio: {
    variant: "web",
    title: "Selected Strategy Work",
    subtitle: "GTM blueprints, narrative systems, and path-to-scale playbooks.",
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
    subtitle: "Frameworks, templates, and deep dives.",
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
        title: "GTM Scorecard",
        description: "Weekly health across demand, conversion, and retention.",
        href: "/playbooks/gtm-scorecard",
        kind: "template",
      },
      {
        title: "Experiment Backlog Pack",
        description: "Prioritization matrix + experiment spec + readout template.",
        href: "/playbooks/experiment-backlog-pack",
        kind: "template",
      },
      {
        title: "Narrative Workshop Kit",
        description: "Exercises and artifacts to align on positioning and proof.",
        href: "/playbooks/narrative-workshop",
        kind: "playbook",
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
        id: "advisory",
        name: "Advisory",
        price: 2500,
        period: "monthly",
        features: [
          "Weekly advisory sessions",
          "Scorecard & priorities",
          "Asynchronous reviews",
        ],
        cta: { label: "Start", href: "/contact" },
        popular: true,
      },
      {
        id: "sprint",
        name: "GTM Sprint",
        price: 6000,
        period: "project",
        features: [
          "6-week sprint (ICPs, narrative, plan)",
          "Channel & motion prioritization",
          "Kick-off enablement",
        ],
        cta: { label: "Plan sprint", href: "/contact" },
      },
      {
        id: "operating-partner",
        name: "Operating Partner",
        price: "Custom",
        features: [
          "Embedded cadence & reviews",
          "Cross-functional facilitation",
          "Executive alignment & readouts",
        ],
        cta: { label: "Discuss", href: "/contact" },
      },
    ],
    comparison: {
      columns: ["Advisory", "GTM Sprint", "Operating Partner"],
      rows: [
        { label: "Cadence", values: ["Weekly", "6 weeks", "Custom"] },
        { label: "Outputs", values: ["Scorecard & guidance", "Full GTM plan", "Ongoing leadership"] },
        { label: "Team Enablement", values: ["Light", "Workshop", "Deep/Embedded"] },
        { label: "Reporting", values: ["Core KPIs", "Sprint outcomes", "Exec dashboards"] },
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
    subtitle: "Bundle common strategic needs or add focused enhancements.",
    featured: packages?.featured ?? marketingFeatured ?? [],
    items: packages?.items ?? [
      ...(marketingPackages ?? []),
      ...(marketingAddons ?? []),
    ],
    cta: {
      label: "See full catalog",
      href: "/services/marketing-services/strategy-consulting/packages",
    },
  },

  /* ============================================================
     9) Testimonials - Using selector data
  ============================================================ */
  testimonials: {
    title: "What clients say",
    subtitle: "Clarity, focus, and momentum.",
    data: testimonials?.length ? testimonials : marketingTestimonials ?? [],
  },

  /* ============================================================
     10) FAQs (buying/implementation objections only)
  ============================================================ */
  faqs: {
    title: "Strategy & Consulting — FAQs",
    items: [
      {
        question: "Can you work alongside our in-house team and agencies?",
        answer:
          "Yes. We often serve as the integrator—providing strategy, prioritization, and operating cadence while collaborating with channel owners.",
      },
      {
        question: "How quickly can we see impact?",
        answer:
          "The 6-week sprint yields immediate clarity and a 90-day plan. Advisory or operating-partner models drive compounding gains via consistent execution.",
      },
      {
        question: "Do you provide hands-on execution?",
        answer:
          "We can pair strategy with execution through our other service lines (content, paid, web). Otherwise, we enable your team or partner agency.",
      },
    ],
  },

  /* ============================================================
     11) Final CTA
  ============================================================ */
  cta: {
    title: "Ready to align strategy with execution?",
    primaryCta: { label: "Book a consult", href: "/book" },
    secondaryCta: { label: "Start a GTM sprint", href: "/contact" },
  },
} as const;