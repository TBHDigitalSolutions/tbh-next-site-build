// src/components/ui/organisms/ScopeDeliverables/utils.ts
import type { 
  ScopeData, 
  ScopeValidationResult, 
  ExtendedScopeData,
  ScopeItem,
  DetailedScopeData 
} from './ScopeDeliverables.types';

/**
 * Validates scope data structure and content
 */
export function validateScopeData(scope: any): ScopeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // Check if scope exists
  if (!scope || typeof scope !== 'object') {
    errors.push('Scope data is required and must be an object');
    return { isValid: false, errors, warnings, suggestions };
  }

  // Check required fields
  if (!Array.isArray(scope.includes)) {
    errors.push('Scope must include an "includes" array');
  } else if (scope.includes.length === 0) {
    warnings.push('Scope includes array is empty');
    suggestions.push('Consider adding items that define what is included in the scope');
  }

  if (!Array.isArray(scope.deliverables)) {
    errors.push('Scope must include a "deliverables" array');
  } else if (scope.deliverables.length === 0) {
    warnings.push('Deliverables array is empty');
    suggestions.push('Consider adding specific deliverable items');
  }

  // Check add-ons if present
  if (scope.addons !== undefined && !Array.isArray(scope.addons)) {
    errors.push('Add-ons must be an array if provided');
  }

  // Content quality checks
  if (Array.isArray(scope.includes)) {
    scope.includes.forEach((item: any, index: number) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        errors.push(`Includes item at index ${index} must be a non-empty string`);
      } else if (item.length > 200) {
        warnings.push(`Includes item at index ${index} is very long (${item.length} chars)`);
        suggestions.push('Consider breaking down long items into smaller, more specific points');
      }
    });
  }

  if (Array.isArray(scope.deliverables)) {
    scope.deliverables.forEach((item: any, index: number) => {
      if (typeof item !== 'string' || item.trim().length === 0) {
        errors.push(`Deliverables item at index ${index} must be a non-empty string`);
      } else if (item.length > 200) {
        warnings.push(`Deliverables item at index ${index} is very long (${item.length} chars)`);
        suggestions.push('Consider breaking down long deliverable descriptions');
      }
    });
  }

  // Best practices suggestions
  if (scope.includes?.length > 10) {
    suggestions.push('Consider grouping or categorizing scope items if there are more than 10');
  }

  if (scope.deliverables?.length > 10) {
    suggestions.push('Consider grouping deliverables by category or phase');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    suggestions
  };
}

/**
 * Sanitizes and normalizes scope data
 */
export function sanitizeScopeData(scope: any): ScopeData {
  const sanitized: ScopeData = {
    includes: [],
    deliverables: [],
  };

  // Sanitize title and subtitle
  if (typeof scope.title === 'string') {
    sanitized.title = scope.title.trim();
  }

  if (typeof scope.subtitle === 'string') {
    sanitized.subtitle = scope.subtitle.trim();
  }

  // Sanitize includes array
  if (Array.isArray(scope.includes)) {
    sanitized.includes = scope.includes
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim())
      .slice(0, 20); // Limit to reasonable number
  }

  // Sanitize deliverables array
  if (Array.isArray(scope.deliverables)) {
    sanitized.deliverables = scope.deliverables
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim())
      .slice(0, 20); // Limit to reasonable number
  }

  // Sanitize addons array
  if (Array.isArray(scope.addons)) {
    sanitized.addons = scope.addons
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim())
      .slice(0, 15); // Limit to reasonable number
  }

  return sanitized;
}

/**
 * Merges multiple scope data objects
 */
export function mergeScopeData(...scopes: (ScopeData | undefined)[]): ScopeData {
  const merged: ScopeData = {
    includes: [],
    deliverables: [],
  };

  scopes.forEach(scope => {
    if (!scope) return;

    // Merge titles (last non-empty wins)
    if (scope.title?.trim()) {
      merged.title = scope.title.trim();
    }

    if (scope.subtitle?.trim()) {
      merged.subtitle = scope.subtitle.trim();
    }

    // Merge arrays (avoiding duplicates)
    if (Array.isArray(scope.includes)) {
      scope.includes.forEach(item => {
        if (!merged.includes.includes(item)) {
          merged.includes.push(item);
        }
      });
    }

    if (Array.isArray(scope.deliverables)) {
      scope.deliverables.forEach(item => {
        if (!merged.deliverables.includes(item)) {
          merged.deliverables.push(item);
        }
      });
    }

    if (Array.isArray(scope.addons)) {
      if (!merged.addons) merged.addons = [];
      scope.addons.forEach(item => {
        if (!merged.addons!.includes(item)) {
          merged.addons!.push(item);
        }
      });
    }
  });

  return merged;
}

/**
 * Converts simple string arrays to detailed scope items
 */
export function convertToDetailedScope(scope: ScopeData): DetailedScopeData {
  const convertStringToItem = (text: string, index: number, type: string): ScopeItem => ({
    id: `${type}-${index}`,
    text: text.trim(),
    priority: 'medium',
    effort: 'moderate',
  });

  return {
    title: scope.title,
    subtitle: scope.subtitle,
    includes: scope.includes.map((item, index) => convertStringToItem(item, index, 'include')),
    deliverables: scope.deliverables.map((item, index) => convertStringToItem(item, index, 'deliverable')),
    addons: scope.addons?.map((item, index) => convertStringToItem(item, index, 'addon')),
  };
}

/**
 * Estimates project complexity based on scope data
 */
