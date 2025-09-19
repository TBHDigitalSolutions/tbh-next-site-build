// src/components/ui/organisms/FunnelDiagram/FunnelDiagram.utils.ts

import type { FunnelStep } from "./FunnelDiagram.types";

/**
 * Utility functions for FunnelDiagram component
 */

/**
 * Calculate funnel step width based on position
 */
export const calculateStepWidth = (index: number, totalSteps: number): number => {
  const baseWidth = 100;
  const reductionPerStep = Math.min(15, (baseWidth - 30) / totalSteps);
  return Math.max(baseWidth - (index * reductionPerStep), 30);
};

/**
 * Generate color for step based on color scheme
 */
export const getStepColor = (
  index: number, 
  colorScheme: string, 
  customColors?: string[]
): string => {
  if (customColors && customColors[index]) {
    return customColors[index];
  }

  switch (colorScheme) {
    case "gradient":
      const gradientColors = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"];
      return gradientColors[index % gradientColors.length];
    
    case "rainbow":
      const rainbowColors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
      return rainbowColors[index % rainbowColors.length];
    
    case "monochrome":
      const intensity = Math.max(100 - (index * 15), 20);
      return `hsl(220, 50%, ${intensity}%)`;
    
    case "success":
      const successColors = ["#10b981", "#059669", "#047857", "#065f46"];
      return successColors[index % successColors.length];
    
    case "warning":
      const warningColors = ["#f59e0b", "#d97706", "#b45309", "#92400e"];
      return warningColors[index % warningColors.length];
    
    case "blue":
    default:
      return `hsl(200, 70%, ${Math.max(75 - index * 10, 35)}%)`;
  }
};

/**
 * Format volume numbers with appropriate units
 */
export const formatVolume = (volume: number): string => {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toLocaleString();
};

/**
 * Calculate conversion rate between steps
 */
export const calculateConversionRate = (
  currentVolume: number, 
  previousVolume: number
): number => {
  if (previousVolume === 0) return 0;
  return Math.round((currentVolume / previousVolume) * 100);
};

/**
 * Validate funnel step data
 */
export const validateFunnelStep = (step: FunnelStep): boolean => {
  return !!(step.stage && step.title && step.description);
};

/**
 * Validate complete funnel data
 */
