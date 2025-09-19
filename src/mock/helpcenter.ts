export interface FAQItem {
  faqItemQuestion: string;
  faqItemAnswer: string;
}

export interface FAQGroup {
  faqGroupTitle: string;
  faqGroupItems: FAQItem[];
}

export interface HelpCategory {
  title: string;
  faqGroups: FAQGroup[];
}

export interface HelpCenterData {
  categories: HelpCategory[];
}

const helpCenterData: HelpCenterData = {
  categories: [
    {
      title: "Getting Started",
      faqGroups: [
        {
          faqGroupTitle: "Creating an Account",
          faqGroupItems: [
            {
              faqItemQuestion: "How do I create an account?",
              faqItemAnswer: "Visit our signup page and enter your details.",
            },
          ],
        },
      ],
    },
    {
      title: "Technical Support",
      faqGroups: [
        {
          faqGroupTitle: "Troubleshooting",
          faqGroupItems: [
            {
              faqItemQuestion: "What should I do if my website crashes?",
              faqItemAnswer:
                "Try clearing your cache and restarting your browser. Contact support if the issue persists.",
            },
          ],
        },
      ],
    },
  ],
};

export default helpCenterData;
