// app/services/[hub]/[service]/[sub]/page.tsx
import React from "react";
import { notFound } from "next/navigation";

import SubServiceTemplate from "@/templates/SubServicePage/SubServiceTemplate";
import type { SubServiceTemplateData } from "@/types/servicesTemplate.types";

import {
  getRootNode,
  getSubServiceNode,
  // If you've added this helper per earlier work, we use it for SSG:
  // (falls back to a safe generator if missing)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - optional import depending on your lib version
  getAllSubServiceParams as _getAllSubServiceParams,
} from "@/lib/services/taxonomy";

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

/**
 * Normalize friendly hub aliases in URLs to the canonical taxonomy slugs.
 * This allows routes like /services/seo/... to resolve to "seo-services".
 */
const HUB_ALIASES: Record<string, string> = {
  seo: "seo-services",
  web: "web-development",
  webdev: "web-development",
  content: "content-production",
  video: "video-production",
  leadgen: "lead-generation",
};

/* =====================================================================
   Data Loader - Level 3 (PricingCallout Only)
   ===================================================================== */
async function loadSubServiceData(
  hub: string,
  service: string,
  sub: string
): Promise<SubServiceTemplateData> {
  try {
    const mod = await import(
      `@/data/page/services-pages/${hub}/${service}/${sub}/index`
    );
    return (mod.default ?? mod) as SubServiceTemplateData;
  } catch {
    // In production, never render placeholders for missing subservice data
    if (process.env.NODE_ENV === "production") {
      notFound();
    }

    // Dev-friendly stub that satisfies SubServiceTemplateData
    const subTitle = toTitle(sub);
    const serviceTitle = toTitle(service);
    const hubTitle = toTitle(hub);

    const fallback: SubServiceTemplateData = {
      kind: "subservice",
      slug: sub as any,
      path: `/services/${hub}/${service}/${sub}`,
      title: subTitle,

      // Minimal hero for SubServiceTemplate (flat structure)
      hero: {
        eyebrow: `${hubTitle} • ${serviceTitle}`,
        title: subTitle,
        subtitle: `Deep-dive into ${subTitle.toLowerCase()}: workflow, deliverables, and results.`,
        ctas: {
          primary: { label: "Get Started", href: "/contact" },
          secondary: { label: "View Process", href: "#workflow" },
        },
      },

      // Optional two-column intro (template will skip if no media)
      twoColVideo: {
        title: `How We Deliver ${subTitle}`,
        description: `Our step-by-step approach ensures ${subTitle.toLowerCase()} is implemented correctly and delivers measurable impact.`,
        cta: { label: "See Our Workflow", href: "#workflow" },
      },

      // Capabilities (kept light at Level 3)
      capabilities: {
        title: "Services & Capabilities",
        subtitle: "Included tasks & adjacent modules",
        description: `Everything included in our ${subTitle.toLowerCase()} delivery, plus optional add-ons.`,
        bullets: [],
        pillars: [],
      },

      // Level-3 specific sections
      workflow: {
        title: "How It Works",
        variant: "timeline",
        steps: [
          {
            title: "Discovery & Planning",
            description: "Assess current state and define success metrics.",
            duration: "Week 1",
          },
          {
            title: "Implementation",
            description: "Execute the strategy with check-ins and adjustments.",
            duration: "Weeks 2–4",
          },
          {
            title: "Optimization & Handoff",
            description: "Fine-tune performance and provide documentation.",
            duration: "Week 5",
          },
        ],
      },

      scope: {
        title: "Scope & Deliverables",
        includes: [
          "Initial assessment and strategy",
          "Implementation and setup",
          "Testing and optimization",
          "Documentation and training",
        ],
        deliverables: [
          "Complete implementation",
          "Performance reports",
          "Best practices guide",
          "Maintenance recommendations",
        ],
        addons: ["Extended optimization", "Additional training", "Custom dashboard"],
      },

      results: {
        title: "Typical Results",
        items: [
          { label: "Implementation Time", value: "2–4 weeks", sublabel: "average" },
          { label: "Performance Improvement", value: "25–50%", sublabel: "typical range" },
          { label: "Client Satisfaction", value: "98%", sublabel: "surveyed" },
        ],
      },

      // 💲 Level-3 pricing uses PricingCallout (NOT PricingSection)
      pricingCallout: {
        variant: "addon",
        label: `Add-on pricing for ${subTitle}`,
        amount: "Custom",
        note: "This subservice can be added to any package. Contact us for an exact quote.",
        cta: { label: "Contact Sales", href: "/contact" },
      },

      // (Optional) small portfolio slot for 1–2 tactical examples
      portfolio: {
        title: `${subTitle} Examples`,
        items: [],
      },

      // Final CTA (focused, tactical)
      cta: {
        title: `Ready to Get Started with ${subTitle}?`,
        subtitle: "Let's discuss your specific requirements.",
        description: `See how our ${subTitle.toLowerCase()} can solve your challenges and drive results.`,
        primaryCta: { label: "Start Your Project", href: "/contact" },
        secondaryCta: { label: "View Portfolio", href: `/portfolio?service=${service}` },
        layout: "centered",
        backgroundType: "gradient",
      },

      // SEO metadata (matches flat hero structure)
      seo: {
        title: `${subTitle} — ${serviceTitle} • ${hubTitle}`,
        description: `Explore ${subTitle.toLowerCase()}: workflow, scope, results, and a simple pricing callout.`,
        canonical: `/services/${hub}/${service}/${sub}`,
        keywords: [subTitle.toLowerCase(), serviceTitle.toLowerCase(), hubTitle.toLowerCase()],
      },
    };

    if (process.env.NODE_ENV === "development") {
      console.warn(`[SubServicePage] Using fallback data for ${hub}/${service}/${sub}`);
    }
    return fallback;
  }
}