export const validateFunnelData = (steps: FunnelStep[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (!Array.isArray(steps) || steps.length === 0) {
    errors.push("Funnel must contain at least one step");
    return { isValid: false, errors };
  }

  steps.forEach((step, index) => {
    if (!validateFunnelStep(step)) {
      errors.push(`Step ${index + 1}: Missing required fields (stage, title, description)`);
    }
    
    if (step.conversionRate && (step.conversionRate < 0 || step.conversionRate > 100)) {
      errors.push(`Step ${index + 1}: Conversion rate must be between 0 and 100`);
    }
    
    if (step.volume && step.volume < 0) {
      errors.push(`Step ${index + 1}: Volume cannot be negative`);
    }
  });

  return { isValid: errors.length === 0, errors };
};

/**
 * Generate step IDs if not provided
 */
export const ensureStepIds = (steps: FunnelStep[]): FunnelStep[] => {
  return steps.map((step, index) => ({
    ...step,
    id: step.id || `step-${index}-${step.stage.toLowerCase().replace(/\s+/g, '-')}`
  }));
};

/**
 * Calculate total funnel metrics
 */
export const calculateFunnelMetrics = (steps: FunnelStep[]) => {
  const totalVolume = steps.reduce((sum, step) => sum + (step.volume || 0), 0);
  const avgConversionRate = steps.reduce((sum, step) => sum + (step.conversionRate || 0), 0) / steps.length;
  const dropOffPoints = steps.map((step, index) => {
    if (index === 0) return 0;
    const previousStep = steps[index - 1];
    if (!step.volume || !previousStep.volume) return 0;
    return ((previousStep.volume - step.volume) / previousStep.volume) * 100;
  });

  return {
    totalSteps: steps.length,
    totalVolume,
    avgConversionRate: Math.round(avgConversionRate),
    dropOffPoints,
    highestDropOff: Math.max(...dropOffPoints.slice(1)),
    lowestDropOff: Math.min(...dropOffPoints.slice(1))
  };
};

/**
 * Generate accessibility labels
 */
export const generateA11yLabels = (step: FunnelStep, index: number, total: number) => {
  const position = `Step ${index + 1} of ${total}`;
  const stage = step.stage;
  const description = step.description;
  const metrics = step.conversionRate ? `Conversion rate: ${step.conversionRate}%` : '';
  const volume = step.volume ? `Volume: ${formatVolume(step.volume)}` : '';
  
  return {
    ariaLabel: `${position}: ${stage}. ${description}`,
    ariaDescription: [metrics, volume].filter(Boolean).join('. '),
    role: 'button',
    tabIndex: 0
  };
};

/**
 * Determine optimal arrow style based on step count
 */
export const getOptimalArrowStyle = (stepCount: number, variant: string): string => {
  if (stepCount <= 3) return "animated";
  if (stepCount <= 5) return "curved";
  if (variant === "minimal") return "dotted";
  return "simple";
};

/**
 * Calculate responsive breakpoints
 */
export const getResponsiveConfig = (width: number) => {
  if (width < 480) {
    return {
      orientation: "vertical",
      variant: "minimal",
      showTactics: false,
      size: "small",
      mobileVariant: "accordion"
    };
  }
  
  if (width < 768) {
    return {
      orientation: "vertical",
      variant: "interactive", 
      showTactics: true,
      size: "medium",
      mobileVariant: "stacked"
    };
  }
  
  if (width < 1024) {
    return {
      orientation: "vertical",
      variant: "interactive",
      showTactics: true,
      size: "medium"
    };
  }
  
  return {
    orientation: "vertical",
    variant: "interactive",
    showTactics: true,
    size: "large"
  };
};

/**
 * Generate CSS custom properties for theming
 */
export const generateThemeVars = (
  colorScheme: string, 
  customColors?: string[]
) => {
  const baseVars: Record<string, string> = {};
  
  if (customColors) {
    customColors.forEach((color, index) => {
      baseVars[`--funnel-step-${index}`] = color;
    });
  }
  
  switch (colorScheme) {
    case "gradient":
      baseVars["--funnel-primary"] = "#667eea";
      baseVars["--funnel-secondary"] = "#764ba2";
      break;
    case "rainbow":
      baseVars["--funnel-primary"] = "#ff6b6b";
      baseVars["--funnel-secondary"] = "#4ecdc4";
      break;
    case "monochrome":
      baseVars["--funnel-primary"] = "#64748b";
      baseVars["--funnel-secondary"] = "#475569";
      break;
    default:
      baseVars["--funnel-primary"] = "#0ea5e9";
      baseVars["--funnel-secondary"] = "#0284c7";
  }
  
  return baseVars;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Smooth scroll to funnel step
 */
export const scrollToStep = (stepId: string, behavior: ScrollBehavior = 'smooth') => {
  const element = document.getElementById(stepId);
  if (element) {
    element.scrollIntoView({
      behavior,
      block: 'center',
      inline: 'nearest'
    });
  }
};

/**
 * Export all funnel data to JSON
 */
export const exportFunnelData = (steps: FunnelStep[], metadata?: any) => {
  const exportData = {
    metadata: {
      exportDate: new Date().toISOString(),
      stepCount: steps.length,
      ...metadata
    },
    steps,
    metrics: calculateFunnelMetrics(steps)
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `funnel-data-${Date.now()}.json`;
  link.click();
  
  URL.revokeObjectURL(url);
};

/**
 * Performance monitoring utilities
 */
export const performanceMonitor = {
  start: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },
  
  end: (label: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
      
      const measures = performance.getEntriesByName(label);
      const duration = measures[measures.length - 1]?.duration;
      
      if (duration && duration > 100) {
        console.warn(`FunnelDiagram ${label} took ${duration.toFixed(2)}ms`);
      }
    }
  }
};