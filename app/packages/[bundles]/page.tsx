// app/packages/[bundles]/page.tsx
/**
 * Package Detail Route (App Router)
 * =============================================================================
 * Server component that:
 *  1) Resolves a package/bundle by slug from the data façade (`@/data/packages`)
 *  2) Generates SEO metadata (OpenGraph / Twitter / canonical)
 *  3) Renders the production-ready <PackagesDetailTemplate />
 *
 * Design goals
 * - Keep this file **loose-coupled**: it uses a minimal shape (no Zod/schemas here).
 *   Validation already happens in the content pipeline at build time.
 * - Only compose + pass data to the template. All UI logic lives in the template
 *   and its child components.
 * - Make metadata robust even when optional fields are missing.
 *
 * Scaling
 * - If you adopt a **registry manifest** (validated packages aggregated at build),
 *   you can replace `getBundleBySlug` with a typed lookup. This file will not
 *   change substantially (by design).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../packages.module.css";

/* ----------------------------------------------------------------------------
 * Data façade (SSOT for runtime reads)
 *  - BUNDLES: array of bundles (loose domain shape)
 *  - getBundleBySlug: lookup helper
 *  - ADDONS_BY_ID: curated add-ons map for the CTA rail section
 * -------------------------------------------------------------------------- */
import { BUNDLES, getBundleBySlug, ADDONS_BY_ID } from "@/data/packages";

/* ----------------------------------------------------------------------------
 * Concrete template for package detail pages
 * -------------------------------------------------------------------------- */
import PackagesDetailTemplate from "@/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate";

/* ----------------------------------------------------------------------------
 * ISR (Incremental Static Regeneration)
 *   Revalidate this page every hour. Adjust as needed for your update cadence.
 * -------------------------------------------------------------------------- */
export const revalidate = 60 * 60;

/* ----------------------------------------------------------------------------
 * Route params
 * -------------------------------------------------------------------------- */
type Params = { bundles: string };

/* ----------------------------------------------------------------------------
 * Minimal bundle shape used by THIS route
 *  - Intentionally **not** importing heavy types or schemas here
 *  - Only fields read in this file are typed
 * -------------------------------------------------------------------------- */
type MinimalBundle = {
  slug: string;

  // Headline & summary
  name?: string;
  title?: string;
  summary?: string;
  subtitle?: string;
  description?: string;

  // Taxonomy
  service?: string;
  primaryService?: string;
  tags?: string[];
  services?: string[]; // legacy alt

  // SEO + hero/card art
  seo?: { title?: string; description?: string };
  image?: { src?: string; alt?: string };
  cardImage?: { src?: string; alt?: string };

  // Rails
  addOnRecommendations?: string[];
};

/* ----------------------------------------------------------------------------
 * Absolute URL builder for metadata (respects NEXT_PUBLIC_SITE_URL)
 *  - Returns undefined when no SITE is set; Next.js will fall back to relative
 * -------------------------------------------------------------------------- */
const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "").trim();
const abs = (path?: string) => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  if (!SITE) return undefined;
  return `${SITE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

/* ----------------------------------------------------------------------------
 * Static params for SSG/ISR
 *  - Keeps this route prebuilt for all known slugs in the façade
 * -------------------------------------------------------------------------- */
export function generateStaticParams() {
  return (BUNDLES || [])
    .filter((b: any) => !!b?.slug)
    .map((b: any) => ({ bundles: String(b.slug) }));
}

/* ----------------------------------------------------------------------------
 * Metadata (SEO)
 *  - Builds robust OG/Twitter tags
 *  - Uses authored SEO first, then falls back to sensible defaults
 * -------------------------------------------------------------------------- */
export function generateMetadata({ params }: { params: Params }): Metadata {
  const slug = (params.bundles || "").trim();
  const bundle = getBundleBySlug(slug) as MinimalBundle | undefined;

  if (!bundle) {
    // Non-existent page. Let search engines know not to index.
    return {
      title: "Package not found",
      description: "The requested package could not be found.",
      robots: { index: false, follow: false },
    };
  }

  // Prefer authored SEO copy; fall back to name/title/summary/description
  const pageTitle =
    bundle.seo?.title ??
    `${bundle.title ?? bundle.name ?? "Package"} • Integrated Growth Package`;

  const pageDescription =
    bundle.seo?.description ??
    bundle.subtitle ??
    bundle.summary ??
    bundle.description ??
    "Package details";

  // Use hero image if available; otherwise card image
  const image = bundle.image ?? bundle.cardImage;
  const imageUrl = abs(image?.src);

  // Canonical URL
  const canonicalPath = `/packages/${bundle.slug}`;
  const canonicalUrl = abs(canonicalPath);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: canonicalUrl ?? canonicalPath },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: canonicalUrl ?? canonicalPath,
      siteName: "TBH Digital",
      ...(imageUrl && {
        images: [{ url: imageUrl, alt: image?.alt || bundle.name || "Package image" }],
      }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: pageTitle,
      description: pageDescription,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

/* ----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

/**
 * pickRelated
 * -----------------------------------------------------------------------------
 * Heuristic to choose up to `max` related bundles:
 *  1) Prefer same service as the current bundle
 *  2) Then sort by tag overlap (descending)
 *  3) De-dupe by slug, preserve priority order
 *
 * NOTE: This is intentionally simple; you can swap this for a search/ML model
 *       without changing the page/component contracts.
 */
function pickRelated(current: MinimalBundle, all: MinimalBundle[], max = 8) {
  const service = current.service ?? current.primaryService;
  const currentSlug = current.slug;
  const currentTags: string[] = current.tags ?? current.services ?? [];

  // 1) Same service first (excluding the current)
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

  // 3) Merge lists, de-dupe by slug, respect priority order
  const merged: MinimalBundle[] = [];
  for (const r of [...sameService, ...byTagOverlap]) {
    if (!merged.find((m) => m.slug === r.slug)) merged.push(r);
    if (merged.length >= max) break;
  }
  return merged.slice(0, max);
}

/* ----------------------------------------------------------------------------
 * Page
 *  - Resolves bundle by slug
 *  - Derives related and add-ons
 *  - Renders PackagesDetailTemplate
 * -------------------------------------------------------------------------- */
export default function PackageDetailPage({ params }: { params: Params }) {
  const slug = (params.bundles || "").trim();
  const bundle = getBundleBySlug(slug) as MinimalBundle | undefined;
  if (!bundle) return notFound();

  // Curated add-ons (safe even if ADDONS_BY_ID is empty or missing keys)
  const addOns =
    (bundle.addOnRecommendations || [])
      .map((id) => (ADDONS_BY_ID as Record<string, unknown> | undefined)?.[id])
      .filter(Boolean) ?? [];

  // Related bundles by heuristic (service + tag overlap)
  const related = pickRelated(bundle, (BUNDLES as unknown as MinimalBundle[]) || [], 8);

  // Optional: inject extra FAQs (beyond bundle.faq). Kept empty by default.
  const faqs: Array<{ id?: string | number; question: string; answer: string }> = [];

  /**
   * RENDER
   * - This is a **server component**; it renders a **client** template that
   *   composes the full page (hero, super-card, rails, extras, etc.).
   * - We pass only the data the template needs; the template manages UI logic.
   */
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
