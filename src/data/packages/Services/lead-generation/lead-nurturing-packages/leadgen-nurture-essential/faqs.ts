const faqs = [
  {
    id: "platforms",
    question: "Which platforms are supported?",
    answer:
      "HubSpot and Marketo are primary. Mailchimp, Customer.io, and Klaviyo are supported with minor adjustments.",
  },
  {
    id: "copy",
    question: "Do you write all of the copy?",
    answer:
      "Essential includes light copywriting and editing. Full copy development can be added per sequence if needed.",
  },
  {
    id: "deliverability",
    question: "Do you handle deliverability and domain authentication?",
    answer:
      "We help verify SPF/DKIM/DMARC and set list hygiene best practices. Deep remediation is available as an add-on.",
  },
  {
    id: "cadence",
    question: "How often can we change sequences?",
    answer:
      "We recommend monthly iterations based on performance. Emergency updates (e.g., time-sensitive promos) can be expedited.",
  },
] as const;

export default faqs;
