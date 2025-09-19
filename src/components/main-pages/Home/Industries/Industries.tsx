"use client";

import React from "react";

// ✅ Fixed import paths - using correct TBH structure
import AutoFlexSection from "@/components/sections/section-layouts/FullWidthSection/FullWidthSection";
import IndustryCard from "./IndustryCard";
import industriesData from "@/mock/industriesData";

// ✅ Import local CSS
import "./Industries.css";

const Industries: React.FC = () => {
    return (
        <AutoFlexSection
            title="Industries We Serve"
            description="Explore the diverse industries we serve, creating tailored solutions that drive growth, efficiency, and customer engagement."
            columns={4} // Four columns for desktop layout
            sectionId="industries"
            padding="var(--section-padding-major)"
        >
            {industriesData.map((industry, index) => (
                <IndustryCard
                    key={`industry-${index}-${industry.name}`} // ✅ Better key structure
                    title={industry.name}
                    description={industry.description}
                    icon={React.createElement(industry.icon)} // ✅ Dynamically render icon component
                />
            ))}
        </AutoFlexSection>
    );
};

export default Industries;