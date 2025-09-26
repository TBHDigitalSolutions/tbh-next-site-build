const faqs = [
  {
    id: "traffic",
    question: "How much traffic do we need?",
    answer:
      "As a rule of thumb, 500–1,000 qualified sessions per variant per month helps reach significance. We’ll right-size tests to your volume.",
  },
  {
    id: "tools",
    question: "Which tools do you use?",
    answer:
      "We can work with your stack (e.g., VWO, Optimizely, Convert, Webflow/HubSpot experiments) or implement lightweight testing via your CMS and GTM.",
  },
  {
    id: "scope",
    question: "What’s included each month?",
    answer:
      "Two experiments from hypothesis to analysis, minor UX/markup changes, analytics wiring, and reporting. Net-new templates or complex builds are scoped separately.",
  },
  {
    id: "duration",
    question: "How long does a test run?",
    answer:
      "Typically 2–4 weeks depending on traffic and effect size. We use stopping rules and sample-ratio checks to avoid false positives.",
  },
] as const;

export default faqs;
