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

// Site UI (for parity with app/pages)
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQAccordion from "@/components/ui/organisms/FAQAccordion";
import { StatsStrip } from "@/components/ui/organisms/StatsStrip/StatsStrip";

/** Union: classic PackageBundle + extended fields used by app/pages */
type MarketingBundleExtras = {
  hero?: {
    content?: {
      title?: string;
      subtitle?: string;
      primaryCta?: { label: string; href: string };
      secondaryCta?: { label: string; href: string };
    };
    background?: { type?: "image"; src?: string; alt?: string };
  };
  includedServices?: string[];
  highlights?: string[];
  outcomes?: { title?: string; variant?: "stats"; items?: Array<{ label: string; value: string }> };
  pricing?: any; // may be { kind: "tiers", tiers: [...] } or { setup, monthly }
  faq?: { title?: string; faqs?: Array<{ id: string; question: string; answer: string }> };
  cta?: { title: string; subtitle?: string; primaryCta: { label: string; href: string }; secondaryCta?: { label: string; href: string }; layout?: "centered" | string };
  cardImage?: { src?: string; alt?: string };
  title?: string;  // some “integrated” bundles use title/subtitle/summary naming
  subtitle?: string;
  summary?: string;
  category?: string;
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
  // Classic model (price/includes/jsonLd) for old shape
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
    gtagSafe("package_detail_view", { slug: bundle.slug, name: bundle.name });
  }, [bundle.slug, bundle.name]);

  const primaryService = bundle.services?.[0] ? String(normalizeServiceSlug(bundle.services[0])) : undefined;
  const primaryServiceHref = primaryService ? serviceHref(primaryService) : undefined;

  // Prefer new “marketing” naming for title/description when present
  const title = bundle.title || bundle.name;
  const subtitle = bundle.subtitle || bundle.summary || bundle.description;

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

        {/* HERO (new shape) */}
        {bundle.hero ? (
          <header className={styles.hero}>
            <ServiceHero
              {...{
                content: {
                  title: bundle.hero?.content?.title || title,
                  subtitle: bundle.hero?.content?.subtitle || subtitle,
                  primaryCta: bundle.hero?.content?.primaryCta,
                  secondaryCta: bundle.hero?.content?.secondaryCta,
                },
                background: bundle.hero?.background,
              }}
            />
          </header>
        ) : (
          // Fallback header (old shape)
          <header className={styles.header}>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {bundle.timeline && <p className={styles.meta}>Typical onboarding: {bundle.timeline}</p>}
          </header>
        )}

        {/* Split layout: content + pricing */}
        <div className={styles.layout}>
          <div>
            {/* Old shape: rich includes table */}
            {!!classic?.includes?.sections?.length && (
              <section className={styles.section} aria-labelledby="includes-title">
                <h2 id="includes-title" className={styles.sectionTitle}>What's included</h2>
                <PackageIncludesTable {...classic.includes} />
              </section>
            )}

            {/* New shape: Included services + highlights */}
            {(bundle.includedServices?.length || bundle.highlights?.length) && (
              <section className={styles.section} aria-labelledby="whats-included">
                <h2 id="whats-included" className={styles.sectionTitle}>What's Included</h2>
                <div className={styles.split}>
                  {bundle.includedServices?.length ? (
                    <div>
                      <h3 className={styles.h3}>Core Services</h3>
                      <ul className={styles.bullets} role="list">
                        {bundle.includedServices.map((s, i) => (<li key={i}>✓ {s}</li>))}
                      </ul>
                    </div>
                  ) : null}
                  {bundle.highlights?.length ? (
                    <div>
                      <h3 className={styles.h3}>Key Highlights</h3>
                      <ul className={styles.bullets} role="list">
                        {bundle.highlights.map((h, i) => (<li key={i}>⭐ {h}</li>))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>
            )}

            {/* Recommended add-ons (unchanged) */}
            {addOns?.length ? (
              <section className={[styles.section, styles.addOns].join(" ")} aria-labelledby="addons-title">
                <h2 id="addons-title" className={styles.sectionTitle}>Recommended add-ons</h2>
                <AddOnsGrid items={addOns} title="Enhance this package" enableSearch />
              </section>
            ) : null}

            {/* Outcomes / proof (new shape) */}
            {bundle.outcomes?.items?.length ? (
              <section className={styles.section} aria-labelledby="outcomes-title">
                <h2 id="outcomes-title" className={styles.sectionTitle}>
                  {bundle.outcomes.title || "Expected Results"}
                </h2>
                <StatsStrip {...(bundle.outcomes as any)} />
              </section>
            ) : null}
          </div>

          {/* Pricing aside */}
          <aside className={styles.aside} aria-label="Pricing">
            {isTieredPricing(bundle) ? (
              // Render tiered pricing inline (new shape)
              <div className={styles.pricingGrid}>
                {bundle.pricing.tiers.map((tier: any) => (
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
              // Classic single-price block
              <PriceBlock {...classic.price} />
            )}
          </aside>
        </div>

        {/* FAQ (new shape) */}
        {bundle.faq?.faqs?.length ? (
          <>
            <div className={styles.hr} />
            <section className={styles.section} aria-labelledby="faq-title">
              <h2 id="faq-title" className={styles.sectionTitle}>
                {bundle.faq.title || "Frequently Asked Questions"}
              </h2>
              <FAQAccordion faqs={bundle.faq.faqs} variant="default" enableSearch={bundle.faq.faqs.length > 5} />
            </section>
          </>
        ) : null}

        {/* CTA (new shape) */}
        {bundle.cta ? (
          <section className={styles.section} aria-labelledby="cta-title">
            <CTASection
              title={bundle.cta.title}
              description={bundle.cta.subtitle}
              primaryCta={bundle.cta.primaryCta}
              secondaryCta={bundle.cta.secondaryCta}
              style={bundle.cta.layout || "centered"}
            />
          </section>
        ) : null}

        {/* Footer meta */}
        <p className={styles.meta}>
          Looking for something custom? <Link href="/contact">Talk to our team</Link> and we’ll tailor a package for you.
        </p>
      </div>

      {/* JSON-LD (classic adapter keeps this working for old shape) */}
      {classic.jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(classic.jsonLd) }} />
      )}
    </main>
  );
}
