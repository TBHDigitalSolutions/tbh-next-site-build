import type { Project } from "@/data/portfolio";

/**
 * Marketing Services → canonical item list
 * Target: 6+ items (3 featured). Use unique, stable IDs.
 * Thumbnails are required for grid displays.
 */
export const marketingServicesItems: Project[] = [
  {
    id: "orion-omnichannel-launch",
    title: "Orion Fitness Omnichannel Launch",
    description:
      "90-day go-to-market sprint: paid social + search + email + landing funnel. UGC + creator mix, ROAS-first iteration loop.",
    category: "marketing-services",
    client: "Orion Fitness",
    featured: true,
    priority: 1,
    tags: ["omnichannel", "UGC", "paid-social", "search", "email"],
    media: {
      type: "video",
      src: "/media/marketing/orion-launch.mp4",
      poster: "/portfolio/marketing/orion-launch-poster.jpg",
      thumbnail: "/portfolio/marketing/orion-launch-thumb.jpg",
      alt: "Orion launch campaign highlight reel"
    },
    href: "/case-studies/orion-omnichannel-launch",
    metrics: [
      { label: "ROAS", value: "4.8x" },
      { label: "CPL", value: "-37%" },
      { label: "New Customers", value: "+2,140" }
    ]
  },

  {
    id: "celeris-lifecycle-email",
    title: "Celeris SaaS Lifecycle Email System",
    description:
      "Full lifecycle: trial → onboarding → activation → expansion. Playbooks, segmentation, and event-based triggers.",
    category: "marketing-services",
    client: "Celeris",
    featured: true,
    priority: 2,
    tags: ["email", "crm", "automation", "lifecycle"],
    media: {
      type: "pdf",
      src: "/portfolio/marketing/celeris-lifecycle-playbook.pdf",
      thumbnail: "/portfolio/marketing/celeris-lifecycle-thumb.jpg",
      alt: "Celeris lifecycle email playbook PDF"
    },
    href: "/case-studies/celeris-lifecycle-email",
    metrics: [
      { label: "Activation Rate", value: "+22%" },
      { label: "Churn", value: "-15%" },
      { label: "Expansion MRR", value: "+11%" }
    ]
  },

  {
    id: "novamart-paid-social-sprint",
    title: "NovaMart Paid Social Sprint",
    description:
      "Creative testing matrix for Meta/TikTok: hooks × angles × formats. Weekly iteration and budget reallocation.",
    category: "marketing-services",
    client: "NovaMart",
    featured: true,
    priority: 3,
    tags: ["paid-social", "creative-testing", "tiktok", "meta-ads"],
    media: {
      type: "image",
      src: "/portfolio/marketing/novamart-creatives-board.jpg",
      thumbnail: "/portfolio/marketing/novamart-creatives-thumb.jpg",
      alt: "NovaMart creative testing matrix board"
    },
    href: "/case-studies/novamart-paid-social-sprint",
    metrics: [
      { label: "CPA", value: "-41%" },
      { label: "CTR", value: "+68%" },
      { label: "Scaling Budget", value: "+300%" }
    ]
  },

  {
    id: "harborbank-abm-b2b",
    title: "HarborBank B2B ABM Program",
    description:
      "1:1 and 1:few ABM with industry pages, LinkedIn sequence, and SDR enablement toolkit.",
    category: "marketing-services",
    client: "HarborBank",
    tags: ["ABM", "B2B", "linkedin", "sales-enablement"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/harborbank-abm-hub",
      thumbnail: "/portfolio/marketing/harborbank-abm-thumb.jpg",
      title: "HarborBank ABM Microsite"
    },
    href: "/case-studies/harborbank-abm",
    metrics: [
      { label: "Meetings Booked", value: "+74" },
      { label: "Pipeline", value: "$6.2M" }
    ],
    priority: 6
  },

  {
    id: "verda-brand-awareness-ugc",
    title: "Verda Skincare UGC Awareness",
    description:
      "UGC pipeline + creator briefs + whitelisting. Always-on awareness with monthly freshness targets.",
    category: "marketing-services",
    client: "Verda Skincare",
    tags: ["UGC", "whitelisting", "awareness", "creators"],
    media: {
      type: "video",
      src: "/media/marketing/verda-ugc-montage.mp4",
      poster: "/portfolio/marketing/verda-ugc-poster.jpg",
      thumbnail: "/portfolio/marketing/verda-ugc-thumb.jpg",
      alt: "Verda UGC montage video"
    },
    href: "/case-studies/verda-ugc-awareness",
    metrics: [
      { label: "Reach (90d)", value: "12.7M" },
      { label: "Engagement Rate", value: "4.3%" }
    ],
    priority: 7
  },

  {
    id: "rivendell-hubspot-revops",
    title: "Rivendell HubSpot RevOps Foundation",
    description:
      "HubSpot CRM + pipeline + lead scoring + attribution. Clean data → reliable reporting → smarter spend.",
    category: "marketing-services",
    client: "Rivendell",
    tags: ["hubspot", "crm", "attribution", "lead-scoring", "revops"],
    media: {
      type: "image",
      src: "/portfolio/marketing/rivendell-dashboards.jpg",
      thumbnail: "/portfolio/marketing/rivendell-dashboards-thumb.jpg",
      alt: "Rivendell HubSpot dashboards"
    },
    href: "/case-studies/rivendell-revops-foundation",
    metrics: [
      { label: "MQL → SQL", value: "+29%" },
      { label: "Attribution Coverage", value: "92%" }
    ],
    priority: 8
  }
];
