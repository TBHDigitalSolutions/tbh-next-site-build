"use client";

import React from "react";

// ✅ Fixed import paths - using correct TBH structure
import AutoFlexSection from "@/components/sections/section-layouts/AutoFlexSection/AutoFlexSection";
import ServiceCard from "./ServiceCard";
 
// ✅ Import Services data from correct mock location
import serviceData from "@/mock/ServiceCardData";

// ✅ Import local CSS
import "./Services.css";

const Services: React.FC = () => {
    return (
        <AutoFlexSection
            title={serviceData.sectionTitle}
            description={serviceData.sectionDescription}
            columns={3} // ✅ Three columns layout for desktop
            sectionId="services"
            padding="var(--section-padding-major)"
        >
            {serviceData.services.map((service, index) => (
                <ServiceCard
                    key={`service-${index}-${service.title}`} // ✅ Better key structure
                    title={service.title}
                    description={service.description}
                    highlights={service.highlights}
                />
            ))}
        </AutoFlexSection>
    );
};

export default Services;