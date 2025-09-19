// /src/data/portfolio/categoryTools.ts
// Data-first category tools (no React/JSX in the data layer).
// Uses the 6 canonical CategorySlug values (incl. "marketing-services").

import type { CategorySlug } from "./_types";

// Tool component keys that the UI layer understands
export const TOOL_COMPONENT_KEYS = [
  "AuditTeaser",
  "ICPDefinitionBlock", 
  "PlaybookShowcase",
  "ComingSoon",
] as const;

export type ToolComponentKey = (typeof TOOL_COMPONENT_KEYS)[number];

export interface CategoryToolConfig {
  id: string;
  title: string;
  description: string;
  componentKey: ToolComponentKey;
  props?: Record<string, unknown>;
  badge?: string;
  order?: number;
  featured?: boolean;
  ctaText?: string;
  analyticsId?: string;
}

export type CategoryToolsMap = Record<CategorySlug, CategoryToolConfig[]>;

// Category tools configuration
export const CATEGORY_TOOLS: CategoryToolsMap = {
  "web-development": [
    {
      id: "website-audit",
      title: "Free Website Audit",
      description: "Performance, SEO, and UX checks with actionable fixes.",
      componentKey: "AuditTeaser",
      props: { variant: "website", showDemo: true },
      badge: "Free",
      order: 1,
      featured: true,
      ctaText: "Audit My Website",
      analyticsId: "web_audit_tool",
    },
    {
      id: "website-strategy-workshop",
      title: "Website Strategy Workshop", 
      description: "Define ICP and messaging so your site converts visitors into customers.",
      componentKey: "ICPDefinitionBlock",
      props: { mode: "web-focused", layout: "cards", interactive: true },
      badge: "Interactive",
      order: 2,
      ctaText: "Start Workshop",
      analyticsId: "web_strategy_workshop",
    },
    {
      id: "web-development-playbook",
      title: "Web Development Playbook",
      description: "Our proven process for high-performing, conversion-focused sites.",
      componentKey: "PlaybookShowcase",
      props: {
        category: "web-development",
        playbooks: [
          { id: "conversion-optimization", title: "Conversion Optimization Guide" },
          { id: "performance-optimization", title: "Performance Optimization Guide" },
        ],
      },
      badge: "Download",
      order: 3,
      ctaText: "Get Playbook",
      analyticsId: "web_dev_playbook",
    },
  ],

  "video-production": [
    {
      id: "video-strategy-workshop",
      title: "Video Strategy Workshop",
      description: "Plan short + long-form content that resonates and converts.",
      componentKey: "ICPDefinitionBlock",
      props: { mode: "video-focused", layout: "tabs", interactive: true },
      badge: "Interactive",
      order: 1,
      featured: true,
      ctaText: "Plan My Strategy",
      analyticsId: "video_strategy_workshop",
    },
    {
      id: "video-production-guide",
      title: "Video Production Guide",
      description: "From concept to distribution—our end-to-end playbook for impact.",
      componentKey: "PlaybookShowcase",
      props: {
        category: "video-production",
        playbooks: [
          { id: "product-demo-videos", title: "Product Demo Videos" },
          { id: "brand-storytelling", title: "Brand Storytelling" },
          { id: "video-marketing-strategy", title: "Video Marketing Strategy" },
        ],
      },
      badge: "Guide",
      order: 2,
      ctaText: "Download Guide",
      analyticsId: "video_production_guide",
    },
  ],

  "seo-services": [
    {
      id: "seo-audit",
      title: "SEO Audit Snapshot",
      description: "Technical, on-page, and content audit lite.",
      componentKey: "AuditTeaser",
      props: { variant: "seo", showDemo: true },
      badge: "Free",
      order: 1,
      featured: true,
      ctaText: "Audit My Site",
      analyticsId: "seo_audit_tool",
    },
    {
      id: "seo-strategy-playbook",
      title: "SEO Success Playbook",
      description: "Step-by-step approach to sustainable ranking and organic growth.",
      componentKey: "PlaybookShowcase",
      props: {
        category: "seo-services",
        playbooks: [
          { id: "keyword-research-mastery", title: "Keyword Research Mastery" },
          { id: "local-seo-domination", title: "Local SEO Domination" },
          { id: "technical-seo-checklist", title: "Technical SEO Checklist" },
        ],
      },
      badge: "Playbook",
      order: 2,
      ctaText: "Get Playbook",
      analyticsId: "seo_playbook",
    },
  ],

  "marketing-services": [
    {
      id: "icp-workshop",
      title: "ICP Definition Workshop",
      description: "Clarify audiences and messaging for higher conversion across campaigns.",
      componentKey: "ICPDefinitionBlock",
      props: { withExamples: true },
      badge: "Workshop",
      order: 1,
      featured: true,
      ctaText: "Define My ICP",
      analyticsId: "icp_workshop",
    },
    {
      id: "marketing-automation-playbook",
      title: "Automation Playbook",
      description: "Workflows and nurture sequences that scale demand generation.",
      componentKey: "PlaybookShowcase",
      props: {
        category: "marketing-services",
        playbooks: [
          { id: "email-nurture-sequences", title: "Email Nurture Sequences" },
          { id: "lead-scoring-system", title: "Lead Scoring System" },
          { id: "automation-workflows", title: "Automation Workflows Library" },
        ],
      },
      badge: "Library",
      order: 2,
      ctaText: "Get Workflows",
      analyticsId: "automation_playbook",
    },
  ],

  "content-production": [
    {
      id: "editorial-brief",
      title: "Editorial Brief Generator",
      description: "Generate briefs that align with SEO and your brand voice.",
      componentKey: "PlaybookShowcase",
      props: { preset: "editorial-brief" },
      badge: "Templates",
      order: 1,
      featured: true,
      ctaText: "Generate Brief",
      analyticsId: "editorial_brief",
    },
    {
      id: "content-strategy-workshop",
      title: "Content Strategy Workshop",
      description: "Define pillars and formats that build authority and drive engagement.",
      componentKey: "ICPDefinitionBlock",
      props: { mode: "content-focused", layout: "accordion", interactive: true },
      badge: "Interactive",
      order: 2,
      ctaText: "Build My Strategy",
      analyticsId: "content_strategy_workshop",
    },
  ],

  "lead-generation": [
    {
      id: "funnel-gap-check",
      title: "Funnel Gap Check",
      description: "Quickly find breakpoints from ad to booked call.",
      componentKey: "AuditTeaser",
      props: { variant: "funnel" },
      badge: "Free",
      order: 1,
      featured: true,
      ctaText: "Audit My Funnel", 
      analyticsId: "funnel_gap_check",
    },
    {
      id: "icp-targeting-workshop",
      title: "ICP Targeting Workshop",
      description: "Focus efforts on high-value prospects and reduce CAC.",
      componentKey: "ICPDefinitionBlock",
      props: { mode: "leadgen-focused", layout: "comparison", interactive: true },
      badge: "Workshop",
      order: 2,
      ctaText: "Define My ICP",
      analyticsId: "icp_targeting_workshop",
    },
    {
      id: "leadgen-playbook",
      title: "Lead Generation Playbook",
      description: "Proven frameworks to fill your pipeline across channels.",
      componentKey: "PlaybookShowcase",
      props: {
        category: "lead-generation",
        playbooks: [
          { id: "linkedin-outreach-system", title: "LinkedIn Outreach System" },
          { id: "content-lead-magnets", title: "Content Lead Magnets" },
          { id: "multi-channel-campaigns", title: "Multi-Channel Campaigns" },
        ],
      },
      badge: "Systems",
      order: 3,
      ctaText: "Get Systems",
      analyticsId: "leadgen_playbook",
    },
  ],
};

