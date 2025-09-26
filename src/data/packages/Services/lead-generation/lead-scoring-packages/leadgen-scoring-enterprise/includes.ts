export const includes = [
  {
    title: "Advanced Modeling",
    items: [
      { label: "Custom algorithms", note: "Feature engineering from events, content, firmographics" },
      { label: "AI-assisted prediction", note: "Model blends or MAP/CDP predictive sources" },
      { label: "Multi-product models", note: "Separate weights by product/SKU" },
    ],
  },
  {
    title: "Real-Time Scoring",
    items: [
      { label: "Streaming updates", note: "Near real-time recalculation via MAP/CDP/webhooks" },
      { label: "Anomaly & drift detection", note: "Alerts for data quality and model health" },
      { label: "Experimentation hooks", note: "A/B score thresholds to optimize SLAs" },
    ],
  },
  {
    title: "Operations & Governance",
    items: [
      { label: "Routing intelligence", note: "Territory, availability, specialization" },
      { label: "Compliance & privacy", note: "Consent, regional rules, data retention" },
      { label: "Executive dashboards", note: "Tier mix, velocity, win-rate by segment" },
    ],
  },
  {
    title: "Program Management",
    items: [
      { label: "Dedicated strategist", note: "Quarterly roadmap and change control" },
      { label: "Knowledge base", note: "Model docs, feature catalog, usage playbooks" },
      { label: "Training & enablement", note: "Manager and rep onboarding sessions" },
    ],
  },
] as const;
