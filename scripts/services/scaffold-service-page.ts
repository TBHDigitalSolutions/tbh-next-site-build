#!/usr/bin/env tsx
/**
 * Scaffold new service page data files with proper structure and types
 * Generates service page templates with hero, capabilities, and required sections
 * 
 * Usage:
 *   tsx scripts/services/scaffold-service-page.ts --hub marketing-services --service content-creative
 *   tsx scripts/services/scaffold-service-page.ts --hub seo-services --service technical --sub core-web-vitals
 *   tsx scripts/services/scaffold-service-page.ts --hub web-development-services --service website --template minimal
 * 
 * Exit codes:
 *   0 = success, 1 = validation errors, 2 = unexpected crash
 */

import fs from "node:fs";
import path from "node:path";
import { logger, exitOk, exitFail } from "../_shared/logger";
import { servicesTree } from "../../src/data/taxonomy/servicesTree";
import type { 
  AnyServiceNode, 
  HubNode, 
  ServiceNode, 
  SubServiceNode 
} from "../../src/types/servicesTaxonomy.types";

const argv = process.argv.slice(2);
const JSON_OUTPUT = argv.includes("--json");
const VERBOSE = argv.includes("--verbose");
const DRY_RUN = argv.includes("--dry-run");
const FORCE = argv.includes("--force");

// Parse arguments
const hubArg = argv.find(arg => arg.startsWith("--hub="))?.split("=")[1];
const serviceArg = argv.find(arg => arg.startsWith("--service="))?.split("=")[1];
const subArg = argv.find(arg => arg.startsWith("--sub="))?.split("=")[1];
const templateArg = argv.find(arg => arg.startsWith("--template="))?.split("=")[1] || "full";

const PAGES_ROOT = path.resolve(process.cwd(), "src/data/page/services-pages");

interface ScaffoldOptions {
  hub: string;
  service: string;
  sub?: string;
  template: "minimal" | "full" | "hub";
  force: boolean;
  dryRun: boolean;
}

interface ScaffoldResult {
  success: boolean;
  filesCreated: string[];
  filesSkipped: string[];
  errors: string[];
  warnings: string[];
}

function findNodeInTaxonomy(hub: string, service?: string, sub?: string): AnyServiceNode | null {
  function traverse(node: AnyServiceNode): AnyServiceNode | null {
    if (node.kind === "hub" && node.slug === hub && !service) {
      return node;
    }
    
    if (node.kind === "service" && service) {
      const hubSlug = node.path.split("/")[2];
      if (hubSlug === hub && node.slug === service && !sub) {
        return node;
      }
    }
    
    if (node.kind === "subservice" && sub) {
      const pathParts = node.path.split("/");
      const hubSlug = pathParts[2];
      const serviceSlug = pathParts[3];
      if (hubSlug === hub && serviceSlug === service && node.slug === sub) {
        return node;
      }
    }

    if (node.children) {
      for (const child of node.children) {
        const found = traverse(child as AnyServiceNode);
        if (found) return found;
      }
    }
    
    return null;
  }

  return traverse(servicesTree);
}

