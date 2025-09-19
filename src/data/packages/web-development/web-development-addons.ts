// /src/data/packages/web-development/web-development-addons.ts
// Web Development add-ons - specialized enhancements

import type { AddOn } from "../_types/packages.types";

export const webDevelopmentAddOns: AddOn[] = [
  {
    id: "webdev-ecommerce-integration",
    service: "webdev",
    name: "E-commerce Integration Package",
    description: "Complete online store setup with payment processing and inventory management.",
    deliverables: [
      { label: "Shopping cart and checkout setup", detail: "Secure payment processing integration" },
      { label: "Payment gateway integration", detail: "Multiple payment options (Stripe, PayPal, etc.)" },
      { label: "Inventory management system", detail: "Product catalog and stock management" },
      { label: "Order processing automation", detail: "Automated order fulfillment workflows" }
    ],
    billing: "one-time",
    price: { setup: 6500 },
    pairsBestWith: ["Essential", "Professional"],
    popular: true
  },
  {
    id: "webdev-performance-optimization",
    service: "webdev",
    name: "Performance Optimization Package",
    description: "Advanced speed optimization to achieve 90+ Core Web Vitals scores.",
    deliverables: [
      { label: "Core Web Vitals optimization", detail: "LCP, FID, and CLS improvements" },
      { label: "Speed and loading improvements", detail: "Page load time optimization" },
      { label: "Image and asset optimization", detail: "Compression and efficient delivery" },
      { label: "CDN setup and configuration", detail: "Global content delivery network" }
    ],
    billing: "one-time",
    price: { setup: 3500 },
    pairsBestWith: ["Essential", "Professional", "Enterprise"]
  },
  {
    id: "webdev-security-hardening", 
    service: "webdev",
    name: "Security Hardening Package",
    description: "Enterprise-level security implementation with monitoring and threat protection.",
    deliverables: [
      { label: "Advanced security implementation", detail: "Multi-layer security protocols" },
      { label: "SSL and encryption setup", detail: "Advanced certificate management" },
      { label: "Backup and recovery systems", detail: "Automated daily backups" },
      { label: "Security monitoring and alerts", detail: "24/7 threat detection" }
    ],
    billing: "hybrid",
    price: { setup: 2500, monthly: 600 },
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "webdev-api-integration",
    service: "webdev", 
    name: "API Integration Package",
    description: "Custom API development and third-party service integrations.",
    deliverables: [
      { label: "Custom API development", detail: "RESTful APIs for your business logic" },
      { label: "Third-party service integrations", detail: "CRM, email, payment systems" },
      { label: "Data synchronization setup", detail: "Real-time data sync between systems" },
      { label: "Documentation and testing", detail: "Complete API documentation" }
    ],
    billing: "one-time",
    price: { setup: 4500 },
    dependencies: ["Requires access to third-party systems"],
    pairsBestWith: ["Professional", "Enterprise"]
  },
  {
    id: "webdev-maintenance-plus",
    service: "webdev",
    name: "Priority Maintenance & Support",
    description: "Enhanced maintenance with priority support and proactive monitoring.",
    deliverables: [
      { label: "Priority technical support", detail: "2-hour response time guarantee" },
      { label: "Proactive monitoring and alerts", detail: "24/7 uptime monitoring" },
      { label: "Monthly performance reports", detail: "Detailed analytics and recommendations" },
      { label: "Security updates and patches", detail: "Immediate security patch deployment" }
    ],
    billing: "monthly",
    price: { monthly: 800 },
    pairsBestWith: ["Essential", "Professional", "Enterprise"],
    popular: true
  },
  {
    id: "webdev-conversion-optimization",
    service: "webdev",
    name: "Conversion Rate Optimization Add-On",
    description: "Data-driven optimization to increase website conversions and sales.",
    deliverables: [
      { label: "Conversion audit and analysis", detail: "Comprehensive conversion funnel review" },
      { label: "A/B testing implementation", detail: "Split testing for key pages" },
      { label: "User experience optimization", detail: "UX improvements based on data" },
      { label: "Monthly optimization reports", detail: "Performance tracking and insights" }
    ],
    billing: "monthly", 
    price: { setup: 2500, monthly: 1500 },
    pairsBestWith: ["Professional", "Enterprise"]
  }
];

export default webDevelopmentAddOns;