export const includes = [
  {
    title: "Modeling",
    items: [
      { label: "Segmented scoring models", note: "By persona, region, product line" },
      { label: "Predictive inputs", note: "Recency, frequency, intensity, fit; intent data where available" },
      { label: "Calibration", note: "Back-test vs. historical opps & win rates" },
    ],
  },
  {
    title: "Platform Integration",
    items: [
      { label: "MAP/CRM + CDP wiring", note: "Marketo/HubSpot + Salesforce; Segment/CDP if present" },
      { label: "Routing & SLA signals", note: "Hot lead alerts, task creation, sequences" },
      { label: "Reporting package", note: "Dashboards for lead tier mix, SQL rate, velocity" },
    ],
  },
  {
    title: "Optimization",
    items: [
      { label: "Monthly optimization", note: "Weights & thresholds; noise reduction" },
      { label: "Quarterly refresh", note: "Re-fit models; drift checks" },
      { label: "Sales enablement", note: "Playbooks & training for SDR/AE managers" },
    ],
  },
] as const;
