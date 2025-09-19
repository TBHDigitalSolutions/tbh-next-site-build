// /components/sections/wrappers/SectionProvider/SectionProvider.tsx
import * as React from "react";

export type SectionVariant = "default" | "muted" | "brand" | "dark" | "light";
export type SectionPad = "none" | "sm" | "md" | "lg" | "xl";
export type SectionContainer = "none" | "sm" | "md" | "lg" | "xl";

export interface SectionTheme {
  /** Visual style token for background/typography shifts */
  variant?: SectionVariant;
  /** Vertical padding scale */
  padY?: SectionPad;
  /** Horizontal padding scale (optional; usually handled by container) */
  padX?: SectionPad;
  /** Constrain inner width using a container */
  container?: SectionContainer;
  /** Allow background to bleed to viewport edges while content stays constrained */
  bleed?: boolean;
  /** Draw a divider at the section’s top/bottom */
  divider?: "none" | "top" | "bottom" | "both";
  /** Optional semantic role */
  role?: string;
  /** Optional ARIA label */
  ariaLabel?: string;
  /** Optional data test id */
  testId?: string;
}

const defaultTheme: Required<Omit<SectionTheme, "ariaLabel" | "role" | "testId">> = {
  variant: "default",
  padY: "lg",
  padX: "md",
  container: "lg",
  bleed: false,
  divider: "none",
};

type ContextValue = {
  theme: SectionTheme;
};

const SectionContext = React.createContext<ContextValue>({ theme: defaultTheme });

/**
 * Provider to establish default look/feel + spacing for nested sections.
 * Server-component friendly: no client-only APIs used here.
 */
export function SectionProvider({
  value,
  children,
}: {
  value?: SectionTheme;
  children: React.ReactNode;
}) {
  const theme = React.useMemo<SectionTheme>(() => ({ ...defaultTheme, ...(value ?? {}) }), [value]);
  return <SectionContext.Provider value={{ theme }}>{children}</SectionContext.Provider>;
}

/**
 * Read the current section theme (intended for wrapper/components).
 * Safe in both Server/Client, no effects.
 */
export function getSectionTheme(ctx?: React.Context<ContextValue>) {
  // Exposed for testing/inversion if you ever need a different context in the future.
  return SectionContext;
}

/** Internal hook used by SectionWrapper (kept here for single source of truth). */
export function useSectionTheme(): SectionTheme {
  return React.useContext(SectionContext).theme;
}
