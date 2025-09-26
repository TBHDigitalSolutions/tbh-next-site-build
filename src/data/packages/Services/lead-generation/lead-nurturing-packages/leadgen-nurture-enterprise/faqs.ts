const faqs = [
  {
    id: "ai",
    question: "What does AI-powered personalization include?",
    answer:
      "We tailor subject lines, blocks, and offers using behavioral and firmographic signals. Models prioritize relevance while honoring compliance.",
  },
  {
    id: "integrations",
    question: "Which integrations are covered?",
    answer:
      "MAP (Marketo/HubSpot), CDP (Segment/Tealium), and data warehouse hooks are supported. Custom connectors can be scoped.",
  },
  {
    id: "governance",
    question: "How do you manage approvals and version control?",
    answer:
      "We maintain change logs, versioned journeys, and approval workflows with rollback points for auditability.",
  },
] as const;

export default faqs;
