"use client";

import React from "react";
import "./AutoGridSection.css";

interface AutoGridSectionProps {
    title?: string;
    description?: string;
    children: React.ReactNode[];
    padding?: string;
    columns?: number;
    gap?: string;
}

const AutoGridSection: React.FC<AutoGridSectionProps> = ({
    title,
    description,
    children,
    padding = "var(--spacing-lg)",
    columns = 3,
    gap = "var(--spacing-md)",
}) => {
    return (
        <section className="auto-grid-section" style={{ padding }}>
            {/* ✅ Section Header */}
            {(title || description) && (
                <div className="auto-grid-section__header">
                    {title && <h2 className="auto-grid-section__title">{title}</h2>}
                    <div className="auto-grid-section__underline"></div>
                    {description && <p className="auto-grid-section__description">{description}</p>}
                </div>
            )}

            {/* ✅ Grid Container */}
            <div className="auto-grid-section__container">
                {children.map((child, index) => (
                    <div key={index} className="auto-grid-section__item">
                        {child}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AutoGridSection;
