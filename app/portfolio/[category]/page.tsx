// /app/portfolio/[category]/page.tsx
// Production-ready Category page - Template architecture implementation

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortfolioCategoryTemplate } from "@/portfolio/templates";
import { adaptCategoryPageData } from "@/portfolio/lib/adapters";
import { CATEGORY_SLUGS, CATEGORY_COMPONENTS, type CategorySlug } from "@/portfolio/lib/types";
import { getCategoryBundle } from "@/data/portfolio";

// Generate static params for all categories
export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }));
}

// Category keyword mapping for SEO
const CATEGORY_KEYWORDS: Record<CategorySlug, string[]> = {
  "web-development": [
    "web development",
    "website design",
    "e-commerce",
    "responsive design",
    "performance optimization",
  ],
  "video-production": [
    "video production",
    "video marketing",
    "product demos",
    "brand storytelling",
    "video content",
  ],
  "seo-services": [
    "SEO services",
    "search engine optimization",
    "organic traffic",
    "keyword rankings",
    "local SEO",
  ],
  "marketing-services": [
    "marketing services",
    "digital marketing",
    "marketing automation",
    "email marketing",
    "lead nurturing",
  ],
  "content-production": [
    "content marketing",
    "content strategy",
    "blog writing",
    "thought leadership",
    "content creation",
  ],
  "lead-generation": [
    "lead generation",
    "B2B leads",
    "conversion optimization",
    "landing pages",
    "lead magnets",
  ],
};

// Dynamic metadata generation
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const categorySlug = category as CategorySlug;

  if (!CATEGORY_SLUGS.includes(categorySlug)) {
    return {
      title: "Portfolio Category Not Found",
      description: "The requested portfolio category could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const categoryConfig = CATEGORY_COMPONENTS[categorySlug];
  const categoryTitle = categoryConfig.label;

  const title = `${categoryTitle} Portfolio | TBH Digital Solutions`;
  const description = `Explore our ${categoryTitle.toLowerCase()} portfolio featuring real projects with proven results. ${categoryConfig.description}`;

  return {
    title,
    description,
    keywords: [
      categoryTitle.toLowerCase(),
      "portfolio",
      "case studies",
      "digital marketing",
      "results",
      "TBH Digital Solutions",
      ...CATEGORY_KEYWORDS[categorySlug],
    ],
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/og-images/portfolio-${categorySlug}.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryTitle} Portfolio - TBH Digital Solutions`,
        },
      ],
      type: "website",
      url: `/portfolio/${categorySlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/og-images/portfolio-${categorySlug}.jpg`],
    },
    alternates: { canonical: `/portfolio/${categorySlug}` },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// JSON-LD structured data helper
function generateStructuredData(
  categorySlug: CategorySlug,
  categoryTitle: string,
  itemCount: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryTitle} Portfolio`,
    "description": `Portfolio showcasing ${categoryTitle.toLowerCase()} projects and case studies`,
    "url": `https://tbhdigitalsolutions.com/portfolio/${categorySlug}`,
    "mainEntity": {
      "@type": "ItemList",
      "name": `${categoryTitle} Projects`,
      "numberOfItems": itemCount,
      "itemListElement": {
        "@type": "CreativeWork",
        "name": `${categoryTitle} Portfolio Items`,
        "description": `Collection of ${itemCount} ${categoryTitle.toLowerCase()} projects`,
      },
    },
    "provider": {
      "@type": "Organization",
      "name": "TBH Digital Solutions",
      "url": "https://tbhdigitalsolutions.com",
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://tbhdigitalsolutions.com",
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Portfolio",
          "item": "https://tbhdigitalsolutions.com/portfolio",
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryTitle,
          "item": `https://tbhdigitalsolutions.com/portfolio/${categorySlug}`,
        },
      ],
    },
  };
}

export default async function PortfolioCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const categorySlug = category as CategorySlug;

  // Validate category slug
  if (!CATEGORY_SLUGS.includes(categorySlug)) {
    notFound();
  }

  const categoryConfig = CATEGORY_COMPONENTS[categorySlug];

  // 1) Fetch raw data using data facade
  const rawCategoryData = await getCategoryBundle(categorySlug);

  // 2) Normalize using domain adapter
  const categoryPageData = adaptCategoryPageData(rawCategoryData);

  // Generate structured data
  const structuredData = generateStructuredData(
    categorySlug,
    categoryConfig.label,
    categoryPageData.items.length
  );

  // 3) Render template with proper configuration
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <PortfolioCategoryTemplate
        category={categorySlug}
        title={categoryConfig.label}
        subtitle={`Professional ${categoryConfig.label.toLowerCase()} with proven results. ${categoryConfig.description}`}
        data={categoryPageData}
        layout={{
          showTools: true,
          showCaseStudies: true,
          showPackages: true
        }}
        analytics={{
          context: `portfolio_category_${categorySlug}`,
          trackItemViews: true
        }}
      />
    </>
  );
}