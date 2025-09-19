// src/components/ui/organisms/ComparisonTable/adapters.ts

import type {
  // Component-level contract
  ComparisonColumn,
  ComparisonRow,
  ComparisonCell,
  ComparisonTableProps,
  // Service-page contracts
  ComparisonTier,
  FlatComparisonRow,
  GroupedComparisonFeature,
  AnyComparisonInput,
  ComparisonSection,
  WebDevComparisonSection,
  VideoComparisonSection,
  LeadGenComparisonSection,
  MarketingAutomationComparisonSection,
  SEOServicesComparisonSection,
  ContentProductionComparisonSection,
} from "./ComparisonTable.types";

import {
  normalizeComparisonInput,
  extractTierIds,
} from "./utils/comparisonTableValidator";

/**
 * Data adapters for ComparisonTable component
 * - Normalizes "tiers + features" into component columns/rows
 * - Keeps a strict import-only relationship to the shared types
 * - Safe for both flat and grouped inputs
 */

// ============================================================================
// Core transformation: tiers + features -> { columns, rows }
// ============================================================================

/**
 * Convert service-page data (tiers + features) into the component contract.
 * - Highlights the column whose tier id equals `highlightTierId`,
 *   otherwise highlights the first tier with a `badge`.
 * - Supports flat rows and grouped features.
 */
export function toColumnsAndRows(args: {
  tiers: ComparisonTier[];
  features: AnyComparisonInput;
  highlightTierId?: string;
}): { columns: ComparisonColumn[]; rows: ComparisonRow[] } {
  const { tiers, features, highlightTierId } = args;

  const tierIds = tiers.map((t) => t.id);
  const highlight = highlightTierId || tiers.find((t) => t.badge)?.id;

  const columns: ComparisonColumn[] = tiers.map((t) => ({
    id: t.id,
    label: t.name,
    note: t.badge,
    highlight: !!highlight && t.id === highlight,
  }));

  const grouped = normalizeComparisonInput(features); // → GroupedComparisonFeature[]
  // Produce flat rows with a group label (for table sections)
  const rows: ComparisonRow[] = [];
  grouped.forEach((group) => {
    group.features.forEach((feat, idx) => {
      const cells: ComparisonCell[] = tierIds.map((tid) => ({
        columnId: tid,
        // allow boolean | string | number | null | undefined
        value: (feat.plans as Record<string, unknown>)[tid] as
          | boolean
          | string
          | number
          | null
          | undefined,
      }));

      rows.push({
        id: `${group.category}-${idx}-${feat.name}`,
        label: feat.name,
        tooltip: feat.helpText,
        group: group.category || "Features",
        cells,
      });
    });
  });

  return { columns, rows };
}

/**
 * Convenience: Build { columns, rows } directly from a ComparisonSection.
 */
export function sectionToColumnsAndRows(
  section: ComparisonSection
): { columns: ComparisonColumn[]; rows: ComparisonRow[] } {
  return toColumnsAndRows({
    tiers: section.tiers,
    features: section.features,
    highlightTierId: section.highlightTier,
  });
}

/**
 * Convenience: Build full ComparisonTableProps from a ComparisonSection.
 * Title/subtitle/sticky are passed through for the component header/behavior.
 */
export function sectionToTableProps(
  section: ComparisonSection
): ComparisonTableProps {
  const { columns, rows } = sectionToColumnsAndRows(section);
  return {
    columns,
    rows,
    title: section.title,
    subtitle: section.subtitle,
    stickyHeader: section.stickyHeader ?? true,
    showLegends: true,
  };
}

// ============================================================================
// Page-friendly creators (kept from your draft, now using shared types)
// ============================================================================

export const createComparisonTableProps = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  options: Partial<ComparisonTableProps> = {}
): ComparisonTableProps => {
  const { columns, rows } = toColumnsAndRows({ tiers, features });
  return {
    columns,
    rows,
    title: "Feature Comparison",
    subtitle: "Compare what's included in each package",
    stickyHeader: true,
    showLegends: true,
    ...options,
  };
};

export const createComparisonTier = (data: {
  id: string;
  name: string;
  badge?: string;
  featured?: boolean;
}): ComparisonTier => ({
  id: data.id,
  name: data.name,
  badge: data.featured ? data.badge || "Most Popular" : data.badge,
});

export const createFlatComparisonRow = (
  label: string,
  values: Record<string, boolean | string | number>,
  helpText?: string
): FlatComparisonRow => ({
  label,
  helpText,
  values,
});

export const createGroupedComparisonFeature = (
  category: string,
  features: Array<{
    name: string;
    plans: Record<string, boolean | string | number>;
    helpText?: string;
  }>
): GroupedComparisonFeature => ({
  category,
  features,
});

