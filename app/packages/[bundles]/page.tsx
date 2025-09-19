// app/packages/[bundle]/page.tsx - Production-Ready Bundle Detail Page
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import su from "@/styles/services-unified.module.css";
import styles from "../packages.module.css";

import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";
import Breadcrumbs from "@/components/global/Breadcrumbs/Breadcrumbs";
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import FAQAccordion from "@/components/ui/organisms/FAQAccordion";
import { StatsStrip } from "@/components/ui/organisms/StatsStrip/StatsStrip";
import { toHeroProps } from "@/templates/shared/heroAdapter";

// Import packages data
import { 
  INTEGRATED_GROWTH_BUNDLES, 
  getBundleBySlug 
} from "@/data/packages";

type Params = { bundle: string };

// Static params generation for all bundles
export function generateStaticParams() {
  return INTEGRATED_GROWTH_BUNDLES.map((bundle) => ({ 
    bundle: bundle.slug 
  }));
}

// Metadata generation
export function generateMetadata({ params }: { params: Params }): Metadata {
  const bundle = getBundleBySlug(params.bundle);
  
  if (!bundle) {
    return {
      title: "Package Not Found",
      description: "The requested package could not be found.",
    };
  }

  // Ensure absolute URLs for OpenGraph images
  const getAbsoluteUrl = (src: string) => {
    if (src.startsWith('http')) return src;
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tbhdigitalsolutions.com'}${src}`;
  };

  return {
    title: `${bundle.title} - Integrated Growth Package`,
    description: bundle.subtitle || bundle.summary || `Complete ${bundle.title} solution with integrated services.`,
    alternates: { canonical: `/packages/${params.bundle}` },
    openGraph: {
      title: bundle.title,
      description: bundle.subtitle || bundle.summary,
      type: "website",
      ...(bundle.cardImage?.src && {
        images: [{
          url: getAbsoluteUrl(bundle.cardImage.src),
          alt: bundle.cardImage.alt || bundle.title
        }]
      })
    }
  };
}

