// src/components/services/ServicesOverview.tsx

"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./ServicesOverview.module.css";
import data from "@/app/services/page.data.json";

/** Types (kept lightweight and tolerant of partial data) */
type OverviewItem = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  href: string;
};
type Service = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  href: string;
  category?: string;
};
type OverviewGrid = {
  title?: string;
  description?: string;
  services?: OverviewItem[];
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export default function ServicesOverview() {
  const pathname = usePathname();

  // 🔒 Render this component ONLY on the directory page
  if (pathname !== "/services") return null;

  // --- Safe reads from data file (robust to missing keys) ---
  const services = asArray<Service>((data as any)?.services);
  const overview: OverviewGrid = (data as any)?.overviewGrid || {};
  const overviewItems =
    asArray<OverviewItem>(overview.services) ||
    // Fallback: derive overview cards from first 6 services
    services.slice(0, 6).map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      icon: s.icon,
      href: s.href,
    }));

  const title = overview.title ?? "Quick Service Overview";
  const description =
    overview.description ?? "Get started with the service that fits your needs";

  // Map category by service id (for badge)
  const categoryById = new Map<string, string>();
  services.forEach((s) => {
    if (s?.id) categoryById.set(s.id, s.category || "");
  });

  const getCategoryClass = (category?: string) => {
    if (!category) return styles.categoryBadge;
    if (category === "creative") return `${styles.categoryBadge} ${styles.categoryBadgeCreative}`;
    if (category === "technical") return `${styles.categoryBadge} ${styles.categoryBadgeTechnical}`;
    if (category === "marketing") return `${styles.categoryBadge} ${styles.categoryBadgeMarketing}`;
    return styles.categoryBadge;
  };

  return (
    <section aria-labelledby="services-overview-title" className={styles.servicesOverview}>
      <header className={styles.overviewHeader}>
        <h2 id="services-overview-title" className={styles.overviewTitle}>
          {title}
        </h2>
        <p className={styles.overviewSubtitle}>{description}</p>
      </header>

      <div className={styles.overviewGrid}>
        {overviewItems.map((item) => {
          const cat = categoryById.get(item.id);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={styles.overviewCard}
              aria-label={`${item.title} – Learn more`}
            >
              {/* Category badge (derived from main services list) */}
              <span className={getCategoryClass(cat)}>{cat || "Service"}</span>

              <div className={styles.overviewCardHeader}>
                <div className={styles.overviewCardIcon} aria-hidden="true">
                  {/* Ionicons (safe if icon provided) */}
                  {item.icon ? <ion-icon name={item.icon}></ion-icon> : <ion-icon name="grid"></ion-icon>}
                </div>
                <h3 className={styles.overviewCardTitle}>{item.title}</h3>
              </div>

              {item.description && (
                <p className={styles.overviewCardDesc}>{item.description}</p>
              )}

              <div className={styles.overviewCardFooter}>
                <span>Learn More</span>
                <ion-icon name="arrow-forward" aria-hidden="true"></ion-icon>
              </div>

              {/* Optional quick actions (hidden until hover; purely decorative) */}
              <div className={styles.quickActions} aria-hidden="true">
                <span className={styles.quickAction} title="View">
                  <ion-icon name="open-outline"></ion-icon>
                </span>
                <span className={styles.quickAction} title="Contact">
                  <ion-icon name="chatbubbles-outline"></ion-icon>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