function generateHubPageTemplate(node: HubNode): string {
  const hubTitle = node.title;
  const hubSlug = node.slug;

  return `// Hub page data for ${hubTitle}
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";
import { selectTestimonials, selectModules } from "@/data/selectors";

const HUB = "${hubSlug}";

const data: ServiceTemplateData = {
  /* ============================================================
     Hero Section
  ============================================================ */
  hero: {
    content: {
      title: "${hubTitle}",
      subtitle: "Professional ${hubTitle.toLowerCase()} solutions that drive results",
      description: "Partner with our expert team to deliver exceptional ${hubTitle.toLowerCase()} that elevates your brand and achieves your business objectives.",
    },
    ctas: {
      primary: {
        label: "Get Started",
        href: "/contact",
        ariaLabel: \`Start your \${hubTitle.toLowerCase()} project\`,
      },
      secondary: {
        label: "View Our Work",
        href: "/portfolio",
        ariaLabel: \`See our \${hubTitle.toLowerCase()} portfolio\`,
      },
    },
  },

  /* ============================================================
     Two Column Video Section (Optional)
  ============================================================ */
  twoColVideo: {
    id: \`\${HUB}-intro-video\`,
    title: \`How We Deliver \${hubTitle}\`,
    description: \`Our proven approach combines strategy, implementation, and optimization to ensure your \${hubTitle.toLowerCase()} goals are achieved efficiently and effectively.\\n\\nFrom initial consultation to final delivery, we focus on measurable results and long-term success.\`,
    cta: { label: "See Our Process", href: "#capabilities" },
    // No video src → component will gracefully skip rendering media
  },

  /* ============================================================
     Services & Capabilities (Overview for Hub)
  ============================================================ */
  capabilities: {
    title: "${hubTitle} Services",
    description: "Comprehensive ${hubTitle.toLowerCase()} solutions tailored to your needs",
    bullets: [
      "Strategy & Planning",
      "Expert Implementation", 
      "Performance Optimization",
      "Ongoing Support & Maintenance"
    ],
    pillars: [
      {
        id: "strategy",
        title: "Strategic Planning",
        description: "Data-driven strategies aligned with your business goals",
        icon: "strategy"
      },
      {
        id: "implementation",
        title: "Expert Implementation", 
        description: "Professional execution with attention to detail and quality",
        icon: "implementation"
      },
      {
        id: "optimization",
        title: "Continuous Optimization",
        description: "Ongoing improvements based on performance data and insights",
        icon: "optimization"
      },
      {
        id: "support",
        title: "Dedicated Support",
        description: "Responsive support and maintenance to ensure continued success",
        icon: "support"
      }
    ],
    expandable: [], // Hub pages typically don't need expandable bullets
    ctas: {
      primary: { label: "Get Started", href: "/contact" },
      secondary: { label: "View Services", href: \`#services\` },
    },
  },

  /* ============================================================
     Service Cards (Child Services)
  ============================================================ */
  serviceCards: {
    title: "${hubTitle} Services",
    subtitle: "Choose the right service for your needs",
    items: [
      // TODO: Add actual child services from taxonomy
      // This should be populated based on the hub's children in servicesTree.ts
    ],
  },

  /* ============================================================
     Modules (Resources & Case Studies)
  ============================================================ */
  modules: selectModules({ hub: HUB, limit: 8 }),

  /* ============================================================
     Testimonials
  ============================================================ */
  testimonials: {
    title: "What Our Clients Say",
    subtitle: "Trusted by businesses worldwide",
    data: selectTestimonials({ hub: HUB, limit: 5 }),
  },

  /* ============================================================
     FAQ Section
  ============================================================ */
  faq: {
    title: "Frequently Asked Questions",
    subtitle: \`Common questions about our \${hubTitle.toLowerCase()} services\`,
    faqs: [
      {
        id: "what-services",
        question: \`What \${hubTitle.toLowerCase()} services do you offer?\`,
        answer: \`We offer a comprehensive range of \${hubTitle.toLowerCase()} services including strategy, implementation, optimization, and ongoing support. Each service is tailored to meet your specific business needs and goals.\`,
        category: "Services",
      },
      {
        id: "timeline", 
        question: "What's the typical timeline for projects?",
        answer: "Project timelines vary based on scope and complexity. We'll provide a detailed timeline during our initial consultation, with most projects ranging from 2-12 weeks.",
        category: "Timeline",
      },
      {
        id: "process",
        question: "What does your process look like?",
        answer: "Our process includes discovery, strategy development, implementation, testing, launch, and ongoing optimization. We maintain close collaboration throughout each phase.",
        category: "Process",
      },
    ],
  },

  /* ============================================================
     Final CTA
  ============================================================ */
  cta: {
    title: \`Ready to Elevate Your \${hubTitle}?\`,
    subtitle: "Let's discuss how we can help you achieve your goals",
    primaryCta: {
      label: "Get Started Today",
      href: "/contact",
    },
    secondaryCta: {
      label: "View Our Work",
      href: "/portfolio",
    },
  },
};

export default data;
`;
}

