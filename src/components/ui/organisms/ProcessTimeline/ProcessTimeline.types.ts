// src/components/ui/organisms/ProcessTimeline/ProcessTimeline.types.ts

/**
 * Process Timeline Component Types
 * Interactive timeline showing service delivery phases and workflows
 */

// ============================================================================
// Core Types
// ============================================================================

export type DurationUnit = "days" | "weeks" | "months";

export type Owner = "client" | "studio" | "shared";

export type PhaseStatus = "upcoming" | "active" | "complete" | "in-progress" | "pending" | "blocked";

export interface DurationObject {
  /** Minimum duration */
  min: number;
  /** Maximum duration */
  max: number;
  /** Time unit */
  unit: DurationUnit;
}

export interface ProcessPhase {
  /** Unique identifier */
  id: string;
  /** Step number (auto-generated if omitted) */
  stepNumber?: number;
  /** Phase title */
  title: string;
  /** Phase description */
  description: string;
  /** Phase icon identifier */
  icon?: string;
  
  // Duration handling (flexible input)
  /** Duration as string ("1-2 weeks") or structured object */
  duration?: string | DurationObject;
  /** Explicit duration label for display */
  durationLabel?: string;
  /** Explicit structured duration data */
  durationData?: DurationObject;
  
  // Phase details
  /** Key activities in this phase */
  activities?: string[];
  /** Required client inputs */
  clientInputs?: string[];
  /** Phase deliverables */
  deliverables?: string[];
  /** Approval requirements */
  approval?: string;
  /** Phase owner/responsibility */
  owner?: Owner;
  /** Current phase status */
  status?: PhaseStatus;
  
  // Visual & interaction
  /** Custom styling class */
  className?: string;
  /** Whether phase is interactive */
  interactive?: boolean;
  /** Click handler for phase */
  onClick?: () => void;
  /** Completion percentage (0-100) */
  progress?: number;
  
  // Dependencies & relationships
  /** Phase dependencies */
  dependencies?: string[];
  /** Prerequisites before starting */
  prerequisites?: string[];
  /** Estimated start date */
  startDate?: string;
  /** Estimated end date */
  endDate?: string;
  
  // Additional metadata
  /** Phase complexity level */
  complexity?: "low" | "medium" | "high";
  /** Risk level */
  riskLevel?: "low" | "medium" | "high";
  /** Team members involved */
  teamMembers?: string[];
  /** Phase notes or additional info */
  notes?: string;
  /** External resources or links */
  resources?: Array<{
    title: string;
    url: string;
    type?: "document" | "tool" | "reference";
  }>;
}

export interface ProcessTimelineProps {
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  
  // Data
  /** Process phases (preferred field name) */
  phases?: ProcessPhase[];
  /** Legacy alias for phases */
  steps?: Partial<ProcessPhase>[];
  
  // Visual configuration
  /** Timeline visual variant */
  variant?: "vertical" | "horizontal" | "detailed" | "compact" | "cards";
  /** Timeline layout orientation */
  orientation?: "vertical" | "horizontal";
  /** Enable interactive features */
  interactive?: boolean;
  /** Show overall progress indicator */
  showProgress?: boolean;
  /** Timeline size */
  size?: "small" | "medium" | "large";
  
  // Content visibility toggles
  /** Show phase activities */
  showActivities?: boolean;
  /** Show required client inputs */
  showClientInputs?: boolean;
  /** Show phase deliverables */
  showDeliverables?: boolean;
  /** Show approval requirements */
  showApproval?: boolean;
  /** Show duration information */
  showDuration?: boolean;
  /** Show phase status */
  showStatus?: boolean;
  /** Show phase owners */
  showOwners?: boolean;
  /** Show dependencies */
  showDependencies?: boolean;
  /** Show team members */
  showTeamMembers?: boolean;
  /** Show phase progress bars */
  showPhaseProgress?: boolean;
  
  // Interaction & behavior
  /** Enable collapsible phases */
  collapsible?: boolean;
  /** Default expanded state */
  defaultOpen?: number | "all" | "none" | number[];
  /** Show computed timeline summary */
  showSummary?: boolean;
  /** Enable drag and drop reordering */
  enableReordering?: boolean;
  /** Enable phase filtering */
  enableFiltering?: boolean;
  
  // Styling
  /** Additional CSS classes */
  className?: string;
  /** Custom color scheme */
  colorScheme?: "default" | "blue" | "green" | "purple" | "orange" | "custom";
  /** Custom theme colors */
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  
  // Callbacks
  /** Custom CTA renderer for each phase */
  ctaRenderer?: (phase: ProcessPhase) => React.ReactNode;
  /** Phase click handler */
  onPhaseClick?: (phase: ProcessPhase, index: number) => void;
  /** Phase status change handler */
  onStatusChange?: (phase: ProcessPhase, newStatus: PhaseStatus) => void;
  /** Timeline completion handler */
  onTimelineComplete?: (phases: ProcessPhase[]) => void;
  
