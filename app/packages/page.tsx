// app/packages/page.tsx
import type { Metadata } from "next";
import styles from "./packages.module.css";

// Data (SSOT façade)
import { BUNDLES, FEATURED_BUNDLE_SLUGS } from "@/data/packages";

// app/packages/page.tsx
// Templates (domain layer)
import { PackagesHubTemplate } from "@/packages/templates";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Integrated Growth Packages",
  description:
    "Complete business solutions that combine multiple services into powerful, results-driven bundles.",
  alternates: { canonical: "/packages" },
  openGraph: {
    title: "Integrated Growth Packages",
    description:
      "Complete business solutions that combine multiple services into powerful, results-driven bundles.",
    type: "website",
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/packages`,
  },
  twitter: {
    card: "summary_large_image",
    title: "Integrated Growth Packages",
    description:
      "Complete business solutions that combine multiple services into powerful, results-driven bundles.",
  },
};

export default function PackagesHubPage() {
  return (
    <div className={styles.page}>
      <PackagesHubTemplate
        title="Integrated Growth Packages"
        subtitle="Proven playbooks bundled into simple plans — faster time to value, repeatable results."
        bundles={BUNDLES}
        featuredSlugs={FEATURED_BUNDLE_SLUGS}
        showServiceFilter
        showSearch
        showSort
        defaultSort="recommended"
        minCardWidthPx={300}
        jsonLd
      />
    </div>
  );
}
