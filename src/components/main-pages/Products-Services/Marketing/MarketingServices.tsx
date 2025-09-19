"use client";

import React from "react";
import ServiceCard from "@/components/ui/molecules/Card/ServiceCard";
import { services } from "@/mock/products-services/ServiceData";
import "./MarketingServices.css"; // ✅ Import CSS

const MarketingServices: React.FC = () => {
    // Filter only Marketing services
    const marketingServices = services.filter((service) => service.id === "marketing");

    return (
        <section className="marketing-services">
            <div className="marketing-container">
                {/* Section Heading */}
                <h2 className="marketing-title">
                    Targeted & Data-Driven Marketing Solutions
                </h2>
                <p className="marketing-description">
                    Drive measurable growth with PPC, social media, SEO, and advanced analytics.
                </p>

                {/* Marketing Services Grid */}
                <div className="marketing-grid">
                    {marketingServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MarketingServices;
