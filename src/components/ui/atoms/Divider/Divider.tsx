"use client";

import React from "react";
import clsx from "clsx";
import "./Divider.css";

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className = "" }) => {
  return <div className={clsx("section-divider", className)} />;
};

export default Divider;
