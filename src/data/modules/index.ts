// src/data/modules/index.ts

import type { ModuleItem, ModuleSelectorInput } from "./types";
import { commonModules } from "./common";

import { webDevelopmentModules } from "./hub-specific/web-development";
import { videoProductionModules } from "./hub-specific/video-production";
import { seoServicesModules } from "./hub-specific/seo-services";
import { marketingServicesModules } from "./hub-specific/marketing-services";
import { leadGenerationModules } from "./hub-specific/lead-generation-services";
import { contentProductionModules } from "./hub-specific/content-production-services";

const HUB_ALIAS_TO_CANONICAL: Record<string, string> = {
  "web-development-services": "web-development-services",
  "video-production-services": "video-production-services", 
  "seo-services": "seo-services",
  "marketing-services": "marketing-services",
  "lead-generation-services": "lead-generation-services",
  "content-production-services": "content-production-services",

  // Support for canonical forms without "-services"
  "web-development": "web-development-services",
  "video-production": "video-production-services",
  "marketing": "marketing-services", 
  "lead-generation": "lead-generation-services",
  "content-production": "content-production-services",
};

const HUB_MODULES: Record<string, ModuleItem[]> = {
  "web-development-services": webDevelopmentModules,
  "video-production-services": videoProductionModules,
  "seo-services": seoServicesModules,
  "marketing-services": marketingServicesModules,
  "lead-generation-services": leadGenerationModules,
  "content-production-services": contentProductionModules,
};

function canonicalHub(hub: string): string {
  return HUB_ALIAS_TO_CANONICAL[hub] ?? hub;
}

function byFeaturedFirst(a: ModuleItem, b: ModuleItem): number {
  return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
}

function dedupeByTitle(items: ModuleItem[]): ModuleItem[] {
  const seen = new Set<string>();
  return items.filter((m) => {
    const key = m.title.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function matchAllTags(item: ModuleItem, required: string[]): boolean {
  if (!required.length) return true;
  const tags = item.tags ?? [];
  return required.every((t) => tags.includes(t));
}

export function selectModuleItems(input: ModuleSelectorInput): ModuleItem[] {
  const { hub, service, sub, limit = 4, context = "hub" } = input;

  const canonicalHubName = canonicalHub(hub);
  const hubItems = HUB_MODULES[canonicalHubName] ?? [];

  // Always start with common modules
  let pool: ModuleItem[] = [...commonModules, ...hubItems];

  // Apply context-aware filtering
  if (context === "service" && service) {
    pool = pool.filter((m) =>
      matchAllTags(m, [service]) || (m.tags ?? []).includes("all")
    );
  } else if (context === "subservice" && service && sub) {
    pool = pool.filter((m) =>
      matchAllTags(m, [service, sub]) || (m.tags ?? []).includes("all")  
    );
  }
  // "hub" context → no additional filtering beyond hub selection

  // Sort by featured first, dedupe by title, then limit results
  const sorted = pool.sort(byFeaturedFirst);
  return dedupeByTitle(sorted).slice(0, limit);
}

// Convenience selector for use in central selectors file
export const moduleSelectors = {
  getForContext: (hub: string, service?: string, sub?: string, limit?: number) =>
    selectModuleItems({
      hub,
      service,
      sub,
      limit,
      context: sub ? "subservice" : service ? "service" : "hub",
    }),
};

// Re-export everything for convenience
export { commonModules };
export * from "./hub-specific/web-development";
export * from "./hub-specific/video-production";
export * from "./hub-specific/seo-services";
export * from "./hub-specific/marketing-services";
export * from "./hub-specific/lead-generation-services";
export * from "./hub-specific/content-production-services";
export type { ModuleItem, ModuleSelectorInput } from "./types";