export const includes = [
  {
    title: "Campaign Setup",
    items: [
      { label: "Account & campaign structure", note: "Networks, inventory filters, brand safety" },
      { label: "Tracking alignment", note: "UTM conventions and conversion goals mapped" },
      { label: "Frequency capping & exclusions", note: "Protect brand and reduce ad fatigue" },
    ],
  },
  {
    title: "Creatives",
    items: [
      { label: "Ad sizes & variations", note: "Responsive + key IAB sizes; headline/visual variants" },
      { label: "Offer testing", note: "Hook, value prop, and CTA experiments" },
    ],
  },
  {
    title: "Audiences",
    items: [
      { label: "Core remarketing pools", note: "All visitors, product/content viewers, abandoners" },
      { label: "Recency windows", note: "7/14/30 day lists; depth-based segments" },
    ],
  },
  {
    title: "Optimization & Reporting",
    items: [
      { label: "Weekly optimizations", note: "Placements, bids, budget, creative rotation" },
      { label: "Monthly report", note: "Reach, CTR, CPC/CPM, assisted conversions, next actions" },
    ],
  },
] as const;
