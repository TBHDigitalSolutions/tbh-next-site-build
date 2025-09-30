// app/packages/[bundles]/page.tsx
// app/packages/[bundles]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../packages.module.css";

// SSOT (façade)
import { BUNDLES, getBundleBySlug, ADDONS_BY_ID } from "@/data/packages";

// Template (concrete import)
import PackagesDetailTemplate from "@/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate";

// Revalidate every hour (ISR)
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
  services?: string[]; // legacy alt for tags
  seo?: { title?: string; description?: string };
  image?: { src?: string; alt?: string };
  cardImage?: { src?: string; alt?: string };
  addOnRecommendations?: string[];
};

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
const abs = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (!SITE) return undefined;
  return `${SITE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
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
      robots: { index: false, follow: false },
    };
  }

  const heroTitle =
    bundle.seo?.title ??
    `${bundle.title ?? bundle.name ?? "Package"} • Integrated Growth Package`;

  const heroDescription =
    bundle.seo?.description ??
    bundle.subtitle ??
    bundle.summary ??
    bundle.description ??
    "Package details";

  const image = bundle.image ?? bundle.cardImage;
  const imageUrl = abs(image?.src);
  const canonicalPath = `/packages/${bundle.slug}`;
  const canonicalUrl = abs(canonicalPath);

  return {
    title: heroTitle,
    description: heroDescription,
    alternates: { canonical: canonicalUrl ?? canonicalPath },
    openGraph: {
      title: heroTitle,
      description: heroDescription,
      type: "website",
      url: canonicalUrl ?? canonicalPath,
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

  // 1) Same service first
  const sameService = all.filter(
    (b) => b.slug !== currentSlug && (b.service ?? b.primaryService) === service,
  );

  // 2) Then tag overlap, weighted by intersection size
  const byTagOverlap = all
    .filter((b) => b.slug !== currentSlug)
    .map((b) => {
      const tags = b.tags ?? b.services ?? [];
      const score = tags.filter((t) => currentTags.includes(t)).length;
      return { b, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, z) => z.score - a.score)
    .map(({ b }) => b);

  // Merge (preserve order, de-dupe)
  const merged: MinimalBundle[] = [];
  for (const r of [...sameService, ...byTagOverlap]) {
    if (!merged.find((m) => m.slug === r.slug)) merged.push(r);
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

  // NOTE: PackagesDetailTemplate passes bundle.image.{src,alt} → ServiceHero,
  // ensuring the hero renders the authored image from base.ts / registry.
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
