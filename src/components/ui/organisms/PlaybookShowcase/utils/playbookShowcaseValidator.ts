// src/components/ui/organisms/PlaybookShowcase/utils/playbookShowcaseValidator.ts

import { z } from "zod";
import type { 
  PlaybookItem, 
  PlaybookSection, 
  PlaybookInput,
  PlaybookShowcaseProps,
  PlaybookDifficulty
} from "../PlaybookShowcase.types";

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Playbook step schema
 */
const playbookStepSchema = z.object({
  id: z.string().min(1, "Step ID is required"),
  title: z.string().min(1, "Step title is required"),
  description: z.string().optional()
});

/**
 * Base playbook item schema with validation rules
 */
export const playbookItemSchema = z.object({
  id: z.string().min(1, "Playbook ID is required"),
  title: z.string().min(1, "Playbook title is required"),
  description: z.string().min(1, "Playbook description is required"),
  category: z.string().min(1, "Playbook category is required"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  tags: z.array(z.string()).optional(),
  steps: z.array(playbookStepSchema).optional(),
  metrics: z.record(z.string()).optional(),
  cover: z.string().optional(),
  href: z.string().optional(),
  downloadUrl: z.string().optional(),
  readTime: z.string().optional(),
  featured: z.boolean().optional(),
  fileType: z.enum(["pdf", "doc", "guide", "checklist"]).optional(),
  fileSize: z.string().optional()
});

/**
 * Playbook section schema for service pages
 */
export const playbookSectionSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  data: z.union([
    z.array(playbookItemSchema),
    z.object({ playbooks: z.array(playbookItemSchema).optional() }),
    z.object({ resources: z.array(playbookItemSchema).optional() }),
    z.object({ guides: z.array(playbookItemSchema).optional() }),
    z.null(),
    z.undefined()
  ]),
  cardVariant: z.enum(["compact", "detailed"]).optional(),
  columns: z.enum([2, 3, 4]).optional(),
  showFeatured: z.boolean().optional(),
  maxItems: z.number().positive().optional(),
  defaultCategory: z.string().optional(),
  defaultDifficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional()
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a single playbook item
 */
export const validatePlaybookItem = (item: unknown): item is PlaybookItem => {
  const result = playbookItemSchema.safeParse(item);
  return result.success;
};

/**
 * Safely parses a playbook item with detailed error reporting
 */
export const parsePlaybookItem = (item: unknown): { success: boolean; data?: PlaybookItem; error?: string } => {
  const result = playbookItemSchema.safeParse(item);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

/**
 * Validates playbook showcase props
 */
export const validatePlaybookShowcaseProps = (props: unknown): props is PlaybookShowcaseProps => {
  if (!props || typeof props !== 'object') return false;
  
  const p = props as any;
  
  // Required: playbooks array
  if (!Array.isArray(p.playbooks)) return false;
  
  // Validate each playbook item
  return p.playbooks.every((item: unknown) => validatePlaybookItem(item));
};

/**
 * Safely parses playbook showcase props
 */
export const parsePlaybookShowcaseProps = (props: unknown): { 
  success: boolean; 
  data?: PlaybookShowcaseProps; 
  error?: string 
} => {
  if (!validatePlaybookShowcaseProps(props)) {
    return { 
      success: false, 
      error: 'Invalid PlaybookShowcaseProps: must have valid playbooks array' 
    };
  }
  
  return { success: true, data: props as PlaybookShowcaseProps };
};

/**
 * Safely parse playbook section with detailed error reporting
 */
export const parsePlaybookSection = (section: unknown): { success: boolean; data?: PlaybookSection; error?: string } => {
  const result = playbookSectionSchema.safeParse(section);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { 
    success: false, 
    error: result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ')
  };
};

// ============================================================================
// Normalization & Transformation Utilities
// ============================================================================

/**
 * Validates and cleans a playbook showcase input
 */
export const validateAndCleanPlaybookShowcase = (input: unknown): {
  isValid: boolean;
  errors: string[];
  cleanedData?: PlaybookItem[];
} => {
  const errors: string[] = [];
  const cleanedData: PlaybookItem[] = [];
  
  if (!input) {
    return { isValid: false, errors: ['Input is required'] };
  }
  
  let items: unknown[] = [];
  
  if (Array.isArray(input)) {
    items = input;
  } else if (typeof input === 'object') {
    const obj = input as any;
    if (Array.isArray(obj.playbooks)) items = obj.playbooks;
    else if (Array.isArray(obj.resources)) items = obj.resources;
    else if (Array.isArray(obj.guides)) items = obj.guides;
    else {
      return { isValid: false, errors: ['No valid playbooks array found'] };
    }
  } else {
    return { isValid: false, errors: ['Input must be array or object'] };
  }
  
  items.forEach((item, index) => {
    const parseResult = parsePlaybookItem(item);
    if (parseResult.success && parseResult.data) {
      cleanedData.push(parseResult.data);
    } else {
      errors.push(`Item ${index}: ${parseResult.error || 'Invalid item'}`);
    }
  });
  
  return {
    isValid: errors.length === 0 && cleanedData.length > 0,
    errors,
    cleanedData: cleanedData.length > 0 ? cleanedData : undefined
  };
};

/**
 * Validates if a difficulty level is valid
 */
export const isValidPlaybookDifficulty = (difficulty: unknown): difficulty is PlaybookDifficulty => {
  return typeof difficulty === 'string' && 
         ['Beginner', 'Intermediate', 'Advanced'].includes(difficulty);
};

/**
 * Gets all valid difficulty levels
 */
export const getValidPlaybookDifficulties = (): PlaybookDifficulty[] => {
  return ['Beginner', 'Intermediate', 'Advanced'];
};

/**
 * Validates if a file type is valid
 */
export const isValidFileType = (fileType: unknown): fileType is PlaybookItem['fileType'] => {
  return typeof fileType === 'string' && 
         ['pdf', 'doc', 'guide', 'checklist'].includes(fileType);
};

/**
 * Normalizes playbook categories from an array of items
 */
export const extractPlaybookCategories = (playbooks: PlaybookItem[]): string[] => {
  const categories = new Set<string>();
  playbooks.forEach(pb => {
    if (pb.category && pb.category.trim()) {
      categories.add(pb.category.trim());
    }
  });
  return Array.from(categories).sort();
};

/**
 * Normalizes difficulty levels from an array of items
 */
export const extractPlaybookDifficulties = (playbooks: PlaybookItem[]): PlaybookDifficulty[] => {
  const difficulties = new Set<PlaybookDifficulty>();
  playbooks.forEach(pb => {
    if (pb.difficulty && isValidPlaybookDifficulty(pb.difficulty)) {
      difficulties.add(pb.difficulty);
    }
  });
  
  // Return in logical order
  const order: PlaybookDifficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
  return order.filter(d => difficulties.has(d));
};