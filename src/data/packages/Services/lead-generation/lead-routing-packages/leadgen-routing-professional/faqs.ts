const faqs = [
  {
    id: "skills",
    question: "How do you maintain skill tags?",
    answer:
      "We maintain a source-of-truth picklist for skills/segments and sync it to routing rules with monthly reviews.",
  },
  {
    id: "capacity",
    question: "Can we cap leads per rep per day?",
    answer:
      "Yes. We set daily caps with catch-up logic so fairness remains over the week while preventing overload.",
  },
  {
    id: "testing",
    question: "Can we A/B test routing rules?",
    answer:
      "Yes—Professional supports controlled experiments to compare rule outcomes without impacting SLAs.",
  },
] as const;

export default faqs;
