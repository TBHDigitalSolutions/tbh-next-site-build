// /src/data/caseStudies/lead-generation/lead-generation-cases.ts
// Lead generation case studies with pipeline growth and conversion results

import type { CaseStudy } from '../_types';

export const leadGenerationCases: CaseStudy[] = [
  {
    id: "b2b-linkedin-lead-generation",
    client: "B2B Growth Partners",
    title: "LinkedIn Lead Generation Mastery",
    summary: "Targeted LinkedIn advertising and outreach campaign that generated high-quality B2B leads at reduced cost per acquisition while building meaningful business relationships.",
    category: "lead-generation",
    logo: "/case-studies/logos/b2b-growth-logo.png",
    primaryMetric: { label: "Qualified Leads", value: "+345%" },
    secondaryMetrics: [
      { label: "Cost per Lead", value: "-56%" },
      { label: "Conversion Rate", value: "+123%" },
      { label: "Sales Pipeline", value: "+234%" },
      { label: "Meeting Book Rate", value: "+167%" }
    ],
    link: "/case-studies/b2b-linkedin-campaign",
    featured: true,
    priority: 1,
    industry: "B2B Services",
    timeline: "3 months",
    challenge: "High cost per lead from traditional channels, low-quality prospects, limited LinkedIn presence, poor conversion rates",
    solution: "Strategic LinkedIn outreach and advertising with targeted messaging, connection building, content engagement, and nurture sequences",
    results: [
      "345% increase in qualified lead generation",
      "56% reduction in cost per lead acquisition",
      "123% improvement in lead-to-customer conversion",
      "234% growth in sales pipeline value",
      "167% higher meeting booking rates from outreach"
    ],
    tags: ["linkedin-advertising", "b2b-outreach", "social-selling", "pipeline-growth"],
    publishedDate: "2024-01-18"
  },
  {
    id: "multi-channel-lead-strategy",
    client: "ScaleUp Ventures",
    title: "Multi-Channel Lead Generation Strategy",
    summary: "Integrated lead generation strategy across multiple channels with advanced attribution tracking and optimization that dramatically improved lead quality and quantity.",
    category: "lead-generation",
    logo: "/case-studies/logos/scaleup-logo.png",
    primaryMetric: { label: "Pipeline Growth", value: "+234%" },
    secondaryMetrics: [
      { label: "Lead Quality Score", value: "+89%" },
      { label: "Sales Velocity", value: "+67%" },
      { label: "Channel ROI", value: "+156%" },
      { label: "Attribution Accuracy", value: "+145%" }
    ],
    link: "/case-studies/multi-channel-strategy",
    featured: true,
    priority: 2,
    industry: "Technology",
    timeline: "5 months",
    challenge: "Fragmented lead generation efforts, poor channel attribution, inconsistent lead quality, long sales cycles",
    solution: "Integrated multi-channel approach with content marketing, paid advertising, email campaigns, and social outreach",
    results: [
      "234% increase in qualified sales pipeline",
      "89% improvement in lead quality scores",
      "67% faster sales velocity through pipeline",
      "156% better return on investment across channels",
      "145% more accurate attribution tracking"
    ],
    tags: ["multi-channel", "attribution-tracking", "pipeline-growth", "lead-quality"],
    publishedDate: "2024-02-14"
  },
  {
    id: "saas-free-trial-optimization",
    client: "DataFlow Analytics",
    title: "Free Trial Conversion Optimization",
    summary: "Comprehensive free trial optimization program that increased trial signups, improved activation rates, and maximized trial-to-paid conversions.",
    category: "lead-generation",
    logo: "/case-studies/logos/dataflow-logo.png",
    primaryMetric: { label: "Trial-to-Paid Rate", value: "+189%" },
    secondaryMetrics: [
      { label: "Trial Signups", value: "+134%" },
      { label: "Activation Rate", value: "+156%" },
      { label: "Time to Value", value: "-45%" },
      { label: "Trial Engagement", value: "+123%" }
    ],
    link: "/case-studies/saas-trial-optimization",
    featured: true,
    priority: 3,
    industry: "SaaS",
    timeline: "4 months",
    challenge: "Low trial conversion rates, poor trial activation, long time to value, limited trial engagement",
    solution: "Optimized trial funnel, onboarding automation, feature discovery guidance, and conversion-focused nurture campaigns",
    results: [
      "189% increase in trial-to-paid conversion rate",
      "134% more trial signups from marketing efforts",
      "156% improvement in trial user activation",
      "45% reduction in time to first value",
      "123% higher trial engagement scores"
    ],
    tags: ["free-trial-optimization", "saas-conversion", "activation", "onboarding"],
    publishedDate: "2024-03-20"
  },
  {
    id: "enterprise-abm-campaign",
    client: "Enterprise Tech Solutions",
    title: "Enterprise ABM Lead Generation",
    summary: "Account-based marketing campaign targeting Fortune 500 companies that generated high-value enterprise leads and shortened complex sales cycles.",
    category: "lead-generation",
    logo: "/case-studies/logos/enterprise-tech-logo.png",
    primaryMetric: { label: "Enterprise Deals", value: "+178%" },
    secondaryMetrics: [
      { label: "Account Penetration", value: "+123%" },
      { label: "Average Deal Size", value: "+145%" },
      { label: "Sales Cycle", value: "-34%" }
    ],
    featured: false,
    priority: 4,
    industry: "Enterprise Software",
    timeline: "8 months",
    challenge: "Difficulty penetrating enterprise accounts, long sales cycles, low-value deals, generic outreach approaches",
    solution: "Personalized account-based marketing with custom content, multi-stakeholder engagement, and strategic account planning",
    results: [
      "178% increase in enterprise deal closures",
      "123% better account penetration rates",
      "145% higher average deal values",
      "34% reduction in enterprise sales cycles",
      "Secured 12 Fortune 500 clients"
    ],
    tags: ["account-based-marketing", "enterprise-sales", "fortune-500", "high-value-deals"],
    publishedDate: "2024-04-22"
  },
  {
    id: "local-service-lead-generation",
    client: "Metro Home Services",
    title: "Local Service Lead Generation Success",
    summary: "Local lead generation strategy that dominated geographic markets, increased qualified service calls, and built sustainable lead flow for home services.",
    category: "lead-generation",
    logo: "/case-studies/logos/metro-home-logo.png",
    primaryMetric: { label: "Service Calls", value: "+267%" },
    secondaryMetrics: [
      { label: "Cost per Lead", value: "-48%" },
      { label: "Conversion Rate", value: "+134%" },
      { label: "Customer Quality", value: "+89%" }
    ],
    featured: false,
    priority: 5,
    industry: "Home Services",
    timeline: "6 months",
    challenge: "Seasonal demand fluctuations, high competition in local market, expensive lead costs, poor lead quality",
    solution: "Local SEO optimization, Google Ads with geo-targeting, Facebook lead campaigns, and review management system",
    results: [
      "267% increase in qualified service calls",
      "48% reduction in cost per lead acquisition",
      "134% improvement in lead-to-customer conversion",
      "89% higher customer quality and satisfaction",
      "Expanded service area coverage by 45%"
    ],
    tags: ["local-lead-generation", "home-services", "geo-targeting", "review-management"],
    publishedDate: "2024-05-16"
  },
  {
    id: "ecommerce-abandoned-visitor-recovery",
    client: "Premium Retail Co",
    title: "Website Visitor Recovery Campaign",
    summary: "Advanced visitor tracking and retargeting campaign that converted anonymous website visitors into qualified leads and customers through strategic touchpoints.",
    category: "lead-generation",
    logo: "/case-studies/logos/premium-retail-logo.png",
    primaryMetric: { label: "Visitor-to-Lead Rate", value: "+156%" },
    secondaryMetrics: [
      { label: "Retargeting ROI", value: "+234%" },
      { label: "Email Capture Rate", value: "+123%" },
      { label: "Purchase Conversion", value: "+89%" }
    ],
    featured: false,
    priority: 6,
    industry: "E-commerce",
    timeline: "4 months",
    challenge: "High website traffic with low conversion rates, lost visitors not returning, poor email capture rates",
    solution: "Visitor identification technology, retargeting campaigns, exit-intent popups, and progressive profiling strategies",
    results: [
      "156% increase in visitor-to-lead conversion rate",
      "234% improvement in retargeting campaign ROI",
      "123% higher email capture rates",
      "89% better purchase conversion from recovered visitors",
      "Recovered 34% of previously lost website traffic"
    ],
    tags: ["visitor-recovery", "retargeting", "ecommerce-leads", "conversion-optimization"],
    publishedDate: "2024-06-28"
  }
];

export default leadGenerationCases;