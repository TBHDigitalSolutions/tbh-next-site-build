// src/components/ui/organisms/ProcessTimeline/adapters.ts

import type {
  ProcessPhase,
  ProcessTimelineInput,
  ProcessTimelineProps,
  ProcessTimelineSection,
  DurationObject,
  Owner,
  PhaseStatus,
  WebDevProcessTimeline,
  VideoProductionProcessTimeline,
  LeadGenerationProcessTimeline,
  MarketingAutomationProcessTimeline,
  SEOServicesProcessTimeline,
  ContentProductionProcessTimeline
} from './ProcessTimeline.types';

// ============================================================================
// Service-Specific Timeline Adapters
// ============================================================================

/**
 * Creates Web Development process timeline with optimized defaults
 */
export const createWebDevProcessTimeline = (
  phases: ProcessPhase[],
  overrides: Partial<ProcessTimelineProps> = {}
): WebDevProcessTimeline => ({
  title: "Our Web Development Process",
  subtitle: "A transparent, collaborative timeline from discovery to launch—optimized for quality and speed.",
  phases: phases.map(phase => normalizeProcessPhase(phase)),
  variant: "detailed",
  interactive: true,
  showProgress: true,
  showActivities: true,
  showClientInputs: true,
  showDeliverables: true,
  showApproval: true,
  showDuration: true,
  showStatus: true,
  collapsible: true,
  defaultOpen: "all",
  showSummary: true,
  colorScheme: "blue",
  ...overrides
});

/**
 * Creates Video Production process timeline with creative workflow focus
 */
export const createVideoProductionProcessTimeline = (
  phases: ProcessPhase[],
  overrides: Partial<ProcessTimelineProps> = {}
): VideoProductionProcessTimeline => ({
  title: "Video Production Timeline",
  subtitle: "From concept to final cut—a proven process that delivers compelling video content on time and on budget.",
  phases: phases.map(phase => normalizeProcessPhase(phase)),
  variant: "detailed",
  interactive: true,
  showProgress: true,
  showActivities: true,
  showClientInputs: true,
  showDeliverables: true,
  showApproval: true, // Critical for creative approval workflow
  showDuration: true,
  showStatus: true,
  collapsible: true,
  defaultOpen: 1, // Show first phase expanded
  showSummary: true,
  colorScheme: "purple",
  ...overrides
});

/**
 * Creates Lead Generation process timeline with results-focused approach
 */
export const createLeadGenProcessTimeline = (
  phases: ProcessPhase[],
  overrides: Partial<ProcessTimelineProps> = {}
): LeadGenerationProcessTimeline => ({
  title: "Lead Generation Process",
  subtitle: "Strategic approach to building and optimizing your lead generation system for sustained growth.",
  phases: phases.map(phase => normalizeProcessPhase(phase)),
  variant: "compact", // Results-focused, less detail needed
  interactive: true,
  showProgress: true,
  showActivities: true,
  showClientInputs: true,
  showDeliverables: true,
  showApproval: false, // Less approval-heavy workflow
  showDuration: true,
  showStatus: true,
  collapsible: true,
  defaultOpen: "none", // Start collapsed for overview
  showSummary: true,
  colorScheme: "green",
  ...overrides
});

/**
 * Creates Content Production process timeline with content strategy focus
 */
export const createContentProductionProcessTimeline = (
  phases: ProcessPhase[],
  overrides: Partial<ProcessTimelineProps> = {}
): ContentProductionProcessTimeline => ({
  title: "Content Production Process",
  subtitle: "Strategic content development process that creates engaging, valuable content aligned with your business goals.",
  phases: phases.map(phase => normalizeProcessPhase(phase)),
  variant: "detailed",
  interactive: true,
  showProgress: true,
  showActivities: true,
  showClientInputs: true,
  showDeliverables: true,
  showApproval: true, // Important for content approval
  showDuration: true,
  showStatus: true,
  collapsible: true,
  defaultOpen: "all",
  showSummary: true,
  colorScheme: "blue",
  ...overrides
});

// ============================================================================
// Data Transformation Utilities
// ============================================================================

/**
 * Normalizes various timeline input formats to standard ProcessPhase array
 */
export const normalizeProcessTimelineInput = (data: ProcessTimelineInput): ProcessPhase[] => {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.map(normalizeProcessPhase);
  }
  
  if (typeof data === 'object') {
    const input = data as any;
    const items = input.phases || input.steps || input.timeline || input.process || input.workflow || [];
    return Array.isArray(items) ? items.map(normalizeProcessPhase) : [];
  }
  
  return [];
};

/**
 * Normalizes a single process phase, handling legacy field names
 */
