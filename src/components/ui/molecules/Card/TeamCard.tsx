"use client";

import React from "react";
import GenericCard from "@/components/ui/molecules/Card/GenericCard";

// ✅ Define TypeScript interface for team members
interface TeamMember {
    id: string;
    image: string;
    nameTeam: string;
    position: string;
    description: string;
    bio: string;
    variant?: string; // ✅ Optional variant (default to "team")
}

interface TeamCardProps {
    member: TeamMember;
}

const TeamCard: React.FC<TeamCardProps> = ({ member }) => {
    if (!member) return null; // ✅ Prevents rendering errors

    return (
        <GenericCard
            id={member.id}
            image={member.image || "/images/default-avatar.jpg"} // ✅ Fallback image
            nameTeam={member.nameTeam} // ✅ Properly mapped to `nameTeam`
            position={member.position} // ✅ Properly mapped to `position`
            description={member.description} // ✅ Properly mapped to `description`
            bio={member.bio} // ✅ Properly mapped to `bio`
            buttonText="Read More"
            variant={member.variant || "team"} // ✅ Default to "team" variant
        />
    );
};

export default TeamCard;
