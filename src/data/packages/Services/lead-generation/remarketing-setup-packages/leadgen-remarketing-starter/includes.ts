export const includes = [
  {
    title: "Tracking & Foundations",
    items: [
      { label: "Pixel / tag installation", note: "Google, Meta; via GTM where available" },
      { label: "Consent & privacy alignment", note: "Respects regional policies; basic CMP handshake" },
      { label: "Event mapping", note: "Standard events (ViewContent, AddToCart, Lead)" },
    ],
  },
  {
    title: "Audiences",
    items: [
      { label: "3 core audience segments", note: "All visitors, product/content viewers, abandoners" },
      { label: "Lookback windows", note: "7–30 day recency by channel" },
    ],
  },
  {
    title: "Campaigns & Creatives",
    items: [
      { label: "Google & Meta remarketing campaigns", note: "Standard placements; conservative bids" },
      { label: "Baseline creative set", note: "Static images + copy variants (supplied brand assets)" },
    ],
  },
  {
    title: "Reporting",
    items: [
      { label: "Monthly report", note: "Impressions, reach, CTR, CPC/CPM, assisted conversions" },
      { label: "Change log", note: "Optimizations and next steps" },
    ],
  },
] as const;
