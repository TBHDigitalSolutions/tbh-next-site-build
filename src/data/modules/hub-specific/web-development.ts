import type { ModuleItem } from "../types";

export const webDevelopmentModules: ModuleItem[] = [
  {
    type: "tool",
    title: "Website Speed Analyzer",
    description: "Get detailed Core Web Vitals analysis and optimization recommendations.",
    href: "/tools/speed-test",
    image: "/modules/speed-analyzer.jpg",
    tags: ["web-development-services", "website", "performance"],
    featured: true,
    hubSpecific: true
  },
  {
    type: "calculator",
    title: "Development Cost Calculator",
    description: "Estimate your custom website or application development investment.",
    href: "/tools/dev-calculator",
    image: "/modules/dev-calculator.jpg",
    tags: ["web-development-services", "applications", "website"],
    hubSpecific: true
  },
  {
    type: "tool",
    title: "Tech Stack Analyzer",
    description: "Analyze your current website technology and get modernization recommendations.",
    href: "/tools/tech-stack",
    image: "/modules/tech-stack.jpg",
    tags: ["web-development-services", "applications"],
    hubSpecific: true
  },
  {
    type: "checklist",
    title: "E-commerce Launch Checklist",
    description: "47-point checklist for launching a high-converting online store.",
    href: "/resources/ecommerce-checklist",
    image: "/modules/ecommerce-checklist.jpg",
    tags: ["web-development-services", "ecommerce"],
    hubSpecific: true
  },
  {
    type: "case-study",
    title: "SaaS Dashboard Transformation",
    description: "How we rebuilt a complex dashboard that increased user engagement by 340%.",
    href: "/case-studies/saas-dashboard",
    image: "/modules/saas-dashboard-case.jpg",
    tags: ["web-development-services", "applications", "dashboards"],
    featured: true
  },
  {
    type: "tool",
    title: "Accessibility Checker",
    description: "WCAG compliance audit tool with actionable improvement recommendations.",
    href: "/tools/accessibility-check",
    image: "/modules/accessibility-tool.jpg",
    tags: ["web-development-services", "website", "accessibility"],
    hubSpecific: true
  },
  {
    type: "resource",
    title: "API Integration Guide",
    description: "Best practices for integrating third-party APIs in modern web applications.",
    href: "/resources/api-guide",
    image: "/modules/api-guide.jpg",
    tags: ["web-development-services", "applications", "api"],
    hubSpecific: true
  }
];