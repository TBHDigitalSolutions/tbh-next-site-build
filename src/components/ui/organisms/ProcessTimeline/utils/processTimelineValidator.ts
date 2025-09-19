// src/components/ui/organisms/ProcessTimeline/utils/ProcessTimelineValidator.ts

import { z } from "zod";
import type {
  ProcessPhase,
  ProcessTimelineProps,
  ProcessTimelineInput,
  ProcessTimelineSection,
  DurationObject,
  PhaseStatus,
  Owner
} from "../ProcessTimeline.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Duration object schema with validation
 */
export const durationObjectSchema = z.object({
  min: z.number().min(0, "Duration minimum must be non-negative"),
  max: z.number().min(0, "Duration maximum must be non-negative"),
  unit: z.enum(["days", "weeks", "months"])
}).refine(data => data.max >= data.min, {
  message: "Maximum duration must be greater than or equal to minimum"
});

/**
 * Resource schema for external links and documents
 */
export const resourceSchema = z.object({
  title: z.string().min(1, "Resource title is required"),
  url: z.string().url("Resource URL must be valid"),
  type: z.enum(["document", "tool", "reference"]).optional()
});

/**
 * Complete process phase schema with all validation rules
 */
export const processPhaseSchema = z.object({
  id: z.string().min(1, "Phase ID is required"),
  stepNumber: z.number().min(1).optional(),
  title: z.string().min(3, "Phase title must be at least 3 characters").max(100, "Phase title must be under 100 characters"),
  description: z.string().min(10, "Phase description must be at least 10 characters").max(500, "Phase description must be under 500 characters"),
  icon: z.string().optional(),
  
  // Duration fields - flexible validation
  duration: z.union([z.string(), durationObjectSchema]).optional(),
  durationLabel: z.string().optional(),
  durationData: durationObjectSchema.optional(),
  
  // Phase details arrays
  activities: z.array(z.string()).max(20, "Maximum 20 activities per phase").optional(),
  clientInputs: z.array(z.string()).max(15, "Maximum 15 client inputs per phase").optional(),
  deliverables: z.array(z.string()).max(15, "Maximum 15 deliverables per phase").optional(),
  
  // Phase metadata
  approval: z.string().optional(),
  owner: z.enum(["client", "studio", "shared"]).optional(),
  status: z.enum(["upcoming", "active", "complete", "in-progress", "pending", "blocked"]).optional(),
  
  // Advanced fields
  dependencies: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  complexity: z.enum(["low", "medium", "high"]).optional(),
  riskLevel: z.enum(["low", "medium", "high"]).optional(),
  teamMembers: z.array(z.string()).optional(),
  notes: z.string().optional(),
  resources: z.array(resourceSchema).optional(),
  
  // UI fields
  className: z.string().optional(),
  interactive: z.boolean().optional(),
  onClick: z.function().optional(),
  progress: z.number().min(0).max(100).optional()
});

/**
 * Process timeline props schema
 */
export const processTimelinePropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  phases: z.array(processPhaseSchema).min(1, "At least one phase is required").max(20, "Maximum 20 phases allowed"),
  steps: z.array(processPhaseSchema).optional(), // Legacy support
  
  // Visual configuration
  variant: z.enum(["vertical", "horizontal", "detailed", "compact", "cards"]).optional(),
  orientation: z.enum(["vertical", "horizontal"]).optional(),
  interactive: z.boolean().optional(),
  showProgress: z.boolean().optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
  
  // Content visibility
  showActivities: z.boolean().optional(),
  showClientInputs: z.boolean().optional(),
  showDeliverables: z.boolean().optional(),
  showApproval: z.boolean().optional(),
  showDuration: z.boolean().optional(),
  showStatus: z.boolean().optional(),
  showOwners: z.boolean().optional(),
  showDependencies: z.boolean().optional(),
  
  // Behavior
  collapsible: z.boolean().optional(),
  defaultOpen: z.union([z.number(), z.enum(["all", "none"]), z.array(z.number())]).optional(),
  showSummary: z.boolean().optional(),
  enableReordering: z.boolean().optional(),
  enableFiltering: z.boolean().optional(),
  
  // Styling
  className: z.string().optional(),
  colorScheme: z.enum(["default", "blue", "green", "purple", "orange", "custom"]).optional(),
  
  // Callbacks
  ctaRenderer: z.function().optional(),
  onPhaseClick: z.function().optional(),
  onStatusChange: z.function().optional(),
  onTimelineComplete: z.function().optional()
});

