import type { PortfolioItem } from "../index";

const siteAlpha: PortfolioItem = {
  id: "site-alpha",
  title: "Alpha SaaS Website",
  category: "web",
  client: "Alpha Inc.",
  description: "Next.js site with CMS & live pricing experiments.",
  tags: ["saas", "nextjs", "cms"],
  thumbnail: "/portfolio/alpha/thumb.jpg",
  web: { demoUrl: "https://alpha.example.com", screenshots: ["/portfolio/alpha/1.jpg"] },
  cta: { label: "Open Live Site", href: "https://alpha.example.com" },
  featured: true,
  date: "2025-03-21",
};

export default siteAlpha;
