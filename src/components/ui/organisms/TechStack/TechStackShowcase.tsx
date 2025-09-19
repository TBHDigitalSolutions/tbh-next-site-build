"use client";

import React, { useMemo, useState, useId, useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";
import styles from "./TechStackShowcase.module.css";
import type { TechStackShowcaseProps, TechCategory, Tech } from "./TechStack.types";

const categories: TechCategory[] = ["Frontend", "Backend", "Database", "Cloud", "DevOps", "Tools"];

export default function TechStackShowcase({
  title = "Technology Stack",
  subtitle,
  technologies,
  showCategories = true,
  showExperience = true,
  showProjectCounts = true,
  enableFiltering = true,
  enableSearch = true,
  className,
}: TechStackShowcaseProps) {
  const [active, setActive] = useState<TechCategory | "all">("all");
  const [q, setQ] = useState("");
  const headingId = useId();
  const tabsId = useId();
  const searchId = useId();

  const categoryCounts = useMemo(() => {
    const counts: Record<TechCategory, number> = {
      Frontend: 0,
      Backend: 0,
      Database: 0,
      Cloud: 0,
      DevOps: 0,
      Tools: 0,
    };
    for (const t of technologies) counts[t.category] += 1;
    return counts;
  }, [technologies]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const matchQ = (t: Tech) => !query || t.name.toLowerCase().includes(query);
    const matchCat = (t: Tech) => (active === "all" ? true : t.category === active);

    return technologies
      .filter((t) => matchCat(t) && matchQ(t))
      .sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [technologies, active, q]);

  const onTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (!enableFiltering) return;

      const order: Array<TechCategory | "all"> = ["all", ...categories];
      const idx = order.indexOf(active);
      if (idx < 0) return;

      let next = idx;
      if (e.key === "ArrowRight") next = (idx + 1) % order.length;
      if (e.key === "ArrowLeft") next = (idx - 1 + order.length) % order.length;

      if (next !== idx) {
        e.preventDefault();
        setActive(order[next]);
      }
    },
    [active, enableFiltering]
  );

  return (
    <section className={clsx(styles.wrapper, className)} aria-labelledby={`${headingId}-title`}>
      <header className={styles.header}>
        <div>
          <h2 id={`${headingId}-title`} className={styles.title}>
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
                aria-label="Tech categories"
                onKeyDown={onTabKeyDown}
              >
                <button
                  id={`${tabsId}-tab-all`}
                  className={clsx(styles.tab, active === "all" && styles.active)}
                  role="tab"
                  aria-selected={active === "all"}
                  aria-controls={`${tabsId}-panel-all`}
                  onClick={() => setActive("all")}
                >
                  All <span className={styles.countBadge}>{technologies.length}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    id={`${tabsId}-tab-${c}`}
                    className={clsx(styles.tab, active === c && styles.active)}
                    role="tab"
                    aria-selected={active === c}
                    aria-controls={`${tabsId}-panel-${c}`}
                    onClick={() => setActive(c)}
                  >
                    {c} <span className={styles.countBadge}>{categoryCounts[c]}</span>
                  </button>
                ))}
              </div>
            )}

            {enableSearch && (
              <>
                <label htmlFor={searchId} className="sr-only">
                  Search technology
                </label>
                <input
                  id={searchId}
                  className={styles.search}
                  type="search"
                  placeholder="Search tech…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </>
            )}
          </div>
        )}
      </header>

      <div
        id={
          active === "all" ? `${tabsId}-panel-all` : `${tabsId}-panel-${active as TechCategory}`
        }
        role="tabpanel"
        aria-labelledby={
          active === "all" ? `${tabsId}-tab-all` : `${tabsId}-tab-${active as TechCategory}`
        }
      >
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>No technologies match your filters.</p>
            {(enableFiltering || enableSearch) && (
              <button
                className={styles.resetBtn}
                onClick={() => {
                  setActive("all");
                  setQ("");
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid} role="list">
            {filtered.map((t) => (
              <article
                key={t.id}
                className={clsx(styles.card, t.featured && styles.featured)}
                role="listitem"
              >
                {t.logo && (
                  <Image
                    src={t.logo}
                    alt={t.name}
                    width={40}
                    height={40}
                    className={styles.logo}
                  />
                )}
                <h3 className={styles.cardTitle}>{t.name}</h3>

                <div className={styles.meta}>
                  <span className={styles.badge}>{t.category}</span>
                  {showExperience && t.experience && (
                    <span className={styles.badge}>{t.experience}</span>
                  )}
                  {showProjectCounts && typeof t.projects === "number" && (
                    <span className={styles.badge}>{t.projects} projects</span>
                  )}
                  {t.expertise && <span className={styles.badge}>{t.expertise}</span>}
                </div>

                {t.link && (
                  <a href={t.link} className={styles.link} aria-label={`Open ${t.name} docs`}>
                    Docs
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