  // Advanced features
  /** Enable real-time updates */
  realTimeUpdates?: boolean;
  /** Enable phase templates */
  enableTemplates?: boolean;
  /** Show estimated vs actual timeline */
  showEstimatedVsActual?: boolean;
  /** Enable milestone markers */
  showMilestones?: boolean;
  /** Custom milestone renderer */
  milestoneRenderer?: (phase: ProcessPhase) => React.ReactNode;
}

// ============================================================================
// Service-Specific Type Exports
// ============================================================================

export interface WebDevProcessTimeline extends ProcessTimelineProps {
  phases: ProcessPhase[];
}

export interface VideoProductionProcessTimeline extends ProcessTimelineProps {
  phases: ProcessPhase[];
}

export interface LeadGenerationProcessTimeline extends ProcessTimelineProps {
  phases: ProcessPhase[];
}

export interface MarketingAutomationProcessTimeline extends ProcessTimelineProps {
  phases: ProcessPhase[];
}

export interface SEOServicesProcessTimeline extends ProcessTimelineProps {
  phases: ProcessPhase[];
}

export interface ContentProductionProcessTimeline extends ProcessTimelineProps {
  phases: ProcessPhase[];
}

// ============================================================================
// Input Validation Types
// ============================================================================

/**
 * Flexible input format for process timeline data
 * Supports various data source structures
 */
export type ProcessTimelineInput = 
  | ProcessPhase[]
  | { phases?: ProcessPhase[] }
  | { steps?: ProcessPhase[] }
  | { timeline?: ProcessPhase[] }
  | { process?: ProcessPhase[] }
  | { workflow?: ProcessPhase[] }
  | null
  | undefined;

/**
 * Section-level props for service pages
 */
export interface ProcessTimelineSection {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Timeline data in various formats */
  data: ProcessTimelineInput;
  /** Display configuration */
  config?: Partial<ProcessTimelineProps>;
  /** Service-specific filtering */
  serviceFilter?: string;
  /** Maximum number of phases to display */
  limit?: number;
}

// ============================================================================
// Legacy Support Types
// ============================================================================

/**
 * Legacy field mappings for backward compatibility
 */
export interface LegacyProcessPhase {
  id?: string;
  
  // Title fields (canonical: title)
  title?: string;
  name?: string;           // alias
  stepTitle?: string;      // alias
  
  // Description fields (canonical: description)
  description?: string;
  summary?: string;        // alias
  details?: string;        // alias
  content?: string;        // alias
  
  // Duration fields (canonical: duration, durationLabel, durationData)
  duration?: string | DurationObject;
  timeframe?: string;      // alias
  timeline?: string;       // alias
  durationLabel?: string;
  durationData?: DurationObject;
  
  // Activities fields (canonical: activities)
  activities?: string[];
  tasks?: string[];        // alias
  actions?: string[];      // alias
  
  // Client input fields (canonical: clientInputs)
  clientInputs?: string[];
  clientRequirements?: string[];  // alias
  required?: string[];            // alias
  
  // Deliverables fields (canonical: deliverables)
  deliverables?: string[];
  outputs?: string[];      // alias
  results?: string[];      // alias
  
  // Status fields (canonical: status)
  status?: PhaseStatus;
  state?: string;          // alias
  
  // Other legacy fields
  stepNumber?: number;
  phase?: number;          // alias
  step?: number;           // alias
  icon?: string;
  approval?: string;
  owner?: Owner;
  progress?: number;
}

/**
 * Legacy timeline step interface (backward compatibility)
 */
export interface TimelineStep extends ProcessPhase {}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Timeline behavior configuration
 */
export interface TimelineConfig {
  interactive: boolean;
  collapsible: boolean;
  showProgress: boolean;
  showSummary: boolean;
  enableReordering: boolean;
  enableFiltering: boolean;
  realTimeUpdates: boolean;
  defaultOpen: number | "all" | "none" | number[];
  autoAdvance: boolean;
  autoAdvanceInterval?: number;
}

/**
 * Timeline visual styling configuration
 */
export interface TimelineStyling {
  variant: "vertical" | "horizontal" | "detailed" | "compact" | "cards";
  orientation: "vertical" | "horizontal";
  size: "small" | "medium" | "large";
  colorScheme: "default" | "blue" | "green" | "purple" | "orange" | "custom";
  showConnectors: boolean;
  connectorStyle: "line" | "dotted" | "dashed" | "curved";
  cardSpacing: "compact" | "normal" | "spacious";
  animationEnabled: boolean;
  animationType: "fade" | "slide" | "scale" | "bounce";
}

/**
 * Content visibility configuration
 */
export interface ContentVisibility {
  showActivities: boolean;
  showClientInputs: boolean;
  showDeliverables: boolean;
  showApproval: boolean;
  showDuration: boolean;
  showStatus: boolean;
  showOwners: boolean;
  showDependencies: boolean;
  showTeamMembers: boolean;
  showPhaseProgress: boolean;
  showMilestones: boolean;
}

/**
 * Complete timeline configuration combining all aspects
 */
export interface ProcessTimelineConfiguration {
  behavior: Partial<TimelineConfig>;
  styling: Partial<TimelineStyling>;
  visibility: Partial<ContentVisibility>;
  accessibility: {
    enableKeyboardNavigation: boolean;
    announcePhaseChanges: boolean;
    reduceAnimations: boolean;
    highContrast: boolean;
  };
}