export function estimateComplexity(scope: ScopeData): {
  level: 'simple' | 'moderate' | 'complex' | 'enterprise';
  score: number;
  factors: string[];
} {
  let score = 0;
  const factors: string[] = [];

  // Count total items
  const totalItems = scope.includes.length + scope.deliverables.length + (scope.addons?.length || 0);
  
  if (totalItems > 20) {
    score += 3;
    factors.push('Large number of scope items');
  } else if (totalItems > 10) {
    score += 2;
    factors.push('Moderate number of scope items');
  } else if (totalItems > 5) {
    score += 1;
    factors.push('Several scope items');
  }

  // Check for complex keywords
  const complexKeywords = ['integration', 'api', 'custom', 'advanced', 'enterprise', 'scalable', 'migration'];
  const allText = [...scope.includes, ...scope.deliverables, ...(scope.addons || [])].join(' ').toLowerCase();
  
  complexKeywords.forEach(keyword => {
    if (allText.includes(keyword)) {
      score += 1;
      factors.push(`Contains "${keyword}" requirement`);
    }
  });

  // Determine complexity level
  let level: 'simple' | 'moderate' | 'complex' | 'enterprise';
  if (score >= 8) {
    level = 'enterprise';
  } else if (score >= 5) {
    level = 'complex';
  } else if (score >= 3) {
    level = 'moderate';
  } else {
    level = 'simple';
  }

  return { level, score, factors };
}

/**
 * Generates a scope summary for quick overview
 */
export function generateScopeSummary(scope: ScopeData): {
  totalItems: number;
  breakdown: { includes: number; deliverables: number; addons: number };
  complexity: ReturnType<typeof estimateComplexity>;
  estimatedTimeframe: string;
} {
  const breakdown = {
    includes: scope.includes.length,
    deliverables: scope.deliverables.length,
    addons: scope.addons?.length || 0,
  };

  const totalItems = breakdown.includes + breakdown.deliverables + breakdown.addons;
  const complexity = estimateComplexity(scope);

  // Rough timeframe estimation
  let estimatedTimeframe: string;
  switch (complexity.level) {
    case 'simple':
      estimatedTimeframe = '1-2 weeks';
      break;
    case 'moderate':
      estimatedTimeframe = '2-4 weeks';
      break;
    case 'complex':
      estimatedTimeframe = '1-3 months';
      break;
    case 'enterprise':
      estimatedTimeframe = '3-6 months';
      break;
  }

  return {
    totalItems,
    breakdown,
    complexity,
    estimatedTimeframe,
  };
}

/**
 * Searches scope data for specific terms
 */
export function searchScopeData(scope: ScopeData, searchTerm: string): {
  matches: Array<{
    section: 'includes' | 'deliverables' | 'addons';
    item: string;
    index: number;
  }>;
  totalMatches: number;
} {
  const matches: Array<{
    section: 'includes' | 'deliverables' | 'addons';
    item: string;
    index: number;
  }> = [];

  const term = searchTerm.toLowerCase();

  // Search includes
  scope.includes.forEach((item, index) => {
    if (item.toLowerCase().includes(term)) {
      matches.push({ section: 'includes', item, index });
    }
  });

  // Search deliverables
  scope.deliverables.forEach((item, index) => {
    if (item.toLowerCase().includes(term)) {
      matches.push({ section: 'deliverables', item, index });
    }
  });

  // Search addons
  scope.addons?.forEach((item, index) => {
    if (item.toLowerCase().includes(term)) {
      matches.push({ section: 'addons', item, index });
    }
  });

  return {
    matches,
    totalMatches: matches.length,
  };
}

/**
 * Exports scope data to different formats
 */
export function exportScopeData(scope: ScopeData, format: 'json' | 'csv' | 'markdown'): string {
  switch (format) {
    case 'json':
      return JSON.stringify(scope, null, 2);

    case 'csv':
      const csvRows = [
        ['Section', 'Item'],
        ...scope.includes.map(item => ['Includes', item]),
        ...scope.deliverables.map(item => ['Deliverables', item]),
        ...(scope.addons || []).map(item => ['Add-ons', item]),
      ];
      return csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');

    case 'markdown':
      let markdown = '';
      
      if (scope.title) {
        markdown += `# ${scope.title}\n\n`;
      }
      
      if (scope.subtitle) {
        markdown += `${scope.subtitle}\n\n`;
      }

      markdown += '## Scope Includes\n\n';
      scope.includes.forEach(item => {
        markdown += `- ${item}\n`;
      });

      markdown += '\n## Deliverables\n\n';
      scope.deliverables.forEach(item => {
        markdown += `- ${item}\n`;
      });

      if (scope.addons?.length) {
        markdown += '\n## Optional Add-ons\n\n';
        scope.addons.forEach(item => {
          markdown += `- ${item}\n`;
        });
      }

      return markdown;

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

/**
 * Utility to check if any section has items
 */
export function hasAnyItems(scope: ScopeData): boolean {
  return scope.includes.length > 0 || scope.deliverables.length > 0 || (scope.addons?.length || 0) > 0;
}

/**
 * Utility to get the total count of all items
 */
export function getTotalItemCount(scope: ScopeData): number {
  return scope.includes.length + scope.deliverables.length + (scope.addons?.length || 0);
}

/**
 * Analytics helper for tracking scope interactions
 */
export function trackScopeAnalytics(
  action: string,
  section?: string,
  additionalData?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'scope_interaction', {
        action,
        section,
        ...additionalData,
      });
    }

    // Custom analytics
    if (typeof (window as any).analytics === 'object' && (window as any).analytics?.track) {
      (window as any).analytics.track('Scope Interaction', {
        action,
        section,
        ...additionalData,
      });
    }
  }
}