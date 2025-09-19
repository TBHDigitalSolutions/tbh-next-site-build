// app/services/[hub]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import HubTemplate from "@/templates/HubPage/HubTemplate";
import type { HubTemplateData } from "@/types/servicesTemplate.types";
import { getRootNode, getHubNode } from "@/lib/services/taxonomy";

export const revalidate = 60; // ISR

/* =====================================================================
   Utilities
   ===================================================================== */
function toTitle(slug: string): string {
  return slug
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/* =====================================================================
   Data Loader - Level 1 (Navigation Only)
   ===================================================================== */
async function loadHubData(hub: string): Promise<HubTemplateData> {
  try {
    const mod = await import(`@/data/page/services-pages/${hub}/index`);
    return (mod.default ?? mod) as HubTemplateData;
  } catch {
    // In production, never render placeholders for missing hub data
    if (process.env.NODE_ENV === "production") {
      notFound();
    }

    // Dev-friendly stub that satisfies HubTemplateData (Level 1 only)
    const hubTitle = toTitle(hub);
    const fallback: HubTemplateData = {
      kind: "hub",
      slug: hub as any,
      path: `/services/${hub}`,
      title: hubTitle,

      // Hero section (required)
      hero: {
        id: `${hub}-hub-hero`,
        background: {
          type: "image",
          src: `/pages/services-page/${hub}/hero/${hub}-hero.jpg`,
          alt: `${hubTitle} services hero`,
        },
        content: {
          title: `${hubTitle} Services`,
          subtitle: `Explore ${hubTitle.toLowerCase()} services, capabilities, and case studies tailored to drive growth.`,
          primaryCta: { label: "Get Started", href: "/contact" },
        },
      },

      // Optional, flexible section bucket
      sections: {},

      // Directory-only: NO PRICING at hub level
      capabilities: {
        title: "Services & Capabilities",
        description: `Comprehensive ${hubTitle.toLowerCase()} solutions designed to achieve your goals.`,
        bullets: [], // HubTemplate auto-populates from taxonomy children
        pillars: [],
      },

      // Service cards (auto-populated)
      serviceCards: {
        title: "Explore Services",
        items: [], // HubTemplate auto-populates from taxonomy children
      },

      // Final CTA (NO pricing references)
      cta: {
        title: `Ready to Scale Your ${hubTitle}?`,
        subtitle: "Let's build a strategy tailored to your goals.",
        description: `Get a custom ${hubTitle.toLowerCase()} plan that delivers measurable, sustainable growth.`,
        primaryCta: { label: "Start Your Strategy Session", href: "/contact" },
        secondaryCta: { label: "View Portfolio", href: `/portfolio?hub=${hub}` },
        layout: "centered",
        backgroundType: "gradient",
      },

      // SEO metadata
      seo: {
        title: `${hubTitle} Services`,
        description: `Explore ${hubTitle} services, capabilities, and case studies.`,
        canonical: `/services/${hub}`,
        keywords: [hubTitle.toLowerCase(), "services", "capabilities", "case studies"],
      },
    };

    if (process.env.NODE_ENV === "development") {
      console.warn(`[HubPage] Using fallback data for ${hub}`);
    }
    return fallback;
  }
}

/* =====================================================================
   Static Site Generation
   ===================================================================== */
export async function generateStaticParams() {
  try {
    const root = getRootNode();
    const hubs = root.children ?? [];
    const params = hubs.map((n) => ({ hub: n.slug }));

    if (process.env.NODE_ENV === "development") {
      console.log(`[HubPage] Generated ${params.length} hub params:`, params.map(p => p.hub));
    }
    return params;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[HubPage] Error generating static params:", error);
    }
    return [];
  }
}

/* =====================================================================
   Metadata Generation
   ===================================================================== */
export async function generateMetadata({ params }: { params: { hub: string } }) {
  const { hub } = params;

  try {
    const node = getHubNode(hub);
    const data = await loadHubData(hub);

    const title =
      data.seo?.title ??
      data.hero?.content?.title ??
      `${node.title} Services`;

    const description =
      data.seo?.description ??
      data.hero?.content?.subtitle ??
      `Explore ${node.title} services, capabilities, and case studies.`;

    const canonical = data.seo?.canonical ?? `/services/${hub}`;
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${canonical}`;

    // Enhanced keywords from array
    const keywords = Array.isArray(data.seo?.keywords) 
      ? data.seo.keywords.join(", ")
      : `${node.title.toLowerCase()}, services, capabilities, business solutions`;

    return {
      title,
      description,
      keywords,
      alternates: { canonical },
      openGraph: { 
        title, 
        description, 
        url, 
        type: "website",
        siteName: process.env.NEXT_PUBLIC_SITE_NAME ?? "TBH Digital Solutions",
      },
      twitter: { 
        title, 
        description, 
        card: "summary_large_image" 
      },
      robots: { 
        index: true, 
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[HubPage] Error generating metadata for ${hub}:`, error);
    }
    return {
      title: "Services",
      description: "Explore our services.",
      alternates: { canonical: `/services/${hub}` },
    };
  }
}

/* =====================================================================
   Page Component - Level 1 (Navigation Only)
   ===================================================================== */
export default async function HubPage({ params }: { params: { hub: string } }) {
  const { hub } = params;

  // Validate hub exists in taxonomy
  let node;
  try {
    node = getHubNode(hub);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[HubPage] Hub not found: ${hub}`, error);
    }
    notFound();
  }

  // Load hub data (dev fallback, prod 404)
  const data = await loadHubData(hub);

  // Development debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[HubPage] ${hub}`, {
      hasHero: !!data.hero,
      hasCapabilities: !!data.capabilities,
      hasServiceCards: !!data.serviceCards,
      hasCta: !!data.cta,
      // Verify Level 1 compliance
      hasPricing: false, // Should always be false
      hasModules: !!data.modules,
      hasPortfolio: !!data.portfolio,
      hasFaq: !!data.faq,
    });
  }

  // Render with HubTemplate (Level 1 - NO PRICING)
  return <HubTemplate node={node} data={data} />;
}