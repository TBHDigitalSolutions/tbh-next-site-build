// ================================================================
// FunnelDiagram Usage Examples
// ================================================================

import React from "react";
import { FunnelDiagram } from "@/components/ui/organisms/FunnelDiagram";
import type { FunnelStep } from "@/components/ui/organisms/FunnelDiagram";

// ============================
// EXAMPLE DATA SETS
// ============================

// Lead Generation Funnel Data
const leadGenerationFunnel: FunnelStep[] = [
  {
    id: "awareness",
    stage: "Awareness",
    title: "Reach Your Ideal Prospects",
    description: "Targeted ads reach potential customers based on demographics, interests, and behaviors across multiple platforms and touchpoints.",
    icon: "eye-outline",
    tactics: [
      "Interest targeting & lookalike audiences",
      "Behavioral data & intent signals", 
      "Geographic targeting & local optimization",
      "Competitive targeting & conquest campaigns"
    ],
    metrics: "Impressions, Reach, CPM, CTR, Brand Awareness",
    conversionRate: 15,
    volume: 10000
  },
  {
    id: "interest",
    stage: "Interest", 
    title: "Capture Attention & Drive Clicks",
    description: "Compelling ad creative and copy draws prospects to click through to optimized landing pages designed for conversion.",
    icon: "finger-print-outline",
    tactics: [
      "A/B tested creative & messaging",
      "Compelling headlines & value props",
      "Social proof & credibility indicators", 
      "Dynamic creative optimization"
    ],
    metrics: "Clicks, CPC, Quality Score, Click-through Rate, Engagement",
    conversionRate: 8,
    volume: 1500
  },
  {
    id: "consideration",
    stage: "Consideration",
    title: "Convert Visitors to Leads", 
    description: "Optimized landing pages provide value and capture lead information through strategic form placement and compelling offers.",
    icon: "clipboard-outline",
    tactics: [
      "Lead magnets & valuable content offers",
      "Progressive profiling & smart forms",
      "Social proof & trust signals",
      "Urgency/scarcity & compelling CTAs"
    ],
    metrics: "Conversion Rate, Cost per Lead, Form Completions, Page Engagement",
    conversionRate: 25,
    volume: 120
  },
  {
    id: "conversion",
    stage: "Conversion",
    title: "Qualify & Route to Sales",
    description: "Qualified leads are scored, nurtured, and passed to sales team with complete attribution tracking and detailed prospect data.",
    icon: "checkmark-circle-outline",
    tactics: [
      "Lead scoring & qualification models",
      "Email nurturing & follow-up sequences", 
      "Sales handoff & routing automation",
      "Attribution tracking & reporting"
    ],
    metrics: "Sales Qualified Leads, Customer Acquisition Cost, ROI, LTV",
    conversionRate: 45,
    volume: 30
  }
];

// Sales Funnel Data
const salesFunnel: FunnelStep[] = [
  {
    id: "prospecting",
    stage: "Prospecting",
    title: "Identify Target Accounts",
    description: "Research and identify high-value prospects that match your ideal customer profile.",
    icon: "search-outline",
    conversionRate: 20,
    volume: 1000
  },
  {
    id: "qualification",
    stage: "Qualification", 
    title: "Qualify Opportunities",
    description: "Assess prospect fit, budget, authority, need, and timeline to prioritize efforts.",
    icon: "filter-outline",
    conversionRate: 40,
    volume: 200
  },
  {
    id: "proposal",
    stage: "Proposal",
    title: "Present Solutions",
    description: "Deliver customized proposals that address specific prospect needs and challenges.",
    icon: "document-text-outline",
    conversionRate: 60,
    volume: 80
  },
  {
    id: "closing",
    stage: "Closing",
    title: "Close the Deal",
    description: "Navigate final negotiations and objections to successfully close new business.",
    icon: "trophy-outline",
    conversionRate: 75,
    volume: 48
  }
];

// Content Marketing Funnel
const contentFunnel: FunnelStep[] = [
  {
    id: "discovery",
    stage: "Discovery",
    title: "Content Discovery",
    description: "Prospects discover your brand through valuable content across multiple channels.",
    icon: "bulb-outline",
    tactics: ["SEO optimization", "Social media distribution", "Guest posting", "Content syndication"],
    volume: 50000
  },
  {
    id: "engagement",
    stage: "Engagement", 
    title: "Content Engagement",
    description: "Visitors engage with your content, spending time learning about solutions.",
    icon: "heart-outline",
    tactics: ["Interactive content", "Video tutorials", "Downloadable resources", "Webinars"],
    volume: 5000
  },
  {
    id: "subscription",
    stage: "Subscription",
    title: "Email Subscription", 
    description: "Engaged visitors subscribe to receive ongoing valuable content and updates.",
    icon: "mail-outline",
    tactics: ["Lead magnets", "Newsletter signup", "Content upgrades", "Gated content"],
    volume: 500
  },
  {
    id: "nurturing",
    stage: "Nurturing",
    title: "Lead Nurturing",
    description: "Subscribers receive targeted content that educates and builds trust over time.",
    icon: "leaf-outline",
    tactics: ["Email sequences", "Personalized content", "Behavioral triggers", "Progressive profiling"],
    volume: 50
  }
];

// ============================
// USAGE EXAMPLES
// ============================

// Example 1: Basic Interactive Funnel
export const BasicFunnelExample: React.FC = () => {
  return (
    <FunnelDiagram
      steps={leadGenerationFunnel}
      variant="interactive"
      showMetrics={true}
      showTactics={true}
      animated={true}
      title="Lead Generation Funnel"
      subtitle="Our systematic approach to converting prospects into customers"
    />
  );
};

