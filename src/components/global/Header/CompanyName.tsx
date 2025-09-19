"use client";

import React from "react";
import Link from "next/link";
import "./CompanyName.css";

interface CompanyNameProps {
  href?: string;
  name?: string;
  tagline?: string;
  className?: string;
}

const CompanyName: React.FC<CompanyNameProps> = ({
  href,
  name = "TBH Digital Solutions",
  tagline,
  className = "",
}) => {
  const nameElement = (
    <span className={`companyname ${className}`}>
      {name}
      {tagline && <span className="companyname-tagline">{tagline}</span>}
    </span>
  );

  return href ? (
    <Link href={href} className="companyname-link" aria-label="Company Home">
      {nameElement}
    </Link>
  ) : (
    nameElement
  );
};

export default CompanyName;