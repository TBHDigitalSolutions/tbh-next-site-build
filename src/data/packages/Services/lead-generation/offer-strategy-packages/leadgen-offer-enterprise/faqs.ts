const faqs = [
  {
    id: "unlimited-definition",
    question: "What does “unlimited” offer creation mean?",
    answer:
      "Submit as many requests as needed; we work a prioritized backlog with reasonable weekly throughput. Large initiatives may be phased with milestones.",
  },
  {
    id: "personalization-scope",
    question: "How deep is the personalization?",
    answer:
      "We can tailor offers by persona, industry, and lifecycle stage. Deeper real-time personalization may require CDP or MAP features you already own.",
  },
  {
    id: "compliance",
    question: "Do you support compliance for regulated industries?",
    answer:
      "Yes—review cycles embed compliance checks. Final legal review remains with your internal/legal teams.",
  },
  {
    id: "dependencies",
    question: "What are the dependencies?",
    answer:
      "Access to analytics, MAP/CRM, and design brand assets. For real-time routing/personalization, access to your CDP or feature toggles may be needed.",
  },
] as const;

export default faqs;
