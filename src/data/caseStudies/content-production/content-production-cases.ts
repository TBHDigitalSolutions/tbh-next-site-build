// /src/data/caseStudies/content-production/content-production-cases.ts
// Content production case studies with authority building and engagement results

import type { CaseStudy } from '../_types';

export const contentProductionCases: CaseStudy[] = [
  {
    id: "thought-leadership-authority",
    client: "InnovateTech Inc",
    title: "Thought Leadership Authority Building",
    summary: "Executive thought leadership program that established market authority, drove significant inbound demand generation, and positioned company as industry leader.",
    category: "content-production",
    logo: "/case-studies/logos/innovatetech-logo.png",
    primaryMetric: { label: "Industry Authority Score", value: "+189%" },
    secondaryMetrics: [
      { label: "Inbound Leads", value: "+123%" },
      { label: "Media Mentions", value: "+267%" },
      { label: "Speaking Opportunities", value: "+89%" },
      { label: "Content Engagement", value: "+156%" }
    ],
    link: "/case-studies/thought-leadership-campaign",
    featured: true,
    priority: 1,
    industry: "Technology",
    timeline: "8 months",
    challenge: "Low brand authority in competitive tech market, limited inbound lead generation, and need for industry recognition",
    solution: "Strategic thought leadership content program with executive positioning, industry insights, and multi-channel distribution",
    results: [
      "189% increase in industry authority metrics",
      "123% growth in qualified inbound leads",
      "267% increase in positive media mentions",
      "89% more speaking opportunity invitations",
      "156% higher content engagement rates"
    ],
    tags: ["thought-leadership", "authority-building", "executive-positioning", "inbound-leads"],
    publishedDate: "2024-01-12"
  },
  {
    id: "content-hub-development",
    client: "Professional Services Group",
    title: "Content Hub Strategy Success",
    summary: "Comprehensive content strategy and hub development that positioned the firm as the go-to industry authority while driving qualified traffic and conversions.",
    category: "content-production",
    logo: "/case-studies/logos/professional-services-logo.png",
    primaryMetric: { label: "Organic Sessions", value: "+278%" },
    secondaryMetrics: [
      { label: "Time on Site", value: "+89%" },
      { label: "Lead Quality", value: "+145%" },
      { label: "Content Downloads", value: "+234%" },
      { label: "Email Subscribers", value: "+167%" }
    ],
    link: "/case-studies/content-hub-strategy",
    featured: true,
    priority: 2,
    industry: "Professional Services",
    timeline: "6 months",
    challenge: "Limited online authority, low-quality traffic, poor content engagement, and need for lead generation",
    solution: "Comprehensive content hub with pillar pages, topic clusters, gated resources, and strategic content calendar",
    results: [
      "278% increase in organic website sessions",
      "89% improvement in average time on site",
      "145% higher lead quality scores",
      "234% more content downloads and engagements",
      "167% growth in email subscriber base"
    ],
    tags: ["content-hub", "pillar-pages", "topic-clusters", "professional-services"],
    publishedDate: "2024-02-26"
  },
  {
    id: "fintech-educational-content",
    client: "FinanceForward Solutions",
    title: "Educational Content Marketing Success",
    summary: "Educational content program that simplified complex financial concepts, built trust with prospects, and drove significant trial conversions.",
    category: "content-production",
    logo: "/case-studies/logos/financeforward-logo.png",
    primaryMetric: { label: "Trial Conversions", value: "+156%" },
    secondaryMetrics: [
      { label: "Trust Score", value: "+134%" },
      { label: "Content Completion", value: "+89%" },
      { label: "Share Rate", value: "+123%" },
      { label: "Time on Content", value: "+78%" }
    ],
    link: "/case-studies/fintech-educational-content",
    featured: true,
    priority: 3,
    industry: "Financial Technology",
    timeline: "5 months",
    challenge: "Complex financial products difficult to explain, low trust in market, poor conversion from content to trials",
    solution: "Educational content series breaking down complex concepts, trust-building materials, and conversion-optimized content",
    results: [
      "156% increase in content-to-trial conversions",
      "134% improvement in brand trust scores",
      "89% higher content completion rates",
      "123% more social shares and engagement",
      "78% longer time spent on content pages"
    ],
    tags: ["educational-content", "fintech", "trust-building", "complex-products"],
    publishedDate: "2024-03-14"
  },
  {
    id: "healthcare-patient-education",
    client: "MediCare Plus",
    title: "Patient Education Content Program",
    summary: "Comprehensive patient education content that improved health outcomes, increased patient engagement, and strengthened provider relationships.",
    category: "content-production",
    logo: "/case-studies/logos/medicare-plus-logo.png",
    primaryMetric: { label: "Patient Engagement", value: "+167%" },
    secondaryMetrics: [
      { label: "Health Outcomes", value: "+89%" },
      { label: "Content Usage", value: "+234%" },
      { label: "Patient Satisfaction", value: "+123%" }
    ],
    featured: false,
    priority: 4,
    industry: "Healthcare",
    timeline: "7 months",
    challenge: "Poor patient education materials, low engagement with health content, need for improved health outcomes",
    solution: "Clear, accessible patient education content with visual aids, interactive elements, and multi-format delivery",
    results: [
      "167% increase in patient engagement with educational materials",
      "89% improvement in measurable health outcomes",
      "234% higher usage of digital health resources",
      "123% better patient satisfaction scores",
      "Reduced provider consultation time by 34%"
    ],
    tags: ["patient-education", "healthcare", "health-outcomes", "engagement"],
    publishedDate: "2024-04-18"
  },
  {
    id: "saas-onboarding-content",
    client: "WorkFlow Pro",
    title: "User Onboarding Content Success",
    summary: "Comprehensive onboarding content system that improved user activation, reduced churn, and increased feature adoption through strategic education.",
    category: "content-production",
    logo: "/case-studies/logos/workflow-pro-logo.png",
    primaryMetric: { label: "User Activation", value: "+145%" },
    secondaryMetrics: [
      { label: "Churn Reduction", value: "-42%" },
      { label: "Feature Adoption", value: "+178%" },
      { label: "Support Tickets", value: "-38%" }
    ],
    featured: false,
    priority: 5,
    industry: "SaaS",
    timeline: "4 months",
    challenge: "High user churn during onboarding, low feature adoption, high support ticket volume for basic questions",
    solution: "Progressive onboarding content, feature education materials, self-service resources, and success pathway guides",
    results: [
      "145% improvement in user activation rates",
      "42% reduction in early-stage churn",
      "178% increase in advanced feature adoption",
      "38% decrease in support ticket volume",
      "Improved user lifetime value by 67%"
    ],
    tags: ["onboarding-content", "saas", "user-activation", "feature-adoption"],
    publishedDate: "2024-05-25"
  },
  {
    id: "ecommerce-buying-guides",
    client: "TechGear Marketplace",
    title: "Product Buying Guides Impact",
    summary: "Comprehensive buying guide content that educated customers, increased conversion rates, and reduced return rates through better purchase decisions.",
    category: "content-production",
    logo: "/case-studies/logos/techgear-logo.png",
    primaryMetric: { label: "Conversion Rate", value: "+134%" },
    secondaryMetrics: [
      { label: "Return Rate", value: "-45%" },
      { label: "Average Order Value", value: "+89%" },
      { label: "Customer Satisfaction", value: "+123%" }
    ],
    featured: false,
    priority: 6,
    industry: "E-commerce",
    timeline: "3 months",
    challenge: "High return rates, low conversion on complex products, customers making uninformed purchase decisions",
    solution: "Detailed buying guides, product comparison content, educational resources, and decision-support tools",
    results: [
      "134% increase in product page conversion rates",
      "45% reduction in product return rates",
      "89% higher average order values",
      "123% improvement in customer satisfaction",
      "Reduced customer service inquiries by 56%"
    ],
    tags: ["buying-guides", "ecommerce", "product-education", "conversions"],
    publishedDate: "2024-06-22"
  }
];

export default contentProductionCases;