export const normalizeProcessPhase = (phase: any): ProcessPhase => {
  const input = phase as any;
  
  // Generate ID if missing
  const id = input.id || generatePhaseId(input);
  
  // Normalize title
  const title = input.title || input.name || input.stepTitle || "Untitled Phase";
  
  // Normalize description
  const description = input.description || input.summary || input.details || input.content || "";
  
  // Normalize duration fields
  const duration = input.duration || input.timeframe || input.timeline;
  const durationLabel = input.durationLabel || (typeof duration === "string" ? duration : undefined);
  const durationData = input.durationData || (typeof duration === "object" ? duration : undefined);
  
  // Normalize activity fields
  const activities = Array.isArray(input.activities) ? input.activities :
                    Array.isArray(input.tasks) ? input.tasks :
                    Array.isArray(input.actions) ? input.actions : [];
  
  // Normalize client input fields
  const clientInputs = Array.isArray(input.clientInputs) ? input.clientInputs :
                      Array.isArray(input.clientRequirements) ? input.clientRequirements :
                      Array.isArray(input.required) ? input.required : [];
  
  // Normalize deliverable fields
  const deliverables = Array.isArray(input.deliverables) ? input.deliverables :
                      Array.isArray(input.outputs) ? input.outputs :
                      Array.isArray(input.results) ? input.results : [];
  
  // Normalize step number
  const stepNumber = input.stepNumber || input.phase || input.step;
  
  // Normalize status
  const status = normalizePhaseStatus(input.status || input.state);
  
  // Normalize owner
  const owner = normalizeOwner(input.owner);
  
  return {
    id,
    stepNumber,
    title,
    description,
    icon: input.icon,
    duration,
    durationLabel,
    durationData,
    activities: activities.filter(Boolean),
    clientInputs: clientInputs.filter(Boolean),
    deliverables: deliverables.filter(Boolean),
    approval: input.approval,
    owner,
    status,
    dependencies: Array.isArray(input.dependencies) ? input.dependencies.filter(Boolean) : [],
    prerequisites: Array.isArray(input.prerequisites) ? input.prerequisites.filter(Boolean) : [],
    startDate: input.startDate,
    endDate: input.endDate,
    complexity: input.complexity,
    riskLevel: input.riskLevel,
    teamMembers: Array.isArray(input.teamMembers) ? input.teamMembers.filter(Boolean) : [],
    notes: input.notes,
    resources: Array.isArray(input.resources) ? input.resources.filter(Boolean) : [],
    className: input.className,
    interactive: input.interactive,
    onClick: input.onClick,
    progress: typeof input.progress === "number" ? Math.max(0, Math.min(100, input.progress)) : undefined
  };
};

/**
 * Normalizes phase status values
 */
const normalizePhaseStatus = (status: any): PhaseStatus | undefined => {
  if (!status || typeof status !== "string") return undefined;
  
  const normalized = status.toLowerCase().trim();
  
  // Map common variations to standard statuses
  const statusMap: Record<string, PhaseStatus> = {
    "not started": "upcoming",
    "not_started": "upcoming",
    "pending": "upcoming",
    "todo": "upcoming",
    "upcoming": "upcoming",
    
    "in progress": "in-progress",
    "in_progress": "in-progress",
    "in-progress": "in-progress",
    "active": "active",
    "current": "active",
    "working": "active",
    
    "done": "complete",
    "completed": "complete",
    "complete": "complete",
    "finished": "complete",
    
    "blocked": "blocked",
    "paused": "blocked",
    "waiting": "blocked"
  };
  
  return statusMap[normalized] || "upcoming";
};

/**
 * Normalizes owner values
 */
const normalizeOwner = (owner: any): Owner | undefined => {
  if (!owner || typeof owner !== "string") return undefined;
  
  const normalized = owner.toLowerCase().trim();
  
  // Map common variations to standard owners
  const ownerMap: Record<string, Owner> = {
    "client": "client",
    "customer": "client",
    "user": "client",
    
    "studio": "studio",
    "agency": "studio",
    "team": "studio",
    "us": "studio",
    "internal": "studio",
    
    "shared": "shared",
    "both": "shared",
    "collaborative": "shared",
    "together": "shared"
  };
  
  return ownerMap[normalized] || "studio";
};

/**
 * Generates a unique ID for phases missing one
 */
const generatePhaseId = (phase: any): string => {
  const title = phase.title || phase.name || phase.stepTitle || "phase";
  const step = phase.stepNumber || phase.phase || phase.step;
  
  let slug = title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  if (step) {
    slug = `step-${step}-${slug}`;
  }
  
  return slug || `phase-${Date.now().toString(36)}`;
};

// ============================================================================
// External Data Source Adapters
// ============================================================================

/**
 * Adapter for Strapi CMS process timeline data
 */
export const adaptStrapiProcessTimeline = (strapiData: any[]): ProcessPhase[] => {
  return strapiData.map((item, index) => ({
    id: item.id?.toString() || `strapi-phase-${index}`,
    stepNumber: item.attributes?.stepNumber || item.stepNumber || index + 1,
    title: item.attributes?.title || item.title || "Phase",
    description: item.attributes?.description || item.description || "",
    icon: item.attributes?.icon || item.icon,
    duration: item.attributes?.duration || item.duration,
    durationLabel: item.attributes?.durationLabel || item.durationLabel,
    activities: item.attributes?.activities || item.activities || [],
    clientInputs: item.attributes?.clientInputs || item.clientInputs || [],
    deliverables: item.attributes?.deliverables || item.deliverables || [],
    approval: item.attributes?.approval || item.approval,
    owner: normalizeOwner(item.attributes?.owner || item.owner),
    status: normalizePhaseStatus(item.attributes?.status || item.status),
    complexity: item.attributes?.complexity || item.complexity,
    dependencies: item.attributes?.dependencies || item.dependencies || [],
    teamMembers: item.attributes?.teamMembers || item.teamMembers || [],
    notes: item.attributes?.notes || item.notes
  }));
};

/**
 * Adapter for Contentful process timeline data
 */
export const adaptContentfulProcessTimeline = (contentfulData: any[]): ProcessPhase[] => {
  return contentfulData.map((item, index) => ({
    id: item.sys?.id || `contentful-phase-${index}`,
    stepNumber: item.fields?.stepNumber || index + 1,
    title: item.fields?.title || "Phase",
    description: item.fields?.description || "",
    icon: item.fields?.icon,
    duration: item.fields?.duration,
    durationLabel: item.fields?.durationLabel,
    activities: item.fields?.activities || [],
    clientInputs: item.fields?.clientInputs || [],
    deliverables: item.fields?.deliverables || [],
    approval: item.fields?.approval,
    owner: normalizeOwner(item.fields?.owner),
    status: normalizePhaseStatus(item.fields?.status),
    complexity: item.fields?.complexity,
    dependencies: item.fields?.dependencies || [],
    teamMembers: item.fields?.teamMembers || [],
    notes: item.fields?.notes
  }));
};

