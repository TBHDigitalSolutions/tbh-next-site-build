// src/components/core/navigation/Footer/DynamicFullWidthBox.tsx

"use client";

import React from "react";
import "./Footer.css";

interface DynamicFullWidthBoxProps {
    content: React.ReactNode;
    className?: string;
}

/**
 * TBH Digital Solutions Dynamic Full Width Box Component
 * Refactored to align with TBH Brand Guide standards
 * Features: Copyright info, legal links, and brand consistency
 */
const DynamicFullWidthBox: React.FC<DynamicFullWidthBoxProps> = ({ 
    content, 
    className = "" 
}) => {
    return (
        <div 
            className={`dynamic-fullwidth-box ${className}`}
            role="contentinfo"
            aria-label="Copyright and legal information"
        >
            {typeof content === 'string' ? (
                <p 
                    dangerouslySetInnerHTML={{ __html: content }}
                    aria-label="Copyright and legal links"
                />
            ) : (
                <div aria-label="Copyright and legal information">
                    {content}
                </div>
            )}
        </div>
    );
};

export default DynamicFullWidthBox;