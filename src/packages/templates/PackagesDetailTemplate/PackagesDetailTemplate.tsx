// src/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import styles from "./PackagesDetailTemplate.module.css";

// Domain adapters/types (classic shape)
import { toDetailModel } from "../../lib/adapters";
import type { PackageBundle, AddOn } from "../../lib/types";
import { serviceHref, normalizeServiceSlug } from "../../lib/registry";

// Domain UI
import { PriceBlock, PackageIncludesTable, AddOnsGrid } from "../../components";

// Site UI
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQAccordion from "@/components/ui/organisms/FAQAccordion";
import { StatsStrip } from "@/components/ui/organisms/StatsStrip/StatsStrip";

type MarketingBundleExtras = {
  // ... (unchanged)
  content?: { html?: string }; // <-- allow MDX HTML attachment
};

export type PackagesDetailTemplateProps = {
  bundle: PackageBundle & MarketingBundleExtras;
  addOns?: AddOn[];
  showBreadcrumbs?: boolean;
  backHref?: string;
  backLabel?: string;
  className?: string;
  id?: string;
};

function gtagSafe(event: string, params: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", event, params);
  }
}

const isTieredPricing = (b: PackagesDetailTemplateProps["bundle"]) =>
  b?.pricing && typeof b.pricing === "object" && b.pricing.kind === "tiers" && Array.isArray(b.pricing.tiers) && b.pricing.tiers.length > 0;

const asCurrency = (n: string | number | undefined) => {
  if (n == null) return "";
  if (typeof n === "string") return n;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
};

