import type { Project } from "@/data/portfolio";
import { seoServicesItems } from "./seo-services-items";

/**
 * Derived featured list (keeps content DRY).
 * Exports both a constant and a helper to cap results.
 */

const sortByPriority = (a: Project, b: Project) =>
  (a.priority ?? 999) - (b.priority ?? 999);

export const seoServicesFeatured: Project[] = seoServicesItems
  .filter((i) => i.featured)
  .sort(sortByPriority);

/** Helper if you want to cap to exactly N in hub/category pages */
export function getSeoServicesFeatured(limit = 3): Project[] {
  return seoServicesFeatured.slice(0, limit);
}
