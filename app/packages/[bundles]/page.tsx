// app/packages/[bundles]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import styles from "../packages.module.css";

// Data (SSOT)
import { BUNDLES, getBundleBySlug } from "@/data/packages";

// Template
import PackagesDetailTemplate from "@/packages/templates/PackagesDetailTemplate";

// ---- Static params for SSG/ISR ---------------------------------------------
export function generateStaticParams() {
  return BUNDLES.map((b) => ({ bundles: b.slug }));
}

type Params = { bundles: string };

// ---- Metadata ---------------------------------------------------------------
export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { bundles } = await params;
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
export default async function PackageDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { bundles } = await params;
  const bundle = getBundleBySlug(bundles);
  if (!bundle) return notFound();

  return (
    <main className={styles.page}>
      <PackagesDetailTemplate bundle={bundle} />
    </main>
  );
}
