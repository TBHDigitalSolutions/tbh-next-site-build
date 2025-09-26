const faqs = [
  {
    q: "Can you integrate with our CRM or enablement tool?",
    a: "Yes—Salesforce/HubSpot integrations and popular enablement platforms are supported; depth depends on access and licensing.",
  },
  {
    q: "How do permissions and version control work?",
    a: "We define roles and content ownership, set expirations, and maintain a single source of truth in the portal.",
  },
  {
    q: "Do you support localization for regions/verticals?",
    a: "Yes—industry and regional variants are managed with clear naming and governance; translation services can be added.",
  },
  {
    q: "What’s included in the monthly fee?",
    a: "Content refreshes, light new asset creation, analytics/readouts, and portal upkeep. Major initiatives can be scoped separately.",
  },
  {
    q: "What about security and NDAs?",
    a: "We’re comfortable with mutual NDAs, SSO/role-based access, and restricted shares for sensitive content.",
  },
] as const;

export default faqs;