// ============================================================================
// Event Handler Types
// ============================================================================

export type PhaseClickHandler = (phase: ProcessPhase, index: number) => void;
export type PhaseStatusChangeHandler = (phase: ProcessPhase, newStatus: PhaseStatus) => void;
export type TimelineCompleteHandler = (phases: ProcessPhase[]) => void;
export type PhaseReorderHandler = (fromIndex: number, toIndex: number) => void;
export type TimelineStateChangeHandler = (state: {
  currentPhase: number;
  completedPhases: number[];
  totalPhases: number;
  overallProgress: number;
}) => void;

// ============================================================================
// Filter and Sort Types
// ============================================================================

export interface ProcessTimelineFilter {
  status?: PhaseStatus[];
  owner?: Owner[];
  complexity?: Array<"low" | "medium" | "high">;
  riskLevel?: Array<"low" | "medium" | "high">;
  duration?: {
    min: number;
    max: number;
    unit: DurationUnit;
  };
  hasDeliverables?: boolean;
  hasApproval?: boolean;
  teamMembers?: string[];
}

export interface ProcessTimelineSortOptions {
  field: "stepNumber" | "title" | "duration" | "status" | "complexity" | "startDate";
  direction: "asc" | "desc";
  groupBy?: "status" | "owner" | "complexity";
}

// ============================================================================
// Analytics and Tracking Types
// ============================================================================

export interface ProcessTimelineAnalytics {
  trackPhaseViews: boolean;
  trackPhaseClicks: boolean;
  trackTimelineProgress: boolean;
  trackCompletionTime: boolean;
  customEvents?: {
    phaseStart?: string;
    phaseComplete?: string;
    timelineComplete?: string;
    phaseClick?: string;
  };
}

// ============================================================================
// Responsive Configuration
// ============================================================================

export interface ResponsiveTimelineConfig {
  mobile: {
    variant: "vertical" | "compact";
    collapsible: boolean;
    showSummary: boolean;
    defaultOpen: "none" | "first";
  };
  tablet: {
    variant: "vertical" | "detailed";
    showProgress: boolean;
    collapsible: boolean;
  };
  desktop: {
    variant: "vertical" | "horizontal" | "detailed";
    interactive: boolean;
    showProgress: boolean;
  };
}

// ============================================================================
// Export Union Types for Validation
// ============================================================================

export type TimelineVariant = NonNullable<ProcessTimelineProps['variant']>;
export type TimelineOrientation = NonNullable<ProcessTimelineProps['orientation']>;
export type TimelineSize = NonNullable<ProcessTimelineProps['size']>;
export type ColorScheme = NonNullable<ProcessTimelineProps['colorScheme']>;

// ============================================================================
// Component Ref Types
// ============================================================================

export interface ProcessTimelineRef {
  /** Navigate to specific phase */
  goToPhase: (index: number) => void;
  /** Navigate to next phase */
  nextPhase: () => void;
  /** Navigate to previous phase */
  prevPhase: () => void;
  /** Get current active phase index */
  getCurrentPhase: () => number;
  /** Get total number of phases */
  getTotalPhases: () => number;
  /** Update phase status */
  updatePhaseStatus: (phaseId: string, status: PhaseStatus) => void;
  /** Get phase by ID */
  getPhaseById: (phaseId: string) => ProcessPhase | undefined;
  /** Get overall completion percentage */
  getCompletionPercentage: () => number;
  /** Reset timeline to initial state */
  reset: () => void;
  /** Start timeline (for real-time updates) */
  start: () => void;
  /** Pause timeline */
  pause: () => void;
  /** Complete timeline */
  complete: () => void;
  /** Refresh timeline (useful after data updates) */
  refresh: () => void;
}

// ============================================================================
// Data Processing Types
// ============================================================================

export interface ProcessTimelineSummary {
  totalPhases: number;
  completedPhases: number;
  remainingPhases: number;
  overallProgress: number;
  estimatedDuration: {
    min: number;
    max: number;
    unit: DurationUnit;
    label: string;
  } | null;
  criticalPath: string[];
  nextMilestone?: ProcessPhase;
  riskFactors: Array<{
    phaseId: string;
    riskType: string;
    severity: "low" | "medium" | "high";
    description: string;
  }>;
}

export interface ProcessTimelineMetrics {
  averagePhaseDuration: number;
  longestPhase: ProcessPhase | null;
  shortestPhase: ProcessPhase | null;
  clientInvolvementLevel: number;
  complexityScore: number;
  dependencyCount: number;
  deliverableCount: number;
  approvalPoints: number;
}

// ============================================================================
// Template Types
// ============================================================================

export interface ProcessTimelineTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  phases: ProcessPhase[];
  defaultConfig: Partial<ProcessTimelineProps>;
  tags: string[];
  estimatedDuration: {
    min: number;
    max: number;
    unit: DurationUnit;
  };
  suitableFor: string[];
  complexity: "low" | "medium" | "high";
  customizable: boolean;
}