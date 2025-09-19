// ================================================================
// ProcessFlow Usage Examples
// ================================================================

import React from "react";
import { ProcessFlow } from "@/components/ui/organisms/ProcessFlow";
import type { FlowStepData } from "@/components/ui/organisms/ProcessFlow";

// ============================
// EXAMPLE DATA SETS
// ============================

// Lead Generation Process
const leadGenerationProcess: FlowStepData[] = [
  {
    id: "audit-strategy",
    step: 1,
    title: "Audit & Strategy Development",
    description: "We analyze your current lead generation efforts and develop a comprehensive strategy tailored to your business goals and target audience.",
    icon: "analytics-outline",
    status: "completed",
    duration: "Week 1-2",
    date: "Jan 1-14",
    deliverables: [
      "Current performance audit & analysis",
      "Competitor analysis & benchmarking", 
      "ICP definition & targeting strategy",
      "Campaign strategy & roadmap"
    ],
    resources: ["Analytics access", "Historical data", "Team interviews"],
    dependencies: ["Access to existing campaigns", "Stakeholder availability"],
    progress: 100,
    details: "This foundational phase ensures we understand your current state and create a data-driven strategy."
  },
  {
    id: "campaign-setup",
    step: 2,
    title: "Campaign Setup & Launch",
    description: "We build and launch your campaigns across selected platforms with proper tracking, attribution, and optimization infrastructure.",
    icon: "rocket-outline",
    status: "active",
    duration: "Week 3-4",
    date: "Jan 15-28",
    deliverables: [
      "Campaign creation & configuration",
      "Landing page development & optimization",
      "Tracking setup & attribution modeling",
      "Initial launch & monitoring"
    ],
    resources: ["Ad platform access", "Creative assets", "Development team"],
    dependencies: ["Strategy approval", "Creative assets ready"],
    progress: 65,
    substeps: [
      {
        id: "platform-setup",
        step: 1,
        title: "Platform Configuration",
        description: "Set up campaigns across Google Ads, Facebook, and LinkedIn",
        status: "completed"
      },
      {
        id: "tracking-setup",
        step: 2,
        title: "Tracking Implementation",
        description: "Implement conversion tracking and attribution modeling",
        status: "active"
      },
      {
        id: "launch-prep",
        step: 3,
        title: "Launch Preparation",
        description: "Final review and campaign launch preparation",
        status: "pending"
      }
    ]
  },
  {
    id: "optimization",
    step: 3,
    title: "Optimization & Scaling",
    description: "Continuous testing and optimization to improve performance and scale successful campaigns while maintaining quality and efficiency.",
    icon: "trending-up-outline",
    status: "pending",
    duration: "Ongoing",
    date: "Feb 1+",
    deliverables: [
      "A/B testing & creative optimization",
      "Performance optimization & refinement",
      "Budget scaling & allocation",
      "Creative refreshes & new variants"
    ],
    resources: ["Performance data", "Creative team", "Budget allocation"],
    dependencies: ["Campaign launch", "Initial data collection"],
    progress: 0
  },
  {
    id: "reporting",
    step: 4,
    title: "Reporting & Analysis",
    description: "Regular reporting and strategic analysis to ensure campaigns meet your business objectives and provide actionable insights for growth.",
    icon: "bar-chart-outline",
    status: "pending",
    duration: "Monthly",
    date: "Ongoing",
    deliverables: [
      "Performance reports & dashboards",
      "ROI analysis & attribution",
      "Strategic recommendations & insights",
      "Quarterly reviews & planning"
    ],
    resources: ["Analytics platforms", "Reporting tools", "Data analysis"],
    dependencies: ["Campaign data", "Performance metrics"],
    progress: 0
  }
];

// Project Timeline
const projectTimeline: FlowStepData[] = [
  {
    id: "discovery",
    step: 1,
    title: "Discovery Phase",
    description: "Understanding project requirements and defining scope",
    status: "completed",
    date: "March 1-7",
    duration: "1 week"
  },
  {
    id: "design",
    step: 2,
    title: "Design & Planning",
    description: "Creating wireframes, mockups, and technical specifications",
    status: "completed",
    date: "March 8-21",
    duration: "2 weeks"
  },
  {
    id: "development",
    step: 3,
    title: "Development",
    description: "Building the solution according to specifications",
    status: "active",
    date: "March 22 - April 11",
    duration: "3 weeks",
    progress: 45
  },
  {
    id: "testing",
    step: 4,
    title: "Testing & QA",
    description: "Comprehensive testing and quality assurance",
    status: "pending",
    date: "April 12-18",
    duration: "1 week"
  },
  {
    id: "deployment",
    step: 5,
    title: "Deployment",
    description: "Final deployment and go-live",
    status: "pending",
    date: "April 19-25",
    duration: "1 week"
  }
];