/**
 * Adapter for Asana project tasks to process phases
 */
export const adaptAsanaProject = (asanaProject: any): ProcessPhase[] => {
  const tasks = asanaProject.tasks || [];
  
  return tasks.map((task: any, index: number) => {
    // Parse custom fields for additional data
    const customFields = task.custom_fields?.reduce((acc: any, field: any) => {
      acc[field.name] = field.text_value || field.enum_value?.name;
      return acc;
    }, {}) || {};
    
    return {
      id: task.gid || `asana-${index}`,
      stepNumber: index + 1,
      title: task.name || "Task",
      description: task.notes || "",
      status: mapAsanaStatus(task.completed, task.approval_status),
      owner: normalizeOwner(customFields.Owner || "studio"),
      complexity: customFields.Complexity?.toLowerCase(),
      dependencies: task.dependencies?.map((dep: any) => dep.gid) || [],
      teamMembers: task.assignee ? [task.assignee.name] : [],
      startDate: task.start_on,
      endDate: task.due_on,
      activities: customFields.Activities ? customFields.Activities.split(',').map((a: string) => a.trim()) : [],
      deliverables: customFields.Deliverables ? customFields.Deliverables.split(',').map((d: string) => d.trim()) : []
    };
  });
};

/**
 * Maps Asana task status to phase status
 */
const mapAsanaStatus = (completed: boolean, approvalStatus?: string): PhaseStatus => {
  if (completed) return "complete";
  if (approvalStatus === "pending") return "active";
  return "upcoming";
};

/**
 * Adapter for Linear project issues to process phases
 */
export const adaptLinearProject = (linearProject: any): ProcessPhase[] => {
  const issues = linearProject.issues?.nodes || [];
  
  return issues.map((issue: any, index: number) => ({
    id: issue.id || `linear-${index}`,
    stepNumber: index + 1,
    title: issue.title || "Issue",
    description: issue.description || "",
    status: mapLinearStatus(issue.state?.name),
    owner: normalizeOwner("studio"), // Linear doesn't map well to our owner concept
    complexity: mapLinearPriority(issue.priority),
    dependencies: issue.relations?.nodes
      ?.filter((rel: any) => rel.type === "blocks")
      ?.map((rel: any) => rel.relatedIssue.id) || [],
    teamMembers: issue.assignee ? [issue.assignee.name] : [],
    startDate: issue.createdAt,
    endDate: issue.dueDate,
    progress: issue.state?.type === "completed" ? 100 : 
              issue.state?.type === "started" ? 50 : 0
  }));
};

/**
 * Maps Linear state to phase status
 */
const mapLinearStatus = (stateName?: string): PhaseStatus => {
  if (!stateName) return "upcoming";
  
  const normalized = stateName.toLowerCase();
  if (normalized.includes("done") || normalized.includes("completed")) return "complete";
  if (normalized.includes("progress") || normalized.includes("started")) return "active";
  if (normalized.includes("blocked")) return "blocked";
  return "upcoming";
};

/**
 * Maps Linear priority to complexity
 */
const mapLinearPriority = (priority?: number): "low" | "medium" | "high" | undefined => {
  if (priority === undefined) return undefined;
  if (priority <= 1) return "low";
  if (priority <= 3) return "medium";
  return "high";
};

/**
 * Adapter for generic project management tools
 */
export const adaptGenericProjectManagement = (projectData: any): ProcessPhase[] => {
  const items = projectData.items || projectData.tasks || projectData.phases || [];
  
  if (!Array.isArray(items)) {
    console.warn('Generic project data is not an array:', projectData);
    return [];
  }
  
  return items.map(normalizeProcessPhase);
};

/**
 * Adapter for Monday.com boards
 */
export const adaptMondayBoard = (mondayData: any): ProcessPhase[] => {
  const items = mondayData.boards?.[0]?.items || [];
  
  return items.map((item: any, index: number) => {
    // Parse column values for additional data
    const columnValues = item.column_values?.reduce((acc: any, col: any) => {
      acc[col.title] = col.text || col.value;
      return acc;
    }, {}) || {};
    
    return {
      id: item.id || `monday-${index}`,
      stepNumber: index + 1,
      title: item.name || "Item",
      description: columnValues.Description || "",
      status: normalizePhaseStatus(columnValues.Status),
      owner: normalizeOwner(columnValues.Owner),
      complexity: columnValues.Complexity?.toLowerCase(),
      activities: columnValues.Activities ? columnValues.Activities.split(',').map((a: string) => a.trim()) : [],
      deliverables: columnValues.Deliverables ? columnValues.Deliverables.split(',').map((d: string) => d.trim()) : [],
      duration: columnValues.Duration,
      teamMembers: columnValues['Team Members'] ? columnValues['Team Members'].split(',').map((m: string) => m.trim()) : []
    };
  });
};

// ============================================================================
// Filtering and Sorting Utilities
// ============================================================================

/**
 * Filters phases by service category or type
 */
export const filterPhasesByService = (
  phases: ProcessPhase[],
  serviceCategories: string[]
): ProcessPhase[] => {
  return phases.filter(phase =>
    serviceCategories.some(category =>
      phase.title.toLowerCase().includes(category.toLowerCase()) ||
      phase.description.toLowerCase().includes(category.toLowerCase()) ||
      phase.activities?.some(activity =>
        activity.toLowerCase().includes(category.toLowerCase())
      )
    )
  );
};

