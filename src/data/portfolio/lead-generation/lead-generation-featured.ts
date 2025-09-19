import type { Project } from "@/data/portfolio";
import { leadGenerationItems } from "./lead-generation-items";

/**
 * Derived featured list (keeps content DRY).
 * Exports both a constant and a helper to cap results.
 */

const sortByPriority = (a: Project, b: Project) =>
  (a.priority ?? 999) - (b.priority ?? 999);

export const leadGenerationFeatured: Project[] = leadGenerationItems
  .filter((i) => i.featured)
  .sort(sortByPriority);

/** Helper if you want to cap to exactly N in hub/category pages */
export function getLeadGenerationFeatured(limit = 3): Project[] {
  return leadGenerationFeatured.slice(0, limit);
}
