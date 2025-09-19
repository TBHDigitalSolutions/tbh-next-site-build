// src/components/ui/organisms/PlaybookShowcase/PlaybookShowcase.tsx

"use client";

import React, { useMemo, useState } from "react";
import styles from "./PlaybookShowcase.module.css";
import PlaybookCardComponent from "@/components/ui/molecules/Card/variants/PlaybookCard";
import Button from "@/components/ui/atoms/Button/Button";
import type { PlaybookShowcaseProps, PlaybookItem, PlaybookDifficulty } from "./PlaybookShowcase.types";

const safeString = (s?: string) => (s ?? "").trim();

export default function PlaybookShowcase({
  title = "Proven Playbooks",
  subtitle,
  playbooks,
  categories,
  difficulties,
  defaultCategory = "All",
  defaultDifficulty,
  cardVariant = "detailed",
  columns = 3,
  className,
  maxItems,
  showFeatured = true,
  cta,
  onDownload,
  onPreview,
  onClick,
}: PlaybookShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>(defaultCategory);
  const [activeDifficulty, setActiveDifficulty] = useState<PlaybookDifficulty | undefined>(defaultDifficulty);
  const [query, setQuery] = useState("");

  // ---- Derive unique categories (preserve order) ----
  const derivedCategories = useMemo(() => {
    const base = Array.isArray(categories) && categories.length
      ? categories
      : playbooks.map((p) => p.category).filter(Boolean);

    const seen = new Set<string>();
    return base.filter((c) => {
      const v = safeString(c);
      if (!v || seen.has(v)) return false;
      seen.add(v);
      return true;
    });
  }, [categories, playbooks]);

  // ---- Derive unique difficulties (preserve order) ----
  const derivedDifficulties = useMemo(() => {
    const base = Array.isArray(difficulties) && difficulties.length
      ? difficulties
      : playbooks
          .map((p) => p.difficulty || "Intermediate")
          .filter(Boolean);

    const seen = new Set<string>();
    return base.filter((d) => {
      const v = safeString(d as string);
      if (!v || seen.has(v)) return false;
      seen.add(v);
      return true;
    }) as PlaybookDifficulty[];
  }, [difficulties, playbooks]);

  // ---- Filtering + search ----
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let results = playbooks.filter((p) => {
      const matchCategory = activeCategory === "All" || safeString(p.category) === activeCategory;
      const matchDifficulty = !activeDifficulty || p.difficulty === activeDifficulty;
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.tags ?? []).some((t) => t.toLowerCase().includes(q));

      return matchCategory && matchDifficulty && matchSearch;
    });

    // Apply maxItems limit if specified
    if (maxItems && maxItems > 0) {
      results = results.slice(0, maxItems);
    }

    return results;
  }, [playbooks, activeCategory, activeDifficulty, query, maxItems]);

  // Sort with featured items first if showFeatured is true
  const sorted = useMemo(() => {
    return filtered.slice().sort((a, b) => {
      if (showFeatured) {
        // Featured items first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
      }
      // Then alphabetical by title
      return safeString(a.title).localeCompare(safeString(b.title));
    });
  }, [filtered, showFeatured]);

  return (
    <section className={`${styles.wrapper} ${className ?? ""}`}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>

        {/* Toolbar with search and filters */}
        <div className={styles.toolbar}>
          {/* Search box */}
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search playbooks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search playbooks"
            />
          </div>

          {/* Filters */}
          <div className={styles.filters} role="group" aria-label="Playbook filters">
            {/* Categories */}
            <div className={styles.pillsWrap} aria-label="Categories">
              <Button
                key="cat-all"
                variant={activeCategory === "All" ? "primary" : "outline"}
                size="sm"
                className={`${styles.pill} ${activeCategory === "All" ? styles.pillActive : ""}`}
                onClick={() => setActiveCategory("All")}
                aria-pressed={activeCategory === "All"}
              >
                All
              </Button>

              {derivedCategories.map((cat, idx) => (
                <Button
                  key={`cat-${cat}-${idx}`}
                  variant={activeCategory === cat ? "primary" : "outline"}
                  size="sm"
                  className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ""}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* Difficulty */}
            {derivedDifficulties.length > 0 && (
              <div className={styles.pillsWrap} aria-label="Difficulty">
                {derivedDifficulties.map((lvl, idx) => (
                  <Button
                    key={`lvl-${lvl}-${idx}`}
                    variant={activeDifficulty === lvl ? "primary" : "outline"}
                    size="sm"
                    className={`${styles.pill} ${activeDifficulty === lvl ? styles.pillActive : ""}`}
                    onClick={() => setActiveDifficulty(activeDifficulty === lvl ? undefined : lvl)}
                    aria-pressed={activeDifficulty === lvl}
                  >
                    {lvl}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Results */}
      {sorted.length === 0 ? (
        <div className={styles.zeroState} role="status" aria-live="polite">
          No playbooks found. Try clearing filters or searching differently.
        </div>
      ) : (
        <div
          className={`${styles.grid} ${
            columns === 4 ? styles["cols-4"] : columns === 2 ? styles["cols-2"] : styles["cols-3"]
          }`}
          role="list"
          aria-label="Playbook results"
        >
          {sorted.map((pb) => (
            <PlaybookCardComponent
              key={pb.id}
              playbook={pb}
              variant={cardVariant}
              onDownload={onDownload}
              onPreview={onPreview}
              onClick={onClick}
              showSteps
              showMetrics
            />
          ))}
        </div>
      )}

      {/* CTA Section */}
      {cta && (
        <div className={styles.actions}>
          <Button
            href={cta.href}
            variant="primary"
            className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}
          >
            {cta.label}
          </Button>
        </div>
      )}
    </section>
  );
}