/**
 * Sorts phases by specified criteria
 */
export const sortProcessPhases = (
  phases: ProcessPhase[],
  sortBy: 'stepNumber' | 'title' | 'status' | 'complexity' | 'owner' = 'stepNumber',
  direction: 'asc' | 'desc' = 'asc'
): ProcessPhase[] => {
  return [...phases].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'stepNumber':
        comparison = (a.stepNumber || 0) - (b.stepNumber || 0);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        const statusOrder = { upcoming: 0, active: 1, 'in-progress': 2, complete: 3, blocked: 4, pending: 0 };
        comparison = (statusOrder[a.status || 'upcoming'] || 0) - (statusOrder[b.status || 'upcoming'] || 0);
        break;
      case 'complexity':
        const complexityOrder = { low: 0, medium: 1, high: 2 };
        comparison = (complexityOrder[a.complexity || 'low'] || 0) - (complexityOrder[b.complexity || 'low'] || 0);
        break;
      case 'owner':
        const ownerOrder = { client: 0, shared: 1, studio: 2 };
        comparison = (ownerOrder[a.owner || 'studio'] || 2) - (ownerOrder[b.owner || 'studio'] || 2);
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

/**
 * Groups phases by specified criteria
 */
export const groupProcessPhases = (
  phases: ProcessPhase[],
  groupBy: 'status' | 'owner' | 'complexity'
): Record<string, ProcessPhase[]> => {
  return phases.reduce((groups, phase) => {
    let key: string;
    
    switch (groupBy) {
      case 'status':
        key = phase.status || 'upcoming';
        break;
      case 'owner':
        key = phase.owner || 'studio';
        break;
      case 'complexity':
        key = phase.complexity || 'medium';
        break;
      default:
        key = 'default';
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(phase);
    
    return groups;
  }, {} as Record<string, ProcessPhase[]>);
};

/**
 * Estimates total timeline duration
 */
export const estimateTimelineDuration = (phases: ProcessPhase[]): {
  min: number;
  max: number;
  unit: "days" | "weeks" | "months";
  label: string;
} | null => {
  let totalMinDays = 0;
  let totalMaxDays = 0;
  let hasAnyDuration = false;
  
  phases.forEach(phase => {
    let duration = extractDurationData(phase);
    
    if (duration) {
      totalMinDays += convertDurationToDays(duration.min, duration.unit);
      totalMaxDays += convertDurationToDays(duration.max, duration.unit);
      hasAnyDuration = true;
    }
  });
  
  if (!hasAnyDuration) return null;
  
  // Determine best unit for display
  let unit: "days" | "weeks" | "months";
  let min: number;
  let max: number;
  
  if (totalMaxDays >= 60) {
    unit = "months";
    min = Math.round(totalMinDays / 30 * 10) / 10;
    max = Math.round(totalMaxDays / 30 * 10) / 10;
  } else if (totalMaxDays >= 14) {
    unit = "weeks";
    min = Math.round(totalMinDays / 7 * 10) / 10;
    max = Math.round(totalMaxDays / 7 * 10) / 10;
  } else {
    unit = "days";
    min = totalMinDays;
    max = totalMaxDays;
  }
  
  const label = min === max 
    ? `${min} ${unit === "days" && min === 1 ? "day" : 
                unit === "weeks" && min === 1 ? "week" :
                unit === "months" && min === 1 ? "month" : unit}`
    : `${min}-${max} ${unit}`;
  
  return { min, max, unit, label };
};

/**
 * Extracts duration data from various phase duration formats
 */
const extractDurationData = (phase: ProcessPhase): DurationObject | null => {
  // Priority order: durationData -> structured duration -> parsed string
  if (phase.durationData) {
    return phase.durationData;
  }
  
  if (typeof phase.duration === "object") {
    return phase.duration;
  }
  
  const durationString = (typeof phase.duration === "string" ? phase.duration : phase.durationLabel);
  if (durationString) {
    return parseDurationString(durationString);
  }
  
  return null;
};

/**
 * Parses duration strings into structured objects
 */
const parseDurationString = (duration: string): DurationObject | null => {
  if (!duration || typeof duration !== "string") return null;
  
  const cleaned = duration.trim().toLowerCase();
  
  // Range patterns: "1-2 weeks", "3–5 days", "2 - 4 months"
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const unit = normalizeTimeUnit(rangeMatch[3]);
    return { min, max, unit };
  }
  
  // Single value patterns: "2 weeks", "5 days", "1 month"
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)/);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);
    const unit = normalizeTimeUnit(singleMatch[2]);
    return { min: value, max: value, unit };
  }
  
  return null;
};

/**
 * Normalizes time unit strings
 */
const normalizeTimeUnit = (unit: string): "days" | "weeks" | "months" => {
  const normalized = unit.toLowerCase();
  if (normalized.startsWith("day")) return "days";
  if (normalized.startsWith("week")) return "weeks";
  if (normalized.startsWith("month")) return "months";
  return "days";
};

/**
 * Converts duration to days for calculation
 */
const convertDurationToDays = (value: number, unit: "days" | "weeks" | "months"): number => {
  switch (unit) {
    case "days": return value;
    case "weeks": return value * 7;
    case "months": return value * 30;
    default: return value;
  }
};

// ============================================================================
// Section Factory for Service Pages
// ============================================================================

/**
 * Creates a complete timeline section for service pages
 */
