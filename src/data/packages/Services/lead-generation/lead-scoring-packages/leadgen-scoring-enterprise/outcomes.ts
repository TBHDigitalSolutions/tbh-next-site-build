export const outcomes = {
  title: "Expected outcomes (targets, not guarantees)",
  items: [
    { label: "Lead response SLAs", value: "Hot in ≤ 3 min; Warm in ≤ 30 min" },
    { label: "SQL rate improvement", value: "+20–40% over 90–120 days" },
    { label: "Routing accuracy", value: "≥ 90% correct team/territory on first pass" },
    { label: "Model reliability", value: "Automated drift alerts & quarterly re-fit" },
  ],
} as const;
