// src/components/ui/organisms/ProcessFlow/ProcessFlow.types.ts

export interface FlowStepData {
  /** Unique identifier for the step */
  id: string;
  /** Step number or order */
  step: number;
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Step icon (Ionicon name) */
  icon?: string;
  /** Step status */
  status?: "completed" | "active" | "pending" | "error" | "skipped";
  /** Estimated duration */
  duration?: string;
  /** Timeline date */
  date?: string;
  /** Deliverables for this step */
  deliverables?: string[];
  /** Resources needed */
  resources?: string[];
  /** Dependencies */
  dependencies?: string[];
  /** Additional details */
  details?: string;
  /** Custom styling */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Whether step is interactive */
  interactive?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Progress percentage (0-100) */
  progress?: number;
  /** Substeps */
  substeps?: Omit<FlowStepData, "substeps">[];
}

export interface ProcessFlowProps {
  /** Array of flow steps */
  steps: FlowStepData[];
  
  /** Visual variant */
  variant?: "default" | "timeline" | "horizontal" | "vertical" | "cards" | "minimal" | "roadmap";
  
  /** Flow orientation */
  orientation?: "vertical" | "horizontal";
  
  /** Show step numbers */
  showStepNumbers?: boolean;
  
  /** Show step icons */
  showIcons?: boolean;
  
  /** Show step status */
  showStatus?: boolean;
  
  /** Show deliverables */
  showDeliverables?: boolean;
  
  /** Show resources */
  showResources?: boolean;
  
  /** Show dependencies */
  showDependencies?: boolean;
  
  /** Show duration */
  showDuration?: boolean;
  
  /** Show dates */
  showDates?: boolean;
  
  /** Show progress bars */
  showProgress?: boolean;
  
  /** Enable step interactions */
  interactive?: boolean;
  
  /** Enable step expansion */
  expandable?: boolean;
  
  /** Default expanded state */
  defaultExpanded?: boolean[];
  
  /** Enable animations */
  animated?: boolean;
  
  /** Animation type */
  animationType?: "fade" | "slide" | "zoom" | "stagger";
  
  /** Current active step */
  activeStep?: number;
  
  /** Completed steps */
  completedSteps?: number[];
  
  /** Color scheme */
  colorScheme?: "blue" | "green" | "purple" | "orange" | "red" | "custom";
  
  /** Custom colors */
  customColors?: {
    primary?: string;
    secondary?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  
  /** Connector style */
  connectorStyle?: "line" | "dotted" | "dashed" | "arrow" | "curved";
  
  /** Show connector between steps */
  showConnector?: boolean;
  
  /** Size variant */
  size?: "small" | "medium" | "large";
  
  /** Spacing between steps */
  spacing?: "compact" | "normal" | "spacious";
  
  /** Maximum width */
  maxWidth?: string;
  
  /** Center align content */
  centered?: boolean;
  
  /** Enable responsive behavior */
  responsive?: boolean;
  
  /** Mobile layout variant */
  mobileVariant?: "stack" | "carousel" | "accordion";
  
  /** Step click handler */
  onStepClick?: (step: FlowStepData, index: number) => void;
  
  /** Step hover handler */
  onStepHover?: (step: FlowStepData, index: number) => void;
  
  /** Progress change handler */
  onProgressChange?: (stepId: string, progress: number) => void;
  
  /** Component title */
  title?: string;
  
  /** Component subtitle */
  subtitle?: string;
  
  /** Header content */
  headerContent?: React.ReactNode;
  
  /** Footer content */
  footerContent?: React.ReactNode;
  
  /** Loading state */
  loading?: boolean;
  
  /** Error state */
  error?: string;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Background color */
  backgroundColor?: string;
  
  /** Border style */
  borderStyle?: "none" | "subtle" | "solid";
  
  /** Additional CSS classes */
  className?: string;
  
  /** Custom styles */
  style?: React.CSSProperties;
}