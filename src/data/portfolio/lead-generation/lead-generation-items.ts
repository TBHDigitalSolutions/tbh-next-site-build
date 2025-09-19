import type { Project } from "@/data/portfolio";

/**
 * Lead Generation → canonical item list
 * Target: 6+ items (3 featured). Use unique, stable IDs.
 * Thumbnails are required for grid displays.
 */
export const leadGenerationItems: Project[] = [
  {
    id: "apex-solar-b2c-funnel",
    title: "Apex Solar B2C Lead Funnel",
    description:
      "Meta + Google lead ads to segmented quiz → instant quote LP → SDR handoff. Daily creative iteration and automated nurture.",
    category: "lead-generation",
    client: "Apex Solar",
    featured: true,
    priority: 1,
    tags: ["paid-ads", "quiz-funnel", "crm", "nurture"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/apex-solar-quiz",
      thumbnail: "/portfolio/leadgen/apex-solar-thumb.jpg",
      title: "Apex Solar Quiz Funnel"
    },
    href: "/case-studies/apex-solar-b2c-funnel",
    metrics: [
      { label: "CPL", value: "$18.40" },
      { label: "Booked Calls (30d)", value: "312" },
      { label: "Lead→Opp Rate", value: "26%" }
    ]
  },

  {
    id: "morrow-fitness-free-trial",
    title: "Morrow Fitness Free-Trial Lead Engine",
    description:
      "Landing page + SMS follow-up + schedule-assistant. UGC ads + geo lookalikes. Weekly CRO sweeps & offer testing.",
    category: "lead-generation",
    client: "Morrow Fitness",
    featured: true,
    priority: 2,
    tags: ["ugc", "sms", "landing-page", "cro", "meta-ads"],
    media: {
      type: "video",
      src: "/media/leadgen/morrow-trial-reel.mp4",
      poster: "/portfolio/leadgen/morrow-trial-poster.jpg",
      thumbnail: "/portfolio/leadgen/morrow-trial-thumb.jpg",
      alt: "Morrow Fitness trial campaign highlight reel"
    },
    href: "/case-studies/morrow-fitness-trial",
    metrics: [
      { label: "CPA", value: "-39%" },
      { label: "Show-Up Rate", value: "+21%" },
      { label: "Trial→Member", value: "34%" }
    ]
  },

  {
    id: "northview-mortgage-prequal",
    title: "NorthView Mortgage Pre-Qual Funnel",
    description:
      "Long-form lead form + pre-qualifier + doc request flow. Compliance-safe copy framework and realtor co-marketing.",
    category: "lead-generation",
    client: "NorthView Mortgage",
    featured: true,
    priority: 3,
    tags: ["google-ads", "long-form", "compliance", "email-nurture"],
    media: {
      type: "pdf",
      src: "/portfolio/leadgen/northview-prequal-journey.pdf",
      thumbnail: "/portfolio/leadgen/northview-prequal-thumb.jpg",
      alt: "NorthView pre-qualification journey PDF"
    },
    href: "/case-studies/northview-prequal-funnel",
    metrics: [
      { label: "CPL", value: "$42" },
      { label: "Doc Returns", value: "+58%" },
      { label: "Funded Loans (Q)", value: "+87" }
    ]
  },

  {
    id: "brightpath-linkedin-inbound",
    title: "BrightPath B2B LinkedIn Inbound",
    description:
      "Layered ICP targeting + conversation ads + doc lead magnets. SDR sequence + warm hand-raise router.",
    category: "lead-generation",
    client: "BrightPath",
    tags: ["linkedin-ads", "b2b", "sdr", "playbooks"],
    media: {
      type: "image",
      src: "/portfolio/leadgen/brightpath-campaign-matrix.jpg",
      thumbnail: "/portfolio/leadgen/brightpath-campaign-thumb.jpg",
      alt: "BrightPath LinkedIn campaign matrix"
    },
    href: "/case-studies/brightpath-linkedin-inbound",
    metrics: [
      { label: "Meetings/Month", value: "46" },
      { label: "SQL Rate", value: "31%" }
    ],
    priority: 6
  },

  {
    id: "heritage-dental-local-leadflow",
    title: "Heritage Dental Local Leadflow",
    description:
      "Local service lead engine: Google Ads + GBP optimization + call-only campaigns + missed-call text-back.",
    category: "lead-generation",
    client: "Heritage Dental",
    tags: ["local", "google-ads", "call-tracking", "automation"],
    media: {
      type: "image",
      src: "/portfolio/leadgen/heritage-call-dash.jpg",
      thumbnail: "/portfolio/leadgen/heritage-call-dash-thumb.jpg",
      alt: "Heritage Dental call tracking dashboard"
    },
    href: "/case-studies/heritage-dental-leadflow",
    metrics: [
      { label: "Cost/Call", value: "$23" },
      { label: "Booked Patients (60d)", value: "191" }
    ],
    priority: 7
  },

  {
    id: "swiftride-fleet-demo-booking",
    title: "SwiftRide Fleet Demo Booking System",
    description:
      "ABM landing set + retargeting + multi-step demo request. Calendly router and rep round-robin integration.",
    category: "lead-generation",
    client: "SwiftRide",
    tags: ["abm", "retargeting", "router", "calendar"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/swiftride-demo-router",
      thumbnail: "/portfolio/leadgen/swiftride-demo-thumb.jpg",
      title: "SwiftRide Demo Router"
    },
    href: "/case-studies/swiftride-demo-booking",
    metrics: [
      { label: "Demo Acceptance", value: "72%" },
      { label: "Speed-to-Lead", value: "2m 14s" }
    ],
    priority: 8
  }
];
