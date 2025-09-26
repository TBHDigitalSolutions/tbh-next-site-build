const faqs = [
  {
    id: "unlimited",
    question: "What does “unlimited tests” mean?",
    answer:
      "You can submit as many test requests as you need. We manage a prioritized backlog and run multiple workstreams to deliver consistent throughput.",
  },
  {
    id: "personalization-prereqs",
    question: "What’s required for personalization testing?",
    answer:
      "Audience definitions via your CDP/MAP or feature flags. We can start with URL/campaign rules and evolve to deeper integrations.",
  },
  {
    id: "compliance",
    question: "Do you support privacy and compliance needs?",
    answer:
      "Yes—consent mode, regional data routing, and DPA review are supported. Final approval remains with your legal team.",
  },
  {
    id: "tooling",
    question: "Can you integrate with our existing experimentation platform?",
    answer:
      "Yes. We commonly work with enterprise tools or implement custom frameworks that align with your stack and security policies.",
  },
] as const;

export default faqs;