export const createProcessTimelineSection = (
  serviceName: string,
  phases: ProcessPhase[],
  config: Partial<ProcessTimelineProps> = {}
): ProcessTimelineSection => {
  const serviceAdapters = {
    'Web Development': createWebDevProcessTimeline,
    'Video Production': createVideoProductionProcessTimeline,
    'Lead Generation': createLeadGenProcessTimeline,
    'Marketing Automation': createMarketingAutomationProcessTimeline,
    'SEO Services': createSEOServicesProcessTimeline,
    'Content Production': createContentProductionProcessTimeline
  };
  
  const adapter = serviceAdapters[serviceName as keyof typeof serviceAdapters];
  
  if (adapter) {
    const timelineProps = adapter(phases, config);
    return {
      title: timelineProps.title,
      subtitle: timelineProps.subtitle,
      data: timelineProps.phases || [],
      config: timelineProps
    };
  }
  
  // Fallback for unrecognized services
  return {
    title: `${serviceName} Process`,
    subtitle: `Our structured approach to delivering exceptional ${serviceName.toLowerCase()} results.`,
    data: phases.map(normalizeProcessPhase),
    config: {
      variant: "detailed",
      interactive: true,
      showSummary: true,
      collapsible: true,
      defaultOpen: "all",
      ...config
    }
  };
};...overrides
});

/**
 * Creates Marketing Automation process timeline with efficiency focus
 */
export const createMarketingAutomationProcessTimeline = (
  phases: ProcessPhase[],
  overrides: Partial<ProcessTimelineProps> = {}
): MarketingAutomationProcessTimeline => ({
  title: "Marketing Automation Implementation",
  subtitle: "Systematic approach to building automated marketing workflows that nurture leads and drive conversions.",
  phases: phases.map(phase => normalizeProcessPhase(phase)),
  variant: "detailed",
  interactive: true,
  showProgress: true,
  showActivities: true,
  showClientInputs: true,
  showDeliverables: true,
  showApproval: true,
  showDuration: true,
  showStatus: true,
  showDependencies: true, // Important for automation setup
  collapsible: true,
  defaultOpen: "all",
  showSummary: true,
  colorScheme: "orange",
  ...overrides
});

...overrides
});

/**
 * Creates Content Production process timeline with content strategy focus
 */
export const createContentProductionProcessTimeline = (
  phases: ProcessPhase[],
  overrides: Partial<ProcessTimelineProps> = {}
): ContentProductionProcessTimeline => ({
  title: "Content Production Process",
  subtitle: "Strategic content development process that creates engaging, valuable content aligned with your business goals.",
  phases: phases.map(phase => normalizeProcessPhase(phase)),
  variant: "detailed",
  interactive: true,
  showProgress: true,
  showActivities: true,
  showClientInputs: true,
  showDeliverables: true,
  showApproval: true, // Important for content approval
  showDuration: true,
  showStatus: true,
  collapsible: true,
  defaultOpen: "all",
  showSummary: true,
  colorScheme: "blue",
  ...overrides
});

// ============================================================================
// Data Transformation Utilities
// ============================================================================

/**
 * Normalizes various timeline input formats to standard ProcessPhase array
 */
export const normalizeProcessTimelineInput = (data: ProcessTimelineInput): ProcessPhase[] => {
  if (!data) return [];
  
  if (Array.isArray(data)) {
    return data.map(normalizeProcessPhase);
  }
  
  if (typeof data === 'object') {
    const input = data as any;
    const items = input.phases || input.steps || input.timeline || input.process || input.workflow || [];
    return Array.isArray(items) ? items.map(normalizeProcessPhase) : [];
  }
  
  return [];
};

/**
 * Normalizes a single process phase, handling legacy field names
 */
export const normalizeProcessPhase = (phase: any): ProcessPhase => {
  const input = phase as any;
  
  // Generate ID if missing
  const id = input.id || generatePhaseId(input);
  
  // Normalize title
  const title = input.title || input.name || input.stepTitle || "Untitled Phase";
  
  // Normalize description
  const description = input.description || input.summary || input.details || input.content || "";
  
  // Normalize duration fields
  const duration = input.duration || input.timeframe || input.timeline;
  const durationLabel = input.durationLabel || (typeof duration === "string" ? duration : undefined);
  const durationData = input.durationData || (typeof duration === "object" ? duration : undefined);
  
  // Normalize activity fields
  const activities = Array.isArray(input.activities) ? input.activities :
                    Array.isArray(input.tasks) ? input.tasks :
                    Array.isArray(input.actions) ? input.actions : [];
  
  // Normalize client input fields
  const clientInputs = Array.isArray(input.clientInputs) ? input.clientInputs :
                      Array.isArray(input.clientRequirements) ? input.clientRequirements :
                      Array.isArray(input.required) ? input.required : [];
  
  // Normalize deliverable fields
  const deliverables = Array.isArray(input.deliverables) ? input.deliverables :
                      Array.isArray(input.outputs) ? input.outputs :
                      Array.isArray(input.results) ? input.results : [];
  
  // Normalize step number
  const stepNumber = input.stepNumber || input.phase || input.step;
  
  // Normalize status
  const status = normalizePhaseStatus(input.status || input.state);
  
  // Normalize owner
  const owner = normalizeOwner(input.owner);
  
  return {
    id,
    stepNumber,
    title,
    description,
    icon: input.icon,
    duration,
    durationLabel,
    durationData,
    activities: activities.filter(Boolean),
    clientInputs: clientInputs.filter(Boolean),
    deliverables: deliverables.filter(Boolean),
    approval: input.approval,
    owner,
    status,
    dependencies: Array.isArray(input.dependencies) ? input.dependencies.filter(Boolean) : [],
    prerequisites: Array.isArray(input.prerequisites) ? input.prerequisites.filter(Boolean) : [],
    startDate: input.startDate,
    endDate: input.endDate,
    complexity: input.complexity,
    riskLevel: input.riskLevel,
    teamMembers: Array.isArray(input.teamMembers) ? input.teamMembers.filter(Boolean) : [],
    notes: input.notes,
    resources: Array.isArray(input.resources) ? input.resources.filter(Boolean) : [],
    className: input.className,
    interactive: input.interactive,
    onClick: input.onClick,
    progress: typeof input.progress === "number" ? Math.max(0, Math.min(100, input.progress)) : undefined
  };
};

