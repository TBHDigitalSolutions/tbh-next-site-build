// src/data/modules/common.ts

import type { ModuleItem } from "./types";

export const commonModules: ModuleItem[] = [
  {
    type: "case-study",
    title: "Success Stories",
    description: "See how we've helped teams hit ambitious growth goals with proven strategies.",
    href: "#portfolio",
    image: "/modules/case-studies.jpg",
    tags: ["all"],
    featured: true,
  },
  {
    type: "booking",
    title: "Book Strategy Session",
    description: "Get a 30-minute roadmap session with our growth specialists.",
    href: "/contact",
    image: "/modules/booking.jpg",
    tags: ["all"],
  },
  {
    type: "portfolio",
    title: "Explore Our Work",
    description: "Browse recent builds, campaigns, and creative projects across all industries.",
    href: "/portfolio",
    image: "/modules/portfolio.jpg",
    tags: ["all"],
  },
  {
    type: "audit",
    title: "Free Growth Audit",
    description: "Technical, content, and conversion opportunities analysis in 48 hours.",
    href: "/audit",
    image: "/modules/audit.jpg",
    tags: ["all"],
  },
];