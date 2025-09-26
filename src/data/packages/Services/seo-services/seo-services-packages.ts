// /src/data/packages/seo-services/seo-services-packages.ts
// SEO Services packages - 3 tiers

import type { Package } from "../_types/packages.types";

export const seoServicesPackages: Package[] = [
  {
    id: "seo-essential",
    service: "seo",
    name: "SEO Foundation Package", 
    tier: "Essential",
    summary: "Essential technical SEO and local optimization for small businesses starting their search journey.",
    idealFor: "Small businesses starting with SEO and local search optimization",
    outcomes: [
      "Improved local search visibility",
      "Technical SEO foundation established",
      "Basic keyword ranking improvements",
      "Google Business Profile optimization"
    ],
    features: [
      { label: "Technical SEO audit and fixes", detail: "Comprehensive site health analysis" },
      { label: "Keyword research and strategy", detail: "Target keyword identification and mapping" },
      { label: "On-page optimization", detail: "Up to 20 pages optimized" },
      { label: "Local SEO setup and optimization", detail: "Google Business Profile and citations" },
      { label: "Monthly ranking and traffic reports", detail: "Performance tracking and insights" }
    ],
    price: { 
      monthly: 2500,
      notes: "Includes initial technical audit"
    },
    badges: ["Great for Local"],
    sla: "Monthly reports delivered by 5th of each month",
    popular: true
  },
  {
    id: "seo-professional",
    service: "seo", 
    name: "Advanced SEO Package",
    tier: "Professional", 
    summary: "Comprehensive SEO with content optimization, link building, and competitive market focus.",
    idealFor: "Growing businesses competing in competitive markets for organic visibility",
    outcomes: [
      "Top 3 rankings for target keywords",
      "50-100% increase in organic traffic",
      "Enhanced content SEO performance", 
      "Competitive advantage in search"
    ],
    features: [
      { label: "Comprehensive technical SEO", detail: "Advanced technical optimization and monitoring" },
      { label: "Content SEO and optimization", detail: "Content strategy aligned with search intent" },
      { label: "Link building and digital PR", detail: "Authority building through quality backlinks" },
      { label: "AI SEO and featured snippet optimization", detail: "Optimization for voice search and AI" },
      { label: "E-commerce or marketplace SEO", detail: "Product page and category optimization" },
      { label: "Advanced analytics and reporting", detail: "Custom dashboards and insights" }
    ],
    price: { 
      monthly: 5500,
      notes: "Includes quarterly strategy sessions"
    },
    badges: ["Most Comprehensive"],
    sla: "Weekly progress reports, monthly strategy calls"
  },
  {
    id: "seo-enterprise",
    service: "seo",
    name: "Enterprise SEO Solutions",
    tier: "Enterprise",
    summary: "Enterprise-scale SEO with dedicated strategist and advanced international optimization.",
    idealFor: "Large organizations with complex SEO needs and international presence",
    outcomes: [
      "Enterprise-scale organic visibility",
      "International market penetration",
      "Advanced technical SEO architecture",
      "Dedicated SEO team and strategy"
    ],
    features: [
      { label: "Enterprise-level technical SEO", detail: "Large-scale technical optimization" },
      { label: "International and multi-site SEO", detail: "Global SEO strategy and implementation" },
      { label: "Advanced AI and schema optimization", detail: "Cutting-edge SEO technology implementation" },
      { label: "Large-scale content optimization", detail: "Content at scale with SEO focus" },
      { label: "Custom reporting and dashboards", detail: "Enterprise analytics and insights" },
      { label: "Dedicated SEO strategist", detail: "Senior strategist exclusively for your account" }
    ],
    price: { 
      monthly: 12000,
      notes: "Custom enterprise pricing available"
    },
    badges: ["Enterprise"],
    sla: "Dedicated account management with weekly touchpoints"
  }
];

export default seoServicesPackages;