function generateServicePageTemplate(node: ServiceNode): string {
  const serviceTitle = node.title;
  const servicePath = node.path;
  const pathParts = servicePath.split("/");
  const hubSlug = pathParts[2];
  const serviceSlug = pathParts[3];

  return `// Service page data for ${serviceTitle}
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";
import { 
  selectPortfolio, 
  selectTestimonials, 
  selectPackages, 
  selectModules 
} from "@/data/selectors";

const HUB = "${hubSlug}";
const SERVICE = "${serviceSlug}";

const data: ServiceTemplateData = {
  /* ============================================================
     Hero Section
  ============================================================ */
  hero: {
    content: {
      title: "${serviceTitle} Services",
      subtitle: "Professional ${serviceTitle.toLowerCase()} solutions that drive results",
      description: "Expert ${serviceTitle.toLowerCase()} services designed to help your business succeed. From strategy to implementation, we deliver results that matter.",
    },
    ctas: {
      primary: {
        label: "Get Started",
        href: "/contact",
        ariaLabel: \`Start your \${serviceTitle.toLowerCase()} project\`,
      },
      secondary: {
        label: "View Portfolio",
        href: "#portfolio",
        ariaLabel: \`See our \${serviceTitle.toLowerCase()} work\`,
      },
    },
  },

  /* ============================================================
     Two Column Video Section (Optional)
  ============================================================ */
  twoColVideo: {
    id: \`\${SERVICE}-intro-video\`,
    title: \`How We Deliver \${serviceTitle}\`,
    description: \`Our proven approach combines strategy, implementation, and optimization to ensure your \${serviceTitle.toLowerCase()} goals are achieved efficiently and effectively.\\n\\nFrom initial consultation to final delivery, we focus on measurable results and long-term success.\`,
    cta: { label: "See Our Capabilities", href: "#capabilities" },
    // No video src → component will gracefully skip rendering media
  },

  /* ============================================================
     Services & Capabilities + Expandable Bullets
  ============================================================ */
  capabilities: {
    title: "Services & Capabilities",
    description: \`Everything you need for successful \${serviceTitle.toLowerCase()} implementation and growth.\`,
    bullets: [
      "Strategic Planning & Analysis",
      "Expert Implementation",
      "Performance Optimization",
      "Ongoing Support & Maintenance"
    ],
    pillars: [
      {
        id: "strategy",
        title: "Strategy & Planning",
        description: "Comprehensive planning and strategic approach tailored to your goals",
        icon: "strategy"
      },
      {
        id: "implementation",
        title: "Professional Implementation",
        description: "Expert execution with attention to detail and best practices",
        icon: "implementation"
      },
      {
        id: "optimization",
        title: "Performance Optimization",
        description: "Continuous improvement based on data and performance metrics",
        icon: "optimization"
      },
      {
        id: "support",
        title: "Ongoing Support",
        description: "Dedicated support to ensure continued success and growth",
        icon: "support"
      }
    ],
    expandable: [
      // TODO: Add expandable bullets for sub-services/capabilities
      // These should reflect the actual sub-services available under this service
      {
        id: "discovery",
        title: "Discovery & Analysis",
        summary: "Comprehensive assessment of current state and opportunities",
        details: [
          "Current state assessment",
          "Competitive analysis",
          "Goal setting and KPI definition"
        ],
        tag: "Planning"
      }
    ],
    defaultOpen: 1,
    analyticsId: \`svc-\${SERVICE}\`,
  },

  /* ============================================================
     Portfolio (Visual Examples)
  ============================================================ */
  portfolio: {
    title: \`\${serviceTitle} Portfolio\`,
    subtitle: "Examples of our work and results",
    variant: "standard", // or "video" | "demo" based on service type
    items: selectPortfolio({ hub: HUB, service: SERVICE, featured: true, limit: 9 }),
  },

  /* ============================================================
     Modules (Resources & Case Studies)
  ============================================================ */
  modules: selectModules({ hub: HUB, service: SERVICE, limit: 10 }),

  /* ============================================================
     Pricing Section
  ============================================================ */
  pricing: {
    title: "Transparent Pricing",
    subtitle: "Choose the package that fits your needs",
    packages: selectPackages({ hub: HUB, service: SERVICE, featured: true, limit: 3 }),
    disclaimer: "Final pricing is determined after a scope consultation to ensure the best fit for your specific needs.",
  },

  /* ============================================================
     Testimonials
  ============================================================ */
  testimonials: {
    title: "What Our Clients Say",
    subtitle: "Trusted results from real partnerships",
    data: selectTestimonials({ hub: HUB, service: SERVICE, limit: 3 }),
  },

  /* ============================================================
     FAQ Section
  ============================================================ */
  faq: {
    title: "Frequently Asked Questions",
    subtitle: \`Common questions about our \${serviceTitle.toLowerCase()} service\`,
    faqs: [
      {
        id: "timeline",
        question: \`How long does \${serviceTitle.toLowerCase()} implementation take?\`,
        answer: "Timeline varies based on project scope and complexity. We'll provide a detailed timeline during our initial consultation.",
        category: "Timeline",
      },
      {
        id: "process",
        question: "What does your process look like?",
        answer: "We follow a proven methodology: discovery, strategy, implementation, testing, and optimization. Each phase includes client collaboration and feedback.",
        category: "Process",
      },
      {
        id: "support",
        question: "What kind of support do you provide?",
        answer: "All projects include 30 days of post-launch support, plus ongoing maintenance options to ensure continued success.",
        category: "Support",
      },
    ],
  },

  /* ============================================================
     Final CTA
  ============================================================ */
  cta: {
    title: \`Ready to Get Started with \${serviceTitle}?\`,
    subtitle: "Let's discuss your specific needs and goals",
    primaryCta: {
      label: "Schedule Consultation", 
      href: "/contact",
    },
    secondaryCta: {
      label: "View Our Process",
      href: "#capabilities",
    },
  },
};

export default data;
`;
}

