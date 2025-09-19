"use client";

import React from "react";
import ServiceCard from "@/components/ui/molecules/Card/ServiceCard";
import { services } from "@/mock/products-services/ServiceData";
import "@/components/feature-modules/products-services/ServiceGrid.css";

const ServiceGrid: React.FC = () => {
    return (
        <section id="service-grid" className="service-grid">
            <div className="service-grid-container">
                {/* ✅ Section Heading */}
                <h2 id="service-grid-title" className="service-grid-title">Explore Our Offerings</h2>
                <p id="service-grid-description" className="service-grid-description">
                    Cutting-edge solutions tailored for business growth.
                </p>

                {/* ✅ Service Cards Grid */}
                <div id="service-grid-wrapper" className="service-grid-wrapper">
                    {services.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServiceGrid;
