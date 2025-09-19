// website/src/mock/ServiceCardData.ts

export interface ServiceCard {
  title: string;
  description: string;
  highlights: string[];
}

export interface ServiceCardSection {
  sectionTitle: string;
  sectionDescription: string;
  services: ServiceCard[];
}

const serviceCardData: ServiceCardSection = {
  sectionTitle: "Transform The Way You Do Business",
  sectionDescription:
    "At TBH Digital Solutions, we’re here to revolutionize how you connect, engage, and grow. We build powerful digital experiences that move your business forward.",
  services: [
    {
      title: "Web Development",
      description: "Dynamic, responsive, and scalable websites built with modern tech.",
      highlights: [
        "Custom sites & web apps",
        "E-commerce (Shopify, WooCommerce)",
        "SEO & performance",
        "CMS (WordPress, Headless)",
        "Responsive & mobile-first"
      ]
    },
    {
      title: "Content Creation",
      description: "Engaging content that drives connection and action.",
      highlights: [
        "Blogs & articles (SEO)",
        "Video production",
        "Product photos & visuals",
        "Social media content",
        "Email copy & design"
      ]
    },
    {
      title: "Marketing Automation",
      description: "Smart automation to grow and engage your audience.",
      highlights: [
        "CRM setup & integration",
        "Email & drip campaigns",
        "Lead gen & funnels",
        "Behavior-based triggers",
        "Analytics & tracking"
      ]
    }
  ]
};

export default serviceCardData;
