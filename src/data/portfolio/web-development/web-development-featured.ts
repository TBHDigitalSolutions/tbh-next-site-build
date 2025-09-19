// src/data/portfolio/web-development/web-development-featured.ts

import type { Project } from "@/data/portfolio";
import { webDevelopmentItems } from "./web-development-items";

/**
 * Derived featured list (keeps content DRY).
 * Exports both a constant and a helper to cap results.
 */

const sortByPriority = (a: Project, b: Project) =>
  (a.priority ?? 999) - (b.priority ?? 999);

export const webDevelopmentFeatured: Project[] = webDevelopmentItems
  .filter((i) => i.featured)
  .sort(sortByPriority);

/** Helper if you want to cap to exactly N in hub/category pages */
export function getWebDevelopmentFeatured(limit = 3): Project[] {
  return webDevelopmentFeatured.slice(0, limit);
}
