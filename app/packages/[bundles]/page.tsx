// app/packages/[bundles]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../packages.module.css";

// Data (SSOT)
import { BUNDLES, getBundleBySlug } from "@/data/packages";

// Presentation template
import { PackagesDetailTemplate } from "@/packages/templates";

// ---- Static params for SSG/ISR ---------------------------------------------
export function generateStaticParams() {
  return BUNDLES.map((b) => ({ bundles: b.slug }));
}

type Params = { bundles: string };

// ---- Metadata ---------------------------------------------------------------
export function generateMetadata({ params }: { params: Params }): Metadata {
  const bundle = getBundleBySlug(params.bundles);

  if (!bundle) {
    return {
      title: "Package not found",
      description: "The requested package could not be found.",
      robots: { index: false },
    };
  }

  // Prefer MDX-derived SEO when present
  const anyBundle = bundle as any;
  const title =
    anyBundle?.seo?.title ??
    `${anyBundle.title ?? bundle.name} • Integrated Growth Package`;

  const description =
    anyBundle?.seo?.description ??
    anyBundle.subtitle ??
    anyBundle.summary ??
    bundle.description;

  const image = anyBundle?.image ?? anyBundle?.cardImage;

  const absolute = (src?: string) =>
    src?.startsWith?.("http")
      ? src
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${src ?? ""}`;

  return {
    title,
    description,
    alternates: { canonical: `/packages/${bundle.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
      ...(image?.src && {
        images: [{ url: absolute(image.src), alt: image.alt || bundle.name }],
      }),
    },
  };
}

// ---- Page -------------------------------------------------------------------
export default function PackageDetailPage({ params }: { params: Params }) {
  const bundle = getBundleBySlug(params.bundles);
  if (!bundle) return notFound();

  return (
    <main className={styles.page}>
      <PackagesDetailTemplate bundle={bundle} />
    </main>
  );
}