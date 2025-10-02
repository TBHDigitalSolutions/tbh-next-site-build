// src/packages/sections/PackageDetailOverview/parts/SubSection/SubSection.tsx

"use client";

import * as React from "react";
import Divider from "@/components/ui/atoms/Divider/Divider";

type SubSectionProps = {
  id?: string;
  /** Visible heading above the block (e.g., "Purpose", "Pain Points") */
  title: string;
  /** Short line under the divider (e.g., “What good looks like”) */
  tagline?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  /** h3 by default inside a phase */
  as?: "h2" | "h3" | "h4";
  /** Optional data attribute for testing/analytics */
  "data-block"?: string;
};

export default function SubSection({
  id,
  title,
  tagline,
  className,
  style,
  children,
  as = "h3",
  "data-block": dataBlock,
}: SubSectionProps) {
  const Heading = as as keyof JSX.IntrinsicElements;
  const headingId = id ? `${id}__heading` : undefined;

  return (
    <section
      id={id}
      className={className}
      style={style}
      aria-labelledby={headingId}
      data-el="sub-section"
      data-block={dataBlock}
    >
      <div>
        <Heading id={headingId}>{title}</Heading>
        <Divider />
        {tagline ? <p>{tagline}</p> : null}
      </div>
      {children}
    </section>
  );
}