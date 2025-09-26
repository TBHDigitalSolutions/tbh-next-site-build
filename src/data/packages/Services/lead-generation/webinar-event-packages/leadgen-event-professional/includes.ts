export const includes = [
  {
    title: "Program Management",
    items: [
      { label: "Monthly event calendar", note: "Topics, speakers, and formats" },
      { label: "Run-of-show templates", note: "Repeatable SOPs and checklists" },
    ],
  },
  {
    title: "Acquisition",
    items: [
      { label: "Multi-channel promo", note: "Email, social, partner co-marketing" },
      { label: "Registration UX tests", note: "Headline/CTA form experiments" },
      { label: "Paid media coordination", note: "Optional add-on; we’ll align tracking" },
    ],
  },
  {
    title: "Automation & CRM",
    items: [
      { label: "Reminder & no-show flows", note: "Pre/post sequences with branching" },
      { label: "Lead scoring", note: "Attendee intent scoring pushed to CRM" },
      { label: "Attribution tagging", note: "Source/medium/campaign consistency" },
    ],
  },
  {
    title: "Optimization & Reporting",
    items: [
      { label: "Bi-weekly reviews", note: "Sign-ups, show-up, CPL, pipeline signals" },
      { label: "Quarterly summary", note: "Trend analysis and topic pipeline" },
    ],
  },
] as const;
