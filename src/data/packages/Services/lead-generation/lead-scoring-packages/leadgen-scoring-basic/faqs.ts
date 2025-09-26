const faqs = [
  {
    id: "tools",
    question: "Which tools do you support?",
    answer:
      "We work with HubSpot, Marketo, Pardot, and similar MAPs, integrated with CRMs like Salesforce or HubSpot CRM.",
  },
  {
    id: "data",
    question: "What data do you need to start?",
    answer:
      "Historic opportunities by stage, recent campaign data, and access to your MAP/CRM fields for configuration.",
  },
  {
    id: "handoff",
    question: "How will sales use the scores?",
    answer:
      "We configure views, alerts, and lists for SDR/AE workflows and include a one-pager playbook with thresholds and next steps.",
  },
] as const;

export default faqs;
