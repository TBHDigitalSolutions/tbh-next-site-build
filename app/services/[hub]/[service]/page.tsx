// app/services/[hub]/[service]/page.tsx
import React from "react";
import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import ServiceTemplate from "@/templates/ServicePage/ServiceTemplate";
import type { ServiceTemplateData } from "@/types/servicesTemplate.types";

// ✅ Taxonomy helpers (finalized)
import {
  getAllServiceParams,
  getServiceNodeDeep,
  getHubNode,
} from "@/lib/services/taxonomy";
import type { AnyServiceNode } from "@/types/servicesTaxonomy.types";

export const revalidate = 60; // ISR

/* =====================================================================
   Hub aliases → canonical slugs
   ===================================================================== */
const HUB_ALIASES: Record<string, string> = {
  seo: "seo-services",
  web: "web-development",
  webdev: "web-development",
  content: "content-production",
  video: "video-production",
  leadgen: "lead-generation",
  "lead-gen": "lead-generation",
};

/* =====================================================================
   Small utils
   ===================================================================== */
function startCase(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function canonicalizeHub(hub: string): string {
  return HUB_ALIASES[hub] ?? hub;
}

/* =====================================================================
   Data loader with safe fallback
   ===================================================================== */
async function loadServiceData(
  hub: string,
  service: string
): Promise<ServiceTemplateData> {
  try {
    // Content modules live next to your service pages:
    // /src/data/page/services-pages/{hub}/{service}/index.(ts|tsx)
    const mod = await import(
      `@/data/page/services-pages/${hub}/${service}/index`
    );
    return (mod.default ?? mod) as ServiceTemplateData;
  } catch (error) {
    const serviceTitle = startCase(service);
    const hubTitle = startCase(hub);

    if (process.env.NODE_ENV === "development") {
      console.warn(`[ServicePage] Fallback content for ${hub}/${service}`, error);
    }

    // ⚠️ Fallback conforms exactly to ServiceTemplateData
    const fallback: ServiceTemplateData = {
      kind: "service",
      slug: service as any,
      path: `/services/${hub}/${service}`,
      title: serviceTitle,

      hero: {
        id: `${service}-hero`,
        background: {
          type: "image",
          src: `/pages/services-page/${hub}/${service}/hero/${service}-hero.jpg`,
          alt: `${serviceTitle} service hero`,
        },
        content: {
          eyebrow: hubTitle,
          title: serviceTitle,
          subtitle: `Comprehensive ${serviceTitle.toLowerCase()} solutions designed to drive measurable, sustainable results for your business.`,
          primaryCta: {
            label: "Get Started",
            href: "/contact",
            ariaLabel: `Start your ${serviceTitle.toLowerCase()} project`,
          },
          secondaryCta: {
            label: "View Process",
            href: "#capabilities",
            ariaLabel: `Learn about our ${serviceTitle.toLowerCase()} process`,
          },
        },
      },

      sections: {
        twoColVideo: {
          id: `${service}-intro-video`,
          title: `How We Deliver ${serviceTitle}`,
          description: `Our proven approach combines strategy, implementation, and optimization to ensure your ${serviceTitle.toLowerCase()} goals are achieved efficiently and effectively.\n\nFrom initial consultation to final delivery, we focus on measurable results and long-term success.`,
          cta: { label: "See Our Capabilities", href: "#capabilities" },
          // No video src → component will gracefully skip rendering media
        },
      },

      capabilities: {
        title: "Services & Capabilities",
        description: `Everything you need for successful ${serviceTitle.toLowerCase()} implementation and growth.`,
        bullets: [],
        pillars: [],
        ctas: {
          primary: { label: "Get Started", href: "/contact" },
          secondary: { label: "View Portfolio", href: "#portfolio" },
        },
      },

      serviceCards: {
        title: "Related Services",
        subtitle: "Explore complementary solutions",
        items: [],
      },

      pricing: undefined,

      portfolio: {
        title: `${serviceTitle} Portfolio`,
        subtitle: "See our work in action",
        items: [],
      },

      faq: {
        title: "Frequently Asked Questions",
        subtitle: `Common questions about our ${serviceTitle.toLowerCase()} service`,
        faqs: [
          {
            id: "timeline",
            question: `How long does ${serviceTitle.toLowerCase()} implementation take?`,
            answer:
              "Timeline varies based on project scope and complexity. We'll provide a detailed timeline during our initial consultation.",
            category: "Timeline",
          },
          {
            id: "process",
            question: "What does your process look like?",
            answer:
              "We follow a proven methodology: discovery, strategy, implementation, testing, and optimization. Each phase includes client collaboration and feedback.",
            category: "Process",
          },
          {
            id: "support",
            question: "What kind of support do you provide?",
            answer:
              "All projects include 30 days of post-launch support, plus ongoing maintenance options to ensure continued success.",
            category: "Support",
          },
        ],
      },

      cta: {
        title: `Ready to Get Started with ${serviceTitle}?`,
        subtitle: "Let's discuss your specific needs and goals.",
        description: `Contact us to learn how our ${serviceTitle.toLowerCase()} service can help you achieve measurable results and drive sustainable growth.`,
        primaryCta: {
          label: "Start Your Project",
          href: "/contact",
          ariaLabel: `Begin your ${serviceTitle.toLowerCase()} project`,
        },
        secondaryCta: {
          label: "View Pricing",
          href: `/pricing#${hub}`,
          ariaLabel: `See ${serviceTitle.toLowerCase()} pricing options`,
        },
        layout: "centered",
        backgroundType: "gradient",
      },

      seo: {
        title: `${serviceTitle} Services | ${hubTitle}`,
        description: `Professional ${serviceTitle.toLowerCase()} services designed to drive results. Explore our capabilities, process, and case studies.`,
        canonical: `/services/${hub}/${service}`,
        keywords: [
          serviceTitle.toLowerCase(),
          hubTitle.toLowerCase(),
          "services",
          "professional",
        ],
      },
    };

    return fallback;
  }
}

/* =====================================================================
   Mis-leveled L2 → L3 canonical resolver
   ===================================================================== */
/**
 * If `maybeSubSlug` is actually a sub-service slug somewhere under the hub,
 * return its canonical L3 path: /services/{hub}/{parentService}/{maybeSubSlug}
 * Otherwise return null.
 */
async function resolveAsSubserviceCanonical(
  hub: string,
  maybeSubSlug: string
): Promise<string | null> {
  try {
    const hubNode = getHubNode(hub); // throws if hub unknown

    for (const child of hubNode.children ?? []) {
      // Direct L2 "service" under the hub
      if (child.kind === "service") {
        for (const ss of child.children ?? []) {
          if (ss.kind === "subservice" && ss.slug === maybeSubSlug) {
            return `/services/${hub}/${child.slug}/${ss.slug}`;
          }
        }
      }

      // L2 "subhub" → contains L2B "service" → contains L3 "subservice"
      if (child.kind === "subhub") {
        for (const svc of child.children ?? []) {
          if (svc.kind === "service") {
            for (const ss of svc.children ?? []) {
              if (ss.kind === "subservice" && ss.slug === maybeSubSlug) {
                return `/services/${hub}/${svc.slug}/${ss.slug}`;
              }
            }
          }
        }
      }
    }
  } catch {
    // swallow — caller will handle 404 via taxonomy validation
  }
  return null;
}

/* =====================================================================
   Static Site Generation
   ===================================================================== */
// 🧭 Only generate pages for actual "service" nodes (including L2B services)
export async function generateStaticParams() {
  const all = getAllServiceParams(); // → Array<{ hub: string; service: string }>
  if (process.env.NODE_ENV === "development") {
    console.log(`[ServicePage] SSG params (services): ${all.length}`);
  }
  return all;
}

/* =====================================================================
   Metadata (Next.js 15: await params)
   ===================================================================== */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string; service: string }>;
}): Promise<Metadata> {
  const { hub, service } = await params; // Next.js 15
  const canonicalHub = canonicalizeHub(hub);

  try {
    // Validate node (deep lookup tolerates sub-hubs)
    const node = getServiceNodeDeep(canonicalHub, service);
    const data = await loadServiceData(canonicalHub, service);

    const title =
      data.seo?.title ??
      data.hero?.content?.title ??
      `${startCase(service)} — ${startCase(canonicalHub)}`;

    const description =
      data.seo?.description ??
      data.hero?.content?.subtitle ??
      `Explore ${node.title} under ${startCase(canonicalHub)}: capabilities, process, and results.`;

    const canonical = data.seo?.canonical ?? `/services/${canonicalHub}/${service}`;

    const keywords =
      (Array.isArray(data.seo?.keywords) ? data.seo?.keywords : undefined) ??
      [
        startCase(service).toLowerCase(),
        startCase(canonicalHub).toLowerCase(),
        "services",
        "professional",
        "business",
      ];

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
    const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "TBH Digital Solutions";

    return {
      title,
      description,
      keywords,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: `${siteUrl}${canonical}`,
        type: "website",
        siteName,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
      },
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ServicePage] Metadata fallback for ${hub}/${service}`, err);
    }
    const fallbackCanonical = `/services/${canonicalHub}/${service}`;
    return {
      title: `${startCase(service)} Services`,
      description: `Professional ${startCase(service).toLowerCase()} services and solutions.`,
      alternates: { canonical: fallbackCanonical },
    };
  }
}

/* =====================================================================
   Page (Next.js 15: await params)
   ===================================================================== */
export default async function ServicePage({
  params,
}: {
  params: Promise<{ hub: string; service: string }>;
}) {
  const { hub, service } = await params; // Next.js 15
  const canonicalHub = canonicalizeHub(hub);

  // 🧭 Auto-canonicalize mis-leveled L2 hits to L3 if `service` is actually a subservice
  const misleveled = await resolveAsSubserviceCanonical(canonicalHub, service);
  if (misleveled) {
    // SEO-friendly permanent redirect to the canonical L3 path.
    // (If you want an explicit 308, use `permanentRedirect` instead.)
    redirect(misleveled);
  }

  // Validate taxonomy node (deep) or 404
  let node: AnyServiceNode;
  try {
    node = getServiceNodeDeep(canonicalHub, service);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[ServicePage] Service not found: ${canonicalHub}/${service}`, err);
    }
    notFound();
  }

  // Load content data (with fallbacks)
  const data = await loadServiceData(canonicalHub, service);

  if (process.env.NODE_ENV === "development") {
    console.log(`[ServicePage] Rendering ${canonicalHub}/${service}`, {
      nodeTitle: (node as AnyServiceNode).title,
      hasHero: Boolean(data.hero),
      hasPricing: Boolean(data.pricing),
      hasPortfolio: Boolean(data.portfolio),
      hasFaq: Boolean(data.faq),
      hasCapabilities: Boolean(data.capabilities),
    });
  }

  return <ServiceTemplate node={node} data={data} />;
}
