// app/packages/[bundles]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../packages.module.css";

// SSOT (façade)
import { BUNDLES, getBundleBySlug, ADDONS_BY_ID } from "@/data/packages";

// Template (concrete import)
import PackagesDetailTemplate from "@/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate";

// Revalidate every hour (ISR). Adjust as needed.
export const revalidate = 3600;

type Params = { bundles: string };

/** Minimal shape we actually read here (keep page loose-coupled) */
type MinimalBundle = {
  slug: string;
  name?: string;
  title?: string;
  summary?: string;
  subtitle?: string;
  description?: string;
  service?: string;
  primaryService?: string;
  tags?: string[];
  services?: string[];
  seo?: { title?: string; description?: string };
  image?: { src?: string; alt?: string };
  cardImage?: { src?: string; alt?: string };
  addOnRecommendations?: string[];
};

/* -------------------------------------------------------------------------- */
/* Static params for SSG/ISR                                                  */
/* -------------------------------------------------------------------------- */
export function generateStaticParams() {
  return (BUNDLES || [])
    .filter((b: any) => !!b?.slug)
    .map((b: any) => ({ bundles: String(b.slug) }));
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */
export function generateMetadata({ params }: { params: Params }): Metadata {
  const { bundles } = params;
  const bundle = getBundleBySlug(bundles) as MinimalBundle | undefined;

  if (!bundle) {
    return {
      title: "Package not found",
      description: "The requested package could not be found.",
      robots: { index: false },
    };
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
  const toAbsoluteUrl = (src?: string): string | undefined => {
    if (!src) return undefined;
    if (/^https?:\/\//i.test(src)) return src;
    if (!site) return undefined; // no site configured → skip OG image to avoid invalid URL
    return `${site.replace(/\/+$/, "")}/${src.replace(/^\/+/, "")}`;
  };

  const heroTitle =
    bundle.seo?.title ??
    `${(bundle.title ?? bundle.name ?? "Package")} • Integrated Growth Package`;

  const heroDescription =
    bundle.seo?.description ??
    bundle.subtitle ??
    bundle.summary ??
    bundle.description ??
    "Package details";

  const image = bundle.image ?? bundle.cardImage;
  const imageUrl = toAbsoluteUrl(image?.src);

  return {
    title: heroTitle,
    description: heroDescription,
    alternates: { canonical: `/packages/${bundle.slug}` },
    openGraph: {
      title: heroTitle,
      description: heroDescription,
      type: "website",
      url: `/packages/${bundle.slug}`,
      siteName: "TBH Digital",
      ...(imageUrl && {
        images: [{ url: imageUrl, alt: image?.alt || bundle.name || "Package image" }],
      }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: heroTitle,
      description: heroDescription,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function pickRelated(current: MinimalBundle, all: MinimalBundle[], max = 8) {
  const service = current.service ?? current.primaryService;
  const currentSlug = current.slug;
  const currentTags: string[] = current.tags ?? current.services ?? [];

  const byService = all.filter(
    (b) => b.slug !== currentSlug && (b.service ?? b.primaryService) === service,
  );

  if (byService.length >= max) return byService.slice(0, max);

  const byTags = all
    .filter((b) => b.slug !== currentSlug)
    .filter((b) => {
      const tags: string[] = b.tags ?? b.services ?? [];
      return tags.some((t) => currentTags.includes(t));
    });

  const merged: MinimalBundle[] = [...byService];
  for (const r of byTags) {
    if (!merged.find((m) => m.slug === r.slug)) {
      merged.push(r);
    }
    if (merged.length >= max) break;
  }
  return merged.slice(0, max);
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */
export default function PackageDetailPage({ params }: { params: Params }) {
  const { bundles } = params;
  const bundle = getBundleBySlug(bundles) as MinimalBundle | undefined;
  if (!bundle) return notFound();

  // Resolve curated add-ons (safe even if ADDONS_BY_ID is empty)
  const addOns =
    (bundle.addOnRecommendations || [])
      .map((id) => (ADDONS_BY_ID as Record<string, unknown> | undefined)?.[id])
      .filter(Boolean) ?? [];

  // Derive related bundles (fallback heuristic by service/tags)
  const related = pickRelated(bundle, (BUNDLES as unknown as MinimalBundle[]) || [], 8);

  // Optional: inject extra FAQs (beyond bundle.faq)
  const faqs: Array<{ id?: string | number; question: string; answer: string }> = [];

  // NOTE: PackagesDetailTemplate now passes bundle.image.{src,alt} → ServiceHero,
  // so the hero correctly renders the authored image from base.ts.
  return (
    <main className={styles.page} data-route="packages/[bundles]">
      <PackagesDetailTemplate
        bundle={bundle as any}
        related={related as any}
        addOns={addOns as any}
        faqs={faqs}
      />
    </main>
  );
}
