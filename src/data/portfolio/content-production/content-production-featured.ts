import type { Project } from "@/data/portfolio";
import { contentProductionItems } from "./content-production-items";

/**
 * Derived featured list (keeps content DRY).
 * Exports both a constant and a helper to cap results.
 */

const sortByPriority = (a: Project, b: Project) =>
  (a.priority ?? 999) - (b.priority ?? 999);

export const contentProductionFeatured: Project[] = contentProductionItems
  .filter((i) => i.featured)
  .sort(sortByPriority);

/** Helper if you want to cap to exactly N in hub/category pages */
export function getContentProductionFeatured(limit = 3): Project[] {
  return contentProductionFeatured.slice(0, limit);
}
