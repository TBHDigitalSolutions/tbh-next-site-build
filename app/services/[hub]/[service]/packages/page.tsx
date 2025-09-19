// app/services/[hub]/[service]/packages/page.tsx - FINAL PRODUCTION VERSION
import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Styles
import su from "@/styles/services-unified.module.css";
import styles from "./service-packages.module.css";

// Layout atoms
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";

// UI
import Breadcrumbs from "@/components/global/Breadcrumbs/Breadcrumbs";
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";
import PackageCarousel from "@/components/sections/section-layouts/PackageCarousel/PackageCarousel";

// Featured data (service-scoped; keep try/catch for resilience in CI)
let seoServicesFeatured: any[] = [];
let webDevelopmentFeatured: any[] = [];
let marketingFeatured: any[] = [];
let leadGenerationFeatured: any[] = [];
let videoProductionFeatured: any[] = [];

try {
  // Prefer explicit imports when available
  // These paths match your repo structure under /src/data/packages/...
  // If a file is missing, the catch will keep the array empty (safe render).
  // SEO
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  seoServicesFeatured = require("@/data/packages/seo-services/seo-services-featured").seoServicesFeatured ?? [];
  // Web Dev
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  webDevelopmentFeatured = require("@/data/packages/web-development/web-development-featured").webDevelopmentFeatured ?? [];
  // Marketing
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  marketingFeatured = require("@/data/packages/marketing/marketing-featured").marketingFeatured ?? [];
  // Lead Gen
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  leadGenerationFeatured = require("@/data/packages/lead-generation/lead-generation-featured").leadGenerationFeatured ?? [];
  // Video
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  videoProductionFeatured = require("@/data/packages/video-production/video-production-featured").videoProductionFeatured ?? [];
} catch (e) {
  if (process.env.NODE_ENV === "development") {
    // Non-fatal: page still renders with empty carousels/sections
    console.warn("[ServicePackagesPage] One or more featured data files missing.", e);
  }
}

// Optional taxonomy validation (keeps route integrity, but never blocks build)
import { getServiceNode } from "@/lib/services/taxonomy";

// ==============================
// Types (Next.js 15: async params)
// ==============================
type Params = Promise<{ hub: string; service: string }>;
type ServiceSlugForFooter = "seo" | "webdev" | "marketing" | "leadgen" | "content" | "video";

// ==============================
// Service Config (title/copy + data)
// ==============================
const SERVICE_CONFIG: Record<
  string,
  {
    serviceSlugForFooter: ServiceSlugForFooter;
    title: string;
    subtitle: string;
    description: string;
    ctaLabel: string;
    featured: any[];
  }
