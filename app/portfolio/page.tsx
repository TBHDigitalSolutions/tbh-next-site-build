// /app/portfolio/page.tsx
// Production-ready Hub page - Template architecture implementation

import React from 'react';
import type { Metadata } from 'next';
import { PortfolioHubTemplate } from '@/portfolio/templates';
import { adaptSectionsForHub } from '@/portfolio/lib/adapters';
import { getAllFeaturedByCategory } from '@/data/portfolio';

// SEO Metadata (preserve existing structure)
export const metadata: Metadata = {
  title: "Portfolio | TBH Digital Solutions - Real Results Across All Services",
  description: "Explore our portfolio across web development, video production, SEO services, content production, lead generation, and marketing automation. Real results, proven strategies.",
  keywords: [
    "portfolio",
    "web development",
    "video production", 
    "SEO services",
    "content production",
    "lead generation",
    "marketing automation",
    "digital marketing",
    "case studies"
  ],
  openGraph: {
    title: "Portfolio | TBH Digital Solutions",
    description: "Real results across web development, video production, SEO, and marketing automation.",
    images: [
      {
        url: "/og-images/portfolio-hub.jpg",
        width: 1200,
        height: 630,
        alt: "TBH Digital Solutions Portfolio"
      }
    ],
    type: "website",
    url: "/portfolio"
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio | TBH Digital Solutions",
    description: "Real results across web development, video production, SEO, and marketing automation.",
    images: ["/og-images/portfolio-hub.jpg"]
  },
  alternates: { 
    canonical: "/portfolio" 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
};

// JSON-LD structured data (preserve existing)
const portfolioStructuredData = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Portfolio | TBH Digital Solutions",
  "description": "Portfolio showcasing web development, video production, SEO services, content production, lead generation, and marketing automation projects.",
  "url": "https://tbhdigitalsolutions.com/portfolio",
  "mainEntity": {
    "@type": "ItemList",
    "name": "Portfolio Categories",
    "numberOfItems": 6,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Web Development",
        "url": "https://tbhdigitalsolutions.com/portfolio/web-development"
      },
      {
        "@type": "ListItem", 
        "position": 2,
        "name": "Video Production",
        "url": "https://tbhdigitalsolutions.com/portfolio/video-production"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "SEO Services", 
        "url": "https://tbhdigitalsolutions.com/portfolio/seo-services"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Marketing Services",
        "url": "https://tbhdigitalsolutions.com/portfolio/marketing-services"
      },
      {
        "@type": "ListItem",
        "position": 5,
        "name": "Content Production",
        "url": "https://tbhdigitalsolutions.com/portfolio/content-production"
      },
      {
        "@type": "ListItem",
        "position": 6,
        "name": "Lead Generation",
        "url": "https://tbhdigitalsolutions.com/portfolio/lead-generation"
      }
    ]
  },
  "provider": {
    "@type": "Organization",
    "name": "TBH Digital Solutions",
    "url": "https://tbhdigitalsolutions.com"
  }
};

export default async function PortfolioHubPage() {
  // 1) Fetch raw data using data facade
  const rawSections = getAllFeaturedByCategory();

  // 2) Normalize using domain adapter
  const sections = adaptSectionsForHub(rawSections);

  // 3) Render template with proper configuration
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioStructuredData) }}
      />

      <PortfolioHubTemplate
        sections={sections}
        meta={{
          title: "Portfolio",
          subtitle: "Real results across web development, video production, SEO, content creation, lead generation, and marketing automation.",
          heroButton: { 
            text: "Start Your Project", 
            href: "/contact" 
          }
        }}
        features={{
          showSearch: true,
          showOverview: true,
          showCTA: true
        }}
        analytics={{
          context: "portfolio_hub",
          trackSectionViews: true
        }}
      />
    </>
  );
}