"use client";

import * as React from "react";

export type AccordionStateOptions = {
  /** total items for bounds safety (optional but helpful) */
  count?: number;
  /** open first N items on mount (0 = none) */
  defaultOpen?: number;
  /** allow multiple items open at once (default: true) */
  allowMultiple?: boolean;
  /** controlled open indices (optional) */
  openIndices?: number[];
  /** controlled onChange callback (optional) */
  onChange?(nextOpenIndices: number[]): void;
};

export type AccordionStateAPI = {
  /** Set of open indices (uncontrolled), or mirror of controlled state */
  openSet: Set<number>;
  /** helper: is index open? */
  isOpen(index: number): boolean;
  /** toggle a single index, honoring allowMultiple */
  toggle(index: number): void;
  /** open a specific index */
  open(index: number): void;
  /** close a specific index */
  close(index: number): void;
  /** open all (ignored if allowMultiple=false) */
  openAll(): void;
  /** close all */
  closeAll(): void;
};

/**
 * Manage accordion open/close state with support for:
 * - defaultOpen
 * - allowMultiple
 * - controlled/uncontrolled modes
 */
export function useAccordionState(opts: AccordionStateOptions = {}): AccordionStateAPI {
  const {
    count,
    defaultOpen = 0,
    allowMultiple = true,
    openIndices,
    onChange,
  } = opts;

  const isControlled = Array.isArray(openIndices);

  const [internalSet, setInternalSet] = React.useState<Set<number>>(() => {
    const s = new Set<number>();
    for (let i = 0; i < (defaultOpen ?? 0); i++) s.add(i);
    return s;
  });

  // Compute the source of truth
  const openSet = React.useMemo(() => {
    return new Set(isControlled ? openIndices : Array.from(internalSet));
  }, [isControlled, openIndices, internalSet]);

  // Emit changes to parent (controlled) or update internal state (uncontrolled)
  const commit = React.useCallback(
    (next: Set<number>) => {
      const arr = Array.from(next).sort((a, b) => a - b);
      if (isControlled) {
        onChange?.(arr);
      } else {
        setInternalSet(new Set(arr));
        onChange?.(arr);
      }
    },
    [isControlled, onChange]
  );

  const clamp = React.useCallback(
    (i: number) => (typeof count === "number" ? Math.max(0, Math.min(count - 1, i)) : i),
    [count]
  );

  const isOpen = React.useCallback((i: number) => openSet.has(clamp(i)), [openSet, clamp]);

  const toggle = React.useCallback(
    (i: number) => {
      const idx = clamp(i);
      const next = new Set(openSet);
      const currentlyOpen = next.has(idx);

      if (allowMultiple) {
        currentlyOpen ? next.delete(idx) : next.add(idx);
      } else {
        next.clear();
        if (!currentlyOpen) next.add(idx);
      }
      commit(next);
    },
    [openSet, allowMultiple, clamp, commit]
  );

  const open = React.useCallback(
    (i: number) => {
      const idx = clamp(i);
      const next = new Set(openSet);
      if (allowMultiple) next.add(idx);
      else {
        next.clear();
        next.add(idx);
      }
      commit(next);
    },
    [openSet, allowMultiple, clamp, commit]
  );

  const close = React.useCallback(
    (i: number) => {
      const idx = clamp(i);
      const next = new Set(openSet);
      next.delete(idx);
      commit(next);
    },
    [openSet, clamp, commit]
  );

  const openAll = React.useCallback(() => {
    if (!allowMultiple || typeof count !== "number") return;
    const next = new Set<number>();
    for (let i = 0; i < count; i++) next.add(i);
    commit(next);
  }, [allowMultiple, count, commit]);

  const closeAll = React.useCallback(() => {
    commit(new Set());
  }, [commit]);

  return { openSet, isOpen, toggle, open, close, openAll, closeAll };
}
