// src/data/portfolio/web-development/web-development-items.ts

import type { Project } from "@/data/portfolio";

/**
 * Web Development → canonical item list
 * Target: 6+ items (exactly 3 featured). Use unique, stable IDs.
 * Thumbnails are required for grid displays.
 */
export const webDevelopmentItems: Project[] = [
  {
    id: "techstore-ecommerce",
    title: "TechStore E-commerce Platform",
    description:
      "High-performance headless storefront with advanced SEO and conversion optimization.",
    category: "web-development",
    client: "TechStore Corp",
    featured: true,
    priority: 1,
    tags: ["ecommerce", "headless", "seo", "conversion"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/techstore",
      thumbnail: "/portfolio/web-dev/techstore-thumb.jpg",
      title: "TechStore Demo",
      alt: "TechStore e-commerce demo",
    },
    href: "/case-studies/techstore-ecommerce",
    metrics: [
      { label: "Revenue Growth", value: "+300%" },
      { label: "Conversion Rate", value: "+127%" },
      { label: "LCP", value: "0.8s" },
    ],
  },

  {
    id: "medconnect-portal",
    title: "MedConnect Patient Portal",
    description:
      "HIPAA-aware portal with telehealth, secure messaging, and accessibility compliance.",
    category: "web-development",
    client: "MedConnect",
    featured: true,
    priority: 2,
    tags: ["healthcare", "accessibility", "nextjs", "telehealth"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/medconnect",
      thumbnail: "/portfolio/web-dev/medconnect-thumb.jpg",
      title: "MedConnect Portal Demo",
      alt: "MedConnect patient portal demo",
    },
    metrics: [
      { label: "ADA Compliance", value: "WCAG 2.2 AA" },
      { label: "Bounce Rate", value: "-38%" },
      { label: "Satisfaction", value: "95%" },
    ],
  },

  {
    id: "fintrack-dashboard",
    title: "FinTrack Analytics Dashboard",
    description:
      "Real-time financial analytics with advanced charting, role-based access, and exports.",
    category: "web-development",
    client: "FinTrack",
    featured: true,
    priority: 3,
    tags: ["saas", "dashboard", "charts", "realtime"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/fintrack",
      thumbnail: "/portfolio/web-dev/fintrack-thumb.jpg",
      title: "FinTrack Dashboard",
      alt: "FinTrack SaaS dashboard demo",
    },
    metrics: [
      { label: "Time to Insight", value: "-55%" },
      { label: "DAU", value: "18k" },
      { label: "Exports/Day", value: "3.4k" },
    ],
  },

  {
    id: "alpha-saas-platform",
    title: "Alpha SaaS Platform",
    description:
      "Modern React platform with multi-tenant auth, real-time collaboration, and audit trails.",
    category: "web-development",
    client: "Alpha Inc.",
    featured: false,
    priority: 4,
    tags: ["react", "nextjs", "saas", "real-time", "analytics"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/alpha-saas",
      thumbnail: "/portfolio/web-dev/alpha-thumb.jpg",
      title: "Alpha SaaS Platform",
      alt: "Alpha SaaS platform demo",
    },
    href: "https://alpha.example.com",
    metrics: [
      { label: "Perf Score", value: "98/100" },
      { label: "Load Time", value: "1.2s" },
      { label: "Engagement", value: "+78%" },
    ],
  },

  {
    id: "charityconnect-platform",
    title: "CharityConnect Donation Platform",
    description:
      "Donor CRM, event coordination, and impact reporting with embeddable widgets.",
    category: "web-development",
    client: "CharityConnect",
    featured: false,
    priority: 5,
    tags: ["nonprofit", "donations", "events", "cms"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/charityconnect",
      thumbnail: "/portfolio/web-dev/charity-thumb.jpg",
      title: "CharityConnect Demo",
      alt: "CharityConnect donation platform demo",
    },
    metrics: [
      { label: "Donation Growth", value: "+567%" },
      { label: "Donor Engagement", value: "+89%" },
      { label: "Event Attendance", value: "+134%" },
    ],
  },

  {
    id: "edutech-lms",
    title: "EduTech Learning Management System",
    description:
      "Video streaming, interactive assessments, SCORM support, and progress tracking.",
    category: "web-development",
    client: "EduTech Institute",
    featured: false,
    priority: 6,
    tags: ["education", "lms", "video-streaming", "assessments"],
    media: {
      type: "interactive",
      src: "https://demo.example.com/edutech-lms",
      thumbnail: "/portfolio/web-dev/edutech-thumb.jpg",
      title: "EduTech LMS",
      alt: "EduTech learning management system demo",
    },
    metrics: [
      { label: "Completion Rate", value: "+78%" },
      { label: "Engagement Score", value: "94/100" },
      { label: "Satisfaction", value: "92%" },
    ],
  },
];
