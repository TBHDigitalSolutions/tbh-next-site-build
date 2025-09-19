// shared-ui/hooks/useClipboard.ts
"use client";

import { useCallback, useState, useRef, useEffect } from "react";

interface UseClipboard {
  /** Copy text to the clipboard. Returns true on success. */
  copy: (text: string) => Promise<boolean>;
  /** Read text from the clipboard. Returns the text, or null on failure. */
  read: () => Promise<string | null>;
  /** Whether the last copy operation succeeded and is still within the “copied” timeout. */
  isCopied: boolean;
  /** Manually reset the copied state. */
  reset: () => void;
}

/**
 * useClipboard
 *
 * Centralized clipboard utility for copying and reading text.
 * - Falls back to document.execCommand if navigator.clipboard is unavailable.
 * - Tracks a brief “copied” state that auto-resets after a timeout.
 * - Exposes read & reset methods.
 */
const useClipboard = (resetAfterMs: number = 3000): UseClipboard => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Clear any pending reset timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    setIsCopied(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    // Attempt native Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setIsCopied(true);
        // Auto-reset after a delay
        timeoutRef.current = window.setTimeout(reset, resetAfterMs);
        return true;
      } catch (err) {
        console.error("❌ Clipboard writeText failed:", err);
      }
    }

    // Fallback: execCommand
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // Move off-screen
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        setIsCopied(true);
        timeoutRef.current = window.setTimeout(reset, resetAfterMs);
        return true;
      } else {
        throw new Error("execCommand returned false");
      }
    } catch (err) {
      console.error("❌ Fallback clipboard copy failed:", err);
      setIsCopied(false);
      return false;
    }
  }, [reset, resetAfterMs]);

  const read = useCallback(async (): Promise<string | null> => {
    if (navigator.clipboard && navigator.clipboard.readText) {
      try {
        return await navigator.clipboard.readText();
      } catch (err) {
        console.error("❌ Clipboard readText failed:", err);
        return null;
      }
    }
    console.warn("⚠️ Clipboard.readText not supported in this browser.");
    return null;
  }, []);

  return {
    copy,
    read,
    isCopied,
    reset,
  };
};

export default useClipboard;
