// src/data/page/services-pages/web-development-services/applications/index.ts

import type { ServiceTemplateData } from "@/types/servicesTemplate.types";

const data: ServiceTemplateData = {
  kind: "service",
  slug: "applications",
  title: "Applications",
  hero: {
    content: {
      eyebrow: "Web Development",
      title: "Custom Applications That Scale With You",
      subtitle:
        "From enterprise dashboards to secure APIs, we design and build application platforms that are maintainable, observable, and ready for growth.",
      primaryCta: { label: "Start your project", href: "/contact" },
      secondaryCta: { label: "See past work", href: "/portfolio?cat=web-development" }
    }
  },
  twoColVideo: {
    title: "Enterprise-grade, startup-speed",
    description:
      "Our application teams combine modern frameworks (Next.js, Node.js, Prisma, GraphQL) with strong DevOps practices. We deliver scalable APIs, secure auth, and dashboards that give your team clarity."
  },
  capabilities: {
    title: "Application Development Areas",
    cards: [
      { id: "api", title: "APIs", href: "#api" },
      { id: "auth", title: "Authentication", href: "#auth" },
      { id: "dashboards", title: "Dashboards", href: "#dashboards" },
      { id: "data-model", title: "Data Modeling", href: "#data-model" },
      { id: "observability", title: "Observability", href: "#observability" },
      { id: "testing", title: "Testing", href: "#testing" }
    ]
  },

  // NEW: Inline sub-services (formerly L3/L4 pages)
  subServicesInline: [
    {
      id: "api",
      label: "APIs",
      summary: "REST, GraphQL, and secure integrations.",
      bullets: [
        "RESTful API development",
        "GraphQL API implementation",
        "Third-party API integrations",
        "API documentation & versioning"
      ],
      scope: {
        includes: ["OpenAPI/SDL specs", "Authentication & RBAC", "Rate limiting"],
        deliverables: ["Endpoints & resolvers", "Automated tests", "Change logs"],
        addons: ["SDK generation", "Developer portal theming"]
      },
      workflow: {
        variant: "timeline",
        steps: [
          { title: "Design", description: "Contract-first API spec with stakeholder input" },
          { title: "Build", description: "Implement endpoints with validation & auth" },
          { title: "Deploy", description: "CI/CD pipelines with versioning" },
          { title: "Monitor", description: "Dashboards, alerts, and error budgets" }
        ]
      },
      pricingCallout: {
        variant: "custom",
        note: "Depends on endpoints and integrations required"
      }
    },
    {
      id: "auth",
      label: "Authentication",
      summary: "Modern auth for users and partners.",
      bullets: [
        "User authentication systems",
        "Single Sign-On (SSO) implementation",
        "Multi-factor authentication",
        "Role-based access control"
      ],
      scope: {
        includes: ["Identity providers", "Session management", "Access control"],
        deliverables: ["SSO integrations", "MFA flows", "RBAC policies"],
        addons: ["Biometric login", "Audit logging"]
      },
      workflow: {
        variant: "timeline",
        steps: [
          { title: "Assess", description: "Review existing identity & compliance needs" },
          { title: "Integrate", description: "Connect IdPs and configure flows" },
          { title: "Harden", description: "MFA, RBAC, and security testing" }
        ]
      },
      pricingCallout: { variant: "addon", note: "Often bundled with new app builds" }
    },
    {
      id: "dashboards",
      label: "Dashboards",
      summary: "Interfaces that make data actionable.",
      bullets: [
        "Administrative interfaces",
        "Analytics dashboards",
        "Real-time data visualization",
        "Custom reporting systems"
      ],
      scope: {
        includes: ["Role-based UIs", "Charting libraries", "Data pipelines"],
        deliverables: ["Admin consoles", "Analytics dashboards", "Custom reports"],
        addons: ["Export integrations", "White-labeling"]
      },
      workflow: {
        variant: "timeline",
        steps: [
          { title: "Discover", description: "Define metrics & user roles" },
          { title: "Design", description: "Wireframes & data model alignment" },
          { title: "Develop", description: "Build dashboards with live data" },
          { title: "Refine", description: "Iterate from feedback & analytics" }
        ]
      },
      pricingCallout: { variant: "custom", note: "Depends on data sources & complexity" }
    },
    {
      id: "data-model",
      label: "Data Modeling",
      summary: "Strong schemas for reliable apps.",
      bullets: [
        "Database design & architecture",
        "Data migration & transformation",
        "Database optimization",
        "Data relationship modeling"
      ],
      scope: {
        includes: ["Schema design", "Normalization/denormalization", "Migrations"],
        deliverables: ["Entity diagrams", "Optimized queries", "Migration scripts"],
        addons: ["Sharding/partitioning", "Data lake integration"]
      },
      workflow: {
        variant: "timeline",
        steps: [
          { title: "Model", description: "Design ERDs and schema" },
          { title: "Migrate", description: "Data migration & preservation" },
          { title: "Optimize", description: "Indexes & query performance" }
        ]
      },
      pricingCallout: { variant: "included", note: "Core part of every app build" }
    },
    {
      id: "observability",
      label: "Observability",
      summary: "Logs, metrics, and tracing for clarity.",
      bullets: [
        "Application monitoring",
        "Performance tracking",
        "Error logging & alerting",
        "Health check systems"
      ],
      scope: {
        includes: ["Dashboards", "Alerts", "Service maps"],
        deliverables: ["Monitoring setup", "Error pipelines", "Health endpoints"],
        addons: ["Synthetic checks", "Chaos testing hooks"]
      },
      workflow: {
        variant: "timeline",
        steps: [
          { title: "Instrument", description: "Logs, metrics, and traces" },
          { title: "Visualize", description: "Dashboards & SLO reports" },
          { title: "Alert", description: "Policies & runbooks" }
        ]
      },
      pricingCallout: { variant: "addon", note: "Paired with production launches" }
    },
    {
      id: "testing",
      label: "Testing",
      summary: "CI-friendly testing strategy.",
      bullets: [
        "Unit testing implementation",
        "Integration testing",
        "End-to-end testing",
        "Test automation frameworks"
      ],
      scope: {
        includes: ["Unit tests", "Integration suites", "E2E tests"],
        deliverables: ["Test harnesses", "CI pipelines", "Reports"],
        addons: ["Load testing", "Security testing"]
      },
      workflow: {
        variant: "timeline",
        steps: [
          { title: "Plan", description: "Test strategy & tooling" },
          { title: "Implement", description: "Write & integrate tests" },
          { title: "Automate", description: "CI/CD integration" }
        ]
      },
      pricingCallout: { variant: "included", note: "Standard for all projects" }
    }
  ],

  cta: {
    title: "Let’s build the application your business needs",
    primaryCta: { label: "Schedule a consult", href: "/contact" }
  },
  seo: {
    title: "Applications | Web Development Services",
    description:
      "Custom software applications: APIs, authentication, dashboards, data models, observability, and testing. Enterprise quality at startup speed.",
    canonical: "/services/web-development-services/applications"
  }
};

export default data;