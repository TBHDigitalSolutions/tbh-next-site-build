// shared-ui/hooks/useTheme.ts

"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";
type ThemeOption = Theme | "system";

const THEME_KEY = "theme-preference";

/**
 * useTheme
 *
 * Hook to manage light/dark/system theme toggling and persistence.
 * Automatically applies `.light` / `.dark` class to <html>.
 */
const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<Theme>("light");

  // Get system preference
  const getSystemTheme = (): Theme =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  // Apply theme class to <html>
  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark"); 
    root.classList.add(newTheme);
    setResolvedTheme(newTheme);
  }, []);

  // Set theme from user preference or system
  const loadTheme = useCallback(() => {
    const saved = localStorage.getItem(THEME_KEY) as ThemeOption | null;

    if (!saved || saved === "system") {
      const system = getSystemTheme();
      setTheme("system");
      applyTheme(system);
    } else {
      setTheme(saved);
      applyTheme(saved);
    }
  }, [applyTheme]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadTheme();

      // React to system theme changes
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        if (localStorage.getItem(THEME_KEY) === "system") {
          applyTheme(getSystemTheme());
        }
      };
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
  }, [applyTheme, loadTheme]);

  // Manual theme setter
  const setPreferredTheme = useCallback((newTheme: ThemeOption) => {
    if (newTheme === "system") {
      localStorage.setItem(THEME_KEY, "system");
      applyTheme(getSystemTheme());
    } else {
      localStorage.setItem(THEME_KEY, newTheme);
      applyTheme(newTheme);
    }
    setTheme(newTheme);
  }, [applyTheme]);

  // Toggle between light/dark only
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setPreferredTheme(newTheme);
  }, [resolvedTheme, setPreferredTheme]);

  return {
    theme,            // "light" | "dark" | "system"
    resolvedTheme,    // actual resolved theme
    setTheme: setPreferredTheme,
    toggleTheme,
  };
};

export default useTheme;
