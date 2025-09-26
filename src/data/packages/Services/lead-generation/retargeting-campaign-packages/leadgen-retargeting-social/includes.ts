export const includes = [
  {
    title: "Foundation",
    items: [
      { label: "Pixel & event validation", note: "Meta Pixel/CAPI, LinkedIn Insight Tag" },
      { label: "Consent alignment", note: "Respect regional consent modes where applicable" },
    ],
  },
  {
    title: "Audiences",
    items: [
      { label: "Site + engagement audiences", note: "Website visitors, video viewers, page engagers" },
      { label: "Exclusions & frequency", note: "Recent converters, employees; caps by segment" },
    ],
  },
  {
    title: "Creatives",
    items: [
      { label: "Social-native assets", note: "Square/vertical formats, motion variants where available" },
      { label: "Messaging matrix", note: "Problem/solution, proof, offer/CTA rotation" },
    ],
  },
  {
    title: "Ops & Reporting",
    items: [
      { label: "Cross-platform coordination", note: "Meta + LinkedIn (others optional)" },
      { label: "Bi-weekly optimizations", note: "Bids, budgets, placements, audience splits" },
      { label: "Monthly report", note: "KPIs + insights + next steps" },
    ],
  },
] as const;