// Onboarding Flow
const onboardingFlow: FlowStepData[] = [
  {
    id: "welcome",
    step: 1,
    title: "Welcome & Setup",
    description: "Get started with your account setup and initial configuration",
    icon: "hand-right-outline",
    status: "completed",
    progress: 100
  },
  {
    id: "profile",
    step: 2,
    title: "Complete Your Profile",
    description: "Add your business information and preferences",
    icon: "person-outline",
    status: "active",
    progress: 75
  },
  {
    id: "integration",
    step: 3,
    title: "Connect Integrations",
    description: "Link your existing tools and platforms",
    icon: "link-outline",
    status: "pending",
    progress: 0
  },
  {
    id: "first-campaign",
    step: 4,
    title: "Launch First Campaign",
    description: "Create and launch your first marketing campaign",
    icon: "rocket-outline",
    status: "pending",
    progress: 0
  }
];

// ============================
// USAGE EXAMPLES
// ============================

// Example 1: Complete Lead Generation Process
export const LeadGenerationProcessExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={leadGenerationProcess}
      variant="default"
      showStepNumbers={true}
      showIcons={true}
      showStatus={true}
      showDeliverables={true}
      showResources={true}
      showDuration={true}
      showProgress={true}
      expandable={true}
      animated={true}
      activeStep={1}
      completedSteps={[0]}
      title="Our Lead Generation Process"
      subtitle="Our proven 4-step process ensures maximum ROI from your investment"
    />
  );
};

// Example 2: Timeline View
export const ProjectTimelineExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={projectTimeline}
      variant="timeline"
      showStepNumbers={false}
      showIcons={false}
      showStatus={true}
      showDates={true}
      showDuration={true}
      showProgress={true}
      colorScheme="green"
      title="Project Timeline"
      subtitle="Track progress through each phase of the project"
    />
  );
};

// Example 3: Horizontal Flow
export const HorizontalFlowExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={onboardingFlow}
      variant="horizontal"
      orientation="horizontal"
      showStepNumbers={true}
      showIcons={true}
      showStatus={true}
      showProgress={true}
      size="small"
      spacing="compact"
      title="Onboarding Steps"
    />
  );
};

// Example 4: Cards Layout
export const CardsLayoutExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={leadGenerationProcess}
      variant="cards"
      showStepNumbers={true}
      showIcons={true}
      showStatus={true}
      showDeliverables={true}
      interactive={true}
      colorScheme="purple"
      size="large"
      spacing="spacious"
      title="Service Process"
      subtitle="How we deliver results for your business"
    />
  );
};

// Example 5: Minimal Flow
export const MinimalFlowExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={onboardingFlow}
      variant="minimal"
      showStepNumbers={true}
      showIcons={false}
      showStatus={false}
      showProgress={true}
      size="small"
      spacing="compact"
      colorScheme="blue"
    />
  );
};

// Example 6: Roadmap View
export const RoadmapExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={projectTimeline}
      variant="roadmap"
      showStepNumbers={true}
      showIcons={false}
      showStatus={true}
      showDates={true}
      showDuration={true}
      colorScheme="orange"
      centered={true}
      title="Product Roadmap"
      subtitle="Upcoming features and improvements"
    />
  );
};

// Example 7: Interactive Flow with Analytics
export const InteractiveFlowExample: React.FC = () => {
  const handleStepClick = (step: FlowStepData, index: number) => {
    // Track step interactions
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'process_step_click', {
        event_category: 'engagement',
        event_label: step.title,
        step_index: index + 1
      });
    }
    
    console.log(`Step clicked: ${step.title}`);
  };

  const handleStepHover = (step: FlowStepData, index: number) => {
    console.log(`Step hovered: ${step.title}`);
  };

  return (
    <ProcessFlow
      steps={leadGenerationProcess}
      variant="default"
      interactive={true}
      expandable={true}
      showDeliverables={true}
      showResources={true}
      onStepClick={handleStepClick}
      onStepHover={handleStepHover}
      title="Interactive Process Flow"
      subtitle="Click on steps to explore details"
    />
  );
};

// Example 8: Custom Styled Flow
export const CustomStyledFlowExample: React.FC = () => {
  const customColors = {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444"
  };

  return (
    <ProcessFlow
      steps={onboardingFlow}
      variant="cards"
      customColors={customColors}
      backgroundColor="#f8fafc"
      borderStyle="subtle"
      showIcons={true}
      showProgress={true}
      animated={true}
      animationType="stagger"
      title="Custom Onboarding"
      style={{
        borderRadius: "16px",
        padding: "2rem"
      }}
    />
  );
};

