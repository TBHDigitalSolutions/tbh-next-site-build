// shared-ui/hooks/useFilters.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

type FilterGroup = string;
type FilterValue = string;

interface UseFiltersOptions<T = any> {
  initialFilters?: Record<FilterGroup, FilterValue[]>; 
  singleSelectGroups?: FilterGroup[];
  syncToQueryParams?: boolean;
  localStorageKey?: string;
  filterFn?: (item: T, filters: Record<FilterGroup, FilterValue[]>) => boolean;
} 

interface UseFilters<T = any> {
  filters: Record<FilterGroup, FilterValue[]>;
  isActive: (group: FilterGroup, value: FilterValue) => boolean;
  toggleFilter: (group: FilterGroup, value: FilterValue) => void; 
  setFilter: (group: FilterGroup, values: FilterValue[]) => void;
  clearGroup: (group: FilterGroup) => void;
  clearAll: () => void;
  getFilteredResults: (data: T[]) => T[];
}

/** 
 * useFilters
 * A fully enhanced filter hook for client apps
 */
const useFilters = <T = any>({
  initialFilters = {}, 
  singleSelectGroups = [],
  syncToQueryParams = false,
  localStorageKey = "filters-store",
  filterFn,
}: UseFiltersOptions<T> = {}): UseFilters<T> => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Record<FilterGroup, FilterValue[]>>(initialFilters);

  // ⛓ Parse from URL if enabled
  useEffect(() => {
    if (!syncToQueryParams) return;
    const parsed: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
      parsed[key] = value.split(",").filter(Boolean);
    });
    setFilters(parsed);
  }, [syncToQueryParams, searchParams]);

  // 🧠 Load from localStorage if not syncing to query
  useEffect(() => {
    if (syncToQueryParams) return;
    const stored = localStorage.getItem(localStorageKey);
    if (stored) {
      try {
        setFilters(JSON.parse(stored));
      } catch {
        localStorage.removeItem(localStorageKey);
      }
    }
  }, [syncToQueryParams, localStorageKey]);

  // 💾 Save to localStorage
  useEffect(() => {
    if (!syncToQueryParams) {
      localStorage.setItem(localStorageKey, JSON.stringify(filters));
    }
  }, [filters, syncToQueryParams, localStorageKey]);

  // 🔗 Update URL
  useEffect(() => {
    if (!syncToQueryParams) return;
    const params = new URLSearchParams();
    for (const key in filters) {
      if (filters[key].length) {
        params.set(key, filters[key].join(","));
      }
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [filters, syncToQueryParams, router, pathname]);

  const isActive = useCallback((group: FilterGroup, value: FilterValue) => {
    return filters[group]?.includes(value) || false;
  }, [filters]);

  const toggleFilter = useCallback((group: FilterGroup, value: FilterValue) => {
    setFilters((prev) => {
      const groupFilters = prev[group] || [];
      const isSelected = groupFilters.includes(value);

      if (singleSelectGroups.includes(group)) {
        return {
          ...prev,
          [group]: isSelected ? [] : [value],
        };
      }

      return {
        ...prev,
        [group]: isSelected
          ? groupFilters.filter((v) => v !== value)
          : [...groupFilters, value],
      };
    });
  }, [singleSelectGroups]);

  const setFilter = useCallback((group: FilterGroup, values: FilterValue[]) => {
    setFilters((prev) => ({
      ...prev,
      [group]: values,
    }));
  }, []);

  const clearGroup = useCallback((group: FilterGroup) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[group];
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    setFilters({});
  }, []);

  const getFilteredResults = useCallback((data: T[]): T[] => {
    if (typeof filterFn !== "function") return data;
    return data.filter((item) => filterFn(item, filters));
  }, [filters, filterFn]);

  return {
    filters,
    isActive,
    toggleFilter,
    setFilter,
    clearGroup,
    clearAll,
    getFilteredResults,
  };
};

export default useFilters;
 