// Helper function to format currency
function formatCurrency(amount: string | number): string {
  if (typeof amount === "string") return amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function BundleDetailPage({ params }: { params: Params }) {
  const bundle = getBundleBySlug(params.bundle);
  
  if (!bundle) {
    return (
      <div className={su.servicePage}>
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <div className={styles.notFound}>
              <h1>Package Not Found</h1>
              <p>The package "{params.bundle}" could not be found.</p>
              <a href="/packages" className={styles.backLink}>
                ← Back to Packages
              </a>
            </div>
          </Container>
        </FullWidthSection>
      </div>
    );
  }

  // Prepare hero data
  const hero = toHeroProps(bundle.hero);
  
  // Prepare breadcrumbs
  const breadcrumbs = [
    { label: "Services", href: "/services" },
    { label: "Packages", href: "/packages" },
    { label: bundle.title, href: `/packages/${bundle.slug}` },
  ];

  // Check if bundle has pricing tiers
  const hasPricingTiers = bundle.pricing && 
    (bundle.pricing as any).kind === "tiers" && 
    Array.isArray((bundle.pricing as any).tiers) &&
    (bundle.pricing as any).tiers.length > 0;

  return (
    <div className={su.servicePage}>
      {/* BREADCRUMBS */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <Breadcrumbs items={breadcrumbs} />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* HERO */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          {hero && <ServiceHero {...hero} />}
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* WHAT'S INCLUDED / HIGHLIGHTS */}
      {(bundle.includedServices?.length || bundle.highlights?.length) && (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={styles.header}>
              <h2 className={styles.title}>What's Included</h2>
              <Divider />
            </header>

            <div className={styles.split}>
              {bundle.includedServices?.length > 0 && (
                <div>
                  <h3 className={styles.h3}>Core Services</h3>
                  <ul className={styles.bullets} role="list">
                    {bundle.includedServices.map((service, i) => (
                      <li key={i}>✓ {service}</li>
                    ))}
                  </ul>
                </div>
              )}

              {bundle.highlights?.length > 0 && (
                <div>
                  <h3 className={styles.h3}>Key Highlights</h3>
                  <ul className={styles.bullets} role="list">
                    {bundle.highlights.map((highlight, i) => (
                      <li key={i}>⭐ {highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      )}

      {/* OUTCOMES / PROOF */}
      {bundle.outcomes?.items?.length > 0 && (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={styles.header}>
              <h2 className={styles.title}>
                {bundle.outcomes.title || "Expected Results"}
              </h2>
              <Divider />
            </header>
            <StatsStrip {...(bundle.outcomes as any)} />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      )}

      {/* PRICING - SIMPLIFIED INLINE VERSION */}
      {bundle.pricing && (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <header className={styles.header}>
              <h2 className={styles.title}>
                {(bundle.pricing as any).title || "Investment & Options"}
              </h2>
              {(bundle.pricing as any).subtitle && (
                <p className={styles.subtitle}>
                  {(bundle.pricing as any).subtitle}
                </p>
              )}
              <Divider />
            </header>

            {/* Pricing Tiers Grid */}
            {hasPricingTiers ? (
              <div className={styles.pricingGrid}>
                {(bundle.pricing as any).tiers.map((tier: any) => (
                  <article key={tier.id || tier.name} className={styles.pricingCard}>
                    <div className={styles.pricingCardHeader}>
                      <h3 className={styles.pricingCardTitle}>{tier.name}</h3>
                      {tier.badge && (
                        <span className={styles.pricingCardBadge}>{tier.badge}</span>
                      )}
                    </div>
                    
                    <div className={styles.pricingCardPrice}>
                      {tier.price && (
                        <span className={styles.priceDisplay}>
                          {formatCurrency(tier.price)}
                        </span>
                      )}
                      {tier.period && (
                        <span className={styles.pricePeriod}>/{tier.period}</span>
                      )}
                    </div>

                    {tier.features?.length > 0 && (
                      <ul className={styles.featureList} role="list">
                        {tier.features.slice(0, 6).map((feature: string, idx: number) => (
                          <li key={idx} className={styles.featureItem}>
                            <span className={styles.featureIcon}>✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                        {tier.features.length > 6 && (
                          <li className={styles.featureItem}>
                            <span className={styles.featureIcon}>+</span>
                            <span>{tier.features.length - 6} more features</span>
                          </li>
                        )}
                      </ul>
                    )}

                    <div className={styles.pricingCardFooter}>
                      <a 
                        className={styles.pricingCta}
                        href={tier.cta?.href || `/contact?from=${bundle.slug}-${tier.name || tier.id}`}
                      >
                        {tier.cta?.label || "Get Started"}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              // Single pricing display
              <div className={styles.singlePricing}>
                <div className={styles.priceInfo}>
                  {(bundle.pricing as any).setup && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Setup Investment:</span>
                      <span className={styles.priceValue}>
                        {formatCurrency((bundle.pricing as any).setup)}
                      </span>
                    </div>
                  )}
                  {(bundle.pricing as any).monthly && (
                    <div className={styles.priceRow}>
                      <span className={styles.priceLabel}>Monthly Retainer:</span>
                      <span className={styles.priceValue}>
                        {formatCurrency((bundle.pricing as any).monthly)}
                      </span>
                    </div>
                  )}
                </div>
                <div className={styles.singlePricingCta}>
                  <a 
                    className={styles.primaryButton}
                    href={`/contact?from=${bundle.slug}-pricing`}
                  >
                    Talk to Sales
                  </a>
                </div>
              </div>
            )}
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      )}

      {/* FAQ */}
      {bundle.faq?.faqs?.length > 0 && (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <header className={styles.header}>
              <h2 className={styles.title}>
                {bundle.faq.title || "Frequently Asked Questions"}
              </h2>
              <Divider />
            </header>
            <FAQAccordion
              faqs={bundle.faq.faqs}
              variant="default"
              enableSearch={bundle.faq.faqs.length > 5}
            />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      )}

      {/* FINAL CTA */}
      {bundle.cta && (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="gradient" padded>
            <CTASection 
              title={bundle.cta.title}
              description={bundle.cta.subtitle}
              primaryCta={bundle.cta.primaryCta}
              secondaryCta={bundle.cta.secondaryCta}
              style={bundle.cta.layout || "centered"}
            />
          </Container>
        </FullWidthSection>
      )}
    </div>
  );
}