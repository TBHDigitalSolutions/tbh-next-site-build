// src/components/core/navigation/Footer/Footer.tsx
"use client";

import React from "react";
import "./Footer.css";
import FooterColumn from "@/components/global/Footer/FooterColumn";
import FooterContactFollow from "@/components/global/Footer/FooterContactFollow";
import DynamicFullWidthBox from "@/components/global/Footer/DynamicFullWidthBox";
import { footerData } from "@/mock/footerData";

interface FooterProps {
  className?: string;
}

type LegalLink = {
  label: string;
  href: string;
  external?: boolean;
};

type LegalBlock = {
  copyright: string;
  links: LegalLink[];
};

/**
 * TBH Digital Solutions Footer Component
 * Refactored to align with TBH Brand Guide standards
 * Features:
 * - Unified left section with Support, Resources, Terms
 * - Dedicated Contact Us container
 * - Responsive grid layout
 * - Legal bar with safe fallbacks (prevents runtime errors)
 */
const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  // Extract contact column data
  const contactColumn = footerData.columns?.find?.((c: any) => c.title === "Contact Us");

  // Get first 3 non-contact columns for left section
  const contentColumns =
    footerData.columns?.filter?.((c: any) => c.title !== "Contact Us")?.slice(0, 3) ?? [];

  // Extract contact information and social links
  const contactInfo = contactColumn?.contactInfo ?? [];
  const socialLinks = contactColumn?.socialLinks ?? [];

  // Legal block (optional)
  const legal: LegalBlock | undefined = (footerData as any).legal;
  const hasLegal = Boolean(legal && Array.isArray(legal.links) && legal.links.length > 0);

  return (
    <footer
      className={`footer-section ${className}`}
      role="contentinfo"
      aria-label="Site footer with navigation and contact information"
    >
      {/* Main Footer Grid */}
      <div className="footer-grid">
        {/* Left Unified Container - 3 Columns Inside */}
        <div className="footer-left">
          <div className="footer-left__inner">
            {contentColumns.map((column: any, index: number) => (
              <FooterColumn
                key={`footer-column-${index}`}
                title={column.title}
                content={column.content ?? []}
              />
            ))}
          </div>
        </div>

        {/* Right Contact Container */}
        <div className="footer-contact">
          <FooterContactFollow contactInfo={contactInfo} socialLinks={socialLinks} />
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider" role="separator" aria-hidden="true" />

      {/* Legal bar – safe rendering */}
      {hasLegal ? (
        <DynamicFullWidthBox
          content={
            <>
              <p className="dfb-copyright">{legal!.copyright}</p>
              <nav className="dfb-links" aria-label="Legal and utility links">
                {legal!.links.map((link, i) => (
                  <React.Fragment key={`${link.label}-${i}`}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                    {i < legal!.links.length - 1 && (
                      <span className="dfb-sep" aria-hidden="true">
                        |
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            </>
          }
        />
      ) : (
        <DynamicFullWidthBox content={footerData.fullWidthBox?.content ?? null} />
      )}

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        // Note: keep this lean; avoid undefined by guarding finds
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "TBH Digital Solutions",
            url: "https://tbhdigitalsolutions.com",
            email:
              contactInfo.find?.((c: any) => c.href?.startsWith?.("mailto:"))?.href?.replace?.(
                "mailto:",
                ""
              ) ?? undefined,
            telephone:
              contactInfo.find?.((c: any) => c.href?.startsWith?.("tel:"))?.href?.replace?.(
                "tel:",
                ""
              ) ?? undefined,
            address: {
              "@type": "PostalAddress",
              addressLocality: "St. Louis",
              addressRegion: "MO",
              addressCountry: "US",
            },
            sameAs: Array.isArray(socialLinks) ? socialLinks.map((s: any) => s.link) : [],
            logo: "https://tbhdigitalsolutions.com/assets/images/Logo_Transparent.svg",
            description:
              "TBH Digital Solutions - Transform the way you do business with powerful digital solutions.",
          }),
        }}
      />
    </footer>
  );
};

export default Footer;
