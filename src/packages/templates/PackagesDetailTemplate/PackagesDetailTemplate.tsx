// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./PackagesDetailTemplate.module.css";

import type { PackageBundle } from "@/packages/lib/types";
import { emitServiceJsonLd } from "@/packages/lib/jsonld";
import { toCombinedPrice } from "@/data/packages/_types/currency";

// Sections
import ServiceHero from "@/components/sections/section-layouts/ServiceHero";
import { PackageCarousel } from "@/components/sections/section-layouts/PackageCarousel";

// Domain components
import PriceBlock from "@/packages/components/PriceBlock";
import PackageIncludesTable from "@/packages/components/PackageIncludesTable";
import AddOnsGrid from "@/packages/components/AddOnsGrid";
import PackageCard from "@/packages/components/PackageCard";

export type PackagesDetailTemplateProps = {
  bundle: PackageBundle;
  /** Optional: related bundles for “Popular in this category” */
  related?: PackageBundle[];
  /** Optional: recommended add-ons (already filtered/adapted if needed) */
  addOns?: Array<{
    slug: string;
    name: string;
    description: string;
    price?: { oneTime?: number; monthly?: number; currency?: "USD" };
    category?: string;
  }>;
};

export default function PackagesDetailTemplate({
  bundle,
  related = [],
  addOns = [],
}: PackagesDetailTemplateProps) {
  const hero = bundle.hero ?? {
    content: {
      title: bundle.title,
      subtitle: bundle.summary ?? bundle.subtitle,
      primaryCta: { label: "Request proposal", href: "/contact" },
      secondaryCta: { label: "All packages", href: "/packages" },
    },
  };

  const contentHtml = (bundle as any)?.content?.html as string | undefined;

  // Build PriceBlock model (component gracefully tolerates missing values)
  const priceModel = {
    price: {
      monthly: (bundle as any)?.price?.monthly,
      oneTime: (bundle as any)?.price?.oneTime,
      currency: (bundle as any)?.price?.currency ?? "USD",
    },
    title: bundle.title,
    enableBillingToggle: true,
    jsonLd: false, // emit JSON-LD separately (see below)
    primaryCta: { label: "Request proposal", href: "/contact" },
    secondaryCta: { label: "Book a call", href: "/book" },
  };

  const includesModel = {
    title: "What’s included",
    enableSearch: true,
    collapsible: true,
    sections: bundle.includes ?? [],
    initiallyOpenCount: 2,
  };

  return (
    <article className={styles.wrap}>
      {/* schema.org JSON-LD (offers emitted only if price exists) */}
      {emitServiceJsonLd(bundle)}

      {/* Hero */}
      <ServiceHero
        title={hero.content?.title ?? bundle.title}
        subtitle={hero.content?.subtitle}
        primaryCta={hero.content?.primaryCta}
        secondaryCta={hero.content?.secondaryCta}
        tags={(bundle as any)?.services ?? []}
      />

      {/* At-a-glance (compact summary) */}
      <section className={styles.heroAside}>
        <aside className={styles.summaryCard} aria-label="Package summary">
          <h2 className={styles.cardTitle}>{bundle.title}</h2>
          <dl className={styles.metaList}>
            {bundle.category && (
              <>
                <dt>Category</dt>
                <dd>{bundle.category}</dd>
              </>
            )}
            {(bundle as any)?.price && (
              <>
                <dt>Pricing</dt>
                <dd>{toCombinedPrice((bundle as any).price)}</dd>
              </>
            )}
          </dl>
          <div className={styles.cardActions}>
            <Link href="/contact" className={styles.primaryBtn}>
              Request proposal
            </Link>
            <Link href="/book" className={styles.secondaryBtn}>
              Book a call
            </Link>
          </div>
        </aside>
      </section>

      {/* Price block */}
      <section className={styles.section}>
        <PriceBlock {...(priceModel as any)} />
      </section>

      {/* Narrative (compiled MDX → HTML). Render ONCE, controlled. */}
      {contentHtml && (
        <section className={styles.content}>
          <article
            className={styles.prose}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </section>
      )}

      {/* Highlights / Outcomes */}
      {(bundle.highlights?.length || bundle.outcomes?.items?.length) && (
        <section className={styles.twoCol}>
          {!!bundle.highlights?.length && (
            <div>
              <h3 className={styles.h3}>Highlights</h3>
              <ul className={styles.list}>
                {bundle.highlights!.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}
          {!!bundle.outcomes?.items?.length && (
            <div>
              <h3 className={styles.h3}>{bundle.outcomes?.title ?? "Expected results"}</h3>
              <ul className={styles.kpis}>
                {bundle.outcomes!.items!.map((o, i) => (
                  <li key={i}>
                    <span className={styles.kpiLabel}>{o.label}</span>
                    <span className={styles.kpiValue}>{o.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Includes */}
      {(bundle.includes?.length ?? 0) > 0 && (
        <section className={styles.section}>
          <PackageIncludesTable {...(includesModel as any)} />
        </section>
      )}

      {/* Recommended add-ons */}
      {addOns.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.h3}>Recommended add-ons</h3>
          <AddOnsGrid addOns={addOns as any} />
        </section>
      )}

      {/* Related (optional rail) */}
      {related.length > 0 && (
        <section className={styles.section}>
          <PackageCarousel
            title="Popular in this category"
            items={related.map((b) => toPackageCard(b) as any)}
            serviceSlug={(related[0] as any)?.services?.[0] ?? "content"}
            showFooterActions={false}
          />
        </section>
      )}

      {/* Bottom CTA */}
      <section className={styles.bottomCta}>
        <div>
          <h3>Ready to get started?</h3>
          <p>Talk to our team and tailor this package to your goals.</p>
        </div>
        <div className={styles.ctaRow}>
          <Link href="/contact" className={styles.primaryBtn}>
            Request proposal
          </Link>
          <Link href="/book" className={styles.secondaryBtn}>
            Book a call
          </Link>
        </div>
      </section>
    </article>
  );
}
