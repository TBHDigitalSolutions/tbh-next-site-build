// src/components/features/home/Hero/InteractiveHero.tsx

import React, { useState, useEffect } from "react";
import Image from "next/image";
import clsx from "clsx";
import "./InteractiveHero.css";

interface TrustBadge {
  id: string;
  name: string;
  logo: string;
  alt: string;
}

interface InteractiveElement {
  id: string;
  title: string;
  description: string;
  icon: string;
  position: { x: number; y: number };
  color: string;
}

interface InteractiveHeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  primaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href: string;
    onClick?: () => void;
  };
  trustBadges?: TrustBadge[];
  interactiveElements?: InteractiveElement[];
  className?: string;
  enableParticles?: boolean;
  enableTypingEffect?: boolean;
  height?: "hero-min-height" | "hero-full-height" | "hero-medium-height";
}

export const InteractiveHero: React.FC<InteractiveHeroProps> = ({
  title,
  subtitle,
  description,
  backgroundImage,
  backgroundVideo,
  primaryCTA,
  secondaryCTA,
  trustBadges = [],
  interactiveElements = [],
  className = "",
  enableParticles = true,
  enableTypingEffect = false,
  height = "hero-full-height",
}) => {
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);

  // Typing effect for title
  useEffect(() => {
    if (!enableTypingEffect) {
      setDisplayedText(title);
      return;
    }

    if (textIndex < title.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(title.slice(0, textIndex + 1));
        setTextIndex(textIndex + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [textIndex, title, enableTypingEffect]);

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    if (enableParticles) {
      window.addEventListener("mousemove", handleMouseMove);
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, [enableParticles]);

  return (
    <section 
      className={clsx(
        "interactive-hero", 
        height,
        enableParticles && "particles-enabled",
        className
      )}
    >
      {/* Background Media */}
      <div className="interactive-hero-background">
        {backgroundVideo ? (
          <video
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            poster={backgroundImage}
          >
            <source src={backgroundVideo} type="video/mp4" />
          </video>
        ) : backgroundImage ? (
          <Image
            src={backgroundImage}
            alt="Hero background"
            fill
            className="hero-image"
            priority
            sizes="100vw"
          />
        ) : null}
        <div className="hero-overlay" />
        
        {/* Animated Particles */}
        {enableParticles && (
          <div className="particles-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="interactive-hero-content">
        <div className="hero-text-content">
          <h1 className="interactive-hero-title">
            {enableTypingEffect ? displayedText : title}
            {enableTypingEffect && textIndex < title.length && (
              <span className="typing-cursor">|</span>
            )}
          </h1>

          {subtitle && (
            <h2 className="interactive-hero-subtitle">{subtitle}</h2>
          )}

          {description && (
            <p className="interactive-hero-description">{description}</p>
          )}

          {/* CTA Buttons */}
          <div className="hero-cta-container">
            {primaryCTA && (
              <a
                href={primaryCTA.href}
                className="btn primary interactive-btn"
                onClick={primaryCTA.onClick}
              >
                {primaryCTA.text}
                <span className="btn-glow"></span>
              </a>
            )}

            {secondaryCTA && (
              <a
                href={secondaryCTA.href}
                className="btn secondary interactive-btn"
                onClick={secondaryCTA.onClick}
              >
                {secondaryCTA.text}
                <span className="btn-glow"></span>
              </a>
            )}
          </div>

          {/* Trust Badges */}
          {trustBadges.length > 0 && (
            <div className="trust-badges-container">
              <p className="trust-text">Trusted by industry leaders</p>
              <div className="trust-badges-grid">
                {trustBadges.map((badge, index) => (
                  <div
                    key={badge.id}
                    className="trust-badge"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <Image
                      src={badge.logo}
                      alt={badge.alt}
                      width={120}
                      height={60}
                      className="trust-logo"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Interactive Elements */}
        {interactiveElements.length > 0 && (
          <div className="interactive-elements-container">
            {interactiveElements.map((element) => (
              <div
                key={element.id}
                className={clsx(
                  "interactive-element",
                  activeElement === element.id && "active"
                )}
                style={{
                  left: `${element.position.x}%`,
                  top: `${element.position.y}%`,
                  '--element-color': element.color,
                }}
                onMouseEnter={() => setActiveElement(element.id)}
                onMouseLeave={() => setActiveElement(null)}
              >
                <div className="element-trigger">
                  <div className="element-icon">
                    <Image
                      src={element.icon}
                      alt={element.title}
                      width={24}
                      height={24}
                    />
                  </div>
                  <div className="element-pulse"></div>
                </div>

                <div className="element-tooltip">
                  <h4 className="element-title">{element.title}</h4>
                  <p className="element-description">{element.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Mouse Follower */}
      {enableParticles && (
        <div
          className="mouse-follower"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
        />
      )}
    </section>
  );
};

export default InteractiveHero;