// “What’s included” — grouped for clear section rendering
export const includesSections = [
  {
    title: "Brand System & Foundations",
    items: [
      { label: "Identity stewardship & brand guardrails", note: "Logo lockups, clear-space, misuse rules" },
      { label: "Component library in Figma", note: "Buttons, cards, banners, ad/email blocks" },
      { label: "Template system", note: "Social, lifecycle, paid, blog, presentation" },
      { label: "Color & type scales", note: "Accessible palettes + responsive type ramp" },
    ],
  },
  {
    title: "Design Production",
    items: [
      { label: "Unlimited requests (fair use)", note: "Prioritized queue; concurrent WIP allowed" },
      { label: "Standard turnaround 1–3 business days", note: "Complex projects milestone-scoped" },
      { label: "Rush/priority handling", note: "Same/next-day for critical launches" },
      { label: "Light motion/video edits", note: "Cutdowns, text/motion supers, aspect variants" },
    ],
  },
  {
    title: "Governance & QA",
    items: [
      { label: "Multi-step QA checklist", note: "Specs, margins, brand, contrast, export, links" },
      { label: "Senior art direction review", note: "Weekly work review with annotated feedback" },
      { label: "Accessibility checks (WCAG AA)", note: "Contrast ratios, reflow, alt text patterns" },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { label: "Dedicated design lead", note: "Single POC + roadmap ownership" },
      { label: "Weekly planning & standups", note: "Priorities, capacity, blockers" },
      { label: "Shared Slack channel", note: "Async clarifications, status, quick approvals" },
    ],
  },
  {
    title: "Delivery & Handover",
    items: [
      { label: "Source files & exports", note: "Figma source + PNG/SVG/WebP/PDF as needed" },
      { label: "Dev-ready handoff", note: "Zeplin/Figma specs, redlines, annotations" },
      { label: "Versioned asset library", note: "Naming conventions and release notes" },
    ],
  },
] as const;