/**
 * Timeline section schema for service pages
 */
export const processTimelineSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  data: z.union([
    z.array(processPhaseSchema),
    z.object({ phases: z.array(processPhaseSchema).optional() }),
    z.object({ steps: z.array(processPhaseSchema).optional() }),
    z.object({ timeline: z.array(processPhaseSchema).optional() }),
    z.object({ process: z.array(processPhaseSchema).optional() }),
    z.object({ workflow: z.array(processPhaseSchema).optional() }),
    z.null(),
    z.undefined()
  ]),
  config: z.object({}).passthrough().optional(),
  serviceFilter: z.string().optional(),
  limit: z.number().min(1).max(20).optional()
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single process phase
 */
export const validateProcessPhase = (data: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[];
  phase: ProcessPhase | null 
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const result = processPhaseSchema.parse(data);
    
    // Additional business logic validation
    const businessValidation = validatePhaseBusinessRules(result);
    warnings.push(...businessValidation.warnings);
    
    // Duration consistency check
    const durationValidation = validatePhaseDuration(result);
    if (!durationValidation.isValid) {
      warnings.push(...durationValidation.warnings);
    }
    
    return {
      isValid: true,
      errors: [],
      warnings,
      phase: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: false,
      errors,
      warnings,
      phase: null
    };
  }
};

/**
 * Validates process timeline props
 */
export const validateProcessTimelineProps = (data: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  warnings: string[];
  props: ProcessTimelineProps | null 
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const result = processTimelinePropsSchema.parse(data);
    
    // Validate each phase individually
    const invalidPhases = result.phases
      .map((phase, index) => ({ phase, index }))
      .filter(({ phase }) => !validateProcessPhase(phase).isValid);
    
    if (invalidPhases.length > 0) {
      invalidPhases.forEach(({ index }) => {
        errors.push(`Phase at index ${index} is invalid`);
      });
    }
    
    // Timeline-specific validation
    const timelineValidation = validateTimelineConfiguration(result);
    if (!timelineValidation.isValid) {
      errors.push(...timelineValidation.errors);
    }
    warnings.push(...timelineValidation.warnings);
    
    // Phase sequence validation
    const sequenceValidation = validatePhaseSequence(result.phases);
    warnings.push(...sequenceValidation.warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      props: errors.length === 0 ? result : null
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: false,
      errors,
      warnings,
      props: null
    };
  }
};

/**
 * Validates process timeline section for service pages
 */
export const validateProcessTimelineSection = (data: unknown): { 
  isValid: boolean; 
  errors: string[]; 
  section: ProcessTimelineSection | null 
} => {
  const errors: string[] = [];
  
  try {
    const result = processTimelineSectionSchema.parse(data);
    return {
      isValid: true,
      errors: [],
      section: result
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(err => `${err.path.join('.')}: ${err.message}`));
    } else {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return {
      isValid: false,
      errors,
      section: null
    };
  }
};

// ============================================================================
// Business Rules Validation
// ============================================================================

/**
 * Validates business rules for process phases
 */
