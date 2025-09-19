// shared-ui/hooks/ui/usePagination.ts

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UsePaginationOptions<T> {
  data?: T[]; // optional static data
  limit?: number;
  total?: number;
  initialPage?: number;
  infiniteScroll?: boolean;
  fetchFn?: (page: number, limit: number) => Promise<T[]>;
}

export interface UsePagination<T> {
  currentPage: number;
  totalPages: number;
  data: T[];
  hasMore: boolean;
  isLoading: boolean;
  nextPage: () => void;
  prevPage: () => void;
  reset: () => void;
  triggerRef?: React.RefObject<HTMLDivElement>; // used if infiniteScroll = true
}

/**
 * usePagination
 * 
 * Handles both offset-based and infinite scroll pagination.
 * Automatically tracks loading state and supports async fetch functions.
 */
function usePagination<T>({
  data = [],
  limit = 10,
  total,
  initialPage = 1,
  infiniteScroll = false,
  fetchFn,
}: UsePaginationOptions<T>): UsePagination<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [paginatedData, setPaginatedData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const totalItems = total ?? data.length;
  const totalPages = Math.ceil(totalItems / limit);
  const hasMore = currentPage < totalPages;

  const triggerRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    if (isLoading || !fetchFn) return;
    setIsLoading(true);
    try {
      const newData = await fetchFn(currentPage, limit);
      setPaginatedData((prev) =>
        currentPage === 1 ? newData : [...prev, ...newData]
      );
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, currentPage, limit, isLoading]);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setCurrentPage((p) => p + 1);
    }
  }, [hasMore]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
    }
  }, [currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
    setPaginatedData([]);
  }, []);

  // Load initial / paginated data if async
  useEffect(() => {
    if (fetchFn) {
      loadData();
    } else {
      const offset = (currentPage - 1) * limit;
      setPaginatedData(data.slice(offset, offset + limit));
    }
  }, [currentPage, data, limit, fetchFn, loadData]);

  // Infinite scroll listener
  useEffect(() => {
    if (!infiniteScroll || !triggerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) nextPage();
      },
      { threshold: 1.0 }
    );

    observer.observe(triggerRef.current);

    return () => observer.disconnect();
  }, [infiniteScroll, hasMore, nextPage]);

  return {
    currentPage,
    totalPages,
    data: paginatedData,
    hasMore,
    isLoading,
    nextPage,
    prevPage,
    reset,
    triggerRef: infiniteScroll ? triggerRef : undefined,
  };
}

export default usePagination;
