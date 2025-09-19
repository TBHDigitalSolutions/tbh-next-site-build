// website/src/mock/contact/contactFaq.ts

export interface ContactFAQItem {
  question: string;
  answer: string;
}

export const contactFAQ: ContactFAQItem[] = [
  {
    question: "How soon can I expect a response?",
    answer: "We typically respond within the same business day, or within 24 hours.",
  },
  {
    question: "Do you offer free consultations?",
    answer:
      "Yes! We're happy to provide advice and tell you what we think you need—even if we’re not the right fit, we’ll point you in the right direction.",
  },
  {
    question: "What’s your pricing?",
    answer:
      "Browse and purchase services at our [e-commerce store](#), or schedule a consultation for custom pricing.",
  },
];