// ============================================================================
// Service-specific ComparisonSection creators
// ============================================================================

export const createWebDevComparisonSection = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  overrides: Partial<WebDevComparisonSection> = {}
): WebDevComparisonSection => ({
  title: "Web Development Packages Comparison",
  subtitle: "See exactly what's included in each web development package",
  tiers,
  features,
  variant: "detailed",
  highlightTier: overrides.highlightTier ?? tiers.find((t) => t.badge)?.id,
  stickyHeader: true,
  ...overrides,
});

export const createVideoComparisonSection = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  overrides: Partial<VideoComparisonSection> = {}
): VideoComparisonSection => ({
  title: "Video Production Packages Comparison",
  subtitle: "Compare video production features and deliverables across packages",
  tiers,
  features,
  variant: "detailed",
  highlightTier: overrides.highlightTier ?? tiers.find((t) => t.badge)?.id,
  stickyHeader: true,
  ...overrides,
});

export const createLeadGenComparisonSection = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  overrides: Partial<LeadGenComparisonSection> = {}
): LeadGenComparisonSection => ({
  title: "Lead Generation Packages Comparison",
  subtitle: "Compare lead generation features and monthly deliverables",
  tiers,
  features,
  variant: "default",
  highlightTier: overrides.highlightTier ?? tiers.find((t) => t.badge)?.id,
  stickyHeader: true,
  ...overrides,
});

export const createMarketingAutomationComparisonSection = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  overrides: Partial<MarketingAutomationComparisonSection> = {}
): MarketingAutomationComparisonSection => ({
  title: "Marketing Automation Packages Comparison",
  subtitle: "Compare automation features and platform integrations",
  tiers,
  features,
  variant: "detailed",
  highlightTier: overrides.highlightTier ?? tiers.find((t) => t.badge)?.id,
  stickyHeader: true,
  ...overrides,
});

export const createSEOServicesComparisonSection = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  overrides: Partial<SEOServicesComparisonSection> = {}
): SEOServicesComparisonSection => ({
  title: "SEO Services Packages Comparison",
  subtitle: "Compare SEO features and monthly optimization activities",
  tiers,
  features,
  variant: "default",
  highlightTier: overrides.highlightTier ?? tiers.find((t) => t.badge)?.id,
  stickyHeader: true,
  ...overrides,
});

export const createContentProductionComparisonSection = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  overrides: Partial<ContentProductionComparisonSection> = {}
): ContentProductionComparisonSection => ({
  title: "Content Production Packages Comparison",
  subtitle: "Compare content creation features and monthly deliverables",
  tiers,
  features,
  variant: "default",
  highlightTier: overrides.highlightTier ?? tiers.find((t) => t.badge)?.id,
  stickyHeader: true,
  ...overrides,
});

// ============================================================================
// Data format adapters & external sources (unchanged except for number support)
// ============================================================================

export const pricingTiersToComparisonTiers = (
  pricingTiers: Array<{
    id: string;
    name: string;
    featured?: boolean;
    badge?: string;
  }>
): ComparisonTier[] => pricingTiers.map((t) => createComparisonTier(t));

export const capabilitiesToComparisonFeatures = (
  capabilities: Array<{
    name: string;
    description?: string;
    tiers: Record<string, boolean | string | number>;
  }>,
  category = "Capabilities"
): GroupedComparisonFeature => ({
  category,
  features: capabilities.map((cap) => ({
    name: cap.name,
    helpText: cap.description,
    plans: cap.tiers,
  })),
});

export const featureMatrixToComparison = (
  matrix: Record<string, Record<string, boolean | string | number>>,
  categories?: Record<string, string[]>
): AnyComparisonInput => {
  if (!categories) {
    // Flat
    return Object.entries(matrix).map(([feature, tiers]) => ({
      label: feature,
      values: tiers,
    }));
  }
  // Grouped
  return Object.entries(categories).map(([category, featureNames]) => ({
    category,
    features: featureNames
      .filter((name) => matrix[name])
      .map((name) => ({ name, plans: matrix[name] })),
  }));
};

// Airtable / Notion / CSV adapters (accept numbers too)

