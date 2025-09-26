const faqs = [
  {
    id: "ai",
    question: "What does AI-powered routing mean here?",
    answer:
      "We combine intent, fit, and engagement signals to score leads and bias routing toward the highest-propensity rep or team while honoring rules.",
  },
  {
    id: "integrations",
    question: "Can you integrate with our data warehouse or CDP?",
    answer:
      "Yes. We support MAP/CDP/warehouse/webhooks for scoring inputs and write-backs for audit and analytics.",
  },
  {
    id: "governance",
    question: "How are changes approved and tracked?",
    answer:
      "All rule changes are versioned with owner, timestamp, and reason. We keep rollback points and a change log.",
  },
] as const;

export default faqs;
