// src/packages/sections/PackageDetailOverview/parts/PhaseSectionHeader/PhaseSectionHeader.tsx
"use client";

import * as React from "react";
import Divider from "@/components/ui/atoms/Divider/Divider";

type PhaseSectionHeaderProps = {
  id?: string;
  title: string;
  tagline?: string;
  className?: string;
  style?: React.CSSProperties;
  /** h2 by default; phases are top-level within the overview card */
  as?: "h2" | "h1" | "h3";
};

export default function PhaseSectionHeader({
  id,
  title,
  tagline,
  className,
  style,
  as = "h2",
}: PhaseSectionHeaderProps) {
  const Heading = as as keyof JSX.IntrinsicElements;
  return (
    <header id={id} className={className} style={style} data-el="phase-header">
      <Heading>{title}</Heading>
      <Divider />
      {tagline ? <p>{tagline}</p> : null}
    </header>
  );
}