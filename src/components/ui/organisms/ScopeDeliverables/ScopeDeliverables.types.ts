// src/components/ui/organisms/ScopeDeliverables/ScopeDeliverables.types.ts

/**
 * Core scope data structure
 */
export interface ScopeData {
  /** Optional section title */
  title?: string;
  /** Optional section subtitle/description */
  subtitle?: string;
  /** Array of items included in the scope */
  includes: string[];
  /** Array of deliverable items */
  deliverables: string[];
  /** Optional array of add-on items */
  addons?: string[];
}

/**
 * Extended scope data with metadata
 */
export interface ExtendedScopeData extends ScopeData {
  /** Service category this scope belongs to */
  category?: string;
  /** Estimated timeline for completion */
  timeline?: string;
  /** Prerequisites before starting */
  prerequisites?: string[];
  /** Success criteria or acceptance criteria */
  successCriteria?: string[];
  /** Risk factors or considerations */
  risks?: string[];
  /** Team members or roles involved */
  teamInvolvement?: string[];
}

/**
 * Scope item with additional metadata
 */
export interface ScopeItem {
  /** Unique identifier */
  id: string;
  /** Display text */
  text: string;
  /** Optional description or tooltip */
  description?: string;
  /** Priority level */
  priority?: 'high' | 'medium' | 'low';
  /** Estimated effort or complexity */
  effort?: 'simple' | 'moderate' | 'complex';
  /** Dependencies on other items */
  dependencies?: string[];
  /** Category or grouping */
  category?: string;
  /** Whether this item is optional */
  optional?: boolean;
}

/**
 * Enhanced scope data using detailed items
 */
export interface DetailedScopeData {
  title?: string;
  subtitle?: string;
  includes: ScopeItem[];
  deliverables: ScopeItem[];
  addons?: ScopeItem[];
}

/**
 * Configuration for section display
 */
export interface ScopeSection {
  /** Section identifier */
  type: 'includes' | 'deliverables' | 'addons';
  /** Display title */
  title: string;
  /** Icon to display */
  icon: string;
  /** Color theme */
  theme: 'primary' | 'accent' | 'secondary';
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

/**
 * Analytics event data
 */
export interface ScopeAnalyticsEvent {
  /** Event type */
  action: 'view' | 'expand' | 'collapse' | 'item_click';
  /** Section involved */
  section: 'includes' | 'deliverables' | 'addons';
  /** Item text (for item_click events) */
  itemText?: string;
  /** Item index (for item_click events) */
  itemIndex?: number;
  /** Additional context */
  context?: Record<string, any>;
}

/**
 * Component state interface
 */
export interface ScopeDeliverablesState {
  /** Loading state for each section */
  loading: {
    includes: boolean;
    deliverables: boolean;
    addons: boolean;
  };
  /** Collapsed state for each section */
  collapsed: {
    includes: boolean;
    deliverables: boolean;
    addons: boolean;
  };
  /** Error state for each section */
  errors: {
    includes: string | null;
    deliverables: string | null;
    addons: string | null;
  };
}

/**
 * Validation result interface
 */
export interface ScopeValidationResult {
  /** Whether the scope data is valid */
  isValid: boolean;
  /** Array of validation errors */
  errors: string[];
  /** Array of validation warnings */
  warnings: string[];
  /** Suggested improvements */
  suggestions: string[];
}

/**
 * Export configuration for scope data
 */
export interface ScopeExportConfig {
  /** Format to export */
  format: 'json' | 'csv' | 'markdown' | 'pdf';
  /** Sections to include */
  sections: ('includes' | 'deliverables' | 'addons')[];
  /** Whether to include metadata */
  includeMetadata: boolean;
  /** Custom filename */
  filename?: string;
}

/**
 * Template configuration for predefined scopes
 */
export interface ScopeTemplate {
  /** Template identifier */
  id: string;
  /** Template name */
  name: string;
  /** Template description */
  description: string;
  /** Service category this template applies to */
  category: string;
  /** Default scope data */
  defaultScope: ScopeData;
  /** Whether template is customizable */
  customizable: boolean;
  /** Tags for filtering */
  tags: string[];
}

/**
 * Type guards for runtime validation
 */
export const isScopeData = (obj: any): obj is ScopeData => {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.includes) &&
    Array.isArray(obj.deliverables) &&
    (obj.addons === undefined || Array.isArray(obj.addons))
  );
};

export const isScopeItem = (obj: any): obj is ScopeItem => {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.text === 'string'
  );
};

export const isDetailedScopeData = (obj: any): obj is DetailedScopeData => {
  return (
    obj &&
    typeof obj === 'object' &&
    Array.isArray(obj.includes) &&
    Array.isArray(obj.deliverables) &&
    obj.includes.every(isScopeItem) &&
    obj.deliverables.every(isScopeItem) &&
    (obj.addons === undefined || (Array.isArray(obj.addons) && obj.addons.every(isScopeItem)))
  );
};

/**
 * Default section configurations
 */
export const DEFAULT_SCOPE_SECTIONS: ScopeSection[] = [
  {
    type: 'includes',
    title: 'Scope Includes',
    icon: '✓',
    theme: 'primary',
  },
  {
    type: 'deliverables',
    title: 'Deliverables',
    icon: '📋',
    theme: 'accent',
  },
  {
    type: 'addons',
    title: 'Optional Add-ons',
    icon: '+',
    theme: 'secondary',
  },
];

/**
 * Utility type for extracting section type from ScopeData
 */
export type ScopeDataKeys = keyof Pick<ScopeData, 'includes' | 'deliverables' | 'addons'>;

/**
 * Utility type for section-specific handlers
 */
export type ScopeSectionHandler<T = void> = (
  section: 'includes' | 'deliverables' | 'addons',
  ...args: any[]
) => T;