> = {
  // ── SEO Services ──────────────────────────────────────────────
  technical: {
    serviceSlugForFooter: "seo",
    title: "Technical SEO Packages",
    subtitle: "Fix crawl, indexing, performance & site structure",
    description:
      "Comprehensive technical SEO audits and fixes that improve site health and organic visibility.",
    ctaLabel: "Fix Technical Issues",
    featured: seoServicesFeatured,
  },
  marketing: {
    serviceSlugForFooter: "seo",
    title: "Content SEO Packages",
    subtitle: "Create & optimize content to grow organic traffic",
    description:
      "Editorial planning, content optimization, and measurement for compounding search growth.",
    ctaLabel: "Optimize Content",
    featured: seoServicesFeatured,
  },
  "ai-seo": {
    serviceSlugForFooter: "seo",
    title: "AI-Powered SEO Packages",
    subtitle: "Scale content and optimization with AI assistance",
    description:
      "Modern SEO workflows enhanced with AI for efficiency and competitive advantage.",
    ctaLabel: "Scale with AI",
    featured: seoServicesFeatured,
  },

  // ── Web Development ───────────────────────────────────────────
  website: {
    serviceSlugForFooter: "webdev",
    title: "Website Development Packages",
    subtitle: "Modern websites built to convert and scale",
    description:
      "Custom website development with performance, SEO, and user experience built in.",
    ctaLabel: "Build Better Website",
    featured: webDevelopmentFeatured,
  },
  ecommerce: {
    serviceSlugForFooter: "webdev",
    title: "E-commerce Development Packages",
    subtitle: "Online stores that convert visitors into customers",
    description:
      "Complete e-commerce solutions with modern design and powerful functionality.",
    ctaLabel: "Launch Online Store",
    featured: webDevelopmentFeatured,
  },
  applications: {
    serviceSlugForFooter: "webdev",
    title: "Web Application Packages",
    subtitle: "Custom apps and complex functionality",
    description:
      "Bespoke web applications tailored to your specific business processes and needs.",
    ctaLabel: "Build Custom App",
    featured: webDevelopmentFeatured,
  },

  // ── Marketing ────────────────────────────────────────────────
  "paid-search": {
    serviceSlugForFooter: "marketing",
    title: "Paid Search Packages",
    subtitle: "Google Ads campaigns that drive qualified traffic",
    description:
      "Strategic Google Ads management focused on ROI and sustainable growth.",
    ctaLabel: "Scale Search Ads",
    featured: marketingFeatured,
  },
  "paid-social": {
    serviceSlugForFooter: "marketing",
    title: "Paid Social Packages",
    subtitle: "Facebook, LinkedIn & social campaigns",
    description:
      "Social media advertising that builds audiences and drives conversions.",
    ctaLabel: "Scale Social Ads",
    featured: marketingFeatured,
  },
  "content-marketing": {
    serviceSlugForFooter: "marketing",
    title: "Content Marketing Packages",
    subtitle: "Strategic content that drives engagement & leads",
    description:
      "Content marketing programs that build authority and generate demand.",
    ctaLabel: "Scale Content Marketing",
    featured: marketingFeatured,
  },

  // ── Lead Generation ──────────────────────────────────────────
  "offer-strategy": {
    serviceSlugForFooter: "leadgen",
    title: "Lead Magnet Strategy Packages",
    subtitle: "Compelling offers that capture qualified leads",
    description:
      "Strategic lead magnets and offers designed to attract your ideal customers.",
    ctaLabel: "Create Better Offers",
    featured: leadGenerationFeatured,
  },
  "landing-pages": {
    serviceSlugForFooter: "leadgen",
    title: "Landing Page Packages",
    subtitle: "High-converting pages that capture & qualify leads",
    description:
      "Landing page design and optimization focused on conversion and lead quality.",
    ctaLabel: "Build Converting Pages",
    featured: leadGenerationFeatured,
  },
  "lead-scoring": {
    serviceSlugForFooter: "leadgen",
    title: "Lead Scoring Packages",
    subtitle: "Automated qualification & prioritization systems",
    description:
      "Lead scoring and routing systems that help sales focus on the best opportunities.",
    ctaLabel: "Qualify Leads Better",
    featured: leadGenerationFeatured,
  },

  // ── Video Production ─────────────────────────────────────────
  "pre-production": {
    serviceSlugForFooter: "video",
    title: "Video Pre-Production Packages",
    subtitle: "Planning, scripting & creative development",
    description:
      "Comprehensive pre-production services that set your video projects up for success.",
    ctaLabel: "Plan Better Videos",
    featured: videoProductionFeatured,
  },
  production: {
    serviceSlugForFooter: "video",
    title: "Video Production Packages",
    subtitle: "Professional filming & direction services",
    description:
      "Full-service video production with professional crews and equipment.",
    ctaLabel: "Create Professional Videos",
    featured: videoProductionFeatured,
  },
  "post-production": {
    serviceSlugForFooter: "video",
    title: "Video Post-Production Packages",
    subtitle: "Editing, motion graphics & final delivery",
    description:
      "Professional editing and post-production that brings your vision to life.",
    ctaLabel: "Perfect Your Videos",
    featured: videoProductionFeatured,
  },
};

