Here’s a **production-ready** `/app/services/page.tsx` that composes your directory page exactly in the order you specified—using your existing building blocks (FullWidthSection, Container, Divider) and the section components (ServicesHero, TwoColVideoSection, SearchBanner, ModernServicesSelector, GrowthPackagesCTA, CTASection). I’ve added safe adapters so the page works even if parts of `page.data.json` are missing.

> This page uses your shipped components and styles: Divider , Container , ServiceHero , TwoColVideoSection , CTASection , FullWidthSection , ModernServicesSelector , and your route data file `page.data.json` .

```tsx
// app/services/page.tsx
import type { Metadata } from "next";
import su from "@/styles/services-unified.module.css";

// Layout atoms
import FullWidthSection from "@/components/sections/section-layouts/FullwidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Divider from "@/components/ui/atoms/Divider/Divider";

// Sections
import ServiceHero from "@/components/sections/section-layouts/ServiceHero/ServiceHero";
import TwoColVideoSection from "@/components/sections/section-layouts/TwoColVideoSection/TwoColVideoSection";
import CTASection from "@/components/sections/section-layouts/CTASection/CTASection";

// Route-scoped UI (client)
import ModernServicesSelector from "./_components/ModernServicesSelector";
import SearchBanner from "./_components/SearchBanner";
import GrowthPackagesCTA from "./_components/GrowthPackagesCTA";

// Local data
import pageData from "./page.data.json";

/* =====================================================================
   Metadata
   ===================================================================== */
export const metadata: Metadata = {
  title:
    (pageData as any)?.seoTitle ??
    "Services Directory | TBH Digital Solutions",
  description:
    (pageData as any)?.seoDescription ??
    "Browse our service hubs, search capabilities, explore bundles, and book time with our team.",
  alternates: { canonical: "/services" },
};

/* =====================================================================
   Light adapters (safe against missing data fields)
   ===================================================================== */

function toHeroProps(data: any) {
  const title =
    data?.title ??
    data?.intro?.heading ??
    "Our Services";
  const subtitle =
    data?.subtitle ??
    data?.intro?.description ??
    undefined;

  // The Services directory hero is intentionally light: no background media
  return { title, subtitle } as React.ComponentProps<typeof ServiceHero>;
}

function toTwoColVideoData(data: any) {
  // We’ll use intro content if available; only render if video src exists
  const title =
    data?.intro?.heading ??
    "How We Work";
  const description = data?.intro?.description ?? undefined;

  const videoSrc =
    data?.introVideo?.src ??
    data?.intro?.video?.src ??
    undefined;

  if (!videoSrc) return undefined;

  return {
    data: {
      id: "services-intro-video",
      title,
      description,
      video: {
        src: videoSrc,
        poster:
          data?.introVideo?.poster ??
          data?.intro?.video?.poster ??
          undefined,
        autoPlay:
          data?.introVideo?.autoPlay ??
          data?.intro?.video?.autoPlay ??
          false,
        loop:
          data?.introVideo?.loop ??
          data?.intro?.video?.loop ??
          true,
        muted:
          data?.introVideo?.muted ??
          data?.intro?.video?.muted ??
          true,
      },
      cta:
        data?.introCta ??
        { label: "Explore Services", href: "#services-grid" },
    },
    containerSize: "wide" as const,
    tone: "transparent" as const,
    showDivider: true,
    dividerVariant: "constrained" as const,
    dividerTone: "default" as const,
  } as React.ComponentProps<typeof TwoColVideoSection>;
}

function toFinalCtaProps(data: any) {
  // Per your spec: Book Now + View Portfolio
  const title =
    data?.cta?.heading ??
    "Not sure which service you need?";
  const description =
    data?.cta?.description ??
    "Book a discovery call or browse our work.";

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
    style: "centered" as const,
    backgroundColor: undefined,
    image: undefined,
  } as React.ComponentProps<typeof CTASection>;
}

/* =====================================================================
   Page
   ===================================================================== */

export default async function ServicesIndexPage() {
  const hero = toHeroProps(pageData);
  const twoCol = toTwoColVideoData(pageData);
  const finalCTA = toFinalCtaProps(pageData);

  return (
    <div className={su.servicePage}>
      {/* 1) HERO INTRO / ABOUT */}
      <FullWidthSection constrained containerSize="wide" padded>
        <Container size="wide" tone="transparent" padded>
          <ServiceHero {...hero} />
        </Container>
        <Divider variant="constrained" />
      </FullWidthSection>

      {/* 1.5) INTRO / TWO-COLUMN VIDEO (optional; only renders if video present) */}
      {twoCol ? (
        <TwoColVideoSection {...twoCol} />
      ) : null}

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
          {/* ModernServicesSelector renders its own overview header + services grid on /services */}
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
```

## Notes / gotchas

1. **Data expectations**
   Your current `page.data.json` doesn’t include a video block; the `TwoColVideoSection` will **auto-skip** unless you add one. Example to enable it:

```json
{
  "intro": {
    "heading": "How We Help You Grow",
    "description": "Explore our approach from discovery to delivery…",
    "video": {
      "src": "/pages/services-page/services/intro.mp4",
      "poster": "/pages/services-page/services/intro-poster.jpg",
      "autoPlay": false,
      "loop": true,
      "muted": true
    }
  }
}
```

2. **L1 hub links**
   Ensure every L1 service card in `page.data.json` links to `/services/<hub>` (not `/video-production`, etc.), so users land on hub pages.&#x20;

3. **Component contracts**

* The hero accepts `{ title, subtitle, button? }` and handles its own layout/styles.&#x20;
* TwoColVideoSection expects `{ data: { title, description, video, cta } }`; the adapter above ensures it only renders when `video.src` exists.&#x20;
* The structural bands use your **FullWidthSection + Container + Divider** trio for consistent spacing and constrained width.
* Bottom CTA uses your **CTASection** with primary/secondary CTAs.&#x20;

If you want me to also push a quick PR-ish patch that updates `page.data.json` (hub hrefs + new intro video block), say the word and I’ll hand you the JSON edits too.
