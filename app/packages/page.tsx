// app/packages/page.tsx
import type { Metadata } from "next";
import styles from "./packages.module.css";

// Data (SSOT façade)
import {
  BUNDLES as PACKAGES,       // legacy alias; equals PACKAGES array
  getCardBySlug,             // registry → PackageCardProps (when provided)
} from "@/data/packages";

// UI
import PackageCard, {
  type PackageCardProps,
} from "@/packages/components/PackageCard/PackageCard";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Integrated Growth Packages",
  description:
    "Complete business solutions that combine services into simple, results-driven bundles.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Integrated Growth Packages",
    description:
      "Complete business solutions that combine services into simple, results-driven bundles.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/packages`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrated Growth Packages",
    description:
      "Complete business solutions that combine services into simple, results-driven bundles.",
  },
};

// Fallback → derive a minimal PackageCardProps from PackageBase if a registry card isn't present
function deriveCardFromBase(pkg: {
  id: string;
  slug: string;
  name: string;
  summary?: string;
  service?: string;
  tags?: string[];
  price?: { oneTime?: number; monthly?: number; currency?: string };
  includes?: Array<{ title: string; items: string[] }>;
  image?: { src: string; alt?: string };
}): PackageCardProps {
  const features =
    (pkg.includes?.[0]?.items ?? []).slice(0, 5) ||
    [];

  return {
    id: pkg.id,
    slug: pkg.slug,
    href: `/packages/${pkg.slug}`,
    testId: `card-${pkg.slug}`,

    name: pkg.name,
    description: pkg.summary ?? "",

    features,
    service: (pkg.service as any) ?? undefined,
    tags: pkg.tags ?? [],

    image: pkg.image
      ? { src: pkg.image.src, alt: pkg.image.alt ?? `${pkg.name} — preview` }
      : undefined,

    price: {
      oneTime: pkg.price?.oneTime,
      monthly: pkg.price?.monthly,
      currency: (pkg.price?.currency as any) ?? "USD",
    },

    // Policy CTAs (card): View details / Book a call
    primaryCta: { label: "View details", href: `/packages/${pkg.slug}` },
    secondaryCta: { label: "Book a call", href: "/book" },

    variant: "default",
  };
}

export default function PackagesBrowsePage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Integrated Growth Packages</h1>
        <p className={styles.subtitle}>
          Proven playbooks bundled into simple plans — faster time to value, repeatable results.
        </p>
      </header>

      <section className={styles.grid} aria-label="Available packages">
        {PACKAGES.map((pkg) => {
          const card = getCardBySlug(pkg.slug);
          const model = (card ?? deriveCardFromBase(pkg)) as PackageCardProps;
          return <PackageCard key={pkg.slug} {...model} />;
        })}
      </section>
    </main>
  );
}
