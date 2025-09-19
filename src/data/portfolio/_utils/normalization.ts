// /src/data/portfolio/_utils/normalization.ts
// Data normalization utilities for portfolio items

import {
  CANONICAL_CATEGORIES,
  CATEGORY_ALIASES,
  type CategorySlug,
  type Project,
  type ProjectMetric,
} from "../_types";

/** Normalize slugs using alias map; throw if unknown */
export function normalizeCategory(input: string): CategorySlug {
  const lc = input.toLowerCase();
  const resolved =
    (CATEGORY_ALIASES[lc] as CategorySlug | undefined) ||
    (CANONICAL_CATEGORIES.find((c) => c === lc) as CategorySlug | undefined);

  if (!resolved) {
    throw new Error(
      `Unknown category "${input}". Allowed: ${CANONICAL_CATEGORIES.join(", ")}`
    );
  }
  return resolved;
}

/** Coerce metrics: supports numbers/strings; trims labels; stringifies values */
export function coerceMetrics(
  metrics?: Array<{ label: string; value: string | number | boolean | null | undefined }>
): ProjectMetric[] | undefined {
  if (!metrics) return undefined;
  return metrics
    .filter((m) => m && m.label != null)
    .map((m) => ({
      label: String(m.label).trim(),
      value:
        m.value === null || m.value === undefined
          ? ""
          : typeof m.value === "string"
          ? m.value
          : String(m.value),
    }));
}

/** Normalize a single project item */
export function normalizeItem(raw: Project): Project {
  return {
    ...raw,
    category: normalizeCategory(raw.category),
    metrics: coerceMetrics(raw.metrics),
    priority: raw.priority ?? 999,
    tags: raw.tags?.map((t) => t.trim()).filter(Boolean),
  };
}

/** Sort: featured first by priority asc, then non-featured by priority asc */
export function sortByFeaturedPriority(a: Project, b: Project) {
  const fa = a.featured ? 0 : 1;
  const fb = b.featured ? 0 : 1;
  if (fa !== fb) return fa - fb;
  return (a.priority ?? 999) - (b.priority ?? 999);
}

/** Sanitize project data for safe rendering */
export function sanitizeProject(project: Project): Project {
  return {
    ...project,
    title: project.title.trim(),
    description: project.description?.trim() || undefined,
    client: project.client?.trim() || undefined,
    tags: project.tags?.map(tag => tag.trim()).filter(Boolean) || [],
    metrics: project.metrics?.map(metric => ({
      label: metric.label.trim(),
      value: String(metric.value).trim()
    })) || undefined
  };
}

/** Validate and normalize array of projects */
export function normalizeProjects(projects: Project[]): Project[] {
  return projects
    .map(sanitizeProject)
    .map(normalizeItem)
    .sort(sortByFeaturedPriority);
}