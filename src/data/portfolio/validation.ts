// /src/data/portfolio/validation.ts
// Comprehensive portfolio validation with business rules and quality scoring

import { z } from "zod";
import type { Project, CategorySlug, MediaType, PortfolioMedia } from "./_types";
import { CANONICAL_CATEGORIES } from "./_types";

// Validation schemas
const CategorySchema = z.enum([
  "web-development",
  "video-production",
  "seo-services", 
  "marketing-services",
  "content-production",
  "lead-generation",
]);

const MediaTypeSchema = z.enum(["image", "video", "interactive", "pdf"]);

const MediaSchema = z
  .object({
    type: MediaTypeSchema,
    src: z.string().min(1, "Media source is required"),
    poster: z.string().optional(),
    alt: z.string().optional(),
    thumbnail: z.string().optional(),
    title: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Non-blocking UX recommendations (dev only)
    const issues: string[] = [];
    if (data.type === "video" && !data.poster) {
      issues.push("Video media should include a 'poster' image for better UX.");
    }
    if (data.type === "image" && !data.alt) {
      issues.push("Image media should include 'alt' text for accessibility.");
    }
    if (!data.thumbnail) {
      issues.push("All media should include a 'thumbnail' for grid/preview views.");
    }

    if (issues.length > 0 && process.env.NODE_ENV === "development") {
      console.warn(`[portfolio] Media UX hints for ${data.src}:`, issues);
    }
  });

const MetricSchema = z.object({
  label: z.string().min(1, "Metric label is required"),
  value: z.string().min(1, "Metric value is required"),
});

const ProjectSchema = z
  .object({
    id: z.string().min(1, "Project ID is required"),
    title: z.string().min(1, "Project title is required"),
    category: CategorySchema,
    media: MediaSchema,
    description: z.string().optional(),
    client: z.string().optional(),
    tags: z.array(z.string()).optional(),
    metrics: z.array(MetricSchema).optional(),
    featured: z.boolean().optional(),
    priority: z.number().int().min(0).max(999).optional(),
    href: z.string().url().optional(),
  })
  .superRefine((data, ctx) => {
    // Non-blocking business guidance
    const tips: string[] = [];

    if (data.featured && data.priority === undefined) {
      tips.push("Featured projects should include 'priority' for consistent ordering.");
    }
    if (data.title.length > 80) {
      tips.push("Keep titles under ~80 chars for optimal display.");
    }
    if (data.description && data.description.length > 200) {
      tips.push("Keep descriptions under ~200 chars for optimal display.");
    }

    if (tips.length > 0 && process.env.NODE_ENV === "development") {
      console.warn(`[portfolio] Project UX hints for ${data.id}:`, tips);
    }
  });

// Data integrity reporting
export interface DataIntegrityReport {
  valid: boolean;
  duplicateIds: string[];
  missingAssets: string[];
  orphanedFeatured: Project[];
  metricIssues: string[];
  categoryDistribution: Record<CategorySlug, number>;
  mediaTypeDistribution: Record<MediaType, number>;
  qualityScore: number; // 0..100
  recommendations: string[];
}

/** Validate a single project with detailed, dev-friendly logging */
export const validateProject = (project: unknown): Project | null => {
  const result = ProjectSchema.safeParse(project);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    if (process.env.NODE_ENV !== "production") {
      console.warn("[portfolio] Invalid project data:", {
        projectId:
          typeof project === "object" && project && "id" in (project as any)
            ? (project as any).id
            : "unknown",
        errors,
      });
    }
    return null;
  }
  return result.data as Project;
};

/** Validate an array of projects and summarize any issues */
export const validateProjects = (projects: unknown[]): Project[] => {
  if (!Array.isArray(projects)) {
    console.error("[portfolio] Projects data must be an array.");
    return [];
  }

  const valid: Project[] = [];
  const invalid: Array<{ index: number; id?: string; title?: string }> = [];

  projects.forEach((project, index) => {
    const validated = validateProject(project);
    if (validated) {
      valid.push(validated);
    } else {
      const id = typeof project === "object" && project && "id" in (project as any) 
        ? (project as any).id : undefined;
      const title = typeof project === "object" && project && "title" in (project as any) 
        ? (project as any).title : undefined;
      invalid.push({ index, id, title });
    }
  });

  if (invalid.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn(
      `[portfolio] Validation Summary: ${valid.length} valid / ${invalid.length} invalid projects`
    );
    console.table(invalid);
  }

  return valid;
};

