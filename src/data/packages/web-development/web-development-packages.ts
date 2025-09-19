// /src/data/packages/web-development/web-development-packages.ts
// Web Development service packages - 3 tiers

import type { Package } from "../_types/packages.types";

export const webDevelopmentPackages: Package[] = [
  {
    id: "webdev-essential",
    service: "webdev",
    name: "Website Essentials Package", 
    tier: "Essential",
    summary: "Professional website foundation that converts visitors into customers.",
    idealFor: "Small businesses needing a professional web presence that drives results",
    outcomes: [
      "Professional brand credibility online",
      "Mobile-optimized user experience", 
      "SEO-ready technical foundation",
      "Lead capture and conversion tracking"
    ],
    features: [
      { label: "Custom responsive website", detail: "Up to 10 pages, mobile-optimized" },
      { label: "Content management system setup", detail: "Easy-to-update CMS platform" },
      { label: "Basic SEO implementation", detail: "On-page optimization and site structure" },
      { label: "Contact forms and analytics", detail: "Lead capture and performance tracking" },
      { label: "SSL and security setup", detail: "Professional security implementation" },
      { label: "3 months of maintenance included", detail: "Updates, monitoring, and support" }
    ],
    price: { 
      setup: 8500, 
      monthly: 500,
      notes: "Includes hosting setup and domain configuration"
    },
    badges: ["Perfect for Small Business"],
    sla: "2-3 week delivery, 24-hour support response",
    popular: true
  },
  {
    id: "webdev-professional",
    service: "webdev",
    name: "Business Growth Website Package",
    tier: "Professional", 
    summary: "Advanced website with e-commerce and integrations that scales with your business.",
    idealFor: "Growing businesses with advanced functionality and integration needs",
    outcomes: [
      "Scalable platform architecture",
      "Advanced conversion optimization",
      "Multi-platform integrations", 
      "Enhanced user experience"
    ],
    features: [
      { label: "Custom website with advanced features", detail: "Up to 25 pages with complex functionality" },
      { label: "E-commerce functionality or advanced forms", detail: "Online sales or lead generation systems" },
      { label: "Performance optimization", detail: "Core Web Vitals optimization" },
      { label: "Advanced analytics and tracking", detail: "Conversion tracking and user behavior analysis" },
      { label: "Multi-language support option", detail: "International market expansion ready" },
      { label: "6 months of maintenance included", detail: "Priority support and updates" }
    ],
    price: { 
      setup: 18000,
      monthly: 1200,
      notes: "Custom pricing for complex integrations"
    },
    badges: ["Most Popular"],
    sla: "3-4 week delivery, same-day support response",
    popular: true
  },
  {
    id: "webdev-enterprise",
    service: "webdev",
    name: "Enterprise Web Solutions Package",
    tier: "Enterprise",
    summary: "Custom web applications with enterprise security and dedicated development team.",
    idealFor: "Large organizations with complex requirements and custom application needs",
    outcomes: [
      "Enterprise-grade security and compliance",
      "Custom application development",
      "Scalable architecture for growth",
      "Dedicated development partnership"
    ],
    features: [
      { label: "Custom web application development", detail: "Tailored solutions for unique business needs" },
      { label: "Advanced integrations and APIs", detail: "Enterprise system connectivity" },
      { label: "Enterprise-level security and hosting", detail: "Bank-level security and uptime" },
      { label: "Custom dashboard and admin systems", detail: "Powerful management interfaces" },
      { label: "Ongoing development and optimization", detail: "Continuous improvement and feature development" },
      { label: "Dedicated development team", detail: "Senior developers exclusively for your project" }
    ],
    price: { 
      setup: 45000,
      monthly: 3500,
      notes: "Custom enterprise pricing based on scope"
    },
    badges: ["Enterprise Grade"],
    sla: "4-6 week delivery, dedicated account management"
  }
];

export default webDevelopmentPackages;