export const airtableComparisonAdapter = (
  airtableData: Array<{
    id: string;
    fields: {
      Feature: string;
      Category?: string;
      Description?: string;
      [tierKey: string]: any;
    };
  }>,
  tierMapping: Record<string, string>
): AnyComparisonInput => {
  const groupedFeatures: Record<string, GroupedComparisonFeature["features"]> = {};
  airtableData.forEach((record) => {
    const category = record.fields.Category || "Features";
    const feature = record.fields.Feature;
    const description = record.fields.Description;

    if (!groupedFeatures[category]) groupedFeatures[category] = [];

    const plans: Record<string, boolean | string | number> = {};
    Object.entries(tierMapping).forEach(([airtableField, tierId]) => {
      const value = record.fields[airtableField];
      if (
        typeof value === "boolean" ||
        typeof value === "string" ||
        typeof value === "number"
      ) {
        plans[tierId] = value;
      }
    });

    groupedFeatures[category].push({ name: feature, helpText: description, plans });
  });

  return Object.entries(groupedFeatures).map(([category, features]) => ({
    category,
    features,
  }));
};

export const notionComparisonAdapter = (
  notionData: Array<{
    id: string;
    properties: {
      Feature: { title: Array<{ plain_text: string }> };
      Category: { select?: { name: string } };
      Description: { rich_text: Array<{ plain_text: string }> };
      [tierProperty: string]: any;
    };
  }>,
  tierPropertyMapping: Record<string, string>
): AnyComparisonInput => {
  const groupedFeatures: Record<string, GroupedComparisonFeature["features"]> = {};

  notionData.forEach((page) => {
    const feature = page.properties.Feature.title[0]?.plain_text || "Unnamed Feature";
    const category = page.properties.Category.select?.name || "Features";
    const description =
      page.properties.Description.rich_text.map((t: any) => t.plain_text).join("") ||
      undefined;

    if (!groupedFeatures[category]) groupedFeatures[category] = [];

    const plans: Record<string, boolean | string | number> = {};
    Object.entries(tierPropertyMapping).forEach(([notionProperty, tierId]) => {
      const prop = page.properties[notionProperty];
      let value: boolean | string | number | undefined;

      if (prop?.type === "checkbox") value = prop.checkbox;
      else if (prop?.type === "number") value = prop.number;
      else if (prop?.type === "rich_text")
        value = prop.rich_text?.map((t: any) => t.plain_text).join("");
      else if (prop?.type === "select") value = prop.select?.name;

      if (value !== undefined && value !== "") plans[tierId] = value as any;
    });

    groupedFeatures[category].push({ name: feature, helpText: description, plans });
  });

  return Object.entries(groupedFeatures).map(([category, features]) => ({
    category,
    features,
  }));
};

export const csvComparisonAdapter = (
  csvData: Array<Record<string, string>>,
  config: {
    featureColumn: string;
    categoryColumn?: string;
    descriptionColumn?: string;
    tierColumns: Record<string, string>; // csvColumn -> tierId
  }
): AnyComparisonInput => {
  const groupedFeatures: Record<string, GroupedComparisonFeature["features"]> = {};

  csvData.forEach((row) => {
    const feature = row[config.featureColumn];
    const category = config.categoryColumn ? row[config.categoryColumn] || "Features" : "Features";
    const description = config.descriptionColumn ? row[config.descriptionColumn] : undefined;
    if (!feature) return;

    if (!groupedFeatures[category]) groupedFeatures[category] = [];

    const plans: Record<string, boolean | string | number> = {};
    Object.entries(config.tierColumns).forEach(([csvColumn, tierId]) => {
      const raw = row[csvColumn];
      if (raw == null || raw === "") return;

      const lower = raw.toLowerCase();
      if (["true", "yes", "1"].includes(lower)) plans[tierId] = true;
      else if (["false", "no", "0"].includes(lower)) plans[tierId] = false;
      else {
        const asNum = Number(raw);
        plans[tierId] = Number.isFinite(asNum) && raw.trim() !== "" ? asNum : raw;
      }
    });

    groupedFeatures[category].push({ name: feature, helpText: description, plans });
  });

  return Object.entries(groupedFeatures).map(([category, features]) => ({
    category,
    features,
  }));
};

// ============================================================================
// Legacy migration helpers (now number-compatible)
// ============================================================================

export const legacyComparisonMigrationAdapter = (legacyData: {
  tiers: Array<{
    id?: string;
    title?: string; // name
    label?: string; // name alt
    popular?: boolean; // badge
    recommended?: boolean; // badge alt
  }>;
  features: Array<{
    feature?: string; // label/name
    description?: string; // helpText
    values?: Record<string, boolean | string | number>;
  }>;
}): {
  tiers: ComparisonTier[];
  features: FlatComparisonRow[];
} => {
  const tiers = legacyData.tiers.map((tier, index) => ({
    id: tier.id || `tier-${index}`,
    name: tier.title || tier.label || `Tier ${index + 1}`,
    badge: tier.popular || tier.recommended ? "Popular" : undefined,
  }));

  const features = legacyData.features.map((f) => ({
    label: f.feature || "Feature",
    helpText: f.description,
    values: f.values || {},
  }));

  return { tiers, features };
};

