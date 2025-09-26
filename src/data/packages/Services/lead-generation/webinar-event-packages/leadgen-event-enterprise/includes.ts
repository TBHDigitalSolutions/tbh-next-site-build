export const includes = [
  {
    title: "Program & Governance",
    items: [
      { label: "Quarterly roadmap", note: "Themes, personas, and KPI targets" },
      { label: "Compliance & approvals", note: "Brand, legal, and data policies" },
      { label: "SLAs & incident runbooks", note: "Escalation paths and uptime expectations" },
    ],
  },
  {
    title: "Acquisition & Experience",
    items: [
      { label: "Partner co-marketing", note: "Joint promos with sponsors or alliances" },
      { label: "Hybrid event tooling", note: "On-site capture + virtual streaming flows" },
      { label: "Accessibility & localization", note: "Captioning, time zones, language variants" },
    ],
  },
  {
    title: "Data & Integrations",
    items: [
      { label: "Custom CRM/MAP sync", note: "Field mapping, dedupe, consent, and UTM" },
      { label: "Attribution & BI feeds", note: "Data connectors for warehouse/BI tools" },
      { label: "Lead qualification workflows", note: "Scoring, routing, and SLA notifications" },
    ],
  },
  {
    title: "Optimization",
    items: [
      { label: "Weekly optimizations", note: "Promo mix, landing tests, conversion cadence" },
      { label: "Executive dashboards", note: "Pipeline influence, velocity, and ROI views" },
    ],
  },
] as const;