/**
 * Normalizes phase status values
 */
const normalizePhaseStatus = (status: any): PhaseStatus | undefined => {
  if (!status || typeof status !== "string") return undefined;
  
  const normalized = status.toLowerCase().trim();
  
  // Map common variations to standard statuses
  const statusMap: Record<string, PhaseStatus> = {
    "not started": "upcoming",
    "not_started": "upcoming",
    "pending": "upcoming",
    "todo": "upcoming",
    "upcoming": "upcoming",
    
    "in progress": "in-progress",
    "in_progress": "in-progress",
    "in-progress": "in-progress",
    "active": "active",
    "current": "active",
    "working": "active",
    
    "done": "complete",
    "completed": "complete",
    "complete": "complete",
    "finished": "complete",
    
    "blocked": "blocked",
    "paused": "blocked",
    "waiting": "blocked"
  };
  
  return statusMap[normalized] || "upcoming";
};

/**
 * Normalizes owner values
 */
const normalizeOwner = (owner: any): Owner | undefined => {
  if (!owner || typeof owner !== "string") return undefined;
  
  const normalized = owner.toLowerCase().trim();
  
  // Map common variations to standard owners
  const ownerMap: Record<string, Owner> = {
    "client": "client",
    "customer": "client",
    "user": "client",
    
    "studio": "studio",
    "agency": "studio",
    "team": "studio",
    "us": "studio",
    "internal": "studio",
    
    "shared": "shared",
    "both": "shared",
    "collaborative": "shared",
    "together": "shared"
  };
  
  return ownerMap[normalized] || "studio";
};

/**
 * Generates a unique ID for phases missing one
 */
const generatePhaseId = (phase: any): string => {
  const title = phase.title || phase.name || phase.stepTitle || "phase";
  const step = phase.stepNumber || phase.phase || phase.step;
  
  let slug = title.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  if (step) {
    slug = `step-${step}-${slug}`;
  }
  
  return slug || `phase-${Date.now().toString(36)}`;
};

// ============================================================================
// External Data Source Adapters
// ============================================================================

/**
 * Adapter for Strapi CMS process timeline data
 */
export const adaptStrapiProcessTimeline = (strapiData: any[]): ProcessPhase[] => {
  return strapiData.map((item, index) => ({
    id: item.id?.toString() || `strapi-phase-${index}`,
    stepNumber: item.attributes?.stepNumber || item.stepNumber || index + 1,
    title: item.attributes?.title || item.title || "Phase",
    description: item.attributes?.description || item.description || "",
    icon: item.attributes?.icon || item.icon,
    duration: item.attributes?.duration || item.duration,
    durationLabel: item.attributes?.durationLabel || item.durationLabel,
    activities: item.attributes?.activities || item.activities || [],
    clientInputs: item.attributes?.clientInputs || item.clientInputs || [],
    deliverables: item.attributes?.deliverables || item.deliverables || [],
    approval: item.attributes?.approval || item.approval,
    owner: normalizeOwner(item.attributes?.owner || item.owner),
    status: normalizePhaseStatus(item.attributes?.status || item.status),
    complexity: item.attributes?.complexity || item.complexity,
    dependencies: item.attributes?.dependencies || item.dependencies || [],
    teamMembers: item.attributes?.teamMembers || item.teamMembers || [],
    notes: item.attributes?.notes || item.notes
  }));
};

/**
 * Adapter for Contentful process timeline data
 */
export const adaptContentfulProcessTimeline = (contentfulData: any[]): ProcessPhase[] => {
  return contentfulData.map((item, index) => ({
    id: item.sys?.id || `contentful-phase-${index}`,
    stepNumber: item.fields?.stepNumber || index + 1,
    title: item.fields?.title || "Phase",
    description: item.fields?.description || "",
    icon: item.fields?.icon,
    duration: item.fields?.duration,
    durationLabel: item.fields?.durationLabel,
    activities: item.fields?.activities || [],
    clientInputs: item.fields?.clientInputs || [],
    deliverables: item.fields?.deliverables || [],
    approval: item.fields?.approval,
    owner: normalizeOwner(item.fields?.owner),
    status: normalizePhaseStatus(item.fields?.status),
    complexity: item.fields?.complexity,
    dependencies: item.fields?.dependencies || [],
    teamMembers: item.fields?.teamMembers || [],
    notes: item.fields?.notes
  }));
};

/**
 * Adapter for Asana project tasks to process phases
 */
export const adaptAsanaProject = (asanaProject: any): ProcessPhase[] => {
  const tasks = asanaProject.tasks || [];
  
  return tasks.map((task: any, index: number) => {
    // Parse custom fields for additional data
    const customFields = task.custom_fields?.reduce((acc: any, field: any) => {
      acc[field.name] = field.text_value || field.enum_value?.name;
      return acc;
    }, {}) || {};
    
    return {
      id: task.gid || `asana-${index}`,
      stepNumber: index + 1,
      title: task.name || "Task",
      description: task.notes || "",
      status: mapAsanaStatus(task.completed, task.approval_status),
      owner: normalizeOwner(customFields.Owner || "studio"),
      complexity: customFields.Complexity?.toLowerCase(),
      dependencies: task.dependencies?.map((dep: any) => dep.gid) || [],
      teamMembers: task.assignee ? [task.assignee.name] : [],
      startDate: task.start_on,
      endDate: task.due_on,
      activities: customFields.Activities ? customFields.Activities.split(',').map((a: string) => a.trim()) : [],
      deliverables: customFields.Deliverables ? customFields.Deliverables.split(',').map((d: string) => d.trim()) : []
    };
  });
};

