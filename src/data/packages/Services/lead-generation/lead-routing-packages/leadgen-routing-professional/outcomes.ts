export const outcomes = {
  title: "Expected outcomes (targets, not guarantees)",
  items: [
    { label: "Assignment latency", value: "≤ 60 seconds median" },
    { label: "Load variance", value: "≤ 10% volume variance across reps" },
    { label: "Hot lead response", value: "≤ 5 mins for priority segments" },
    { label: "Conversion efficiency", value: "+5–15% SQL rate vs. baseline" },
  ],
} as const;
