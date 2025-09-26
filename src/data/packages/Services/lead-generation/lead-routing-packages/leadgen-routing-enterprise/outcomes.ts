export const outcomes = {
  title: "Expected outcomes (targets, not guarantees)",
  items: [
    { label: "Assignment latency", value: "≤ 30 seconds median" },
    { label: "SQL rate lift", value: "+10–25% vs. pre-program benchmark" },
    { label: "Routing accuracy", value: "≥ 90% correct team/territory on first pass" },
    { label: "Utilization balance", value: "Stable capacity with minimal overloads" },
  ],
} as const;
