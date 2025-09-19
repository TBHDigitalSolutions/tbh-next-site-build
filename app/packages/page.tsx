// app/packages/page.tsx - FINAL PRODUCTION VERSION
import type { Metadata } from "next";
import Link from "next/link";
import su from "@/styles/services-unified.module.css";
import styles from "./packages.module.css";

import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import PackageCarousel from "@/components/sections/section-layouts/PackageCarousel/PackageCarousel";
import { toHeroProps } from "@/templates/shared/heroAdapter";

// Import packages data
import { 
  INTEGRATED_GROWTH_BUNDLES,
  getPackagesByService
} from "@/data/packages";

// Import featured data files
import { seoServicesFeatured } from "@/data/packages/seo-services/seo-services-featured";
import { webDevelopmentFeatured } from "@/data/packages/web-development/web-development-featured";
import { marketingFeatured } from "@/data/packages/marketing-services/marketing-featured";
import { leadGenerationFeatured } from "@/data/packages/lead-generation/lead-generation-featured";
import { videoProductionFeatured } from "@/data/packages/video-production/video-production-featured";

// Type-safe service configuration
type ServiceSlug = "webdev" | "seo" | "marketing" | "leadgen" | "content" | "video";

export const metadata: Metadata = {
  title: "Integrated Growth Packages | TBH Digital Solutions",
  description:
    "Complete business solutions that combine multiple services into powerful, results-driven packages. Choose from proven playbooks that deliver measurable growth.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Integrated Growth Packages | TBH Digital Solutions",
    description: "Complete business solutions that combine multiple services into powerful, results-driven packages.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/packages`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrated Growth Packages | TBH Digital Solutions",
    description: "Complete business solutions that combine multiple services into powerful, results-driven packages.",
  },
};

// Hero configuration
const hubHero = {
  content: {
    title: "Integrated Growth Packages",
    subtitle:
      "Proven playbooks bundled into simple plans — faster time to value, repeatable results.",
    primaryCta: { label: "Talk to Sales", href: "/contact?from=packages" },
  },
} as const;

// Service configuration with featured data mapping
const services = [
  { 
    slug: "seo" as const, 
    title: "SEO Services", 
    description: "Technical + content SEO for durable, compounding results",
    featuredData: seoServicesFeatured
  },
  { 
    slug: "webdev" as const, 
    title: "Web Development", 
    description: "Modern websites and apps built to convert and scale",
    featuredData: webDevelopmentFeatured
  },
  { 
    slug: "marketing" as const, 
    title: "Marketing Services", 
    description: "Acquire traffic, convert demand, and scale growth",
    featuredData: marketingFeatured
  },
  { 
    slug: "leadgen" as const, 
    title: "Lead Generation", 
    description: "Systematic acquisition and conversion across channels",
    featuredData: leadGenerationFeatured
  },
  { 
    slug: "video" as const, 
    title: "Video Production", 
    description: "High-impact video for ads, social, and brand storytelling",
    featuredData: videoProductionFeatured
  },
  { 
    slug: "content" as const, 
    title: "Content Production", 
    description: "Create, repurpose, and scale content that drives outcomes",
    featuredData: [] // Add content-featured.ts when available
  },
] as const;

// Helper function for safe image handling with fallbacks
function getBundleImageWithFallback(bundle: any) {
  // If bundle has a cardImage, use it; otherwise, create fallback
  if (bundle.cardImage?.src) {
    return {
      src: bundle.cardImage.src,
      alt: bundle.cardImage.alt ?? bundle.title
    };
  }
  
  // Fallback to a generic bundle image
  return {
    src: `/images/packages/bundle-default.jpg`,
    alt: `${bundle.title} package illustration`
  };
}

// Transform featured data for PackageCarousel compatibility
function transformFeaturedData(featuredData: any[], serviceSlug: ServiceSlug) {
  return (featuredData || []).slice(0, 3).map((pkg) => ({
    id: pkg.id || pkg.packageId,
    service: serviceSlug,
    name: pkg.headline || pkg.name || pkg.title || "Package",
    summary: pkg.summary || pkg.description || "",
    tier: (pkg.tier as "Essential" | "Professional" | "Enterprise") || "Essential",
    popular: pkg.badge === "Most Popular" || pkg.popular === true,
    href: pkg.href || `/contact?from=packages-${serviceSlug}-${pkg.id}`,
    image: pkg.cardImage || pkg.image || null,
    price: pkg.startingAt 
      ? { setup: Number(pkg.startingAt) || undefined }
      : pkg.price
        ? { setup: pkg.price.setup, monthly: pkg.price.monthly }
        : undefined,
    ctaLabel: pkg.ctaLabel || "Learn More",
    highlights: pkg.highlights || pkg.features?.slice(0, 3) || [],
  }));
}

