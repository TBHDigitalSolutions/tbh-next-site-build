// src/booking/sections/BookingFAQSection/BookingFAQSection.tsx
// Production-ready, accessible FAQ section with JSON-LD, deep-linking, and analytics hooks.

"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

type FAQItem = {
  /** Stable id for deep-linking (#faq-<id>); auto-generated from question if omitted */
  id?: string;
  /** The FAQ question (plain text for best SEO/JSON-LD) */
  question: string;
  /** The answer; can be rich content */
  answer: React.ReactNode;
  /** Optional category label for client-side filtering/grouping */
  category?: string;
  /** Optional tags for search/filter */
  tags?: string[];
};

export interface BookingFAQSectionProps {
  /** Array of FAQ entries to render */
  items: FAQItem[];
  /** Optional section heading */
  heading?: string;
  /** Whether to show a client-side search input */
  searchable?: boolean;
  /** Initial open items by id; if undefined, all collapsed; if set to ['*'], all expanded */
  defaultOpenIds?: string[];
  /** If false, opening one item closes the others (accordion behavior). Default: true (multiple allowed) */
  allowMultipleOpen?: boolean;
  /** Called on user interactions for lightweight analytics */
  onTrack?: (event: string, payload?: Record<string, unknown>) => void;
  /** Called whenever an item's expanded state changes */
  onToggle?: (id: string, expanded: boolean) => void;
  /** Optional class for outer container */
  className?: string;
  /** Optional inline style for outer container */
  style?: React.CSSProperties;
  /** Optional aria-label if you don’t provide a visible heading */
  ariaLabel?: string;
  /** Optional data attribute to help uniquely identify this instance in analytics */
  analyticsContext?: string;
}

/** Utility to make a URL-safe slug */
function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 120);
}

/** Build per-item DOM ids (for aria-controls / aria-labelledby) */
function makeDomIds(base: string, id: string) {
  return {
    headerId: `${base}-header-${id}`,
    panelId: `${base}-panel-${id}`,
    anchorId: `faq-${id}`,
  };
}

/** Create FAQPage JSON-LD for SEO. */
function buildJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: it.answer,
      },
    })),
  };
}

/** Extract plain text from ReactNode for JSON-LD (best-effort). */
function nodeToPlainText(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToPlainText).join(" ");
  if (React.isValidElement(node)) {
    return nodeToPlainText((node.props as any)?.children);
  }
  return "";
}

/**
 * BookingFAQSection
 * - Accessible accordion (WCAG-friendly)
 * - Deep-linking (#faq-<id>) with auto-expand
 * - Copy link per item
 * - Searchable list (optional)
 * - JSON-LD FAQPage for SEO
 * - Design-token friendly (relies on CSS variables already used across Booking domain)
 */
