// shared-ui/header/CompanyInfo.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import CompanyName from "./CompanyName";
import "./CompanyInfo.css";

export type CompanyInfoVariant = "full" | "compact" | "icon-only";

interface CompanyInfoProps {
  variant?: CompanyInfoVariant;
  href?: string;
  /** public URL path to the logo (e.g. "/logos/tbh-logo-primary.svg") */
  logo?: string;
  /** optional inline SVG component, if you wire up SVGR later */
  logoComponent?: React.FC<React.SVGProps<SVGSVGElement>>;
  name?: string;
  tagline?: string;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({
  variant = "full",
  href = "/",
  logo,
  logoComponent: LogoSVG,
  name = "TBH Digital Solutions",
  tagline = "",
}) => {
  const Wrapper = href ? Link : "div";

  return (
    <Wrapper href={href as string} className={`companyinfo companyinfo-${variant}`}>
      <div className="companyinfo-container">
        {/* render inline SVG if you pass a real component, else fallback to Image */}
        {LogoSVG && typeof LogoSVG === "function" ? (
          <LogoSVG className="companyinfo-logo" aria-label={name} />
        ) : logo ? (
          <Image
            src={logo}
            alt={name}
            width={60}
            height={60}
            className="companyinfo-logo"
            priority
          />
        ) : null}

        {variant !== "icon-only" && (
          <div className="companyinfo-text">
            <CompanyName className="companyinfo-name" name={name} />
            {variant === "full" && tagline && (
              <span className="companyinfo-tagline">{tagline}</span>
            )}
          </div>
        )}
      </div>
    </Wrapper>
  );
};

export default CompanyInfo;