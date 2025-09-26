const faqs = [
  {
    q: "Who provides the technical details?",
    a: "We partner with PM/engineering for accuracy; we can attend sprint reviews and maintain a product doc backlog.",
  },
  {
    q: "Can you write code samples?",
    a: "Yes—language/frameworks agreed at kickoff; we provide runnable snippets where feasible.",
  },
  {
    q: "Do you manage a docs site?",
    a: "We can author in your tooling (Markdown, MDX, headless CMS) and follow your CI/CD. Site ownership remains with your team.",
  },
  {
    q: "How do you handle versioning?",
    a: "We track changes by release and flag breaking changes with migration notes.",
  },
  {
    q: "What about security disclosures?",
    a: "We follow your policy; embargoed details are handled under NDA.",
  },
] as const;

export default faqs;