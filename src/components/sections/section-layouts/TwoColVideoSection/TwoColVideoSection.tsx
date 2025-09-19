"use client";

import * as React from "react";
import FullWidthSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import Container from "@/components/sections/container/Container/Container";
import Button from "@/components/ui/atoms/Button/Button";
import Divider from "@/components/ui/atoms/Divider/Divider";
import VideoPlayer from "./VideoPlayer";
import styles from "./TwoColVideoSection.module.css";

import type { TwoColVideoSectionProps } from "./TwoColVideoSection.types";

/**
 * TwoColVideoSection — Left: Title → Divider → Description → Centered CTA 
 *                       Right: Accessible Video Player
 *
 * Reuses:
 * - FullWidthSection (band + optional bottom divider)
 * - Container (constrained width, tokens)
 * - Divider (under title)
 * - Button (CTA)
 */
const TwoColVideoSection: React.FC<TwoColVideoSectionProps> = ({
  data,
  className,
  containerSize = "wide",
  tone = "transparent",
  showDivider = false,
  dividerVariant = "constrained",
  dividerTone = "subtle",
}) => {
  return (
    <FullWidthSection
      className={`${styles.section} ${className ?? ""}`}
      constrained
      containerSize={containerSize}
      padded
      showDivider={showDivider}
      dividerVariant={dividerVariant}
      dividerTone={dividerTone}
      as="section"
      data-testid="two-col-video-section"
    >
      <Container size={containerSize} tone={tone} padded={false}>
        <div className={styles.grid}>
          {/* LEFT: Title → Divider → Description → Centered CTA */}
          <div className={styles.leftCol}>
            <header>
              <h2 className={styles.heading}>{data.title}</h2>
              <Divider />
            </header>

            {data.description ? (
              <div className={styles.desc}>
                {data.description.split("\n").map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>
            ) : null}

            {data.cta ? (
              <div className={styles.centerCta}>
                <Button href={data.cta.href} variant="primary" size="sm" ariaLabel={data.cta.ariaLabel ?? data.cta.label}>
                  {data.cta.label}
                </Button>
              </div> 
            ) : null}
          </div>

          {/* RIGHT: Video */}
          <VideoPlayer
            src={data.video.src}
            poster={data.video.poster}
            autoPlay={data.video.autoPlay}
            loop={data.video.loop}
            muted={data.video.muted}
          />
        </div>
      </Container>
    </FullWidthSection>
  );
};

export default TwoColVideoSection;