/** Build empty counters for all enum keys */
function zeroCounts<T extends string>(keys: readonly T[]): Record<T, number> {
  return keys.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as Record<T, number>);
}

/** Comprehensive data integrity check with quality scoring & recommendations */
export const checkDataIntegrity = (projects: Project[]): DataIntegrityReport => {
  // Duplicate IDs
  const idCounts = new Map<string, number>();
  for (const project of projects) {
    idCounts.set(project.id, (idCounts.get(project.id) ?? 0) + 1);
  }
  const duplicateIds = [...idCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id]) => id);

  // Missing assets + accessibility hints
  const missingAssets: string[] = [];
  for (const project of projects) {
    if (!project.media?.src) missingAssets.push(`${project.id}: missing media.src`);
    if (!project.media?.thumbnail) missingAssets.push(`${project.id}: missing media.thumbnail`);
    if (project.media?.type === "video" && !project.media?.poster)
      missingAssets.push(`${project.id}: video missing media.poster`);
    if (project.media?.type === "image" && !project.media?.alt)
      missingAssets.push(`${project.id}: image missing alt text`);
  }

  // Featured without priority
  const orphanedFeatured = projects.filter((project) => 
    project.featured && project.priority === undefined
  );

  // Metric issues
  const metricIssues: string[] = [];
  for (const project of projects) {
    if (!project.metrics) continue;
    project.metrics.forEach((metric, idx) => {
      if (typeof metric.value !== "string") {
        metricIssues.push(`${project.id}: metrics[${idx}].value must be string`);
      }
      if (!metric.label?.trim()) {
        metricIssues.push(`${project.id}: metrics[${idx}].label is empty`);
      }
    });
  }

  // Distributions
  const categoryDistribution = zeroCounts(CANONICAL_CATEGORIES);
  const mediaTypeDistribution = zeroCounts(["image", "video", "interactive", "pdf"] as const);
  for (const project of projects) {
    categoryDistribution[project.category] += 1;
    mediaTypeDistribution[project.media.type] += 1;
  }

  // Quality scoring
  let qualityScore = 100;
  const recommendations: string[] = [];

  if (duplicateIds.length > 0) {
    qualityScore -= 30;
    recommendations.push(`Resolve ${duplicateIds.length} duplicate project ID(s).`);
  }
  if (missingAssets.length > 0) {
    qualityScore -= Math.min(25, missingAssets.length * 5);
    recommendations.push(
      `Add ${missingAssets.length} missing asset(s) (thumbnails, posters, alt text).`
    );
  }
  if (orphanedFeatured.length > 0) {
    qualityScore -= Math.min(15, orphanedFeatured.length * 3);
    recommendations.push(
      `Set 'priority' for ${orphanedFeatured.length} featured item(s) to control ordering.`
    );
  }
  if (metricIssues.length > 0) {
    qualityScore -= Math.min(15, metricIssues.length * 2);
    recommendations.push(`Fix ${metricIssues.length} metric formatting issue(s).`);
  }

  // Featured balance heuristic
  const featuredCount = projects.filter((project) => project.featured).length;
  const featuredPct = projects.length ? (featuredCount / projects.length) * 100 : 0;
  if (featuredPct < 20) {
    qualityScore -= 10;
    recommendations.push("Feature more items (target ~20-30%) to strengthen category pages.");
  } else if (featuredPct > 50) {
    qualityScore -= 5;
    recommendations.push("Reduce featured items (too many reduces signal).");
  }

  // Category coverage heuristic
  const emptyCats = Object.values(categoryDistribution).filter((count) => count === 0).length;
  if (emptyCats > 0) {
    qualityScore -= emptyCats * 5;
    recommendations.push(`Add items for ${emptyCats} empty categor(ies).`);
  }

  const valid = duplicateIds.length === 0 && missingAssets.length === 0;

  return {
    valid,
    duplicateIds,
    missingAssets,
    orphanedFeatured,
    metricIssues,
    categoryDistribution,
    mediaTypeDistribution,
    qualityScore: Math.max(0, qualityScore),
    recommendations,
  };
};

