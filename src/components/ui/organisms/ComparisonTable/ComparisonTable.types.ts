// src/components/ui/organisms/ComparisonTable/ComparisonTable.types.ts

/**
 * ComparisonTable Types — Production Ready
 * - Exposes the component-level contract (columns/rows) used by ComparisonTable.tsx
 * - Adds service-page friendly contracts (tiers + features, grouped or flat)
 * - Includes legacy compatibility + utility guards
 */

// ============================================================================
// 1) Component-level contract (imported by ComparisonTable.tsx)
//    Keep this the single source of truth for the TSX component.
// ============================================================================

export type ComparisonColumn = {
  /** Column id (e.g., plan/tier id). */
  id: string;
  /** Header label to show. */
  label: string;
  /** Emphasize this column visually. */
  highlight?: boolean;
  /** Optional small badge/note in header, e.g., "Most popular". */
  note?: string;
};

export type FeatureValue = boolean | string | number | null | undefined;

export type ComparisonCell = {
  /** Must match a ComparisonColumn.id. */
  columnId: string;
  /** Value to render (✓/— for booleans; verbatim for string/number; em-dash for null/undefined). */
  value: FeatureValue;
};

export type ComparisonRow = {
  /** Stable id for the row. */
  id: string;
  /** Feature/row label shown in the first column. */
  label: string;
  /** Optional helper text shown under the label. */
  tooltip?: string;
  /** Optional footnote shown under the label. */
  footnote?: string;
  /** Optional category used for grouping. */
  group?: string;
  /** Values aligned to columns. */
  cells: ComparisonCell[];
};

export interface ComparisonTableProps {
  /** Ordered columns (become table headers). */
  columns: ComparisonColumn[];
  /** Flat list of rows (groups derived from row.group). */
  rows: ComparisonRow[];

  /** Optional UI affordances. */
  title?: string;
  subtitle?: string;
  /** Sticks header on scroll (default true in component). */
  stickyHeader?: boolean;
  /** Compact cell padding. */
  dense?: boolean;
  /** Show ✓/— legend when any boolean values exist (default true). */
  showLegends?: boolean;
  /** Optional wrapper className. */
  className?: string;
}

// ============================================================================
// 2) Service Page Integration Shapes (tiers + features)
//    Use these in data files; adapters map → component contract.
// ============================================================================

/** Minimal tier info for column headers. */
export interface ComparisonTier {
  /** Unique id (must match keys in feature value maps). */
  id: string;
  /** Display name for the column. */
  name: string;
  /** Optional badge to render in the header. */
  badge?: string;
}

/** Flat feature row used by many pricing data files. */
export interface FlatComparisonRow {
  /** Row label in the first column (e.g., "Filming days"). */
  label: string;
  /** Optional helper/tooltip copy displayed below the label. */
  helpText?: string;
  /**
   * Map of tierId -> value
   * - boolean => ✓ / —
   * - string/number => rendered verbatim
   */
  values: Record<string, boolean | string | number>;
}

/** Grouped input when you want categories with multiple rows. */
export interface GroupedComparisonFeature {
  /** Section header above this group. */
  category: string;
  /** Rows within the group. */
  features: {
    /** Row label shown in the first column. */
    name: string;
    /** Optional helper/tooltip copy displayed below the label. */
    helpText?: string;
    /**
     * Map of tierId -> value
     * - boolean => ✓ / —
     * - string/number => rendered verbatim
     */
    plans: Record<string, boolean | string | number>;
  }[];
}

/** Service data can be flat or grouped. */
export type AnyComparisonInput = Array<FlatComparisonRow | GroupedComparisonFeature>;

/** Flexible input aliases sometimes found in upstream data. */
export type ComparisonInput =
  | AnyComparisonInput
  | { items?: AnyComparisonInput }
  | { features?: AnyComparisonInput }
  | { data?: AnyComparisonInput }
  | null
  | undefined;

/** Page-level section contract for service pages. */
export interface ComparisonSection {
  title?: string;
  subtitle?: string;
  tiers: ComparisonTier[];
  features: AnyComparisonInput;
  variant?: "default" | "detailed" | "minimal";
  /** Preferred highlighted tier id (adapters map to `highlight` on a column). */
  highlightTier?: string;
  stickyHeader?: boolean;
}

