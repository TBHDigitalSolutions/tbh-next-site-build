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

// ---- Metadata ---------------------------------------------------------------
type Params = { bundles: string };

export function generateMetadata({ params }: { params: Params }): Metadata {
  const bundle = getBundleBySlug(params.bundles);

  if (!bundle) {
    return {
      title: "Package not found",
      description: "The requested package could not be found.",
      robots: { index: false },
    };
  }

  const absolute = (src: string) =>
    src?.startsWith("http")
      ? src
      : `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}${src}`;

  return {
    title: `${bundle.title} • Integrated Growth Package`,
    description:
      bundle.subtitle ||
      bundle.summary ||
      `Complete ${bundle.title} solution with integrated services.`,
    alternates: { canonical: `/packages/${bundle.slug}` },
    openGraph: {
      title: bundle.title,
      description: bundle.subtitle || bundle.summary,
      type: "website",
      ...(bundle.cardImage?.src && {
        images: [{ url: absolute(bundle.cardImage.src), alt: bundle.cardImage.alt || bundle.title }],
      }),
    },
  };
}

// ---- Page -------------------------------------------------------------------
export default function PackageDetailPage({ params }: { params: Params }) {
  const bundle = getBundleBySlug(params.bundles);
  if (!bundle) {
    return (
      <main className={styles.page}>
        <div className={styles.notFound}>
          <h1>Package Not Found</h1>
          <p>The package “{params.bundles}” could not be found.</p>
          <a className={styles.backLink} href="/packages">← Back to Packages</a>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <PackagesDetailTemplate bundle={bundle} />
    </main>
  );
}