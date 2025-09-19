// /src/data/caseStudies/video-production/video-production-cases.ts
// Video production case studies with measurable business impact

import type { CaseStudy } from '../_types';

export const videoProductionCases: CaseStudy[] = [
  {
    id: "acme-product-launch-video",
    client: "Acme Corporation",
    title: "Product Launch Video Campaign Success",
    summary: "Comprehensive video campaign for new product launch that drove record pre-orders and significantly increased brand awareness through strategic storytelling and multi-platform distribution.",
    category: "video-production",
    logo: "/case-studies/logos/acme-logo.png",
    primaryMetric: { label: "Pre-order Increase", value: "+245%" },
    secondaryMetrics: [
      { label: "Video Completion Rate", value: "87%" },
      { label: "Social Media Shares", value: "+156%" },
      { label: "Brand Awareness", value: "+89%" },
      { label: "Click-through Rate", value: "+134%" }
    ],
    link: "/case-studies/acme-product-launch",
    featured: true,
    priority: 1,
    industry: "Technology",
    timeline: "3 months",
    challenge: "New product launch in competitive market with limited brand awareness and need to drive significant pre-order volume",
    solution: "Multi-video campaign strategy with product demos, customer testimonials, behind-the-scenes content, and targeted social media distribution",
    results: [
      "245% increase in pre-orders compared to previous launches",
      "87% video completion rate across all platforms",
      "156% increase in social media engagement and shares",
      "89% improvement in brand awareness metrics",
      "134% higher click-through rates to product pages"
    ],
    tags: ["product-launch", "demo-videos", "social-media", "brand-awareness"],
    publishedDate: "2024-01-20"
  },
  {
    id: "finserve-customer-testimonials",
    client: "FinServe Solutions",
    title: "Customer Testimonial Video Series Impact",
    summary: "Authentic customer testimonial video series that significantly increased trust metrics, influenced purchasing decisions, and improved sales conversion rates.",
    category: "video-production",
    logo: "/case-studies/logos/finserve-logo.png",
    primaryMetric: { label: "Sales Influence", value: "+67%" },
    secondaryMetrics: [
      { label: "Trust Score", value: "9.2/10" },
      { label: "Demo Requests", value: "+34%" },
      { label: "Video Engagement", value: "+123%" },
      { label: "Sales Cycle", value: "-28%" }
    ],
    link: "/case-studies/finserve-testimonials",
    featured: true,
    priority: 2,
    industry: "Financial Services",
    timeline: "2 months",
    challenge: "Low trust scores and lengthy sales cycles in competitive financial services market requiring social proof and credibility",
    solution: "Professional customer testimonial video series featuring real clients sharing authentic success stories and measurable results",
    results: [
      "67% increase in video-influenced sales conversions",
      "9.2/10 trust score improvement in customer surveys",
      "34% increase in product demo requests",
      "123% higher video engagement compared to other content",
      "28% reduction in average sales cycle length"
    ],
    tags: ["testimonials", "trust-building", "financial-services", "social-proof"],
    publishedDate: "2024-02-28"
  },
  {
    id: "growth-events-coverage",
    client: "Growth Summit Co",
    title: "Event Coverage Video Production",
    summary: "Multi-camera event coverage and highlight reels that extended event impact, drove future attendance, and created lasting marketing assets.",
    category: "video-production",
    logo: "/case-studies/logos/growth-events-logo.png",
    primaryMetric: { label: "Next Event Registration", value: "+123%" },
    secondaryMetrics: [
      { label: "Social Engagement", value: "+89%" },
      { label: "Video Views", value: "45K+" },
      { label: "Attendee Satisfaction", value: "+67%" }
    ],
    link: "/case-studies/growth-events",
    featured: true,
    priority: 3,
    industry: "Events & Conferences",
    timeline: "1 month",
    challenge: "Need to capture event content for marketing, extend event impact beyond attendees, and drive future event registrations",
    solution: "Professional multi-camera event coverage, highlight reels, speaker interviews, and post-event promotional content",
    results: [
      "123% increase in next event registration rates",
      "89% higher social media engagement with video content",
      "45,000+ video views across all platforms",
      "67% improvement in attendee satisfaction scores",
      "Created 12 months of evergreen marketing content"
    ],
    tags: ["event-coverage", "highlight-reels", "conference", "multi-camera"],
    publishedDate: "2024-03-15"
  },
  {
    id: "healthtech-explainer-series",
    client: "HealthTech Innovations",
    title: "Medical Device Explainer Video Series",
    summary: "Educational explainer video series that simplified complex medical technology, improved user adoption, and reduced support inquiries.",
    category: "video-production",
    logo: "/case-studies/logos/healthtech-logo.png",
    primaryMetric: { label: "User Adoption", value: "+178%" },
    secondaryMetrics: [
      { label: "Support Tickets", value: "-45%" },
      { label: "Training Time", value: "-67%" },
      { label: "User Satisfaction", value: "+89%" }
    ],
    featured: false,
    priority: 4,
    industry: "Healthcare Technology",
    timeline: "4 months",
    challenge: "Complex medical device with poor user adoption rates due to confusing interface and lack of clear instructions",
    solution: "Series of animated explainer videos breaking down device usage into simple, clear steps with professional medical illustrations",
    results: [
      "178% increase in successful device adoption",
      "45% reduction in customer support tickets",
      "67% decrease in required training time",
      "89% improvement in user satisfaction scores",
      "Reduced onboarding costs by 56%"
    ],
    tags: ["explainer-videos", "healthcare", "animation", "user-adoption"],
    publishedDate: "2024-04-10"
  },
  {
    id: "ecommerce-brand-storytelling",
    client: "Artisan Marketplace",
    title: "Brand Storytelling Video Campaign",
    summary: "Authentic brand storytelling video campaign showcasing artisan creators that increased brand connection and drove significant sales growth.",
    category: "video-production",
    logo: "/case-studies/logos/artisan-logo.png",
    primaryMetric: { label: "Sales Growth", value: "+156%" },
    secondaryMetrics: [
      { label: "Brand Connection", value: "+134%" },
      { label: "Time on Site", value: "+78%" },
      { label: "Social Shares", value: "+267%" }
    ],
    featured: false,
    priority: 5,
    industry: "E-commerce",
    timeline: "6 weeks",
    challenge: "Generic e-commerce brand lacking emotional connection with customers and struggling to differentiate from competitors",
    solution: "Behind-the-scenes brand storytelling videos featuring artisan creators, their stories, and the craftsmanship behind products",
    results: [
      "156% increase in sales following video campaign",
      "134% improvement in brand connection metrics",
      "78% increase in average time spent on website",
      "267% more social media shares and engagement",
      "Built lasting emotional connection with customers"
    ],
    tags: ["brand-storytelling", "artisans", "behind-the-scenes", "emotional-connection"],
    publishedDate: "2024-05-22"
  },
  {
    id: "saas-onboarding-tutorials",
    client: "ProductFlow SaaS",
    title: "User Onboarding Tutorial Videos",
    summary: "Comprehensive onboarding video tutorial series that dramatically improved user activation, reduced churn, and increased feature adoption.",
    category: "video-production",
    logo: "/case-studies/logos/productflow-logo.png",
    primaryMetric: { label: "User Activation", value: "+189%" },
    secondaryMetrics: [
      { label: "Churn Rate", value: "-42%" },
      { label: "Feature Adoption", value: "+145%" },
      { label: "Support Costs", value: "-38%" }
    ],
    featured: false,
    priority: 6,
    industry: "SaaS",
    timeline: "8 weeks",
    challenge: "High user churn during onboarding phase due to complex interface and poor user education materials",
    solution: "Step-by-step video tutorial series covering all key features with interactive elements and progress tracking",
    results: [
      "189% improvement in user activation rates",
      "42% reduction in early-stage churn",
      "145% increase in advanced feature adoption",
      "38% decrease in customer support costs",
      "Improved user lifetime value by 67%"
    ],
    tags: ["onboarding", "tutorials", "saas", "user-activation"],
    publishedDate: "2024-06-18"
  }
];

export default videoProductionCases;