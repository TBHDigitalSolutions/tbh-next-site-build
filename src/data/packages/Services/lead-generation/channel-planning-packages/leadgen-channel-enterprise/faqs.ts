const faqs = [
  {
    id: "dashboards",
    question: "Do you include dashboard tooling and licenses?",
    answer:
      "We configure dashboards using your existing BI stack (e.g., Looker/Data Studio/Power BI). If new licenses are needed, they’re procured separately.",
  },
  {
    id: "data-pipeline",
    question: "Can you integrate multiple CRMs and ad platforms?",
    answer:
      "Yes—within the scope of available APIs and your data warehouse. Complex data engineering may be quoted as a separate integration project.",
  },
  {
    id: "cadence",
    question: "What’s the collaboration cadence?",
    answer:
      "Weekly optimization calls, monthly executive summaries, and quarterly business reviews with roadmap adjustments.",
  },
  {
    id: "dependencies",
    question: "What dependencies should we expect?",
    answer:
      "Access to analytics, ad platforms, CRM/marketing automation, and data warehouse if applicable. We’ll provide a checklist during onboarding.",
  },
] as const;

export default faqs;