/* =====================================================================
   Static Site Generation
   ===================================================================== */
export async function generateStaticParams() {
  // Prefer the dedicated helper (includes services that live under subhubs)
  if (typeof _getAllSubServiceParams === "function") {
    try {
      return _getAllSubServiceParams();
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[SubServicePage] getAllSubServiceParams failed; falling back.", e);
      }
    }
  }

  // Fallback: walk the tree (direct hub -> service -> subservice only)
  try {
    const root = getRootNode();
    const hubs = root.children ?? [];
    const params: Array<{ hub: string; service: string; sub: string }> = [];

    for (const h of hubs) {
      for (const s of h.children ?? []) {
        for (const ss of s.children ?? []) {
          params.push({ hub: String(h.slug), service: String(s.slug), sub: String(ss.slug) });
        }
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`[SubServicePage] Generated ${params.length} params (fallback)`);
    }
    return params;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[SubServicePage] Error generating static params:", error);
    }
    return [];
  }
}

/* =====================================================================
   Metadata Generation (Next.js 15: await params)
   ===================================================================== */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string; service: string; sub: string }>;
}) {
  const { hub, service, sub } = await params;
  const canonicalHub = HUB_ALIASES[hub] ?? hub;

  try {
    const node = getSubServiceNode(canonicalHub, service, sub);
    const data = await loadSubServiceData(canonicalHub, service, sub);

    const title =
      data.seo?.title ??
      data.hero?.title ??
      `${toTitle(sub)} — ${toTitle(service)} • ${toTitle(canonicalHub)}`;

    const description =
      data.seo?.description ??
      data.hero?.subtitle ??
      `Deep dive into ${node.title}: workflow, scope & deliverables, results, and pricing callout.`;

    const canonical = data.seo?.canonical ?? `/services/${canonicalHub}/${service}/${sub}`;
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${canonical}`;

    const keywords = Array.isArray(data.seo?.keywords)
      ? data.seo.keywords.join(", ")
      : `${toTitle(sub).toLowerCase()}, ${toTitle(service).toLowerCase()}, ${toTitle(
          canonicalHub
        ).toLowerCase()}, implementation`;

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
        card: "summary_large_image",
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
      },
    };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[SubServicePage] Error generating metadata for ${hub}/${service}/${sub}:`,
        error
      );
    }
    return {
      title: `${toTitle(sub)} — ${toTitle(service)} • ${toTitle(canonicalHub)}`,
      description: "Subservice details.",
      alternates: { canonical: `/services/${canonicalHub}/${service}/${sub}` },
    };
  }
}

/* =====================================================================
   Page Component - Level 3 (PricingCallout Only) | Next.js 15: await params
   ===================================================================== */
export default async function SubServicePage({
  params,
}: {
  params: Promise<{ hub: string; service: string; sub: string }>;
}) {
  const { hub, service, sub } = await params;
  const canonicalHub = HUB_ALIASES[hub] ?? hub;

  // Validate subservice exists in taxonomy
  let node;
  try {
    node = getSubServiceNode(canonicalHub, service, sub);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[SubServicePage] SubService not found: ${canonicalHub}/${service}/${sub}`,
        error
      );
    }
    notFound();
  }

  // Load subservice data (dev fallback, prod 404)
  const data = await loadSubServiceData(canonicalHub, service, sub);

  // Dev diagnostics (optional)
  if (process.env.NODE_ENV === "development") {
    console.log(`[SubServicePage] ${canonicalHub}/${service}/${sub}`, {
      hasHero: !!data.hero,
      hasTwoCol: !!data.twoColVideo,
      hasCapabilities: !!data.capabilities,
      hasWorkflow: !!data.workflow,
      hasScope: !!data.scope,
      hasResults: !!data.results,
      hasPricingCallout: !!(data as any).pricingCallout, // Level 3 should have this
      hasPricingSection: false, // Level 3 should NOT have full pricing tiers
      hasPortfolio: !!(data as any).portfolio,
      hasCta: !!data.cta,
    });
  }

  return <SubServiceTemplate node={node} data={data} />;
}