// Example 9: Loading State
export const LoadingFlowExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={[]}
      loading={true}
      title="Loading Process..."
    />
  );
};

// Example 10: Error State
export const ErrorFlowExample: React.FC = () => {
  return (
    <ProcessFlow
      steps={[]}
      error="Failed to load process steps"
      title="Process Flow"
    />
  );
};

// ============================
// INTEGRATION WITH SERVICE PAGES
// ============================

// Lead Generation Page Integration
export const LeadGenerationPageIntegration: React.FC = () => {
  return (
    <section className="content-width-section" id="process">
      <ProcessFlow
        steps={leadGenerationProcess}
        variant="default"
        showStepNumbers={true}
        showIcons={true}
        showStatus={true}
        showDeliverables={true}
        showDuration={true}
        showProgress={true}
        expandable={true}
        animated={true}
        responsive={true}
        title="Our Lead Generation Process"
        subtitle="Our proven 4-step process ensures maximum ROI from your investment"
        footerContent={
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <button style={{
              padding: "1rem 2rem",
              backgroundColor: "#0eaffb",
              color: "#1a2332",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: "600",
              cursor: "pointer"
            }}>
              Start Your Lead Generation Journey
            </button>
          </div>
        }
      />
    </section>
  );
};

// ============================
// RESPONSIVE PATTERNS
// ============================

export const ResponsiveFlowExample: React.FC = () => {
  return (
    <div className="responsive-flow-container">
      {/* Desktop: Default layout */}
      <div className="hidden lg:block">
        <ProcessFlow
          steps={leadGenerationProcess}
          variant="default"
          showDeliverables={true}
          showResources={true}
          expandable={true}
          size="large"
        />
      </div>

      {/* Tablet: Timeline layout */}
      <div className="hidden md:block lg:hidden">
        <ProcessFlow
          steps={leadGenerationProcess}
          variant="timeline"
          showDeliverables={false}
          showDuration={true}
          size="medium"
        />
      </div>

      {/* Mobile: Cards with carousel */}
      <div className="block md:hidden">
        <ProcessFlow
          steps={leadGenerationProcess}
          variant="cards"
          showDeliverables={false}
          size="small"
          spacing="compact"
          responsive={true}
          mobileVariant="carousel"
        />
      </div>
    </div>
  );
};

// ============================
// ADVANCED USAGE PATTERNS
// ============================

// Dynamic Process with Real-time Updates
export const DynamicProcessExample: React.FC = () => {
  const [processSteps, setProcessSteps] = React.useState<FlowStepData[]>(leadGenerationProcess);
  const [activeStep, setActiveStep] = React.useState(0);

  // Simulate progress updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProcessSteps(prev => prev.map((step, index) => {
        if (index === activeStep && step.progress !== undefined && step.progress < 100) {
          return { ...step, progress: Math.min(step.progress + 10, 100) };
        }
        return step;
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStep]);

  return (
    <ProcessFlow
      steps={processSteps}
      variant="default"
      activeStep={activeStep}
      showProgress={true}
      showStatus={true}
      title="Real-time Process Tracking"
      subtitle="Watch progress update in real-time"
    />
  );
};

// Process with Substeps
export const SubstepsProcessExample: React.FC = () => {
  const processWithSubsteps: FlowStepData[] = [
    {
      id: "setup",
      step: 1,
      title: "Initial Setup",
      description: "Complete the initial setup process",
      status: "completed",
      substeps: [
        {
          id: "account",
          step: 1,
          title: "Create Account",
          description: "Set up your user account",
          status: "completed"
        },
        {
          id: "verification",
          step: 2,
          title: "Email Verification",
          description: "Verify your email address",
          status: "completed"
        }
      ]
    },
    {
      id: "configuration",
      step: 2,
      title: "Configuration",
      description: "Configure your settings and preferences",
      status: "active",
      substeps: [
        {
          id: "profile",
          step: 1,
          title: "Profile Setup",
          description: "Complete your profile information",
          status: "completed"
        },
        {
          id: "preferences",
          step: 2,
          title: "Set Preferences",
          description: "Configure your preferences",
          status: "active"
        },
        {
          id: "integrations",
          step: 3,
          title: "Connect Integrations",
          description: "Link your existing tools",
          status: "pending"
        }
      ]
    }
  ];

  return (
    <ProcessFlow
      steps={processWithSubsteps}
      variant="default"
      expandable={true}
      defaultExpanded={[true, true]}
      showStepNumbers={true}
      showStatus={true}
      title="Detailed Process with Substeps"
    />
  );
};