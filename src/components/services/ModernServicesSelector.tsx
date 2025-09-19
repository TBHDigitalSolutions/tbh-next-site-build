// src/components/services/ModernServicesSelector.tsx
// Safe against missing overviewGrid / categories / hero / cta

"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import styles from "./ModernServicesSelector.module.css";
import pageData from "@/app/services/page.data.json";

type Popularity = "high" | "medium" | "low";
type CategoryId = "all" | "creative" | "technical" | "marketing";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  features: string[];
  deliveryTime: string;
  startingPrice: string;
  category?: CategoryId | string;
  popularity?: Popularity;
}
interface OverviewService {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}
interface Category {
  id: CategoryId | string;
  label: string;
  icon: string;
}

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}
function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export default function ModernServicesSelector() {
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<CategoryId | string>("all");
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  // Only render on /services directory page
  if (pathname !== "/services") return null;

  // ---- Safe data extraction & fallbacks ----
  const services = asArray<ServiceItem>((pageData as any).services).map((s) => ({
    popularity: "medium",
    category: "marketing",
    ...s, // allow data to override defaults
  }));

  const categoriesFromData = asArray<Category>((pageData as any).categories);
  const categories: Category[] =
    categoriesFromData.length > 0
      ? categoriesFromData
      : ([
          { id: "all", label: "All Services", icon: "grid" },
          // derive from services if present
          ...uniq(
            services
              .map((s) => (s.category as string | undefined) || "")
              .filter(Boolean)
          ).map((id) => ({
            id,
            label: id
              .toString()
              .split("-")
              .map((w) => w[0]?.toUpperCase() + w.slice(1))
              .join(" "),
            icon:
              id === "creative"
                ? "color-palette"
                : id === "technical"
                ? "code-slash"
                : id === "marketing"
                ? "trending-up"
                : "grid",
          })),
        ] as Category[]);

  const overviewFromData = asArray<OverviewService>(
    (pageData as any)?.overviewGrid?.services
  );
  const overviewServices: OverviewService[] =
    overviewFromData.length > 0
      ? overviewFromData
      : // fallback: derive quickly from services
        services.slice(0, 6).map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          icon: s.icon,
          href: s.href,
        }));

  const overviewTitle =
    (pageData as any)?.overviewGrid?.title ?? "Quick Service Overview";
  const overviewDescription =
    (pageData as any)?.overviewGrid?.description ??
    "Get started with the service that fits your needs";

  const hero = (pageData as any)?.hero ?? {
    title: "Choose Your Digital Solution",
    titleAccent: "Digital Solution",
    description:
      "From strategy to execution, we deliver comprehensive digital services that drive real outcomes.",
    quickStats: [
      { number: "150+", label: "Projects Completed" },
      { number: "98%", label: "Client Satisfaction" },
      { number: "24/7", label: "Support Available" },
    ],
  };

  const cta = (pageData as any)?.cta ?? {
    title: "Not sure which service you need?",
    description:
      "Schedule a free consultation and we'll help you choose the perfect solution for your goals.",
    primaryButton: { text: "Schedule Free Consultation", href: "/contact", icon: "calendar" },
    secondaryButton: { text: "Chat with Our Team", href: "/contact", icon: "chatbubbles" },
  };

  // ---- Filtering & sorting ----
  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((s) => s.category === activeCategory);

  const popularityOrder: Record<Popularity, number> = { high: 3, medium: 2, low: 1 };
  const sortedServices = [...filteredServices].sort(
    (a, b) => (popularityOrder[b.popularity ?? "medium"] - popularityOrder[a.popularity ?? "medium"])
  );

  return (
    <div className={styles.servicesSelector}>
      {/* Overview Grid */}
      <section className={styles.overviewSection}>
        <div className={styles.overviewHeader}>
          <h2 className={styles.overviewTitle}>{overviewTitle}</h2>
          <p className={styles.overviewSubtitle}>{overviewDescription}</p>
        </div>

        <div className={styles.overviewGrid}>
          {overviewServices.map((service) => (
            <Link key={service.id} href={service.href} className={styles.overviewCard}>
              <div className={styles.overviewCardHeader}>
                <div className={styles.overviewCardIcon}>
                  <ion-icon name={service.icon}></ion-icon>
                </div>
                <h3 className={styles.overviewCardTitle}>{service.title}</h3>
              </div>
              <p className={styles.overviewCardDesc}>{service.description}</p>
              <div className={styles.overviewCardFooter}>
                <span>Learn More</span>
                <ion-icon name="arrow-forward"></ion-icon>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hero */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Choose Your <span className={styles.heroAccent}>{hero.titleAccent}</span>
          </h1>
          <p className={styles.heroDescription}>{hero.description}</p>
        </div>

        <div className={styles.quickStats}>
          {asArray<any>(hero.quickStats).map((stat, i) => (
            <div key={i} className={styles.stat}>
              <span className={styles.statNumber}>{stat.number}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className={styles.categoryFilter}>
        <div className={styles.filterLabel}>Filter by category:</div>
        <div className={styles.categoryButtons}>
          {categories.map((category) => (
            <button
              key={category.id as string}
              className={cx(
                styles.categoryButton,
                activeCategory === category.id && styles.categoryButtonActive
              )}
              onClick={() => setActiveCategory(category.id)}
            >
              <ion-icon name={category.icon}></ion-icon>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className={styles.servicesGrid}>
        {sortedServices.map((service) => (
          <Link
            key={service.id}
            href={service.href}
            className={styles.serviceCard}
            onMouseEnter={() => setHoveredService(service.id)}
            onMouseLeave={() => setHoveredService(null)}
          >
            {service.popularity === "high" && (
              <div className={styles.popularBadge}>
                <ion-icon name="star"></ion-icon>
                <span>Popular</span>
              </div>
            )}

            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <ion-icon name={service.icon}></ion-icon>
              </div>
              <div className={styles.cardTitleSection}>
                <h3 className={styles.cardTitle}>{service.title}</h3>
                <p className={styles.cardDescription}>{service.description}</p>
              </div>
            </div>

            <div className={styles.cardFeatures}>
              <div className={styles.featuresLabel}>What's included:</div>
              <ul className={styles.featuresList}>
                {asArray<string>(service.features).slice(0, 3).map((feature, idx) => (
                  <li key={idx} className={styles.featureItem}>
                    <ion-icon name="checkmark-circle"></ion-icon>
                    <span>{feature}</span>
                  </li>
                ))}
                {asArray<string>(service.features).length > 3 && (
                  <li className={styles.featureMore}>
                    +{asArray<string>(service.features).length - 3} more features
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.cardMeta}>
                <div className={styles.metaItem}>
                  <ion-icon name="time"></ion-icon>
                  <span>{service.deliveryTime}</span>
                </div>
                <div className={styles.metaItem}>
                  <ion-icon name="card"></ion-icon>
                  <span>{service.startingPrice}</span>
                </div>
              </div>

              <div className={styles.cardAction}>
                <span className={styles.actionText}>Learn More</span>
                <ion-icon
                  name="arrow-forward"
                  className={cx(
                    styles.actionIcon,
                    hoveredService === service.id && styles.actionIconHovered
                  )}
                ></ion-icon>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCTA}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>{cta.title}</h2>
          <p className={styles.ctaDescription}>{cta.description}</p>
          <div className={styles.ctaButtons}>
            <Link href={cta.primaryButton.href} className={styles.ctaPrimaryButton}>
              <ion-icon name={cta.primaryButton.icon}></ion-icon>
              <span>{cta.primaryButton.text}</span>
            </Link>
            <Link href={cta.secondaryButton.href} className={styles.ctaSecondaryButton}>
              <ion-icon name={cta.secondaryButton.icon}></ion-icon>
              <span>{cta.secondaryButton.text}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