export default function PackagesDetailTemplate({
  bundle,
  addOns,
  showBreadcrumbs = true,
  backHref = "/packages",
  backLabel = "All packages",
  className,
  id,
}: PackagesDetailTemplateProps) {
  const classic = React.useMemo(
    () =>
      toDetailModel(bundle as PackageBundle, {
        price: { enableBillingToggle: true, badgeFromMostPopular: true, highlightMostPopular: true },
        includes: { enableSearch: true, collapsible: true, initiallyOpenCount: 2 },
        jsonLd: true,
      }),
    [bundle]
  );

  React.useEffect(() => {
    gtagSafe("package_detail_view", { slug: bundle.slug, name: (bundle as any).name ?? (bundle as any).title });
  }, [bundle.slug, (bundle as any).name, (bundle as any).title]);

  const primaryService = bundle.services?.[0] ? String(normalizeServiceSlug(bundle.services[0])) : undefined;
  const primaryServiceHref = primaryService ? serviceHref(primaryService) : undefined;

  const title = (bundle as any).title || (bundle as any).name;
  const subtitle = (bundle as any).subtitle || (bundle as any).summary || (bundle as any).description;

  return (
    <main className={[styles.root, className].filter(Boolean).join(" ")} id={id}>
      <div className={styles.container}>
        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href={backHref} className={styles.backLink}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
              <span>{backLabel}</span>
            </Link>
            {primaryServiceHref && (
              <>
                <span aria-hidden="true">/</span>
                <Link href={primaryServiceHref}>{primaryService?.replace(/-/g, " ")}</Link>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{title}</span>
          </nav>
        )}

        {/* HERO */}
        { (bundle as any).hero ? (
          <header className={styles.hero}>
            <ServiceHero
              {...{
                content: {
                  title: (bundle as any).hero?.content?.title || title,
                  subtitle: (bundle as any).hero?.content?.subtitle || subtitle,
                  primaryCta: (bundle as any).hero?.content?.primaryCta,
                  secondaryCta: (bundle as any).hero?.content?.secondaryCta,
                },
                background: (bundle as any).hero?.background,
              }}
            />
          </header>
        ) : (
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {(bundle as any).timeline && <p className={styles.meta}>Typical onboarding: {(bundle as any).timeline}</p>}
          </header>
        )}

        {/* Split layout: content + pricing */}
        <div className={styles.layout}>
          <div>
            {/* MDX Narrative (single controlled injection point) */}
            {(bundle as any).content?.html ? (
              <section className={styles.section} aria-labelledby="overview">
                <h2 id="overview" className={styles.sectionTitle}>Overview</h2>
                <article
                  className={styles.mdx}
                  dangerouslySetInnerHTML={{ __html: (bundle as any).content.html }}
                />
              </section>
            ) : null}

            {/* Old shape: rich includes table */}
            {!!classic?.includes?.sections?.length && (
              <section className={styles.section} aria-labelledby="includes-title">
                <h2 id="includes-title" className={styles.sectionTitle}>What's included</h2>
                <PackageIncludesTable {...classic.includes} />
              </section>
            )}

            {/* New shape: Included services + highlights */}
            {( (bundle as any).includedServices?.length || (bundle as any).highlights?.length) && (
              <section className={styles.section} aria-labelledby="whats-included">
                <h2 id="whats-included" className={styles.sectionTitle}>What's Included</h2>
                <div className={styles.split}>
                  {(bundle as any).includedServices?.length ? (
                    <div>
                      <h3 className={styles.h3}>Core Services</h3>
                      <ul className={styles.bullets} role="list">
                        {(bundle as any).includedServices.map((s: string, i: number) => (<li key={i}>✓ {s}</li>))}
                      </ul>
                    </div>
                  ) : null}
                  {(bundle as any).highlights?.length ? (
                    <div>
                      <h3 className={styles.h3}>Key Highlights</h3>
                      <ul className={styles.bullets} role="list">
                        {(bundle as any).highlights.map((h: string, i: number) => (<li key={i}>⭐ {h}</li>))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {/* Add-ons */}
            {addOns?.length ? (
              <section className={[styles.section, styles.addOns].join(" ")} aria-labelledby="addons-title">
                <h2 id="addons-title" className={styles.sectionTitle}>Recommended add-ons</h2>
                <AddOnsGrid items={addOns} title="Enhance this package" enableSearch />
              </section>
            ) : null}

            {/* Outcomes / proof */}
            {(bundle as any).outcomes?.items?.length ? (
              <section className={styles.section} aria-labelledby="outcomes-title">
                <h2 id="outcomes-title" className={styles.sectionTitle}>
                  {(bundle as any).outcomes.title || "Expected Results"}
                </h2>
                <StatsStrip {...((bundle as any).outcomes as any)} />
              </section>
            ) : null}
          </div>

          {/* Pricing aside */}
          <aside className={styles.aside} aria-label="Pricing">
            {isTieredPricing(bundle) ? (
              <div className={styles.pricingGrid}>
                {(bundle as any).pricing.tiers.map((tier: any) => (
                  <article key={tier.id || tier.name} className={styles.pricingCard}>
                    <div className={styles.pricingCardHeader}>
                      <h3 className={styles.pricingCardTitle}>{tier.name}</h3>
                      {tier.badge && <span className={styles.pricingCardBadge}>{tier.badge}</span>}
                    </div>
                    <div className={styles.pricingCardPrice}>
                      {tier.price && <span className={styles.priceDisplay}>{asCurrency(tier.price)}</span>}
                      {tier.period && <span className={styles.pricePeriod}>/{tier.period}</span>}
                    </div>
                    {tier.features?.length ? (
                      <ul className={styles.featureList} role="list">
                        {tier.features.slice(0, 6).map((f: string, i: number) => (
                          <li key={i} className={styles.featureItem}><span className={styles.featureIcon}>✓</span><span>{f}</span></li>
                        ))}
                        {tier.features.length > 6 && (
                          <li className={styles.featureItem}><span className={styles.featureIcon}>+</span><span>{tier.features.length - 6} more</span></li>
                        )}
                      </ul>
                    ) : null}
                    <div className={styles.pricingCardFooter}>
                      <a className={styles.pricingCta} href={tier.cta?.href || `/contact?from=${bundle.slug}-${tier.name || tier.id}`}>
                        {tier.cta?.label || "Get Started"}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <PriceBlock {...classic.price} />
            )}
          </aside>
        </div>

        {/* FAQ */}
        {(bundle as any).faq?.faqs?.length ? (
          <>
            <div className={styles.hr} />
            <section className={styles.section} aria-labelledby="faq-title">
              <h2 id="faq-title" className={styles.sectionTitle}>
                {(bundle as any).faq.title || "Frequently Asked Questions"}
              </h2>
              <FAQAccordion faqs={(bundle as any).faq.faqs} variant="default" enableSearch={(bundle as any).faq.faqs.length > 5} />
            </section>
          </>
        ) : null}

        {/* CTA */}
        {(bundle as any).cta ? (
          <section className={styles.section} aria-labelledby="cta-title">
            <CTASection
              title={(bundle as any).cta.title}
              description={(bundle as any).cta.subtitle}
              primaryCta={(bundle as any).cta.primaryCta}
              secondaryCta={(bundle as any).cta.secondaryCta}
              style={(bundle as any).cta.layout || "centered"}
            />
          </section>
        ) : null}

        {/* Footer meta */}
        <p className={styles.meta}>
          Looking for something custom? <Link href="/contact">Talk to our team</Link> and we’ll tailor a package for you.
        </p>
      </div>

      {/* JSON-LD */}
      {classic.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(classic.jsonLd) }} />
      )}
    </main>
  );
}