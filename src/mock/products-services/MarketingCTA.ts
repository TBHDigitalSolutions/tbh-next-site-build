// website/src/mock/products-services/MarketingCTA.ts

export interface MarketingCTAData {
  title: string;
  description: string;
  label: string;
  labelItems: string[];
  highlights: string[];
  ctaButton: {
    text: string;
    link: string;
  };
}

export const marketingCTA: MarketingCTAData = {
  title: "Optimize Your Digital Marketing Stack",
  description:
    "We integrate your CRM, analytics, and ad platforms to create a seamless marketing workflow.",
  label: "Why Choose Us?",
  labelItems: [
    "Data-Driven Strategy",
    "End-to-End Campaign Management",
    "Seamless CRM & Ad Integrations",
  ],
  highlights: [
    "Google Ads & Analytics Setup",
    "Advanced Pixel & Tag Integrations",
    "CRM & Automation System Configuration",
  ],
  ctaButton: {
    text: "Optimize My Marketing →",
    link: "/contact",
  },
};
