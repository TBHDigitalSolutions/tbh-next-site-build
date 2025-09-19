// ===================================================================
// /src/search/client/debounce.ts
// ===================================================================
// Utility for debouncing user input to prevent excessive API calls

/**
 * Debounce function that delays execution until after wait time has elapsed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 200
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    // Clear existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set new timeout
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Advanced debounce with immediate execution option
 */
export function debounceAdvanced<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 200,
  options: {
    leading?: boolean;  // Execute immediately on first call
    trailing?: boolean; // Execute after wait period (default)
    maxWait?: number;   // Maximum time to wait before execution
  } = {}
): (...args: Parameters<T>) => void {
  const { leading = false, trailing = true, maxWait } = options;
  
  let timeoutId: NodeJS.Timeout | null = null;
  let maxTimeoutId: NodeJS.Timeout | null = null;
  let lastCallTime: number | null = null;
  let lastInvokeTime = 0;

  function invokeFunc(args: Parameters<T>) {
    lastInvokeTime = Date.now();
    return func(...args);
  }

  function clearTimers() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
  }

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const isInvoking = lastCallTime === null;
    
    lastCallTime = now;

    // Handle leading edge
    if (isInvoking && leading) {
      invokeFunc(args);
      return;
    }

    // Clear existing timers
    clearTimers();

    // Handle max wait
    if (maxWait !== undefined) {
      const timeSinceLastInvoke = now - lastInvokeTime;
      if (timeSinceLastInvoke >= maxWait) {
        invokeFunc(args);
        return;
      }
      
      maxTimeoutId = setTimeout(() => {
        invokeFunc(args);
      }, maxWait - timeSinceLastInvoke);
    }

    // Handle trailing edge
    if (trailing) {
      timeoutId = setTimeout(() => {
        invokeFunc(args);
      }, wait);
    }
  };
}

/**
 * React-specific debounce hook utility
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T {
  const callbackRef = React.useRef(callback);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Update callback ref when dependencies change
  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return React.useMemo(() => {
    return ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T;
  }, [delay]);
}