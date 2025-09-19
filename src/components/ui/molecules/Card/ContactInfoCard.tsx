"use client";

import React from "react";
import "./ContactInfoCard.css";
 
interface ContactInfoCardProps {
    title: string;
    description: string;
    details: string;
    link: string;
    icon: React.ReactNode;
}

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({
    title,
    description,
    details,
    link,
    icon,
}) => {
    return (
        <div className="contact-info-card">
            {/* ✅ Icon Section */}
            <div className="contact-info-box1">
                <div className="contact-info-icon">{icon}</div>
            </div>

            {/* ✅ Content Section */}
            <div className="contact-info-box2">
                <h3 className="contact-info-title">{title}</h3>

                {/* ✅ Divider under title */}
                <div className="contact-info-card-divider"></div>

                <p className="contact-info-description">{description}</p>
                <a
                    href={link}
                    className="contact-info-details"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {details}
                </a>
            </div>
        </div>
    );
};

export default ContactInfoCard;
