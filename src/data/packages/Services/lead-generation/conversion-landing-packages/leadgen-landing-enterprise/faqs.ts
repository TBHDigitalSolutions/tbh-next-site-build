const faqs = [
  {
    id: "unlimited-definition",
    question: "What does “unlimited” landing pages mean?",
    answer:
      "Submit as many requests as needed; we manage a prioritized backlog with reasonable weekly throughput. Large initiatives may be phased.",
  },
  {
    id: "personalization-prereqs",
    question: "What do we need for personalization?",
    answer:
      "Access to your CDP/MAP audiences or feature flags. We can start with URL/campaign rules and progress to deeper integrations.",
  },
  {
    id: "data-compliance",
    question: "Can you support privacy/compliance requirements?",
    answer:
      "Yes—consent mode, regional data routing, and DPA review are supported. Final compliance sign-off remains with your legal team.",
  },
  {
    id: "integration-scope",
    question: "Which enterprise integrations are included?",
    answer:
      "Typical stacks include Salesforce/Marketo/HubSpot, Segment, Tealium, and server-side tagging. Custom integrations can be scoped as needed.",
  },
] as const;

export default faqs;
