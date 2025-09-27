// app/packages/[bundles]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../packages.module.css";

// SSOT (facade)
import { BUNDLES, getBundleBySlug, ADDONS_BY_ID } from "@/data/packages";

// Template (import concrete file for safety)
import PackagesDetailTemplate from "@/packages/templates/PackagesDetailTemplate/PackagesDetailTemplate";

// Optional: revalidate every hour (ISR). Adjust as needed.
export const revalidate = 3600;

type Params = { bundles: string };

/* -------------------------------------------------------------------------- */
/* Static params for SSG/ISR                                                  */
/* -------------------------------------------------------------------------- */
export function generateStaticParams() {
  return BUNDLES.map((b) => ({ bundles: b.slug }));
}

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */
export function generateMetadata({ params }: { params: Params }): Metadata {
  const { bundles } = params;
  const bundle = getBundleBySlug(bundles);

  if (!bundle) {
    return {
      title: "Package not found",
      description: "The requested package could not be found.",
      robots: { index: false },
    };
  }

  const anyBundle = bundle as any;
  const title =
    anyBundle?.seo?.title ??
    `${anyBundle.title ?? anyBundle.name ?? "Package"} • Integrated Growth Package`;

  const description =
    anyBundle?.seo?.description ??
    anyBundle.subtitle ??
    anyBundle.summary ??
    anyBundle.description ??
    "Package details";

  const image = anyBundle?.image ?? anyBundle?.cardImage;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const absolute = (src?: string) =>
    src?.startsWith?.("http") ? src : src ? `${site}${src}` : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/packages/${bundle.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(image?.src && {
        images: [{ url: absolute(image.src)!, alt: image.alt || bundle.name }],
      }),
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */
function pickRelated(current: any, all: any[], max = 8) {
  const service = current.service ?? current.primaryService;
  const currentSlug = current.slug;
  const currentTags: string[] = current.tags ?? current.services ?? [];

  const byService = all.filter(
    (b) => (b as any).slug !== currentSlug && ((b as any).service ?? (b as any).primaryService) === service,
  );

  if (byService.length >= max) return byService.slice(0, max);

  const byTags = all
    .filter((b) => (b as any).slug !== currentSlug)
    .filter((b) => {
      const tags: string[] = (b as any).tags ?? (b as any).services ?? [];
      return tags.some((t) => currentTags.includes(t));
    });

  const merged = [...byService];
  for (const r of byTags) {
    if (!merged.find((m) => (m as any).slug === (r as any).slug)) {
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
  const bundle = getBundleBySlug(bundles);
  if (!bundle) return notFound();

  // Resolve curated add-ons (safe if ADDONS_BY_ID is empty)
  const addOns =
    ((bundle as any).addOnRecommendations as string[] | undefined)?.map(
      (id) => (ADDONS_BY_ID as Record<string, unknown> | undefined)?.[id],
    ).filter(Boolean) ?? [];

  // Derive related bundles (fallback heuristic)
  const related = pickRelated(bundle, BUNDLES, 8);

  // Fallback FAQs if you want to inject extras beyond bundle.faq
  const faqs: Array<{ id?: string | number; question: string; answer: string }> = [];

  return (
    <main className={styles.page} data-route="packages/[bundles]">
      <PackagesDetailTemplate bundle={bundle as any} related={related as any} addOns={addOns as any} faqs={faqs} />
    </main>
  );
}
