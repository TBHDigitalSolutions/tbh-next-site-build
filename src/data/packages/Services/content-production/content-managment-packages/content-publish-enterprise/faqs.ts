const faqs = [
  {
    q: "How do you handle permissions and governance?",
    a: "We configure roles, approval paths, and change control aligned to your compliance needs.",
  },
  {
    q: "Do you support headless/enterprise CMSs?",
    a: "Yes—Adobe/Drupal/headless stacks with CI/CD, webhooks, and DAM/CDN integrations are supported.",
  },
  {
    q: "How is international publishing managed?",
    a: "Locale structures, hreflang, translation workflows, and region-based scheduling are included; translation services can be added.",
  },
  {
    q: "What does the dedicated team provide?",
    a: "A publishing lead plus operators who manage the calendar, approvals, and launch windows; optional on-call for high-stakes releases.",
  },
  {
    q: "What SLAs are typical?",
    a: "We define SLAs by request type and channel at kickoff; emergency paths and blackout windows are documented.",
  },
] as const;

export default faqs;