export const includes = [
  {
    title: "Experimentation Engine",
    items: [
      { label: "4 tests per month", note: "A/B and occasional multivariate where suitable" },
      { label: "Backlog management", note: "ICE/PIE scoring; impact-driven prioritization" },
      { label: "Cross-device coverage", note: "Desktop & mobile variants with QA" },
    ],
  },
  {
    title: "UX & Analytics",
    items: [
      { label: "Heatmaps & session replay", note: "Scroll/click maps, drop-off patterns" },
      { label: "Funnel analysis", note: "Identify leaks across steps; align with events" },
      { label: "Advanced reporting", note: "Effect size, power, guardrails, segment cuts" },
    ],
  },
  {
    title: "Enablement",
    items: [
      { label: "CRO implementation", note: "Merge winners; manage regressions" },
      { label: "Quarterly roadmap", note: "Themes, resourcing, dependencies" },
      { label: "Stakeholder workshops", note: "Hypothesis clinics & learnings review" },
    ],
  },
] as const;
