"use client";

import React from "react";
import ServiceCard from "@/components/ui/molecules/Card/ServiceCard";
import { services } from "@/mock/products-services/ServiceData";
import "./ContentCreation.css"; // ✅ Import CSS

const ContentCreation: React.FC = () => {
    const contentServices = services.filter((service) => service.id === "content");

    return (
        <section className="content-creation-section">
            <div className="content-creation-container">

                {/* Content Creation Services Grid */}
                <div className="content-creation-grid">
                    {contentServices.map((service, index) => (
                        <ServiceCard key={index} service={service} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ContentCreation;

