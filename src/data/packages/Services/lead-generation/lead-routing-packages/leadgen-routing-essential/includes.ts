export const includes = [
  {
    title: "Setup & Rules",
    items: [
      { label: "Territory-based distribution", note: "Region/state/country filters" },
      { label: "Round-robin assignment", note: "Balanced rotation across active reps" },
      { label: "Basic SLA rules", note: "Time-to-first-touch targets & reminders" },
      { label: "OOO/holiday fallback", note: "Auto-reassign to next available rep" },
    ],
  },
  {
    title: "Integrations",
    items: [
      { label: "CRM wiring", note: "Salesforce or HubSpot owner/queue assignment" },
      { label: "Form/Inbound capture", note: "Web-to-lead, chat, and import feeds" },
      { label: "Notifications", note: "Email/Slack alerts on new lead" },
    ],
  },
  {
    title: "Governance & Reporting",
    items: [
      { label: "Audit fields", note: "Routed-by, timestamp, rule applied" },
      { label: "Monthly report", note: "Assignment latency, coverage, SLA breaches" },
      { label: "Playbook", note: "How routing works & how to request changes" },
    ],
  },
] as const;
