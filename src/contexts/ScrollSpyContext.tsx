// shared-ui/contexts/ScrollSpyContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";

interface ScrollSpyContextType {
  activeId: string | null;
  setActiveId: (id: string) => void;
}

const ScrollSpyContext = createContext<ScrollSpyContextType | undefined>(undefined);

/** 
 * ScrollSpyProvider
 * Wraps your layout or app and provides global scroll spy tracking.
 */
export const ScrollSpyProvider = ({ children }: { children: ReactNode }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <ScrollSpyContext.Provider value={{ activeId, setActiveId }}>
      {children}
    </ScrollSpyContext.Provider>
  );
};

/**
 * useScrollSpyContext
 * Access active heading state from anywhere in the tree.
 */
export const useScrollSpyContext = (): ScrollSpyContextType => {
  const context = useContext(ScrollSpyContext);
  if (!context) {
    throw new Error("useScrollSpyContext must be used within a <ScrollSpyProvider />");
  }
  return context;
};
