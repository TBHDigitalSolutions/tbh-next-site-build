// src/mock/integrationsData.ts

export interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string; 
  link: string;
}

export const integrations: Integration[] = [
  {
    id: "google-ads",
    name: "Google Ads",
    description:
      "Reach your target audience with optimized PPC campaigns on Google Search & Display Network.",
    logo: "/pages/main/products-and-services/integrations/google-icons/ads/googleads.svg",
    link: "https://ads.google.com/",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Track website performance and user behavior with real-time analytics.",
    logo: "/pages/main/products-and-services/integrations/google-icons/analytics/googleanalytics.svg",
    link: "https://analytics.google.com/",
  },
  {
    id: "google-tag-manager",
    name: "Google Tag Manager",
    description:
      "Simplify tag management across marketing tools without modifying code.",
    logo: "/pages/main/products-and-services/integrations/google-icons/analytics/googletagmanager.svg",
    link: "https://tagmanager.google.com/",
  },
  {
    id: "facebook-ads",
    name: "Facebook Ads",
    description:
      "Run powerful ad campaigns on Facebook & Instagram to increase engagement.",
    logo: "/pages/main/products-and-services/integrations/branding-icons/black/meta.svg",
    link: "https://www.facebook.com/business/ads",
  },
  {
    id: "facebook-pixel",
    name: "Facebook Pixel",
    description: "Track and optimize ad performance using pixel-based audience targeting.",
    logo: "/pages/main/products-and-services/integrations/branding-icons/black/meta.svg",
    link: "https://www.facebook.com/business/tools/meta-pixel",
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads",
    description: "Generate high-quality B2B leads with targeted LinkedIn advertising.",
    logo: "/pages/main/products-and-services/integrations/social-icons/black/LinkedIn_black.svg",
    link: "https://business.linkedin.com/marketing-solutions/ads",
  },
  {
    id: "tiktok-ads",
    name: "TikTok Ads",
    description:
      "Engage with Gen Z & Millennial audiences through short-form video advertising.",
    logo: "/pages/main/products-and-services/integrations/social-icons/black/tiktok.svg",
    link: "https://ads.tiktok.com/",
  },
  {
    id: "hubspot",
    name: "HubSpot CRM",
    description:
      "All-in-one CRM for sales automation, email marketing, and customer tracking.",
    logo: "/pages/main/products-and-services/integrations/services-icons/black/hubspot.svg",
    link: "https://www.hubspot.com/",
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description:
      "Email marketing & automation platform to nurture leads and grow revenue.",
    logo: "/pages/main/products-and-services/integrations/integrations-icons/black/mailchimp.svg",
    link: "https://mailchimp.com/",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Automate workflows between thousands of apps without coding.",
    logo: "/pages/main/products-and-services/integrations/integrations-icons/black/zapier.svg",
    link: "https://zapier.com/",
  },
];
