"use client";

import React from "react";
import "./CapabilitiesGrid.css";

/** Optional skill metadata (supported but not required) */
export type CapabilitySkill = {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
};

/** Minimal capability shape (page supplies this) */
export type Capability = {
  id: string;
  title: string;
  description?: string;
  icon?: string; // emoji or icon token

  // Back-compat / optional enrichments:
  skills?: CapabilitySkill[];
  proficiency?: number; // 0–100
  proficiencyLabel?: string;
};

export type CapabilitiesGridProps = {
  title?: string;
  subtitle?: string;
  items: Capability[];
  className?: string;

  /** Optional UI toggles (default true if data present) */
  showProficiency?: boolean;
  showSkills?: boolean;

  /** Responsive column count hint (CSS grid var) */
  columns?: 2 | 3 | 4;
};

export default function CapabilitiesGrid({
  title = "Our Core Capabilities",
  subtitle,
  items,
  className = "",
  showProficiency,
  showSkills,
  columns = 3,
}: CapabilitiesGridProps) {
  // Respect provided flags; default to showing only when the data exists
  const shouldShowSkills = (c: Capability) =>
    (showSkills ?? true) && Array.isArray(c.skills) && c.skills.length > 0;

  const shouldShowProficiency = (c: Capability) =>
    (showProficiency ?? true) &&
    typeof c.proficiency === "number" &&
    c.proficiency >= 0 &&
    c.proficiency <= 100;

  // Pass column count to CSS through a custom property the existing CSS can use
  const gridStyle = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ["--grid-columns" as any]: columns,
  } as React.CSSProperties;

  return (
    <section className={`capabilities-grid ${className}`.trim()}>
      {/* Header */}
      <div className="capabilities-grid-header">
        {title && <h2 className="capabilities-grid-title">{title}</h2>}
        {subtitle && <p className="capabilities-grid-subtitle">{subtitle}</p>}
      </div>

      {/* Grid */}
      <div className="capabilities-grid-container" style={gridStyle}>
        {items.map((cap) => (
          <div key={cap.id} className="capability-item">
            {cap.icon && (
              <div
                className="capability-icon"
                role="img"
                aria-label={cap.title}
              >
                {cap.icon}
              </div>
            )}

            <h3 className="capability-title">{cap.title}</h3>

            {cap.description && (
              <p className="capability-description">{cap.description}</p>
            )}

            {/* Optional skills list (keeps original class names) */}
            {shouldShowSkills(cap) && (
              <div className="capability-skills">
                <div className="capability-skills-title">Key Skills</div>
                <div className="capability-skills-list">
                  {cap.skills!.map((skill, idx) => (
                    <span
                      key={`${cap.id}-skill-${idx}`}
                      className="capability-skill-tag"
                      title={
                        skill.level
                          ? `${skill.name} - ${skill.level}`
                          : skill.name
                      }
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Optional proficiency meter (keeps original class names) */}
            {shouldShowProficiency(cap) && (
              <div className="capability-proficiency">
                <div className="capability-proficiency-label">
                  <span>Proficiency</span>
                  <span>
                    {cap.proficiencyLabel ?? `${Math.round(cap.proficiency!)}%`}
                  </span>
                </div>
                <div className="capability-proficiency-bar">
                  <div
                    className="capability-proficiency-fill"
                    style={{ width: `${cap.proficiency}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
