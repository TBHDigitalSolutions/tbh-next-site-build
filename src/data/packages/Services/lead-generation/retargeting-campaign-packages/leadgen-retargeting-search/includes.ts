export const includes = [
  {
    title: "Campaign Architecture",
    items: [
      { label: "RLSA setup", note: "Audience layering on search campaigns/ad groups" },
      { label: "Keyword strategy", note: "Core, competitor, and high-intent queries" },
      { label: "Negative keywords", note: "Waste reduction & brand protection" },
    ],
  },
  {
    title: "Bidding & Ads",
    items: [
      { label: "Smart bidding calibration", note: "tCPA/tROAS baselines with audience signals" },
      { label: "Ad copy testing", note: "Benefit/objection/proof variants in RSAs" },
      { label: "Extensions", note: "Sitelinks, callouts, structured snippets, lead forms" },
    ],
  },
  {
    title: "Measurement & Optimization",
    items: [
      { label: "Query mining", note: "Weekly search term reviews and sculpting" },
      { label: "Attribution & assisted conversions", note: "Cross-channel view where available" },
      { label: "Monthly report", note: "CPA/CPL, CVR, impression share, incrementality notes" },
    ],
  },
] as const;
