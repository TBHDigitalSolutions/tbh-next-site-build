"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./ModernServicesSelector.module.css"; // reuse tokens / layout
import pageData from "@/app/services/page.data.json";

type Service = {
  id: string;
  title: string;
  description?: string;
  href: string;
  category?: string;
};

export default function SearchBanner() {
  const [q, setQ] = useState("");

  const services = useMemo<Service[]>(
    () => (Array.isArray((pageData as any).services) ? (pageData as any).services : []),
    []
  );

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return services
      .filter((s) =>
        [s.title, s.description, s.category]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term))
      )
      .slice(0, 8);
  }, [q, services]);

  return (
    <section className={styles.searchBanner} aria-labelledby="services-search-title">
      <div className={styles.searchHeader}>
        <h2 id="services-search-title" className={styles.searchTitle}>
          Find a Service
        </h2>
        <p className={styles.searchSubtitle}>Search hubs & categories instantly</p>
      </div>

      <div className={styles.searchBar}>
        <input
          aria-label="Search services"
          placeholder='Try “video”, “seo”, “automation”, “web”…'
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {q && (
        <div className={styles.searchResults} role="listbox" aria-label="Search results">
          {results.length === 0 ? (
            <div className={styles.searchNoResults}>No matches found</div>
          ) : (
            results.map((s) => (
              <Link key={s.id} href={s.href} className={styles.searchResultItem} role="option">
                <div className={styles.searchResultTitle}>{s.title}</div>
                {s.description && (
                  <div className={styles.searchResultDesc}>{s.description}</div>
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </section>
  );
}