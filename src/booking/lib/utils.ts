// src/booking/lib/utils.ts
// Pure utilities safe on server and client
// No React imports - keep this SSR/Node-safe

import { normalizeServiceSlug } from "@/shared/services/utils";
import type { CanonicalService } from "@/shared/services/types";
import { VALIDATION } from "./constants";

/**
 * Safely convert input to canonical service slug
 */
export function toCanonicalService(input?: string): CanonicalService | undefined {
  if (!input || typeof input !== "string") return undefined;
  try {
    return normalizeServiceSlug(input.trim());
  } catch {
    return undefined;
  }
}

/**
 * Coerce unknown value to string with trimming
 */
export function coerceString(v: unknown): string | undefined {
  if (typeof v === "string" && v.trim()) {
    return v.trim();
  }
  if (typeof v === "number") {
    return String(v);
  }
  return undefined;
}

/**
 * Coerce unknown value to boolean
 */
export function coerceBool(v: unknown): boolean | undefined {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const lower = v.toLowerCase().trim();
    if (["true", "1", "yes", "on"].includes(lower)) return true;
    if (["false", "0", "no", "off", ""].includes(lower)) return false;
  }
  if (typeof v === "number") {
    return v !== 0;
  }
  return undefined;
}

/**
 * Type guard for non-empty arrays
 */
export function isNonEmptyArray<T>(a: unknown): a is T[] {
  return Array.isArray(a) && a.length > 0;
}

/**
 * Build URL query string from object, filtering out undefined/null values
 */
export function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (typeof value === "boolean") {
      sp.set(key, value ? "1" : "0");
    } else {
      sp.set(key, String(value));
    }
  });
  
  return sp.toString();
}

/**
 * Safe shallow merge without mutating inputs
 */
export function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...(a as any), ...(b as any) };
}

/**
 * Deep clone simple objects (no functions/classes/dates)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;
  
  const cloned = {} as T;
  Object.keys(obj).forEach((key) => {
    (cloned as any)[key] = deepClone((obj as any)[key]);
  });
  
  return cloned;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false;
  return VALIDATION.emailPattern.test(email.trim());
}

/**
 * Validate name format
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= VALIDATION.minNameLength && 
         trimmed.length <= VALIDATION.maxNameLength;
}

/**
 * Validate notes/message length
 */
export function isValidNotes(notes: string): boolean {
  if (!notes || typeof notes !== "string") return true; // optional field
  return notes.trim().length <= VALIDATION.maxNotesLength;
}

/**
 * Extract domain from URL safely
 */
export function extractDomain(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return undefined;
  }
}

/**
 * Generate a simple unique ID for tracking
 */
export function generateId(prefix = "booking"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Debounce function for search/input handling
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for event handling
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Format duration in minutes to human readable
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${remainingMinutes} min`;
}

/**
 * Get user's timezone safely
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (!isBrowser()) return false;
  
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/**
 * Get viewport width safely
 */
export function getViewportWidth(): number {
  if (!isBrowser()) return 1024; // SSR fallback
  
  try {
    return window.innerWidth;
  } catch {
    return 1024;
  }
}