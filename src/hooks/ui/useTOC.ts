// shared-ui/hooks/useTOC.ts

"use client";

import { useEffect, useState, useRef } from "react";

export interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TOCNode extends TOCItem {
  children: TOCNode[];
}

interface UseTOCOptions {
  selector?: string;
  rootMargin?: string;
  offset?: number;
  threshold?: number;
  debounceMs?: number;
}

interface UseTOCResult {
  items: TOCItem[];
  tree: TOCNode[];
  activeId: string | null;
  scrollTo: (id: string) => void;
}

/**
 * All-in-one hook for Table of Contents functionality.
 * Scans for headings, builds hierarchical TOC, and tracks active heading.
 * 
 * @example
 * const { items, tree, activeId, scrollTo } = useTOC();
 * 
 * @param options Configuration options
 * @returns TOC data and functions
 */
export function useTOC({
  selector = "h2, h3, h4",
  rootMargin = "0px 0px -80% 0px",
  offset = 80, 
  threshold = 0.1,
  debounceMs = 50,
}: UseTOCOptions = {}): UseTOCResult {
  // Core state
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Refs for tracking
  const observerRef = useRef<IntersectionObserver | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const headingsRef = useRef<HTMLElement[]>([]);

  // 1. Extract headings from DOM on component mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Find all headings matching selector that have an ID
    const headings = Array.from(document.querySelectorAll<HTMLElement>(selector))
      .filter((el) => el.id);
    
    // Extract basic data from headings
    const tocItems = headings.map((el) => ({
      id: el.id,
      text: el.textContent?.trim() || "",
      level: parseInt(el.tagName.replace(/[^\d]/g, ""), 10),
    }));
    
    headingsRef.current = headings;
    setItems(tocItems);
  }, [selector]);

  // 2. Set up IntersectionObserver for scroll spy
  useEffect(() => {
    if (typeof window === "undefined" || !headingsRef.current.length) return;
    
    // Clean up previous observer if it exists
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    // Create new observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Clear previous timeout
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
        
        // Debounce updates to prevent thrashing
        timeoutRef.current = window.setTimeout(() => {
          // Sort visible entries by their intersection ratio
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          
          // Update the active ID if we have a visible element
          if (visible.length > 0 && visible[0].target.id) {
            setActiveId(visible[0].target.id);
          }
        }, debounceMs);
      },
      { rootMargin, threshold }
    );
    
    // Observe all headings
    headingsRef.current.forEach((heading) => observer.observe(heading));
    observerRef.current = observer;
    
    // Clean up on unmount
    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [rootMargin, threshold, debounceMs, items.length]);

  // 3. Build hierarchical tree from flat list
  const tree = buildTOCTree(items);
  
  // 4. Scroll helper function
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    
    // Calculate position with offset for fixed headers
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset;
    
    // Smooth scroll
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  
  return { items, tree, activeId, scrollTo };
}

/**
 * Helper function to convert flat TOC items into a nested tree structure
 */
function buildTOCTree(items: TOCItem[]): TOCNode[] {
  const result: TOCNode[] = [];
  const stack: TOCNode[] = [];
  
  items.forEach((item) => {
    const node: TOCNode = { ...item, children: [] };
    
    // Pop from stack until we find a parent with lower level
    while (
      stack.length && 
      stack[stack.length - 1].level >= node.level
    ) {
      stack.pop();
    }
    
    // Add to parent or root
    if (stack.length) {
      stack[stack.length - 1].children.push(node);
    } else {
      result.push(node);
    }
    
    stack.push(node);
  });
  
  return result;
}

export default useTOC;