"use client";

import React from "react";
import TestimonialSlider from "@/components/ui/about/Testimonials/TestimonialSlider";
import { testimonials } from "@/data/products-services/TestimonialsData";
import "./TrustSignals.css"; // ✅ Component-specific styles

// ✅ Client Logos
const clientLogos = [
    { src: "/images/client-logos/logo1.png", alt: "Client 1" },
    { src: "/images/client-logos/logo2.png", alt: "Client 2" },
    { src: "/images/client-logos/logo3.png", alt: "Client 3" },
    { src: "/images/client-logos/logo4.png", alt: "Client 4" },
];

// ✅ Compliance Badges
const complianceBadges = [
    { src: "/images/trust-badges/ssl-secure.png", alt: "SSL Secure" },
    { src: "/images/trust-badges/gdpr-compliant.png", alt: "GDPR Compliant" },
    { src: "/images/trust-badges/hipaa-compliant.png", alt: "HIPAA Compliant" },
];

const TrustSignals: React.FC = () => {
    return (
        <section className="trustsignals">
            {/* 🏆 Section Title */}
            <h2 className="trustsignals-title">Trusted by Industry Leaders</h2>

            {/* 🔹 Client Logos Grid */}
            <div className="trustsignals-logos">
                {clientLogos.map((logo, index) => (
                    <img key={index} src={logo.src} className="trustsignals-logo" alt={logo.alt} />
                ))}
            </div>

            {/* ⭐ Testimonials */}
            <h3 className="trustsignals-subtitle">What Our Clients Say</h3>
            <div className="trustsignals-testimonials">
                <TestimonialSlider />
            </div>

            {/* 🔒 Security & Compliance */}
            <h3 className="trustsignals-subtitle">Security & Compliance</h3>
            <div className="trustsignals-badges">
                {complianceBadges.map((badge, index) => (
                    <img key={index} src={badge.src} className="trustsignals-badge" alt={badge.alt} />
                ))}
            </div>
        </section>
    );
};

export default TrustSignals;
