const faqs = [
  {
    id: "predictive",
    question: "Is predictive scoring included?",
    answer:
      "Yes—where your MAP/CDP supports it, we enable predictive models. Otherwise we implement calibrated proxy models and roadmap a transition.",
  },
  {
    id: "segments",
    question: "Can models differ by segment?",
    answer:
      "Absolutely. We tailor weights and thresholds by persona, product line, and region where data volume allows.",
  },
  {
    id: "handoff",
    question: "How does routing work with scores?",
    answer:
      "We translate tiers into ownership, tasks, SLAs, and sequences so high-intent records are actioned quickly.",
  },
] as const;

export default faqs;
