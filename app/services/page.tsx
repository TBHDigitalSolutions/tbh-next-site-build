// app/services/page.tsx
import type { Metadata } from "next";
import su from "@/styles/services-unified.module.css";

// Layout atoms
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Sections
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import TwoColVideoSection from "@/components/sections/section-layouts/TwoColVideoSection/TwoColVideoSection";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";

// Route-scoped UI (client)
import ModernServicesSelector from "@/components/services/ModernServicesSelector";
import SearchBanner from "@/components/services/SearchBanner";
import GrowthPackagesCTA from "@/components/packages/GrowthPackagesCTA/GrowthPackagesCTA";

// Local data
import pageData from "./page.data.json";

/* =====================================================================
   Metadata (canonical /services)
   ===================================================================== */
export const metadata: Metadata = {
  title: (pageData as any)?.seoTitle ?? "Services Directory | TBH Digital Solutions",
  description:
    (pageData as any)?.seoDescription ??
    "Browse our service hubs, search capabilities, explore bundles, and book time with our team.",
  keywords: (pageData as any)?.seoKeywords,
  alternates: { canonical: "/services" },
  openGraph: {
    title: (pageData as any)?.seoTitle ?? "Services Directory | TBH Digital Solutions",
    description:
      (pageData as any)?.seoDescription ??
      "Browse our service hubs, search capabilities, explore bundles, and book time with our team.",
    url: "/services",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

/* =====================================================================
   Null-safe adapters
   ===================================================================== */
function toHeroProps(data: any): React.ComponentProps<typeof ServiceHero> {
  const title = data?.hero?.title ?? data?.meta?.title ?? "Our Services";
  const subtitle =
    data?.hero?.description ?? data?.meta?.subtitle ?? data?.meta?.description ?? undefined;
  return { title, subtitle };
}

function toTwoColVideoProps(
  data: any
): React.ComponentProps<typeof TwoColVideoSection> | undefined {
  const block = data?.twoColVideo ?? null;

  const legacyTitle = data?.intro?.heading ?? "How We Work";
  const legacyDescription = data?.intro?.description;
  const legacyVideo = data?.introVideo ?? data?.intro?.video ?? null;

  const normalized =
    block && block.video?.src
      ? {
          id: block.id ?? "services-intro-video",
          title: block.title ?? legacyTitle,
          description: block.description ?? legacyDescription,
          video: {
            src: block.video.src,
            poster: block.video.poster,
            autoPlay: block.video.autoPlay ?? false,
            loop: block.video.loop ?? true,
            muted: block.video.muted ?? true,
          },
          cta: block.cta ?? { label: "Explore Services", href: "#services-grid" },
        }
      : legacyVideo?.src
      ? {
          id: "services-intro-video",
          title: legacyTitle,
          description: legacyDescription,
          video: {
            src: legacyVideo.src,
            poster: legacyVideo.poster,
            autoPlay: legacyVideo.autoPlay ?? false,
            loop: legacyVideo.loop ?? true,
            muted: legacyVideo.muted ?? true,
          },
          cta: data?.introCta ?? { label: "Explore Services", href: "#services-grid" },
        }
      : null;

  if (!normalized) return undefined;

  return {
    data: normalized,
    containerSize: "wide",
    tone: "transparent",
    showDivider: true,
    dividerVariant: "constrained",
    dividerTone: "default",
  };
}

function toFinalCtaProps(data: any): React.ComponentProps<typeof CTASection> {
  const title = data?.cta?.title ?? data?.cta?.heading ?? "Not sure which service you need?";
  const description = data?.cta?.description ?? "Book a discovery call or browse our work.";

  return {
    title,
    description,
    primaryCta: {
      label: data?.cta?.primaryButton?.text ?? "Book a Discovery Call",
      href: data?.cta?.primaryButton?.href ?? "/book",
    },
    secondaryCta: {
      label: data?.cta?.secondaryButton?.text ?? "View Portfolio",
      href: data?.cta?.secondaryButton?.href ?? "/portfolio",
    },
    style: "centered",
    backgroundColor: undefined,
    image: undefined,
  };
}

/* =====================================================================
   JSON-LD (Breadcrumbs + WebPage)
   ===================================================================== */
function JsonLd() {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: "/services",
      },
    ],
  };

  const webpage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name:
      (pageData as any)?.seoTitle ??
      (pageData as any)?.hero?.title ??
      "Services Directory | TBH Digital Solutions",
    description:
      (pageData as any)?.seoDescription ??
      "Browse our service hubs, search capabilities, explore bundles, and book time with our team.",
    url: "/services",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />
    </>
  );
}

/* =====================================================================
   Page
   ===================================================================== */
export default function ServicesIndexPage() {
  const hero = toHeroProps(pageData);
  const twoCol = toTwoColVideoProps(pageData);
  const finalCTA = toFinalCtaProps(pageData);

  return (
    <div className={su.servicePage}>
      {/* SEO JSON-LD */}
      <JsonLd />

      {/* 1) HERO INTRO / ABOUT */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <ServiceHero {...hero} />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 1.5) INTRO / TWO-COLUMN VIDEO (optional) */}
      {twoCol ? <TwoColVideoSection {...twoCol} /> : null}

      {/* 2) SEARCH BANNER */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="surface" padded>
          <SearchBanner />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 3) LEVEL-1 SERVICE CARDS (hub directory) */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          {/* Renders overview header + services grid on /services */}
          <ModernServicesSelector />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 4) GROWTH PACKAGES CTA STRIP */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="surface" padded>
          <GrowthPackagesCTA />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 5) FINAL CTA — Book Now / View Portfolio */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="gradient" padded>
          <CTASection {...finalCTA} />
        </Container>
      </FullWidthSection>
    </div>
  );
}
