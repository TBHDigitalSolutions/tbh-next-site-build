// shared-ui/components/cta/CTASection.tsx

"use client";

import React from "react";
import CTAButton from "@/components/ui/atoms/Button/CTAButton";
import { ArrowRight } from "lucide-react";
import "./CTASection.css"; 

interface CTA {
  label: string;
  href: string;
}

export interface CTASectionProps {
  title: string;
  description?: string;
  button?: { 
    label: string;
    href: string;
  };
  // For backward compatibility with the current usage
  primaryCta?: CTA;
  secondaryCta?: CTA;
  style?: "centered" | "split" | "fullwidth";
  backgroundColor?: string;
  image?: string;
  className?: string;
}

const CTASection: React.FC<CTASectionProps> = ({
  title,
  description = "",
  button,
  primaryCta,
  secondaryCta,
  style = "centered",
  backgroundColor,
  image,
  className = "",
}) => {
  // Handle both button prop and primaryCta prop for backward compatibility
  const mainCta = primaryCta || button || { label: "Learn More", href: "#" };
  
  // Construct classes - maintain compatibility with both class patterns
  const ctaClasses = `cta-section cta-${style} ${className}`.trim();
  
  // Inline styles for custom background
  const backgroundStyle = backgroundColor ? { backgroundColor } : {};
  
  return (
    <section className={ctaClasses} style={backgroundStyle}>
      {image && (
        <div className="cta-image">
          <img src={image} alt={title} />
        </div>
      )}
      
      <div className="cta-content">
        <h2 className="cta-title">{title}</h2>
        {description && <p className="cta-description">{description}</p>}
      
        <div className="cta-actions">
          <CTAButton 
            href={mainCta.href} 
            text={mainCta.label || "Learn More"}
            variant="primary" 
            size="sm" 
            icon={<ArrowRight size={20} />}
          />
          
          {secondaryCta && (
            <CTAButton 
              href={secondaryCta.href} 
              text={secondaryCta.label}
              variant="secondary" 
              size="sm"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default CTASection;