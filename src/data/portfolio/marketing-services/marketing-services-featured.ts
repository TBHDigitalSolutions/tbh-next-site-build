import type { Project } from "@/data/portfolio";
import { marketingServicesItems } from "./marketing-services-items";

/**
 * Derived featured list (keeps content DRY).
 * Exports both a constant and a helper to cap results.
 */

const sortByPriority = (a: Project, b: Project) =>
  (a.priority ?? 999) - (b.priority ?? 999);

export const marketingServicesFeatured: Project[] = marketingServicesItems
  .filter((i) => i.featured)
  .sort(sortByPriority);

/** Helper if you want to cap to exactly N in hub/category pages */
export function getMarketingServicesFeatured(limit = 3): Project[] {
  return marketingServicesFeatured.slice(0, limit);
}