// Example 2: Static Funnel with Conversion Rates
export const ConversionFunnelExample: React.FC = () => {
  return (
    <FunnelDiagram
      steps={salesFunnel}
      variant="static"
      showConversionRates={true}
      showVolume={true}
      showTactics={false}
      colorScheme="gradient"
      size="large"
    />
  );
};

// Example 3: Minimal Expandable Funnel
export const ExpandableFunnelExample: React.FC = () => {
  const handleStepClick = (step: FunnelStep, index: number) => {
    console.log(`Clicked step ${index + 1}: ${step.title}`);
  };

  return (
    <FunnelDiagram
      steps={contentFunnel}
      variant="minimal"
      expandable={true}
      showTactics={true}
      showStepNumbers={true}
      onStepClick={handleStepClick}
      title="Content Marketing Funnel"
    />
  );
};

// Example 4: Horizontal Layout
export const HorizontalFunnelExample: React.FC = () => {
  return (
    <FunnelDiagram
      steps={leadGenerationFunnel.slice(0, 3)} // Show only 3 steps for horizontal
      variant="interactive"
      orientation="horizontal"
      showTactics={true}
      showMetrics={false}
      size="medium"
      responsive={true}
    />
  );
};

// Example 5: Custom Colors
export const CustomColorFunnelExample: React.FC = () => {
  const customColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#feca57"];

  return (
    <FunnelDiagram
      steps={salesFunnel}
      variant="animated"
      colorScheme="custom"
      customColors={customColors}
      showConversionRates={true}
      arrowStyle="animated"
    />
  );
};

// Example 6: Loading State
export const LoadingFunnelExample: React.FC = () => {
  return (
    <FunnelDiagram
      steps={[]}
      loading={true}
      title="Loading Funnel Data..."
    />
  );
};

// Example 7: Error State
export const ErrorFunnelExample: React.FC = () => {
  return (
    <FunnelDiagram
      steps={[]}
      error="Failed to load funnel data"
      title="Funnel Diagram"
    />
  );
};

// Example 8: 3D Effect Funnel
export const ThreeDFunnelExample: React.FC = () => {
  return (
    <FunnelDiagram
      steps={leadGenerationFunnel}
      variant="3d"
      showTactics={false}
      showMetrics={true}
      highlightOnHover={true}
      arrowStyle="curved"
      size="large"
    />
  );
};

// ============================
// INTEGRATION WITH LEAD GENERATION PAGE
// ============================

// How to integrate with the Lead Generation page
export const LeadGenerationPageIntegration: React.FC = () => {
  return (
    <section className="content-width-section" id="funnel">
      <div className="section-header">
        <h2 className="section-title">Our Lead Generation Funnel</h2>
        <p className="section-subtitle">
          A systematic approach that guides prospects from awareness to conversion.
        </p>
      </div>

      <FunnelDiagram
        steps={leadGenerationFunnel}
        variant="interactive"
        showMetrics={true}
        showTactics={true}
        showConversionRates={true}
        animated={true}
        highlightOnHover={true}
        arrowStyle="animated"
        colorScheme="blue"
        size="medium"
        responsive={true}
        mobileVariant="stacked"
      />
    </section>
  );
};

// ============================
// RESPONSIVE PATTERNS
// ============================

export const ResponsiveFunnelExample: React.FC = () => {
  return (
    <div className="responsive-funnel-container">
      {/* Desktop: Full interactive funnel */}
      <div className="hidden lg:block">
        <FunnelDiagram
          steps={leadGenerationFunnel}
          variant="interactive"
          showTactics={true}
          showMetrics={true}
          showConversionRates={true}
          size="large"
        />
      </div>

      {/* Tablet: Horizontal layout */}
      <div className="hidden md:block lg:hidden">
        <FunnelDiagram
          steps={leadGenerationFunnel}
          variant="interactive"
          orientation="horizontal"
          showTactics={false}
          showMetrics={true}
          size="medium"
        />
      </div>

      {/* Mobile: Minimal stacked */}
      <div className="block md:hidden">
        <FunnelDiagram
          steps={leadGenerationFunnel}
          variant="minimal"
          expandable={true}
          showTactics={true}
          showMetrics={false}
          size="small"
          mobileVariant="accordion"
        />
      </div>
    </div>
  );
};

// ============================
// ADVANCED USAGE PATTERNS
// ============================

// Dynamic funnel with real-time data
export const DynamicFunnelExample: React.FC = () => {
  const [funnelData, setFunnelData] = React.useState<FunnelStep[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | undefined>();

  React.useEffect(() => {
    // Simulate API call
    const fetchFunnelData = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setFunnelData(leadGenerationFunnel);
      } catch (err) {
        setError("Failed to load funnel data");
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  return (
    <FunnelDiagram
      steps={funnelData}
      loading={loading}
      error={error}
      variant="interactive"
      showMetrics={true}
      showTactics={true}
      animated={true}
    />
  );
};

// Funnel with analytics tracking
export const AnalyticsFunnelExample: React.FC = () => {
  const handleStepClick = (step: FunnelStep, index: number) => {
    // Track funnel step interaction
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'funnel_step_click', {
        event_category: 'engagement',
        event_label: step.stage,
        value: index + 1
      });
    }
    
    console.log(`Analytics: Funnel step ${step.stage} clicked`);
  };

  const handleStepHover = (step: FunnelStep, index: number) => {
    // Track funnel step hover
    console.log(`Analytics: Funnel step ${step.stage} hovered`);
  };

  return (
    <FunnelDiagram
      steps={leadGenerationFunnel}
      variant="interactive"
      onStepClick={handleStepClick}
      onStepHover={handleStepHover}
      showMetrics={true}
      showTactics={true}
    />
  );
};