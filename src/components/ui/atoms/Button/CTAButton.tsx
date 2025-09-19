// shared-ui/components/buttons/CTAButton.tsx

"use client";

import React from "react";
import Link from "next/link";
import "./CTAButton.css";

interface CTAButtonProps {
    text: string;
    onClick?: () => void;
    href?: string;
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
    className?: string;
    icon?: React.ReactNode;
}

const CTAButton: React.FC<CTAButtonProps> = ({ 
    text, 
    onClick, 
    href, 
    variant = "primary", 
    size = "md", 
    className = "",
    icon
}) => {
    const classes = `cta-button ${variant} ${size} ${className}`;

    if (href) {
        // Check if it's an external link
        if (href.startsWith('http') || href.startsWith('//')) {
            return (
                <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
                    {icon && <span className="cta-button-icon">{icon}</span>}
                    {text}
                </a>
            );
        }
        
        // Internal link using Next.js Link
        return (
            <Link href={href} className={classes}>
                {icon && <span className="cta-button-icon">{icon}</span>}
                {text}
            </Link>
        );
    }

    return (
        <button className={classes} onClick={onClick}>
            {icon && <span className="cta-button-icon">{icon}</span>}
            {text}
        </button>
    );
};

export default CTAButton;