/** Pretty logger for manual validation runs */
export const validatePortfolioData = (projects: Project[]): void => {
  const report = checkDataIntegrity(projects);

  console.log("Portfolio Data Validation Report");
  console.log("================================");
  console.log(`Quality Score: ${report.qualityScore}/100`);
  console.log(`Total Projects: ${projects.length}`);
  console.log(`Valid: ${report.valid ? "Yes" : "No"}`);

  if (report.duplicateIds.length) console.error("❌ Duplicate IDs:", report.duplicateIds);
  if (report.missingAssets.length) console.warn("⚠️  Missing Assets:", report.missingAssets);
  if (report.orphanedFeatured.length)
    console.warn(
      "⚠️  Featured items without priority:",
      report.orphanedFeatured.map((project) => project.id)
    );
  if (report.metricIssues.length) console.warn("⚠️  Metric Issues:", report.metricIssues);

  console.log("Category Distribution:", report.categoryDistribution);
  console.log("Media Type Distribution:", report.mediaTypeDistribution);

  if (report.recommendations.length) {
    console.log("\nRecommendations:");
    report.recommendations.forEach((rec, i) => {
      console.log(`${i + 1}. ${rec}`);
    });
  }

  if (report.qualityScore === 100) {
    console.log("✅ Portfolio data is in excellent condition!");
  } else if (report.qualityScore >= 80) {
    console.log("✅ Portfolio data quality is good.");
  } else if (report.qualityScore >= 60) {
    console.log("⚠️  Portfolio data quality needs improvement.");
  } else {
    console.log("❌ Portfolio data quality is poor – address issues ASAP.");
  }
};

/** CI-friendly pass/fail for pipelines */
export const quickValidationCheck = (projects: Project[]): boolean => {
  const report = checkDataIntegrity(projects);
  if (!report.valid) {
    console.error("Portfolio validation failed:", {
      duplicateIds: report.duplicateIds.length,
      missingAssets: report.missingAssets.length,
      qualityScore: report.qualityScore,
    });
    return false;
  }
  if (report.qualityScore < 70) {
    console.warn(`Portfolio quality score is low: ${report.qualityScore}/100`);
    return false;
  }
  return true;
};

// Type guards
export const isCategorySlug = (value: unknown): value is CategorySlug =>
  typeof value === "string" && CategorySchema.safeParse(value).success;

export const isMediaType = (value: unknown): value is MediaType =>
  typeof value === "string" && MediaTypeSchema.safeParse(value).success;

export const isValidProject = (value: unknown): value is Project => 
  validateProject(value) !== null;

// Migration helpers
export const migrateLegacyProject = (legacy: any): Project | null => {
  try {
    const categoryMappings: Record<string, CategorySlug> = {
      web: "web-development",
      video: "video-production",
      seo: "seo-services",
      automation: "marketing-services",
      "marketing-automation": "marketing-services",
      content: "content-production",
      leadgen: "lead-generation",
      "lead-gen": "lead-generation",
    };

    const migrated: any = {
      ...legacy,
      category: categoryMappings[String(legacy.category).toLowerCase()] ?? legacy.category,

      media:
        legacy.media ??
        ({
          type: legacy.video
            ? "video"
            : legacy.web
            ? "interactive"
            : ("image" as MediaType),
          src:
            legacy.video?.embedUrl ??
            legacy.web?.demoUrl ??
            legacy.thumbnail ??
            "",
          thumbnail: legacy.thumbnail,
          poster: legacy.video?.poster,
          alt: legacy.alt,
          title: legacy.web ? legacy.title : undefined,
        } as PortfolioMedia),

      metrics: Array.isArray(legacy.metrics)
        ? legacy.metrics.map((metric: any) => ({
            label: String(metric?.label ?? ""),
            value: String(metric?.value ?? ""),
          }))
        : undefined,
    };

    return validateProject(migrated);
  } catch (err) {
    console.error("[portfolio] Migration failed for project:", legacy?.id, err);
    return null;
  }
};

// Export schemas for external use
export { CategorySchema, MediaTypeSchema, MediaSchema, MetricSchema, ProjectSchema };