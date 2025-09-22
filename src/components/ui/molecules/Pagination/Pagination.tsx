// shared-ui/components/content/Pagination.tsx

"use client";

import React, { useMemo } from "react";
import clsx from "clsx";
import "./Pagination.css";

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback invoked with the new page number */
  onPageChange: (page: number) => void;
  /** How many sibling pages to show on each side (0–2) */
  pageNeighbours?: number;
  /** Show “First” & “Last” buttons */
  showFirstLast?: boolean;
}

const LEFT_ELLIPSIS = "LEFT_ELLIPSIS";
const RIGHT_ELLIPSIS = "RIGHT_ELLIPSIS";

const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageNeighbours = 1,
  showFirstLast = false,
}) => {
  // Clamp neighbours between 0 and 2
  const neighbours = Math.max(0, Math.min(pageNeighbours, 2));

  const pages = useMemo<(number | typeof LEFT_ELLIPSIS | typeof RIGHT_ELLIPSIS)[]>(() => {
    const totalNumbers = neighbours * 2 + 3; // current + neighbours + first & last
    const totalBlocks = totalNumbers + 2; // + 2 for ellipses

    if (totalPages <= totalBlocks) {
      return range(1, totalPages);
    }

    const startPage = Math.max(2, currentPage - neighbours);
    const endPage = Math.min(totalPages - 1, currentPage + neighbours);

    const hasLeftEllipsis = startPage > 2;
    const hasRightEllipsis = endPage < totalPages - 1;

    const middlePages = range(startPage, endPage);

    const pages: (number | typeof LEFT_ELLIPSIS | typeof RIGHT_ELLIPSIS)[] = [];

    if (hasLeftEllipsis) {
      pages.push(LEFT_ELLIPSIS);
    }
    pages.push(...middlePages);
    if (hasRightEllipsis) {
      pages.push(RIGHT_ELLIPSIS);
    }

    return [1, ...pages, totalPages];
  }, [currentPage, totalPages, neighbours]);

  const handleClick = (page: number | string) => {
    if (typeof page === "number" && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav
      className="pagination-container"
      role="navigation"
      aria-label="Pagination"
    >
      <ul className="pagination-list">
        {showFirstLast && (
          <li>
            <button
              type="button"
              className="pagination-button"
              onClick={() => handleClick(1)}
              disabled={currentPage === 1}
              aria-label="Go to first page"
            >
              « First
            </button>
          </li>
        )}

        <li>
          <button
            type="button"
            className="pagination-button"
            onClick={() => handleClick(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            ‹ Prev
          </button>
        </li>

        {pages.map((item, idx) =>
          item === LEFT_ELLIPSIS || item === RIGHT_ELLIPSIS ? (
            <li key={idx}>
              <span className="pagination-ellipsis" aria-hidden="true">
                …
              </span>
            </li>
          ) : (
            <li key={idx}>
              <button
                type="button"
                className={clsx("pagination-button", {
                  active: item === currentPage,
                })}
                onClick={() => handleClick(item)}
                aria-current={item === currentPage ? "page" : undefined}
                aria-label={
                  item === currentPage
                    ? `Page ${item}, current page`
                    : `Go to page ${item}`
                }
              >
                {item}
              </button>
            </li>
          )
        )}

        <li>
          <button
            type="button"
            className="pagination-button"
            onClick={() => handleClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            Next ›
          </button>
        </li>

        {showFirstLast && (
          <li>
            <button
              type="button"
              className="pagination-button"
              onClick={() => handleClick(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Go to last page"
            >
              Last »
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