export default function BookingFAQSection({
  items,
  heading = "Frequently Asked Questions",
  searchable = true,
  defaultOpenIds,
  allowMultipleOpen = true,
  onTrack,
  onToggle,
  className,
  style,
  ariaLabel,
  analyticsContext = "booking-faq",
}: BookingFAQSectionProps) {
  const instanceId = useId().replace(/:/g, "_");
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize/augment items with derived ids
  const normalized = useMemo(() => {
    return items.map((it) => {
      const baseId = it.id ?? slugify(it.question);
      return { ...it, id: baseId || `q_${Math.random().toString(36).slice(2, 8)}` };
    });
  }, [items]);

  // Open-state management
  const initialOpenSet = useMemo<Set<string>>(() => {
    if (!defaultOpenIds || defaultOpenIds.length === 0) return new Set();
    if (defaultOpenIds.includes("*")) return new Set(normalized.map((n) => n.id!));
    return new Set(defaultOpenIds);
  }, [defaultOpenIds, normalized]);

  const [openIds, setOpenIds] = useState<Set<string>>(initialOpenSet);
  const [query, setQuery] = useState("");

  // Deep-link support (#faq-xyz opens that item)
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (!hash || hash.length < 2) return;
    const anchor = hash.slice(1);
    if (anchor.startsWith("faq-")) {
      const targetId = anchor.replace(/^faq-/, "");
      if (normalized.some((n) => n.id === targetId)) {
        setOpenIds((prev) => new Set(prev).add(targetId));
        onTrack?.("faq_deeplink_open", { id: targetId, context: analyticsContext });
        // Move focus to header button for accessibility
        const btn = containerRef.current?.querySelector<HTMLButtonElement>(
          `#${makeDomIds(instanceId, targetId).headerId} button`
        );
        btn?.focus();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, normalized.length]);

  // Computed, filtered list
  const visibleItems = useMemo(() => {
    if (!query.trim()) return normalized;
    const q = query.toLowerCase();
    return normalized.filter((it) => {
      const hay =
        `${it.question} ${nodeToPlainText(it.answer)} ${(it.category || "")} ${(it.tags || []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [normalized, query]);

  // JSON-LD (only from visible items to match the rendered content)
  const jsonLd = useMemo(() => {
    const ld = buildJsonLd(
      visibleItems.map((it) => ({
        question: it.question,
        answer: nodeToPlainText(it.answer),
      }))
    );
    return JSON.stringify(ld);
  }, [visibleItems]);

  const toggle = useCallback(
    (id: string) => {
      setOpenIds((prev) => {
        const next = new Set(prev);
        const expanded = !next.has(id);

        if (expanded) {
          if (!allowMultipleOpen) next.clear();
          next.add(id);
        } else {
          next.delete(id);
        }

        onToggle?.(id, expanded);
        onTrack?.(expanded ? "faq_open" : "faq_close", { id, context: analyticsContext });
        // Update URL hash for deep-linkability when opening
        if (expanded && typeof window !== "undefined") {
          const { anchorId } = makeDomIds(instanceId, id);
          const url = new URL(window.location.href);
          url.hash = anchorId;
          window.history.replaceState({}, "", url.toString());
        }
        return next;
      });
    },
    [allowMultipleOpen, analyticsContext, instanceId, onToggle, onTrack]
  );

  const expandAll = useCallback(() => {
    setOpenIds(new Set(visibleItems.map((i) => i.id!)));
    onTrack?.("faq_expand_all", { context: analyticsContext });
  }, [visibleItems, analyticsContext, onTrack]);

  const collapseAll = useCallback(() => {
    setOpenIds(new Set());
    onTrack?.("faq_collapse_all", { context: analyticsContext });
  }, [analyticsContext, onTrack]);

  const copyLink = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const { anchorId } = makeDomIds(instanceId, id);
    const url = new URL(window.location.href);
    url.hash = anchorId;
    navigator.clipboard
      .writeText(url.toString())
      .then(() => onTrack?.("faq_copy_link", { id, context: analyticsContext }))
      .catch(() => onTrack?.("faq_copy_link_error", { id, context: analyticsContext }));
  }, [analyticsContext, instanceId, onTrack]);

  // Track initial render
  useEffect(() => {
    onTrack?.("faq_view", {
      count: items.length,
      context: analyticsContext,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={containerRef}
      className={className}
      style={style}
      aria-label={ariaLabel}
      // Design token-friendly defaults; override in CSS with vars used across booking components
      // (e.g., --bg-surface, --text-primary, etc.)
    >
      {/* JSON-LD for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          justifyContent: "space-between",
          padding: "16px 0",
          borderBottom: "1px solid var(--border-subtle, #e5e5e5)",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "var(--font-size-xl, 1.25rem)",
            fontWeight: 700,
            color: "var(--text-primary, #121417)",
            fontFamily: "var(--font-heading, inherit)",
          }}
        >
          {heading}
        </h2>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={expandAll}
            style={buttonGhostStyle}
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={collapseAll}
            style={buttonGhostStyle}
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Search */}
      {searchable && (
        <div style={{ margin: "12px 0 20px" }}>
          <label
            htmlFor={`faq-search-${instanceId}`}
            style={{
              display: "block",
              fontSize: "var(--font-size-sm, 0.875rem)",
              color: "var(--text-secondary, #6b7280)",
              marginBottom: 6,
            }}
          >
            Search FAQs
          </label>
          <input
            id={`faq-search-${instanceId}`}
            type="search"
            placeholder="Type a keyword…"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              onTrack?.("faq_search", { query: v, context: analyticsContext });
            }}
            style={inputStyle}
          />
        </div>
      )}

      {/* List */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {visibleItems.map((it) => {
          const dom = makeDomIds(instanceId, it.id!);
          const expanded = openIds.has(it.id!);
          return (
            <li
              key={it.id}
              id={dom.anchorId}
              style={{
                border: "1px solid var(--border-subtle, #e5e5e5)",
                borderRadius: "var(--radius-md, 8px)",
                background: "var(--bg-surface, #ffffff)",
                overflow: "hidden",
              }}
            >
              <div
                id={dom.headerId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "14px 16px",
                  background: "var(--bg-elevated, #f8f9fa)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "var(--font-size-md, 1rem)",
                    fontWeight: 600,
                    color: "var(--text-primary, #121417)",
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={dom.panelId}
                    onClick={() => toggle(it.id!)}
                    style={questionButtonStyle}
                  >
                    <span style={{ flex: 1, textAlign: "left" }}>{it.question}</span>
                    <span
                      aria-hidden="true"
                      style={{
                        display: "inline-flex",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 150ms ease",
                      }}
                    >
                      ▾
                    </span>
                  </button>
                </h3>

                <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
                  <button
                    type="button"
                    onClick={() => copyLink(it.id!)}
                    title="Copy link to this FAQ"
                    style={iconButtonStyle}
                  >
                    🔗
                    <span className="sr-only">Copy link</span>
                  </button>
                </div>
              </div>

              <div
                id={dom.panelId}
                role="region"
                aria-labelledby={dom.headerId}
                hidden={!expanded}
                style={{
                  padding: expanded ? "16px" : 0,
                  borderTop: "1px solid var(--border-subtle, #e5e5e5)",
                  color: "var(--text-primary, #121417)",
                }}
              >
                {it.answer}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Empty state */}
      {visibleItems.length === 0 && (
        <div
          role="status"
          style={{
            marginTop: 12,
            padding: 16,
            border: "1px dashed var(--border-strong, #d1d5db)",
            borderRadius: "var(--radius-md, 8px)",
            color: "var(--text-secondary, #6b7280)",
          }}
        >
          No results. Try a different keyword.
        </div>
      )}
    </section>
  );
}

/* ---------- inline token-aware styles (kept minimal; override via CSS if desired) ---------- */
const buttonGhostStyle: React.CSSProperties = {
  border: "1px solid var(--border-subtle, #e5e5e5)",
  background: "var(--bg-surface, #ffffff)",
  color: "var(--text-secondary, #6b7280)",
  padding: "8px 12px",
  borderRadius: "var(--radius-md, 8px)",
  fontSize: "var(--font-size-sm, 0.875rem)",
  fontWeight: 500,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "var(--radius-md, 6px)",
  border: "1px solid var(--border-subtle, #e5e5e5)",
  background: "var(--bg-surface, #ffffff)",
  color: "var(--text-primary, #121417)",
  fontSize: "var(--font-size-sm, 0.875rem)",
};

const questionButtonStyle: React.CSSProperties = {
  all: "unset",
  display: "flex",
  alignItems: "center",
  gap: 12,
  cursor: "pointer",
  width: "100%",
  paddingRight: 4,
} as React.CSSProperties;

const iconButtonStyle: React.CSSProperties = {
  border: "1px solid var(--border-subtle, #e5e5e5)",
  background: "var(--bg-surface, #ffffff)",
  color: "var(--text-secondary, #6b7280)",
  padding: "6px 8px",
  borderRadius: "var(--radius-sm, 6px)",
  fontSize: "var(--font-size-sm, 0.875rem)",
  cursor: "pointer",
};

/* -------------------------------------------------------------------------------------------
Design note:
This component intentionally follows the Booking domain’s shared token system (CSS vars like
--bg-surface, --text-primary, --border-subtle, radius/font sizes, etc.) used by existing
components such as AvailabilityCalendar and BookingConfirmation. Drop-in theming will align
visuals automatically with your current stylesheets. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

Interaction and accessibility patterns mirror those used in other booking components,
including keyboard-friendly buttons, visible headings, and assistive text. :contentReference[oaicite:2]{index=2} :contentReference[oaicite:3]{index=3}

For usage guidance consistent with component docs, see the BookingConfirmation README patterns,
which this section also follows for responsiveness and analytics hooks. :contentReference[oaicite:4]{index=4}
-------------------------------------------------------------------------------------------- */
