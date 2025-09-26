const faqs = [
  {
    id: "traffic-reqs",
    question: "How much traffic do we need for effective A/B testing?",
    answer:
      "As a rule of thumb, 500–1,000 qualified sessions per page/month helps reach significance. We’ll right-size tests to your volume.",
  },
  {
    id: "tools",
    question: "What tools do you use for behavior analytics?",
    answer:
      "We commonly use Hotjar or Microsoft Clarity for heatmaps and session replays; we can integrate with your licensed tools.",
  },
  {
    id: "monthly-scope",
    question: "What’s included in the monthly optimization?",
    answer:
      "Hypothesis creation, design/UX tweaks, test setup, monitoring, analysis, and merging winning variants. Net-new pages beyond the six are scoped separately.",
  },
  {
    id: "dev-involvement",
    question: "Will our dev team be needed?",
    answer:
      "Most changes occur in the CMS/LP builder. Engineering is only needed for custom components or gated integrations.",
  },
] as const;

export default faqs;
