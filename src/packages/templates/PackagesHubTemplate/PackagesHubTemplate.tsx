// src/packages/templates/PackagesHubTemplate/PackagesHubTemplate.tsx
"use client";

import * as React from "react";
import styles from "./PackagesHubTemplate.module.css";

import type { PackageBundle } from "../../lib/types";
import { toHubModel } from "../../lib/adapters";
import PackagesSection from "../../sections/PackagesSection";

// Optional hero parity with app/pages
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";

export type PackagesHubTemplateProps = {
  bundles: PackageBundle[];
  featuredSlugs?: string[];

  /** Page chrome */
  title?: string;
  subtitle?: string;
  className?: string;
  id?: string;

  /** UX controls */
  showServiceFilter?: boolean;
  initialService?: string;
  showSearch?: boolean;
  showSort?: boolean;
  defaultSort?: "recommended" | "name" | "priceAsc" | "priceDesc";
  minCardWidthPx?: number;

  /** JSON-LD */
  jsonLd?: boolean;

  /** Optional hero (new page parity) */
  hero?: {
    content: {
      title: string;
      subtitle?: string;
      primaryCta?: { label: string; href: string };
      secondaryCta?: { label: string; href: string };
    };
    background?: { type?: "image"; src?: string; alt?: string };
  };

  /** Slot for extra sections (e.g., service carousels) */
  children?: React.ReactNode;
};

export default function PackagesHubTemplate({
  bundles,
  featuredSlugs,
  title = "Packages",
  subtitle = "Pick a ready-to-go solution or tailor one to your needs.",
  className,
  id,
  showServiceFilter = true,
  initialService,
  showSearch = true,
  showSort = true,
  defaultSort = "recommended",
  minCardWidthPx = 300,
  jsonLd = true,
  hero,
  children,
}: PackagesHubTemplateProps) {
  const hub = React.useMemo(() => toHubModel(bundles, { featuredSlugs, jsonLd }), [bundles, featuredSlugs, jsonLd]);
  if (!bundles?.length) return null;

  return (
    <main className={[styles.root, className].filter(Boolean).join(" ")} id={id}>
      <div className={styles.container}>
        {/* Optional hero to match app/packages/page.tsx */}
        {hero ? (
          <header className={styles.hero}>
            <ServiceHero {...hero} />
          </header>
        ) : (
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </header>
        )}

        {/* Core packages section (grid + filters/search/sort) */}
        <PackagesSection
          bundles={bundles}
          featuredSlugs={featuredSlugs}
          showServiceFilter={showServiceFilter}
          initialService={initialService}
          showSearch={showSearch}
          showSort={showSort}
          defaultSort={defaultSort}
          minCardWidthPx={minCardWidthPx}
          jsonLd={false} // page-level script below
          title={undefined}
          subtitle={undefined}
        />

        {/* Optional page-level ItemList JSON-LD */}
        {jsonLd && hub.jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(hub.jsonLd) }} />
        )}

        {/* Extra sections (e.g., service carousels + CTA) */}
        {children}
      </div>
    </main>
  );
}
