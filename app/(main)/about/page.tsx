// app/(main)/about/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

// ✅ Route-based hero (About is handled by the selector)
import HeroSelector from "@/components/main-pages/Home/Hero/HeroSelector";

// Section layouts (keep the originals)
import Divider from "@/components/ui/atoms/Divider/Divider";
import TwoColumnSection from "@/components/sections/section-layouts/TwoColumnSection/TwoColumnSection";
import AutoFlexSection from "@/components/sections/section-layouts/AutoFlexSection/AutoFlexSection";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";

// UI components (keep the originals)
import GenericCard from "@/components/ui/molecules/Card/GenericCard";

// Feature Components - About Page (keep the originals)
import TestimonialSlider from "@/components/ui/organisms/Testimonials/TestimonialSlider";
import CoreValueCard from "@/components/ui/molecules/Card/CoreValueCard";
import CompanyStoryContent from "@/components/main-pages/About/CompanyStory/CompanyStoryContent";
import JoinUsCTA from "@/components/main-pages/About/JoinUsCTA/JoinUsCTA";

// Page data (single source of truth)
import aboutPageData from "@/data/page/main-pages/about";

const {
  companyStory,
  coreValues,
  teamSection,
  teamMembers,
  testimonialsSection,
  testimonials,
  joinUsCTA,
} = aboutPageData;

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

export default function AboutPage() {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* 🔹 Hero (auto-selected for "/about") */}
      <HeroSelector />
      <Divider />

      {/* Company Story (keeps original TwoColumnSection layout + classes) */}
      <TwoColumnSection
        // Optional header props are supported by TwoColumnSection if you'd like a section header:
        // sectionTitle="Our Story"
        // sectionSubtitle={companyStory.subheading}
        // sectionDescription="From scrappy beginnings to measurable outcomes at scale"
        leftContent={
          <div>
            {/* If you later prefer your dedicated VideoPlayer, swap it here */}
            <video
              src={companyStory.video.src}
              poster={companyStory.video.fallbackImage}
              controls={companyStory.video.controls ?? true}
              autoPlay={companyStory.video.autoplay}
              loop={companyStory.video.loop}
              muted={companyStory.video.muted}
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        }
        rightContent={<CompanyStoryContent data={companyStory} />}
      />

      <Divider />

      {/* Core Values (keeps original AutoFlexSection + CoreValueCard usage) */}
      <AutoFlexSection title="Our Core Values" columns={3}>
        {coreValues.map((value) => (
          <CoreValueCard key={value.id} {...value} />
        ))}
      </AutoFlexSection>

      <Divider />

      {/* Team Grid (keeps original AutoFlexSection + GenericCard usage) */}
      <AutoFlexSection
        title={teamSection.title}
        description={teamSection.description}
        columns={3}
      >
        {teamMembers.map((member) => (
          <GenericCard key={member.id} {...member} variant="team" />
        ))}
      </AutoFlexSection>

      <Divider />

      {/* Testimonials (keeps original FullWidthSection + TestimonialSlider usage) */}
      <FullWidthSection
        title={testimonialsSection.title}
        description={testimonialsSection.description}
        align="center"
      >
        <TestimonialSlider data={testimonials} />
      </FullWidthSection>

      <Divider />

      {/* Join Us CTA (keeps original FullWidthSection + JoinUsCTA usage) */}
      <FullWidthSection>
        <JoinUsCTA data={joinUsCTA} />
      </FullWidthSection>

      <Divider />
    </motion.div>
  );
}
