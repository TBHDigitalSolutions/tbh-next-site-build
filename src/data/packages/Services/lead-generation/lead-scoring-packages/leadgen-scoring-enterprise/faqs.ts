const faqs = [
  {
    id: "ai",
    question: "Do you build custom AI models?",
    answer:
      "We can implement MAP/CDP predictive features or design custom models using your event and CRM data, subject to data volume and governance.",
  },
  {
    id: "realtime",
    question: "How real-time is the scoring?",
    answer:
      "With supported stacks we recalc within minutes via webhooks/streaming; otherwise we schedule frequent batches.",
  },
  {
    id: "governance",
    question: "How do you manage model drift and bias?",
    answer:
      "We monitor feature stability and outcome alignment, conduct periodic audits, and document change logs and approvals.",
  },
  {
    id: "integrations",
    question: "Which integrations are supported?",
    answer:
      "Salesforce, HubSpot, Marketo, Pardot, Segment/CDPs, and custom data layers. We’ll align with your security and compliance requirements.",
  },
] as const;

export default faqs;
