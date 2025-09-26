const faqs = [
  {
    id: "unlimited",
    question: "What does 'unlimited events' mean?",
    answer:
      "We plan and execute as many events as your roadmap requires with fair-use expectations (generally up to 4 concurrently active). Very large or simultaneous productions may require a separate SOW.",
  },
  {
    id: "integrations",
    question: "Can you integrate with our data warehouse and consent tooling?",
    answer:
      "Yes—custom connectors for HubSpot/Salesforce/Marketo, reverse ETL, and consent frameworks can be scoped and implemented.",
  },
  {
    id: "on-site",
    question: "Do you support on-site capture for hybrid events?",
    answer:
      "Yes—we coordinate badge scans/QR capture and sync registrations and attendance back to your systems.",
  },
] as const;

export default faqs;
