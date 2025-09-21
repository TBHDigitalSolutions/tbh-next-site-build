import type { HeroData } from "./types";

const hero: HeroData = {
  title: "About TBH Digital",
  subtitle:
    "Pragmatic builders focused on outcomes. We ship work that compounds.",
  background: {
    type: "image",
    src: "/images/about/hero.jpg",
    alt: "Team collaborating at a whiteboard",
  },
  cta: { label: "Work With Us", href: "/contact?from=about-hero" },
};

export default hero;