export default function PackagesHubPage() {
  const hero = toHeroProps(hubHero);

  return (
    <div className={su.servicePage}>
      {/* HERO */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          {hero && <ServiceHero {...hero} />}
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* BUNDLES GRID - Complete growth solutions with fallback images */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="surface" padded>
          <header className={styles.header}>
            <h2 className={styles.title}>Complete Growth Solutions</h2>
            <p className={styles.subtitle}>
              Choose the plan that matches your goals. Every package is modular — 
              we can tailor scope without breaking the playbook.
            </p>
            <Divider />
          </header>

          <div className={styles.bundlesGrid}>
            {INTEGRATED_GROWTH_BUNDLES.map((bundle) => {
              const bundleImage = getBundleImageWithFallback(bundle);
              
              return (
                <article key={bundle.id} className={styles.bundleCard}>
                  <Link href={`/packages/${bundle.slug}`} className={styles.bundleLink}>
                    <div className={styles.bundleImageWrapper}>
                      <img
                        className={styles.bundleImage}
                        src={bundleImage.src}
                        alt={bundleImage.alt}
                        loading="lazy"
                        width={400}
                        height={240}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `/images/packages/bundle-default.jpg`;
                          target.alt = `${bundle.title} package`;
                        }}
                      />
                    </div>
                    <div className={styles.bundleBody}>
                      {bundle.category && (
                        <span className={styles.bundleCategory}>
                          {bundle.category.charAt(0).toUpperCase() + bundle.category.slice(1)}
                        </span>
                      )}
                      <h3 className={styles.bundleTitle}>{bundle.title}</h3>
                      {bundle.subtitle && (
                        <p className={styles.bundleSubtitle}>{bundle.subtitle}</p>
                      )}
                      {bundle.summary && (
                        <p className={styles.bundleSummary}>{bundle.summary}</p>
                      )}
                      
                      {/* Pricing hint if available */}
                      {bundle.pricing?.tiers?.[0] && (
                        <div className={styles.bundlePricing}>
                          <span className={styles.priceLabel}>Starting at</span>
                          <span className={styles.priceValue}>
                            {bundle.pricing.tiers[0].price || "Contact for pricing"}
                          </span>
                        </div>
                      )}
                      
                      <div className={styles.bundleFooter}>
                        <span className={styles.bundleCta}>View details →</span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* SERVICE PACKAGE CAROUSELS - Section header */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <header className={styles.header}>
            <h2 className={styles.title}>Browse by Service</h2>
            <p className={styles.subtitle}>
              Explore our featured packages across all core services. Each shows exactly 
              what's included and why it's a great value.
            </p>
            <Divider />
          </header>
        </Container>
      </FullWidthSection>

      {/* Individual Service Carousels with Enhanced Cards */}
      <div className={styles.serviceCarousels}>
        {services.map((service) => {
          // Only render if we have featured data
          if (!service.featuredData || service.featuredData.length === 0) {
            return null;
          }

          // Transform data for PackageCarousel
          const packageItems = transformFeaturedData(service.featuredData, service.slug);

          return (
            <FullWidthSection key={service.slug} constrained containerSize="wide" padded>
              <Container size="wide" tone="transparent" padded>
                <PackageCarousel
                  title={service.title}
                  subtitle={service.description}
                  items={packageItems}
                  layout="carousel"
                  serviceSlug={service.slug}
                  showFooterActions={true}
                  enforceThreeCards={true}
                />
              </Container>
              <Divider variant="constrained" />
            </FullWidthSection>
          );
        })}
      </div>

      {/* FINAL CTA */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="gradient" padded>
          <CTASection
            title="Unsure which package fits?"
            description="Tell us your goals and constraints — we'll recommend the right bundle and timeline."
            primaryCta={{ 
              label: "Get a Recommendation", 
              href: "/contact?from=packages-hub" 
            }}
            secondaryCta={{ 
              label: "See Case Studies", 
              href: "/case-studies" 
            }}
            style="centered"
          />
        </Container>
      </FullWidthSection>
    </div>
  );
}