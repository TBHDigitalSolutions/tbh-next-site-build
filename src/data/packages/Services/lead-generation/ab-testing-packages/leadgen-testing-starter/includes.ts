export const includes = [
  {
    title: "Program Setup",
    items: [
      { label: "A/B testing framework", note: "Governance, hypotheses, prioritization model" },
      { label: "Analytics wiring", note: "Events/conversions in GA4 or equivalent via GTM" },
      { label: "Backlog & cadence", note: "Test ideas ranked by impact/effort & confidence" },
    ],
  },
  {
    title: "Execution (Monthly)",
    items: [
      { label: "2 A/B tests", note: "Focus on forms, CTAs, headlines, proof, layout" },
      { label: "QA & launch", note: "Cross-device checks, event validation, guardrails" },
      { label: "Monitoring & analysis", note: "Interim checks; post-test readout with next steps" },
    ],
  },
  {
    title: "Reporting",
    items: [
      { label: "Performance report", note: "CVR, lift, sample sizes, time to significance" },
      { label: "Recommendations", note: "Merge winners; feed learnings back to backlog" },
    ],
  },
] as const;
