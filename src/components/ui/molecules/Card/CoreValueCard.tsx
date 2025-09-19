"use client";

import React from "react";
// ✅ Corrected import path for shared‑ui Divider
import Divider from "@/components/core/layout/Divider/Divider";
import "./CoreValueCard.css";

interface CoreValueCardProps {
  title: string;
  description: string;
}

const CoreValueCard: React.FC<CoreValueCardProps> = ({ title, description }) => {
  return (
    <div className="corevalue-card-wrapper">
      <h3 className="corevalue-card-title">{title}</h3>

      {/* ✅ Divider under title */}
      <Divider className="corevalue-card-divider" />

      <p className="corevalue-card-description">{description}</p>
    </div>
  );
};

export default CoreValueCard;
