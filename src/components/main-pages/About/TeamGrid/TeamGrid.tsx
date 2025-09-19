"use client";

import React from "react";
import AutoFlexSection from "@/components/SectionTemplates/sections/AutoFlexSection";
import SectionDivider from "@/components/ui/layout/SectionDivider";
import GenericCard from "@/components/ui/cards/GenericCard";

// ✅ Interface for each team member
interface TeamMember {
  id: string;
  variant: "team";
  nameTeam: string;
  position: string;
  description: string;
  bio: string;
  image: string; 
}

// ✅ Interface for the whole team section props
interface TeamGridProps {
  data: {
    section: {
      title: string;
      description: string;
    }; 
    members: TeamMember[];
  };
  columns?: 1 | 2 | 3 | 4; // Optional, default to 3
}

const TeamGrid: React.FC<TeamGridProps> = ({
  data,
  columns = 3, // ✅ Default columns set to 3
}) => {
  const { section, members } = data;

  return (
    <>
      <AutoFlexSection
        title={section.title}
        description={section.description}
        columns={columns}
      >
        {members.map((member) => (
          <GenericCard
            key={member.id}
            image={member.image}
            nameTeam={member.nameTeam}
            position={member.position}
            description={member.description}
            bio={member.bio}
            buttonText="Read More"
            variant="team" 
          />
        ))}
      </AutoFlexSection>
      <SectionDivider />
    </>
  );
};

export default TeamGrid;
