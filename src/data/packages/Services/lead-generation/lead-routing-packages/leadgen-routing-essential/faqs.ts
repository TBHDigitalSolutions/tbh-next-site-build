const faqs = [
  {
    id: "tools",
    question: "Which CRMs are supported?",
    answer: "Salesforce and HubSpot are supported out-of-the-box. Others may be scoped as an add-on.",
  },
  {
    id: "changes",
    question: "How do we request routing changes?",
    answer: "Submit a ticket with new rules/territories. Simple changes land within 1–3 business days.",
  },
  {
    id: "fairness",
    question: "How do you keep distribution fair?",
    answer:
      "We use a round-robin rotation and guardrails to prevent double-assignments and account-owner conflicts.",
  },
] as const;

export default faqs;
