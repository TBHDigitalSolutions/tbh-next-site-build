// src/components/ui/organisms/VideoCapabilitiesGrid/VideoCapabilitiesGrid.tsx

"use client";

import React, { useMemo, useState, useCallback, useId } from "react";
import clsx from "clsx";
import styles from "./VideoCapabilitiesGrid.module.css";
import type {
  VideoCapabilitiesGridProps,
  CapabilityCategory,
  Capability,
} from "./VideoCapabilitiesGrid.types";

// Optional: small built-in icon map for common video terms.
// If the provided `icon` string matches a key here, we render that Lucide icon.
// Otherwise we fall back to showing the raw string (emoji/text).
import {
  Clapperboard,
  Camera,
  Scissors,
  Megaphone,
  MonitorPlay,
  Cable,
  Film,
  HardDrive,
  Share2,
  Wrench,
} from "lucide-react";

const LUCIDE_ICON_MAP: Record<string, React.ReactNode> = {
  clapperboard: <Clapperboard aria-hidden focusable={false} />,
  camera: <Camera aria-hidden focusable={false} />,
  editing: <Scissors aria-hidden focusable={false} />,
  scissors: <Scissors aria-hidden focusable={false} />,
  distribution: <Megaphone aria-hidden focusable={false} />,
  playback: <MonitorPlay aria-hidden focusable={false} />,
  ingest: <Cable aria-hidden focusable={false} />,
  film: <Film aria-hidden focusable={false} />,
  storage: <HardDrive aria-hidden focusable={false} />,
  share: <Share2 aria-hidden focusable={false} />,
  tools: <Wrench aria-hidden focusable={false} />,
};

const CATEGORY_META: Array<{ id: CapabilityCategory; label: string }> = [
  { id: "pre", label: "Pre‑Production" },
  { id: "production", label: "Production" },
  { id: "post", label: "Post‑Production" },
  { id: "distribution", label: "Distribution" },
];

function renderIcon(icon?: string) {
  if (!icon) return null;
  const key = icon.trim().toLowerCase();
  if (LUCIDE_ICON_MAP[key]) return <span className={styles.iconWrap}>{LUCIDE_ICON_MAP[key]}</span>;

  // Fallback: render as text/emoji
  return (
    <span className={clsx(styles.iconWrap, styles.iconFallback)} aria-hidden>
      {icon}
    </span>
  );
}

export default function VideoCapabilitiesGrid({
  title = "Video Capabilities",
  subtitle,
  capabilities,
  enableFiltering = true,
  enableSearch = true,
  defaultCategory = "production",
  className,
}: VideoCapabilitiesGridProps) {
  const [activeCategory, setActiveCategory] = useState<CapabilityCategory | "all">(defaultCategory);
  const [query, setQuery] = useState("");
  const tabsId = useId();
  const searchId = useId();

  // Precompute category counts for tab badges
  const categoryCounts = useMemo(() => {
    const counts: Record<CapabilityCategory, number> = {
      pre: 0,
      production: 0,
      post: 0,
      distribution: 0,
    };
    for (const c of capabilities) {
      counts[c.category] += 1;
    }
    return counts;
  }, [capabilities]);

  // Filter + sort (featured first, then title)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchQ = (c: Capability) =>
      !q ||
      c.title.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)) ||
      (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)));

    const matchCat = (c: Capability) => (activeCategory === "all" ? true : c.category === activeCategory);

    return capabilities
      .filter((c) => matchCat(c) && matchQ(c))
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.title.localeCompare(b.title);
      });
  }, [capabilities, activeCategory, query]);

  // Keyboard nav for the tablist
  const onTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!enableFiltering) return;

      const order: Array<CapabilityCategory | "all"> = ["all", ...CATEGORY_META.map((c) => c.id)];
      const currentIndex = order.indexOf(activeCategory);
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (e.key === "ArrowRight") nextIndex = (currentIndex + 1) % order.length;
      if (e.key === "ArrowLeft") nextIndex = (currentIndex - 1 + order.length) % order.length;

      if (nextIndex !== currentIndex) {
        e.preventDefault();
        setActiveCategory(order[nextIndex]);
      }
    },
    [activeCategory, enableFiltering]
  );

  return (
    <section className={clsx(styles.wrapper, className)} aria-labelledby={`${tabsId}-title`}>
      <div className={styles.header}>
        <div>
          <h2 id={`${tabsId}-title`} className={styles.title}>
            {title}
          </h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>

        {(enableFiltering || enableSearch) && (
          <div className={styles.controls}>
            {enableFiltering && (
              <div
                className={styles.tabs}
                role="tablist"
                aria-label="Capability Categories"
                onKeyDown={onTabKeyDown}
              >
                <button
                  id={`${tabsId}-tab-all`}
                  className={clsx(styles.tab, activeCategory === "all" && styles.active)}
                  role="tab"
                  aria-selected={activeCategory === "all"}
                  aria-controls={`${tabsId}-panel-all`}
                  onClick={() => setActiveCategory("all")}
                >
                  All <span className={styles.countBadge}>{capabilities.length}</span>
                </button>

                {CATEGORY_META.map((c) => (
                  <button
                    key={c.id}
                    id={`${tabsId}-tab-${c.id}`}
                    className={clsx(styles.tab, activeCategory === c.id && styles.active)}
                    role="tab"
                    aria-selected={activeCategory === c.id}
                    aria-controls={`${tabsId}-panel-${c.id}`}
                    onClick={() => setActiveCategory(c.id)}
                    title={c.label}
                  >
                    {c.label} <span className={styles.countBadge}>{categoryCounts[c.id]}</span>
                  </button>
                ))}
              </div>
            )}

            {enableSearch && (
              <label htmlFor={searchId} className="sr-only">
                Search capabilities
              </label>
            )}
            {enableSearch && (
              <input
                id={searchId}
                className={styles.search}
                type="search"
                placeholder="Search capabilities…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search capabilities"
              />
            )}
          </div>
        )}
      </div>

      {/* Tab panels (single combined panel for simplicity/SEO; ARIA still valid) */}
      <div
        id={
          activeCategory === "all"
            ? `${tabsId}-panel-all`
            : `${tabsId}-panel-${activeCategory as CapabilityCategory}`
        }
        role="tabpanel"
        aria-labelledby={
          activeCategory === "all"
            ? `${tabsId}-tab-all`
            : `${tabsId}-tab-${activeCategory as CapabilityCategory}`
        }
      >
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>No capabilities match your filters.</p>
            {(enableFiltering || enableSearch) && (
              <button
                className={styles.resetBtn}
                onClick={() => {
                  setActiveCategory("all");
                  setQuery("");
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid} role="list">
            {filtered.map((cap) => (
              <article
                key={cap.id}
                className={clsx(styles.card, cap.featured && styles.featured)}
                role="listitem"
                aria-label={`${cap.title}${cap.featured ? " (featured)" : ""}`}
              >
                {renderIcon(cap.icon)}
                <h3 className={styles.cardTitle}>{cap.title}</h3>
                {cap.description && <p className={styles.cardDesc}>{cap.description}</p>}
                <div className={styles.meta}>
                  <span className={clsx(styles.badge, styles.badgeCategory)}>{cap.category}</span>
                  {cap.level && <span className={clsx(styles.badge, styles.badgeLevel)}>{cap.level}</span>}
                </div>
                {cap.tags && cap.tags.length > 0 && (
                  <ul className={styles.tags} aria-label="Tags">
                    {cap.tags.map((t) => (
                      <li key={t} className={styles.tag}>
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
