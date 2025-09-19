// /components/sections/section-layouts/modules/registry.ts
import { AuditTeaser } from "@/components/ui/organisms/AuditTeaser";               // audit
import { ICPDefinitionBlock } from "@/components/ui/organisms/ICPDefinitionBlock"; // icp
import PlaybookShowcase from "@/components/ui/organisms/PlaybookShowcase";         // playbooks
import { EditorialSamplesGrid } from "@/components/ui/organisms/EditorialSamplesGrid"; // editorial

export const moduleRegistry = {
  audit:       { label: "Audit",       component: AuditTeaser },
  icp:         { label: "ICP",         component: ICPDefinitionBlock },
  playbooks:   { label: "Playbooks",   component: PlaybookShowcase },
  editorial:   { label: "Editorial",   component: EditorialSamplesGrid },
  portfolio:   { label: "Portfolio" },  // e.g., VideoPortfolioClient / PortfolioDemoClient
  workflow:    { label: "Workflow" },   // WorkflowDiagram
  techstack:   { label: "Tech Stack" }, // TechStackShowcase
  pricing:     { label: "Pricing" },    // PricingSectionClient
  comparison:  { label: "Compare" },    // ComparisonTable
  stats:       { label: "Results" },    // StatsStrip
  faq:         { label: "FAQ" },
  testimonials:{ label: "Testimonials" },
  logos:       { label: "Logos" },
} as const;

export type ModuleKey = keyof typeof moduleRegistry;