function generateSubServicePageTemplate(node: SubServiceNode): string {
  const subTitle = node.title;
  const subPath = node.path;
  const pathParts = subPath.split("/");
  const hubSlug = pathParts[2];
  const serviceSlug = pathParts[3];
  const subSlug = pathParts[4];

  return `// Sub-service page data for ${subTitle}
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";
import { 
  selectPortfolio, 
  selectTestimonials, 
  selectPackages, 
  selectModules 
} from "@/data/selectors";

const HUB = "${hubSlug}";
const SERVICE = "${serviceSlug}";
const SUB = "${subSlug}";

const data: ServiceTemplateData = {
  /* ============================================================
     Hero Section
  ============================================================ */
  hero: {
    content: {
      title: "${subTitle}",
      subtitle: "Specialized ${subTitle.toLowerCase()} solutions for your business",
      description: "Expert ${subTitle.toLowerCase()} services that deliver measurable results and drive business growth.",
    },
    ctas: {
      primary: {
        label: "Get Started",
        href: "/contact",
        ariaLabel: \`Start your \${subTitle.toLowerCase()} project\`,
      },
      secondary: {
        label: "Learn More",
        href: "#capabilities",
        ariaLabel: \`Learn about our \${subTitle.toLowerCase()} approach\`,
      },
    },
  },

  /* ============================================================
     Two Column Video Section (Optional)
  ============================================================ */
  twoColVideo: {
    id: \`\${SUB}-intro-video\`,
    title: \`Our \${subTitle} Approach\`,
    description: \`Specialized expertise in \${subTitle.toLowerCase()} with a focus on delivering results that matter to your business.\\n\\nWe combine industry best practices with innovative approaches to ensure success.\`,
    cta: { label: "See Our Process", href: "#capabilities" },
  },

  /* ============================================================
     Services & Capabilities (Focused)
  ============================================================ */
  capabilities: {
    title: \`\${subTitle} Capabilities\`,
    description: \`Specialized \${subTitle.toLowerCase()} services designed for maximum impact\`,
    bullets: [
      "Expert Analysis & Strategy",
      "Professional Implementation",
      "Performance Monitoring",
      "Continuous Optimization"
    ],
    pillars: [
      {
        id: "analysis",
        title: "Expert Analysis",
        description: \`In-depth analysis and strategic planning for \${subTitle.toLowerCase()}\`,
        icon: "analysis"
      },
      {
        id: "implementation",
        title: "Professional Implementation",
        description: "Best-practice implementation with attention to detail",
        icon: "implementation"
      },
      {
        id: "monitoring",
        title: "Performance Monitoring",
        description: "Continuous monitoring and performance tracking",
        icon: "monitoring"
      },
      {
        id: "optimization",
        title: "Ongoing Optimization",
        description: "Data-driven optimization for improved results",
        icon: "optimization"
      }
    ],
    expandable: [
      // TODO: Add specific capabilities for this sub-service
      {
        id: "approach",
        title: "Our Approach",
        summary: \`How we deliver exceptional \${subTitle.toLowerCase()} results\`,
        details: [
          "Industry best practices",
          "Proven methodologies",
          "Custom solutions"
        ],
        tag: "Process"
      }
    ],
    defaultOpen: 0,
    analyticsId: \`sub-\${SUB}\`,
  },

  /* ============================================================
     Portfolio (Relevant Examples)
  ============================================================ */
  portfolio: {
    title: \`\${subTitle} Examples\`,
    subtitle: "See our specialized expertise in action",
    variant: "standard",
    items: selectPortfolio({ hub: HUB, service: SERVICE, sub: SUB, featured: true, limit: 6 }),
  },

  /* ============================================================
     Modules (Targeted Resources)
  ============================================================ */
  modules: selectModules({ hub: HUB, service: SERVICE, sub: SUB, limit: 6 }),

  /* ============================================================
     Testimonials (Service-specific)
  ============================================================ */
  testimonials: {
    title: "Client Success Stories",
    subtitle: "Real results from our specialized expertise",
    data: selectTestimonials({ hub: HUB, service: SERVICE, sub: SUB, limit: 2 }),
  },

  /* ============================================================
     FAQ Section (Focused)
  ============================================================ */
  faq: {
    title: "Frequently Asked Questions",
    subtitle: \`Common questions about \${subTitle.toLowerCase()}\`,
    faqs: [
      {
        id: "what-included",
        question: \`What's included in \${subTitle.toLowerCase()}?\`,
        answer: \`Our \${subTitle.toLowerCase()} service includes comprehensive analysis, strategic planning, implementation, and ongoing optimization tailored to your specific needs.\`,
        category: "Service",
      },
      {
        id: "timeline",
        question: "How long does implementation take?",
        answer: "Implementation timeline depends on scope and complexity. Most projects are completed within 2-6 weeks.",
        category: "Timeline",
      },
      {
        id: "results",
        question: "What results can I expect?",
        answer: \`Results vary by business and goals, but our \${subTitle.toLowerCase()} services are designed to deliver measurable improvements in key performance metrics.\`,
        category: "Results",
      },
    ],
  },

  /* ============================================================
     Final CTA
  ============================================================ */
  cta: {
    title: \`Ready to Improve Your \${subTitle}?\`,
    subtitle: "Let's discuss how we can help you achieve better results",
    primaryCta: {
      label: "Get Started",
      href: "/contact",
    },
    secondaryCta: {
      label: "View Portfolio",
      href: "#portfolio",
    },
  },
};

export default data;
`;
}

