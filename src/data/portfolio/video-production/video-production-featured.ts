import type { Project } from "@/data/portfolio";
import { videoProductionItems } from "./video-production-items";

/**
 * Derived featured list (keeps content DRY).
 * Exports both a constant and a helper to cap results.
 */

const sortByPriority = (a: Project, b: Project) =>
  (a.priority ?? 999) - (b.priority ?? 999);

export const videoProductionFeatured: Project[] = videoProductionItems
  .filter((i) => i.featured)
  .sort(sortByPriority);

/** Helper if you want to cap to exactly N in hub/category pages */
export function getVideoProductionFeatured(limit = 3): Project[] {
  return videoProductionFeatured.slice(0, limit);
}
