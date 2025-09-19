// /src/data/caseStudies/marketing-services/marketing-services-cases.ts
// Marketing services case studies with automation and campaign results

import type { CaseStudy } from '../_types';

export const marketingServicesCases: CaseStudy[] = [
  {
    id: "saas-lead-nurturing-automation",
    client: "TechFlow SaaS",
    title: "Lead Nurturing Automation Success",
    summary: "HubSpot workflow implementation that transformed marketing qualified leads into sales opportunities with improved conversion rates and shortened sales cycles.",
    category: "marketing-services",
    logo: "/case-studies/logos/techflow-logo.png",
    primaryMetric: { label: "MQL to SQL Rate", value: "+156%" },
    secondaryMetrics: [
      { label: "Sales Cycle", value: "-34%" },
      { label: "Lead Quality Score", value: "+89%" },
      { label: "Revenue per Lead", value: "+78%" },
      { label: "Email Engagement", value: "+134%" }
    ],
    link: "/case-studies/saas-lead-nurturing",
    featured: true,
    priority: 1,
    industry: "SaaS",
    timeline: "4 months",
    challenge: "Poor lead nurturing resulting in low conversion rates, long sales cycles, and wasted marketing spend on unqualified leads",
    solution: "Automated lead nurturing workflows with personalized content, lead scoring, progressive profiling, and sales handoff automation",
    results: [
      "156% improvement in MQL to SQL conversion rate",
      "34% reduction in average sales cycle length",
      "89% increase in lead quality scores",
      "78% improvement in revenue per lead",
      "134% higher email engagement rates"
    ],
    tags: ["marketing-automation", "lead-nurturing", "hubspot", "saas"],
    publishedDate: "2024-01-30"
  },
  {
    id: "enterprise-marketing-ops",
    client: "Enterprise Solutions Ltd",
    title: "Marketing Operations Optimization",
    summary: "Complete marketing automation overhaul with advanced segmentation, personalization, and attribution tracking that dramatically improved campaign performance.",
    category: "marketing-services",
    logo: "/case-studies/logos/enterprise-solutions-logo.png",
    primaryMetric: { label: "Campaign Efficiency", value: "+234%" },
    secondaryMetrics: [
      { label: "Email Performance", value: "+67%" },
      { label: "Attribution Accuracy", value: "+145%" },
      { label: "Marketing ROI", value: "+189%" },
      { label: "Lead Velocity", value: "+123%" }
    ],
    link: "/case-studies/enterprise-marketing-ops",
    featured: true,
    priority: 2,
    industry: "Enterprise Software",
    timeline: "6 months",
    challenge: "Fragmented marketing technology stack, poor attribution tracking, inefficient campaign management, and low marketing ROI",
    solution: "Integrated marketing operations platform, advanced attribution modeling, automated campaign optimization, and comprehensive reporting",
    results: [
      "234% improvement in overall campaign efficiency",
      "67% better email performance metrics",
      "145% more accurate attribution tracking",
      "189% increase in marketing ROI",
      "123% faster lead velocity through funnel"
    ],
    tags: ["marketing-ops", "attribution", "campaign-optimization", "enterprise"],
    publishedDate: "2024-02-22"
  },
  {
    id: "fintech-customer-lifecycle",
    client: "NextGen Financial",
    title: "Customer Lifecycle Marketing Success",
    summary: "Comprehensive customer lifecycle marketing program that increased retention, reduced churn, and maximized customer lifetime value through targeted automation.",
    category: "marketing-services",
    logo: "/case-studies/logos/nextgen-financial-logo.png",
    primaryMetric: { label: "Customer LTV", value: "+167%" },
    secondaryMetrics: [
      { label: "Churn Rate", value: "-45%" },
      { label: "Upsell Revenue", value: "+134%" },
      { label: "Engagement Score", value: "+89%" },
      { label: "Retention Rate", value: "+78%" }
    ],
    link: "/case-studies/fintech-lifecycle",
    featured: true,
    priority: 3,
    industry: "Financial Technology",
    timeline: "8 months",
    challenge: "High customer churn, low engagement post-signup, limited upselling success, and poor customer lifetime value",
    solution: "Multi-touch lifecycle marketing with onboarding sequences, engagement campaigns, churn prevention, and upsell automation",
    results: [
      "167% increase in customer lifetime value",
      "45% reduction in customer churn rate",
      "134% growth in upsell and cross-sell revenue",
      "89% improvement in customer engagement scores",
      "78% better customer retention rates"
    ],
    tags: ["lifecycle-marketing", "fintech", "retention", "customer-ltv"],
    publishedDate: "2024-03-18"
  },
  {
    id: "ecommerce-abandoned-cart-recovery",
    client: "Fashion Forward Store",
    title: "Cart Abandonment Recovery Campaign",
    summary: "Advanced cart abandonment recovery system that recaptured lost sales through personalized messaging and strategic timing optimization.",
    category: "marketing-services",
    logo: "/case-studies/logos/fashion-forward-logo.png",
    primaryMetric: { label: "Recovered Revenue", value: "+245%" },
    secondaryMetrics: [
      { label: "Recovery Rate", value: "+134%" },
      { label: "Email Open Rate", value: "+89%" },
      { label: "Click-through Rate", value: "+156%" }
    ],
    featured: false,
    priority: 4,
    industry: "E-commerce",
    timeline: "3 months",
    challenge: "High cart abandonment rates resulting in significant lost revenue and poor email recovery performance",
    solution: "Multi-stage cart recovery email sequences with personalized product recommendations, urgency tactics, and mobile optimization",
    results: [
      "245% increase in recovered revenue from abandoned carts",
      "134% improvement in cart recovery rates",
      "89% higher email open rates",
      "156% better click-through rates",
      "Reduced overall cart abandonment by 28%"
    ],
    tags: ["cart-abandonment", "ecommerce", "email-marketing", "personalization"],
    publishedDate: "2024-04-14"
  },
  {
    id: "b2b-account-based-marketing",
    client: "Industrial Solutions Corp",
    title: "Account-Based Marketing Excellence",
    summary: "Targeted account-based marketing program that improved enterprise deal closure rates and increased average contract values through personalized outreach.",
    category: "marketing-services",
    logo: "/case-studies/logos/industrial-solutions-logo.png",
    primaryMetric: { label: "Enterprise Deal Rate", value: "+178%" },
    secondaryMetrics: [
      { label: "Average Contract Value", value: "+123%" },
      { label: "Engagement Rate", value: "+167%" },
      { label: "Sales Cycle", value: "-29%" }
    ],
    featured: false,
    priority: 5,
    industry: "B2B Industrial",
    timeline: "7 months",
    challenge: "Low enterprise deal closure rates, generic outreach messaging, long sales cycles, and limited account penetration",
    solution: "Personalized account-based marketing with custom content, multi-channel outreach, account intelligence, and sales alignment",
    results: [
      "178% increase in enterprise deal closure rates",
      "123% higher average contract values",
      "167% improvement in target account engagement",
      "29% reduction in sales cycle length",
      "Penetrated 15 new enterprise accounts"
    ],
    tags: ["account-based-marketing", "b2b", "enterprise-sales", "personalization"],
    publishedDate: "2024-05-20"
  },
  {
    id: "nonprofit-donor-engagement",
    client: "Community Impact Foundation",
    title: "Donor Engagement & Retention Program",
    summary: "Comprehensive donor engagement program that increased donations, improved retention rates, and strengthened donor relationships through targeted communication.",
    category: "marketing-services",
    logo: "/case-studies/logos/community-impact-logo.png",
    primaryMetric: { label: "Donor Retention", value: "+145%" },
    secondaryMetrics: [
      { label: "Average Donation", value: "+89%" },
      { label: "Recurring Donors", value: "+167%" },
      { label: "Engagement Rate", value: "+123%" }
    ],
    featured: false,
    priority: 6,
    industry: "Nonprofit",
    timeline: "5 months",
    challenge: "Poor donor retention, low recurring donation rates, limited donor engagement, and declining average donation amounts",
    solution: "Segmented donor communication, impact storytelling, automated thank you sequences, and recurring donation campaigns",
    results: [
      "145% improvement in donor retention rates",
      "89% increase in average donation amounts",
      "167% growth in recurring donor base",
      "123% higher donor engagement rates",
      "Increased total annual donations by 78%"
    ],
    tags: ["donor-engagement", "nonprofit", "retention", "recurring-donations"],
    publishedDate: "2024-06-12"
  }
];

export default marketingServicesCases;