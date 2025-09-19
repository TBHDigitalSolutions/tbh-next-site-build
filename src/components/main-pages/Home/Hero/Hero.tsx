"use client";

import { useState } from "react";
import Image from "next/image";
// ✅ Import Button from correct TBH component structure
import { Button } from "@/components/ui/atoms/Button";
import "./Hero.css";

const Hero: React.FC = () => {
  const [videoError, setVideoError] = useState(false);

  const handleContactClick = () => {
    // TODO: Implement contact modal or navigation
    console.log("Contact button clicked");
  };

  return (
    <section className="hero">
      {/* Background Media */}
      <div className="hero-media-container">
        {!videoError ? (
          <video
            className="hero-media"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
            preload="auto"
          >
            <source
              src="/videos/Website-Videos/website-hero_1.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        ) : (
          <Image
            src="/images/Untitled-2.2.png"
            alt="TBH Digital Solutions Hero Background"
            className="hero-media"
            fill
            style={{ objectFit: "cover" }}
            priority
          />
        )}
        <div className="hero-overlay" />
      </div>

      {/* Hero Content */}
      <div className="hero-content">
        <Image
          src="/logos/tbh-logo-primary.svg" 
          alt="TBH Digital Solutions Logo"
          width={200}
          height={200}
          className="hero-logo"
          priority
        />
        <h1 className="hero-title">TBH Digital Solutions</h1>

        {/* TBH Brand CTA Button */}
        <Button 
          variant="primary" 
          size="large" 
          className="hero-button"
          onClick={handleContactClick}
          aria-label="Contact TBH Digital Solutions"
        >
          Get In Touch
        </Button>
      </div>
    </section>
  );
};

export default Hero;