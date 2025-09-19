"use client";

import React from "react";
import AutoFlexSection from "@/components/SectionTemplates/sections/AutoFlexSection";
import SectionDivider from "@/components/ui/layout/SectionDivider";
import CoreValueCard from "@/components/ui/about/CoreValues/CoreValueCard";

// ✅ Define TypeScript Interface for the Data Structure
interface CoreValue {
  title: string;
  description: string;
}

interface CoreValuesProps {
  data: CoreValue[]; // ✅ Expecting an array of core value objects
  sectionTitle?: string; // Optional override for title
  columns?: 1 | 2 | 3 | 4; // Optional columns layout
}

const CoreValues: React.FC<CoreValuesProps> = ({
  data,
  sectionTitle = "Our Core Values", // ✅ Default title if not provided
  columns = 3, // ✅ Default to 3 columns
}) => {
  return (
    <>
      <AutoFlexSection title={sectionTitle} columns={columns}>
        {data.map((value, index) => (
          <CoreValueCard
            key={index}
            title={value.title}
            description={value.description}
          />
        ))}
      </AutoFlexSection>
      <SectionDivider />
    </> 
  );
};

export default CoreValues;
