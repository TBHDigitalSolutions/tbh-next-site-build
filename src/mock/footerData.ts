// src/mock/footerData.ts

/**
 * TBH Digital Solutions Footer Data
 * Production-safe: single export, columns + legal + (optional) fullWidthBox
 */

type FooterLinkItem = {
  label: string;
  link: string;
  icon?: string;
};

type FooterColumn =
  | {
      title: string;
      content: FooterLinkItem[];
      contactInfo?: never;
      socialLinks?: never;
    }
  | {
      title: "Contact Us";
      contactInfo: { icon: string; label: string; href: string }[];
      socialLinks: { icon: string; link: string }[];
      content?: never;
    };

type LegalLink = {
  label: string;
  href: string;
  external?: boolean;
};

type FooterData = {
  columns: FooterColumn[];
  fullWidthBox?: { content: string | null }; // kept for backward compatibility
  legal: {
    copyright: string;
    links: LegalLink[];
  };
};

export const footerData: FooterData = {
  columns: [
    {
      title: "Support",
      content: [
        { label: "Help Center", link: "/support/help-center", icon: "FaQuestionCircle" },
        { label: "FAQ", link: "/support/faq", icon: "FaLifeRing" },
        { label: "Contact Support", link: "/contact", icon: "FaEnvelope" }
      ]
    },
    {
      title: "Resources",
      content: [
        { label: "About Us", link: "/about", icon: "FaInfoCircle" },
        { label: "Services", link: "/products-services", icon: "FaTools" },
        { label: "Sitemap", link: "/utility/sitemap", icon: "FaSitemap" }
      ]
    },
    {
      title: "Terms & Policies",
      content: [
        { label: "Privacy Policy", link: "/privacy-policy", icon: "FaShieldAlt" },
        { label: "Terms & Conditions", link: "/terms-conditions", icon: "FaFileContract" },
        { label: "Terms of Service", link: "/terms-services", icon: "FaFileContract" }
      ]
    },
    {
      title: "Contact Us",
      contactInfo: [
        {
          icon: "FaMapMarkerAlt",
          label: "St. Louis, MO",
          href: "https://maps.google.com/?q=St.+Louis,+MO"
        },
        { icon: "FaPhone", label: "(314) 516-1866", href: "tel:+13145161866" },
        {
          icon: "FaEnvelope",
          label: "info@tbhdigitalsolutions.com",
          href: "mailto:info@tbhdigitalsolutions.com"
        }
      ],
      socialLinks: [
        { icon: "FaFacebookF", link: "https://facebook.com/tbhdigitalsolutions" },
        { icon: "FaTwitter", link: "https://twitter.com/tbhdigitalsolutions" },
        { icon: "FaLinkedinIn", link: "https://linkedin.com/company/tbh-digital-solutions" },
        { icon: "FaYoutube", link: "https://youtube.com/@tbhdigitalsolutions" }
      ]
    }
  ],

  // Keep for backward compatibility (Footer now maps `legal`)
  fullWidthBox: {
    content: ""
  },

  // New source of truth for the legal bar
  legal: {
    copyright: `© ${new Date().getFullYear()} TBH Digital Solutions. ALL RIGHTS RESERVED.`,
    links: [
      { label: "Send us feedback", href: "/feedback" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "How we use your data", href: "/how-we-use-your-data" },
      { label: "Do Not Sell My Personal Information", href: "/do-not-sell" },
      { label: "Terms and Conditions", href: "/terms-and-conditions" },
      { label: "Built by TBH Digital Solutions", href: "https://tbhdigitalsolutions.com", external: true }
    ]
  }
};
