// src/components/main-pages/Home/Hero/HeroSelector.tsx
"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Page-level data (barrels)
import aboutPageData from "@/data/page/main-pages/about";
import contactPageData from "@/data/page/main-pages/contact";

// Dynamically-loaded hero components
const HomeHero = dynamic(() => import("@/components/main-pages/Home/Hero/Hero"));
const AboutHero = dynamic(
  () => import("@/components/main-pages/About/AboutHero/AboutHero")
);
// ContactHero should not SSR (it may use DOM-only libs)
const ContactHero = dynamic(
  () => import("@/components/main-pages/Contact/ContactHero/ContactHero"),
  { ssr: false }
);

/**
 * Small adapter to map Contact page hero data into ContactHero props.
 * Contact hero component expects: { title, description, backgroundImage, theme? }
 */
function toContactHeroProps(h: (typeof contactPageData)["hero"]) {
  return {
    title: h.title,
    description: h.subtitle ?? "",
    backgroundImage: h.background?.type === "image" ? h.background.src : undefined,
    // Default theme; change if you add theme to your hero.ts
    theme: "light" as const,
  };
}

export default function HeroSelector() {
  const pathname = usePathname();

  if (pathname === "/") {
    return <HomeHero />;
  }

  if (pathname === "/about") {
    // AboutHero was refactored to accept data via props
    if (aboutPageData.hero) {
      return <AboutHero data={aboutPageData.hero} />;
    }
    return null;
  }

  if (pathname === "/contact") {
    const h = contactPageData.hero;
    const props = toContactHeroProps(h);
    return <ContactHero {...props} />;
  }

  // No route-specific hero
  return null;
}
