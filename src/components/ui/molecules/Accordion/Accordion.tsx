// src/components/ui/molecules/Accordion/Accordion.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";
import "./Accordion.css";

export interface AccordionItem {
  id: string;
  title: string;
  content: string | React.ReactNode;
  category?: string;
  tags?: string[];
  icon?: string;
  badge?: string;
  disabled?: boolean;
  defaultOpen?: boolean;
}

export interface AccordionProps {
  items?: AccordionItem[];
  allowMultiple?: boolean;
  variant?: "default" | "bordered" | "minimal" | "cards";
  size?: "small" | "medium" | "large";
  animationDuration?: number;
  defaultOpenItems?: string[];
  enableSearch?: boolean;
  enableCategoryFilter?: boolean;
  searchPlaceholder?: string;
  className?: string;
  onItemToggle?: (itemId: string, isOpen: boolean) => void;
  onSearchChange?: (searchTerm: string) => void;
  renderCustomIcon?: (isOpen: boolean, item: AccordionItem) => React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({
  items = [],
  allowMultiple = false,
  variant = "default",
  size = "medium",
  animationDuration = 300,
  defaultOpenItems = [],
  enableSearch = false,
  enableCategoryFilter = false,
  searchPlaceholder = "Search...",
  className = "",
  onItemToggle,
  onSearchChange,
  renderCustomIcon,
}) => {
  // open set (pre-open defaultOpen + item.defaultOpen)
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    const seed = new Set(defaultOpenItems);
    items.forEach((it) => it?.defaultOpen && seed.add(it.id));
    return seed;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // derive categories safely
  const categories = Array.from(
    new Set(items.map((i) => i?.category).filter(Boolean) as string[])
  );

  // filter
  const filteredItems = items.filter((item) => {
    if (!item || item.disabled) return false;

    const q = searchTerm.trim().toLowerCase();
    const textMatch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      (typeof item.content === "string" &&
        item.content.toLowerCase().includes(q)) ||
      (item.tags ?? []).some((t) => t.toLowerCase().includes(q));

    const catMatch = !activeCategory || item.category === activeCategory;
    return textMatch && catMatch;
  });

  const toggleItem = (itemId: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(itemId);
      if (isOpen) {
        next.delete(itemId);
        onItemToggle?.(itemId, false);
      } else {
        if (!allowMultiple) next.clear();
        next.add(itemId);
        onItemToggle?.(itemId, true);
      }
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearchChange?.(value);
  };

  return (
    <div
      className={clsx(
        "accordion",
        `variant-${variant}`,
        `size-${size}`,
        className
      )}
      role="region"
      aria-label="Accordion"
    >
      {(enableSearch || (enableCategoryFilter && categories.length > 0)) && (
        <div className="accordion-controls">
          {enableSearch && (
            <div className="accordion-search">
              <input
                type="text"
                className="search-input"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                aria-label="Search FAQs"
              />
              <span className="search-icon" aria-hidden="true">
                🔍
              </span>
            </div>
          )}

          {enableCategoryFilter && categories.length > 0 && (
            <div className="accordion-categories" role="tablist" aria-label="Filter by category">
              <button
                type="button"
                className={clsx("category-btn", !activeCategory && "active")}
                onClick={() => setActiveCategory(null)}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  className={clsx(
                    "category-btn",
                    activeCategory === category && "active"
                  )}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="accordion-items">
        {filteredItems.length === 0 ? (
          <div className="accordion-empty-state" role="status" aria-live="polite">
            <span className="empty-icon" aria-hidden="true">
              ❓
            </span>
            <p className="empty-message">
              {searchTerm
                ? `No results found for “${searchTerm}”`
                : "No items available"}
            </p>
            {searchTerm && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => handleSearchChange("")}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredItems.map((item, index) => (
            <AccordionItemView
              key={item.id}
              item={item}
              isOpen={openItems.has(item.id)}
              onToggle={toggleItem}
              size={size}
              animationDuration={animationDuration}
              renderIcon={(isOpen) =>
                renderCustomIcon ? (
                  renderCustomIcon(isOpen, item)
                ) : (
                  <span
                    className={clsx("accordion-toggle-icon", isOpen && "open")}
                    aria-hidden="true"
                  >
                    <span className="icon-line horizontal" />
                    <span className="icon-line vertical" />
                  </span>
                )
              }
              animationDelay={index * 50}
            />
          ))
        )}
      </div>

      {(searchTerm || activeCategory) && filteredItems.length > 0 && (
        <div className="accordion-results-info">
          Showing {filteredItems.length} of {items.length} items
        </div>
      )}
    </div>
  );
};

type ItemViewProps = {
  item: AccordionItem;
  isOpen: boolean;
  onToggle: (id: string) => void;
  size: "small" | "medium" | "large";
  animationDuration: number;
  renderIcon: (isOpen: boolean) => React.ReactNode;
  animationDelay: number;
};

const AccordionItemView: React.FC<ItemViewProps> = ({
  item,
  isOpen,
  onToggle,
  animationDuration,
  renderIcon,
  animationDelay,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number>(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [item.content, isOpen]);

  if (!item) return null;

  const categoryClass =
    item.category &&
    `category-${item.category.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={clsx(
        "accordion-item",
        isOpen && "open",
        item.disabled && "disabled",
        categoryClass
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      <button
        type="button"
        className="accordion-header"
        onClick={() => !item.disabled && onToggle(item.id)}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
        disabled={item.disabled}
      >
        <div className="header-content">
          <div className="header-text">
            <span className="accordion-title">{item.title}</span>
            {item.category && (
              <span className="accordion-category">{item.category}</span>
            )}
          </div>
          <div className="header-actions">
            {item.badge && <span className="accordion-badge">{item.badge}</span>}
            <div className="accordion-icon">{renderIcon(isOpen)}</div>
          </div>
        </div>
      </button>

      <div
        id={`accordion-content-${item.id}`}
        className="accordion-content"
        style={{
          maxHeight: isOpen ? `${contentHeight}px` : "0px",
          transitionDuration: `${animationDuration}ms`,
        }}
        aria-hidden={!isOpen}
      >
        <div ref={contentRef} className="accordion-content-inner">
          {typeof item.content === "string" ? (
            <div dangerouslySetInnerHTML={{ __html: item.content }} />
          ) : (
            item.content
          )}

          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <div className="accordion-tags">
              {item.tags.map((t, i) => (
                <span key={`${item.id}-tag-${i}`} className="accordion-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Accordion;
