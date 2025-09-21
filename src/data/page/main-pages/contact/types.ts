// src/data/page/main-pages/contact/types.ts
// Canonical types for the Contact page. Import these everywhere.

export type CTA = {
  label: string;
  href: string;
};

export type Background =
  | { type: "image"; src: string; alt?: string }
  | { type: "video"; src: string; alt?: never };

export type HeroData = {
  title: string;
  subtitle?: string;
  cta?: CTA;
  background?: Background;
};

/** “Ways to reach us” grid card */
export type ContactOption = {
  id: string;                 // e.g., "email", "phone", "book"
  title: string;
  description?: string;
  href: string;               // mailto:, tel:, /book, etc.
  icon?: string;              // icon token or emoji
  ctaLabel?: string;          // e.g., "Send Email"
};

/** Succinct contact info list */
export type ContactInfoItem = {
  id: string;                 // e.g., "address", "email", "phone"
  label: string;              // "Email", "Phone", "Address"
  value: string;              // "info@...", "+1 ..."
  href?: string;              // mailto:/tel:/maps link
  icon?: string;              // optional icon token/emoji
};

export type ContactInfoSection = {
  title?: string;
  items: ContactInfoItem[];
};

/** FAQ */
export type FAQItem = {
  id: string;
  question: string;
  answer: string;             // allow markdown if your component supports it
};

export type FAQSection = {
  title: string;
  items: FAQItem[];
};

/** Social proof / trust */
export type TrustSignal =
  | {
      id: string;
      type: "rating";
      label: string;          // "Google Reviews"
      value: string;          // "5.0"
      scale: number;          // 5
      count?: number;         // 48
      logoSrc?: string;
      href?: string;
    }
  | {
      id: string;
      type: "badge";
      label: string;          // "Clutch Top B2B"
      year?: number;
      logoSrc?: string;
      href?: string;
    }
  | {
      id: string;
      type: "logo";
      label: string;          // "Shopify Partner"
      logoSrc?: string;
      href?: string;
    };

export type TrustSignalsSection = {
  title?: string;
  items: TrustSignal[];
};

/** Location / map */
export type LocationData = {
  name?: string;              // e.g., company/site name
  addressLines: string[];     // ["123 Main St", "St. Louis, MO 63101"]
  mapEmbedUrl?: string;       // Google Maps embed URL (preferred)
  lat?: number;               // fallback if you render a map client-side
  lng?: number;
  hours?: Array<{ day: string; open: string; close: string }>;
};

/** Final CTA */
export type ContactCTA = {
  title: string;
  subtitle?: string;
  primaryCta: CTA;
  secondaryCta?: CTA;
};

/** Whole page data shape */
export type ContactPageData = {
  hero: HeroData;
  options: ContactOption[];
  info: ContactInfoSection;
  faq: FAQSection;
  trust: TrustSignalsSection;
  location: LocationData;
  cta: ContactCTA;
};