export const validatePhaseBusinessRules = (phase: ProcessPhase): { 
  isValid: boolean; 
  warnings: string[] 
} => {
  const warnings: string[] = [];
  
  // Title quality check
  if (phase.title.length < 8) {
    warnings.push(`Phase "${phase.title}": Title should be more descriptive (at least 8 characters)`);
  }
  
  // Description quality check
  if (phase.description.length < 30) {
    warnings.push(`Phase "${phase.title}": Description should provide more detail (at least 30 characters)`);
  }
  
  // Activities validation
  if (!phase.activities || phase.activities.length === 0) {
    warnings.push(`Phase "${phase.title}": Should include key activities`);
  }
  
  if (phase.activities && phase.activities.length > 10) {
    warnings.push(`Phase "${phase.title}": Consider limiting activities to 10 for better readability`);
  }
  
  // Client inputs validation
  if (!phase.clientInputs || phase.clientInputs.length === 0) {
    warnings.push(`Phase "${phase.title}": Should specify required client inputs`);
  }
  
  // Deliverables validation
  if (!phase.deliverables || phase.deliverables.length === 0) {
    warnings.push(`Phase "${phase.title}": Should specify phase deliverables`);
  }
  
  // Duration validation
  if (!phase.duration && !phase.durationLabel && !phase.durationData) {
    warnings.push(`Phase "${phase.title}": Should include duration estimate`);
  }
  
  // Approval validation for client-dependent phases
  if (phase.owner === "shared" && !phase.approval) {
    warnings.push(`Phase "${phase.title}": Shared phases should specify approval requirements`);
  }
  
  // Status consistency check
  if (phase.status === "complete" && phase.progress && phase.progress < 100) {
    warnings.push(`Phase "${phase.title}": Complete status should have 100% progress`);
  }
  
  // Complexity vs duration check
  if (phase.complexity === "high" && phase.durationData && phase.durationData.max < 7) {
    warnings.push(`Phase "${phase.title}": High complexity phases typically require more than a week`);
  }
  
  // Dependencies validation
  if (phase.dependencies && phase.dependencies.length > 5) {
    warnings.push(`Phase "${phase.title}": Many dependencies may indicate over-complexity`);
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

/**
 * Validates phase duration consistency
 */
export const validatePhaseDuration = (phase: ProcessPhase): {
  isValid: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];
  
  // Check for duration conflicts
  if (phase.duration && phase.durationLabel && typeof phase.duration === "string") {
    if (phase.duration !== phase.durationLabel) {
      warnings.push(`Phase "${phase.title}": Duration and durationLabel don't match`);
    }
  }
  
  // Validate structured duration data
  if (phase.durationData) {
    if (phase.durationData.min > phase.durationData.max) {
      warnings.push(`Phase "${phase.title}": Duration minimum cannot exceed maximum`);
    }
    
    if (phase.durationData.min === 0) {
      warnings.push(`Phase "${phase.title}": Duration minimum should be greater than 0`);
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

/**
 * Validates timeline configuration
 */
export const validateTimelineConfiguration = (props: ProcessTimelineProps): { 
  isValid: boolean; 
  errors: string[];
  warnings: string[] 
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Default open validation
  if (typeof props.defaultOpen === "number") {
    if (props.defaultOpen < 0 || props.defaultOpen >= (props.phases?.length || 0)) {
      errors.push("defaultOpen index is out of bounds");
    }
  }
  
  // Phase count recommendations
  if (props.phases && props.phases.length > 10) {
    warnings.push("Consider breaking down processes with more than 10 phases for better UX");
  }
  
  if (props.phases && props.phases.length < 3) {
    warnings.push("Processes typically benefit from at least 3 distinct phases");
  }
  
  // Variant compatibility checks
  if (props.variant === "horizontal" && props.phases && props.phases.length > 6) {
    warnings.push("Horizontal layout works best with 6 or fewer phases");
  }
  
  if (props.variant === "compact" && props.showActivities && props.showClientInputs && props.showDeliverables) {
    warnings.push("Compact variant may be too crowded with all content sections enabled");
  }
  
  // Interactive features validation
  if (!props.interactive && (props.collapsible || props.enableReordering)) {
    warnings.push("Collapsible and reordering features require interactive mode");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates phase sequence and dependencies
 */
export const validatePhaseSequence = (phases: ProcessPhase[]): {
  isValid: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];
  const phaseIds = new Set(phases.map(p => p.id));
  
  // Check for duplicate IDs
  if (phaseIds.size !== phases.length) {
    warnings.push("Duplicate phase IDs detected - ensure all phases have unique IDs");
  }
  
  // Validate dependencies exist
  phases.forEach(phase => {
    if (phase.dependencies) {
      phase.dependencies.forEach(depId => {
        if (!phaseIds.has(depId)) {
          warnings.push(`Phase "${phase.title}" depends on non-existent phase "${depId}"`);
        }
      });
    }
  });
  
  // Check for logical status progression
  let hasComplete = false;
  let hasUpcoming = false;
  
  phases.forEach(phase => {
    if (phase.status === "complete") hasComplete = true;
    if (phase.status === "upcoming") hasUpcoming = true;
    
    if (hasComplete && hasUpcoming && phase.status === "complete") {
      warnings.push("Completed phases should generally come before upcoming phases");
    }
  });
  
  // Owner distribution check
  const ownerCounts = phases.reduce((acc, phase) => {
    const owner = phase.owner || "studio";
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  if (ownerCounts.client && ownerCounts.client > phases.length * 0.7) {
    warnings.push("High client responsibility may impact timeline predictability");
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
};

// ============================================================================
// Quality Assessment
// ============================================================================

/**
 * Assesses the overall quality of a process timeline
 */
export const assessProcessTimelineQuality = (phases: ProcessPhase[]): { 
  score: number; 
  recommendations: string[] 
} => {
  let score = 0;
  const recommendations: string[] = [];
  
  // Phase count assessment (15 points)
  if (phases.length >= 4 && phases.length <= 8) {
    score += 15;
  } else if (phases.length >= 3 && phases.length <= 10) {
    score += 10;
    if (phases.length > 8) {
      recommendations.push("Consider consolidating phases - 4-8 phases are optimal for user comprehension");
    }
  } else {
    score += 5;
    recommendations.push("Aim for 4-8 phases for optimal process clarity");
  }
  
  // Content completeness (25 points)
  const phasesWithGoodContent = phases.filter(phase =>
    phase.title.length >= 8 &&
    phase.description.length >= 30 &&
    (phase.activities?.length || 0) >= 2 &&
    (phase.deliverables?.length || 0) >= 1
  ).length;
  
  const contentScore = Math.round((phasesWithGoodContent / phases.length) * 25);
  score += contentScore;
  
  if (contentScore < 20) {
    recommendations.push("Enhance phase content: detailed titles, comprehensive descriptions, clear activities and deliverables");
  }
  
  // Duration specification (15 points)
  const phasesWithDuration = phases.filter(phase =>
    phase.duration || phase.durationLabel || phase.durationData
  ).length;
  
  const durationScore = Math.round((phasesWithDuration / phases.length) * 15);
  score += durationScore;
  
  if (durationScore < 12) {
    recommendations.push("Specify duration estimates for all phases to set clear expectations");
  }
  
  // Client input clarity (15 points)
  const phasesWithClientInputs = phases.filter(phase =>
    phase.clientInputs && phase.clientInputs.length > 0
  ).length;
  
  const inputScore = Math.round((phasesWithClientInputs / phases.length) * 15);
  score += inputScore;
  
  if (inputScore < 10) {
    recommendations.push("Clearly specify required client inputs for each phase");
  }
  
  // Approval process (10 points)
  const phasesNeedingApproval = phases.filter(phase => 
    phase.owner === "shared" || phase.deliverables && phase.deliverables.length > 0
  );
  const phasesWithApproval = phasesNeedingApproval.filter(phase => phase.approval);
  
  if (phasesNeedingApproval.length > 0) {
    const approvalScore = Math.round((phasesWithApproval.length / phasesNeedingApproval.length) * 10);
    score += approvalScore;
    
    if (approvalScore < 8) {
      recommendations.push("Define approval processes for phases with deliverables or shared ownership");
    }
  } else {
    score += 10; // No approval needed
  }
  
  // Process flow logic (10 points)
  const hasLogicalFlow = validatePhaseSequence(phases);
  if (hasLogicalFlow.warnings.length === 0) {
    score += 10;
  } else {
    score += 5;
    recommendations.push("Review phase sequence and dependencies for logical flow");
  }
  
  // Owner balance (10 points)
  const ownerDistribution = phases.reduce((acc, phase) => {
    const owner = phase.owner || "studio";
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const hasBalancedOwnership = Object.keys(ownerDistribution).length >= 2 && 
    !Object.values(ownerDistribution).some(count => count > phases.length * 0.8);
  
  if (hasBalancedOwnership) {
    score += 10;
  } else {
    score += 5;
    recommendations.push("Balance phase ownership between client, studio, and shared responsibilities");
  }
  
  return { score, recommendations };
};

// ============================================================================
// Duration Parsing Utilities
// ============================================================================

/**
 * Parses duration strings into structured objects
 */
export const parseDurationString = (duration: string): DurationObject | null => {
  if (!duration || typeof duration !== "string") return null;
  
  const cleaned = duration.trim().toLowerCase();
  
  // Range patterns: "1-2 weeks", "3–5 days", "2 - 4 months"
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const unit = normalizeUnit(rangeMatch[3]);
    return { min, max, unit };
  }
  
  // Single value patterns: "2 weeks", "5 days", "1 month"
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)/);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);
    const unit = normalizeUnit(singleMatch[2]);
    return { min: value, max: value, unit };
  }
  
  return null;
};

/**
 * Normalizes time unit strings
 */
const normalizeUnit = (unit: string): "days" | "weeks" | "months" => {
  const normalized = unit.toLowerCase();
  if (normalized.startsWith("day")) return "days";
  if (normalized.startsWith("week")) return "weeks";
  if (normalized.startsWith("month")) return "months";
  return "days"; // fallback
};

/**
 * Formats duration object back to human-readable string
 */
export const formatDuration = (duration: DurationObject): string => {
  if (duration.min === duration.max) {
    const value = duration.min;
    const unit = value === 1 ? duration.unit.slice(0, -1) : duration.unit;
    return `${value} ${unit}`;
  }
  
  return `${duration.min}-${duration.max} ${duration.unit}`;
};

// ============================================================================
// Service-Specific Validators
// ============================================================================

/**
 * Creates service-specific validators
 */
const createServiceProcessTimelineValidator = (serviceName: string) => ({
  validate: (data: ProcessTimelineInput): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[];
    phases: ProcessPhase[] 
  } => {
    const errors: string[] = [];
    const warnings: string[] = [];
    let phases: ProcessPhase[] = [];
    
    try {
      // Normalize input first
      if (Array.isArray(data)) {
        phases = data;
      } else if (data && typeof data === "object") {
        const input = data as any;
        phases = input.phases || input.steps || input.timeline || input.process || input.workflow || [];
      }
      
      if (!Array.isArray(phases)) {
        errors.push(`${serviceName}: Invalid timeline data format`);
        return { isValid: false, errors, warnings, phases: [] };
      }
      
      // Validate each phase
      phases.forEach((phase, index) => {
        const validation = validateProcessPhase(phase);
        if (!validation.isValid) {
          errors.push(`${serviceName} Phase ${index + 1}: ${validation.errors.join(', ')}`);
        }
        warnings.push(...validation.warnings.map(w => `${serviceName} Phase ${index + 1}: ${w}`));
      });
      
      // Service-specific validation
      const serviceValidation = validateServiceSpecificRules(phases, serviceName);
      warnings.push(...serviceValidation.warnings);
      
      // Quality assessment
      const quality = assessProcessTimelineQuality(phases);
      if (quality.score < 70) {
        warnings.push(`${serviceName}: Timeline quality score is ${quality.score}/100. Consider: ${quality.recommendations.join(', ')}`);
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        phases: errors.length === 0 ? phases : []
      };
    } catch (error) {
      errors.push(`${serviceName}: Failed to validate timeline - ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isValid: false, errors, warnings, phases: [] };
    }
  },
  
  createSection: (data: ProcessTimelineInput, options: Partial<ProcessTimelineSection> = {}): ProcessTimelineSection | null => {
    const validation = createServiceProcessTimelineValidator(serviceName).validate(data);
    
    if (!validation.isValid) {
      console.warn(`${serviceName} timeline validation failed:`, validation.errors);
      return null;
    }
    
    if (validation.warnings.length > 0) {
      console.info(`${serviceName} timeline warnings:`, validation.warnings);
    }
    
    return {
      title: `${serviceName} Process`,
      subtitle: `Our structured approach to delivering exceptional ${serviceName.toLowerCase()} results.`,
      data: validation.phases,
      serviceFilter: serviceName,
      ...options
    };
  }
});

/**
 * Validates service-specific rules
 */
const validateServiceSpecificRules = (phases: ProcessPhase[], serviceName: string): { 
  warnings: string[] 
} => {
  const warnings: string[] = [];
  
  // Service-specific phase expectations
  const servicePhaseExpectations: Record<string, { 
    expectedPhases: string[]; 
    criticalPhases: string[];
    typicalDuration: { min: number; max: number; unit: "days" | "weeks" | "months" };
  }> = {
    'Web Development': {
      expectedPhases: ['discovery', 'planning', 'design', 'development', 'testing', 'launch'],
      criticalPhases: ['discovery', 'development', 'testing'],
      typicalDuration: { min: 4, max: 12, unit: "weeks" }
    },
    'Video Production': {
      expectedPhases: ['pre-production', 'production', 'post-production', 'review', 'delivery'],
      criticalPhases: ['pre-production', 'production', 'post-production'],
      typicalDuration: { min: 3, max: 8, unit: "weeks" }
    },
    'Lead Generation': {
      expectedPhases: ['strategy', 'setup', 'launch', 'optimization', 'reporting'],
      criticalPhases: ['strategy', 'setup', 'optimization'],
      typicalDuration: { min: 2, max: 6, unit: "weeks" }
    },
    'Marketing Automation': {
      expectedPhases: ['audit', 'strategy', 'setup', 'implementation', 'testing', 'launch'],
      criticalPhases: ['audit', 'setup', 'testing'],
      typicalDuration: { min: 3, max: 8, unit: "weeks" }
    },
    'SEO Services': {
      expectedPhases: ['audit', 'strategy', 'implementation', 'monitoring', 'optimization'],
      criticalPhases: ['audit', 'implementation', 'monitoring'],
      typicalDuration: { min: 6, max: 12, unit: "weeks" }
    },
    'Content Production': {
      expectedPhases: ['strategy', 'planning', 'creation', 'review', 'publishing'],
      criticalPhases: ['strategy', 'creation', 'review'],
      typicalDuration: { min: 2, max: 6, unit: "weeks" }
    }
  };
  
  const expectations = servicePhaseExpectations[serviceName];
  if (!expectations) return { warnings };
  
  // Check for critical phases
  const phaseIds = phases.map(p => p.id.toLowerCase());
  const missingCritical = expectations.criticalPhases.filter(critical => 
    !phaseIds.some(id => id.includes(critical.toLowerCase()))
  );
  
  if (missingCritical.length > 0) {
    warnings.push(`${serviceName}: Consider including phases for: ${missingCritical.join(', ')}`);
  }
  
  // Duration reasonableness check
  const totalDuration = estimateTotalDuration(phases);
  if (totalDuration && expectations.typicalDuration) {
    const expectedMin = convertToUnit(expectations.typicalDuration.min, expectations.typicalDuration.unit, "days");
    const expectedMax = convertToUnit(expectations.typicalDuration.max, expectations.typicalDuration.unit, "days");
    const actualDays = convertToUnit(totalDuration.max, totalDuration.unit, "days");
    
    if (actualDays < expectedMin * 0.7) {
      warnings.push(`${serviceName}: Timeline seems optimistic - typical projects take ${expectations.typicalDuration.min}-${expectations.typicalDuration.max} ${expectations.typicalDuration.unit}`);
    } else if (actualDays > expectedMax * 1.5) {
      warnings.push(`${serviceName}: Timeline seems lengthy - consider optimizing for ${expectations.typicalDuration.min}-${expectations.typicalDuration.max} ${expectations.typicalDuration.unit}`);
    }
  }
  
  return { warnings };
};

/**
 * Estimates total timeline duration from phases
 */
const estimateTotalDuration = (phases: ProcessPhase[]): DurationObject | null => {
  let totalMinDays = 0;
  let totalMaxDays = 0;
  let hasAnyDuration = false;
  
  phases.forEach(phase => {
    let duration: DurationObject | null = null;
    
    if (phase.durationData) {
      duration = phase.durationData;
    } else if (typeof phase.duration === "string") {
      duration = parseDurationString(phase.duration);
    } else if (phase.durationLabel) {
      duration = parseDurationString(phase.durationLabel);
    }
    
    if (duration) {
      totalMinDays += convertToUnit(duration.min, duration.unit, "days");
      totalMaxDays += convertToUnit(duration.max, duration.unit, "days");
      hasAnyDuration = true;
    }
  });
  
  if (!hasAnyDuration) return null;
  
  // Determine best unit for total
  if (totalMaxDays >= 30) {
    return {
      min: Math.round(totalMinDays / 30 * 10) / 10,
      max: Math.round(totalMaxDays / 30 * 10) / 10,
      unit: "months"
    };
  } else if (totalMaxDays >= 7) {
    return {
      min: Math.round(totalMinDays / 7 * 10) / 10,
      max: Math.round(totalMaxDays / 7 * 10) / 10,
      unit: "weeks"
    };
  } else {
    return {
      min: totalMinDays,
      max: totalMaxDays,
      unit: "days"
    };
  }
};

/**
 * Converts duration between units
 */
const convertToUnit = (value: number, fromUnit: "days" | "weeks" | "months", toUnit: "days" | "weeks" | "months"): number => {
  const toDays = (val: number, unit: typeof fromUnit): number => {
    switch (unit) {
      case "days": return val;
      case "weeks": return val * 7;
      case "months": return val * 30;
    }
  };
  
  const days = toDays(value, fromUnit);
  
  switch (toUnit) {
    case "days": return days;
    case "weeks": return days / 7;
    case "months": return days / 30;
  }
};

// ============================================================================
// Pre-configured Service Validators
// ============================================================================

export const webDevProcessTimelineValidator = createServiceProcessTimelineValidator("Web Development");
export const videoProductionProcessTimelineValidator = createServiceProcessTimelineValidator("Video Production");
export const leadGenerationProcessTimelineValidator = createServiceProcessTimelineValidator("Lead Generation");
export const marketingAutomationProcessTimelineValidator = createServiceProcessTimelineValidator("Marketing Automation");
export const seoServicesProcessTimelineValidator = createServiceProcessTimelineValidator("SEO Services");
export const contentProductionProcessTimelineValidator = createServiceProcessTimelineValidator("Content Production");

// ============================================================================
// Development Helpers
// ============================================================================

/**
 * Creates mock process timeline data for development/testing
 */
export const createMockProcessPhases = (count: number, servicePrefix: string = "Generic"): ProcessPhase[] => {
  const phaseTemplates = [
    { id: "discovery", title: "Discovery & Planning", icon: "search", complexity: "medium" as const },
    { id: "design", title: "Design & Architecture", icon: "grid", complexity: "high" as const },
    { id: "development", title: "Development & Implementation", icon: "code", complexity: "high" as const },
    { id: "testing", title: "Testing & Quality Assurance", icon: "check", complexity: "medium" as const },
    { id: "review", title: "Review & Approval", icon: "eye", complexity: "low" as const },
    { id: "launch", title: "Launch & Deployment", icon: "rocket", complexity: "medium" as const },
    { id: "optimization", title: "Optimization & Refinement", icon: "trending-up", complexity: "medium" as const },
    { id: "maintenance", title: "Ongoing Support", icon: "settings", complexity: "low" as const }
  ];
  
  return Array.from({ length: Math.min(count, phaseTemplates.length) }, (_, i) => {
    const template = phaseTemplates[i];
    const stepNumber = i + 1;
    
    return {
      id: `${servicePrefix.toLowerCase().replace(/\s+/g, '-')}-${template.id}`,
      stepNumber,
      title: `${stepNumber}. ${template.title}`,
      description: `${template.title} phase for ${servicePrefix} projects. This phase involves detailed planning and execution to ensure quality deliverables.`,
      icon: template.icon,
      duration: `${stepNumber}-${stepNumber + 1} weeks`,
      activities: [
        `${template.title} activity 1`,
        `${template.title} activity 2`,
        `${template.title} activity 3`
      ],
      clientInputs: [
        "Client feedback and requirements",
        "Required assets and materials"
      ],
      deliverables: [
        `${template.title} deliverable 1`,
        `${template.title} deliverable 2`
      ],
      approval: `${template.title} sign-off required`,
      owner: i % 3 === 0 ? "shared" : i % 3 === 1 ? "client" : "studio",
      status: i === 0 ? "complete" : i === 1 ? "active" : "upcoming",
      complexity: template.complexity,
      progress: i === 0 ? 100 : i === 1 ? 60 : 0
    };
  });
};

/**
 * Debug utility for timeline validation issues
 */
export const debugProcessTimelineValidation = (data: unknown, serviceName: string = "Unknown"): void => {
  console.group(`Process Timeline Validation Debug: ${serviceName}`);
  
  try {
    const validation = validateProcessTimelineProps(data);
    
    if (validation.isValid && validation.props) {
      console.log("✅ Validation passed");
      
      const quality = assessProcessTimelineQuality(validation.props.phases || []);
      console.log(`Quality score: ${quality.score}/100`);
      
      if (quality.recommendations.length > 0) {
        console.log("Quality recommendations:", quality.recommendations);
      }
      
      if (validation.warnings.length > 0) {
        console.log("Warnings:", validation.warnings);
      }
      
      // Phase-by-phase analysis
      validation.props.phases?.forEach((phase, index) => {
        const phaseValidation = validatePhaseBusinessRules(phase);
        if (phaseValidation.warnings.length > 0) {
          console.log(`Phase ${index + 1} (${phase.title}) warnings:`, phaseValidation.warnings);
        }
      });
    } else {
      console.log("❌ Validation failed");
      console.log("Errors:", validation.errors);
      if (validation.warnings.length > 0) {
        console.log("Warnings:", validation.warnings);
      }
    }
  } catch (error) {
    console.error("Debug validation failed:", error);
  }
  
  console.groupEnd();
};