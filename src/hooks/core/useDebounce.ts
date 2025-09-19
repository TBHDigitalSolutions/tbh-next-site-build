// shared-ui/hooks/useDebounce.ts
"use client";
 
import { useEffect, useRef, useState } from "react";

interface DebounceOptions {
  /** If true, the debounced value is updated immediately on first call */
  leading?: boolean;
  /** If true, the debounced value is updated after the delay when calls stop */
  trailing?: boolean;
}

/**
 * useDebounce
 *
 * Returns a debounced version of the input value. Supports optional leading
 * invocation (immediate update) and trailing invocation (update after delay).
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @param options.leading - If true, update value immediately on first change
 * @param options.trailing - If true, update value after the delay on last change
 * @returns The debounced value
 */
export function useDebounce<T>(
  value: T,
  delay: number = 300,
  options: DebounceOptions = {}
): T {
  const { leading = false, trailing = true } = options;
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // Track whether leading call has been executed
  const hasLeadingExecuted = useRef(false);
  // Store timeout ID for cleanup
  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    // Clear existing timeout on every change
    if (timeoutId.current !== null) {
      clearTimeout(timeoutId.current);
    }

    // Leading edge: update immediately once
    if (leading && !hasLeadingExecuted.current) {
      setDebouncedValue(value);
      hasLeadingExecuted.current = true;
    }

    // Schedule trailing edge update
    if (trailing) {
      timeoutId.current = window.setTimeout(() => {
        setDebouncedValue(value);
        hasLeadingExecuted.current = false; // reset for next leading call
        timeoutId.current = null;
      }, delay);
    } else {
      // If no trailing, reset leading flag after delay so next change can trigger leading again
      timeoutId.current = window.setTimeout(() => {
        hasLeadingExecuted.current = false;
        timeoutId.current = null;
      }, delay);
    }

    // Cleanup on unmount or before next effect
    return () => {
      if (timeoutId.current !== null) {
        clearTimeout(timeoutId.current);
        timeoutId.current = null;
      }
    };
  }, [value, delay, leading, trailing]);

  return debouncedValue;
}
