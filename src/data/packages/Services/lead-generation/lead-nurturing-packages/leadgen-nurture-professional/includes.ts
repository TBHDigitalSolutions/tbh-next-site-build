export const includes = [
  {
    title: "Program Design",
    items: [
      { label: "10+ multi-sequence programs", note: "Top/mid/bottom-funnel with branch logic" },
      { label: "Persona & stage mapping", note: "ICP/persona alignment across funnel stages" },
      { label: "Personalization rules", note: "Dynamic blocks by segment or intent" },
    ],
  },
  {
    title: "Multi-Channel Execution",
    items: [
      { label: "Email & SMS orchestration", note: "Compliance-aware send windows" },
      { label: "Social retargeting hooks", note: "Audiences for Meta/LinkedIn/Google" },
      { label: "Web personalization handoffs", note: "Pass UTM/ID for on-site experiences" },
    ],
  },
  {
    title: "Data & Segmentation",
    items: [
      { label: "Behavioral triggers", note: "Page depth, events, time-since, content themes" },
      { label: "Lifecycle states", note: "Subscriber → MQL → SQL → Opp" },
      { label: "Lead scoring handshakes", note: "Sync with scoring thresholds & SLAs" },
    ],
  },
  {
    title: "Analytics & Optimization",
    items: [
      { label: "Cohort reporting", note: "Performance by persona, stage, and offer" },
      { label: "A/B testing", note: "Subject, cadence, layout, CTA" },
      { label: "Bi-weekly reviews", note: "Hypotheses, changes, impact" },
    ],
  },
] as const;
