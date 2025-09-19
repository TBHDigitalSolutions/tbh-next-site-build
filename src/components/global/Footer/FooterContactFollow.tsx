// src/components/core/navigation/Footer/FooterContactFollow.tsx

"use client";

import React from "react";
import "./Footer.css";
import {
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaYoutube,
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaInstagram,
} from "react-icons/fa";

// TBH IconMap for flexible dynamic rendering
const IconMap: { [key: string]: JSX.Element } = {
    FaFacebookF: <FaFacebookF />,
    FaTwitter: <FaTwitter />,
    FaLinkedinIn: <FaLinkedinIn />,
    FaYoutube: <FaYoutube />,
    FaInstagram: <FaInstagram />,
    FaMapMarkerAlt: <FaMapMarkerAlt />,
    FaPhone: <FaPhone />,
    FaEnvelope: <FaEnvelope />,
};

interface ContactInfoItem {
    icon: string;
    label: string;
    href?: string; // mailto:, tel:, https:// links
}

interface SocialLinkItem {
    icon: string;
    link: string;
}

interface FooterContactFollowProps {
    contactInfo: ContactInfoItem[];
    socialLinks: SocialLinkItem[];
    className?: string;
}

/**
 * TBH Digital Solutions Footer Contact & Follow Component
 * Refactored to align with TBH Brand Guide standards
 * Features: Proper contact info, social links, and accessibility
 */
const FooterContactFollow: React.FC<FooterContactFollowProps> = ({
    contactInfo = [],
    socialLinks = [],
    className = "",
}) => {
    // Handle social link clicks with error handling
    const handleSocialClick = (link: string, platform: string) => {
        try {
            window.open(link, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error(`Failed to open ${platform} link:`, error);
        }
    };

    // Get platform name from icon string
    const getPlatformName = (icon: string): string => {
        const platformMap: { [key: string]: string } = {
            FaFacebookF: 'Facebook',
            FaTwitter: 'Twitter', 
            FaLinkedinIn: 'LinkedIn',
            FaYoutube: 'YouTube',
            FaInstagram: 'Instagram',
        };
        return platformMap[icon] || 'Social Media';
    };

    return (
        <div 
            className={`footer-contact-follow ${className}`}
            role="region"
            aria-labelledby="footer-contact-title"
        >
            {/* Contact Information Section */}
            <h3 
                id="footer-contact-title"
                className="footer-title"
            >
                Contact Us
            </h3>
            
            {/* Semantic Address Element */}
            <address 
                className="footer-contact-address" 
                aria-label="Company contact details"
            >
                <ul 
                    className="footer-contact-list" 
                    role="list"
                    aria-label="Contact information"
                >
                    {contactInfo.map((item, index) => (
                        <li 
                            key={`contact-${index}`} 
                            className="footer-contact-item"
                            role="listitem"
                        >
                            {/* TBH Brand Contact Icon */}
                            <span 
                                className="footer-contact-icon" 
                                aria-hidden="true"
                            >
                                {IconMap[item.icon]}
                            </span>

                            {/* Contact Link or Text */}
                            {item.href ? (
                                <a 
                                    href={item.href} 
                                    className="footer-contact-text"
                                    aria-label={`Contact us: ${item.label}`}
                                >
                                    {item.label}
                                </a>
                            ) : (
                                <span className="footer-contact-text">
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ul>
            </address>

            {/* Social Media Section */}
            <h4 
                id="footer-social-title"
                className="footer-subtitle"
            >
                Follow Us
            </h4>
            
            <div 
                className="footer-social-icons"
                role="list"
                aria-labelledby="footer-social-title"
            >
                {socialLinks.map((item, index) => (
                    <a
                        key={`social-${index}`}
                        href={item.link}
                        className="footer-social-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        role="listitem"
                        aria-label={`Follow us on ${getPlatformName(item.icon)}`}
                        onClick={(e) => {
                            e.preventDefault();
                            handleSocialClick(item.link, getPlatformName(item.icon));
                        }}
                    >
                        {IconMap[item.icon]}
                    </a>
                ))}
            </div>
        </div>
    );
};

export default FooterContactFollow;