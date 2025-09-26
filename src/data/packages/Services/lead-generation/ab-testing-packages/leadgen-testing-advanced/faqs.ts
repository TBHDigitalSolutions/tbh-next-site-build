const faqs = [
  {
    id: "sample-size",
    question: "How do you determine sample size and test length?",
    answer:
      "We estimate using baseline CVR, desired lift (MDE), traffic, and power. We adjust designs to fit your volumes and use sequential monitoring.",
  },
  {
    id: "mvt",
    question: "Do you run multivariate tests?",
    answer:
      "Yes when traffic supports it and variants are independent enough to justify the design. Otherwise we sequence focused A/Bs.",
  },
  {
    id: "dependencies",
    question: "What team involvement is needed?",
    answer:
      "We handle UX and implementation in your CMS/LP tooling. Engineering is only required for custom components or gated integrations.",
  },
  {
    id: "governance",
    question: "How do you prevent false positives?",
    answer:
      "We enforce SRM checks, pre-registered hypotheses, and stopping rules; we report effect sizes and confidence intervals—not just p-values.",
  },
] as const;

export default faqs;