/**
 * Maps Asana task status to phase status
 */
const mapAsanaStatus = (completed: boolean, approvalStatus?: string): PhaseStatus => {
  if (completed) return "complete";
  if (approvalStatus === "pending") return "active";
  return "upcoming";
};

/**
 * Adapter for Linear project issues to process phases
 */
export const adaptLinearProject = (linearProject: any): ProcessPhase[] => {
  const issues = linearProject.issues?.nodes || [];
  
  return issues.map((issue: any, index: number) => ({
    id: issue.id || `linear-${index}`,
    stepNumber: index + 1,
    title: issue.title || "Issue",
    description: issue.description || "",
    status: mapLinearStatus(issue.state?.name),
    owner: normalizeOwner("studio"), // Linear doesn't map well to our owner concept
    complexity: mapLinearPriority(issue.priority),
    dependencies: issue.relations?.nodes
      ?.filter((rel: any) => rel.type === "blocks")
      ?.map((rel: any) => rel.relatedIssue.id) || [],
    teamMembers: issue.assignee ? [issue.assignee.name] : [],
    startDate: issue.createdAt,
    endDate: issue.dueDate,
    progress: issue.state?.type === "completed" ? 100 : 
              issue.state?.type === "started" ? 50 : 0
  }));
};

/**
 * Maps Linear state to phase status
 */
const mapLinearStatus = (stateName?: string): PhaseStatus => {
  if (!stateName) return "upcoming";
  
  const normalized = stateName.toLowerCase();
  if (normalized.includes("done") || normalized.includes("completed")) return "complete";
  if (normalized.includes("progress") || normalized.includes("started")) return "active";
  if (normalized.includes("blocked")) return "blocked";
  return "upcoming";
};

/**
 * Maps Linear priority to complexity
 */
const mapLinearPriority = (priority?: number): "low" | "medium" | "high" | undefined => {
  if (priority === undefined) return undefined;
  if (priority <= 1) return "low";
  if (priority <= 3) return "medium";
  return "high";
};

/**
 * Adapter for generic project management tools
 */
export const adaptGenericProjectManagement = (projectData: any): ProcessPhase[] => {
  const items = projectData.items || projectData.tasks || projectData.phases || [];
  
  if (!Array.isArray(items)) {
    console.warn('Generic project data is not an array:', projectData);
    return [];
  }
  
  return items.map(normalizeProcessPhase);
};

/**
 * Adapter for Monday.com boards
 */
export const adaptMondayBoard = (mondayData: any): ProcessPhase[] => {
  const items = mondayData.boards?.[0]?.items || [];
  
  return items.map((item: any, index: number) => {
    // Parse column values for additional data
    const columnValues = item.column_values?.reduce((acc: any, col: any) => {
      acc[col.title] = col.text || col.value;
      return acc;
    }, {}) || {};
    
    return {
      id: item.id || `monday-${index}`,
      stepNumber: index + 1,
      title: item.name || "Item",
      description: columnValues.Description || "",
      status: normalizePhaseStatus(columnValues.Status),
      owner: normalizeOwner(columnValues.Owner),
      complexity: columnValues.Complexity?.toLowerCase(),
      activities: columnValues.Activities ? columnValues.Activities.split(',').map((a: string) => a.trim()) : [],
      deliverables: columnValues.Deliverables ? columnValues.Deliverables.split(',').map((d: string) => d.trim()) : [],
      duration: columnValues.Duration,
      teamMembers: columnValues['Team Members'] ? columnValues['Team Members'].split(',').map((m: string) => m.trim()) : []
    };
  });
};

// ============================================================================
// Filtering and Sorting Utilities
// ============================================================================

/**
 * Filters phases by service category or type
 */
export const filterPhasesByService = (
  phases: ProcessPhase[],
  serviceCategories: string[]
): ProcessPhase[] => {
  return phases.filter(phase =>
    serviceCategories.some(category =>
      phase.title.toLowerCase().includes(category.toLowerCase()) ||
      phase.description.toLowerCase().includes(category.toLowerCase()) ||
      phase.activities?.some(activity =>
        activity.toLowerCase().includes(category.toLowerCase())
      )
    )
  );
};

/**
 * Sorts phases by specified criteria
 */
