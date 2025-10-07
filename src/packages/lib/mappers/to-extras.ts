// src/packages/lib/mappers/to-extras.ts
import type { Package, Faq } from "../package-types";

export type PackageDetailExtrasProps = {
  requirements?: string[];
  ethics?: string[];
  limits?: string[];
  notes?: string;

  timeline?: { setup?: string; launch?: string; ongoing?: string };

  faqs?: Faq[];
  relatedSlugs?: string[];
  addOnRecommendations?: string[];
};

export function toExtras(pkg: Package): PackageDetailExtrasProps {
  return {
    requirements: pkg.requirements,
    ethics: pkg.ethics,
    limits: pkg.limits,
    notes: pkg.notes,
    timeline: pkg.timeline,
    faqs: pkg.faqs,
    relatedSlugs: pkg.relatedSlugs,
    addOnRecommendations: pkg.addOnRecommendations,
  };
}