// =======================================
// Adapter: featured[] → PackageCarousel items
// (matches PackageCard/PackageCarousel APIs)
// =======================================
function transformFeaturedData(featured: any[]) {
  return (Array.isArray(featured) ? featured : [])
    .slice(0, 3)
    .map((pkg) => ({
      id: pkg.id || pkg.packageId,
      service: (pkg.service as ServiceSlugForFooter) || "seo", // safe default for footer labeling
      name: pkg.headline || pkg.name || pkg.title || "Package",
      summary: pkg.summary || pkg.description || "",
      tier: (pkg.tier as "Essential" | "Professional" | "Enterprise") || "Essential",
      popular: pkg.badge === "Most Popular" || pkg.popular === true,
      href: `#${pkg.packageId || pkg.id || "package"}`,
      image: pkg.cardImage || pkg.image || null,
      price: pkg.startingAt
        ? { setup: Number(pkg.startingAt) || undefined }
        : pkg.price
        ? { setup: pkg.price.setup, monthly: pkg.price.monthly }
        : undefined,
      ctaLabel: pkg.ctaLabel || "View Details",
      // carry highlights for the comparison section below
      highlights: pkg.highlights || (Array.isArray(pkg.features) ? pkg.features.slice(0, 3) : []),
    }));
}

// =======================================
// SSG (derive from SERVICE_CONFIG hub→service)
// Only build pages for services we have package data for.
// =======================================
export async function generateStaticParams() {
  const params: Array<{ hub: string; service: string }> = [];

  for (const service of Object.keys(SERVICE_CONFIG)) {
    if (service === "technical" || service === "marketing" || service === "ai-seo") {
      params.push({ hub: "seo-services", service });
    } else if (service === "website" || service === "ecommerce" || service === "applications") {
      params.push({ hub: "web-development", service });
    } else if (
      service === "paid-search" ||
      service === "paid-social" ||
      service === "content-marketing"
    ) {
      params.push({ hub: "marketing", service });
    } else if (
      service === "offer-strategy" ||
      service === "landing-pages" ||
      service === "lead-scoring"
    ) {
      params.push({ hub: "lead-generation", service });
    } else if (
      service === "pre-production" ||
      service === "production" ||
      service === "post-production"
    ) {
      params.push({ hub: "video-production", service });
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[ServicePackagesPage] Generated ${params.length} static params`, params);
  }

  return params;
}

// =======================================
// Metadata (Next.js 15: await params)
// =======================================
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { hub, service } = await params;
  const config = SERVICE_CONFIG[service];

  if (!config) {
    return {
      title: "Service Packages Not Found",
      description: "The requested service packages could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const hubTitle = hub.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return {
    title: `${config.title} | ${hubTitle} | TBH Digital Solutions`,
    description: config.description,
    alternates: { canonical: `/services/${hub}/${service}/packages` },
    openGraph: {
      title: config.title,
      description: config.subtitle,
      type: "website",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/services/${hub}/${service}/packages`,
    },
    twitter: {
      card: "summary_large_image",
      title: config.title,
      description: config.subtitle,
    },
    robots: { index: true, follow: true },
  };
}