// ============================================================================
// Page integration helpers
// ============================================================================

export const createComparisonPageSection = <T extends ComparisonSection>(
  serviceName: string,
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  adapter: (tiers: ComparisonTier[], features: AnyComparisonInput, overrides?: Partial<T>) => T,
  customOptions: Partial<T> = {}
) => {
  const section = adapter(tiers, features, customOptions);
  const { columns, rows } = sectionToColumnsAndRows(section);

  return {
    id: `${serviceName}-comparison`,
    title: section.title,
    subtitle: section.subtitle,
    component: "ComparisonTable" as const,
    props: {
      columns,
      rows,
      title: section.title,
      subtitle: section.subtitle,
      stickyHeader: section.stickyHeader ?? true,
      showLegends: true,
    } satisfies ComparisonTableProps,
  };
};

const serviceComparisonAdapters = {
  "web-development": createWebDevComparisonSection,
  "video-production": createVideoComparisonSection,
  "lead-generation": createLeadGenComparisonSection,
  "marketing-automation": createMarketingAutomationComparisonSection,
  "seo-services": createSEOServicesComparisonSection,
  "content-production": createContentProductionComparisonSection,
} as const;

export const createServicePageComparison = (
  serviceName: keyof typeof serviceComparisonAdapters,
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  customOptions: Partial<ComparisonSection> = {}
) => {
  const adapter = serviceComparisonAdapters[serviceName];
  return adapter(tiers, features, customOptions);
};

// ============================================================================
// Utilities that work on normalized groups
// ============================================================================

export const filterFeaturesByCategory = (
  features: AnyComparisonInput,
  categories: string[]
): AnyComparisonInput => normalizeComparisonInput(features).filter((g) => categories.includes(g.category));

export const combineFeatureGroups = (
  ...groups: GroupedComparisonFeature[]
): GroupedComparisonFeature[] => {
  const combined: Record<string, GroupedComparisonFeature["features"]> = {};
  groups.forEach((g) => {
    if (!combined[g.category]) combined[g.category] = [];
    combined[g.category].push(...g.features);
  });
  return Object.entries(combined).map(([category, features]) => ({ category, features }));
};

export const ensureDataCompleteness = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput,
  defaultValue: boolean | string | number = false
): AnyComparisonInput => {
  const tierIds = tiers.map((t) => t.id);
  const normalized = normalizeComparisonInput(features);
  return normalized.map((group) => ({
    ...group,
    features: group.features.map((f) => {
      const plans = { ...f.plans };
      tierIds.forEach((id) => {
        if (!(id in plans)) plans[id] = defaultValue;
      });
      return { ...f, plans };
    }),
  }));
};

export const sortTiersByComplexity = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput
): ComparisonTier[] => {
  const normalized = normalizeComparisonInput(features);
  return [...tiers].sort((a, b) => {
    let aScore = 0;
    let bScore = 0;
    normalized.forEach((group) =>
      group.features.forEach((feat) => {
        const av = feat.plans[a.id];
        const bv = feat.plans[b.id];
        if (av === true) aScore++;
        if (bv === true) bScore++;
        if (typeof av === "string" && av !== "—" && av !== "No") aScore++;
        if (typeof bv === "string" && bv !== "—" && bv !== "No") bScore++;
        if (typeof av === "number") aScore++;
        if (typeof bv === "number") bScore++;
      })
    );
    return aScore - bScore; // basic -> premium
  });
};

export const createFeatureSummary = (
  tiers: ComparisonTier[],
  features: AnyComparisonInput
): Record<string, { total: number; included: number; percentage: number }> => {
  const normalized = normalizeComparisonInput(features);
  const summary: Record<string, { total: number; included: number; percentage: number }> = {};

  tiers.forEach((tier) => {
    let total = 0;
    let included = 0;
    normalized.forEach((group) =>
      group.features.forEach((feat) => {
        total++;
        const v = feat.plans[tier.id];
        if (v === true) included++;
        else if (typeof v === "string" && v !== "—" && v !== "No") included++;
        else if (typeof v === "number") included++;
      })
    );
    summary[tier.id] = { total, included, percentage: Math.round((included / total) * 100) };
  });

  return summary;
};

export const createServiceComparisonSections = (services: Array<{
  name: string;
  tiers: ComparisonTier[];
  features: AnyComparisonInput;
  adapter: (
    tiers: ComparisonTier[],
    features: AnyComparisonInput,
    overrides?: any
  ) => ComparisonSection;
  options?: Partial<ComparisonSection>;
}>) =>
  services.map((s) =>
    createComparisonPageSection(s.name, s.tiers, s.features, s.adapter, s.options)
  );
