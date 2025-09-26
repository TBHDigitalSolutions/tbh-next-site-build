export const includes = [
  {
    title: "Advanced Rules",
    items: [
      { label: "Skill-based assignment", note: "Product specialization, language, segment" },
      { label: "Geo/territory optimization", note: "Zip/postal, state, country, radius" },
      { label: "Priority queues", note: "Hot/MKTQ/partner sources before standard" },
      { label: "Load balancing", note: "Volume caps per rep/day with catch-up logic" },
    ],
  },
  {
    title: "Availability & Quality",
    items: [
      { label: "Working hours awareness", note: "Time zone calendars; after-hours queues" },
      { label: "OOO detection", note: "Auto-skip and reassign on unavailability" },
      { label: "Duplicate checks", note: "Email/domain match and account-owner protection" },
    ],
  },
  {
    title: "Analytics & Ops",
    items: [
      { label: "Routing analytics", note: "Latency, fairness, conversions by rule" },
      { label: "A/B routing experiments", note: "Test thresholds and rule variants" },
      { label: "Change management", note: "Versioned rule sets & rollback notes" },
    ],
  },
] as const;
