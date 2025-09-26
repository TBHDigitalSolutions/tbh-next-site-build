// Enterprise Visual Design — canonical package object
// If you have a shared type, import it (path shown below). Otherwise, this
// module remains valid as plain data.
// import type { ServicePackage } from "../../../_types/packages.types";

import { includesSections } from "./includes";
import { outcomes } from "./outcomes";
import faqs from "./faqs";
import narrativeHtml from "./narrative";

const bundle /* : ServicePackage */ = {
  // Identity / routing
  id: "content-design-enterprise",
  service: "content", // keep consistent across this service family
  name: "Enterprise Visual Design System",
  tier: "Enterprise",

  // Marketing copy (card/hero)
  summary:
    "Enterprise-grade design production with brand governance, senior art direction, and rapid turnarounds across all channels.",
  valueProp:
    "Ship premium, on-brand creative at scale—every week—with a dedicated lead designer, systemized templates, and airtight QA.",

  // Taxonomy
  category: "Visual Design",
  tags: ["visual-design", "brand-system", "templates", "creative-ops"],

  // ICP / badges
  icp: "Scale-ups and enterprise teams with multi-channel creative needs (product, web, lifecycle, paid social).",
  badges: ["Premium"],
  popular: false,

  // Price teaser (used by PriceBlock / cards)
  price: { monthly: 9500, currency: "USD" },

  // Quick highlights (used by overviews/cards)
  highlights: [
    "Unlimited design requests (fair use)",
    "Senior art direction & review",
    "Brand system & component library",
    "Rush/priority turnarounds",
  ],

  // Detail sections consumed by templates/adapters
  includes: includesSections,
  outcomes,

  // Optional Pricing Matrix — template renders only if present & valid
  pricingMatrix: {
    columns: [{ id: "ent", label: "Enterprise", note: "Best for 3–6 teams" }],
    groups: [
      {
        id: "brand",
        label: "Brand System",
        rows: [
          { id: "identity", label: "Identity stewardship & guardrails", values: { ent: true } },
          { id: "components", label: "Design component library (Figma)", values: { ent: "Advanced" } },
          { id: "templates", label: "Multi-channel template system", values: { ent: true } },
        ],
      },
      {
        id: "production",
        label: "Design Production",
        rows: [
          { id: "requests", label: "Design requests", values: { ent: "Unlimited (fair use)" } },
          { id: "turnaround", label: "Standard turnaround", note: "Typical 1–3 business days", values: { ent: "1–3 days" } },
          { id: "rush", label: "Rush handling", values: { ent: "Same/next day" } },
          { id: "video-lite", label: "Light motion/video edits", values: { ent: "Limit" } },
        ],
      },
      {
        id: "governance",
        label: "Governance & QA",
        rows: [
          { id: "qa", label: "Multi-step QA checklist", values: { ent: true } },
          { id: "art-dir", label: "Senior art direction review", values: { ent: true } },
          { id: "a11y", label: "Accessibility checks (WCAG AA)", values: { ent: true } },
        ],
      },
      {
        id: "collab",
        label: "Collaboration",
        rows: [
          { id: "lead", label: "Dedicated design lead", values: { ent: true } },
          { id: "standups", label: "Weekly planning/standups", values: { ent: true } },
          { id: "stakeholders", label: "Multi-stakeholder intake flow", values: { ent: true } },
        ],
      },
      {
        id: "delivery",
        label: "Delivery & Handover",
        rows: [
          { id: "source", label: "Source files & exports", values: { ent: true } },
          { id: "handoff", label: "Dev-ready handoff (Zeplin/Figma specs)", values: { ent: true } },
          { id: "assets", label: "Asset library & versioning", values: { ent: true } },
        ],
      },
      {
        id: "support",
        label: "Support",
        rows: [
          { id: "slack", label: "Shared Slack channel", values: { ent: true } },
          { id: "hours", label: "Support hours", values: { ent: "Mon–Fri, 9–6 local" } },
          { id: "ops", label: "Quarterly design ops review", values: { ent: true } },
        ],
      },
      {
        id: "pricing",
        label: "Pricing",
        rows: [
          {
            id: "rate",
            label: "Monthly retainer",
            values: {
              ent: { money: { monthly: 9500, currency: "USD" }, note: "Cancel anytime · 30-day notice" },
            },
          },
        ],
      },
    ],
  },

  // Narrative HTML (no MDX at runtime)
  content: { html: narrativeHtml },

  // FAQs (template expects {question, answer})
  faq: {
    title: "Visual Design — Frequently asked questions",
    faqs,
  },
} as const;

export default bundle;
