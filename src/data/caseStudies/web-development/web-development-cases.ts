// /src/data/caseStudies/web-development/web-development-cases.ts
// Web development case studies with comprehensive business results

import type { CaseStudy } from '../_types';

export const webDevelopmentCases: CaseStudy[] = [
  {
    id: "techstart-commerce-growth",
    client: "TechStart Commerce",
    title: "300% Revenue Growth Through Platform Rebuild",
    summary: "Complete e-commerce platform transformation with headless architecture, resulting in dramatically improved performance and conversion rates that drove massive revenue growth.",
    category: "web-development",
    logo: "/case-studies/logos/techstart-logo.png",
    primaryMetric: { label: "Revenue Growth", value: "+300%" },
    secondaryMetrics: [
      { label: "Page Load Speed", value: "-65%" },
      { label: "Conversion Rate", value: "+127%" },
      { label: "Mobile Performance", value: "+89%" },
      { label: "Cart Abandonment", value: "-45%" }
    ],
    link: "/case-studies/techstart-commerce",
    featured: true,
    priority: 1,
    industry: "E-commerce",
    timeline: "6 months",
    challenge: "Legacy e-commerce platform with poor performance, high cart abandonment rates, and low conversion rates causing significant revenue loss",
    solution: "Headless commerce architecture with React frontend, optimized checkout flow, performance optimization, and mobile-first responsive design",
    results: [
      "300% increase in revenue within 6 months of launch",
      "Reduced page load times by 65% across all devices",
      "Improved conversion rate by 127% through optimized UX",
      "Enhanced mobile experience with 89% performance boost",
      "Decreased cart abandonment rate by 45%"
    ],
    tags: ["headless-commerce", "react", "performance-optimization", "mobile-first"],
    publishedDate: "2024-01-15"
  },
  {
    id: "enterprise-performance-optimization",
    client: "Enterprise Solutions Corp",
    title: "Performance Optimization Success Story",
    summary: "Legacy enterprise website transformed into a high-performance platform with 95+ Lighthouse scores across all metrics, dramatically improving user experience and business outcomes.",
    category: "web-development",
    logo: "/case-studies/logos/enterprise-logo.png",
    primaryMetric: { label: "Performance Score", value: "95/100" },
    secondaryMetrics: [
      { label: "Speed Improvement", value: "+187%" },
      { label: "Bounce Rate", value: "-45%" },
      { label: "User Satisfaction", value: "+92%" },
      { label: "SEO Score", value: "+78%" }
    ],
    link: "/case-studies/enterprise-performance",
    featured: true,
    priority: 2,
    industry: "Enterprise Software",
    timeline: "4 months",
    challenge: "Slow-loading enterprise website with poor performance scores affecting user experience and search rankings",
    solution: "Comprehensive performance audit, code optimization, image optimization, lazy loading implementation, and CDN integration",
    results: [
      "Achieved 95+ Lighthouse performance score",
      "187% improvement in page load speeds",
      "45% reduction in bounce rate",
      "92% increase in user satisfaction scores",
      "78% improvement in SEO performance metrics"
    ],
    tags: ["performance-optimization", "lighthouse", "seo", "enterprise"],
    publishedDate: "2024-02-20"
  },
  {
    id: "saas-platform-modernization",
    client: "CloudTech SaaS",
    title: "Modern SaaS Platform Architecture",
    summary: "Complete platform rebuild with React, TypeScript, and microservices architecture for improved scalability, user experience, and system reliability.",
    category: "web-development",
    logo: "/case-studies/logos/cloudtech-logo.png",
    primaryMetric: { label: "System Uptime", value: "99.9%" },
    secondaryMetrics: [
      { label: "Load Time", value: "-78%" },
      { label: "User Engagement", value: "+156%" },
      { label: "Feature Adoption", value: "+89%" }
    ],
    link: "/case-studies/saas-platform",
    featured: true,
    priority: 3,
    industry: "SaaS",
    timeline: "8 months",
    challenge: "Outdated SaaS platform with scalability issues, poor user experience, and frequent downtime affecting customer satisfaction",
    solution: "Modern React/TypeScript frontend, microservices backend architecture, automated testing, and comprehensive monitoring",
    results: [
      "Achieved 99.9% system uptime reliability",
      "78% reduction in application load times",
      "156% increase in user engagement metrics",
      "89% improvement in feature adoption rates",
      "Reduced customer support tickets by 67%"
    ],
    tags: ["react", "typescript", "microservices", "saas-platform"],
    publishedDate: "2024-03-10"
  },
  {
    id: "fintech-security-compliance",
    client: "SecureFinance Pro",
    title: "Financial Platform Security & Compliance",
    summary: "High-security financial platform built with advanced security measures, compliance standards, and robust user authentication systems.",
    category: "web-development",
    logo: "/case-studies/logos/securefinance-logo.png",
    primaryMetric: { label: "Security Score", value: "100%" },
    secondaryMetrics: [
      { label: "Compliance Standards", value: "SOC 2 + PCI DSS" },
      { label: "Authentication Speed", value: "+134%" },
      { label: "User Trust Score", value: "9.8/10" }
    ],
    featured: false,
    priority: 4,
    industry: "Financial Technology",
    timeline: "10 months",
    challenge: "Need for ultra-secure financial platform meeting strict compliance requirements while maintaining excellent user experience",
    solution: "Advanced security architecture, multi-factor authentication, encrypted data handling, and comprehensive compliance implementation",
    results: [
      "100% security compliance audit score",
      "SOC 2 Type II and PCI DSS certification achieved",
      "134% faster secure authentication processes",
      "9.8/10 user trust and satisfaction rating",
      "Zero security incidents since launch"
    ],
    tags: ["fintech", "security", "compliance", "authentication"],
    publishedDate: "2024-04-05"
  },
  {
    id: "healthcare-hipaa-platform",
    client: "MedConnect Systems",
    title: "HIPAA-Compliant Healthcare Platform",
    summary: "Secure healthcare management platform with HIPAA compliance, patient data protection, and seamless provider workflows.",
    category: "web-development",
    logo: "/case-studies/logos/medconnect-logo.png",
    primaryMetric: { label: "HIPAA Compliance", value: "100%" },
    secondaryMetrics: [
      { label: "Patient Satisfaction", value: "+167%" },
      { label: "Provider Efficiency", value: "+89%" },
      { label: "Data Security Score", value: "A+" }
    ],
    featured: false,
    priority: 5,
    industry: "Healthcare",
    timeline: "12 months",
    challenge: "Complex healthcare platform requiring strict HIPAA compliance while ensuring excellent user experience for patients and providers",
    solution: "HIPAA-compliant architecture, secure patient portals, encrypted communications, and streamlined provider workflows",
    results: [
      "100% HIPAA compliance certification",
      "167% increase in patient satisfaction scores",
      "89% improvement in provider workflow efficiency",
      "A+ rating in security audits",
      "Reduced administrative overhead by 56%"
    ],
    tags: ["healthcare", "hipaa", "patient-portal", "security"],
    publishedDate: "2024-05-15"
  },
  {
    id: "nonprofit-donation-platform",
    client: "Global Impact Foundation",
    title: "Nonprofit Donation Platform Success",
    summary: "Modern donation platform with streamlined giving process, recurring donations, and comprehensive donor management system.",
    category: "web-development",
    logo: "/case-studies/logos/globalimpact-logo.png",
    primaryMetric: { label: "Donation Increase", value: "+245%" },
    secondaryMetrics: [
      { label: "Conversion Rate", value: "+178%" },
      { label: "Recurring Donors", value: "+156%" },
      { label: "Processing Speed", value: "+89%" }
    ],
    featured: false,
    priority: 6,
    industry: "Nonprofit",
    timeline: "5 months",
    challenge: "Outdated donation system with poor user experience resulting in low conversion rates and limited recurring donations",
    solution: "Modern donation platform with one-click giving, recurring donation options, donor portal, and comprehensive analytics",
    results: [
      "245% increase in total donations collected",
      "178% improvement in donation conversion rate",
      "156% growth in recurring donor base",
      "89% faster payment processing",
      "Reduced transaction fees by 34%"
    ],
    tags: ["nonprofit", "donations", "payment-processing", "analytics"],
    publishedDate: "2024-06-20"
  }
];

export default webDevelopmentCases;