export const sortProcessPhases = (
  phases: ProcessPhase[],
  sortBy: 'stepNumber' | 'title' | 'status' | 'complexity' | 'owner' = 'stepNumber',
  direction: 'asc' | 'desc' = 'asc'
): ProcessPhase[] => {
  return [...phases].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'stepNumber':
        comparison = (a.stepNumber || 0) - (b.stepNumber || 0);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        const statusOrder = { upcoming: 0, active: 1, 'in-progress': 2, complete: 3, blocked: 4, pending: 0 };
        comparison = (statusOrder[a.status || 'upcoming'] || 0) - (statusOrder[b.status || 'upcoming'] || 0);
        break;
      case 'complexity':
        const complexityOrder = { low: 0, medium: 1, high: 2 };
        comparison = (complexityOrder[a.complexity || 'low'] || 0) - (complexityOrder[b.complexity || 'low'] || 0);
        break;
      case 'owner':
        const ownerOrder = { client: 0, shared: 1, studio: 2 };
        comparison = (ownerOrder[a.owner || 'studio'] || 2) - (ownerOrder[b.owner || 'studio'] || 2);
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

/**
 * Groups phases by specified criteria
 */
export const groupProcessPhases = (
  phases: ProcessPhase[],
  groupBy: 'status' | 'owner' | 'complexity'
): Record<string, ProcessPhase[]> => {
  return phases.reduce((groups, phase) => {
    let key: string;
    
    switch (groupBy) {
      case 'status':
        key = phase.status || 'upcoming';
        break;
      case 'owner':
        key = phase.owner || 'studio';
        break;
      case 'complexity':
        key = phase.complexity || 'medium';
        break;
      default:
        key = 'default';
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(phase);
    
    return groups;
  }, {} as Record<string, ProcessPhase[]>);
};

/**
 * Estimates total timeline duration
 */
export const estimateTimelineDuration = (phases: ProcessPhase[]): {
  min: number;
  max: number;
  unit: "days" | "weeks" | "months";
  label: string;
} | null => {
  let totalMinDays = 0;
  let totalMaxDays = 0;
  let hasAnyDuration = false;
  
  phases.forEach(phase => {
    let duration = extractDurationData(phase);
    
    if (duration) {
      totalMinDays += convertDurationToDays(duration.min, duration.unit);
      totalMaxDays += convertDurationToDays(duration.max, duration.unit);
      hasAnyDuration = true;
    }
  });
  
  if (!hasAnyDuration) return null;
  
  // Determine best unit for display
  let unit: "days" | "weeks" | "months";
  let min: number;
  let max: number;
  
  if (totalMaxDays >= 60) {
    unit = "months";
    min = Math.round(totalMinDays / 30 * 10) / 10;
    max = Math.round(totalMaxDays / 30 * 10) / 10;
  } else if (totalMaxDays >= 14) {
    unit = "weeks";
    min = Math.round(totalMinDays / 7 * 10) / 10;
    max = Math.round(totalMaxDays / 7 * 10) / 10;
  } else {
    unit = "days";
    min = totalMinDays;
    max = totalMaxDays;
  }
  
  const label = min === max 
    ? `${min} ${unit === "days" && min === 1 ? "day" : 
                unit === "weeks" && min === 1 ? "week" :
                unit === "months" && min === 1 ? "month" : unit}`
    : `${min}-${max} ${unit}`;
  
  return { min, max, unit, label };
};

/**
 * Extracts duration data from various phase duration formats
 */
const extractDurationData = (phase: ProcessPhase): DurationObject | null => {
  // Priority order: durationData -> structured duration -> parsed string
  if (phase.durationData) {
    return phase.durationData;
  }
  
  if (typeof phase.duration === "object") {
    return phase.duration;
  }
  
  const durationString = (typeof phase.duration === "string" ? phase.duration : phase.durationLabel);
  if (durationString) {
    return parseDurationString(durationString);
  }
  
  return null;
};

/**
 * Parses duration strings into structured objects
 */
const parseDurationString = (duration: string): DurationObject | null => {
  if (!duration || typeof duration !== "string") return null;
  
  const cleaned = duration.trim().toLowerCase();
  
  // Range patterns: "1-2 weeks", "3–5 days", "2 - 4 months"
  const rangeMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)/);
  if (rangeMatch) {
    const min = parseFloat(rangeMatch[1]);
    const max = parseFloat(rangeMatch[2]);
    const unit = normalizeTimeUnit(rangeMatch[3]);
    return { min, max, unit };
  }
  
  // Single value patterns: "2 weeks", "5 days", "1 month"
  const singleMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(day|days|week|weeks|month|months)/);
  if (singleMatch) {
    const value = parseFloat(singleMatch[1]);
    const unit = normalizeTimeUnit(singleMatch[2]);
    return { min: value, max: value, unit };
  }
  
  return null;
};

/**
 * Normalizes time unit strings
 */
const normalizeTimeUnit = (unit: string): "days" | "weeks" | "months" => {
  const normalized = unit.toLowerCase();
  if (normalized.startsWith("day")) return "days";
  if (normalized.startsWith("week")) return "weeks";
  if (normalized.startsWith("month")) return "months";
  return "days";
};

/**
 * Converts duration to days for calculation
 */
const convertDurationToDays = (value: number, unit: "days" | "weeks" | "months"): number => {
  switch (unit) {
    case "days": return value;
    case "weeks": return value * 7;
    case "months": return value * 30;
    default: return value;
  }
};

// ============================================================================
// Section Factory for Service Pages
// ============================================================================

/**
 * Creates a complete timeline section for service pages
 */
export const createProcessTimelineSection = (
  serviceName: string,
  phases: ProcessPhase[],
  config: Partial<ProcessTimelineProps> = {}
): ProcessTimelineSection => {
  const serviceAdapters = {
    'Web Development': createWebDevProcessTimeline,
    'Video Production': createVideoProductionProcessTimeline,
    'Lead Generation': createLeadGenProcessTimeline,
    'Marketing Automation': createMarketingAutomationProcessTimeline,
    'SEO Services': createSEOServicesProcessTimeline,
    'Content Production': createContentProductionProcessTimeline
  };
  
  const adapter = serviceAdapters[serviceName as keyof typeof serviceAdapters];
  
  if (adapter) {
    const timelineProps = adapter(phases, config);
    return {
      title: timelineProps.title,
      subtitle: timelineProps.subtitle,
      data: timelineProps.phases || [],
      config: timelineProps
    };
  }
  
  // Fallback for unrecognized services
  return {
    title: `${serviceName} Process`,
    subtitle: `Our structured approach to delivering exceptional ${serviceName.toLowerCase()} results.`,
    data: phases.map(normalizeProcessPhase),
    config: {
      variant: "detailed",
      interactive: true,
      showSummary: true,
      collapsible: true,
      defaultOpen: "all",
      ...config
    }
  };
};