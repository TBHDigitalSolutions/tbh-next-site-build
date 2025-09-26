export const includes = [
  {
    title: "Design & Modeling",
    items: [
      { label: "Scoring framework", note: "Behavioral, demographic/firmographic points" },
      { label: "Sales-ready definition (SRL/SQL)", note: "Score thresholds + disqualification rules" },
      { label: "Negative scoring", note: "Role, region, inactivity, competitor email" },
    ],
  },
  {
    title: "Implementation",
    items: [
      { label: "MAP/CRM wiring", note: "HubSpot/Marketo/Pardot + Salesforce or similar" },
      { label: "Point attribution events", note: "Downloads, visits, email engagement" },
      { label: "Automation", note: "Owner assignment, status changes, alerts" },
    ],
  },
  {
    title: "Enablement & Tuning",
    items: [
      { label: "Playbook", note: "How scores are calculated and used by SDR/AE" },
      { label: "Monthly optimization", note: "Adjust weights; remove noisy signals" },
      { label: "Quality control", note: "Sample checks vs. closed-won/closed-lost" },
    ],
  },
] as const;
