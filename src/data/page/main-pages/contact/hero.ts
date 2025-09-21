// src/data/page/main-pages/contact/hero.ts
// Hero (title, subtitle, optional CTA/background)

import type { HeroData } from "@/data/page/main-pages/contact/types";

export const hero = {
  title: "Contact Us",
  subtitle:
    "Have questions? Need a consultation? Fill out the form, and our team will get back to you as soon as possible.",
  background: {
    type: "image",
    src: "/images/CONTACT-HERO-TEMP-1.jpg",
    alt: "Abstract contact page background",
  },
  // cta: { label: "Start a Project", href: "#contact-form" }, // ← optional, uncomment if desired
} satisfies HeroData;

export default hero;