function generateMinimalTemplate(node: AnyServiceNode): string {
  const title = node.title;
  const nodeType = node.kind;
  const pathParts = node.path.split("/");
  
  let imports = "";
  let constants = "";
  
  if (nodeType === "hub") {
    constants = `const HUB = "${node.slug}";`;
  } else if (nodeType === "service") {
    constants = `const HUB = "${pathParts[2]}";\nconst SERVICE = "${pathParts[3]}";`;
    imports = "selectPortfolio, selectTestimonials, selectModules";
  } else if (nodeType === "subservice") {
    constants = `const HUB = "${pathParts[2]}";\nconst SERVICE = "${pathParts[3]}";\nconst SUB = "${pathParts[4]}";`;
    imports = "selectPortfolio, selectTestimonials, selectModules";
  }

  return `// ${nodeType === "hub" ? "Hub" : nodeType === "service" ? "Service" : "Sub-service"} page data for ${title}
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";${imports ? `\nimport { ${imports} } from "@/data/selectors";` : ""}

${constants}

const data: ServiceTemplateData = {
  hero: {
    content: {
      title: "${title}${nodeType !== "subservice" ? " Services" : ""}",
      subtitle: "TODO: Add compelling subtitle",
      description: "TODO: Add hero description",
    },
    ctas: {
      primary: { label: "Get Started", href: "/contact" },
      secondary: { label: "Learn More", href: "#capabilities" },
    },
  },

  capabilities: {
    title: "Services & Capabilities",
    description: "TODO: Add capabilities description",
    bullets: [
      "TODO: Add key capability",
      "TODO: Add another capability",
    ],
    pillars: [
      {
        id: "placeholder",
        title: "TODO: Pillar Title",
        description: "TODO: Pillar description",
        icon: "placeholder"
      }
    ],
    expandable: [],
  },

  // TODO: Add additional sections as needed
  // - portfolio
  // - modules  
  // - pricing
  // - testimonials
  // - faq
  // - cta

  cta: {
    title: \`Ready to Get Started?\`,
    subtitle: "Let's discuss your needs",
    primaryCta: { label: "Contact Us", href: "/contact" },
  },
};

export default data;
`;
}

