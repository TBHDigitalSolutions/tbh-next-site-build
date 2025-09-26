export const includes = [
  {
    title: "Data, Identity & Measurement",
    items: [
      { label: "Cross-device identity strategies", note: "Hashed emails, first-party IDs, server-side tagging" },
      { label: "Attribution setup", note: "Model comparison, assisted conversion and holdout testing" },
      { label: "Data governance", note: "Consent, regional policies, audit logs" },
    ],
  },
  {
    title: "Segmentation & Personalization",
    items: [
      { label: "Unlimited segments", note: "Lifecycle, product, LTV tiers, churn risk, B2B firmographics" },
      { label: "Personalized dynamic ads", note: "Rules for creative/offer selection by segment" },
      { label: "Audience syncs", note: "MAP/CDP to ad platforms; scheduled refresh" },
    ],
  },
  {
    title: "Activation",
    items: [
      { label: "Cross-platform campaigns", note: "Google, Meta, LinkedIn, YouTube, TikTok as applicable" },
      { label: "Automation", note: "Budget & bid rules, frequency caps, suppression logic" },
      { label: "Creative pipeline", note: "Templates, variations, and motion assets coordination" },
    ],
  },
  {
    title: "Ops & Governance",
    items: [
      { label: "Dedicated specialist", note: "Weekly syncs & roadmap" },
      { label: "Executive dashboard", note: "Pipeline/revenue influence, CPA/ROAS, reach" },
      { label: "Experiment framework", note: "A/B/n, multivariate, audience holdouts" },
    ],
  },
] as const;
