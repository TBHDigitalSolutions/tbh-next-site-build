const faqs = [
  {
    id: "server-side",
    question: "Do you support server-side tagging and CAPI?",
    answer:
      "Yes. We can work with server-side GTM and Meta CAPI gateways to improve data resilience and signal quality.",
  },
  {
    id: "regions",
    question: "Can this support multiple regions and brands?",
    answer:
      "Yes—unlimited segments, per-locale feeds, and region-specific policies are supported with clear governance.",
  },
  {
    id: "creative-automation",
    question: "What is included in creative automation?",
    answer:
      "Rules-based templates, dynamic fields, and feed-driven variants. Net-new production volume can be scoped.",
  },
] as const;

export default faqs;