function scaffoldServicePage(options: ScaffoldOptions): ScaffoldResult {
  const result: ScaffoldResult = {
    success: false,
    filesCreated: [],
    filesSkipped: [],
    errors: [],
    warnings: []
  };

  // Validate inputs
  if (!options.hub) {
    result.errors.push("Hub is required (--hub=...)");
    return result;
  }

  if (!options.service && !options.sub) {
    if (options.template !== "hub") {
      result.errors.push("Service is required for non-hub templates (--service=...)");
      return result;
    }
  }

  // Find node in taxonomy
  const node = findNodeInTaxonomy(options.hub, options.service, options.sub);
  if (!node) {
    result.errors.push(`Node not found in taxonomy: hub=${options.hub}, service=${options.service || "none"}, sub=${options.sub || "none"}`);
    return result;
  }

  // Determine output path
  let outputDir: string;
  let fileName = "index.ts";

  if (options.template === "hub" || (!options.service && !options.sub)) {
    outputDir = path.join(PAGES_ROOT, options.hub);
  } else if (options.service && !options.sub) {
    outputDir = path.join(PAGES_ROOT, options.hub, options.service);
  } else if (options.service && options.sub) {
    outputDir = path.join(PAGES_ROOT, options.hub, options.service, options.sub);
  } else {
    result.errors.push("Invalid combination of hub/service/sub parameters");
    return result;
  }

  const outputPath = path.join(outputDir, fileName);

  // Check if file already exists
  if (fs.existsSync(outputPath) && !options.force) {
    result.filesSkipped.push(outputPath);
    result.warnings.push(`File already exists: ${outputPath} (use --force to overwrite)`);
    return result;
  }

  // Generate template content
  let content: string;
  
  if (options.template === "minimal") {
    content = generateMinimalTemplate(node);
  } else if (node.kind === "hub") {
    content = generateHubPageTemplate(node as HubNode);
  } else if (node.kind === "service") {
    content = generateServicePageTemplate(node as ServiceNode);
  } else if (node.kind === "subservice") {
    content = generateSubServicePageTemplate(node as SubServiceNode);
  } else {
    result.errors.push(`Unsupported node kind: ${node.kind}`);
    return result;
  }

  if (options.dryRun) {
    result.filesCreated.push(`[DRY RUN] ${outputPath}`);
    if (VERBOSE) {
      logger.info("Generated content preview:");
      logger.info(content.substring(0, 500) + "...");
    }
  } else {
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      logger.debug(`Created directory: ${outputDir}`);
    }

    // Write the file
    fs.writeFileSync(outputPath, content, "utf8");
    result.filesCreated.push(outputPath);
  }

  result.success = true;
  return result;
}

