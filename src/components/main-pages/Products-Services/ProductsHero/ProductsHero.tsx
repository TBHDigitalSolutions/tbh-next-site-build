// website/src/components/feature-modules/products-services/ProductsHero.tsx
"use client";

import React from "react";
import Link from "next/link";
// ✅ Import shared‑ui Button
import Button from "@/components/ui/atoms/Button/Button";
// ✅ Pull heroSection from the consolidated mock
import productsServicesPage from "@/mock/productsServicesPage";
import "./ProductsHero.css";

const { heroSection } = productsServicesPage;

const ProductsHero: React.FC = () => {
  return (
    <section className="products-hero">
      {/* Overlay for readability */}
      <div className="products-hero-overlay" />

      <div className="products-hero-content">
        {/* Hero Title */}
        <h1 className="products-hero-title">{heroSection.title}</h1>

        {/* Hero Subtitle */}
        <p className="products-hero-subtitle">{heroSection.subtitlePart1}</p>
        <p className="products-hero-subtitle">{heroSection.subtitlePart2}</p>
        <p className="products-hero-cta">{heroSection.subtitlePart3}</p>
        <p className="products-hero-contact">{heroSection.subtitlePart4}</p>

        {/* CTA Buttons */}
        <div className="products-hero-buttons">
          <Link href={heroSection.primaryCTA.link}>
            <Button variant="primary" size="large" aria-label={heroSection.primaryCTA.text}>
              {heroSection.primaryCTA.text}
            </Button>
          </Link>

          <Link href={heroSection.secondaryCTA.link}>
            <Button variant="primary" size="large" aria-label={heroSection.secondaryCTA.text}>
              {heroSection.secondaryCTA.text}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsHero;
