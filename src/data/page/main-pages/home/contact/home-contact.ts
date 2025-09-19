// src/data/home-contact.ts
export type HomeContactContent = {
  sectionId?: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    priority?: boolean;
  };
  title: string;
  blurb: string;
  ctaText: string;
};

export const homeContact: HomeContactContent = {
  sectionId: "contact",
  image: {
    src: "/images/logos/Print_Transparent.svg",
    alt: "TBH Digital Solutions Logo",
    width: 300,
    height: 300,
    priority: true,
  },
  title: "Contact Us",
  blurb: "Ready to transform your business? Connect with us today.",
  ctaText: "Get In Touch",
};
