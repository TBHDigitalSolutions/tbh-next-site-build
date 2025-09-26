// Template expects {question, answer}
const faqs = [
  {
    id: "scope-unlimited",
    question: "What does “unlimited requests (fair use)” actually mean?",
    answer:
      "Submit as many tickets as you like; we work through the prioritized queue. Most items ship within 1–3 business days. Larger initiatives (e.g., full campaign systems) are scoped with milestones.",
  },
  {
    id: "rush",
    question: "Do you support rush or same-day requests?",
    answer:
      "Yes—rush handling is included. Same/next-day is typical for small assets. For complex items we’ll propose a phased delivery plan so critical pieces land first.",
  },
  {
    id: "brand-system",
    question: "Will you maintain our brand system and component library?",
    answer:
      "Absolutely. We maintain a versioned component library in Figma, keep guardrails current, and expand templates as your channels evolve.",
  },
  {
    id: "handoff",
    question: "How do you hand off to engineering or external partners?",
    answer:
      "We provide organized source files, dev-ready specs (Zeplin/Figma), export presets, and annotations so implementation is fast and unambiguous.",
  },
  {
    id: "accessibility",
    question: "Do you check for accessibility?",
    answer:
      "Yes—contrast, reflow, typography sizes, and alt-text patterns are part of our QA checklist. We target WCAG AA for marketing surfaces.",
  },
  {
    id: "cancel",
    question: "Is the retainer flexible? Can we pause or cancel?",
    answer:
      "You can cancel anytime with 30-day notice. Pauses are fine for seasonal programs; we’ll preserve your libraries and restart quickly.",
  },
] as const;

export default faqs;
