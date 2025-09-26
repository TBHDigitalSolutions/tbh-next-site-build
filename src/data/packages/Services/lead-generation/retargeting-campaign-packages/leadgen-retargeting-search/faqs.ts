const faqs = [
  {
    id: "requirements",
    question: "What do we need before starting?",
    answer:
      "A functioning Google Ads account, conversion tracking, and remarketing audiences (we can create/configure these during onboarding).",
  },
  {
    id: "rlsa",
    question: "Do you create new search campaigns or layer audiences on existing ones?",
    answer:
      "Both options are supported. We can create dedicated RLSA campaigns or layer audiences at the campaign/ad group level.",
  },
  {
    id: "spend",
    question: "Is media spend included?",
    answer:
      "No. Media is billed directly by Google Ads. Our monthly fee covers strategy, management, and optimization.",
  },
] as const;

export default faqs;