// Helper functions
function byOrderAsc(a: CategoryToolConfig, b: CategoryToolConfig) {
  return (a.order ?? 999) - (b.order ?? 999);
}

export const getToolsForCategory = (category: CategorySlug): CategoryToolConfig[] =>
  (CATEGORY_TOOLS[category] ?? []).slice().sort(byOrderAsc);

export const getFeaturedTools = (): CategoryToolConfig[] =>
  Object.values(CATEGORY_TOOLS)
    .flat()
    .filter((tool) => tool.featured)
    .sort(byOrderAsc);

export const getAllTools = (): CategoryToolConfig[] =>
  Object.values(CATEGORY_TOOLS).flat().slice().sort(byOrderAsc);

export const getToolById = (toolId: string): CategoryToolConfig | undefined =>
  getAllTools().find((tool) => tool.id === toolId);

export const searchTools = (query: string): CategoryToolConfig[] => {
  const q = query.toLowerCase().trim();
  if (!q) return getAllTools();
  return getAllTools().filter((tool) => {
    const searchable = [tool.title, tool.description, tool.badge ?? ""]
      .join(" ")
      .toLowerCase();
    return searchable.includes(q);
  });
};

// Analytics helpers
export const getToolsStats = () => {
  const all = getAllTools();
  const featuredCount = all.filter((tool) => tool.featured).length;
  
  const categoryStats = Object.fromEntries(
    (Object.keys(CATEGORY_TOOLS) as CategorySlug[]).map((category) => [
      category,
      CATEGORY_TOOLS[category].length,
    ])
  ) as Record<CategorySlug, number>;

  return {
    totalTools: all.length,
    featuredTools: featuredCount,
    categoryStats,
    averageToolsPerCategory: all.length / Object.keys(CATEGORY_TOOLS).length,
  };
};

// Development integrity checks
if (process.env.NODE_ENV !== "production") {
  const issues: string[] = [];
  
  // Check for duplicate tool IDs
  const ids = getAllTools().map((tool) => tool.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    issues.push(`Duplicate tool IDs: ${Array.from(new Set(duplicates)).join(", ")}`);
  }
  
  // Check for unknown component keys
  const allowedKeys = new Set(TOOL_COMPONENT_KEYS);
  const badKeys = getAllTools()
    .filter((tool) => !allowedKeys.has(tool.componentKey))
    .map((tool) => `${tool.id}:${tool.componentKey}`);
  if (badKeys.length) {
    issues.push(`Unknown componentKey(s): ${badKeys.join(", ")}`);
  }
  
  if (issues.length) {
    console.warn("[categoryTools] Integrity warnings:", issues);
  }
}

// Legacy aliases
export const getCategoryTools = getToolsForCategory;
export const getToolsMetadata = getToolsStats;