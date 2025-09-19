"use client";

import React from "react";
import ServiceCard from "@/components/ui/molecules/Card/ServiceCard";
import { services } from "@/mock/products-services/ServiceData";
import "./SaaSServices.css"; // ✅ Import CSS

const SaaSServices: React.FC = () => {
    // ✅ Filter only SaaS-related services
    const saasServices = services.filter((service) => service.id === "saas");

    return (
        <section className="saas-services-section">
            <div className="saas-container">
                {/* ✅ SaaS Services Grid */}
                <div className="saas-grid">
                    {saasServices.map((service, index) => (
                        <ServiceCard key={index} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SaaSServices;
