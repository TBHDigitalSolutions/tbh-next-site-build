export const includes = [
  {
    title: "Intelligence & Optimization",
    items: [
      { label: "AI-assisted prioritization", note: "Combine intent, fit, engagement into score" },
      { label: "Dynamic rule optimization", note: "Auto-tune thresholds based on outcomes" },
      { label: "Drift & anomaly detection", note: "Alert on rule or data quality changes" },
    ],
  },
  {
    title: "Multi-Criteria Routing",
    items: [
      { label: "Capacity & availability", note: "Calendar, utilization, concurrency limits" },
      { label: "Account/owner protection", note: "Named accounts & relationship continuity" },
      { label: "Compliance filters", note: "Region, consent, industry restrictions" },
    ],
  },
  {
    title: "Platform & Data",
    items: [
      { label: "Custom integrations", note: "MAP/CDP/webhooks/data warehouse" },
      { label: "Real-time eventing", note: "Streaming updates; fallback to batch" },
      { label: "Audit trails & governance", note: "Versioned rules, approvals, change logs" },
    ],
  },
  {
    title: "Program Management",
    items: [
      { label: "Dedicated specialist", note: "Weekly optimization calls" },
      { label: "Executive dashboards", note: "Assignment, SLA, SQL & win outcomes" },
      { label: "Global support window", note: "Multi-region operating hours" },
    ],
  },
] as const;
