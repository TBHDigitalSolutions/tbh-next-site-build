// src/data/page/main-pages/contact/contactfaq.ts
// FAQ section (title + items). Pure data only.

import type { FAQSection } from "@/data/page/main-pages/contact/types";

export const contactFAQ = {
  title: "Frequently Asked Questions",
  items: [
    {
      id: "faq-response-time",
      question: "How soon can I expect a response?",
      answer:
        "We typically respond within the same business day, or within 24 hours.",
    },
    {
      id: "faq-free-consult",
      question: "Do you offer free consultations?",
      answer:
        "Yes! We're happy to provide advice and tell you what we think you need—even if we’re not the right fit, we’ll point you in the right direction.",
    },
    {
      id: "faq-pricing",
      question: "What’s your pricing?",
      answer:
        "Browse and purchase services at our e-commerce store, or schedule a consultation for custom pricing.",
      // If your FAQ component supports markdown/links, you can include:
      // answer:
      //   "Browse and purchase services at our [e-commerce store](https://shop.company.com), or schedule a consultation for custom pricing.",
    },
  ],
} satisfies FAQSection;

export default contactFAQ;
