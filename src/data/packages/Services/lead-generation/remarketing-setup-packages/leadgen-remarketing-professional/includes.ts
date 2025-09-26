export const includes = [
  {
    title: "Tracking & Data",
    items: [
      { label: "Enhanced conversions / CAPI", note: "Google Enhanced Conversions & Meta CAPI where eligible" },
      { label: "Event taxonomy & QA", note: "Spec, implement, and validate event parameters" },
    ],
  },
  {
    title: "Audiences",
    items: [
      { label: "8+ audience segments", note: "Time-based, depth-based, product/category viewers, cart/lead abandon" },
      { label: "Exclusions & frequency caps", note: "Reduce fatigue and protect brand" },
      { label: "Lookalikes / similar", note: "Optional expansion audiences for scale tests" },
    ],
  },
  {
    title: "Campaigns & Creatives",
    items: [
      { label: "Multi-platform campaigns", note: "Google, Meta; optional LinkedIn/TikTok" },
      { label: "Dynamic remarketing", note: "Feed integration (ecomm or content catalog)" },
      { label: "Creative testing plan", note: "Headline/visual/offer matrix; 2–3 tests per month" },
    ],
  },
  {
    title: "Optimization & Reporting",
    items: [
      { label: "Bi-weekly optimizations", note: "Bids, budgets, audiences, placements" },
      { label: "Attribution review", note: "Channel overlap and assisted conversions" },
      { label: "Dashboard", note: "Always-on performance view + monthly readout" },
    ],
  },
] as const;
