// app/main/about/page.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

// ✅ Route-based hero (About is handled by the selector)
import HeroSelector from "@/components/features/home/Hero/HeroSelector";

// Local components - Section Templates
import Divider from "@/components/core/layout/Divider/Divider";
import TwoColumnSection from "@/components/sections/layouts/TwoColumn/TwoColumnSection";
import AutoFlexSection from "@/components/sections/layouts/Flexbox/AutoFlexSection";
import FullWidthSection from "@/components/sections/layouts/FullWidth/FullWidthSection";
import FullWidthSection2 from "@/components/sections/layouts/FullWidth/FullWidthSection2";

// UI Components
import GenericCard from "@/components/ui/molecules/Card/GenericCard";

// Feature Components - About Page
import TestimonialSlider from "@/components/ui/organisms/Testimonials/TestimonialSlider";
import CoreValueCard from "@/components/ui/molecules/Card/CoreValueCard";
import CompanyStoryContent from "@/components/features/about/CompanyStory/CompanyStoryContent";
import JoinUsCTA from "@/components/features/about/JoinUsCTA/JoinUsCTA";

// Mock data
import aboutPageData from "@/mock/aboutPage";

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

const AboutPage: React.FC = () => (
  <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
    {/* 🔹 Hero (auto-selected for "/about") */}
    <HeroSelector />

    {/* Company Story */}
    <TwoColumnSection
      leftContent={
        <div>
          {/* Temporary placeholder - replace with a dedicated <VideoPlayer /> when available */}
          <video
            src={companyStory.video.src}
            poster={companyStory.video.fallbackImage}
            controls
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      }
      rightContent={<CompanyStoryContent data={companyStory} />}
    />
    
    <Divider />

    {/* Core Values */}
    <AutoFlexSection title="Our Core Values" columns={3}>
      {coreValues.map((value, idx) => (
        <CoreValueCard key={idx} {...value} />
      ))}
    </AutoFlexSection>

    <Divider />

    {/* Team Grid */}
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

    {/* Testimonials */}
    <FullWidthSection
      title={testimonialsSection.title}
      description={testimonialsSection.description}
      align="center"
    >
      <TestimonialSlider data={testimonials} />
    </FullWidthSection>
    <Divider />

    {/* Join Us CTA */}
    <FullWidthSection2>
      <JoinUsCTA data={joinUsCTA} />
    </FullWidthSection2>
    <Divider />
  </motion.div>
);

export default AboutPage;
