"use client";

import React from "react";
import "./TeamGrid.css";
import type { TeamMember, TeamSection } from "@/data/page/main-pages/about/types";

export type TeamGridProps = {
  /** Section header (title/description) */
  section: TeamSection;
  /** Team members to render */
  members: TeamMember[];
  /** Optional: pass-through class for external layout wrappers */
  className?: string;
  /** Optional: number of columns (if your CSS supports a --grid-columns var) */
  columns?: 1 | 2 | 3 | 4;
};

export default function TeamGrid({
  section,
  members,
  className,
  columns = 3,
}: TeamGridProps) {
  if (!section && (!members || members.length === 0)) return null;

  const gridStyle = {
    // If your CSS uses a custom property for responsive columns,
    // this will be picked up; otherwise it's a harmless no-op.
    ["--grid-columns" as any]: columns,
  } as React.CSSProperties;

  return (
    <section
      className={["team-grid", className].filter(Boolean).join(" ")}
      aria-labelledby="team-grid-title"
    >
      {/* ===== Header ===== */}
      {(section?.title || section?.description) && (
        <header className="team-grid-header">
          {section?.title && (
            <h2 id="team-grid-title" className="team-grid-title">
              {section.title}
            </h2>
          )}
          {section?.description && (
            <p className="team-grid-description">{section.description}</p>
          )}
        </header>
      )}

      {/* ===== Grid ===== */}
      <div className="team-grid-container" style={gridStyle} role="list">
        {members.map((m) => {
          const { id, name, role, bio, photo, links } = m;
          const imgAlt =
            photo ? `${name}${role ? ` — ${role}` : ""}` : `${name} portrait`;

          return (
            <article key={id} className="team-card" role="listitem">
              {/* Image */}
              <figure className="team-card-figure">
                <img
                  className="team-card-image"
                  src={photo || "/images/team/placeholder.jpg"}
                  alt={imgAlt}
                  loading="lazy"
                  width={320}
                  height={320}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    if (el.src.includes("placeholder")) return;
                    el.src = "/images/team/placeholder.jpg";
                    el.alt = `${name} portrait`;
                  }}
                />
                <figcaption className="sr-only">{name}</figcaption>
              </figure>

              {/* Body */}
              <div className="team-card-body">
                <h3 className="team-card-name">{name}</h3>
                {role && <p className="team-card-role">{role}</p>}
                {bio && <p className="team-card-bio">{bio}</p>}

                {/* Optional links (e.g., LinkedIn) */}
                {Array.isArray(links) && links.length > 0 && (
                  <div className="team-card-links">
                    {links.map((l) =>
                      l?.url && l?.label ? (
                        <a
                          key={`${id}-${l.label}`}
                          className="team-card-link"
                          href={l.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${name} — ${l.label}`}
                        >
                          {l.label}
                        </a>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
