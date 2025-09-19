"use client"; // ✅ Ensures this is a Client Component

import React from "react";
import ServiceCard from "@/components/ui/molecules/Card/ServiceCard";
import { services } from "@/mock/products-services/ServiceData";
import "./WebDevServices.css"; // ✅ Import CSS

const WebDevServices: React.FC = () => {
    // Filter only Web Development services
    const webDevServices = services.filter((service) => service.id === "web-dev");

    return (
        <section className="web-dev-section">
            <div className="web-dev-container">
                {/* Section Heading */}
                <h2 className="web-dev-title">
                    Scalable, Performance-Driven Web Development
                </h2>
                <p className="web-dev-description">
                    Custom websites, e-commerce stores, and content hubs tailored to your business needs.
                </p>

                {/* Web Development Services Grid */}
                <div className="web-dev-grid">
                    {webDevServices.map((service) => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WebDevServices;