// Service-specific aliases (handy for imports)
export type WebDevComparisonSection = ComparisonSection;
export type VideoComparisonSection = ComparisonSection;
export type LeadGenComparisonSection = ComparisonSection;
export type MarketingAutomationComparisonSection = ComparisonSection;
export type SEOServicesComparisonSection = ComparisonSection;
export type ContentProductionComparisonSection = ComparisonSection;

// ============================================================================
// 3) Legacy Compatibility (keep while migrating older data)
// ============================================================================

export interface LegacyComparisonData {
  /** Some older modules used this name. */
  comparisonData?: AnyComparisonInput;
  /** Others used "featureMatrix". */
  featureMatrix?: AnyComparisonInput;
  /** Some exported tier arrays as "packages". */
  packages?: ComparisonTier[];
  /** Section heading variations. */
  sectionTitle?: string;
  heading?: string;
}

/** Backwards-compatible prop bag (compose with adapters before usage). */
export interface ComparisonTablePropsWithLegacy
  extends ComparisonTableProps,
    LegacyComparisonData {}

// ============================================================================
// 4) Validation & Transformation Contracts (for utils/adapters)
// ============================================================================

export interface ComparisonTransformer {
  /** Normalize to grouped structure (for predictable rendering/adapters). */
  normalizeFeatures: (input: AnyComparisonInput) => GroupedComparisonFeature[];
  /** Extract tier ids referenced by feature values. */
  extractTierIds: (input: AnyComparisonInput) => string[];
  /** Type/shape check for features payload. */
  validate: (data: unknown) => data is AnyComparisonInput;
}

export interface ComparisonValidator {
  /** Validate the table configuration and collect issues. */
  validateTable: (props: unknown) => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
  /** Ensure each row has values for all tiers, report gaps. */
  validateCompleteness: (
    tiers: ComparisonTier[],
    features: AnyComparisonInput
  ) => {
    isComplete: boolean;
    missing: string[];
  };
}

// ============================================================================
// 5) Advanced Config (optional; for themed/interactive variants)
// ============================================================================

export interface ComparisonThemeConfig {
  colorScheme?: "default" | "branded" | "minimal";
  highlightColor?: string;
  borderStyle?: "subtle" | "prominent" | "none";
}

export interface ComparisonBehaviorConfig {
  enableSorting?: boolean;
  enableFiltering?: boolean;
  mobileBreakpoint?: number;
  /** Adapter may auto-flag a “recommended” tier to highlight. */
  autoHighlight?: boolean;
}

export interface AdvancedComparisonSection extends ComparisonSection {
  theme?: ComparisonThemeConfig;
  behavior?: ComparisonBehaviorConfig;
  /** Arbitrary CSS custom properties (e.g., { '--ct-accent': '#...' }). */
  customStyles?: Record<string, string>;
}

// ============================================================================
// 6) Programmatic Generation Helpers
// ============================================================================

/** Matrix of feature → { tierId -> value }. */
export type FeatureMatrix = Record<string, Record<string, FeatureValue>>;

export interface TierConfig {
  tier: ComparisonTier;
  styles?: Record<string, string>;
  metadata?: {
    recommended?: boolean;
    complexity?: "basic" | "standard" | "premium";
    targetAudience?: string;
  };
}

export interface FeatureConfig {
  feature: {
    name: string;
    category?: string;
    helpText?: string;
    priority?: number;
  };
  values: Record<string, FeatureValue>;
  metadata?: {
    importance?: "low" | "medium" | "high";
    technical?: boolean;
    visible?: boolean;
  };
}

// ============================================================================
// 7) Type Guards
// ============================================================================

export function isFlatComparisonRowArray(value: unknown): value is FlatComparisonRow[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0] as any;
  return typeof first?.label === "string" && typeof first?.values === "object";
}

export function isGroupedComparisonFeatureArray(
  value: unknown
): value is GroupedComparisonFeature[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  const first = value[0] as any;
  return typeof first?.category === "string" && Array.isArray(first?.features);
}

export function isComparisonTier(value: unknown): value is ComparisonTier {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as any).id === "string" &&
    typeof (value as any).name === "string"
  );
}

export function isComparisonSection(value: unknown): value is ComparisonSection {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as any).tiers) &&
    Array.isArray((value as any).features)
  );
}
