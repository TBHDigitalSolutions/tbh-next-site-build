// src/components/core/navigation/Footer/FooterColumn.tsx

"use client";

import React from "react";
import "./Footer.css";
import {
    FaQuestionCircle,
    FaLifeRing,
    FaEnvelope,
    FaShieldAlt,
    FaCog,
    FaMap,
    FaFileContract,
    FaInfoCircle,
    FaTools,
    FaSitemap,
} from "react-icons/fa";

// TBH Icon mapping for string-based icon references
const IconMap: { [key: string]: JSX.Element } = {
    FaQuestionCircle: <FaQuestionCircle />,
    FaLifeRing: <FaLifeRing />,
    FaEnvelope: <FaEnvelope />,
    FaShieldAlt: <FaShieldAlt />,
    FaCog: <FaCog />,
    FaMap: <FaMap />,
    FaFileContract: <FaFileContract />,
    FaInfoCircle: <FaInfoCircle />,
    FaTools: <FaTools />,
    FaSitemap: <FaSitemap />,
};

interface ColumnItem {
    label: string;
    link?: string;
    icon?: string;
}

interface FooterColumnProps {
    title: string;
    content: ColumnItem[];
    className?: string;
}

/**
 * TBH Digital Solutions Footer Column Component
 * Refactored to align with TBH Brand Guide standards
 * Features: Proper typography, spacing, and hover effects
 */
const FooterColumn: React.FC<FooterColumnProps> = ({ 
    title, 
    content = [], 
    className = "" 
}) => {
    // Generate clean ID for accessibility
    const titleId = `footer-${title.toLowerCase().replace(/\s+/g, '-')}-title`;

    return (
        <div
            className={`footer-column ${className}`}
            role="region"
            aria-labelledby={titleId}
        >
            {/* TBH Brand-aligned Title */}
            <h3 
                id={titleId} 
                className="footer-column__title"
            >
                {title}
            </h3>

            {/* Semantic Navigation Wrapper */}
            <nav aria-labelledby={titleId}>
                <ul 
                    className="footer-column__list" 
                    role="list"
                >
                    {content.map((item, index) => (
                        <li 
                            key={`${title}-item-${index}`} 
                            className="footer-column__item" 
                            role="listitem"
                        >
                            {/* TBH Brand Icon */}
                            {item.icon && IconMap[item.icon] && (
                                <span 
                                    className="footer-column__icon" 
                                    aria-hidden="true"
                                >
                                    {IconMap[item.icon]}
                                </span>
                            )}

                            {/* Link or Text Content */}
                            {item.link ? (
                                <a
                                    href={item.link}
                                    className="footer-column__link"
                                    target={item.link.startsWith("http") ? "_blank" : "_self"}
                                    rel={item.link.startsWith("http") ? "noopener noreferrer" : undefined}
                                    aria-label={`${item.label} - ${title} section`}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <span className="footer-column__text">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default FooterColumn;