function parseOptions(): ScaffoldOptions | null {
  if (!hubArg) {
    logger.error("Missing required --hub parameter");
    return null;
  }

  const options: ScaffoldOptions = {
    hub: hubArg,
    service: serviceArg || "",
    sub: subArg,
    template: templateArg as "minimal" | "full" | "hub",
    force: FORCE,
    dryRun: DRY_RUN
  };

  // Validate template
  if (!["minimal", "full", "hub"].includes(options.template)) {
    logger.error(`Invalid template: ${options.template}. Must be one of: minimal, full, hub`);
    return null;
  }

  // Auto-detect template based on parameters if not specified
  if (templateArg === undefined) {
    if (!options.service && !options.sub) {
      options.template = "hub";
    } else {
      options.template = "full";
    }
  }

  return options;
}

try {
  const options = parseOptions();
  if (!options) {
    process.exit(1);
  }

  logger.debug(`Scaffolding ${options.template} template for hub=${options.hub}, service=${options.service || "none"}, sub=${options.sub || "none"}`);

  const result = scaffoldServicePage(options);

  if (JSON_OUTPUT) {
    console.log(JSON.stringify({
      ...result,
      options,
      timestamp: new Date().toISOString()
    }, null, 2));
  } else {
    logger.info("Service Page Scaffolding Results");
    logger.info("================================");
    
    if (result.filesCreated.length > 0) {
      logger.info("Files created:");
      result.filesCreated.forEach(file => logger.info(`✅ ${file}`));
    }

    if (result.filesSkipped.length > 0) {
      logger.info("Files skipped:");
      result.filesSkipped.forEach(file => logger.info(`⏭️  ${file}`));
    }

    if (result.warnings.length > 0) {
      logger.warn("Warnings:");
      result.warnings.forEach(warning => logger.warn(`⚠️  ${warning}`));
    }

    if (result.errors.length > 0) {
      logger.error("Errors:");
      result.errors.forEach(error => logger.error(`❌ ${error}`));
    }

    logger.info("");
    if (result.success) {
      logger.info("✅ Scaffolding completed successfully");
      if (!DRY_RUN && result.filesCreated.length > 0) {
        logger.info("Next steps:");
        logger.info("1. Review and customize the generated template");
        logger.info("2. Add actual content for TODOs");
        logger.info("3. Test with: npm run validate:services-pages");
      }
    } else {
      logger.error("❌ Scaffolding failed");
    }
  }

  if (result.success) {
    exitOk();
  } else {
    exitFail();
  }

} catch (err) {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : String(err),
      timestamp: new Date().toISOString()
    }));
  } else {
    logger.error("Unexpected error:", err);
  }
  process.exit(2);
}