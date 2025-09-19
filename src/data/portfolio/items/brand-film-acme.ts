import type { PortfolioItem } from "../index";

const brandFilmAcme: PortfolioItem = {
  id: "brand-film-acme",
  title: "Acme Brand Film",
  category: "video",
  client: "Acme Corp",
  description: "Anthem spot highlighting Acme’s mission, shot across 3 locations.",
  tags: ["anthem", "b2b", "multi-location"],
  thumbnail: "/portfolio/acme/thumb.jpg",
  video: { embedUrl: "https://player.vimeo.com/video/123456789" },
  cta: { label: "Watch Case Study", href: "/case-studies/acme-brand-film" },
  featured: true,
  date: "2025-02-10",
};

export default brandFilmAcme;