// =======================================
// Page (Next.js 15: await params)
// =======================================
export default async function ServicePackagesPage({ params }: { params: Params }) {
  const { hub, service } = await params;
  const config = SERVICE_CONFIG[service];

  // Optional taxonomy validation (non-fatal)
  try {
    if (typeof getServiceNode === "function") {
      getServiceNode(hub, service);
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[ServicePackagesPage] Taxonomy validation failed for ${hub}/${service}`, err);
    }
    // Continue rendering with SERVICE_CONFIG
  }

  if (!config) return notFound();

  const hubTitle = hub.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const serviceTitle = service.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const packageItems = transformFeaturedData(config.featured);

  // Breadcrumbs
  const breadcrumbs = [
    { label: "Services", href: "/services" },
    { label: hubTitle, href: `/services/${hub}` },
    { label: serviceTitle, href: `/services/${hub}/${service}` },
    { label: "Packages", href: `/services/${hub}/${service}/packages` },
  ];

  // Hero (keep props minimal to match ServiceHero typing)
  const hero = {
    title: config.title,
    subtitle: config.subtitle,
  };

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
          <ServiceHero {...hero} />
          <div className={styles.heroDescription}>
            <p>{config.description}</p>
          </div>
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* FEATURED PACKAGES (3 cards) */}
      {packageItems.length > 0 && (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="surface" padded>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Featured Packages</h2>
              <p className={styles.sectionSubtitle}>
                Our most popular {service.replace(/-/g, " ")} solutions designed to deliver maximum value
              </p>
              <Divider />
            </div>

            <PackageCarousel
              title="Featured Packages"
              subtitle={undefined}
              items={packageItems}
              layout="carousel"
              serviceSlug={config.serviceSlugForFooter}
              showFooterActions={true}
            />
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      )}

      {/* PACKAGE COMPARISON GRID */}
      {packageItems.length > 0 && (
        <FullWidthSection constrained containerSize="wide" padded>
          <Container size="wide" tone="transparent" padded>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Compare Packages</h2>
              <p className={styles.sectionSubtitle}>
                Detailed breakdown of what's included in each tier
              </p>
              <Divider />
            </div>

            <div className={styles.comparisonGrid}>
              {packageItems.map((pkg: any, index: number) => (
                <article key={pkg.id || index} className={styles.comparisonCard}>
                  <div className={styles.comparisonHeader}>
                    <span className={styles.comparisonTier}>
                      {pkg.tier || `Tier ${index + 1}`}
                    </span>
                    <h3 className={styles.comparisonTitle}>{pkg.name}</h3>
                    {pkg.popular && <span className={styles.popularBadge}>Most Popular</span>}
                  </div>

                  <div className={styles.comparisonPrice}>
                    <div className={styles.priceItem}>
                      <span className={styles.priceLabel}>Starting at</span>
                      <span className={styles.priceValue}>
                        {pkg.price?.setup
                          ? `$${Number(pkg.price.setup).toLocaleString()}`
                          : "Contact us"}
                      </span>
                    </div>
                    {pkg.price?.monthly && (
                      <div className={styles.priceItem}>
                        <span className={styles.priceLabel}>Monthly</span>
                        <span className={styles.priceValue}>
                          ${Number(pkg.price.monthly).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={styles.comparisonOutcomes}>
                    <h4 className={styles.outcomeTitle}>What's Included:</h4>
                    <ul className={styles.outcomeList}>
                      {(pkg.highlights || []).slice(0, 5).map((h: string, i: number) => (
                        <li key={i} className={styles.outcomeItem}>
                          <span className={styles.outcomeIcon}>✓</span>
                          <span>{h}</span>
                        </li>
                      ))}
                      {(!pkg.highlights || pkg.highlights.length === 0) && (
                        <li className={styles.outcomeItem}>
                          <span className={styles.outcomeIcon}>✓</span>
                          <span>{pkg.summary || "Complete implementation"}</span>
                        </li>
                      )}
                    </ul>
                  </div>

                  <div className={styles.comparisonFooter}>
                    <a
                      href={pkg.href || `/contact?from=${hub}-${service}-${pkg.id || index}`}
                      className={styles.comparisonCta}
                    >
                      {pkg.ctaLabel || "Learn More"}
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </Container>
          <Divider variant="constrained" />
        </FullWidthSection>
      )}

      {/* FINAL CTA */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="gradient" padded>
          <CTASection
            title="Ready to get started?"
            description={`Let's discuss which ${config.title.replace(" Packages", "").toLowerCase()} solution fits your goals and timeline.`}
            primaryCta={{
              label: "Talk to an Expert",
              href: `/contact?from=${hub}-${service}-packages-cta`,
            }}
            secondaryCta={{ label: "View All Services", href: `/services/${hub}` }}
            style="centered"
          />
        </Container>
      </FullWidthSection>
    </div>
  );
}
